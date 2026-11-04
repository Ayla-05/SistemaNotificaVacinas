import { Request, Response, NextFunction } from "express";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as agendamentoVacinaRepository from "../repositories/agendamentoVacinaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";

/*
==================================================
PESSOA OWNERSHIP MIDDLEWARE
==================================================

Garante que um usuário autenticado só consiga
consultar dados (pendências, carteira, agendamentos)
de uma pessoa que pertence à sua própria conta.

Sem isso, qualquer usuário logado poderia trocar
o :pessoaId da URL e ver a carteira vacinal de
qualquer outra pessoa no sistema (IDOR).

Administradores têm acesso irrestrito.

Dependências:

- pessoaRepository
- authMiddleware (precisa rodar antes)
*/
async function validarPosse(
  pessoaId: number,
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (!pessoaId) {

    return res.status(400).json({
      erro: "Pessoa inválida."
    });

  }

  if (req.perfilUsuario === "ADMIN") {
    return next();
  }

  const pessoa =
    await pessoaRepository.buscarPessoaPorId(
      pessoaId
    );

  if (
    !pessoa ||
    pessoa.usuario_id !== req.usuarioId
  ) {

    return res.status(403).json({
      erro: "Você não tem acesso a esta pessoa."
    });

  }

  next();

}

/*
Para rotas GET com :pessoaId na URL
(ex.: /pendencias/:pessoaId).
*/
export async function pessoaPertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await validarPosse(
      Number(req.params.pessoaId),
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}

/*
Para rotas POST cujo pessoaId vem no
corpo da requisição
(ex.: /carteira/confirmar-scan, /scan/analisar).
*/
export async function pessoaDoCorpoPertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await validarPosse(
      Number(req.body.pessoaId),
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}


/*
Para rotas com o :id de um agendamento na URL
(ex.: PATCH /agendamentos/:id/confirmar). Resolve a
pessoa dona do agendamento e valida a posse.
*/
export async function agendamentoPertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const agendamento: any =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(
          Number(req.params.id)
        );

    if (!agendamento) {

      return res.status(404).json({
        erro: "Agendamento não encontrado."
      });

    }

    await validarPosse(
      agendamento.pessoa_id,
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}

/*
Pessoa identificada pelo :id da própria URL
(ex.: GET/PUT/DELETE /pessoas/:id).
*/
export async function pessoaDoIdPertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    await validarPosse(
      Number(req.params.id),
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}

/*
Registro vacinal identificado por um parâmetro da URL
(ex.: /carteira/registro/:registroId/doses). A posse é a
da pessoa dona do registro.
*/
export function registroPertenceAoUsuario(
  parametro: string
) {

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      const registro =
        await registroVacinacaoRepository
          .buscarRegistroPorId(
            Number(req.params[parametro])
          );

      if (!registro) {
        return res.status(404).json({
          erro: "Registro vacinal não encontrado."
        });
      }

      await validarPosse(
        registro.pessoa_id,
        req,
        res,
        next
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  };

}

/*
Registro vacinal informado no corpo da requisição
(ex.: POST /carteira/dose com registroVacinacaoId).
*/
export async function registroDoCorpoPertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          Number(req.body?.registroVacinacaoId)
        );

    if (!registro) {
      return res.status(404).json({
        erro: "Registro vacinal não encontrado."
      });
    }

    await validarPosse(
      registro.pessoa_id,
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}

/*
Dose identificada pelo :id da URL (DELETE /carteira/dose/:id):
a posse é a da pessoa dona do registro da dose.
*/
export async function dosePertenceAoUsuario(
  req: Request,
  res: Response,
  next: NextFunction
) {

  try {

    const dose =
      await doseVacinaRepository
        .buscarDosePorId(
          Number(req.params.id)
        );

    if (!dose) {
      return res.status(404).json({
        erro: "Dose não encontrada."
      });
    }

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          dose.registro_vacinacao_id
        );

    if (!registro) {
      return res.status(404).json({
        erro: "Registro vacinal não encontrado."
      });
    }

    await validarPosse(
      registro.pessoa_id,
      req,
      res,
      next
    );

  } catch (error: any) {

    return res.status(400).json({
      erro: error.message
    });

  }

}
