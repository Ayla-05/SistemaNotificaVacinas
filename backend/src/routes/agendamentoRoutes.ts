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
/*
CORREÇÃO [COR-07]: ver, alterar status/observação e remover
agendamento por id (e agendar para pessoa alheia) não conferiam o
dono. Agora passam pelos middlewares de posse.
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
CONFIRMAR QUE A VACINA FOI TOMADA
==================================================

PATCH /agendamentos/:id/confirmar

Marca o agendamento como REALIZADA e registra a dose na
carteira vacinal (ver AgendamentoService.confirmarRealizacao).
*/
router.patch(
  "/:id/confirmar",
  agendamentoDoIdPertenceAoUsuario,
  AgendamentoController.confirmar
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