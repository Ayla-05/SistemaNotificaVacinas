import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/authService";

/*
==================================================
AUTH MIDDLEWARE
==================================================

Responsabilidades:

- Ler o token JWT do cookie httpOnly
- Validar o token e conferir se a sessão segue ativa
- Anexar o usuário autenticado à requisição

NÃO é responsável por:

- Emitir tokens
- Regras de autorização por recurso
  (isso fica com pessoaPertenceAoUsuario)

Dependências:

- AuthService
*/

/*
Extensão do tipo Request para carregar os dados
do usuário autenticado nas próximas camadas.
*/
declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
      perfilUsuario?: string;
      sessaoId?: string;
    }
  }
}

export async function autenticar(
  req: Request,
  res: Response,
  next: NextFunction
) {

  const token =
    req.cookies?.token;

  if (!token) {

    return res.status(401).json({
      erro: "Não autenticado."
    });

  }

  try {

    const payload =
      AuthService.verificarToken(
        token
      );

    /*
    O JWT sozinho não basta: a sessão precisa continuar
    ativa no servidor (logout e "sair de todos" valem na hora).
    */
    const ativa =
      await AuthService.sessaoEstaAtiva(
        payload.sid,
        payload.usuarioId
      );

    if (!ativa) {
      return res.status(401).json({
        erro: "Sessão inválida ou expirada."
      });
    }

    req.usuarioId =
      payload.usuarioId;

    req.perfilUsuario =
      payload.perfil;

    req.sessaoId =
      payload.sid;

    next();

  } catch {

    return res.status(401).json({
      erro: "Sessão inválida ou expirada."
    });

  }

}

/*
==================================================
EXIGIR PERFIL ADMIN
==================================================

Usado em rotas administrativas
(gestão de vacinas, calendário, regras, etc).
*/
export function exigirAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {

  if (req.perfilUsuario !== "ADMIN") {

    return res.status(403).json({
      erro: "Acesso restrito a administradores."
    });

  }

  next();

}
