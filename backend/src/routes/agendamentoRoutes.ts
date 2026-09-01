import { Router } from "express";

import { AgendamentoController } from "../controllers/agendamentoController";

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
  AgendamentoController.remover
);

export default router;