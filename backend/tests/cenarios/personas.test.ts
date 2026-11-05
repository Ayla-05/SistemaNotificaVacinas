import { describe, it, expect, beforeAll, vi } from "vitest";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import { configurarBanco } from "../../src/database/configurarBanco";
import { consultarTodos, consultarUm } from "../../src/database/database";
import { hojeIso, idadeEmAnos } from "../../src/utils/dataHoje";
import { obterFaixaEtaria } from "../../src/utils/faixaEtaria";
import { adicionarDias, adicionarMeses, diasEntre } from "../../src/utils/proximasDoses";
import { novoUsuario, get, enviar, criarPessoa, Sessao } from "../_util/sessao";

/*
CENÁRIOS COM MUITAS PESSOAS: cada uma tem a própria conta, com idade,
grupo especial e histórico de doses diferentes. Verifica, para todas:
as regras gerais (invariantes) e as expectativas específicas do
Calendário Nacional 2026; e, por fim, o isolamento entre contas e a
remoção em cascata no PostgreSQL. Códigos [CEN-nn].
*/

const HOJE = hojeIso();

/* Data de nascimento de quem tem hoje exatamente esta idade (+ dias a mais). */
const nasc = (anos: number, meses = 0, dias = 0) =>
  adicionarDias(adicionarMeses(HOJE, -(anos * 12 + meses)), -dias);

type Dose = { codigo: string; dose: string; data: string };

type Persona = {
  rotulo: string;
  nascimento: string;
  grupo?: string;
  semanasGestacao?: number;
  doses?: Dose[];
  /* códigos que DEVEM aparecer nas próximas doses */
  deve?: string[];
  /* códigos que NÃO podem aparecer */
  naoDeve?: string[];
};

