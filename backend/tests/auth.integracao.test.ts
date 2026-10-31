import { describe, it, expect, beforeAll, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import bcrypt from "bcryptjs";

import { db } from "../src/database/database";
import { configurarBanco } from "../src/database/configurarBanco";
import authRoutes from "../src/routes/authRoutes";
import { exigirCabecalhoCsrf } from "../src/middlewares/csrfMiddleware";
import { autenticar } from "../src/middlewares/authMiddleware";
import { NotificacaoService } from "../src/services/notificacaoService";
import * as usuarioRepository from "../src/repositories/usuarioRepository";

/*
Os limitadores de taxa são cobertos por configuração; aqui
viram passagem direta para não interferir nos cenários
(todos os testes saem do mesmo IP).
*/
vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

const CSRF = { "X-CSRF-Protection": "1" };
const SENHA = "senhaSegura123";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(exigirCabecalhoCsrf);
app.use("/auth", authRoutes);
app.get("/protegida", autenticar, (req, res) => {
  res.json({ ok: true });
});

let contador = 0;

async function criarUsuario() {
  const email = `teste${++contador}@exemplo.com`;
  const id = await usuarioRepository.criarUsuario(
    "Teste",
    email,
    await bcrypt.hash(SENHA, 4),
    "USUARIO",
    true
  );
  return { id, email };
}

function cookiesDe(res: request.Response): string[] {
  return ((res.headers["set-cookie"] as unknown as string[]) ?? [])
    .map((c) => c.split(";")[0]);
}

function valorDoCookie(cookies: string[], nome: string) {
  return cookies.find((c) => c.startsWith(`${nome}=`));
}

function sql(consulta: string, params: any[] = []) {
  return new Promise<void>((resolve, reject) =>
    db.run(consulta, params, (e) => (e ? reject(e) : resolve()))
  );
}

async function login(email: string, senha = SENHA) {
  return request(app).post("/auth/login").set(CSRF).send({ email, senha });
}

beforeAll(async () => {
  await configurarBanco();
});

describe("CSRF", () => {

  it("recusa POST sem o cabeçalho de proteção", async () => {
    const { email } = await criarUsuario();
    const res = await request(app).post("/auth/login").send({ email, senha: SENHA });
    expect(res.status).toBe(403);
  });

  it("não exige o cabeçalho em GET", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });

});

describe("sessões", () => {

  it("login abre sessão com cookie de acesso e de refresh", async () => {
    const { email } = await criarUsuario();
    const res = await login(email);
    const cookies = cookiesDe(res);

    expect(res.status).toBe(200);
    expect(valorDoCookie(cookies, "token")).toBeTruthy();
    expect(valorDoCookie(cookies, "refresh_token")).toBeTruthy();
    expect(
      (res.headers["set-cookie"] as unknown as string[]).every((c) => /HttpOnly/i.test(c))
    ).toBe(true);

    const rota = await request(app).get("/protegida").set("Cookie", cookies);
    expect(rota.status).toBe(200);
  });

  it("logout revoga a sessão: o token antigo para de funcionar na hora", async () => {
    const { email } = await criarUsuario();
    const cookies = cookiesDe(await login(email));

    const logout = await request(app).post("/auth/logout").set(CSRF).set("Cookie", cookies);
    expect(logout.status).toBe(200);

    const reaproveitado = await request(app).get("/protegida").set("Cookie", cookies);
    expect(reaproveitado.status).toBe(401);

    const refresh = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", cookies);
    expect(refresh.status).toBe(401);
  });

  it("refresh rotaciona o token e detecta o reuso do antigo", async () => {
    const { email } = await criarUsuario();
    const inicial = cookiesDe(await login(email));

    const renovado = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", inicial);
    expect(renovado.status).toBe(200);

    const novos = cookiesDe(renovado);
    expect(valorDoCookie(novos, "refresh_token")).not.toBe(valorDoCookie(inicial, "refresh_token"));

    // Reuso imediato do token antigo = corrida entre abas: recusa, mas não revoga.
    const corrida = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", inicial);
    expect(corrida.status).toBe(409);

    const aindaValido = await request(app).get("/protegida").set("Cookie", novos);
    expect(aindaValido.status).toBe(200);

    // Reuso depois da janela de tolerância = token copiado: revoga a sessão inteira.
    await sql("UPDATE sessoes SET rotacionado_em = datetime('now', '-1 minute')");

    const roubo = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", inicial);
    expect(roubo.status).toBe(401);

    const revogada = await request(app).get("/protegida").set("Cookie", novos);
    expect(revogada.status).toBe(401);
  });

  it("lista dispositivos e permite sair de todos", async () => {
    const { email } = await criarUsuario();
    const a = cookiesDe(await login(email));
    const b = cookiesDe(await login(email));

    const lista = await request(app).get("/auth/sessoes").set("Cookie", a);
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(2);
    expect(lista.body.filter((s: any) => s.atual)).toHaveLength(1);

    const sairTodos = await request(app)
      .post("/auth/sessoes/encerrar-todas")
      .set(CSRF)
      .set("Cookie", a)
      .send({});
    expect(sairTodos.status).toBe(200);

    expect((await request(app).get("/protegida").set("Cookie", a)).status).toBe(401);
    expect((await request(app).get("/protegida").set("Cookie", b)).status).toBe(401);
  });

  it("não deixa encerrar a sessão de outro usuário", async () => {
    const dono = await criarUsuario();
    const outro = await criarUsuario();
    const cookiesDono = cookiesDe(await login(dono.email));
    const cookiesOutro = cookiesDe(await login(outro.email));

    const alvo = (await request(app).get("/auth/sessoes").set("Cookie", cookiesDono)).body[0];

    const res = await request(app)
      .delete(`/auth/sessoes/${alvo.id}`)
      .set(CSRF)
      .set("Cookie", cookiesOutro);
    expect(res.status).toBe(404);

    expect((await request(app).get("/protegida").set("Cookie", cookiesDono)).status).toBe(200);
  });

});

