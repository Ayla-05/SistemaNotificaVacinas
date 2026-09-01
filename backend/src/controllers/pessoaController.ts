import { Request, Response } from "express";

import { PessoaService } from "../services/pessoaService";

/*
==================================================
PESSOA CONTROLLER
==================================================

Responsabilidades:

- Receber requisições HTTP
- Chamar os Services
- Retornar respostas HTTP

NÃO é responsável por:

- SQL
- Regras de negócio
- Acesso ao banco

Dependências:

- PessoaService
*/
export class PessoaController {

  /*
  ==================================================
  LISTAR TODAS AS PESSOAS
  ==================================================

  GET /pessoas
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const pessoas =
        await PessoaService.listarTodas();

      return res.status(200).json(
        pessoas
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR PESSOA POR ID
  ==================================================

  GET /pessoas/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      const pessoa =
        await PessoaService.buscarPorId(
          id
        );

      return res.status(200).json(
        pessoa
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR PESSOAS POR USUÁRIO
  ==================================================

  GET /usuarios/:usuarioId/pessoas
  */
  static async listarPorUsuario(
    req: Request,
    res: Response
  ) {

    try {

      const usuarioId =
        Number(req.params.usuarioId);

      const pessoas =
        await PessoaService.listarPorUsuario(
          usuarioId
        );

      return res.status(200).json(
        pessoas
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR PESSOA
  ==================================================

  POST /pessoas
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        await PessoaService.criar(
          req.body
        );

      return res.status(201).json({
        mensagem:
          "Pessoa criada com sucesso.",
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
  ATUALIZAR PESSOA
  ==================================================

  PUT /pessoas/:id
  */
  static async atualizar(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      await PessoaService.atualizar(
        id,
        req.body
      );

      return res.status(200).json({
        mensagem:
          "Pessoa atualizada com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER PESSOA
  ==================================================

  DELETE /pessoas/:id
  */
  static async remover(
    req: Request,
    res: Response
  ) {

    try {

      const id =
        Number(req.params.id);

      await PessoaService.remover(
        id
      );

      return res.status(200).json({
        mensagem:
          "Pessoa removida com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}