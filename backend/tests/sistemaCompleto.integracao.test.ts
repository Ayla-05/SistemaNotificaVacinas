import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import app from "../src/server";
import { configurarBanco } from "../src/database/configurarBanco";
import * as usuarioRepository from "../src/repositories/usuarioRepository";
import { NotificacaoService } from "../src/services/notificacaoService";

/*
Teste de ponta a ponta do app inteiro (server.ts): CSRF, autenticação,
autorização por perfil e por posse, e os fluxos principais de cada módulo.
*/

const CSRF = { "X-CSRF-Protection": "1" };
const SENHA = "senhaSegura123";

let contador = 0;

async function novoUsuario(perfil = "USUARIO") {
  const email = `e2e${++contador}@exemplo.com`;
  const id = await usuarioRepository.criarUsuario(
    `Usuario ${contador}`, email, await bcrypt.hash(SENHA, 4), perfil, true
  );
  const res = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
  const cookies = ((res.headers["set-cookie"] as unknown as string[]) ?? []).map((c) => c.split(";")[0]);
  return { id, email, cookies };
}

type Sessao = Awaited<ReturnType<typeof novoUsuario>>;

const get = (s: Sessao | null, url: string) =>
  s ? request(app).get(url).set("Cookie", s.cookies) : request(app).get(url);
const enviar = (m: "post" | "put" | "patch" | "delete", s: Sessao | null, url: string, corpo?: object) => {
  const r = request(app)[m](url).set(CSRF);
  if (s) r.set("Cookie", s.cookies);
  return corpo ? r.send(corpo) : r;
};

async function criarPessoa(s: Sessao, nome = "Pessoa Teste", nasc = "1990-05-14") {
  const res = await enviar("post", s, "/pessoas", { usuario_id: s.id, nome, data_nascimento: nasc });
  return res;
}

let admin: Sessao;
let ana: Sessao;
let bia: Sessao;
let anaPessoaId: number;
let biaPessoaId: number;
let vacinaId: number;

beforeAll(async () => {
  vi.spyOn(NotificacaoService, "notificarRegistroDose").mockResolvedValue(undefined as any);
  await configurarBanco();
  admin = await novoUsuario("ADMIN");
  ana = await novoUsuario();
  bia = await novoUsuario();
  anaPessoaId = (await criarPessoa(ana, "Ana")).body.id;
  biaPessoaId = (await criarPessoa(bia, "Bia")).body.id;
  const vacinas = await get(null, "/vacinas/ativas");
  vacinaId = vacinas.body[0].id;
});

describe("saúde e rotas básicas", () => {
  it("GET / responde ONLINE", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ONLINE");
  });

  it("rota inexistente devolve 404 em JSON", async () => {
    const res = await request(app).get("/nao-existe");
    expect(res.status).toBe(404);
    expect(res.body.erro).toMatch(/não encontrada/i);
  });

  it("envia cabeçalhos de segurança", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toMatch(/default-src 'none'/);
  });

  it.each([
    ["/usuarios"], ["/pessoas"], ["/carteira/pessoa/1"], ["/calendario"],
    ["/regras-vacinais"], ["/agendamentos"], ["/pendencias/1"], ["/grupos-especiais"]
  ])("%s exige login", async (rota) => {
    expect((await get(null, rota)).status).toBe(401);
  });
});

