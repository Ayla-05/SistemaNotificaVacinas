import { Request, Response } from "express";

import { PessoaGrupoEspecialService } from "../services/pessoaGrupoEspecialService";

/*
==================================================
GRUPO ESPECIAL (PESSOA) CONTROLLER
==================================================

Responsabilidades:

- Listar o catálogo de grupos especiais
- Listar/vincular/desvincular grupos de uma pessoa

Dependências:

- PessoaGrupoEspecialService
*/
export class GrupoEspecialPessoaController {

  /*
  ==================================================
  LISTAR CATÁLOGO
  ==================================================

  GET /grupos-especiais
  */
  static async listarCatalogo(
    req: Request,
    res: Response
  ) {

    try {

      const grupos =
        await PessoaGrupoEspecialService
          .listarCatalogo();

      return res.status(200).json(
        grupos
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  LISTAR GRUPOS DE UMA PESSOA
  ==================================================

  GET /grupos-especiais/pessoa/:pessoaId
  */
  static async listarDaPessoa(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const grupos =
        await PessoaGrupoEspecialService
          .listarDaPessoa(
            pessoaId
          );

      return res.status(200).json(
        grupos
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  VINCULAR GRUPO
  ==================================================

  POST /grupos-especiais/pessoa/:pessoaId

  Body: { "grupoEspecialId": 1 }
  */
  static async vincular(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const { grupoEspecialId } = req.body;

      await PessoaGrupoEspecialService.vincular(
        pessoaId,
        Number(grupoEspecialId)
      );

      return res.status(201).json({
        mensagem:
          "Grupo vinculado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

  /*
  ==================================================
  DESVINCULAR GRUPO
  ==================================================

  DELETE /grupos-especiais/pessoa/:pessoaId/:grupoEspecialId
  */
  static async desvincular(
    req: Request,
    res: Response
  ) {

    try {

      const pessoaId = Number(
        req.params.pessoaId
      );

      const grupoEspecialId = Number(
        req.params.grupoEspecialId
      );

      await PessoaGrupoEspecialService.desvincular(
        pessoaId,
        grupoEspecialId
      );

      return res.status(200).json({
        mensagem:
          "Grupo desvinculado com sucesso."
      });

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
