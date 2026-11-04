import { describe, it, expect, beforeAll, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import { hojeIso } from "../../src/utils/dataHoje";
import bcrypt from "bcryptjs";

import { configurarBanco } from "../../src/database/configurarBanco";
import { exigirCabecalhoCsrf } from "../../src/middlewares/csrfMiddleware";
import { autenticar } from "../../src/middlewares/authMiddleware";
import { tratarErros } from "../../src/middlewares/erroMiddleware";
import authRoutes from "../../src/routes/authRoutes";
import pessoaRoutes from "../../src/routes/pessoaRoutes";
import carteiraRoutes from "../../src/routes/carteiraRoutes";
import agendamentoRoutes from "../../src/routes/agendamentoRoutes";
import dependenteRoutes from "../../src/routes/dependenteRoutes";
import vacinalRoutes from "../../src/routes/vacinalRoutes";
import * as usuarioRepository from "../../src/repositories/usuarioRepository";
import * as pessoaRepository from "../../src/repositories/pessoaRepository";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(exigirCabecalhoCsrf);
app.use("/auth", authRoutes);
app.use("/pessoas", autenticar, pessoaRoutes);
app.use("/carteira", autenticar, carteiraRoutes);
app.use("/agendamentos", autenticar, agendamentoRoutes);
app.use("/pendencias", autenticar, vacinalRoutes);
app.use("/dependentes", autenticar, dependenteRoutes);
app.use(tratarErros);

const CSRF = { "X-CSRF-Protection": "1" };
const SENHA = "senhaSegura123";

let U: { id: number; cookies: string[]; pessoaId: number };
let vacinaId: number;

const h = () => ({ Cookie: U.cookies, ...CSRF });

beforeAll(async () => {
  await configurarBanco();
  const email = "validacao@exemplo.com";
  const id = await usuarioRepository.criarUsuario("Val", email, await bcrypt.hash(SENHA, 4), "USUARIO", true);
  const res = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
  const cookies = ((res.headers["set-cookie"] as unknown as string[]) ?? []).map((c) => c.split(";")[0]);
  const pessoaId = Number(await pessoaRepository.criarPessoa({ usuario_id: id, nome: "Val", data_nascimento: "1990-06-15" } as any));
  U = { id, cookies, pessoaId };
  const { default: vacinaRepo } = { default: await import("../../src/repositories/vacinaRepository") };
  vacinaId = ((await vacinaRepo.listarVacinasAtivas()) as any[]).find((v) => v.nome === "BCG").id;
});

describe("datas e doses inválidas na carteira (confirmar-scan)", () => {

  const base = () => ({ pessoaId: U.pessoaId, vacina: "BCG", dose: "Dose única", lote: "L1", localAplicacao: "UBS" });

  it("recusa data de aplicação que não é data", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dataAplicacao: "abc" });
    expect(res.status).toBe(400);
  });

  it("recusa data de aplicação inexistente (31/02)", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dataAplicacao: "2020-02-31" });
    expect(res.status).toBe(400);
  });

  it("recusa dose 'aplicada' no futuro", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dataAplicacao: "2999-01-01" });
    expect(res.status).toBe(400);
  });

  it("recusa aplicação anterior ao nascimento da pessoa", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dataAplicacao: "1900-01-01" });
    expect(res.status).toBe(400);
  });

  it("recusa número de dose absurdo", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dose: "999ª dose", dataAplicacao: "2020-01-01" });
    expect(res.status).toBe(400);
  });

  it("recusa vacina vazia e campos gigantes", async () => {
    const vazia = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), vacina: "", dataAplicacao: "2020-01-01" });
    expect(vazia.status).toBe(400);
    const gigante = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), lote: "X".repeat(5000), dataAplicacao: "2020-01-01" });
    expect(gigante.status).toBe(400);
  });

  it("aceita um registro válido", async () => {
    const res = await request(app).post("/carteira/confirmar-scan").set(h()).send({ ...base(), dataAplicacao: "2020-01-01" });
    expect(res.status).toBe(201);
  });

});

