import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import * as usuarioRepository from "../repositories/usuarioRepository";
import * as sessaoRepository from "../repositories/sessaoRepository";
import * as redefinicaoSenhaRepository from "../repositories/redefinicaoSenhaRepository";

import { UsuarioService } from "./usuarioService";
import { NotificacaoService } from "./notificacaoService";

import {
  calcularBloqueioMinutos,
  gerarCodigoNumerico,
  gerarTokenOpaco,
  hashToken
} from "../utils/seguranca";

/*
==================================================
AUTH SERVICE
==================================================

Responsabilidades:

- Validar credenciais de login
- Bloquear a conta após falhas seguidas de login
- Abrir, renovar (refresh token rotativo) e revogar sessões
- Emitir e verificar tokens JWT de acesso (curtos)
- Recuperação de senha (token de uso único)

NÃO é responsável por:

- Requisições HTTP
- Cookies
- Cadastro de usuários

Dependências:

- usuarioRepository, sessaoRepository, redefinicaoSenhaRepository
- bcryptjs
- jsonwebtoken
*/

/*
Em produção o JWT_SECRET DEVE vir do .env.
Sem ele, o sistema não sobe — não faz sentido
assinar token de sessão com um segredo previsível.
*/
const JWT_SECRET =
  process.env.JWT_SECRET;

/*
Token de acesso curto: se for roubado, vale por poucos
minutos. A continuidade da sessão vem do refresh token,
que é rotativo e revogável no servidor.
*/
const JWT_EXPIRA_EM = "15m";

const DIAS_VALIDADE_SESSAO = 30;

/*
Janela em que o reuso de um refresh token recém-rotacionado
é tratado como corrida entre abas/requisições (e não como
roubo): nesse caso só se recusa a renovação, sem revogar.
*/
const SEGUNDOS_TOLERANCIA_REFRESH = 10;

/* Link de redefinição de senha válido por 30 minutos. */
const MINUTOS_VALIDADE_REDEFINICAO = 30;

/* Intervalo mínimo entre dois pedidos de redefinição da mesma conta. */
const SEGUNDOS_ENTRE_PEDIDOS_REDEFINICAO = 60;

/* Código de verificação válido por 15 minutos. */
const MINUTOS_VALIDADE_CODIGO = 15;

export interface TokenPayload {
  usuarioId: number;
  perfil: string;
  /* id da sessão no servidor (tabela sessoes) */
  sid: string;
}

export interface ContextoRequisicao {
  ip: string | null;
  userAgent: string | null;
}

/* Data do SQLite (CURRENT_TIMESTAMP) vem como "AAAA-MM-DD HH:MM:SS" em UTC. */
function lerDataSqlite(valor: string): number {
  return new Date(
    valor.includes("T") ? valor : valor.replace(" ", "T") + "Z"
  ).getTime();
}

export class ContaBloqueadaError extends Error {
  minutos: number;
  constructor(minutos: number) {
    super(
      `Muitas tentativas de login. Tente novamente em ${minutos} minuto(s).`
    );
    this.name = "ContaBloqueadaError";
    this.minutos = minutos;
  }
}

export class SessaoInvalidaError extends Error {
  constructor() {
    super("Sessão inválida ou expirada.");
    this.name = "SessaoInvalidaError";
  }
}

/* Renovação simultânea (duas abas): o cliente deve repetir a requisição. */
export class RefreshConcorrenteError extends Error {
  constructor() {
    super("Renovação de sessão em andamento.");
    this.name = "RefreshConcorrenteError";
  }
}

/*
Erro usado para sinalizar, de forma reconhecível pelo
controller, que a senha confere mas o e-mail ainda não
foi confirmado (o controller devolve um corpo diferente
nesse caso, para o frontend saber pra onde redirecionar).
*/
export class EmailNaoVerificadoError extends Error {
  constructor() {
    super("E-mail ainda não confirmado.");
    this.name = "EmailNaoVerificadoError";
  }
}

export class AuthService {

  /*
  ==================================================
  GERAR CÓDIGO DE VERIFICAÇÃO
  ==================================================

  Código numérico de 6 dígitos, válido por
  MINUTOS_VALIDADE_CODIGO minutos.
  */
  static gerarCodigoVerificacao(): {
    codigo: string;
    expiraEm: string;
  } {

    const codigo = gerarCodigoNumerico();

    const expiraEm = new Date(
      Date.now() + MINUTOS_VALIDADE_CODIGO * 60 * 1000
    ).toISOString();

    return { codigo, expiraEm };

  }

