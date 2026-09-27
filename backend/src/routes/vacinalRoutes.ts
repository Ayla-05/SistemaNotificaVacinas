import { Router } from "express";

import { VacinalController } from "../controllers/vacinalController";
import { pessoaPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
==================================================
VACINAL ROUTES
==================================================

Rotas relacionadas ao resumo vacinal
(vacinas em dia e pendentes) usado
pelo Dashboard.
*/
const router = Router();

/*
==================================================
OBTER PENDÊNCIAS DA PESSOA
==================================================

GET /pendencias/:pessoaId

Só o dono da pessoa (ou um admin) pode
consultar o resumo vacinal dela.
*/
router.get(
  "/:pessoaId",
  pessoaPertenceAoUsuario,
  VacinalController.obterPendencias
);

export default router;
