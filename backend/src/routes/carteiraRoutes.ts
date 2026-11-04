import { Router } from "express";

import { CarteiraController } from "../controllers/carteiraController";
import {
  pessoaPertenceAoUsuario,
  pessoaDoCorpoPertenceAoUsuario,
  registroPertenceAoUsuario,
  registroDoCorpoPertenceAoUsuario,
  dosePertenceAoUsuario
} from "../middlewares/pessoaOwnershipMiddleware";

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
  pessoaPertenceAoUsuario,
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
  pessoaDoCorpoPertenceAoUsuario,
  CarteiraController.registrarVacina
);

/*
==================================================
CONFIRMAR LEITURA DO SCAN (CLAUDE VISION)
==================================================

POST /carteira/confirmar-scan
*/
router.post(
  "/confirmar-scan",
  pessoaDoCorpoPertenceAoUsuario,
  CarteiraController.confirmarScan
);

/*
==================================================
REGISTRAR DOSE
==================================================

POST /carteira/dose
*/
router.post(
  "/dose",
  registroDoCorpoPertenceAoUsuario,
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
  registroPertenceAoUsuario("registroId"),
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
  registroPertenceAoUsuario("registroId"),
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
  dosePertenceAoUsuario,
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
  registroPertenceAoUsuario("id"),
  CarteiraController.removerRegistro
);

export default router;