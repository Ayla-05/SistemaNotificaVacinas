import { Router } from "express";

import { CarteiraController } from "../controllers/carteiraController";
import { pessoaPertenceAoUsuario, pessoaDoCorpoPertenceAoUsuario, registroDaUrlPertenceAoUsuario, registroDoIdPertenceAoUsuario, registroDoCorpoPertenceAoUsuario, doseDoIdPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

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
  registroDaUrlPertenceAoUsuario,
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
  registroDaUrlPertenceAoUsuario,
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
  doseDoIdPertenceAoUsuario,
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
  registroDoIdPertenceAoUsuario,
  CarteiraController.removerRegistro
);

export default router;