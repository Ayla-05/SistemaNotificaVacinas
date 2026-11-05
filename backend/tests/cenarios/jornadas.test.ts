import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import app from "../../src/server";
import { configurarBanco } from "../../src/database/configurarBanco";
import { alterar, consultarTodos, consultarUm } from "../../src/database/database";
import { EmailService } from "../../src/services/emailService";
import { NotificacaoService } from "../../src/services/notificacaoService";
import { hojeIso } from "../../src/utils/dataHoje";
import { adicionarDias, adicionarMeses } from "../../src/utils/proximasDoses";
import { CSRF, SENHA, cookiesDe, get, enviar, Sessao } from "../_util/sessao";

/*
JORNADAS COMPLETAS DE USUÁRIO: doze perfis diferentes passam, cada um, pelo
caminho de ponta a ponta — cadastro público, confirmação de e-mail, login,
dados pessoais, dependentes, grupos especiais, leitura da carteirinha (OCR
simulado), doses manuais, agendamento e confirmação, preferências de aviso,
dispositivos e avisos automáticos. Códigos [JOR-nn].
*/

const HOJE = hojeIso();
const nasc = (anos: number, meses = 0, dias = 0) =>
  adicionarDias(adicionarMeses(HOJE, -(anos * 12 + meses)), -dias);

type Dependente = { nome: string; nascimento: string; parentesco: string };

type Perfil = {
  nome: string;
  nascimento: string;
  dependentes?: Dependente[];
  grupo?: string;
  semanasGestacao?: number;
  receberEmail?: 0 | 1;
  frequencia?: string;
};

const PERFIS: Perfil[] = [
  { nome: "Jovem de 22 anos", nascimento: nasc(22) },
  { nome: "Mãe de 34 anos com três filhos", nascimento: nasc(34), dependentes: [
    { nome: "Bebê de 3 meses", nascimento: nasc(0, 3), parentesco: "filho" },
    { nome: "Criança de 4 anos", nascimento: nasc(4), parentesco: "filha" },
    { nome: "Adolescente de 12 anos", nascimento: nasc(12), parentesco: "filho" }] },
  { nome: "Pai de 41 anos cuidando do pai idoso", nascimento: nasc(41), dependentes: [
    { nome: "Pai de 72 anos", nascimento: nasc(72), parentesco: "pai" }] },
  { nome: "Idoso de 68 anos", nascimento: nasc(68) },
  { nome: "Gestante de 27 anos", nascimento: nasc(27), grupo: "GESTANTE", semanasGestacao: 24 },
  { nome: "Trabalhador de saúde de 29 anos", nascimento: nasc(29), grupo: "TRABALHADOR_SAUDE" },
  { nome: "Adolescente de 16 anos", nascimento: nasc(16) },
  { nome: "Avó de 70 anos com neto de 5 meses", nascimento: nasc(70), dependentes: [
    { nome: "Neto de 5 meses", nascimento: nasc(0, 5), parentesco: "neto" }] },
  { nome: "Usuária que desligou os e-mails", nascimento: nasc(31), receberEmail: 0 },
  { nome: "Usuário com aviso semanal", nascimento: nasc(38), frequencia: "SEMANAL" },
  { nome: "Casal: pessoa A (28 anos)", nascimento: nasc(28), dependentes: [{ nome: "Cônjuge", nascimento: nasc(30), parentesco: "conjuge" }] },
  { nome: "Casal: pessoa B (30 anos)", nascimento: nasc(30) }
];

let catalogo: any[] = [];
let grupos: any[] = [];
const nomeDe = (codigo: string) => catalogo.find((v) => v.codigo === codigo)?.nome as string;

const TEXTO_OCR = (vacina: string, dose: string, data: string) =>
  `Nome: Fulano de Tal\nData de nascimento: 14/05/1990\n\n| Vacina | Dose | Data | Lote | Unidade |\n|---|---|---|---|---|\n| ${vacina} | ${dose} | ${data} | L123 | UBS Centro |\n`;

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

const emails = {
  avisos: vi.spyOn(EmailService, "enviarAvisoDosesProximas"),
  resumos: vi.spyOn(EmailService, "enviarResumoDoses"),
  lembretes: vi.spyOn(EmailService, "enviarLembreteAgendamento")
};

beforeAll(async () => {
  process.env.OCR_SERVICE_URL = "http://ocr.teste";
  vi.spyOn(EmailService, "enviar").mockResolvedValue({ enviado: true } as any);
  emails.avisos.mockResolvedValue({ enviado: true } as any);
  emails.resumos.mockResolvedValue({ enviado: true } as any);
  emails.lembretes.mockResolvedValue({ enviado: true } as any);
  await configurarBanco();
  catalogo = (await get(null, "/vacinas")).body;
  const adm = await request(app).post("/auth/login").set(CSRF).send({ email: "nao-existe@x.com", senha: "x" });
  void adm;
});

