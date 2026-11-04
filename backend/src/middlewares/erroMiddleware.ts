import { Request, Response, NextFunction } from "express";

/*
==================================================
TRATAMENTO DE ERROS (JSON)
==================================================

Corpo malformado ou grande demais chega aqui como erro do
body-parser. Sem este tratador, o Express responde com uma
página HTML que mostra o stack trace (caminhos do servidor).
Deve ser o ÚLTIMO middleware da aplicação.
*/
export function tratarErros(
  erro: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {

  if (erro?.type === "entity.too.large") {
    return res.status(413).json({
      erro: "Corpo da requisição grande demais."
    });
  }

  if (
    erro?.type === "entity.parse.failed" ||
    erro instanceof SyntaxError
  ) {
    return res.status(400).json({
      erro: "JSON inválido."
    });
  }

  console.error("Erro não tratado:", erro);

  return res.status(500).json({
    erro: "Erro interno do servidor."
  });

}
