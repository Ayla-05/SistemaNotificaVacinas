import { Request, Response } from "express";

import { AuthService } from "../services/authService";
import { UsuarioService } from "../services/usuarioService";
import { PessoaService } from "../services/pessoaService";
import { NotificacaoService } from "../services/notificacaoService";
import { PerfilUsuario } from "../enums/perfilUsuario";
import * as usuarioRepository from "../repositories/usuarioRepository";

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
const OITO_HORAS_EM_MS =
  8 * 60 * 60 * 1000;

function configurarCookieToken(
  res: Response,
  token: string
) {

  res.cookie(
    "token",
    token,
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: OITO_HORAS_EM_MS
    }
  );

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
      Não bloqueia o cadastro se o e-mail falhar
      (Gmail fora do ar, credencial errada, etc):
      o EmailService já nunca lança erro, mas o
      await é feito à parte por clareza de intenção.
      */
      NotificacaoService.notificarBoasVindas(
        email,
        nome
      );

      const {
        token,
        usuario
      } = await AuthService.login(
        email,
        senha
      );

      configurarCookieToken(
        res,
        token
      );

      return res.status(201).json({
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
        usuario
      } = await AuthService.login(
        email,
        senha
      );

      configurarCookieToken(
        res,
        token
      );

      return res.status(200).json({
        usuario
      });

    } catch (error: any) {

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

    res.clearCookie(
      "token"
    );

    return res.status(200).json({
      mensagem: "Sessão encerrada."
    });

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

}