afterAll(() => {
  vi.restoreAllMocks();
});

/* Cadastro público + confirmação de e-mail + login, como um usuário real. */
async function cadastrar(perfil: Perfil, indice: number): Promise<Sessao & { pessoaId: number }> {

  const email = `jornada${indice}.${Date.now()}@exemplo.com`;

  const reg = await request(app).post("/auth/registrar").set(CSRF)
    .send({ nome: perfil.nome, email, senha: SENHA, dataNascimento: perfil.nascimento });
  expect(reg.status, `${perfil.nome}: ${JSON.stringify(reg.body)}`).toBe(201);

  const { codigo_verificacao: codigo } = await consultarUm("SELECT codigo_verificacao FROM usuarios WHERE email = ?", [email]);

  // antes de confirmar, o login é recusado
  const bloqueado = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
  expect(bloqueado.status, "login sem confirmar").toBeGreaterThanOrEqual(400);

  const confirma = await request(app).post("/auth/confirmar-email").set(CSRF).send({ email, codigo });
  expect(confirma.status, `confirmar e-mail: ${JSON.stringify(confirma.body)}`).toBe(200);

  const login = await request(app).post("/auth/login").set(CSRF).send({ email, senha: SENHA });
  expect(login.status, "login").toBe(200);

  const me = await request(app).get("/auth/me").set("Cookie", cookiesDe(login));
  const sessao = { id: me.body.id as number, email, cookies: cookiesDe(login) };

  const pessoas = await get(sessao, `/pessoas/usuario/${sessao.id}`);
  expect(pessoas.body, "o cadastro cria a pessoa titular").toHaveLength(1);

  return { ...sessao, pessoaId: pessoas.body[0].id };

}