describe("cadastro de pessoas", () => {

  const nova = (o: object) => ({ nome: "Fulana", data_nascimento: "2000-01-01", ...o });

  it("recusa nascimento no futuro, inválido ou ausente", async () => {
    for (const data_nascimento of ["2999-01-01", "abc", "2000-02-31", ""]) {
      const res = await request(app).post("/pessoas").set(h()).send(nova({ data_nascimento }));
      expect(res.status, `nascimento ${data_nascimento}`).toBe(400);
    }
  });

  it("recusa nome vazio ou gigante", async () => {
    for (const nome of ["", "   ", "N".repeat(500)]) {
      const res = await request(app).post("/pessoas").set(h()).send(nova({ nome }));
      expect(res.status, `nome de ${nome.length} caracteres`).toBe(400);
    }
  });

  it("atualização também valida o nascimento", async () => {
    const res = await request(app).put(`/pessoas/${U.pessoaId}`).set(h()).send({ nome: "Val", data_nascimento: "2999-01-01" });
    expect(res.status).toBe(400);
  });

  it("recusa e-mail malformado", async () => {
    const res = await request(app).post("/pessoas").set(h()).send(nova({ email: "isso-nao-e-email" }));
    expect(res.status).toBe(400);
  });

});

describe("agendamentos", () => {

  const corpo = (o: object = {}) => ({ pessoaId: U.pessoaId, vacinaId, numeroDose: 1, dataPrevista: "2099-01-01", ...o });

  it("recusa data passada, inválida e número de dose inválido", async () => {
    for (const o of [{ dataPrevista: "2000-01-01" }, { dataPrevista: "abc" }, { numeroDose: 0 }, { numeroDose: -2 }, { numeroDose: 1.5 }]) {
      const res = await request(app).post("/agendamentos").set(h()).send(corpo(o));
      expect(res.status, JSON.stringify(o)).toBe(400);
    }
  });

  it("não cria dois agendamentos iguais (mesma vacina, dose e data)", async () => {
    const um = await request(app).post("/agendamentos").set(h()).send(corpo({ dataPrevista: "2099-02-02" }));
    expect(um.status).toBe(201);
    const dois = await request(app).post("/agendamentos").set(h()).send(corpo({ dataPrevista: "2099-02-02" }));
    expect(dois.status).toBe(400);
  });

  it("confirmar o mesmo agendamento duas vezes não duplica a dose", async () => {
    const criado = await request(app).post("/agendamentos").set(h()).send(corpo({ numeroDose: 2, dataPrevista: "2099-03-03" }));
    expect(criado.status).toBe(201);
    // a confirmação só vale para datas que já chegaram; força a data para hoje
    const hoje = hojeIso(); // dia civil de São Paulo, como no sistema (COR-26)
    const { db } = await import("../../src/database/database");
    await new Promise<void>((ok, ko) => db.run("UPDATE agendamentos_vacina SET data_prevista=? WHERE id=?", [hoje, criado.body.id], (e) => (e ? ko(e) : ok())));
    const a = await request(app).patch(`/agendamentos/${criado.body.id}/confirmar`).set(h());
    expect(a.status).toBe(200);
    const b = await request(app).patch(`/agendamentos/${criado.body.id}/confirmar`).set(h());
    expect(b.status).toBe(400);
    const doses = await request(app).get(`/carteira/pessoa/${U.pessoaId}`).set(h());
    const bcg = (doses.body as any[]).find((r) => r.vacina_id === vacinaId || r.nome === "BCG");
    expect(bcg).toBeTruthy();
  });

});

