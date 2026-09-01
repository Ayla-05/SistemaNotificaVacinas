import { Request, Response } from "express";

import { RegraVacinalService } from "../services/regraVacinalService";

/*
==================================================
REGRA VACINAL CONTROLLER
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

- RegraVacinalService
*/
export class RegraVacinalController {

  /*
  ==================================================
  LISTAR TODAS AS REGRAS
  ==================================================

  GET /regras-vacinais
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const regras =
        await RegraVacinalService.listarTodas();

      return res.status(200).json(
        regras
      );

    } catch (error: any) {

      return res.status(500).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR REGRA POR ID
  ==================================================

  GET /regras-vacinais/:id
  */
  static async buscarPorId(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      const regra =
        await RegraVacinalService.buscarPorId(
          id
        );

      return res.status(200).json(
        regra
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR REGRA PADRÃO DA VACINA
  ==================================================

  GET /regras-vacinais/vacina/:vacinaId
  */
  static async buscarPorVacina(
    req: Request,
    res: Response
  ) {

    try {

      const vacinaId = Number(
        req.params.vacinaId
      );

      const regra =
        await RegraVacinalService.buscarPorVacina(
          vacinaId
        );

      return res.status(200).json(
        regra
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  BUSCAR REGRA POR VACINA E GRUPO
  ==================================================

  GET /regras-vacinais/vacina/:vacinaId/grupo/:grupoEspecialId
  */
  static async buscarPorVacinaEGrupo(
    req: Request,
    res: Response
  ) {

    try {

      const vacinaId = Number(
        req.params.vacinaId
      );

      const grupoEspecialId = Number(
        req.params.grupoEspecialId
      );

      const regra =
        await RegraVacinalService
          .buscarPorVacinaEGrupo(
            vacinaId,
            grupoEspecialId
          );

      return res.status(200).json(
        regra
      );

    } catch (error: any) {

      return res.status(404).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR REGRAS DA VACINA
  ==================================================

  GET /regras-vacinais/vacina/:vacinaId/lista
  */
  static async listarPorVacina(
    req: Request,
    res: Response
  ) {

    try {

      const vacinaId = Number(
        req.params.vacinaId
      );

      const regras =
        await RegraVacinalService
          .listarPorVacina(
            vacinaId
          );

      return res.status(200).json(
        regras
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CRIAR REGRA VACINAL
  ==================================================

  POST /regras-vacinais
  */
  static async criar(
    req: Request,
    res: Response
  ) {

    try {

      const {
        vacinaId,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      } = req.body;

      const id =
        await RegraVacinalService.criar(
          vacinaId,
          grupoEspecialId,
          intervaloDose12,
          intervaloDose23,
          intervaloDose34,
          intervaloDoseReforco,
          reforcoAnos,
          campanhaAnual,
          observacao
        );

      return res.status(201).json({

        mensagem:
          "Regra vacinal criada com sucesso.",

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
  ATUALIZAR REGRA VACINAL
  ==================================================

  PUT /regras-vacinais/:id
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
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      } = req.body;

      await RegraVacinalService.atualizar(
        id,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      );

      return res.status(200).json({

        mensagem:
          "Regra vacinal atualizada com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER REGRA VACINAL
  ==================================================

  DELETE /regras-vacinais/:id
  */
  static async remover(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await RegraVacinalService.remover(
        id
      );

      return res.status(200).json({

        mensagem:
          "Regra vacinal removida com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}