describe("cadastro público e confirmação de e-mail", () => {
  it("registra, bloqueia login sem confirmar e confirma com o código", async () => {
    const email = `novo${Date.now()}@exemplo.com`;
    const reg = await request(app).post("/auth/registrar").set(CSRF)
      .send({ nome: "Novo", email, senha: SENHA, dataNascimento: "1995-04-02" });
    expect(reg.status).toBe(201);
    const codigo = (await usuarioRepository.buscarUsuarioPorEmail(email) as any).codigo_verificacao;

    const semConfirmar = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
    expect(semConfirmar.status).toBeGreaterThanOrEqual(400);
    expect(semConfirmar.status).toBeLessThan(500);

    const errado = await request(app).post("/auth/confirmar-email").set(CSRF)
      .send({ email, codigo: "000000" === codigo ? "111111" : "000000" });
    expect(errado.status).toBe(400);

    expect(codigo).toMatch(/^\d{6}$/);
    const ok = await request(app).post("/auth/confirmar-email").set(CSRF).send({ email, codigo });
    expect(ok.status).toBe(200);

    const logado = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
    expect(logado.status).toBe(200);
  });

  it("recusa senha curta e e-mail inválido", async () => {
    const curta = await request(app).post("/auth/registrar").set(CSRF)
      .send({ nome: "X", email: "curta@exemplo.com", senha: "123" });
    expect(curta.status).toBe(400);
    const invalido = await request(app).post("/auth/registrar").set(CSRF)
      .send({ nome: "X", email: "nao-e-email", senha: SENHA });
    expect(invalido.status).toBe(400);
  });

  it("login com senha errada devolve 401", async () => {
    const res = await request(app).post("/auth/login").set(CSRF)
      .send({ email: ana.email, senha: "errada-errada" });
    expect(res.status).toBe(401);
  });

  it("/auth/me devolve o usuário logado", async () => {
    const res = await get(ana, "/auth/me");
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain(ana.email);
    expect(JSON.stringify(res.body)).not.toMatch(/senha/i);
  });
});

