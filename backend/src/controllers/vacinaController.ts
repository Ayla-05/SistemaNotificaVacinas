import { Request, Response } from "express";

import { VacinaService } from "../services/vacinaService";

/*
==================================================
VACINA CONTROLLER
==================================================

Responsabilidades:

- Receber requisições HTTP
- Validar parâmetros básicos
- Chamar os Services
- Retornar respostas HTTP

NÃO é responsável por:

- SQL
- Regras de negócio
- Acesso ao banco

Dependências:

- VacinaService
*/
export class VacinaController {

  /*
  ==================================================
  LISTAR TODAS AS VACINAS
  ==================================================

  GET /vacinas
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const vacinas =
        await VacinaService.listarTodas();

      return res.status(200).json(
        vacinas
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR VACINAS ATIVAS
  ==================================================

  GET /vacinas/ativas
  */
  static async listarAtivas(
    req: Request,
    res: Response
  ) {

    try {

      const vacinas =
        await VacinaService.listarAtivas();

      return res.status(200).json(
        vacinas
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR VACINA POR ID
  ==================================================

  GET /vacinas/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const vacina =
        await VacinaService.buscarPorId(
          id
        );

      return res.status(200).json(
        vacina
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR VACINA POR CÓDIGO
  ==================================================

  GET /vacinas/codigo/:codigo
  */
  static async buscarPorCodigo(
    req: Request,
    res: Response
  ) {

    try {

      const codigo = String(
        req.params.codigo
      );

      const vacina =
        await VacinaService.buscarPorCodigo(
          codigo
        );

      return res.status(200).json(
        vacina
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR VACINA POR NOME
  ==================================================

  GET /vacinas/nome/:nome
  */
  static async buscarPorNome(
    req: Request,
    res: Response
  ) {

    try {

      const nome = String(
        req.params.nome
      );

      const vacina =
        await VacinaService.buscarPorNome(
          nome
        );

      return res.status(200).json(
        vacina
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR VACINA
  ==================================================

  POST /vacinas

  Futuramente protegido por:
  - authMiddleware
  - adminMiddleware
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        codigo,
        nome,
        descricao,
        doencasEvitadas
      } = req.body;

      const id =
        await VacinaService.criar(
          codigo,
          nome,
          descricao,
          doencasEvitadas
        );

      return res.status(201).json({
        mensagem:
          "Vacina criada com sucesso.",
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
  ATUALIZAR VACINA
  ==================================================

  PUT /vacinas/:id
  */
  static async atualizar(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const {
        nome,
        descricao,
        doencasEvitadas
      } = req.body;

      await VacinaService.atualizar(
        id,
        nome,
        descricao,
        doencasEvitadas
      );

      return res.status(200).json({
        mensagem:
          "Vacina atualizada com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  DESATIVAR VACINA
  ==================================================

  PATCH /vacinas/:id/desativar
  */
  static async desativar(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await VacinaService.desativar(
        id
      );

      return res.status(200).json({
        mensagem:
          "Vacina desativada com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}