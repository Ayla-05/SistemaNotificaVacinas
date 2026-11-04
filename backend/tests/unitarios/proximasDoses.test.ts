import { describe, it, expect } from "vitest";

import {
  adicionarDias,
  adicionarMeses,
  calcularProximasDoses,
  diasEntre,
  idadeEmMeses,
  ProximaDose
} from "../../src/utils/proximasDoses";

const HOJE = "2026-10-31";

function calcular(
  nascimento: string,
  doses: Record<string, Array<{ numero: number; data: string | null }>> = {},
  grupos: string[] = []
) {
  return calcularProximasDoses({ nascimento, hoje: HOJE, doses, grupos });
}

const de = (lista: ProximaDose[], codigo: string) =>
  lista.find((d) => d.vacinaCodigo === codigo);

describe("datas", () => {

  it("soma meses sem estourar o fim do mês", () => {
    expect(adicionarMeses("2020-01-31", 1)).toBe("2020-02-29");
    expect(adicionarMeses("2021-01-31", 1)).toBe("2021-02-28");
    expect(adicionarMeses("2024-02-29", 12)).toBe("2025-02-28");
    expect(adicionarMeses("2026-10-31", 2)).toBe("2026-12-31");
    expect(adicionarMeses("2026-11-30", 3)).toBe("2027-02-28");
  });

  it("soma dias e conta a diferença", () => {
    expect(adicionarDias("2026-02-27", 3)).toBe("2026-03-02");
    expect(diasEntre("2026-10-31", "2026-11-30")).toBe(30);
    expect(diasEntre("2026-11-30", "2026-10-31")).toBe(-30);
  });

  it("conta a idade em meses completos", () => {
    expect(idadeEmMeses("2026-08-31", "2026-10-31")).toBe(2);
    expect(idadeEmMeses("2026-08-31", "2026-10-30")).toBe(1);
    expect(idadeEmMeses("2025-10-31", "2026-10-30")).toBe(11);
    expect(idadeEmMeses("2026-10-31", "2026-10-31")).toBe(0);
  });

});

describe("bebê de 2 meses (nascido em 31/08/2026)", () => {

  const lista = calcular("2026-08-31");

  it("penta, VIP, rotavírus e pneumo 1ª dose vencem hoje (2 meses)", () => {
    for (const vacina of ["PENTAVALENTE", "POLIO_VIP", "ROTAVIRUS", "PNEUMOCOCICA_20V"]) {
      expect(de(lista, vacina)).toMatchObject({
        numeroDose: 1,
        dataPrevista: "2026-10-31",
        status: "PROXIMA",
        diasParaVencer: 0
      });
    }
  });

  it("o que era devido ao nascer e não consta está atrasado", () => {
    expect(de(lista, "BCG")).toMatchObject({ status: "ATRASADA", dataPrevista: "2026-08-31" });
    expect(de(lista, "HEPATITE_B")).toMatchObject({ status: "ATRASADA" });
  });

  it("meningocócica C: 1ª dose aos 3 meses = em 30 dias", () => {
    expect(de(lista, "MENINGOCOCICA_C")).toMatchObject({
      dataPrevista: "2026-11-30",
      status: "PROXIMA",
      diasParaVencer: 30
    });
  });

  it("doses distantes aparecem como futuras, com a data certa", () => {
    expect(de(lista, "VARICELA")).toMatchObject({ dataPrevista: "2027-11-30", status: "FUTURA" });
    expect(de(lista, "TRIPLICE_VIRAL_SCR")).toMatchObject({ numeroDose: 1, dataPrevista: "2027-08-31" });
  });

  it("influenza só entra a partir dos 6 meses", () => {
    expect(de(lista, "INFLUENZA")).toBeUndefined();
  });

});

describe("intervalo mínimo entre doses", () => {

  it("rotavírus: 2ª dose = a maior entre 4 meses e 1ª dose + 60 dias", () => {
    const lista = calcular("2026-08-31", {
      ROTAVIRUS: [{ numero: 1, data: "2026-11-05" }]
    }, []);

    // 4 meses = 2026-12-31; 05/11 + 60 dias = 2027-01-04 (vale o maior)
    expect(de(lista, "ROTAVIRUS")).toMatchObject({
      numeroDose: 2,
      dataPrevista: "2027-01-04"
    });
  });

  it("não marca a dose antes da idade recomendada, mesmo com o intervalo cumprido", () => {
    const lista = calcular("2026-08-31", {
      PENTAVALENTE: [{ numero: 1, data: "2026-10-01" }]
    });

    // 2ª dose da penta: 4 meses (31/12/2026), não 01/10 + intervalo
    expect(de(lista, "PENTAVALENTE")).toMatchObject({ numeroDose: 2, dataPrevista: "2026-12-31" });
  });

  it("dose atrasada que foi tomada tarde empurra a seguinte (dT)", () => {
    const lista = calcular("1998-01-10", {
      DT: [{ numero: 1, data: "2024-01-10" }]
    });

    // 4ª dose: 24 anos já passou, mas só 10 anos depois de 2024-01-10
    expect(de(lista, "DT")).toMatchObject({ numeroDose: 2, dataPrevista: "2034-01-10", status: "FUTURA" });
  });

});