describe("usuários (somente admin)", () => {
  it("usuário comum não acessa /usuarios", async () => {
    expect((await get(ana, "/usuarios")).status).toBe(403);
  });

  it("admin lista, busca, cria, atualiza e desativa", async () => {
    expect((await get(admin, "/usuarios")).status).toBe(200);
    const criado = await enviar("post", admin, "/usuarios", {
      nome: "Criado", email: `criado${Date.now()}@exemplo.com`, senha: SENHA
    });
    expect(criado.status).toBe(201);
    const id = criado.body.id;
    expect((await get(admin, `/usuarios/${id}`)).status).toBe(200);
    expect((await enviar("put", admin, `/usuarios/${id}`, {
      nome: "Renomeado", email: `ren${Date.now()}@exemplo.com`
    })).status).toBe(200);
    expect((await enviar("patch", admin, `/usuarios/${id}/desativar`)).status).toBe(200);
    expect((await enviar("patch", admin, `/usuarios/${id}/ativar`)).status).toBe(200);
    expect((await enviar("delete", admin, `/usuarios/${id}`)).status).toBe(200);
  });

  it("listagem de usuários não vaza hash de senha", async () => {
    const res = await get(admin, "/usuarios");
    expect(JSON.stringify(res.body)).not.toMatch(/\$2[aby]\$/);
  });

  it("recusa e-mail duplicado", async () => {
    const res = await enviar("post", admin, "/usuarios", {
      nome: "Dup", email: ana.email, senha: SENHA
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe("pessoas", () => {
  it("cria e busca a própria pessoa", async () => {
    const res = await get(ana, `/pessoas/${anaPessoaId}`);
    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Ana");
  });

  it("recusa pessoa sem nome ou sem data de nascimento", async () => {
    expect((await enviar("post", ana, "/pessoas", { usuario_id: ana.id, nome: "", data_nascimento: "2000-01-01" })).status).toBe(400);
    expect((await enviar("post", ana, "/pessoas", { usuario_id: ana.id, nome: "X" })).status).toBe(400);
  });

  it("recusa frequência de aviso inválida", async () => {
    const res = await enviar("put", ana, `/pessoas/${anaPessoaId}`, { frequencia_aviso: "SEMPRE" });
    expect(res.status).toBe(400);
  });

  it("PUT parcial preserva os demais campos", async () => {
    await enviar("put", ana, `/pessoas/${anaPessoaId}`, { telefone: "11999999999" });
    const res = await get(ana, `/pessoas/${anaPessoaId}`);
    expect(res.body.telefone).toBe("11999999999");
    expect(res.body.nome).toBe("Ana");
  });

  it("usuário comum não lista todas as pessoas do sistema", async () => {
    const res = await get(ana, "/pessoas");
    const nomes = JSON.stringify(res.body);
    expect(nomes).not.toContain("Bia");
  });

  it("não lê pessoa de outro usuário (IDOR)", async () => {
    expect((await get(ana, `/pessoas/${biaPessoaId}`)).status).toBe(403);
  });

  it("não altera pessoa de outro usuário", async () => {
    const res = await enviar("put", ana, `/pessoas/${biaPessoaId}`, { nome: "Hackeada" });
    expect(res.status).toBe(403);
    expect((await get(bia, `/pessoas/${biaPessoaId}`)).body.nome).toBe("Bia");
  });

  it("não remove pessoa de outro usuário", async () => {
    expect((await enviar("delete", ana, `/pessoas/${biaPessoaId}`)).status).toBe(403);
  });

  it("não cria pessoa em nome de outro usuário", async () => {
    const res = await enviar("post", ana, "/pessoas", {
      usuario_id: bia.id, nome: "Intrusa", data_nascimento: "2000-01-01"
    });
    expect(res.status).toBe(403);
  });

  it("não lista pessoas de outro usuário", async () => {
    expect((await get(ana, `/pessoas/usuario/${bia.id}`)).status).toBe(403);
    expect((await get(ana, `/pessoas/usuario/${ana.id}`)).status).toBe(200);
  });

  it("admin acessa qualquer pessoa", async () => {
    expect((await get(admin, `/pessoas/${biaPessoaId}`)).status).toBe(200);
  });
});

describe("vacinas e calendário (catálogo)", () => {
  it("lista vacinas publicamente e busca por id/código/nome", async () => {
    const lista = await get(null, "/vacinas");
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(5);
    const v = lista.body[0];
    expect((await get(null, `/vacinas/${v.id}`)).status).toBe(200);
    expect((await get(null, `/vacinas/codigo/${v.codigo}`)).status).toBe(200);
    expect((await get(null, `/vacinas/nome/${encodeURIComponent(v.nome)}`)).status).toBe(200);
  });

  it("vacina inexistente devolve 404", async () => {
    expect((await get(null, "/vacinas/999999")).status).toBe(404);
  });

  it("anônimo não cria vacina", async () => {
    const res = await enviar("post", null, "/vacinas", { codigo: "ANON", nome: "Anonima", descricao: "x" });
    expect([401, 403]).toContain(res.status);
  });

  it("usuário comum não cria, edita nem desativa vacina", async () => {
    expect((await enviar("post", ana, "/vacinas", { codigo: "COMUM", nome: "Comum", descricao: "x" })).status).toBe(403);
    expect((await enviar("put", ana, `/vacinas/${vacinaId}`, { nome: "Hack", descricao: "x" })).status).toBe(403);
    expect((await enviar("patch", ana, `/vacinas/${vacinaId}/desativar`)).status).toBe(403);
  });

  it("admin cria, edita e desativa vacina", async () => {
    const codigo = `T${Date.now()}`;
    const c = await enviar("post", admin, "/vacinas", { codigo, nome: `Teste ${codigo}`, descricao: "d" });
    expect(c.status).toBe(201);
    expect((await enviar("put", admin, `/vacinas/${c.body.id}`, { nome: `Teste ${codigo} v2`, descricao: "d2" })).status).toBe(200);
    expect((await enviar("patch", admin, `/vacinas/${c.body.id}/desativar`)).status).toBe(200);
    const ativas = await get(null, "/vacinas/ativas");
    expect(ativas.body.some((x: any) => x.id === c.body.id)).toBe(false);
  });

  it("admin não cria vacina com código duplicado", async () => {
    const lista = await get(null, "/vacinas");
    const res = await enviar("post", admin, "/vacinas", { codigo: lista.body[0].codigo, nome: "Outra", descricao: "d" });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("calendário é legível por logados, mas só admin altera", async () => {
    const lista = await get(ana, "/calendario");
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(0);
    const id = lista.body[0].id;
    expect((await get(ana, `/calendario/${id}`)).status).toBe(200);
    expect((await get(ana, `/calendario/vacina/${vacinaId}`)).status).toBe(200);
    expect((await enviar("post", ana, "/calendario", { vacinaId, faixaEtaria: "ADULTO", idadeMinima: 18, idadeMaxima: 60, doses: 1 })).status).toBe(403);
    expect((await enviar("put", ana, `/calendario/${id}`, { observacao: "hack" })).status).toBe(403);
    expect((await enviar("delete", ana, `/calendario/${id}`)).status).toBe(403);
  });

  it("regras vacinais: usuário comum 403, admin lista", async () => {
    expect((await get(ana, "/regras-vacinais")).status).toBe(403);
    expect((await get(admin, "/regras-vacinais")).status).toBe(200);
  });
});

describe("carteira vacinal", () => {
  let registroId: number;
  let doseId: number;

  it("registra vacina, dose e lista a carteira", async () => {
    const reg = await enviar("post", ana, "/carteira/registro", { pessoaId: anaPessoaId, vacinaId });
    expect(reg.status).toBe(201);
    registroId = reg.body.id;

    const dose = await enviar("post", ana, "/carteira/dose", { registroVacinacaoId: registroId, numeroDose: 1, tipo: "DOSE" });
    expect(dose.status).toBe(201);
    doseId = dose.body.id;

    const carteira = await get(ana, `/carteira/pessoa/${anaPessoaId}`);
    expect(carteira.status).toBe(200);
    expect(carteira.body.length).toBe(1);
    expect((await get(ana, `/carteira/registro/${registroId}/doses`)).body.length).toBe(1);
    expect((await get(ana, `/carteira/registro/${registroId}/contar-doses`)).body.total ?? 1).toBe(1);
  });

  it("recusa vacina e dose duplicadas", async () => {
    expect((await enviar("post", ana, "/carteira/registro", { pessoaId: anaPessoaId, vacinaId })).status).toBe(400);
    expect((await enviar("post", ana, "/carteira/dose", { registroVacinacaoId: registroId, numeroDose: 1, tipo: "DOSE" })).status).toBe(400);
  });

  it("não lê a carteira de outra pessoa", async () => {
    expect((await get(bia, `/carteira/pessoa/${anaPessoaId}`)).status).toBe(403);
  });

  it("não lê doses do registro de outro usuário", async () => {
    expect((await get(bia, `/carteira/registro/${registroId}/doses`)).status).toBe(403);
    expect((await get(bia, `/carteira/registro/${registroId}/contar-doses`)).status).toBe(403);
  });

  it("não registra dose no registro de outro usuário", async () => {
    const res = await enviar("post", bia, "/carteira/dose", { registroVacinacaoId: registroId, numeroDose: 2, tipo: "DOSE" });
    expect(res.status).toBe(403);
  });

  it("não remove dose nem registro de outro usuário", async () => {
    expect((await enviar("delete", bia, `/carteira/dose/${doseId}`)).status).toBe(403);
    expect((await enviar("delete", bia, `/carteira/registro/${registroId}`)).status).toBe(403);
    expect((await get(ana, `/carteira/registro/${registroId}/doses`)).body.length).toBe(1);
  });

  it("confirmar-scan grava o registro lido", async () => {
    const lista = await get(null, "/vacinas");
    const outra = lista.body.find((v: any) => v.id !== vacinaId);
    const res = await enviar("post", ana, "/carteira/confirmar-scan", {
      pessoaId: anaPessoaId, vacina: outra.nome, dose: "1ª dose",
      dataAplicacao: "2023-02-10", lote: "L1", localAplicacao: "UBS"
    });
    expect(res.status).toBe(201);
  });

  it("dono remove a própria dose e o próprio registro", async () => {
    expect((await enviar("delete", ana, `/carteira/dose/${doseId}`)).status).toBe(200);
    expect((await enviar("delete", ana, `/carteira/registro/${registroId}`)).status).toBe(200);
  });

  it("registro com pessoa inexistente falha", async () => {
    expect((await enviar("post", admin, "/carteira/registro", { pessoaId: 999999, vacinaId })).status).toBeGreaterThanOrEqual(400);
  });
});

describe("agendamentos", () => {
  let agId: number;

  it("cria, lista, atualiza status/observação e conta", async () => {
    const c = await enviar("post", ana, "/agendamentos", {
      pessoaId: anaPessoaId, vacinaId, numeroDose: 1, dataPrevista: "2030-01-15", observacao: "obs"
    });
    expect(c.status).toBe(201);
    agId = c.body.id;
    expect((await get(ana, `/agendamentos/pessoa/${anaPessoaId}`)).body.length).toBeGreaterThan(0);
    expect((await get(ana, `/agendamentos/${agId}`)).status).toBe(200);
    expect((await enviar("patch", ana, `/agendamentos/${agId}/observacao`, { observacao: "nova" })).status).toBe(200);
    expect((await enviar("patch", ana, `/agendamentos/${agId}/status`, { status: "REALIZADA" })).status).toBe(200);
    expect((await get(ana, `/agendamentos/pessoa/${anaPessoaId}/total`)).status).toBe(200);
  });

  it("recusa status inválido", async () => {
    const res = await enviar("patch", ana, `/agendamentos/${agId}/status`, { status: "INVENTADO" });
    expect(res.status).toBe(400);
  });

  it("usuário comum não cria agendamento para outra pessoa", async () => {
    const res = await enviar("post", bia, "/agendamentos", {
      pessoaId: anaPessoaId, vacinaId, numeroDose: 1, dataPrevista: "2030-02-01"
    });
    expect(res.status).toBe(403);
  });

  it("não vê, altera nem remove agendamento alheio", async () => {
    expect((await get(bia, `/agendamentos/${agId}`)).status).toBe(403);
    expect((await enviar("patch", bia, `/agendamentos/${agId}/status`, { status: "CANCELADA" })).status).toBe(403);
    expect((await enviar("patch", bia, `/agendamentos/${agId}/observacao`, { observacao: "x" })).status).toBe(403);
    expect((await enviar("delete", bia, `/agendamentos/${agId}`)).status).toBe(403);
  });

  it("listagem geral não vaza agendamentos de outros usuários", async () => {
    const res = await get(bia, "/agendamentos");
    expect(JSON.stringify(res.body)).not.toContain(`"id":${agId},`);
  });

  it("dono remove o próprio agendamento", async () => {
    expect((await enviar("delete", ana, `/agendamentos/${agId}`)).status).toBe(200);
  });
});

describe("pendências e próximas doses", () => {
  it("devolve pendências e próximas doses da própria pessoa", async () => {
    expect((await get(ana, `/pendencias/${anaPessoaId}`)).status).toBe(200);
    expect((await get(ana, `/pendencias/${anaPessoaId}/proximas-doses`)).status).toBe(200);
  });

  it("nega pendências de outra pessoa", async () => {
    expect((await get(bia, `/pendencias/${anaPessoaId}`)).status).toBe(403);
    expect((await get(bia, `/pendencias/${anaPessoaId}/proximas-doses`)).status).toBe(403);
  });
});

describe("dependentes", () => {
  it("cadastra, lista e remove vínculo", async () => {
    const c = await enviar("post", ana, "/dependentes", {
      responsavelPessoaId: anaPessoaId, nome: "Filho", data_nascimento: "2022-03-10", parentesco: "FILHO"
    });
    expect(c.status).toBe(201);
    const lista = await get(ana, `/dependentes/pessoa/${anaPessoaId}`);
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(0);
    expect((await get(bia, `/dependentes/pessoa/${anaPessoaId}`)).status).toBe(403);
    const depId = c.body.id ?? c.body.dependenteId;
    expect((await enviar("delete", bia, `/dependentes/${anaPessoaId}/${depId}`)).status).toBe(403);
    expect((await enviar("delete", ana, `/dependentes/${anaPessoaId}/${depId}`)).status).toBe(200);
  });

  it("nega cadastrar dependente em pessoa alheia", async () => {
    const res = await enviar("post", bia, "/dependentes", {
      responsavelPessoaId: anaPessoaId, nome: "X", data_nascimento: "2022-03-10", parentesco: "FILHO"
    });
    expect(res.status).toBe(403);
  });
});

describe("grupos especiais", () => {
  it("lista catálogo, vincula, lista e desvincula", async () => {
    const cat = await get(ana, "/grupos-especiais");
    expect(cat.status).toBe(200);
    const g = cat.body[0].id;
    expect((await enviar("post", ana, `/grupos-especiais/pessoa/${anaPessoaId}`, { grupoEspecialId: g })).status).toBe(201);
    expect((await get(ana, `/grupos-especiais/pessoa/${anaPessoaId}`)).body.length).toBe(1);
    expect((await get(bia, `/grupos-especiais/pessoa/${anaPessoaId}`)).status).toBe(403);
    expect((await enviar("delete", ana, `/grupos-especiais/pessoa/${anaPessoaId}/${g}`)).status).toBe(200);
  });
});

describe("sessões", () => {
  it("lista sessões e encerra todas", async () => {
    const s = await novoUsuario();
    const lista = await get(s, "/auth/sessoes");
    expect(lista.status).toBe(200);
    expect(lista.body.length).toBeGreaterThan(0);
    expect((await enviar("post", s, "/auth/sessoes/encerrar-todas")).status).toBe(200);
    expect((await get(s, "/auth/me")).status).toBe(401);
  });
});
