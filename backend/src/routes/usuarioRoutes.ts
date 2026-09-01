import { Router } from "express";
import { UsuarioController } from "../controllers/usuarioController";
const router = Router();

/*
==================================================
LISTAR USUÁRIOS
==================================================
*/
router.get(
  "/",
  UsuarioController.listar
);

/*
==================================================
BUSCAR USUÁRIO POR ID
==================================================
*/
router.get(
  "/:id",
  UsuarioController.buscarPorId
);

/*
==================================================
CRIAR USUÁRIO
==================================================
*/
router.post(
  "/",
  UsuarioController.criar
);

/*
==================================================
ATUALIZAR USUÁRIO
==================================================
*/
router.put(
  "/:id",
  UsuarioController.atualizar
);

/*
==================================================
ATUALIZAR SENHA
==================================================
*/
router.patch(
  "/:id/senha",
  UsuarioController.atualizarSenha
);

/*
==================================================
ALTERAR PERFIL
==================================================
*/
router.patch(
  "/:id/perfil",
  UsuarioController.alterarPerfil
);

/*
==================================================
ATIVAR USUÁRIO
==================================================
*/
router.patch(
  "/:id/ativar",
  UsuarioController.ativar
);

/*
==================================================
DESATIVAR USUÁRIO
==================================================
*/
router.patch(
  "/:id/desativar",
  UsuarioController.desativar
);

/*
==================================================
REMOVER USUÁRIO
==================================================
*/
router.delete(
  "/:id",
  UsuarioController.remover
);

export { router as usuarioRoutes };
export default router;