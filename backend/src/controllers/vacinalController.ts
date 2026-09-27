import { Request, Response } from "express";

import { VacinalService } from "../services/vacinalService";

/*
==================================================
VACINAL CONTROLLER
==================================================

Responsabilidades:

- Receber requisições HTTP
- Chamar o VacinalService
- Retornar respostas HTTP

NÃO é responsável por:

- SQL
- Regras de negócio
- Acesso ao banco

Dependências:

- VacinalService
*/
export class VacinalController {

  /*
  ==================================================
  OBTER PENDÊNCIAS DA PESSOA
  ==================================================

  GET /pendencias/:pessoaId

  Retorna o resumo vacinal usado
  pelo Dashboard: vacinas em dia
  e vacinas pendentes.
  */
  static async obterPendencias(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const resumo =
        await VacinalService.obterResumoPessoa(
          pessoaId
        );

      return res.status(200).json(
        resumo
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
