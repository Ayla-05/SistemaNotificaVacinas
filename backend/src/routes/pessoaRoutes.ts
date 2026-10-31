import { Router, Request, Response, NextFunction } from "express";

import { PessoaController } from "../controllers/pessoaController";
import { pessoaDoIdPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
Garante que um usuário só liste as pessoas
vinculadas à própria conta (evita IDOR trocando
o :usuarioId da URL). Administradores passam livre.
*/
function usuarioEDonoDaConta(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const usuarioId = Number(
    req.params.usuarioId
  );

  if (
    req.perfilUsuario !== "ADMIN" &&
    usuarioId !== req.usuarioId
  ) {

    return res.status(403).json({
      erro: "Você não tem acesso a esta conta."
    });

  }

  next();

}

/*
==================================================
PESSOA ROUTES
==================================================

Rotas relacionadas às pessoas
e dependentes vinculados ao usuário.
*/
const router = Router();

/*
==================================================
LISTAR TODAS AS PESSOAS
==================================================

GET /pessoas
*/
router.get(
  "/",
  PessoaController.listar
);

/*
==================================================
BUSCAR PESSOA POR ID
==================================================

GET /pessoas/:id
*/
router.get(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.buscarPorId
);

/*
==================================================
LISTAR PESSOAS DO USUÁRIO
==================================================

GET /pessoas/usuario/:usuarioId
*/
router.get(
  "/usuario/:usuarioId",
  usuarioEDonoDaConta,
  PessoaController.listarPorUsuario
);

/*
==================================================
CRIAR PESSOA
==================================================

POST /pessoas
*/
router.post(
  "/",
  PessoaController.criar
);

/*
==================================================
ATUALIZAR PESSOA
==================================================

PUT /pessoas/:id
*/
router.put(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.atualizar
);

/*
==================================================
REMOVER PESSOA
==================================================

DELETE /pessoas/:id
*/
router.delete(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.remover
);

export default router;