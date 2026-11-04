import { describe, it, expect, beforeAll, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";
import bcrypt from "bcryptjs";

import { configurarBanco } from "../../src/database/configurarBanco";
import { exigirCabecalhoCsrf } from "../../src/middlewares/csrfMiddleware";
import { autenticar, exigirAdmin } from "../../src/middlewares/authMiddleware";
import authRoutes from "../../src/routes/authRoutes";
import pessoaRoutes from "../../src/routes/pessoaRoutes";
import vacinaRoutes from "../../src/routes/vacinaRoutes";
import carteiraRoutes from "../../src/routes/carteiraRoutes";
import calendarioRoutes from "../../src/routes/calendarioRoutes";
import agendamentoRoutes from "../../src/routes/agendamentoRoutes";
import dependenteRoutes from "../../src/routes/dependenteRoutes";
import grupoEspecialPessoaRoutes from "../../src/routes/grupoEspecialPessoaRoutes";
import vacinalRoutes from "../../src/routes/vacinalRoutes";
import usuarioRoutes from "../../src/routes/usuarioRoutes";
import regraVacinalRoutes from "../../src/routes/regraVacinalRoutes";
import * as usuarioRepository from "../../src/repositories/usuarioRepository";
import * as pessoaRepository from "../../src/repositories/pessoaRepository";
import { CarteiraService } from "../../src/services/carteiraService";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

/*
Mesma montagem de rotas do server.ts (middlewares na mesma ordem), para
testar a autorização como ela é na aplicação de verdade.
*/
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(exigirCabecalhoCsrf);
app.use("/auth", authRoutes);
app.use("/usuarios", autenticar, exigirAdmin, usuarioRoutes);
app.use("/pessoas", autenticar, pessoaRoutes);
app.use("/vacinas", vacinaRoutes);
app.use("/carteira", autenticar, carteiraRoutes);
app.use("/calendario", autenticar, calendarioRoutes);
app.use("/regras-vacinais", autenticar, exigirAdmin, regraVacinalRoutes);
app.use("/agendamentos", autenticar, agendamentoRoutes);
app.use("/pendencias", autenticar, vacinalRoutes);
app.use("/dependentes", autenticar, dependenteRoutes);
app.use("/grupos-especiais", autenticar, grupoEspecialPessoaRoutes);

const CSRF = { "X-CSRF-Protection": "1" };
const SENHA = "senhaSegura123";

let n = 0;
async function novoUsuario(perfil = "USUARIO") {
  const email = `authz${++n}@exemplo.com`;
  const id = await usuarioRepository.criarUsuario("Fulano", email, await bcrypt.hash(SENHA, 4), perfil, true);
  const res = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
  const cookies = ((res.headers["set-cookie"] as unknown as string[]) ?? []).map((c) => c.split(";")[0]);
  const pessoaId = await pessoaRepository.criarPessoa({
    usuario_id: id,
    nome: `Pessoa ${n}`,
    data_nascimento: "1990-01-01"
  } as any);
  return { id, cookies, pessoaId: Number(pessoaId) };
}

const comoUsuario = (u: { cookies: string[] }) => ({ Cookie: u.cookies, ...CSRF });

let A: Awaited<ReturnType<typeof novoUsuario>>;
let B: Awaited<ReturnType<typeof novoUsuario>>;
let ADM: Awaited<ReturnType<typeof novoUsuario>>;
let registroA: number;
let doseA: number;
let vacinaId: number;

beforeAll(async () => {
  await configurarBanco();
  A = await novoUsuario();
  B = await novoUsuario();
  ADM = await novoUsuario("ADMIN");
  const r = await CarteiraService.confirmarRegistroViaScan(A.pessoaId, {
    vacina: "BCG",
    dose: "Dose única",
    dataAplicacao: "2020-01-10",
    lote: "L1"
  });
  registroA = r.registroId;
  doseA = r.doseId;
  const vac = await request(app).get("/vacinas/ativas");
  vacinaId = vac.body[0].id;
});

describe("rotas administrativas expostas", () => {

  it("criar vacina exige login", async () => {
    const res = await request(app).post("/vacinas").set(CSRF).send({ codigo: "X1", nome: "Vacina Falsa" });
    expect([401, 403]).toContain(res.status);
  });

  it("usuário comum não cria vacina", async () => {
    const res = await request(app).post("/vacinas").set(comoUsuario(B)).send({ codigo: "X2", nome: "Vacina Falsa 2" });
    expect(res.status).toBe(403);
  });

  it("usuário comum não altera nem desativa vacina", async () => {
    const put = await request(app).put(`/vacinas/${vacinaId}`).set(comoUsuario(B)).send({ nome: "HACKEADA" });
    expect(put.status).toBe(403);
    const patch = await request(app).patch(`/vacinas/${vacinaId}/desativar`).set(comoUsuario(B));
    expect(patch.status).toBe(403);
  });

  it("usuário comum não altera o calendário vacinal", async () => {
    const post = await request(app).post("/calendario").set(comoUsuario(B)).send({ vacina_id: vacinaId, faixa_etaria: "adulto", idade_minima: 20, idade_maxima: 59, doses: 1 });
    expect(post.status).toBe(403);
    const del = await request(app).delete("/calendario/1").set(comoUsuario(B));
    expect(del.status).toBe(403);
    const put = await request(app).put("/calendario/1").set(comoUsuario(B)).send({ doses: 99 });
    expect(put.status).toBe(403);
  });

  it("administrador continua podendo gerir vacinas e calendário", async () => {
    const res = await request(app).get("/calendario/1").set(comoUsuario(ADM));
    expect(res.status).toBe(200);
  });

});

describe("IDOR em /pessoas", () => {

  it("outro usuário não lê os dados de uma pessoa alheia", async () => {
    const res = await request(app).get(`/pessoas/${A.pessoaId}`).set(comoUsuario(B));
    expect(res.status).toBe(403);
  });

  it("outro usuário não altera nem remove uma pessoa alheia", async () => {
    const put = await request(app).put(`/pessoas/${A.pessoaId}`).set(comoUsuario(B)).send({ nome: "Invadido", data_nascimento: "1990-01-01" });
    expect(put.status).toBe(403);
    const del = await request(app).delete(`/pessoas/${A.pessoaId}`).set(comoUsuario(B));
    expect(del.status).toBe(403);
    const ainda = await request(app).get(`/pessoas/${A.pessoaId}`).set(comoUsuario(A));
    expect(ainda.status).toBe(200);
    expect(ainda.body.nome).not.toBe("Invadido");
  });

  it("listar pessoas não vaza as de outras contas", async () => {
    const res = await request(app).get("/pessoas").set(comoUsuario(B));
    if (res.status === 200) {
      const ids = (res.body as any[]).map((p) => p.id);
      expect(ids).not.toContain(A.pessoaId);
    } else {
      expect(res.status).toBe(403);
    }
  });

  it("não cria pessoa em nome de outra conta", async () => {
    const res = await request(app).post("/pessoas").set(comoUsuario(B)).send({ usuario_id: A.id, nome: "Intrusa", data_nascimento: "2000-01-01" });
    expect(res.status).toBe(201);
    // o usuario_id do corpo é ignorado: a pessoa nasce na conta de quem fez a requisição
    const criada = await request(app).get(`/pessoas/${res.body.id}`).set(comoUsuario(B));
    expect(criada.status).toBe(200);
    expect(criada.body.usuario_id).toBe(B.id);
    const naContaDeA = await request(app).get(`/pessoas/${res.body.id}`).set(comoUsuario(A));
    expect(naContaDeA.status).toBe(403);
  });

  it("dono acessa a própria pessoa", async () => {
    const res = await request(app).get(`/pessoas/${A.pessoaId}`).set(comoUsuario(A));
    expect(res.status).toBe(200);
  });

});

describe("IDOR na carteira", () => {

  it("não registra dose na carteira de outra pessoa", async () => {
    const res = await request(app).post("/carteira/dose").set(comoUsuario(B)).send({ registroVacinacaoId: registroA, registroId: registroA, numeroDose: 2, tipo: "2ª dose" });
    expect(res.status).toBe(403);
  });

  it("não lê nem conta as doses de um registro alheio", async () => {
    const lista = await request(app).get(`/carteira/registro/${registroA}/doses`).set(comoUsuario(B));
    expect(lista.status).toBe(403);
    const conta = await request(app).get(`/carteira/registro/${registroA}/contar-doses`).set(comoUsuario(B));
    expect(conta.status).toBe(403);
  });

  it("não remove dose nem registro alheios", async () => {
    const dose = await request(app).delete(`/carteira/dose/${doseA}`).set(comoUsuario(B));
    expect(dose.status).toBe(403);
    const registro = await request(app).delete(`/carteira/registro/${registroA}`).set(comoUsuario(B));
    expect(registro.status).toBe(403);
    const ainda = await request(app).get(`/carteira/registro/${registroA}/doses`).set(comoUsuario(A));
    expect(ainda.status).toBe(200);
    expect(ainda.body.length).toBeGreaterThan(0);
  });

  it("o dono continua acessando", async () => {
    const res = await request(app).get(`/carteira/pessoa/${A.pessoaId}`).set(comoUsuario(A));
    expect(res.status).toBe(200);
  });

});

describe("IDOR em dependentes, grupos e pendências", () => {

  it("não vê pendências, dependentes nem grupos de pessoa alheia", async () => {
    for (const rota of [`/pendencias/${A.pessoaId}`, `/dependentes/${A.pessoaId}`, `/grupos-especiais/pessoa/${A.pessoaId}`]) {
      const res = await request(app).get(rota).set(comoUsuario(B));
      expect([403, 404], rota).toContain(res.status);
    }
  });

  it("não agenda vacina para pessoa alheia", async () => {
    const res = await request(app).post("/agendamentos").set(comoUsuario(B)).send({ pessoaId: A.pessoaId, vacinaId, numeroDose: 1, dataPrevista: "2099-01-01" });
    expect(res.status).toBe(403);
  });

});
