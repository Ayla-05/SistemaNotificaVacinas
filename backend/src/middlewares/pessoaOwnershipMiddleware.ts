import { Request, Response, NextFunction } from "express";

import * as pessoaRepository from "../repositories/pessoaRepository";

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
