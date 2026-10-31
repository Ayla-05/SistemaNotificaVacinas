import { Router } from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { ScanController } from "../controllers/scanController";
import { pessoaDoCorpoPertenceAoUsuario } from "../middlewares/pessoaOwnershipMiddleware";

/*
==================================================
SCAN ROUTES
==================================================

Rota de leitura de carteirinha via Claude Vision.
*/
const router = Router();

/*
Cada chamada custa uma requisição paga à API da
Anthropic — limita para não permitir abuso.
*/
const limitadorDeScan = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  /*
  Por usuário (e não só por IP): a rota exige login,
  então dá para limitar quem de fato gera o custo.
  */
  keyGenerator: (req) =>
    req.usuarioId
      ? `usuario:${req.usuarioId}`
      : ipKeyGenerator(req.ip ?? ""),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    erro:
      "Muitas análises de carteirinha em pouco tempo. Tente novamente em alguns minutos."
  }
});

/*
==================================================
ANALISAR CARTEIRINHA
==================================================

POST /scan/analisar
*/
router.post(
  "/analisar",
  limitadorDeScan,
  pessoaDoCorpoPertenceAoUsuario,
  ScanController.analisar
);

export default router;
