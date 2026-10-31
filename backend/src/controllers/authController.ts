import { Request, Response } from "express";

import {
  AuthService,
  EmailNaoVerificadoError,
  ContaBloqueadaError,
  RefreshConcorrenteError,
  ContextoRequisicao
} from "../services/authService";
import { UsuarioService } from "../services/usuarioService";
import { PessoaService } from "../services/pessoaService";
import { NotificacaoService } from "../services/notificacaoService";
import { PerfilUsuario } from "../enums/perfilUsuario";
import * as usuarioRepository from "../repositories/usuarioRepository";
import * as pessoaRepository from "../repositories/pessoaRepository";

/*
==================================================
AUTH CONTROLLER
==================================================

Responsabilidades:

- Receber requisições de login/logout
- Definir e limpar o cookie de sessão
- Retornar o usuário autenticado atual

NÃO é responsável por:

- Validar credenciais (AuthService)
- SQL

Dependências:

- AuthService
- usuarioRepository
*/

/*
O cookie do token nunca é acessível via JavaScript
no navegador (httpOnly), só trafega em HTTPS fora
de desenvolvimento (secure) e não é enviado em
requisições de terceiros (sameSite).
*/
const QUINZE_MINUTOS_EM_MS =
  15 * 60 * 1000;

const TRINTA_DIAS_EM_MS =
  30 * 24 * 60 * 60 * 1000;

/*
Dois cookies, ambos httpOnly:

- "token": acesso, curto (15 min), enviado em toda rota.
- "refresh_token": opaco e rotativo, só enviado para
  /auth (renovar ou encerrar a sessão), nunca para as
  demais rotas da API.
*/
const OPCOES_COOKIE_BASE = {
  httpOnly: true,
  secure:
    process.env.NODE_ENV === "production",
  sameSite: "lax" as const
};

function configurarCookies(
  res: Response,
  token: string,
  refreshToken: string
) {

  res.cookie(
    "token",
    token,
    {
      ...OPCOES_COOKIE_BASE,
      maxAge: QUINZE_MINUTOS_EM_MS
    }
  );

  res.cookie(
    "refresh_token",
    refreshToken,
    {
      ...OPCOES_COOKIE_BASE,
      path: "/auth",
      maxAge: TRINTA_DIAS_EM_MS
    }
  );

}

function limparCookies(
  res: Response
) {

  res.clearCookie(
    "token",
    OPCOES_COOKIE_BASE
  );

  res.clearCookie(
    "refresh_token",
    {
      ...OPCOES_COOKIE_BASE,
      path: "/auth"
    }
  );

}

function contextoDaRequisicao(
  req: Request
): ContextoRequisicao {

  return {
    ip: req.ip ?? null,
    userAgent:
      req.get("user-agent")?.slice(0, 255) ?? null
  };

}

export class AuthController {

