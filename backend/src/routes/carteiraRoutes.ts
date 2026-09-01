import { Router } from "express";

import { CarteiraController } from "../controllers/carteiraController";

/*
==================================================
CARTEIRA ROUTES
==================================================

Rotas relacionadas à carteira vacinal.
*/
const router = Router();

/*
==================================================
LISTAR CARTEIRA DA PESSOA
==================================================

GET /carteira/pessoa/:pessoaId
*/
router.get(
  "/pessoa/:pessoaId",
  CarteiraController.listarCarteiraPessoa
);

/*
==================================================
REGISTRAR VACINA
==================================================

POST /carteira/registro
*/
router.post(
  "/registro",
  CarteiraController.registrarVacina
);

/*
==================================================
REGISTRAR DOSE
==================================================

POST /carteira/dose
*/
router.post(
  "/dose",
  CarteiraController.registrarDose
);

/*
==================================================
LISTAR DOSES
==================================================

GET /carteira/registro/:registroId/doses
*/
router.get(
  "/registro/:registroId/doses",
  CarteiraController.listarDoses
);

/*
==================================================
CONTAR DOSES
==================================================

GET /carteira/registro/:registroId/contar-doses
*/
router.get(
  "/registro/:registroId/contar-doses",
  CarteiraController.contarDoses
);

/*
==================================================
REMOVER DOSE
==================================================

DELETE /carteira/dose/:id
*/
router.delete(
  "/dose/:id",
  CarteiraController.removerDose
);

/*
==================================================
REMOVER REGISTRO VACINAL
==================================================

DELETE /carteira/registro/:id
*/
router.delete(
  "/registro/:id",
  CarteiraController.removerRegistro
);

export default router;