  /*
  ==================================================
  CONFIRMAR E-MAIL
  ==================================================

  Confere o código informado contra o que está salvo
  para aquele e-mail e, se válido e dentro da validade,
  marca o e-mail como verificado e já devolve uma sessão
  (token + usuário), poupando um segundo login manual.
  */
  static async confirmarEmail(
    email: string,
    codigo: string,
    contexto: ContextoRequisicao
  ) {

    if (!email?.trim() || !codigo?.trim()) {
      throw new Error(
        "E-mail e código são obrigatórios."
      );
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorEmail(
        email
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    if (usuario.email_verificado) {
      throw new Error(
        "Este e-mail já foi confirmado."
      );
    }

    if (!usuario.codigo_verificacao) {
      throw new Error(
        "Nenhum código pendente — solicite o reenvio."
      );
    }

    const expirado =
      !usuario.codigo_verificacao_expira ||
      new Date(usuario.codigo_verificacao_expira).getTime() < Date.now();

    if (expirado) {
      throw new Error(
        "Código expirado — solicite o reenvio."
      );
    }

    if (
      String(codigo).trim() !==
      String(usuario.codigo_verificacao).trim()
    ) {
      throw new Error(
        "Código incorreto."
      );
    }

    await usuarioRepository.confirmarEmailUsuario(
      usuario.id
    );

    const { token, refreshToken } =
      await this.abrirSessao(
        usuario,
        contexto
      );

    return {
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    };

  }

  /*
  ==================================================
  REENVIAR CÓDIGO DE VERIFICAÇÃO
  ==================================================
  */
  static async gerarNovoCodigoParaReenvio(
    email: string
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorEmail(
        email
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    if (usuario.email_verificado) {
      throw new Error(
        "Este e-mail já foi confirmado."
      );
    }

    const { codigo, expiraEm } =
      this.gerarCodigoVerificacao();

    await usuarioRepository.definirCodigoVerificacao(
      usuario.id,
      codigo,
      expiraEm
    );

    return {
      nome: usuario.nome,
      codigo
    };

  }

  /*
  ==================================================
  LOGIN
  ==================================================

  Confere e-mail e senha (via bcrypt.compare,
  nunca comparando texto puro) e devolve um
  token JWT válido por 8 horas.
  */
  static async login(
    email: string,
    senha: string,
    contexto: ContextoRequisicao
  ) {

    if (!email?.trim() || !senha?.trim()) {
      throw new Error(
        "E-mail e senha são obrigatórios."
      );
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorEmail(
        email
      );

    /*
    Mensagem genérica de propósito: não revelar
    se o e-mail existe ou não (evita enumeração
    de usuários cadastrados).
    */
    const credenciaisInvalidas =
      "E-mail ou senha inválidos.";

    if (!usuario) {
      throw new Error(
        credenciaisInvalidas
      );
    }

    if (usuario.ativo === 0) {
      throw new Error(
        "Usuário desativado. Procure o administrador."
      );
    }

    /*
    Bloqueio progressivo por conta (além do limite por IP):
    protege contra ataque distribuído em muitos IPs.
    */
    if (
      usuario.bloqueado_ate &&
      new Date(usuario.bloqueado_ate).getTime() > Date.now()
    ) {

      const minutos = Math.max(
        1,
        Math.ceil(
          (
            new Date(usuario.bloqueado_ate).getTime() -
            Date.now()
          ) / 60000
        )
      );

      throw new ContaBloqueadaError(minutos);

    }

    const senhaConfere =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaConfere) {

      const falhas =
        (usuario.tentativas_falhas ?? 0) + 1;

      const minutosBloqueio =
        calcularBloqueioMinutos(falhas);

      await usuarioRepository.registrarFalhaDeLogin(
        usuario.id,
        falhas,
        minutosBloqueio > 0
          ? new Date(
              Date.now() + minutosBloqueio * 60000
            ).toISOString()
          : null
      );

      throw new Error(
        credenciaisInvalidas
      );

    }

    if (usuario.tentativas_falhas) {
      await usuarioRepository.zerarFalhasDeLogin(
        usuario.id
      );
    }

    /*
    Só revela a pendência de verificação depois de
    confirmar a senha (evita que alguém sem a senha
    descubra se aquele e-mail já está verificado ou não).
    */
    if (!usuario.email_verificado) {
      throw new EmailNaoVerificadoError();
    }

    const { token, refreshToken } =
      await this.abrirSessao(
        usuario,
        contexto
      );

    return {
      token,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    };

  }

  /*
  ==================================================
  ABRIR SESSÃO
  ==================================================

  Cria a linha em "sessoes" (guardando só o hash do
  refresh token) e emite o token de acesso curto.
  */
  private static async abrirSessao(
    usuario: any,
    contexto: ContextoRequisicao
  ) {

    const sessaoId = crypto.randomUUID();
    const refreshToken = gerarTokenOpaco();

    await sessaoRepository.criarSessao({
      id: sessaoId,
      usuarioId: usuario.id,
      refreshHash: hashToken(refreshToken),
      userAgent: contexto.userAgent,
      ip: contexto.ip,
      expiraEm: new Date(
        Date.now() +
        DIAS_VALIDADE_SESSAO * 24 * 60 * 60 * 1000
      ).toISOString()
    });

    const token = this.gerarToken({
      usuarioId: usuario.id,
      perfil: usuario.perfil,
      sid: sessaoId
    });

    return { token, refreshToken };

  }

  /*
  ==================================================
  RENOVAR SESSÃO (REFRESH TOKEN ROTATIVO)
  ==================================================

  Cada renovação invalida o refresh token usado e emite
  outro. Se um refresh token JÁ usado reaparece, alguém
  o copiou: a sessão inteira é revogada.
  */
  static async renovarSessao(
    refreshToken: string | undefined
  ) {

    if (!refreshToken) {
      throw new SessaoInvalidaError();
    }

    const hash = hashToken(refreshToken);

    const sessao =
      await sessaoRepository.buscarPorRefreshHash(
        hash
      );

    if (!sessao) {

      const antiga =
        await sessaoRepository.buscarPorRefreshHashAnterior(
          hash
        );

      if (antiga && !antiga.revogada_em) {

        const rotacionadoEm =
          antiga.rotacionado_em
            ? lerDataSqlite(antiga.rotacionado_em)
            : 0;

        if (
          Date.now() - rotacionadoEm <
          SEGUNDOS_TOLERANCIA_REFRESH * 1000
        ) {
          throw new RefreshConcorrenteError();
        }

        await sessaoRepository.revogarSessao(
          antiga.id
        );

        console.warn(
          `[Auth] Reuso de refresh token detectado. Sessão ${antiga.id} revogada.`
        );

      }

      throw new SessaoInvalidaError();

    }

    if (
      sessao.revogada_em ||
      new Date(sessao.expira_em).getTime() <= Date.now()
    ) {
      throw new SessaoInvalidaError();
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        sessao.usuario_id
      );

    if (!usuario || usuario.ativo === 0) {

      await sessaoRepository.revogarSessao(
        sessao.id
      );

      throw new SessaoInvalidaError();

    }

    const novoRefresh = gerarTokenOpaco();

    const rotacionou =
      await sessaoRepository.rotacionarRefresh(
        sessao.id,
        hash,
        hashToken(novoRefresh),
        new Date(
          Date.now() +
          DIAS_VALIDADE_SESSAO * 24 * 60 * 60 * 1000
        ).toISOString()
      );

    if (!rotacionou) {
      throw new RefreshConcorrenteError();
    }

    return {
      token: this.gerarToken({
        usuarioId: usuario.id,
        perfil: usuario.perfil,
        sid: sessao.id
      }),
      refreshToken: novoRefresh
    };

  }

  /*
  ==================================================
  SESSÃO ATIVA?
  ==================================================

  Usado pelo authMiddleware a cada requisição: é isso que
  torna o logout (e "sair de todos") efetivo na hora.
  */
  static async sessaoEstaAtiva(
    sessaoId: string,
    usuarioId: number
  ): Promise<boolean> {

    const sessao =
      await sessaoRepository.buscarSessaoPorId(
        sessaoId
      );

    return !!sessao &&
      sessao.usuario_id === usuarioId &&
      !sessao.revogada_em &&
      new Date(sessao.expira_em).getTime() > Date.now();

  }

  /*
  ==================================================
  ENCERRAR SESSÃO (LOGOUT)
  ==================================================

  Aceita o refresh token e/ou o token de acesso (mesmo
  expirado), para o logout funcionar em qualquer estado.
  */
  static async encerrarSessao(
    refreshToken?: string,
    tokenAcesso?: string
  ) {

    if (refreshToken) {

      const sessao =
        await sessaoRepository.buscarPorRefreshHash(
          hashToken(refreshToken)
        );

      if (sessao) {
        await sessaoRepository.revogarSessao(
          sessao.id
        );
      }

    }

    if (tokenAcesso && JWT_SECRET) {

      try {

        const payload = jwt.verify(
          tokenAcesso,
          JWT_SECRET,
          { ignoreExpiration: true }
        ) as TokenPayload;

        if (payload.sid) {
          await sessaoRepository.revogarSessao(
            payload.sid,
            payload.usuarioId
          );
        }

      } catch {
        /* token inválido: nada a revogar */
      }

    }

  }

  /*
  ==================================================
  LISTAR / ENCERRAR SESSÕES DO USUÁRIO
  ==================================================
  */
  static async listarSessoes(
    usuarioId: number,
    sessaoAtualId: string
  ) {

    const sessoes =
      await sessaoRepository.listarSessoesAtivas(
        usuarioId
      );

    return sessoes.map((sessao: any) => ({
      id: sessao.id,
      userAgent: sessao.user_agent,
      ip: sessao.ip,
      criadoEm: sessao.criado_em,
      ultimoUso: sessao.ultimo_uso,
      atual: sessao.id === sessaoAtualId
    }));

  }

  static async encerrarSessaoDoUsuario(
    usuarioId: number,
    sessaoId: string
  ) {

    const alteradas =
      await sessaoRepository.revogarSessao(
        sessaoId,
        usuarioId
      );

    if (alteradas === 0) {
      throw new Error("Sessão não encontrada.");
    }

  }

  static async encerrarTodasAsSessoes(
    usuarioId: number,
    manterSessaoId?: string
  ) {

    await sessaoRepository.revogarSessoesDoUsuario(
      usuarioId,
      manterSessaoId
    );

  }

  /*
  ==================================================
  RECUPERAÇÃO DE SENHA — PEDIDO
  ==================================================

  Resposta sempre igual, exista a conta ou não (não
  revela quais e-mails estão cadastrados). O e-mail é
  enviado em segundo plano, para o tempo de resposta
  também não denunciar a existência da conta.
  */
  static async solicitarRedefinicaoSenha(
    email: string
  ) {

    if (!email?.trim()) {
      throw new Error("E-mail é obrigatório.");
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorEmail(
        email.trim()
      );

    if (
      !usuario ||
      usuario.ativo === 0 ||
      !usuario.email_verificado
    ) {
      return;
    }

    const ultimo =
      await redefinicaoSenhaRepository.buscarUltimoPedidoDoUsuario(
        usuario.id
      );

    if (
      ultimo &&
      Date.now() - lerDataSqlite(ultimo.criado_em) <
        SEGUNDOS_ENTRE_PEDIDOS_REDEFINICAO * 1000
    ) {
      return;
    }

    const token = gerarTokenOpaco();

    await redefinicaoSenhaRepository.criarToken(
      usuario.id,
      hashToken(token),
      new Date(
        Date.now() +
        MINUTOS_VALIDADE_REDEFINICAO * 60 * 1000
      ).toISOString()
    );

    const base =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    NotificacaoService.notificarRedefinicaoSenha(
      usuario.email,
      usuario.nome,
      `${base}/redefinir-senha?token=${token}`
    );

  }

  /*
  ==================================================
  RECUPERAÇÃO DE SENHA — CONCLUSÃO
  ==================================================

  Token de uso único. Ao trocar a senha, todas as sessões
  do usuário são revogadas (UsuarioService.atualizarSenha)
  e o bloqueio por tentativas é zerado.
  */
  static async redefinirSenha(
    token: string,
    novaSenha: string
  ) {

    const linkInvalido =
      "Link inválido ou expirado. Solicite um novo.";

    if (!token?.trim()) {
      throw new Error(linkInvalido);
    }

    const registro =
      await redefinicaoSenhaRepository.buscarPorHash(
        hashToken(token.trim())
      );

    if (
      !registro ||
      registro.usado_em ||
      new Date(registro.expira_em).getTime() <= Date.now()
    ) {
      throw new Error(linkInvalido);
    }

    /* Valida a senha ANTES de consumir o token. */
    UsuarioService.validarSenha(novaSenha);

    const consumido =
      await redefinicaoSenhaRepository.marcarComoUsado(
        registro.id
      );

    if (!consumido) {
      throw new Error(linkInvalido);
    }

    await UsuarioService.atualizarSenha(
      registro.usuario_id,
      novaSenha
    );

    await usuarioRepository.zerarFalhasDeLogin(
      registro.usuario_id
    );

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        registro.usuario_id
      );

    if (usuario) {
      NotificacaoService.notificarSenhaAlterada(
        usuario.email,
        usuario.nome
      );
    }

  }

  /*
  ==================================================
  GERAR TOKEN
  ==================================================
  */
  static gerarToken(
    payload: TokenPayload
  ): string {

    if (!JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não configurado no servidor."
      );
    }

    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRA_EM
      }
    );

  }

  /*
  ==================================================
  VERIFICAR TOKEN
  ==================================================
  */
  static verificarToken(
    token: string
  ): TokenPayload {

    if (!JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não configurado no servidor."
      );
    }

    const payload = jwt.verify(
      token,
      JWT_SECRET
    ) as TokenPayload;

    /*
    Tokens antigos (sem "sid") não têm sessão no servidor
    e por isso não são mais aceitos.
    */
    if (!payload.sid) {
      throw new SessaoInvalidaError();
    }

    return payload;

  }

}
