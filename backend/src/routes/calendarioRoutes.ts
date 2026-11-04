import { Router } from "express";

import { CalendarioController } from "../controllers/calendarioController";
import { exigirAdmin } from "../middlewares/authMiddleware";

/*
==================================================
CALENDARIO ROUTES
==================================================

Rotas relacionadas ao calendário vacinal.
*/
/*
CORREÇÃO [COR-02]: qualquer usuário logado podia criar, editar e
apagar o calendário vacinal. Agora a escrita exige ADMIN; a
leitura continua liberada a quem está autenticado.
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
  exigirAdmin,
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
  exigirAdmin,
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
  exigirAdmin,
  CalendarioController.remover
);

export default router;