describe.each(PERFIS.map((p, i) => [p.nome, p, i] as const))("jornada: %s", (_nome, perfil, indice) => {

  let u: Sessao & { pessoaId: number };
  const dependentes: number[] = [];

  it("[JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação)", async () => {
    u = await cadastrar(perfil, indice);
    expect(u.pessoaId).toBeGreaterThan(0);
  }, 30000);

  it("[JOR-02] completa os dados pessoais e as preferências", async () => {
    const r = await enviar("put", u, `/pessoas/${u.pessoaId}`, {
      telefone: "11988887777", cep: "07000-000", cidade: "Guarulhos", estado: "SP",
      receber_email: perfil.receberEmail ?? 1,
      frequencia_aviso: perfil.frequencia ?? "UMA_VEZ"
    });
    expect(r.status, JSON.stringify(r.body)).toBe(200);
    const salvo = (await get(u, `/pessoas/${u.pessoaId}`)).body;
    expect(salvo).toMatchObject({ telefone: "11988887777", cidade: "Guarulhos", estado: "SP" });
    expect(salvo.nome).toBe(perfil.nome);
    expect(salvo.receber_email).toBe(perfil.receberEmail ?? 1);
  });

  it("[JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele", async () => {
    for (const d of perfil.dependentes ?? []) {
      const r = await enviar("post", u, "/dependentes", {
        responsavelPessoaId: u.pessoaId, nome: d.nome, data_nascimento: d.nascimento, parentesco: d.parentesco
      });
      expect(r.status, `${d.nome}: ${JSON.stringify(r.body)}`).toBe(201);
      dependentes.push(r.body.id ?? r.body.dependenteId);
    }
    const lista = (await get(u, `/dependentes/pessoa/${u.pessoaId}`)).body as any[];
    expect(lista).toHaveLength(perfil.dependentes?.length ?? 0);
    for (const id of dependentes) {
      const r = await get(u, `/pendencias/${id}`);
      expect(r.status).toBe(200);
      expect(r.body.pendentes.length + r.body.em_dia.length).toBeGreaterThan(0);
    }
  });

  it("[JOR-04] informa o grupo especial (gestante com semanas de gestação)", async () => {
    if (!perfil.grupo) return;
    grupos = grupos.length ? grupos : (await get(u, "/grupos-especiais")).body;
    const grupo = grupos.find((g) => g.nome === perfil.grupo);
    const inicio = perfil.semanasGestacao ? adicionarDias(HOJE, -perfil.semanasGestacao * 7) : undefined;
    const r = await enviar("post", u, `/grupos-especiais/pessoa/${u.pessoaId}`, { grupoEspecialId: grupo.id, gestacaoInicio: inicio });
    expect(r.status, JSON.stringify(r.body)).toBe(201);
    const mine = (await get(u, `/grupos-especiais/pessoa/${u.pessoaId}`)).body;
    expect(mine.map((g: any) => g.nome)).toContain(perfil.grupo);
    if (perfil.grupo === "GESTANTE") {
      const proximas = (await get(u, `/pendencias/${u.pessoaId}/proximas-doses`)).body as any[];
      expect(proximas.map((d) => d.vacinaCodigo)).toEqual(expect.arrayContaining(["DTPA", "VSR"]));
      expect(proximas.map((d) => d.vacinaCodigo)).not.toContain("FEBRE_AMARELA");
    }
  });

  it("[JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira", async () => {
    const vacina = nomeDe("HEPATITE_B");
    const ocr = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ texto: TEXTO_OCR(vacina, "1ª dose", "10/02/2023") }), { status: 200, headers: { "Content-Type": "application/json" } }))
    );
    const lida = await enviar("post", u, "/scan/analisar", { pessoaId: u.pessoaId, imagemBase64: PNG.toString("base64") });
    expect(lida.status, JSON.stringify(lida.body)).toBe(200);
    expect(lida.body).toMatchObject({ vacina, dose: "1ª dose", dataAplicacao: "2023-02-10", lote: "L123" });
    // nada foi gravado só com a leitura
    expect((await get(u, `/carteira/pessoa/${u.pessoaId}`)).body).toHaveLength(0);

    const confirma = await enviar("post", u, "/carteira/confirmar-scan", {
      pessoaId: u.pessoaId, vacina, dose: lida.body.dose, dataAplicacao: lida.body.dataAplicacao, lote: lida.body.lote, localAplicacao: lida.body.localAplicacao
    });
    expect(confirma.status, JSON.stringify(confirma.body)).toBe(201);
    const carteira = (await get(u, `/carteira/pessoa/${u.pessoaId}`)).body as any[];
    expect(carteira).toHaveLength(1);
    ocr.mockRestore(); // só o fetch: os espiões de e-mail continuam valendo
  });

  it("[JOR-06] registra mais doses à mão e a situação vacinal avança", async () => {
    const antes = (await get(u, `/pendencias/${u.pessoaId}`)).body;
    const registro = (await get(u, `/carteira/pessoa/${u.pessoaId}`)).body[0];
    const r = await enviar("post", u, "/carteira/dose", { registroVacinacaoId: registro.id, numeroDose: 2, tipo: "2ª dose" });
    expect([201, 400], JSON.stringify(r.body)).toContain(r.status); // 400 só se a dose 2 já existisse
    const depois = (await get(u, `/pendencias/${u.pessoaId}`)).body;
    const tomadas = (r: any) => [...r.pendentes, ...r.em_dia].find((x: any) => x.vacina === nomeDe("HEPATITE_B"))?.tomadas ?? 0;
    expect(tomadas(depois)).toBeGreaterThanOrEqual(tomadas(antes));
    // doses inválidas continuam sendo recusadas
    expect((await enviar("post", u, "/carteira/dose", { registroVacinacaoId: registro.id, numeroDose: 0, tipo: "x" })).status).toBe(400);
  });

  it("[JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra", async () => {
    const vacinaId = catalogo.find((v) => v.codigo === "FEBRE_AMARELA").id;
    const futuro = await enviar("post", u, "/agendamentos", { pessoaId: u.pessoaId, vacinaId, numeroDose: 1, dataPrevista: adicionarDias(HOJE, 30) });
    expect(futuro.status, JSON.stringify(futuro.body)).toBe(201);
    // confirmar antes da data agendada não vale
    expect((await enviar("patch", u, `/agendamentos/${futuro.body.id}/confirmar`)).status).toBe(400);

    // no dia: a data chega e a confirmação registra a dose na carteira
    await alterar("UPDATE agendamentos_vacina SET data_prevista = ? WHERE id = ?", [HOJE, futuro.body.id]);
    const ok = await enviar("patch", u, `/agendamentos/${futuro.body.id}/confirmar`);
    expect(ok.status, JSON.stringify(ok.body)).toBe(200);
    expect((await enviar("patch", u, `/agendamentos/${futuro.body.id}/confirmar`)).status).toBe(400);
    const carteira = (await get(u, `/carteira/pessoa/${u.pessoaId}`)).body as any[];
    expect(carteira.map((c) => c.vacina_id)).toContain(vacinaId);

    // cancela outro agendamento e remove-o
    const outro = await enviar("post", u, "/agendamentos", { pessoaId: u.pessoaId, vacinaId: catalogo.find((v) => v.codigo === "HEPATITE_A").id, numeroDose: 1, dataPrevista: adicionarDias(HOJE, 60) });
    expect((await enviar("patch", u, `/agendamentos/${outro.body.id}/status`, { status: "CANCELADA" })).status).toBe(200);
    expect((await enviar("delete", u, `/agendamentos/${outro.body.id}`)).status).toBe(200);
  });

  it("[JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos", async () => {
    const segundo = await request(app).post("/auth/login").set(CSRF).send({ email: u.email, senha: SENHA });
    expect(segundo.status).toBe(200);
    const lista = (await get(u, "/auth/sessoes")).body as any[];
    expect(lista.length).toBeGreaterThanOrEqual(2);
    expect((await enviar("post", u, "/auth/sessoes/encerrar-todas")).status).toBe(200);
    expect((await get(u, "/auth/me")).status).toBe(401);
    expect((await request(app).get("/auth/me").set("Cookie", cookiesDe(segundo))).status).toBe(401);
    // volta a entrar e segue com os dados intactos
    const novo = await request(app).post("/auth/login").set(CSRF).send({ email: u.email, senha: SENHA });
    u.cookies = cookiesDe(novo);
    expect((await get(u, `/pessoas/${u.pessoaId}`)).body.nome).toBe(perfil.nome);
  });

  it("[JOR-09] sair encerra a sessão de vez", async () => {
    expect((await enviar("post", u, "/auth/logout")).status).toBe(200);
    expect((await get(u, "/auth/me")).status).toBe(401);
  });

});

