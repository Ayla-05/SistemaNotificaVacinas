import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import * as usuarioRepository from "../repositories/usuarioRepository";

/*
==================================================
AUTH SERVICE
==================================================

Responsabilidades:

- Validar credenciais de login
- Emitir e verificar tokens JWT

NÃO é responsável por:

- Requisições HTTP
- Cookies
- Cadastro de usuários

Dependências:

- usuarioRepository
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

const JWT_EXPIRA_EM = "8h";

/* Código de verificação válido por 15 minutos. */
const MINUTOS_VALIDADE_CODIGO = 15;

export interface TokenPayload {
  usuarioId: number;
  perfil: string;
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

    const codigo = String(
      Math.floor(100000 + Math.random() * 900000)
    );

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
    codigo: string
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

    const token =
      this.gerarToken({
        usuarioId: usuario.id,
        perfil: usuario.perfil
      });

    return {
      token,
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
    senha: string
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

    const senhaConfere =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaConfere) {
      throw new Error(
        credenciaisInvalidas
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

    const token =
      this.gerarToken({
        usuarioId: usuario.id,
        perfil: usuario.perfil
      });

    return {
      token,
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

    return jwt.verify(
      token,
      JWT_SECRET
    ) as TokenPayload;

  }

}
