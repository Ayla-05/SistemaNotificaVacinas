import { Request, Response } from "express";

import { CalendarioVacinalService }
  from "../services/calendarioVacinalService";

/*
==================================================
CALENDARIO CONTROLLER
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

- CalendarioVacinalService
*/
export class CalendarioController {

  /*
  ==================================================
  LISTAR TODO O CALENDÁRIO
  ==================================================

  GET /calendario
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const calendario =
        await CalendarioVacinalService
          .listarTodos();

      return res.status(200).json(
        calendario
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR REGISTRO POR ID
  ==================================================

  GET /calendario/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const registro =
        await CalendarioVacinalService
          .buscarPorId(
            id
          );

      return res.status(200).json(
        registro
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR POR FAIXA ETÁRIA
  ==================================================

  GET /calendario/faixa/:faixaEtaria
  */
  static async listarPorFaixaEtaria(
    req: Request,
    res: Response
  ) {

    try {

      const faixaEtaria = String(
        req.params.faixaEtaria
      );

      const registros =
        await CalendarioVacinalService
          .listarPorFaixaEtaria(
            faixaEtaria
          );

      return res.status(200).json(
        registros
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR POR VACINA
  ==================================================

  GET /calendario/vacina/:vacinaId
  */
  static async listarPorVacina(
    req: Request,
    res: Response
  ) {

    try {

      const vacinaId = Number(
        req.params.vacinaId
      );

      const registros =
        await CalendarioVacinalService
          .listarPorVacina(
            vacinaId
          );

      return res.status(200).json(
        registros
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR REGISTRO DO CALENDÁRIO
  ==================================================

  POST /calendario
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        vacinaId,
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao
      } = req.body;

      const id =
        await CalendarioVacinalService
          .criar(
            vacinaId,
            faixaEtaria,
            idadeMinima,
            idadeMaxima,
            doses,
            reforcos,
            observacao
          );

      return res.status(201).json({

        mensagem:
          "Registro criado com sucesso.",

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
  ATUALIZAR REGISTRO DO CALENDÁRIO
  ==================================================

  PUT /calendario/:id
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
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao
      } = req.body;

      await CalendarioVacinalService
        .atualizar(
          id,
          faixaEtaria,
          idadeMinima,
          idadeMaxima,
          doses,
          reforcos,
          observacao
        );

      return res.status(200).json({
        mensagem:
          "Registro atualizado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER REGISTRO DO CALENDÁRIO
  ==================================================

  DELETE /calendario/:id
  */
  static async remover(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await CalendarioVacinalService
        .remover(
          id
        );

      return res.status(200).json({
        mensagem:
          "Registro removido com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}