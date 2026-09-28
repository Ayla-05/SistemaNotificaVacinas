import { Router } from "express";

import { DependenteController } from "../controllers/dependenteController";
import { pessoaPertenceAoUsuario, pessoaDoCorpoPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
==================================================
DEPENDENTE ROUTES
==================================================

Rotas de vínculo entre uma pessoa (responsável) e
seus dependentes (filhos, pais, etc).
*/
const router = Router();

/*
==================================================
LISTAR DEPENDENTES
==================================================

GET /dependentes/pessoa/:pessoaId
*/
router.get(
  "/pessoa/:pessoaId",
  pessoaPertenceAoUsuario,
  DependenteController.listar
);

/*
==================================================
CADASTRAR NOVO DEPENDENTE
==================================================

POST /dependentes
*/
router.post(
  "/",
  (req, res, next) => {
    req.params.pessoaId = req.body.responsavelPessoaId;
    next();
  },
  pessoaPertenceAoUsuario,
  DependenteController.cadastrarNovo
);

/*
==================================================
REMOVER VÍNCULO
==================================================

DELETE /dependentes/:responsavelId/:dependenteId
*/
router.delete(
  "/:responsavelId/:dependenteId",
  (req, res, next) => {
    req.params.pessoaId = req.params.responsavelId;
    next();
  },
  pessoaPertenceAoUsuario,
  DependenteController.removerVinculo
);

export default router;
