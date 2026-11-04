import { Router, Request, Response, NextFunction } from "express";

import { PessoaController } from "../controllers/pessoaController";
import { pessoaDoIdPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
Garante que um usuário só liste as pessoas
vinculadas à própria conta (evita IDOR trocando
o :usuarioId da URL). Administradores passam livre.
*/
function usuarioEDonoDaConta(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const usuarioId = Number(
    req.params.usuarioId
  );

  if (
    req.perfilUsuario !== "ADMIN" &&
    usuarioId !== req.usuarioId
  ) {

    return res.status(403).json({
      erro: "Você não tem acesso a esta conta."
    });

  }

  next();

}

/*
Quem não é administrador só cria pessoas na própria conta: o usuario_id
do corpo é ignorado e substituído pelo do usuário autenticado
(COR-05: antes era possível criar pessoa em outra conta).
*/
function forcarDonoDaPessoa(
  req: Request,
  _res: Response,
  next: NextFunction
) {

  if (req.perfilUsuario !== "ADMIN") {
    req.body = {
      ...req.body,
      usuario_id: req.usuarioId
    };
  }

  next();

}

/*
==================================================
PESSOA ROUTES
==================================================

Rotas relacionadas às pessoas
e dependentes vinculados ao usuário.
*/
/*
CORREÇÃO [COR-04]: GET/PUT/DELETE /pessoas/:id não conferiam o
dono (IDOR: dava para ler, alterar e apagar a pessoa de outra
conta trocando o id). Agora passam por pessoaDoIdPertenceAoUsuario.
*/
const router = Router();

/*
==================================================
LISTAR TODAS AS PESSOAS
==================================================

GET /pessoas
*/
router.get(
  "/",
  PessoaController.listar
);

/*
==================================================
BUSCAR PESSOA POR ID
==================================================

GET /pessoas/:id
*/
router.get(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.buscarPorId
);

/*
==================================================
LISTAR PESSOAS DO USUÁRIO
==================================================

GET /pessoas/usuario/:usuarioId
*/
router.get(
  "/usuario/:usuarioId",
  usuarioEDonoDaConta,
  PessoaController.listarPorUsuario
);

/*
==================================================
CRIAR PESSOA
==================================================

POST /pessoas
*/
router.post(
  "/",
  forcarDonoDaPessoa,
  PessoaController.criar
);

/*
==================================================
ATUALIZAR PESSOA
==================================================

PUT /pessoas/:id
*/
router.put(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.atualizar
);

/*
==================================================
REMOVER PESSOA
==================================================

DELETE /pessoas/:id
*/
router.delete(
  "/:id",
  pessoaDoIdPertenceAoUsuario,
  PessoaController.remover
);

export default router;