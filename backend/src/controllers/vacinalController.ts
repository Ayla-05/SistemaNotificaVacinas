import { Request, Response } from "express";

import { ProximasDosesService } from "../services/proximasDosesService";
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

  /*
  ==================================================
  PRÓXIMAS DOSES DA PESSOA
  ==================================================

  GET /pendencias/:pessoaId/proximas-doses

  Para cada vacina, a próxima dose e a data em que é
  devida (com status: ATRASADA, DISPONIVEL, PROXIMA ou
  FUTURA), calculada com o calendário nacional 2026.
  */
  static async obterProximasDoses(
    req: Request,
    res: Response
  ) {

    try {

      const proximas =
        await ProximasDosesService.calcular(
          Number(req.params.pessoaId)
        );

      return res.status(200).json(
        proximas
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
