import { Request, Response } from "express";

import { PerfilUsuario } from "../enums/perfilUsuario";
import { UsuarioService } from "../services/usuarioService";

/*
==================================================
USUARIO CONTROLLER
==================================================

Responsabilidades:

- Receber requisições HTTP
- Chamar os Services
- Retornar respostas HTTP

NÃO é responsável por:

- SQL
- Regras de negócio
- Acesso ao banco
- Autorização

Dependências:

- UsuarioService
*/
export class UsuarioController {

  /*
  ==================================================
  LISTAR USUÁRIOS
  ==================================================

  GET /usuarios
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const usuarios =
        await UsuarioService.listarTodos();

      return res.status(200).json(
        usuarios
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR USUÁRIO POR ID
  ==================================================

  GET /usuarios/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      const usuario =
        await UsuarioService.buscarPorId(
          id
        );

      return res.status(200).json(
        usuario
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR USUÁRIO
  ==================================================

  POST /usuarios
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        nome,
        email,
        senha,
        perfil
      } = req.body;

      const id =
        await UsuarioService.criar(
          nome,
          email,
          senha,
          perfil ??
            PerfilUsuario.USUARIO
        );

      return res.status(201).json({
        mensagem:
          "Usuário criado com sucesso.",
        id
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ATUALIZAR USUÁRIO
  ==================================================

  PUT /usuarios/:id
  */
  static async atualizar(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      const {
        nome,
        email
      } = req.body;

      await UsuarioService.atualizar(
        id,
        nome,
        email
      );

      return res.status(200).json({
        mensagem:
          "Usuário atualizado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ATUALIZAR SENHA
  ==================================================

  PATCH /usuarios/:id/senha
  */
  static async atualizarSenha(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      const {
        senha
      } = req.body;

      await UsuarioService.atualizarSenha(
        id,
        senha
      );

      return res.status(200).json({
        mensagem:
          "Senha atualizada com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ALTERAR PERFIL
  ==================================================

  PATCH /usuarios/:id/perfil
  */
  static async alterarPerfil(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      const {
        perfil
      } = req.body;

      await UsuarioService.alterarPerfil(
        id,
        perfil
      );

      return res.status(200).json({
        mensagem:
          "Perfil atualizado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ATIVAR USUÁRIO
  ==================================================

  PATCH /usuarios/:id/ativar
  */
  static async ativar(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      await UsuarioService.ativar(
        id
      );

      return res.status(200).json({
        mensagem:
          "Usuário ativado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  DESATIVAR USUÁRIO
  ==================================================

  PATCH /usuarios/:id/desativar
  */
  static async desativar(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      await UsuarioService.desativar(
        id
      );

      return res.status(200).json({
        mensagem:
          "Usuário desativado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER USUÁRIO
  ==================================================

  DELETE /usuarios/:id
  */
  static async remover(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      await UsuarioService.remover(
        id
      );

      return res.status(200).json({
        mensagem:
          "Usuário removido com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}