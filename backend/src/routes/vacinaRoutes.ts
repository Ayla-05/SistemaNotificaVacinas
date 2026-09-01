import { Router } from "express";

import { VacinaController } from "../controllers/vacinaController";

/*
==================================================
VACINA ROUTES
==================================================

Rotas relacionadas ao cadastro
e consulta de vacinas.
*/
const router = Router();

/*
==================================================
LISTAR TODAS AS VACINAS
==================================================

GET /vacinas
*/
router.get(
  "/",
  VacinaController.listar
);

/*
==================================================
LISTAR VACINAS ATIVAS
==================================================

GET /vacinas/ativas
*/
router.get(
  "/ativas",
  VacinaController.listarAtivas
);

/*
==================================================
BUSCAR VACINA POR CÓDIGO
==================================================

GET /vacinas/codigo/:codigo
*/
router.get(
  "/codigo/:codigo",
  VacinaController.buscarPorCodigo
);

/*
==================================================
BUSCAR VACINA POR NOME
==================================================

GET /vacinas/nome/:nome
*/
router.get(
  "/nome/:nome",
  VacinaController.buscarPorNome
);

/*
==================================================
BUSCAR VACINA POR ID
==================================================

GET /vacinas/:id
*/
router.get(
  "/:id",
  VacinaController.buscarPorId
);

/*
==================================================
CRIAR VACINA
==================================================

POST /vacinas
*/
router.post(
  "/",
  VacinaController.criar
);

/*
==================================================
ATUALIZAR VACINA
==================================================

PUT /vacinas/:id
*/
router.put(
  "/:id",
  VacinaController.atualizar
);

/*
==================================================
DESATIVAR VACINA
==================================================

PATCH /vacinas/:id/desativar
*/
router.patch(
  "/:id/desativar",
  VacinaController.desativar
);

export default router;