describe("jovem de 21 anos (nascida em 20/06/2005)", () => {

  const lista = calcular("2005-06-20", {
    DT: [{ numero: 1, data: "2019-05-06" }],
    FEBRE_AMARELA: [{ numero: 1, data: "2017-12-21" }],
    HPV4: [{ numero: 1, data: "2015-06-29" }, { numero: 2, data: "2016-01-13" }],
    COVID19: [{ numero: 3, data: "2022-07-08" }]
  });

  it("dT: próxima (4ª) dose aos 24 anos, 10 anos depois da anterior no mínimo", () => {
    expect(de(lista, "DT")).toMatchObject({
      numeroDose: 2,
      rotulo: "4ª dose de reforço",
      dataPrevista: "2029-06-20",
      status: "FUTURA",
      ultimaDose: "2019-05-06"
    });
  });

  it("o que não tem registro e vale 'conforme histórico' fica disponível agora", () => {
    expect(de(lista, "HEPATITE_B")).toMatchObject({ status: "DISPONIVEL", dataPrevista: null, numeroDose: 1 });
    expect(de(lista, "TRIPLICE_VIRAL_SCR")).toMatchObject({ status: "DISPONIVEL", numeroDose: 1 });
  });

  it("não cobra o que já foi cumprido nem o que passou da idade", () => {
    expect(de(lista, "FEBRE_AMARELA")).toBeUndefined();
    expect(de(lista, "HPV4")).toBeUndefined();
    expect(de(lista, "DENGUE_DNG4")).toBeUndefined();
    expect(de(lista, "MENINGOCOCICA_ACWY")).toBeUndefined();
    expect(de(lista, "COVID19")).toBeUndefined();
  });

  it("não cobra varicela de quem não é trabalhador da saúde nem indígena", () => {
    expect(de(lista, "VARICELA")).toBeUndefined();
  });

});

describe("reforço sem nenhuma dose registrada", () => {

  it("adulta sem dT: pode tomar agora, em vez de 'atrasada desde os 14 anos'", () => {
    const lista = calcular("2000-06-12");

    expect(de(lista, "DT")).toMatchObject({
      status: "DISPONIVEL",
      dataPrevista: null,
      diasParaVencer: null
    });
    expect(de(lista, "DT")?.rotulo).toContain("Sem doses registradas");
  });

  it("se há dose de DTP/penta (data de referência), segue a regra normal do reforço", () => {
    const lista = calcular("2000-06-12", {
      PENTAVALENTE: [{ numero: 3, data: "2000-12-12" }]
    });

    expect(de(lista, "DT")).toMatchObject({ status: "ATRASADA", dataPrevista: "2014-06-12" });
  });

  it("bebê sem registro continua com a data de cada dose (BCG ao nascer atrasada)", () => {
    const lista = calcular("2026-08-31");

    expect(de(lista, "BCG")).toMatchObject({ status: "ATRASADA", dataPrevista: "2026-08-31" });
  });

  it("criança de 2 anos sem registro: reforços (DTP, VIP) viram 'atualizar o esquema'", () => {
    const lista = calcular("2024-06-01");

    expect(de(lista, "DTP")).toMatchObject({ status: "DISPONIVEL", dataPrevista: null });
    // o que não é reforço mantém a data
    expect(de(lista, "PENTAVALENTE")).toMatchObject({ status: "ATRASADA", dataPrevista: "2024-08-01" });
  });

});

describe("equivalências", () => {

  it("a penta completa conta como hepatite B completa", () => {
    const lista = calcular("2014-03-10", {
      PENTAVALENTE: [
        { numero: 1, data: "2014-05-10" },
        { numero: 2, data: "2014-07-10" },
        { numero: 3, data: "2014-09-10" }
      ]
    });

    expect(de(lista, "HEPATITE_B")).toBeUndefined();
  });

  it("DTP recente reinicia a contagem dos 10 anos do dT", () => {
    const lista = calcular("1986-01-01", {
      DT: [{ numero: 3, data: "2010-03-10" }],
      DTPA: [{ numero: 1, data: "2024-06-01" }]
    });

    expect(de(lista, "DT")).toMatchObject({
      numeroDose: 0,
      dataPrevista: "2034-06-01",
      ultimaDose: "2024-06-01"
    });
  });

});