describe("bloqueio de conta", () => {

  it("bloqueia após 5 falhas seguidas, mesmo com a senha certa", async () => {
    const { email } = await criarUsuario();

    for (let i = 0; i < 5; i++) {
      const res = await login(email, "senhaErrada!");
      expect(res.status).toBe(401);
    }

    const bloqueado = await login(email, SENHA);
    expect(bloqueado.status).toBe(429);
  });

});

describe("recuperação de senha", () => {

  it("troca a senha com link de uso único e derruba as sessões", async () => {
    const espiao = vi
      .spyOn(NotificacaoService, "notificarRedefinicaoSenha")
      .mockResolvedValue(undefined as any);
    const aviso = vi
      .spyOn(NotificacaoService, "notificarSenhaAlterada")
      .mockResolvedValue(undefined as any);

    const { email } = await criarUsuario();
    const cookies = cookiesDe(await login(email));

    const pedido = await request(app).post("/auth/esqueci-senha").set(CSRF).send({ email });
    expect(pedido.status).toBe(200);
    expect(espiao).toHaveBeenCalledTimes(1);

    const link = espiao.mock.calls[0][2] as string;
    const token = new URL(link).searchParams.get("token")!;

    const fraca = await request(app)
      .post("/auth/redefinir-senha").set(CSRF).send({ token, senha: "123" });
    expect(fraca.status).toBe(400);

    const ok = await request(app)
      .post("/auth/redefinir-senha").set(CSRF).send({ token, senha: "novaSenha456" });
    expect(ok.status).toBe(200);
    expect(aviso).toHaveBeenCalledTimes(1);

    expect((await request(app).get("/protegida").set("Cookie", cookies)).status).toBe(401);
    expect((await login(email, SENHA)).status).toBe(401);
    expect((await login(email, "novaSenha456")).status).toBe(200);

    const reuso = await request(app)
      .post("/auth/redefinir-senha").set(CSRF).send({ token, senha: "outraSenha789" });
    expect(reuso.status).toBe(400);
  });

  it("responde igual para e-mail inexistente (sem enumeração de contas)", async () => {
    const existente = await criarUsuario();

    const a = await request(app).post("/auth/esqueci-senha").set(CSRF).send({ email: existente.email });
    const b = await request(app).post("/auth/esqueci-senha").set(CSRF).send({ email: "naoexiste@exemplo.com" });

    expect(a.status).toBe(b.status);
    expect(a.body).toEqual(b.body);
  });

  it("recusa token inválido ou expirado", async () => {
    const res = await request(app)
      .post("/auth/redefinir-senha").set(CSRF).send({ token: "inventado", senha: "novaSenha456" });
    expect(res.status).toBe(400);
  });

});
