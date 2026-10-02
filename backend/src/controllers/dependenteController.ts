import { Request, Response } from "express";

import { DependenteService } from "../services/dependenteService";

/*
==================================================
DEPENDENTE CONTROLLER
==================================================

Responsabilidades:

- Receber requisições HTTP
- Chamar o DependenteService
- Retornar respostas HTTP

Dependências:

- DependenteService
*/
export class DependenteController {

  /*
  ==================================================
  LISTAR DEPENDENTES
  ==================================================

  GET /dependentes/pessoa/:pessoaId
  */
  static async listar(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const dependentes =
        await DependenteService.listar(
          pessoaId
        );

      return res.status(200).json(
        dependentes
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  CADASTRAR NOVO DEPENDENTE
  ==================================================

  POST /dependentes

  Body:
  {
    "responsavelPessoaId": 1,
    "nome": "Leo",
    "data_nascimento": "2023-03-10",
    "parentesco": "filho"
  }
  */
  static async cadastrarNovo(
    req: Request,
    res: Response
  ) {

    try {

      const {
        responsavelPessoaId,
        nome,
        data_nascimento,
        parentesco,
        email,
        telefone
      } = req.body;

      const id =
        await DependenteService.cadastrarNovo(
          Number(responsavelPessoaId),
          {
            nome,
            data_nascimento,
            parentesco,
            email,
            telefone
          }
        );

      return res.status(201).json({
        mensagem:
          "Dependente cadastrado com sucesso.",
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
  REMOVER VÍNCULO
  ==================================================

  DELETE /dependentes/:responsavelId/:dependenteId
  */
  static async removerVinculo(
    req: Request,
    res: Response
  ) {

    try {

      const responsavelId = Number(
        req.params.responsavelId
      );

      const dependenteId = Number(
        req.params.dependenteId
      );

      await DependenteService.removerVinculo(
        responsavelId,
        dependenteId
      );

      return res.status(200).json({
        mensagem:
          "Vínculo removido com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
