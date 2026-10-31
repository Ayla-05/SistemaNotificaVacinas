import { Request, Response, NextFunction } from "express";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";
import * as agendamentoVacinaRepository from "../repositories/agendamentoVacinaRepository";

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
Para rotas com :id da própria pessoa na URL
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
Para recursos que pertencem a uma pessoa de forma indireta
(registro, dose, agendamento). O resolvedor devolve o
pessoa_id dono do recurso; se o recurso não existe, só o
administrador segue adiante (o controller responde "não
encontrado"); os demais recebem 403, sem revelar se existe.
*/
function donoDoRecurso(
  resolverPessoaId: (req: Request) => Promise<number | undefined>
) {

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {

    try {

      if (req.perfilUsuario === "ADMIN") {
        return next();
      }

      const pessoaId =
        await resolverPessoaId(req);

      const pessoa =
        pessoaId
          ? await pessoaRepository.buscarPessoaPorId(
              pessoaId
            )
          : undefined;

      if (
        !pessoa ||
        pessoa.usuario_id !== req.usuarioId
      ) {

        return res.status(403).json({
          erro: "Você não tem acesso a este recurso."
        });

      }

      next();

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  };

}

const pessoaDoRegistro = async (registroId: unknown) =>
  (await registroVacinacaoRepository.buscarRegistroPorId(
    Number(registroId)
  ))?.pessoa_id as number | undefined;

/* :registroId na URL */
export const registroDaUrlPertenceAoUsuario =
  donoDoRecurso((req) => pessoaDoRegistro(req.params.registroId));

/* :id na URL é um registro vacinal */
export const registroDoIdPertenceAoUsuario =
  donoDoRecurso((req) => pessoaDoRegistro(req.params.id));

/* registroVacinacaoId no corpo */
export const registroDoCorpoPertenceAoUsuario =
  donoDoRecurso((req) => pessoaDoRegistro(req.body?.registroVacinacaoId));

/* :id na URL é uma dose */
export const doseDoIdPertenceAoUsuario =
  donoDoRecurso(async (req) => {
    const dose: any =
      await doseVacinaRepository.buscarDosePorId(
        Number(req.params.id)
      );
    return dose
      ? pessoaDoRegistro(dose.registro_vacinacao_id)
      : undefined;
  });

/* :id na URL é um agendamento */
export const agendamentoDoIdPertenceAoUsuario =
  donoDoRecurso(async (req) =>
    (await agendamentoVacinaRepository.buscarAgendamentoPorId(
      Number(req.params.id)
    ))?.pessoa_id as number | undefined
  );
