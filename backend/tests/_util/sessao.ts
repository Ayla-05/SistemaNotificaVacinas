import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../../src/server";
import * as usuarioRepository from "../../src/repositories/usuarioRepository";

/*
Utilitários dos testes que usam o app inteiro (server.ts):
cria usuários já verificados, faz login e monta requisições
com cookie de sessão e cabeçalho CSRF.
*/

export const CSRF = { "X-CSRF-Protection": "1" };
export const SENHA = "senhaSegura123";

let contador = 0;

export async function novoUsuario(perfil = "USUARIO", prefixo = "t") {

  const email = `${prefixo}${++contador}.${Date.now()}@exemplo.com`;

  const id = await usuarioRepository.criarUsuario(
    `Usuario ${contador}`,
    email,
    await bcrypt.hash(SENHA, 4),
    perfil,
    true
  );

  const res = await request(app)
    .post("/auth/login")
    .set(CSRF)
    .send({ email, senha: SENHA });

  return { id, email, cookies: cookiesDe(res) };

}

export type Sessao = Awaited<ReturnType<typeof novoUsuario>>;

export function cookiesDe(res: request.Response): string[] {
  return ((res.headers["set-cookie"] as unknown as string[]) ?? [])
    .map((c) => c.split(";")[0]);
}

export const get = (s: Sessao | null, url: string) =>
  s
    ? request(app).get(url).set("Cookie", s.cookies)
    : request(app).get(url);

export function enviar(
  metodo: "post" | "put" | "patch" | "delete",
  s: Sessao | null,
  url: string,
  corpo?: object
) {

  const r = request(app)[metodo](url).set(CSRF);

  if (s) {
    r.set("Cookie", s.cookies);
  }

  return corpo ? r.send(corpo) : r;

}

export async function criarPessoa(
  s: Sessao,
  nome = "Pessoa Teste",
  nascimento = "1990-05-14"
) {
  return enviar("post", s, "/pessoas", {
    usuario_id: s.id,
    nome,
    data_nascimento: nascimento
  });
}
