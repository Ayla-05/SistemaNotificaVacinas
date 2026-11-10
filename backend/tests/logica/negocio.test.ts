import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import { configurarBanco } from "../../src/database/configurarBanco";
import { hojeIso } from "../../src/utils/dataHoje";
import { adicionarMeses } from "../../src/utils/proximasDoses";
import { novoUsuario, get, enviar, criarPessoa, Sessao } from "../_util/sessao";

/*
Lógica de negócio de ponta a ponta: o que o usuário vê (pendências,
próximas doses, faixa etária) muda corretamente conforme os dados e
as regras; entradas inválidas são recusadas sem sujar o banco.
Códigos [LOG-nn] citados em docs/correcoes.md.
*/

let u: Sessao;
let outro: Sessao;
let catalogo: any[];

const vacinaPorCodigo = (codigo: string) => catalogo.find((v) => v.codigo === codigo);
const nomesDe = (lista: any[]) => lista.map((x) => x.vacina);

async function pessoa(nome: string, nascimento: string, dono = u) {
  return (await criarPessoa(dono, nome, nascimento)).body.id as number;
}

async function registrar(dono: Sessao, pessoaId: number, codigo: string, numeroDose: number) {
  let reg = (await get(dono, `/carteira/pessoa/${pessoaId}`)).body.find((r: any) => r.vacina_id === vacinaPorCodigo(codigo).id);
  if (!reg) {
    reg = (await enviar("post", dono, "/carteira/registro", { pessoaId, vacinaId: vacinaPorCodigo(codigo).id })).body;
  }
  return enviar("post", dono, "/carteira/dose", {
    registroVacinacaoId: reg.id, numeroDose, tipo: `${numeroDose}ª dose`
  });
}

beforeAll(async () => {
  await configurarBanco();
  u = await novoUsuario("USUARIO", "neg");
  outro = await novoUsuario("USUARIO", "neg");
  catalogo = (await get(null, "/vacinas")).body;
});

afterEach(() => vi.useRealTimers());

describe("pendências e próximas doses", () => {

  it("[LOG-01] adulto sem registros: pendente de Hepatite B e Febre Amarela, nada em dia", async () => {
    const id = await pessoa("Adulto Sem Registro", "1990-05-14");
    const r = (await get(u, `/pendencias/${id}`)).body;
    expect(r.faixa_etaria).toBe("ADULTO");
    expect(r.em_dia).toEqual([]);
    expect(nomesDe(r.pendentes)).toEqual(expect.arrayContaining(["Hepatite B", "Febre Amarela"]));
  });

  it("[LOG-02] o esquema avança dose a dose (Hepatite B, 3 doses) e só então fica em dia", async () => {
    const id = await pessoa("Adulto Hep B", "1990-05-14");
    const status = async () => {
      const r = (await get(u, `/pendencias/${id}`)).body;
      return {
        pendente: r.pendentes.find((x: any) => x.vacina === "Hepatite B"),
        emDia: r.em_dia.find((x: any) => x.vacina === "Hepatite B")
      };
    };
    expect((await status()).pendente.rotulo).toBe("1ª dose");
    for (const [n, proximo] of [[1, "2ª dose"], [2, "3ª dose"]] as const) {
      expect((await registrar(u, id, "HEPATITE_B", n)).status).toBe(201);
      const s = await status();
      expect(s.pendente.rotulo).toBe(proximo);
      expect(s.pendente.tomadas).toBe(n);
      expect(s.emDia).toBeUndefined();
    }
    await registrar(u, id, "HEPATITE_B", 3);
    const fim = await status();
    expect(fim.pendente).toBeUndefined();
    expect(fim.emDia).toMatchObject({ tomadas: 3, necessarias: 3 });
  });

  it("[LOG-02b] vacina de dose única (Febre Amarela) fica em dia com uma dose", async () => {
    const id = await pessoa("Adulto FA", "1990-05-14");
    await registrar(u, id, "FEBRE_AMARELA", 1);
    const r = (await get(u, `/pendencias/${id}`)).body;
    expect(nomesDe(r.pendentes)).not.toContain("Febre Amarela");
    expect(nomesDe(r.em_dia)).toContain("Febre Amarela");
  });

  it("[LOG-03] remover a dose devolve a vacina às pendências", async () => {
    const id = await pessoa("Adulto Remove", "1990-05-14");
    await registrar(u, id, "HEPATITE_B", 1);
    const reg = (await get(u, `/carteira/pessoa/${id}`)).body[0];
    await enviar("delete", u, `/carteira/registro/${reg.id}`);
    expect(nomesDe((await get(u, `/pendencias/${id}`)).body.pendentes)).toContain("Hepatite B");
  });

  it("[LOG-04] bebê é criança e tem esquema de dose inicial pendente", async () => {
    const id = await pessoa("Bebê", adicionarMeses(hojeIso(), -3));
    const r = (await get(u, `/pendencias/${id}`)).body;
    expect(r.faixa_etaria).toBe("CRIANCA");
    expect(r.idade).toBe(0);
    expect(r.pendentes.length).toBeGreaterThan(0);
  });

  it("[LOG-05] próximas doses: toda dose devolvida tem vacina, número e status válidos", async () => {
    const id = await pessoa("Para Proximas", adicionarMeses(hojeIso(), -7));
    const prox = (await get(u, `/pendencias/${id}/proximas-doses`)).body as any[];
    expect(prox.length).toBeGreaterThan(0);
    for (const d of prox) {
      expect(d.vacina).toBeTruthy();
      expect(Number.isInteger(d.numeroDose) && d.numeroDose >= 1).toBe(true);
      expect(["ATRASADA", "DISPONIVEL", "PROXIMA", "FUTURA", "EM_DIA", "SEM_REGISTRO"].concat(["VENCE_HOJE"])).toContain(d.status);
    }
  });

  it("[LOG-06] registrar a dose 1 faz a próxima dose da mesma vacina ser a 2 (nunca repete a 1)", async () => {
    const id = await pessoa("Bebe Penta", adicionarMeses(hojeIso(), -4));
    const antes = ((await get(u, `/pendencias/${id}/proximas-doses`)).body as any[]).find((d) => d.vacinaCodigo === "PENTAVALENTE");
    expect(antes?.numeroDose).toBe(1);
    await registrar(u, id, "PENTAVALENTE", 1);
    const depois = ((await get(u, `/pendencias/${id}/proximas-doses`)).body as any[]).find((d) => d.vacinaCodigo === "PENTAVALENTE");
    expect(depois?.numeroDose).toBe(2);
    expect(depois?.dosesTomadas).toBe(1);
  });

  it("[LOG-07] quem faz 25 anos amanhã (Brasília) ainda é adolescente hoje, e adulto no dia", async () => {
    const id = await pessoa("Quase Adulto", "2001-05-14");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-05-13T15:00:00-03:00"));
    expect((await get(u, `/pendencias/${id}`)).body.faixa_etaria).toBe("ADOLESCENTE");
    vi.setSystemTime(new Date("2026-05-14T09:00:00-03:00"));
    expect((await get(u, `/pendencias/${id}`)).body.faixa_etaria).toBe("ADULTO");
  });

  it("[LOG-08] dependente tem as próprias pendências, visíveis só para o responsável", async () => {
    const resp = await pessoa("Responsável", "1985-01-10");
    const dep = await enviar("post", u, "/dependentes", {
      responsavelPessoaId: resp, nome: "Filho Dep", data_nascimento: adicionarMeses(hojeIso(), -30), parentesco: "filho"
    });
    expect(dep.status).toBe(201);
    const filhoId = dep.body.id ?? dep.body.dependenteId;
    const r = await get(u, `/pendencias/${filhoId}`);
    expect(r.status).toBe(200);
    expect(r.body.faixa_etaria).toBe("CRIANCA");
    expect((await get(outro, `/pendencias/${filhoId}`)).status).toBe(403);
  });
});