describe("adulto e idoso", () => {

  it("dT periódico atrasado mostra os dias de atraso", () => {
    const lista = calcular("1986-01-01", {
      DT: [{ numero: 3, data: "2016-03-10" }]
    });

    expect(de(lista, "DT")).toMatchObject({
      status: "ATRASADA",
      dataPrevista: "2026-03-10",
      diasParaVencer: -235
    });
  });

  it("SCR para trabalhador da saúde: 2 doses em qualquer idade", () => {
    const comum = calcular("1986-01-01", { TRIPLICE_VIRAL_SCR: [{ numero: 1, data: "2015-01-01" }] });
    const trabalhador = calcular(
      "1986-01-01",
      { TRIPLICE_VIRAL_SCR: [{ numero: 1, data: "2015-01-01" }] },
      ["TRABALHADOR_SAUDE"]
    );

    expect(de(comum, "TRIPLICE_VIRAL_SCR")).toBeUndefined();
    expect(de(trabalhador, "TRIPLICE_VIRAL_SCR")).toMatchObject({ numeroDose: 2, status: "DISPONIVEL" });
  });

  it("idoso: influenza anual e covid semestral a partir da última dose", () => {
    const lista = calcular("1956-01-01", {
      INFLUENZA: [{ numero: 1, data: "2026-04-20" }],
      COVID19: [{ numero: 1, data: "2026-02-10" }]
    });

    expect(de(lista, "INFLUENZA")).toMatchObject({ dataPrevista: "2027-04-20", status: "FUTURA" });
    expect(de(lista, "COVID19")).toMatchObject({ dataPrevista: "2026-08-10", status: "ATRASADA" });
    expect(de(lista, "TRIPLICE_VIRAL_SCR")).toBeUndefined();
  });

  it("sem nenhuma dose de uma vacina periódica: disponível agora", () => {
    const lista = calcular("1956-01-01");

    expect(de(lista, "INFLUENZA")).toMatchObject({ status: "DISPONIVEL", dataPrevista: null });
  });

});

describe("ordenação", () => {

  it("atrasadas primeiro, depois disponíveis, próximas e futuras", () => {
    const lista = calcular("2026-08-31");
    const ordem = lista.map((d) => d.status);

    const esperada = [...ordem].sort(
      (a, b) =>
        ["ATRASADA", "DISPONIVEL", "PROXIMA", "FUTURA"].indexOf(a) -
        ["ATRASADA", "DISPONIVEL", "PROXIMA", "FUTURA"].indexOf(b)
    );

    expect(ordem).toEqual(esperada);
  });

});

describe("dose já tomada x próxima dose (texto da tela)", () => {

  it("dT: quem tomou a 3ª dose de reforço aos 14 anos tem como próxima a 4ª, e a tela sabe o nome da tomada", () => {
    // nasceu em 12/05/2005; tomou 1 dose de dT em 06/05/2019 (aos 14 anos)
    const lista = calcular("2005-05-12", { DT: [{ numero: 1, data: "2019-05-06" }] });
    const dt = de(lista, "DT");
    expect(dt?.numeroDose).toBe(2);
    expect(dt?.rotulo).toBe("4ª dose de reforço");
    expect(dt?.rotuloUltimaTomada).toBe("3ª dose de reforço");
    expect(dt?.dosesTomadas).toBe(1);
    expect(dt?.ultimaDose).toBe("2019-05-06");
    // aos 24 anos (12/05/2029), e nunca antes de 10 anos da dose anterior (06/05/2029)
    expect(dt?.dataPrevista).toBe("2029-05-12");
  });

  it("sem dose tomada não há rótulo de dose tomada", () => {
    const dt = de(calcular("2005-05-12", {}), "DT");
    expect(dt?.rotuloUltimaTomada).toBeNull();
  });

});

