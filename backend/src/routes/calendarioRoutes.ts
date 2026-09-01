import { Router } from "express";

import { CalendarioController } from "../controllers/calendarioController";

/*
==================================================
CALENDARIO ROUTES
==================================================

Rotas relacionadas ao calendário vacinal.
*/
const router = Router();

/*
==================================================
LISTAR TODO O CALENDÁRIO
==================================================

GET /calendario
*/
router.get(
  "/",
  CalendarioController.listar
);

/*
==================================================
BUSCAR REGISTRO POR ID
==================================================

GET /calendario/:id
*/
router.get(
  "/:id",
  CalendarioController.buscarPorId
);

/*
==================================================
LISTAR POR FAIXA ETÁRIA
==================================================

GET /calendario/faixa/:faixaEtaria
*/
router.get(
  "/faixa/:faixaEtaria",
  CalendarioController.listarPorFaixaEtaria
);

/*
==================================================
LISTAR POR VACINA
==================================================

GET /calendario/vacina/:vacinaId
*/
router.get(
  "/vacina/:vacinaId",
  CalendarioController.listarPorVacina
);

/*
==================================================
CRIAR REGISTRO
==================================================

POST /calendario
*/
router.post(
  "/",
  CalendarioController.criar
);

/*
==================================================
ATUALIZAR REGISTRO
==================================================

PUT /calendario/:id
*/
router.put(
  "/:id",
  CalendarioController.atualizar
);

/*
==================================================
REMOVER REGISTRO
==================================================

DELETE /calendario/:id
*/
router.delete(
  "/:id",
  CalendarioController.remover
);

export default router;