describe("concorrência e idempotência", () => {

  it("[LOG-09] a mesma dose enviada 8 vezes ao mesmo tempo é gravada uma única vez", async () => {
    const id = await pessoa("Concorrente", "1990-05-14");
    const reg = (await enviar("post", u, "/carteira/registro", { pessoaId: id, vacinaId: vacinaPorCodigo("HEPATITE_B").id })).body.id;
    const respostas = await Promise.all(Array.from({ length: 8 }, () =>
      enviar("post", u, "/carteira/dose", { registroVacinacaoId: reg, numeroDose: 1, tipo: "1ª dose" })));
    expect(respostas.filter((r) => r.status === 201)).toHaveLength(1);
    expect(respostas.filter((r) => r.status === 400)).toHaveLength(7);
    expect((await get(u, `/carteira/registro/${reg}/doses`)).body).toHaveLength(1);
    expect(respostas.every((r) => r.status < 500)).toBe(true);
  });

  it("[LOG-10] a mesma vacina registrada 8 vezes ao mesmo tempo cria um único registro", async () => {
    const id = await pessoa("Concorrente 2", "1990-05-14");
    const respostas = await Promise.all(Array.from({ length: 8 }, () =>
      enviar("post", u, "/carteira/registro", { pessoaId: id, vacinaId: vacinaPorCodigo("FEBRE_AMARELA").id })));
    expect(respostas.filter((r) => r.status === 201)).toHaveLength(1);
    expect((await get(u, `/carteira/pessoa/${id}`)).body).toHaveLength(1);
    expect(respostas.every((r) => r.status < 500)).toBe(true);
  });

  it("[LOG-11] o mesmo grupo especial vinculado duas vezes não duplica", async () => {
    const id = await pessoa("Com Grupo", "1990-05-14");
    const g = (await get(u, "/grupos-especiais")).body[0].id;
    await Promise.all([1, 2, 3].map(() => enviar("post", u, `/grupos-especiais/pessoa/${id}`, { grupoEspecialId: g })));
    expect((await get(u, `/grupos-especiais/pessoa/${id}`)).body).toHaveLength(1);
  });
});