describe("gestante", () => {

  const NASC = "1996-03-10";
  const dias = (n: number) => adicionarDias(HOJE, n);

  function gestante(semanas: number, doses: Record<string, Array<{ numero: number; data: string | null }>> = {}, grupos = ["GESTANTE"]) {
    return calcularProximasDoses({
      nascimento: NASC,
      hoje: HOJE,
      doses,
      grupos,
      gestacaoInicio: dias(-semanas * 7)
    });
  }

  it("não recebe sugestão de vacinas de vírus vivo (febre amarela, tríplice viral, varicela, tetraviral)", () => {
    const sem = calcular(NASC, {}).map((d) => d.vacinaCodigo);
    expect(sem).toContain("TRIPLICE_VIRAL_SCR");
    expect(sem).toContain("FEBRE_AMARELA");

    const grav = gestante(10).map((d) => d.vacinaCodigo);
    for (const vivo of ["TRIPLICE_VIRAL_SCR", "FEBRE_AMARELA", "VARICELA", "TETRAVIRAL"]) {
      expect(grav).not.toContain(vivo);
    }
  });

  it("com 10 semanas: hepatite B, dT, influenza e COVID já; dTpa só na 20ª semana e VSR só na 28ª", () => {
    const lista = gestante(10);

    expect(de(lista, "HEPATITE_B")).toMatchObject({ rotulo: "1ª dose", status: "DISPONIVEL" });
    expect(de(lista, "DT")).toMatchObject({ rotulo: "1ª dose (ao saber da gravidez)", status: "DISPONIVEL" });
    expect(de(lista, "INFLUENZA")).toMatchObject({ rotulo: "1 dose por temporada", status: "DISPONIVEL" });
    expect(de(lista, "COVID19")).toMatchObject({ rotulo: "1 dose a cada gestação", status: "DISPONIVEL" });

    // início = 70 dias atrás; 20 semanas = início + 140 dias = hoje + 70
    expect(de(lista, "DTPA")).toMatchObject({ dataPrevista: dias(70), status: "FUTURA" });
    // 28 semanas = início + 196 dias = hoje + 126
    expect(de(lista, "VSR")).toMatchObject({ dataPrevista: dias(126), status: "FUTURA" });
  });

  it("o dT da gestante (3 doses) substitui o reforço de adulto", () => {
    const lista = gestante(10);
    const dt = lista.filter((d) => d.vacinaCodigo === "DT");
    expect(dt).toHaveLength(1);
    expect(dt[0].numeroDose).toBe(1);

    const depoisDaPrimeira = gestante(10, { DT: [{ numero: 1, data: dias(-10) }] });
    expect(de(depoisDaPrimeira, "DT")).toMatchObject({ numeroDose: 2, dataPrevista: dias(50) });
  });

  it("com 25 semanas o dTpa já pode ser tomado (não é atraso) e o VSR está chegando", () => {
    const lista = gestante(25);
    expect(de(lista, "DTPA")).toMatchObject({ status: "DISPONIVEL", dataPrevista: null });
    // 28ª semana = daqui a 21 dias
    expect(de(lista, "VSR")).toMatchObject({ status: "PROXIMA", diasParaVencer: 21 });
  });

  it("com 30 semanas o VSR também pode ser tomado", () => {
    expect(de(gestante(30), "VSR")).toMatchObject({ status: "DISPONIVEL" });
  });

  it("dose de dTpa desta gestação quita; a de gestação anterior não conta", () => {
    const desta = gestante(30, { DTPA: [{ numero: 1, data: dias(-20) }] });
    expect(de(desta, "DTPA")).toBeUndefined();

    const anterior = gestante(30, { DTPA: [{ numero: 1, data: "2022-05-01" }] });
    expect(de(anterior, "DTPA")).toMatchObject({ status: "DISPONIVEL" });
  });

  it("COVID-19 a cada gestação: dose anterior ao início não conta; a de agora conta", () => {
    expect(de(gestante(10, { COVID19: [{ numero: 1, data: "2023-01-10" }] }), "COVID19")).toMatchObject({ status: "DISPONIVEL" });
    expect(de(gestante(10, { COVID19: [{ numero: 1, data: dias(-5) }] }), "COVID19")).toBeUndefined();
  });

  it("gestação encerrada (início há mais de 300 dias): volta ao calendário comum", () => {
    const lista = calcularProximasDoses({ nascimento: NASC, hoje: HOJE, doses: {}, grupos: ["GESTANTE"], gestacaoInicio: dias(-320) });
    const codigos = lista.map((d) => d.vacinaCodigo);
    expect(codigos).toContain("TRIPLICE_VIRAL_SCR");
    expect(codigos).not.toContain("DTPA");
    expect(codigos).not.toContain("VSR");
  });

  it("cadastro antigo sem data de início: dT e influenza valem; dTpa, VSR e COVID (dependem das semanas) não aparecem", () => {
    const lista = calcularProximasDoses({ nascimento: NASC, hoje: HOJE, doses: {}, grupos: ["GESTANTE"] });
    const codigos = lista.map((d) => d.vacinaCodigo);
    expect(codigos).toContain("DT");
    expect(codigos).toContain("INFLUENZA");
    expect(codigos).not.toContain("DTPA");
    expect(codigos).not.toContain("VSR");
    expect(codigos).not.toContain("COVID19");
  });

  it("quem não é gestante não recebe nenhuma das regras da gestação", () => {
    const codigos = calcular(NASC, {}).map((d) => d.vacinaCodigo);
    for (const so of ["DTPA", "VSR", "COVID19", "INFLUENZA"]) {
      expect(codigos).not.toContain(so);
    }
  });

});
