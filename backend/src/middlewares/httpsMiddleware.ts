import { Request, Response, NextFunction } from "express";

/*
==================================================
HTTPS MIDDLEWARE
==================================================

Em produção, redireciona HTTP para HTTPS.

Depende de "trust proxy" (server.ts): atrás de um
balanceador, é o cabeçalho X-Forwarded-Proto que diz se
a conexão original era segura.

FORCE_HTTPS=false desliga (ex.: HTTPS terminado em outro
ponto da infraestrutura).
*/
export function forcarHttps(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const ativo =
    process.env.NODE_ENV === "production" &&
    process.env.FORCE_HTTPS !== "false";

  if (!ativo || req.secure) {
    return next();
  }

  return res.redirect(
    308,
    `https://${req.hostname}${req.originalUrl}`
  );

}
