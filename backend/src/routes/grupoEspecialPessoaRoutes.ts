import { Router } from "express";

import { GrupoEspecialPessoaController } from "../controllers/grupoEspecialPessoaController";
import { pessoaPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
==================================================
GRUPOS ESPECIAIS (PESSOA) ROUTES
==================================================

Catálogo de grupos especiais (gestante, idoso,
comorbidade, etc) e o vínculo com cada pessoa.
*/
const router = Router();

/*
==================================================
LISTAR CATÁLOGO
==================================================

GET /grupos-especiais
*/
router.get(
  "/",
  GrupoEspecialPessoaController.listarCatalogo
);

/*
==================================================
LISTAR GRUPOS DE UMA PESSOA
==================================================

GET /grupos-especiais/pessoa/:pessoaId
*/
router.get(
  "/pessoa/:pessoaId",
  pessoaPertenceAoUsuario,
  GrupoEspecialPessoaController.listarDaPessoa
);

/*
==================================================
VINCULAR GRUPO
==================================================

POST /grupos-especiais/pessoa/:pessoaId
*/
router.post(
  "/pessoa/:pessoaId",
  pessoaPertenceAoUsuario,
  GrupoEspecialPessoaController.vincular
);

/*
==================================================
DESVINCULAR GRUPO
==================================================

DELETE /grupos-especiais/pessoa/:pessoaId/:grupoEspecialId
*/
router.delete(
  "/pessoa/:pessoaId/:grupoEspecialId",
  pessoaPertenceAoUsuario,
  GrupoEspecialPessoaController.desvincular
);

export default router;