describe("avisos automáticos para vários perfis ao mesmo tempo", () => {

  const criados: Record<string, { pessoaId: number; email: string }> = {};
  let chamadas: any[][] = [];

  async function criarAvisavel(chave: string, nascimento: string, extra: { receber_email?: number; frequencia?: string } = {}) {
    const email = `aviso.${chave}.${Date.now()}@exemplo.com`;
    const usuarioId = Number((await consultarUm(
      "INSERT INTO usuarios (nome, email, senha, perfil, email_verificado) VALUES (?, ?, 'x', 'USUARIO', 1) RETURNING id", [chave, email]
    )).id);
    const pessoaId = Number((await consultarUm(
      `INSERT INTO pessoas (usuario_id, nome, email, data_nascimento, receber_email, frequencia_aviso)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [usuarioId, `Aviso ${chave}`, email, nascimento, extra.receber_email ?? 1, extra.frequencia ?? "UMA_VEZ"]
    )).id);
    criados[chave] = { pessoaId, email };
  }

  beforeAll(async () => {
    // a 1ª dose da penta vence daqui a 5 dias (dentro dos 7 de antecedência) / daqui a 25 dias (fora)
    const venceEm = (dias: number) => adicionarMeses(adicionarDias(HOJE, dias), -2);
    await criarAvisavel("perto", venceEm(5));
    await criarAvisavel("longe", venceEm(25));
    await criarAvisavel("desligado", venceEm(5), { receber_email: 0 });
    await criarAvisavel("atrasado", venceEm(-10));
  });

  it("[JOR-10] avisa só quem tem dose chegando, respeita quem desligou os e-mails e não repete no dia seguinte", async () => {
    emails.avisos.mockClear();
    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();
    chamadas = [...emails.avisos.mock.calls];
    const destinos = chamadas.map((c) => c[0]);
    const vezes = (e: string) => destinos.filter((d) => d === e).length;
    expect(vezes(criados.perto.email)).toBe(1);
    expect(vezes(criados.longe.email)).toBe(0);
    expect(vezes(criados.desligado.email)).toBe(0);
  });

  it("[JOR-11] o aviso lista a dose certa, com os dias que faltam", async () => {
    const chamada = chamadas.find((c) => c[0] === criados.perto.email)!;
    expect(chamada, "o aviso de quem tem dose chegando foi enviado").toBeTruthy();
    const penta = (chamada[2] as any[]).find((d) => d.vacina === nomeDe("PENTAVALENTE"));
    expect(penta).toMatchObject({ rotulo: "1ª dose", diasParaVencer: 5 });
  });

  it("[JOR-12] o registro de avisos enviados evita duplicar no banco", async () => {
    const n = await consultarTodos("SELECT COUNT(*) AS n FROM avisos_dose WHERE pessoa_id = ?", [criados.perto.pessoaId]);
    expect(n[0].n).toBeGreaterThanOrEqual(1);
    const repetidos = await consultarTodos(
      "SELECT pessoa_id, vacina_codigo, numero_dose, data_prevista, COUNT(*) AS n FROM avisos_dose GROUP BY 1,2,3,4 HAVING COUNT(*) > 1"
    );
    expect(repetidos).toEqual([]);
  });

});
