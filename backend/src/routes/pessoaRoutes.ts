import { Router } from "express";

import { PessoaController } from "../controllers/pessoaController";

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
  PessoaController.remover
);

export default router;