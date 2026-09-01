import { Request, Response } from "express";

import { CarteiraService } from "../services/carteiraService";

/*
==================================================
CARTEIRA CONTROLLER
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

- CarteiraService
*/
export class CarteiraController {

  /*
  ==================================================
  LISTAR CARTEIRA DA PESSOA
  ==================================================

  GET /carteira/pessoa/:pessoaId
  */
  static async listarCarteiraPessoa(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const carteira =
        await CarteiraService.listarCarteiraPessoa(
          pessoaId
        );

      return res.status(200).json(
        carteira
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REGISTRAR VACINA
  ==================================================

  POST /carteira/registro

  Body:
  {
    "pessoaId": 1,
    "vacinaId": 2
  }
  */
  static async registrarVacina(
    req: Request,
    res: Response
  ) {

    try {

      const {
        pessoaId,
        vacinaId
      } = req.body;

      const id =
        await CarteiraService.registrarVacina(
          pessoaId,
          vacinaId
        );

      return res.status(201).json({

        mensagem:
          "Vacina registrada com sucesso.",

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
  REGISTRAR DOSE
  ==================================================

  POST /carteira/dose

  Body:
  {
    "registroVacinacaoId": 1,
    "numeroDose": 1,
    "tipo": "DOSE"
  }
  */
  static async registrarDose(
    req: Request,
    res: Response
  ) {

    try {

      const {
        registroVacinacaoId,
        numeroDose,
        tipo
      } = req.body;

      const id =
        await CarteiraService.registrarDose(
          registroVacinacaoId,
          numeroDose,
          tipo
        );

      return res.status(201).json({

        mensagem:
          "Dose registrada com sucesso.",

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
  LISTAR DOSES
  ==================================================

  GET /carteira/registro/:registroId/doses
  */
  static async listarDoses(
    req: Request,
    res: Response
  ) {

    try {

      const registroId = Number(
        req.params.registroId
      );

      const doses =
        await CarteiraService.listarDoses(
          registroId
        );

      return res.status(200).json(
        doses
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CONTAR DOSES
  ==================================================

  GET /carteira/registro/:registroId/contar-doses
  */
  static async contarDoses(
    req: Request,
    res: Response
  ) {

    try {

      const registroId = Number(
        req.params.registroId
      );

      const total =
        await CarteiraService.contarDoses(
          registroId
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
  REMOVER DOSE
  ==================================================

  DELETE /carteira/dose/:id
  */
  static async removerDose(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await CarteiraService.removerDose(
        id
      );

      return res.status(200).json({

        mensagem:
          "Dose removida com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  REMOVER REGISTRO VACINAL
  ==================================================

  DELETE /carteira/registro/:id
  */
  static async removerRegistro(
    req: Request,
    res: Response
  ) {

    try {

      const id = Number(
        req.params.id
      );

      await CarteiraService.removerRegistro(
        id
      );

      return res.status(200).json({

        mensagem:
          "Registro vacinal removido com sucesso."

      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}