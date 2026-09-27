import { Router } from "express";
import rateLimit from "express-rate-limit";

import { AuthController } from "../controllers/authController";
import { autenticar } from "../middlewares/authMiddleware";

/*
==================================================
AUTH ROUTES
==================================================

Rotas de login, logout e sessão atual.
*/
const router = Router();

/*
Limita tentativas de login por IP para dificultar
ataques de força bruta contra senhas.
*/
const limitadorDeLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro:
      "Muitas tentativas de login. Tente novamente em alguns minutos."
  }
});

/*
==================================================
CADASTRO PÚBLICO
==================================================

POST /auth/registrar
*/
router.post(
  "/registrar",
  limitadorDeLogin,
  AuthController.registrar
);

/*
==================================================
LOGIN
==================================================

POST /auth/login
*/
router.post(
  "/login",
  limitadorDeLogin,
  AuthController.login
);

/*
==================================================
LOGOUT
==================================================

POST /auth/logout
*/
router.post(
  "/logout",
  AuthController.logout
);

/*
==================================================
USUÁRIO AUTENTICADO ATUAL
==================================================

GET /auth/me
*/
router.get(
  "/me",
  autenticar,
  AuthController.me
);

export default router;
