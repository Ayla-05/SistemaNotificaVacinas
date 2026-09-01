import { Router } from "express";

import { RegraVacinalController } from "../controllers/regraVacinalController";

/*
==================================================
REGRA VACINAL ROUTES
==================================================

Rotas relacionadas às regras vacinais.
*/
const router = Router();

/*
==================================================
LISTAR TODAS AS REGRAS
==================================================

GET /regras-vacinais
*/
router.get(
  "/",
  RegraVacinalController.listar
);

/*
==================================================
BUSCAR REGRA POR ID
==================================================

GET /regras-vacinais/:id
*/
router.get(
  "/:id",
  RegraVacinalController.buscarPorId
);

/*
==================================================
BUSCAR REGRA PADRÃO DA VACINA
==================================================

GET /regras-vacinais/vacina/:vacinaId
*/
router.get(
  "/vacina/:vacinaId",
  RegraVacinalController.buscarPorVacina
);

/*
==================================================
BUSCAR REGRA POR VACINA E GRUPO
==================================================

GET /regras-vacinais/vacina/:vacinaId/grupo/:grupoEspecialId
*/
router.get(
  "/vacina/:vacinaId/grupo/:grupoEspecialId",
  RegraVacinalController.buscarPorVacinaEGrupo
);

/*
==================================================
LISTAR REGRAS DA VACINA
==================================================

GET /regras-vacinais/vacina/:vacinaId/lista
*/
router.get(
  "/vacina/:vacinaId/lista",
  RegraVacinalController.listarPorVacina
);

/*
==================================================
CRIAR REGRA VACINAL
==================================================

POST /regras-vacinais
*/
router.post(
  "/",
  RegraVacinalController.criar
);

/*
==================================================
ATUALIZAR REGRA VACINAL
==================================================

PUT /regras-vacinais/:id
*/
router.put(
  "/:id",
  RegraVacinalController.atualizar
);

/*
==================================================
REMOVER REGRA VACINAL
==================================================

DELETE /regras-vacinais/:id
*/
router.delete(
  "/:id",
  RegraVacinalController.remover
);

export default router;