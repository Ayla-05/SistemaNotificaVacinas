import { Router } from "express";
import rateLimit from "express-rate-limit";

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