const PERSONAS: Persona[] = [
  // ---- bebês e crianças, em torno das idades do calendário
  { rotulo: "recém-nascido (0 dias)", nascimento: nasc(0), deve: ["BCG", "HEPATITE_B", "PENTAVALENTE", "POLIO_VIP"], naoDeve: ["HPV4", "DENGUE_DNG4"] },
  { rotulo: "15 dias", nascimento: nasc(0, 0, 15), deve: ["PENTAVALENTE", "ROTAVIRUS"] },
  { rotulo: "1 dia antes de 2 meses", nascimento: nasc(0, 2, -1), deve: ["PENTAVALENTE"] },
  { rotulo: "2 meses exatos", nascimento: nasc(0, 2), deve: ["PENTAVALENTE", "POLIO_VIP", "ROTAVIRUS", "PNEUMOCOCICA_20V"] },
  { rotulo: "2 meses e 1 dia", nascimento: nasc(0, 2, 1), deve: ["PENTAVALENTE", "ROTAVIRUS"] },
  { rotulo: "4 meses", nascimento: nasc(0, 4), deve: ["PENTAVALENTE", "ROTAVIRUS"] },
  { rotulo: "6 meses", nascimento: nasc(0, 6), deve: ["PENTAVALENTE", "COVID19"] },
  { rotulo: "9 meses", nascimento: nasc(0, 9), deve: ["FEBRE_AMARELA", "PENTAVALENTE"] },
  { rotulo: "11 meses e 29 dias", nascimento: nasc(0, 11, 29), deve: ["PENTAVALENTE"] },
  { rotulo: "12 meses", nascimento: nasc(1), deve: ["TRIPLICE_VIRAL_SCR", "MENINGOCOCICA_ACWY"], naoDeve: [] },
  { rotulo: "15 meses", nascimento: nasc(1, 3), deve: ["TRIPLICE_VIRAL_SCR", "HEPATITE_A", "VARICELA"], naoDeve: [] },
  { rotulo: "4 anos", nascimento: nasc(4), deve: ["DTP", "VARICELA"], naoDeve: ["HPV4"] },
  { rotulo: "5 anos e 11 meses", nascimento: nasc(5, 11), naoDeve: ["HPV4"] },
  { rotulo: "9 anos e 11 meses", nascimento: nasc(9, 11), deve: ["HPV4"] },
  // ---- adolescência e juventude (fronteiras 10, 15 e 25 anos)
  { rotulo: "10 anos exatos", nascimento: nasc(10), deve: ["HPV4", "DENGUE_DNG4", "HEPATITE_B", "FEBRE_AMARELA"] },
  { rotulo: "1 dia antes de 10 anos", nascimento: nasc(10, 0, -1), deve: ["HPV4"] },
  { rotulo: "14 anos", nascimento: nasc(14), deve: ["HPV4", "DENGUE_DNG4"] },
  { rotulo: "15 anos exatos", nascimento: nasc(15), deve: ["HEPATITE_B", "FEBRE_AMARELA"], naoDeve: ["HPV4", "DENGUE_DNG4"] },
  { rotulo: "17 anos", nascimento: nasc(17), deve: ["HEPATITE_B", "TRIPLICE_VIRAL_SCR"], naoDeve: ["HPV4"] },
  { rotulo: "24 anos e 364 dias", nascimento: nasc(24, 11, 29), deve: ["HEPATITE_B", "TRIPLICE_VIRAL_SCR"] },
  { rotulo: "25 anos exatos", nascimento: nasc(25), deve: ["HEPATITE_B", "TRIPLICE_VIRAL_SCR"] },
  { rotulo: "29 anos", nascimento: nasc(29), deve: ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA"] },
  // ---- adultos e idosos (fronteiras 30 e 60 anos)
  { rotulo: "30 anos exatos", nascimento: nasc(30), deve: ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA", "HEPATITE_B"] },
  { rotulo: "45 anos", nascimento: nasc(45), deve: ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA"], naoDeve: ["HPV4"] },
  { rotulo: "59 anos e 364 dias", nascimento: nasc(59, 11, 29), deve: ["FEBRE_AMARELA"] },
  { rotulo: "60 anos exatos", nascimento: nasc(60), naoDeve: ["FEBRE_AMARELA", "HPV4"] },
  { rotulo: "75 anos", nascimento: nasc(75), naoDeve: ["FEBRE_AMARELA", "HPV4"] },
  { rotulo: "100 anos", nascimento: nasc(100), naoDeve: ["FEBRE_AMARELA"] },
  // ---- gestantes (semanas 8, 19, 20, 27, 28 e 38)
  { rotulo: "gestante de 8 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 8, deve: ["DT", "DTPA", "VSR", "INFLUENZA"], naoDeve: ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA", "VARICELA", "TETRAVIRAL"] },
  { rotulo: "gestante de 19 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 19, deve: ["DTPA", "VSR"], naoDeve: ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA", "VARICELA"] },
  { rotulo: "gestante de 20 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 20, deve: ["DTPA", "VSR"], naoDeve: ["FEBRE_AMARELA"] },
  { rotulo: "gestante de 27 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 27, deve: ["DTPA", "VSR"], naoDeve: ["FEBRE_AMARELA"] },
  { rotulo: "gestante de 28 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 28, deve: ["DTPA", "VSR"], naoDeve: ["FEBRE_AMARELA"] },
  { rotulo: "gestante de 38 semanas", nascimento: nasc(28), grupo: "GESTANTE", semanasGestacao: 38, deve: ["DTPA", "VSR"], naoDeve: ["SCR", "FEBRE_AMARELA"] },
  { rotulo: "gestante adolescente (16 anos, 12 semanas)", nascimento: nasc(16), grupo: "GESTANTE", semanasGestacao: 12, deve: ["DTPA", "VSR"], naoDeve: ["FEBRE_AMARELA", "TRIPLICE_VIRAL_SCR"] },
  // ---- outros grupos especiais
  { rotulo: "trabalhador de saúde de 35 anos", nascimento: nasc(35), grupo: "TRABALHADOR_SAUDE", deve: ["TRIPLICE_VIRAL_SCR", "VARICELA", "HEPATITE_B"] },
  { rotulo: "indígena de 20 anos", nascimento: nasc(20), grupo: "INDIGENA", deve: ["HEPATITE_B"] }
];

type Montada = Persona & { sessao: Sessao; pessoaId: number; usuarioId: number; inicioGestacao?: string };

const montadas: Montada[] = [];
let catalogo: any[] = [];
let grupos: any[] = [];
let admin: Sessao;

const nomeDe = (codigo: string) => catalogo.find((v) => v.codigo === codigo)?.nome as string;

async function montar(p: Persona): Promise<Montada> {

  const sessao = await novoUsuario("USUARIO", "cen");
  const criada = await criarPessoa(sessao, p.rotulo.slice(0, 80), p.nascimento);

  expect(criada.status, p.rotulo).toBe(201);

  const pessoaId = criada.body.id as number;
  let inicioGestacao: string | undefined;

  if (p.grupo) {

    const grupoId = grupos.find((g) => g.nome === p.grupo)?.id;
    inicioGestacao = p.semanasGestacao ? adicionarDias(HOJE, -p.semanasGestacao * 7) : undefined;

    const vinculo = await enviar("post", sessao, `/grupos-especiais/pessoa/${pessoaId}`, {
      grupoEspecialId: grupoId,
      gestacaoInicio: inicioGestacao
    });

    expect(vinculo.status, `${p.rotulo}: ${JSON.stringify(vinculo.body)}`).toBe(201);

  }

  for (const d of p.doses ?? []) {

    const r = await enviar("post", sessao, "/carteira/confirmar-scan", {
      pessoaId, vacina: nomeDe(d.codigo), dose: d.dose, dataAplicacao: d.data
    });

    expect(r.status, `${p.rotulo}: ${JSON.stringify(r.body)}`).toBe(201);

  }

  return { ...p, sessao, pessoaId, usuarioId: sessao.id, inicioGestacao };

}

beforeAll(async () => {

  await configurarBanco();

  admin = await novoUsuario("ADMIN", "cenadm");
  catalogo = (await get(null, "/vacinas")).body;
  grupos = (await get(admin, "/grupos-especiais")).body;

  // cria todas as contas em lotes paralelos (também exercita o pool de conexões)
  for (let i = 0; i < PERSONAS.length; i += 8) {
    montadas.push(...await Promise.all(PERSONAS.slice(i, i + 8).map(montar)));
  }

}, 120000);

const proximas = async (m: Montada) => (await get(m.sessao, `/pendencias/${m.pessoaId}/proximas-doses`)).body as any[];
const resumo = async (m: Montada) => (await get(m.sessao, `/pendencias/${m.pessoaId}`)).body as any;

describe("regras gerais, válidas para todas as pessoas", () => {

  it("[CEN-01] foram criadas todas as pessoas, cada uma em uma conta própria", () => {
    expect(montadas).toHaveLength(PERSONAS.length);
    expect(new Set(montadas.map((m) => m.usuarioId)).size).toBe(PERSONAS.length);
  });

  it("[CEN-02] idade e faixa etária batem com a data de nascimento (incluindo as fronteiras)", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const r = await resumo(m);
      const idade = idadeEmAnos(m.nascimento, HOJE);
      if (r.idade !== idade || r.faixa_etaria !== obterFaixaEtaria(idade)) {
        falhas.push(`${m.rotulo}: ${r.idade}/${r.faixa_etaria} (esperado ${idade}/${obterFaixaEtaria(idade)})`);
      }
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-03] nenhuma vacina aparece ao mesmo tempo em dia e pendente, nem repetida", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const r = await resumo(m);
      const emDia = r.em_dia.map((x: any) => x.vacina);
      const pend = r.pendentes.map((x: any) => x.vacina);
      if (new Set(emDia).size !== emDia.length) falhas.push(`${m.rotulo}: em_dia repetida`);
      if (new Set(pend).size !== pend.length) falhas.push(`${m.rotulo}: pendente repetida`);
      const comum = emDia.filter((v: string) => pend.includes(v));
      if (comum.length) falhas.push(`${m.rotulo}: em dia e pendente: ${comum}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-04] contagens coerentes: 1 ≤ faltam ≤ necessárias − tomadas; em dia = tomadas ≥ necessárias", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const r = await resumo(m);
      for (const p of r.pendentes) {
        // Achado [A-01]: em séries mistas (pneumocócica 20V/10V) o esquema da 10V só tem a 2ª dose;
        // por isso "faltam" pode ser MENOR que necessárias − tomadas, mas nunca maior nem menor que 1.
        if (p.faltam < 1 || p.faltam > p.necessarias - p.tomadas) falhas.push(`${m.rotulo}/${p.vacina}: ${JSON.stringify(p)}`);
      }
      for (const e of r.em_dia) {
        if (e.tomadas < e.necessarias) falhas.push(`${m.rotulo}/${e.vacina}: em dia com ${e.tomadas}/${e.necessarias}`);
      }
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-05] próximas doses: status e dias para vencer seguem a data prevista; nada antes do nascimento", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      for (const d of await proximas(m)) {
        const base = `${m.rotulo}/${d.vacinaCodigo}`;
        // numeroDose 0 = regra de repetição periódica (reforço anual, dT a cada 10 anos...)
        if (!Number.isInteger(d.numeroDose) || d.numeroDose < 0 || !d.rotulo) falhas.push(`${base}: numeroDose ${d.numeroDose}/${d.rotulo}`);
        if (d.dataPrevista === null) {
          if (d.status !== "DISPONIVEL" || d.diasParaVencer !== null) falhas.push(`${base}: sem data mas ${d.status}`);
          continue;
        }
        const dias = diasEntre(HOJE, d.dataPrevista);
        const esperado = dias < 0 ? "ATRASADA" : dias <= 30 ? "PROXIMA" : "FUTURA";
        if (d.status !== esperado || d.diasParaVencer !== dias) falhas.push(`${base}: ${d.status}/${d.diasParaVencer} (esperado ${esperado}/${dias})`);
        if (d.dataPrevista < m.nascimento) falhas.push(`${base}: data ${d.dataPrevista} antes do nascimento`);
      }
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-06] cada vacina aparece no máximo uma vez nas próximas doses", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const codigos = (await proximas(m)).map((d) => d.vacinaCodigo);
      const repetidos = codigos.filter((c, i) => codigos.indexOf(c) !== i);
      if (repetidos.length) falhas.push(`${m.rotulo}: ${repetidos}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-07] pendências (resumo) e próximas doses concordam: pendente = atrasada ou disponível", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const r = await resumo(m);
      const pend = new Set(r.pendentes.map((x: any) => x.vacina));
      const aPagar = (await proximas(m)).filter((d) => d.status === "ATRASADA" || d.status === "DISPONIVEL").map((d) => d.vacina);
      for (const v of aPagar) if (!pend.has(v)) falhas.push(`${m.rotulo}: ${v} atrasada/disponível mas fora das pendências`);
      for (const v of pend) if (!aPagar.includes(v as string)) falhas.push(`${m.rotulo}: ${v} pendente mas sem dose atrasada/disponível`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-08] só aparecem vacinas do catálogo e ativas", async () => {
    const ativas = new Set(catalogo.filter((v) => v.ativa === 1).map((v) => v.codigo));
    const falhas: string[] = [];
    for (const m of montadas) {
      for (const d of await proximas(m)) if (!ativas.has(d.vacinaCodigo)) falhas.push(`${m.rotulo}: ${d.vacinaCodigo}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

});

describe("expectativas do Calendário Nacional 2026 por pessoa", () => {

  it("[CEN-09] cada pessoa recebe as vacinas esperadas e nenhuma das proibidas para a sua situação", async () => {
    const falhas: string[] = [];
    for (const m of montadas) {
      const codigos = new Set((await proximas(m)).map((d) => d.vacinaCodigo));
      for (const c of m.deve ?? []) if (!codigos.has(c)) falhas.push(`${m.rotulo}: faltou ${c}`);
      for (const c of m.naoDeve ?? []) if (codigos.has(c)) falhas.push(`${m.rotulo}: não devia ter ${c}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-09b] passada a janela do rotavírus (11 meses), a 1ª dose nunca é sugerida", async () => {
    // Achado [A-02]: a 2ª dose (janela até 23 meses) ainda aparece para quem não tomou a 1ª; conferir com o calendário oficial.
    const falhas: string[] = [];
    for (const m of montadas.filter((x) => idadeEmAnos(x.nascimento, HOJE) >= 1)) {
      const rota = (await proximas(m)).find((d) => d.vacinaCodigo === "ROTAVIRUS");
      if (rota?.numeroDose === 1) falhas.push(`${m.rotulo}: 1ª dose de rotavírus sugerida`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-10] as datas previstas dos bebês seguem nascimento + idade recomendada", async () => {
    const falhas: string[] = [];
    for (const m of montadas.filter((x) => /meses|dias|recém/.test(x.rotulo) && !x.grupo)) {
      const lista = await proximas(m);
      const penta = lista.find((d) => d.vacinaCodigo === "PENTAVALENTE");
      const esperada = adicionarMeses(m.nascimento, 2);
      if (penta?.numeroDose === 1 && penta.dataPrevista !== esperada) falhas.push(`${m.rotulo}: penta 1ª em ${penta.dataPrevista}, esperado ${esperada}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-11] gestante: dTpa na 20ª semana e VSR na 28ª; febre amarela e vacinas vivas nunca", async () => {
    const falhas: string[] = [];
    for (const m of montadas.filter((x) => x.grupo === "GESTANTE")) {
      const lista = await proximas(m);
      const dtpa = lista.find((d) => d.vacinaCodigo === "DTPA");
      const vsr = lista.find((d) => d.vacinaCodigo === "VSR");
      const semanas = m.semanasGestacao!;
      for (const [d, alvo, nome] of [[dtpa, 20, "dTpa"], [vsr, 28, "VSR"]] as const) {
        if (!d) { falhas.push(`${m.rotulo}: sem ${nome}`); continue; }
        if (semanas < alvo) {
          const esperada = adicionarDias(m.inicioGestacao!, alvo * 7);
          if (d.dataPrevista !== esperada) falhas.push(`${m.rotulo}: ${nome} em ${d.dataPrevista}, esperado ${esperada}`);
          if (d.status === "ATRASADA") falhas.push(`${m.rotulo}: ${nome} atrasada antes da ${alvo}ª semana`);
        } else if (d.status === "ATRASADA") {
          falhas.push(`${m.rotulo}: ${nome} atrasada com ${semanas} semanas (janela aberta, não é atraso)`);
        }
      }
      const proibidas = lista.filter((d) => ["FEBRE_AMARELA", "TRIPLICE_VIRAL_SCR", "TETRAVIRAL", "VARICELA"].includes(d.vacinaCodigo));
      if (proibidas.length) falhas.push(`${m.rotulo}: sugeriu ${proibidas.map((x) => x.vacinaCodigo)}`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-12] fronteira dos 60 anos: quem tem 59 anos e 364 dias ainda recebe febre amarela; aos 60, não", async () => {
    const quase = montadas.find((m) => m.rotulo === "59 anos e 364 dias")!;
    const sessenta = montadas.find((m) => m.rotulo === "60 anos exatos")!;
    expect((await proximas(quase)).map((d) => d.vacinaCodigo)).toContain("FEBRE_AMARELA");
    expect((await proximas(sessenta)).map((d) => d.vacinaCodigo)).not.toContain("FEBRE_AMARELA");
  });

  it("[CEN-13] fronteira dos 15 anos: HPV e dengue saem do esquema", async () => {
    const quatorze = montadas.find((m) => m.rotulo === "14 anos")!;
    const quinze = montadas.find((m) => m.rotulo === "15 anos exatos")!;
    const c14 = (await proximas(quatorze)).map((d) => d.vacinaCodigo);
    const c15 = (await proximas(quinze)).map((d) => d.vacinaCodigo);
    expect(c14).toEqual(expect.arrayContaining(["HPV4", "DENGUE_DNG4"]));
    expect(c15).not.toContain("HPV4");
    expect(c15).not.toContain("DENGUE_DNG4");
  });

  it("[CEN-14] sarampo (tríplice viral): 25 a 29 anos duas doses; 30 a 59, dose única", async () => {
    const aos29 = (await proximas(montadas.find((m) => m.rotulo === "29 anos")!)).find((d) => d.vacinaCodigo === "TRIPLICE_VIRAL_SCR");
    const aos45 = (await proximas(montadas.find((m) => m.rotulo === "45 anos")!)).find((d) => d.vacinaCodigo === "TRIPLICE_VIRAL_SCR");
    expect(aos29.rotulo).toMatch(/1ª dose/);
    expect(aos45.rotulo).toMatch(/única/i);
  });

});

describe("histórico de doses: a próxima dose respeita idade e intervalo", () => {

  let lactente: Montada;
  let atrasado: Montada;
  let adulto: Montada;
  let idoso: Montada;
  let meiaIdade: Montada;
  const d1Lactente = adicionarMeses(nasc(0, 3), 2);
  const d1Atrasado = adicionarMeses(nasc(0, 8), 7);
  const d1Adulto = adicionarDias(HOJE, -1);
  const dInfluenza = adicionarDias(HOJE, -20);
  const dDt = adicionarDias(HOJE, -400);

  beforeAll(async () => {
    [lactente, atrasado, adulto, idoso, meiaIdade] = await Promise.all([
      montar({ rotulo: "lactente 3 meses com penta 1ª dose", nascimento: nasc(0, 3), doses: [{ codigo: "PENTAVALENTE", dose: "1ª dose", data: d1Lactente }] }),
      montar({ rotulo: "bebê 8 meses com rotavírus 1ª dose tardia", nascimento: nasc(0, 8), doses: [{ codigo: "ROTAVIRUS", dose: "1ª dose", data: d1Atrasado }] }),
      montar({ rotulo: "adulto 30 anos com hepatite B 1ª dose ontem", nascimento: nasc(30), doses: [{ codigo: "HEPATITE_B", dose: "1ª dose", data: d1Adulto }] }),
      montar({ rotulo: "idoso 70 anos com influenza", nascimento: nasc(70), doses: [{ codigo: "INFLUENZA", dose: "Dose anual", data: dInfluenza }] }),
      montar({ rotulo: "adulto 45 anos com dT antigo", nascimento: nasc(45), doses: [{ codigo: "DT", dose: "Reforço", data: dDt }] })
    ]);
    montadas.push(lactente, atrasado, adulto, idoso, meiaIdade);
  }, 60000);

  const dose = async (m: Montada, codigo: string) => (await proximas(m)).find((d) => d.vacinaCodigo === codigo);

  it("[CEN-15] registrar a 1ª dose da penta faz a próxima ser a 2ª, na idade recomendada (4 meses)", async () => {
    const d = await dose(lactente, "PENTAVALENTE");
    expect(d).toMatchObject({ numeroDose: 2, dosesTomadas: 1, dataPrevista: adicionarMeses(lactente.nascimento, 4) });
  });

  it("[CEN-16] dose tomada com atraso empurra a seguinte: rotavírus 2ª = 1ª + 60 dias", async () => {
    const d = await dose(atrasado, "ROTAVIRUS");
    expect(d?.numeroDose).toBe(2);
    expect(d?.dataPrevista).toBe(adicionarDias(d1Atrasado, 60));
  });

  it("[CEN-17] hepatite B de adulto: 2ª dose 30 dias depois da 1ª; 3ª ainda não é pedida", async () => {
    const d = await dose(adulto, "HEPATITE_B");
    expect(d).toMatchObject({ numeroDose: 2, dosesTomadas: 1, dataPrevista: adicionarDias(d1Adulto, 30) });
  });

  it("[CEN-18] influenza anual: próxima dose 12 meses depois da última", async () => {
    const d = await dose(idoso, "INFLUENZA");
    expect(d?.dataPrevista).toBe(adicionarMeses(dInfluenza, 12));
  });

  it("[CEN-19] dT de adulto: reforço 10 anos depois da última dose (já vencido? não: faltam ~9 anos)", async () => {
    const d = await dose(meiaIdade, "DT");
    expect(d?.dataPrevista).toBe(adicionarMeses(dDt, 120));
    expect(d?.status).toBe("FUTURA");
  });

  it("[CEN-20] a penta com a 1ª dose tomada aos 3 meses está EM DIA (a 2ª só vence aos 4) e não pendente", async () => {
    const r = await resumo(lactente);
    const emDia = r.em_dia.find((e: any) => e.vacina === nomeDe("PENTAVALENTE"));
    expect(emDia).toMatchObject({ tomadas: 1 });
    expect(r.pendentes.map((p: any) => p.vacina)).not.toContain(nomeDe("PENTAVALENTE"));
  });

});

describe("isolamento entre as contas", () => {

  it("[CEN-21] ninguém lê a carteira, as pendências nem as pessoas de outra conta (todos contra todos, amostra)", async () => {
    const falhas: string[] = [];
    for (let i = 0; i < montadas.length; i += 3) {
      const a = montadas[i];
      const b = montadas[(i + 7) % montadas.length];
      for (const rota of [`/pessoas/${b.pessoaId}`, `/pendencias/${b.pessoaId}`, `/pendencias/${b.pessoaId}/proximas-doses`, `/carteira/pessoa/${b.pessoaId}`, `/agendamentos/pessoa/${b.pessoaId}`]) {
        const r = await get(a.sessao, rota);
        if (r.status !== 403) falhas.push(`${a.rotulo} → ${rota}: ${r.status}`);
      }
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-22] cada usuário só enxerga a própria pessoa na listagem", async () => {
    const falhas: string[] = [];
    for (const m of montadas.slice(0, 12)) {
      const lista = (await get(m.sessao, "/pessoas")).body as any[];
      if (lista.length !== 1 || lista[0].id !== m.pessoaId) falhas.push(`${m.rotulo}: ${lista.length} pessoas`);
    }
    expect(falhas.join("\n")).toBe("");
  });

  it("[CEN-23] o administrador lê qualquer uma delas", async () => {
    for (const m of [montadas[0], montadas[20], montadas[35]]) {
      expect((await get(admin, `/pendencias/${m.pessoaId}`)).status).toBe(200);
    }
  });

});

describe("banco PostgreSQL: estrutura e remoção em cascata", () => {

  it("[CEN-24] as 16 tabelas existem, com chaves estrangeiras e ON DELETE CASCADE nos dados dependentes", async () => {
    const tabelas = (await consultarTodos(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_name <> '_prisma_migrations'"
    )).map((r: any) => r.table_name).sort();
    expect(tabelas).toHaveLength(16);

    const cascatas = (await consultarTodos(
      `SELECT tc.table_name AS tabela, rc.delete_rule AS regra
         FROM information_schema.referential_constraints rc
         JOIN information_schema.table_constraints tc
           ON tc.constraint_name = rc.constraint_name AND tc.constraint_schema = rc.constraint_schema
        WHERE tc.constraint_schema = current_schema()`
    )) as any[];
    const regra = (t: string) => cascatas.filter((c) => c.tabela === t).map((c) => c.regra);
    for (const t of ["sessoes", "redefinicoes_senha", "pessoas", "dependentes", "registros_vacinacao", "doses_vacina", "agendamentos_vacina", "avisos_dose"]) {
      expect(regra(t).length, t).toBeGreaterThan(0);
      expect(new Set(regra(t).filter((r) => r !== "CASCADE")).size, `${t} só em cascata`).toBeLessThanOrEqual(t === "registros_vacinacao" || t === "agendamentos_vacina" ? 1 : 0);
    }
  });

  it("[CEN-25] os índices do esquema existem (únicos e de consulta)", async () => {
    const nomes = (await consultarTodos("SELECT indexname FROM pg_indexes WHERE schemaname = current_schema()")).map((r: any) => r.indexname);
    for (const esperado of ["ux_dose_registro_numero", "ux_registro_pessoa_vacina", "ux_pessoa_grupo", "idx_agendamento_pessoa_data", "idx_agendamento_status_data", "idx_pessoas_usuario", "idx_sessoes_usuario"]) {
      expect(nomes, esperado).toContain(esperado);
    }
  });

  it("[CEN-26] os dados de saúde ficaram gravados (registros e doses dos cenários com histórico)", async () => {
    const total = await consultarUm("SELECT COUNT(*) AS n FROM doses_vacina");
    expect(total.n).toBeGreaterThanOrEqual(5);
    expect(typeof total.n).toBe("number");
  });

  it("[CEN-27] apagar uma conta apaga, em cascata, pessoas, carteira, doses, grupos e sessões — e só dela", async () => {
    const alvo = montadas.find((m) => m.rotulo.startsWith("lactente"))!;
    const outra = montadas.find((m) => m.rotulo.startsWith("idoso 70"))!;
    const contar = async (usuarioId: number) => {
      const q = async (sql: string) => (await consultarUm(sql, [usuarioId])).n as number;
      return {
        pessoas: await q("SELECT COUNT(*) AS n FROM pessoas WHERE usuario_id = ?"),
        registros: await q("SELECT COUNT(*) AS n FROM registros_vacinacao r JOIN pessoas p ON p.id = r.pessoa_id WHERE p.usuario_id = ?"),
        doses: await q("SELECT COUNT(*) AS n FROM doses_vacina d JOIN registros_vacinacao r ON r.id = d.registro_vacinacao_id JOIN pessoas p ON p.id = r.pessoa_id WHERE p.usuario_id = ?"),
        sessoes: await q("SELECT COUNT(*) AS n FROM sessoes WHERE usuario_id = ?")
      };
    };
    const antes = await contar(alvo.usuarioId);
    const antesOutra = await contar(outra.usuarioId);
    expect(antes.doses).toBeGreaterThan(0);

    expect((await enviar("delete", admin, `/usuarios/${alvo.usuarioId}`)).status).toBe(200);

    expect(await contar(alvo.usuarioId)).toEqual({ pessoas: 0, registros: 0, doses: 0, sessoes: 0 });
    expect(await contar(outra.usuarioId)).toEqual(antesOutra);
  });

});