  /*
  ==================================================
  REGISTRAR (CADASTRO PÚBLICO)
  ==================================================

  POST /auth/registrar

  Cria a conta com perfil USUARIO (nunca ADMIN
  — perfis administrativos são atribuídos à mão,
  não por auto-cadastro) e já efetua o login,
  devolvendo o cookie de sessão.

  Body:
  {
    "nome": "Ana Souza",
    "email": "ana@example.com",
    "senha": "minhasenha123"
  }
  */
  static async registrar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        nome,
        email,
        senha,
        dataNascimento
      } = req.body;

      const usuarioId =
        await UsuarioService.criar(
          nome,
          email,
          senha,
          PerfilUsuario.USUARIO
        );

      /*
      Toda conta já nasce com a "pessoa" titular
      cadastrada (mesmo nome/e-mail do usuário),
      pois é ela quem tem carteira vacinal e
      calendário — o login sozinho não é
      suficiente para o Dashboard funcionar.
      */
      await PessoaService.criar({
        usuario_id: usuarioId,
        nome,
        email,
        data_nascimento: dataNascimento
      });

      /*
      A conta só é utilizável (login) depois que o
      e-mail é confirmado via código — ver
      POST /auth/confirmar-email. Não define cookie
      de sessão aqui.
      */
      const { codigo, expiraEm } =
        AuthService.gerarCodigoVerificacao();

      await usuarioRepository.definirCodigoVerificacao(
        usuarioId,
        codigo,
        expiraEm
      );

      /*
      Não bloqueia o cadastro se o e-mail falhar
      (Gmail fora do ar, credencial errada, etc):
      o EmailService já nunca lança erro, mas o
      await é feito à parte por clareza de intenção.
      */
      NotificacaoService.notificarBoasVindas(
        email,
        nome,
        codigo
      );

      return res.status(201).json({
        precisaVerificar: true,
        email
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CONFIRMAR E-MAIL
  ==================================================

  POST /auth/confirmar-email

  Body:
  {
    "email": "ana@example.com",
    "codigo": "123456"
  }

  Se o código confere e não expirou, marca o e-mail
  como verificado e já abre a sessão (mesmo formato
  de resposta do login).
  */
  static async confirmarEmail(
    req: Request,
    res: Response
  ) {

    try {

      const {
        email,
        codigo
      } = req.body;

      const {
        token,
        refreshToken,
        usuario
      } = await AuthService.confirmarEmail(
        email,
        codigo,
        contextoDaRequisicao(req)
      );

      configurarCookies(
        res,
        token,
        refreshToken
      );

      return res.status(200).json({
        usuario
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REENVIAR CÓDIGO DE VERIFICAÇÃO
  ==================================================

  POST /auth/reenviar-codigo

  Body:
  {
    "email": "ana@example.com"
  }
  */
  static async reenviarCodigo(
    req: Request,
    res: Response
  ) {

    try {

      const { email } = req.body;

      const { nome, codigo } =
        await AuthService.gerarNovoCodigoParaReenvio(
          email
        );

      NotificacaoService.notificarCodigoVerificacao(
        email,
        nome,
        codigo
      );

      return res.status(200).json({
        mensagem: "Código reenviado."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LOGIN
  ==================================================

  POST /auth/login

  Body:
  {
    "email": "admin@notificavacinas.com",
    "senha": "admin123"
  }
  */
  static async login(
    req: Request,
    res: Response
  ) {

    try {

      const {
        email,
        senha
      } = req.body;

      const {
        token,
        refreshToken,
        usuario
      } = await AuthService.login(
        email,
        senha,
        contextoDaRequisicao(req)
      );

      configurarCookies(
        res,
        token,
        refreshToken
      );

      return res.status(200).json({
        usuario
      });

    } catch (error: any) {

      if (error instanceof ContaBloqueadaError) {
        return res.status(429).json({
          erro: error.message
        });
      }

      if (error instanceof EmailNaoVerificadoError) {

        return res.status(403).json({
          erro: error.message,
          precisaVerificar: true,
          email: req.body?.email
        });

      }

      return res.status(401).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LOGOUT
  ==================================================

  POST /auth/logout
  */
  static async logout(
    req: Request,
    res: Response
  ) {

    /*
    Revoga a sessão no servidor (e não só apaga o cookie):
    um token copiado deixa de funcionar na hora.
    */
    try {

      await AuthService.encerrarSessao(
        req.cookies?.refresh_token,
        req.cookies?.token
      );

    } catch (error: any) {

      console.error(
        "[Auth] Falha ao revogar sessão no logout:",
        error.message
      );

    }

    limparCookies(res);

    return res.status(200).json({
      mensagem: "Sessão encerrada."
    });

  }

  /*
  ==================================================
  RENOVAR SESSÃO
  ==================================================

  POST /auth/refresh

  Usa o cookie "refresh_token" (rotativo) para emitir um
  novo token de acesso.
  */
  static async refresh(
    req: Request,
    res: Response
  ) {

    try {

      const {
        token,
        refreshToken
      } = await AuthService.renovarSessao(
        req.cookies?.refresh_token
      );

      configurarCookies(
        res,
        token,
        refreshToken
      );

      return res.status(200).json({
        mensagem: "Sessão renovada."
      });

    } catch (error: any) {

      if (error instanceof RefreshConcorrenteError) {
        return res.status(409).json({
          erro: error.message,
          codigo: "REFRESH_CONCORRENTE"
        });
      }

      limparCookies(res);

      return res.status(401).json({
        erro: "Sessão inválida ou expirada."
      });

    }

  }

  /*
  ==================================================
  LISTAR SESSÕES (MEUS DISPOSITIVOS)
  ==================================================

  GET /auth/sessoes
  */
  static async listarSessoes(
    req: Request,
    res: Response
  ) {

    try {

      const sessoes =
        await AuthService.listarSessoes(
          req.usuarioId as number,
          req.sessaoId as string
        );

      return res.status(200).json(
        sessoes
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ENCERRAR UMA SESSÃO
  ==================================================

  DELETE /auth/sessoes/:id
  */
  static async encerrarSessao(
    req: Request,
    res: Response
  ) {

    try {

      const sessaoId = String(req.params.id);

      await AuthService.encerrarSessaoDoUsuario(
        req.usuarioId as number,
        sessaoId
      );

      if (sessaoId === req.sessaoId) {
        limparCookies(res);
      }

      return res.status(200).json({
        mensagem: "Sessão encerrada."
      });

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  SAIR DE TODOS OS DISPOSITIVOS
  ==================================================

  POST /auth/sessoes/encerrar-todas

  Body (opcional): { "manterAtual": true }
  */
  static async encerrarTodasAsSessoes(
    req: Request,
    res: Response
  ) {

    try {

      const manterAtual =
        req.body?.manterAtual === true;

      await AuthService.encerrarTodasAsSessoes(
        req.usuarioId as number,
        manterAtual
          ? (req.sessaoId as string)
          : undefined
      );

      if (!manterAtual) {
        limparCookies(res);
      }

      return res.status(200).json({
        mensagem: "Sessões encerradas."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ESQUECI MINHA SENHA
  ==================================================

  POST /auth/esqueci-senha

  Body: { "email": "ana@example.com" }

  Responde sempre igual, a conta existindo ou não.
  */
  static async esqueciSenha(
    req: Request,
    res: Response
  ) {

    try {

      await AuthService.solicitarRedefinicaoSenha(
        req.body?.email
      );

    } catch (error: any) {

      if (error.message === "E-mail é obrigatório.") {
        return res.status(400).json({
          erro: error.message
        });
      }

      console.error(
        "[Auth] Falha ao solicitar redefinição de senha:",
        error.message
      );

    }

    return res.status(200).json({
      mensagem:
        "Se o e-mail estiver cadastrado, enviaremos um link para criar uma nova senha."
    });

  }

  /*
  ==================================================
  REDEFINIR SENHA
  ==================================================

  POST /auth/redefinir-senha

  Body: { "token": "...", "senha": "novaSenha123" }
  */
  static async redefinirSenha(
    req: Request,
    res: Response
  ) {

    try {

      await AuthService.redefinirSenha(
        req.body?.token,
        req.body?.senha
      );

      limparCookies(res);

      return res.status(200).json({
        mensagem: "Senha alterada. Entre com a nova senha."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  USUÁRIO AUTENTICADO ATUAL
  ==================================================

  GET /auth/me

  Requer autenticação (authMiddleware).
  */
  static async me(
    req: Request,
    res: Response
  ) {

    try {

      const usuario =
        await usuarioRepository.buscarUsuarioPorId(
          req.usuarioId as number
        );

      if (!usuario) {

        return res.status(401).json({
          erro: "Não autenticado."
        });

      }

      return res.status(200).json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CONCLUIR CADASTRO (fim do onboarding)
  ==================================================

  POST /auth/concluir-cadastro

  Chamada pelo front-end ao final da tela
  /completar-cadastro (em qualquer saída: preencheu
  tudo, ou pulou alguma etapa). Dispara o e-mail de
  boas-vindas definitivo, diferente do que já foi
  mandado no cadastro junto com o código de verificação.

  Requer autenticação (authMiddleware).
  */
  static async concluirCadastro(
    req: Request,
    res: Response
  ) {

    try {

      const usuario =
        await usuarioRepository.buscarUsuarioPorId(
          req.usuarioId as number
        );

      if (!usuario) {

        return res.status(401).json({
          erro: "Não autenticado."
        });

      }

      const pessoas =
        await pessoaRepository.listarPessoasPorUsuario(
          usuario.id
        );

      const titular = pessoas[0];

      const emailDestino =
        titular?.email || usuario.email;

      const nomeDestino =
        titular?.nome || usuario.nome;

      /*
      Não bloqueia a resposta se o e-mail falhar
      (mesma lógica dos outros disparos deste controller).
      */
      NotificacaoService.notificarCadastroConcluido(
        emailDestino,
        nomeDestino
      );

      return res.status(200).json({
        mensagem: "Cadastro concluído."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
