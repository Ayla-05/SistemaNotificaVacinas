import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import * as usuarioRepository from "../repositories/usuarioRepository";

/*
==================================================
AUTH SERVICE
==================================================

Responsabilidades:

- Validar credenciais de login
- Emitir e verificar tokens JWT

NÃO é responsável por:

- Requisições HTTP
- Cookies
- Cadastro de usuários

Dependências:

- usuarioRepository
- bcryptjs
- jsonwebtoken
*/

/*
Em produção o JWT_SECRET DEVE vir do .env.
Sem ele, o sistema não sobe — não faz sentido
assinar token de sessão com um segredo previsível.
*/
const JWT_SECRET =
  process.env.JWT_SECRET;

const JWT_EXPIRA_EM = "8h";

export interface TokenPayload {
  usuarioId: number;
  perfil: string;
}

export class AuthService {

  /*
  ==================================================
  LOGIN
  ==================================================

  Confere e-mail e senha (via bcrypt.compare,
  nunca comparando texto puro) e devolve um
  token JWT válido por 8 horas.
  */
  static async login(
    email: string,
    senha: string
  ) {

    if (!email?.trim() || !senha?.trim()) {
      throw new Error(
        "E-mail e senha são obrigatórios."
      );
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorEmail(
        email
      );

    /*
    Mensagem genérica de propósito: não revelar
    se o e-mail existe ou não (evita enumeração
    de usuários cadastrados).
    */
    const credenciaisInvalidas =
      "E-mail ou senha inválidos.";

    if (!usuario) {
      throw new Error(
        credenciaisInvalidas
      );
    }

    if (usuario.ativo === 0) {
      throw new Error(
        "Usuário desativado. Procure o administrador."
      );
    }

    const senhaConfere =
      await bcrypt.compare(
        senha,
        usuario.senha
      );

    if (!senhaConfere) {
      throw new Error(
        credenciaisInvalidas
      );
    }

    const token =
      this.gerarToken({
        usuarioId: usuario.id,
        perfil: usuario.perfil
      });

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil
      }
    };

  }

  /*
  ==================================================
  GERAR TOKEN
  ==================================================
  */
  static gerarToken(
    payload: TokenPayload
  ): string {

    if (!JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não configurado no servidor."
      );
    }

    return jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRA_EM
      }
    );

  }

  /*
  ==================================================
  VERIFICAR TOKEN
  ==================================================
  */
  static verificarToken(
    token: string
  ): TokenPayload {

    if (!JWT_SECRET) {
      throw new Error(
        "JWT_SECRET não configurado no servidor."
      );
    }

    return jwt.verify(
      token,
      JWT_SECRET
    ) as TokenPayload;

  }

}