describe("validação de dados pela API (COR-25)", () => {
  let id: number;
  let reg: number;
  beforeAll(async () => {
    id = await pessoa("Para Validar", "1990-05-14");
    reg = (await enviar("post", u, "/carteira/registro", { pessoaId: id, vacinaId: vacinaPorCodigo("TRIPLICE_VIRAL")?.id ?? catalogo[2].id })).body.id;
  });

  it.each([
    ["futura", "2099-01-01"], ["texto", "abc"], ["dd/mm/aaaa", "14/05/1990"],
    ["ano 1800", "1800-01-01"], ["30 de fevereiro", "2020-02-30"]
  ])("[LOG-12] recusa data de nascimento %s", async (_n, data) => {
    const r = await enviar("post", u, "/pessoas", { usuario_id: u.id, nome: "X", data_nascimento: data });
    expect(r.status).toBe(400);
    expect(r.body.erro).toMatch(/data de nascimento/i);
  });

  it("[LOG-13] recusa e-mail inválido e atualização com nome vazio ou nascimento futuro", async () => {
    expect((await enviar("post", u, "/pessoas", { usuario_id: u.id, nome: "X", data_nascimento: "1990-01-01", email: "nao-e-email" })).status).toBe(400);
    expect((await enviar("put", u, `/pessoas/${id}`, { nome: "   " })).status).toBe(400);
    expect((await enviar("put", u, `/pessoas/${id}`, { data_nascimento: "2099-01-01" })).status).toBe(400);
    expect((await get(u, `/pessoas/${id}`)).body.nome).toBe("Para Validar");
  });

  it.each([0, -1, 1.5, "a", 99, null])("[LOG-14] recusa número de dose %s sem vazar erro do banco", async (n) => {
    const r = await enviar("post", u, "/carteira/dose", { registroVacinacaoId: reg, numeroDose: n, tipo: "DOSE" });
    expect(r.status).toBe(400);
    expect(r.body.erro).toMatch(/número da dose inválido/i);
    expect(r.text).not.toMatch(/SQLITE|constraint|violates|syntax error/i);
  });

  it("[LOG-15] nenhuma dose inválida foi gravada", async () => {
    expect((await get(u, `/carteira/registro/${reg}/doses`)).body).toHaveLength(0);
  });

  it.each(["2020-02-30", "ontem", "2026-13-01", "31/12/2030", ""])("[LOG-16] recusa data prevista de agendamento %s", async (d) => {
    const r = await enviar("post", u, "/agendamentos", { pessoaId: id, vacinaId: catalogo[0].id, numeroDose: 1, dataPrevista: d });
    expect(r.status).toBe(400);
  });

  it("[LOG-17] recusa dose de agendamento inválida e vacina inexistente", async () => {
    expect((await enviar("post", u, "/agendamentos", { pessoaId: id, vacinaId: catalogo[0].id, numeroDose: 0, dataPrevista: "2030-01-01" })).status).toBe(400);
    expect((await enviar("post", u, "/agendamentos", { pessoaId: id, vacinaId: 999999, numeroDose: 1, dataPrevista: "2030-01-01" })).status).toBe(400);
  });

  it.each([
    [{ data_nascimento: "2099-01-01", parentesco: "filho" }, /data de nascimento/i],
    [{ data_nascimento: "2024-01-01", parentesco: "robô" }, /parentesco/i],
    [{ data_nascimento: "2024-01-01", parentesco: "filho", email: "x" }, /e-mail/i],
  ])("[LOG-18] dependente inválido %j é recusado", async (dados, msg) => {
    const r = await enviar("post", u, "/dependentes", { responsavelPessoaId: id, nome: "Dep", ...dados });
    expect(r.status).toBe(400);
    expect(r.body.erro).toMatch(msg);
  });

  it("[LOG-19] parentesco com acento e caixa diferentes é aceito (como o front envia)", async () => {
    for (const p of ["mae", "Mãe", "CÔNJUGE", "filho"]) {
      const r = await enviar("post", u, "/dependentes", { responsavelPessoaId: id, nome: "Dep " + p, data_nascimento: "1960-02-02", parentesco: p });
      expect(r.status, p).toBe(201);
    }
  });

  it("[LOG-20] confirmar-scan recusa data de aplicação futura ou impossível", async () => {
    for (const d of ["2099-01-01", "2020-02-30", "10/02/2023"]) {
      const r = await enviar("post", u, "/carteira/confirmar-scan", { pessoaId: id, vacina: catalogo[3].nome, dose: "1ª dose", dataAplicacao: d });
      expect(r.status, d).toBe(400);
    }
  });

  it("[LOG-21] confirmar-scan aceita data válida passada", async () => {
    const r = await enviar("post", u, "/carteira/confirmar-scan", { pessoaId: id, vacina: catalogo[3].nome, dose: "1ª dose", dataAplicacao: "2023-02-10", lote: "L1" });
    expect(r.status).toBe(201);
  });
});

describe("cadastro público", () => {
  it("[LOG-22] recusa data de nascimento inválida no cadastro", async () => {
    const r = await enviar("post", null, "/auth/registrar", { nome: "N", email: `lg${Date.now()}@exemplo.com`, senha: "senhaSegura123", dataNascimento: "2099-01-01" });
    expect(r.status).toBe(400);
  });
});
