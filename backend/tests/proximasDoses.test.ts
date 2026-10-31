import { describe, it, expect } from "vitest";

import {
  adicionarDias,
  adicionarMeses,
  calcularProximasDoses,
  diasEntre,
  idadeEmMeses,
  ProximaDose
} from "../src/utils/proximasDoses";

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
