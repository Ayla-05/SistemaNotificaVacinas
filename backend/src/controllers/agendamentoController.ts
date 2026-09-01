import { Request, Response } from "express";

import { AgendamentoService }
  from "../services/agendamentoService";

/*
==================================================
AGENDAMENTO CONTROLLER
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

- AgendamentoService
*/
export class AgendamentoController {

  /*
  ==================================================
  LISTAR TODOS OS AGENDAMENTOS
  ==================================================

  GET /agendamentos
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const agendamentos =
        await AgendamentoService
          .listarTodos();

      return res.status(200).json(
        agendamentos
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR AGENDAMENTO POR ID
  ==================================================

  GET /agendamentos/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const agendamento =
        await AgendamentoService
          .buscarPorId(
            id
          );

      return res.status(200).json(
        agendamento
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR AGENDAMENTOS DA PESSOA
  ==================================================

  GET /agendamentos/pessoa/:pessoaId
  */
  static async listarPorPessoa(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const agendamentos =
        await AgendamentoService
          .listarPorPessoa(
            pessoaId
          );

      return res.status(200).json(
        agendamentos
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR AGENDAMENTO
  ==================================================

  POST /agendamentos
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        pessoaId,
        vacinaId,
        numeroDose,
        dataPrevista,
        observacao
      } = req.body;

      const id =
        await AgendamentoService
          .criar(
            pessoaId,
            vacinaId,
            numeroDose,
            dataPrevista,
            observacao
          );

      return res.status(201).json({

        mensagem:
          "Agendamento criado com sucesso.",

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
  ATUALIZAR STATUS
  ==================================================

  PATCH /agendamentos/:id/status
  */
  static async atualizarStatus(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const {
        status
      } = req.body;

      await AgendamentoService
        .atualizarStatus(
          id,
          status
        );

      return res.status(200).json({

        mensagem:
          "Status atualizado com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  ATUALIZAR OBSERVAÇÃO
  ==================================================

  PATCH /agendamentos/:id/observacao
  */
  static async atualizarObservacao(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const {
        observacao
      } = req.body;

      await AgendamentoService
        .atualizarObservacao(
          id,
          observacao
        );

      return res.status(200).json({

        mensagem:
          "Observação atualizada com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CONTAR AGENDAMENTOS DA PESSOA
  ==================================================

  GET /agendamentos/pessoa/:pessoaId/total
  */
  static async contarPessoa(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const total =
        await AgendamentoService
          .contarPessoa(
            pessoaId
          );

      return res.status(200).json({
        total
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER AGENDAMENTO
  ==================================================

  DELETE /agendamentos/:id
  */
  static async remover(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await AgendamentoService
        .remover(
          id
        );

      return res.status(200).json({

        mensagem:
          "Agendamento removido com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}