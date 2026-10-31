import { Request, Response, NextFunction } from "express";

/*
==================================================
CSRF MIDDLEWARE
==================================================

Responsabilidades:

- Exigir um cabeçalho customizado em toda requisição
  que altera dados (POST, PUT, PATCH, DELETE)

Por que funciona:

Um site de terceiros consegue disparar uma requisição
que leva o cookie da vítima (formulário, <img>), mas não
consegue adicionar cabeçalhos customizados sem passar
pelo preflight do CORS, que só autoriza a origem exata
do front end. Somado ao sameSite do cookie, fecha a
porta para CSRF sem precisar guardar token no servidor.

NÃO é responsável por:

- CORS (configurado no server.ts)
*/

export const CABECALHO_CSRF = "x-csrf-protection";

const METODOS_SEGUROS = new Set([
  "GET",
  "HEAD",
  "OPTIONS"
]);

export function exigirCabecalhoCsrf(
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (METODOS_SEGUROS.has(req.method)) {
    return next();
  }

  if (req.get(CABECALHO_CSRF) !== "1") {
    return res.status(403).json({
      erro: "Requisição bloqueada pela proteção CSRF."
    });
  }

  next();

}
