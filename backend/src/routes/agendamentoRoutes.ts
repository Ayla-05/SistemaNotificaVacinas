import { Router } from "express";

import { AgendamentoController } from "../controllers/agendamentoController";
import { pessoaPertenceAoUsuario, pessoaDoCorpoPertenceAoUsuario, agendamentoDoIdPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
==================================================
AGENDAMENTO ROUTES
==================================================

Rotas relacionadas aos agendamentos
de vacinação.
*/
const router = Router();

/*
==================================================
LISTAR TODOS OS AGENDAMENTOS
==================================================

GET /agendamentos
*/
router.get(
  "/",
  AgendamentoController.listar
);

/*
==================================================
BUSCAR AGENDAMENTO POR ID
==================================================

GET /agendamentos/:id
*/
router.get(
  "/:id",
  agendamentoDoIdPertenceAoUsuario,
  AgendamentoController.buscarPorId
);

/*
==================================================
LISTAR AGENDAMENTOS DA PESSOA
==================================================

GET /agendamentos/pessoa/:pessoaId
*/
router.get(
  "/pessoa/:pessoaId",
  pessoaPertenceAoUsuario,
  AgendamentoController.listarPorPessoa
);

/*
==================================================
CRIAR AGENDAMENTO
==================================================

POST /agendamentos
*/
router.post(
  "/",
  pessoaDoCorpoPertenceAoUsuario,
  AgendamentoController.criar
);

/*
==================================================
ATUALIZAR STATUS
==================================================

PATCH /agendamentos/:id/status
*/
router.patch(
  "/:id/status",
  agendamentoDoIdPertenceAoUsuario,
  AgendamentoController.atualizarStatus
);

/*
==================================================
ATUALIZAR OBSERVAÇÃO
==================================================

PATCH /agendamentos/:id/observacao
*/
router.patch(
  "/:id/observacao",
  agendamentoDoIdPertenceAoUsuario,
  AgendamentoController.atualizarObservacao
);

/*
==================================================
CONTAR AGENDAMENTOS DA PESSOA
==================================================

GET /agendamentos/pessoa/:pessoaId/total
*/
router.get(
  "/pessoa/:pessoaId/total",
  AgendamentoController.contarPessoa
);

/*
==================================================
REMOVER AGENDAMENTO
==================================================

DELETE /agendamentos/:id
*/
router.delete(
  "/:id",
  agendamentoDoIdPertenceAoUsuario,
  AgendamentoController.remover
);

export default router;