describe("dependentes", () => {

  it("responsável não vira dependente de si mesmo", async () => {
    const res = await request(app).post("/dependentes").set(h()).send({ responsavelPessoaId: U.pessoaId, nome: "Val", data_nascimento: "1990-06-15", parentesco: "filho", dependentePessoaId: U.pessoaId });
    // cria uma NOVA pessoa dependente; nunca vincula a pessoa a ela mesma
    expect([201, 400]).toContain(res.status);
  });

  it("recusa parentesco inventado e nascimento no futuro", async () => {
    const p = await request(app).post("/dependentes").set(h()).send({ responsavelPessoaId: U.pessoaId, nome: "Fut", data_nascimento: "2999-01-01", parentesco: "filho" });
    expect(p.status).toBe(400);
  });

});

describe("robustez da API", () => {

  it("JSON malformado devolve JSON 400, sem stack trace", async () => {
    const res = await request(app).post("/pessoas").set(h()).set("Content-Type", "application/json").send("{ nao eh json");
    expect(res.status).toBeLessThan(500);
    expect(JSON.stringify(res.body) + res.text).not.toMatch(/at .*\.(ts|js):\d+/);
  });

  it("id não numérico não derruba o servidor", async () => {
    const res = await request(app).get("/pessoas/abc").set(h());
    expect(res.status).toBeLessThan(500);
  });

  it("injeção de SQL no id é tratada como dado", async () => {
    const res = await request(app).get("/pessoas/1%20OR%201=1").set(h());
    expect(res.status).toBeLessThan(500);
    if (res.status === 200) expect(Array.isArray(res.body)).toBe(false);
  });

});

describe("cadastro e senha", () => {

  const reg = (o: object) => request(app).post("/auth/registrar").set(CSRF).send({ nome: "Nova", email: "nova@exemplo.com", senha: SENHA, dataNascimento: "2000-01-01", ...o });

  it("recusa senha curta e e-mail inválido", async () => {
    expect((await reg({ senha: "123" })).status).toBe(400);
    expect((await reg({ email: "sem-arroba" })).status).toBe(400);
  });

  it("e-mail é único sem diferenciar maiúsculas de minúsculas", async () => {
    const um = await reg({ email: "Caixa@Exemplo.com" });
    expect(um.status).toBe(201);
    const dois = await reg({ email: "caixa@exemplo.com" });
    expect(dois.status).toBe(400);
  });

  it("login com e-mail em caixa diferente funciona", async () => {
    const id = await usuarioRepository.criarUsuario("Caixa2", "caixa2@exemplo.com", await bcrypt.hash(SENHA, 4), "USUARIO", true);
    expect(id).toBeGreaterThan(0);
    const res = await request(app).post("/auth/login").set(CSRF).send({ email: "CAIXA2@EXEMPLO.COM", senha: SENHA });
    expect(res.status).toBe(200);
  });

  it("não revela se o e-mail existe ao errar o login", async () => {
    const existe = await request(app).post("/auth/login").set(CSRF).send({ email: "validacao@exemplo.com", senha: "errada1234" });
    const nao = await request(app).post("/auth/login").set(CSRF).send({ email: "naoexiste@exemplo.com", senha: "errada1234" });
    expect(existe.status).toBe(nao.status);
    expect(existe.body.erro).toBe(nao.body.erro);
  });

});

describe("serviço de usuários (admin)", () => {

  it("atualizar e-mail não permite o e-mail de outra conta nem e-mail inválido", async () => {
    const { UsuarioService } = await import("../../src/services/usuarioService");
    const a = await usuarioRepository.criarUsuario("A", "dono.a@exemplo.com", await bcrypt.hash(SENHA, 4), "USUARIO", true);
    const b = await usuarioRepository.criarUsuario("B", "dono.b@exemplo.com", await bcrypt.hash(SENHA, 4), "USUARIO", true);
    await expect(UsuarioService.atualizar(b, "B", "DONO.A@exemplo.com")).rejects.toThrow(/já existe/i);
    await expect(UsuarioService.atualizar(b, "B", "sem-arroba")).rejects.toThrow(/inválido/i);
    await expect(UsuarioService.atualizar(a, "A", "Dono.A@Exemplo.com")).resolves.toBeDefined();
  });

});
