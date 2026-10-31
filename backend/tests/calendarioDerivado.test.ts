import { describe, it, expect } from "vitest";

import {
  derivarCalendarioPorFaixa,
  LinhaCalendario
} from "../src/utils/calendarioDerivado";

const linhas = derivarCalendarioPorFaixa();

const de = (faixa: string, vacina: string): LinhaCalendario | undefined =>
  linhas.find((l) => l.faixa === faixa && l.vacinaCodigo === vacina);

describe("calendário por faixa derivado do esquema 2026", () => {

  it("criança: números de doses do calendário 2026", () => {
    expect(de("CRIANCA", "HEPATITE_B")?.doses).toBe(1);
    expect(de("CRIANCA", "PENTAVALENTE")?.doses).toBe(3);
    expect(de("CRIANCA", "POLIO_VIP")?.doses).toBe(5);
    expect(de("CRIANCA", "FEBRE_AMARELA")?.doses).toBe(2);
    expect(de("CRIANCA", "TRIPLICE_VIRAL_SCR")?.doses).toBe(2);
    expect(de("CRIANCA", "VARICELA")?.doses).toBe(2);
    expect(de("CRIANCA", "COVID19")?.doses).toBe(3);
    expect(de("CRIANCA", "INFLUENZA")?.reforcos).toBe(1);
  });

  it("criança: vacinas que saíram do calendário não aparecem", () => {
    expect(de("CRIANCA", "POLIO_VOP")).toBeUndefined();
    expect(de("CRIANCA", "TETRAVIRAL")).toBeUndefined();
  });

  it("adolescente e jovem", () => {
    expect(de("ADOLESCENTE", "HPV4")?.doses).toBe(1);
    expect(de("ADOLESCENTE", "DENGUE_DNG4")?.doses).toBe(2);
    expect(de("ADOLESCENTE", "MENINGOCOCICA_ACWY")?.doses).toBe(1);
    expect(de("ADOLESCENTE", "DT")).toMatchObject({ doses: 2, reforcos: 1 });
    expect(de("ADOLESCENTE", "HEPATITE_B")?.doses).toBe(3);
  });

  it("adulto e idoso", () => {
    expect(de("ADULTO", "DT")?.reforcos).toBe(1);
    expect(de("IDOSO", "INFLUENZA")).toMatchObject({ doses: 0, reforcos: 1 });
    expect(de("IDOSO", "COVID19")).toMatchObject({ doses: 0, reforcos: 1 });
    expect(de("IDOSO", "PNEUMOCOCICA_20V")?.observacao).toContain("a partir de 85 anos");
  });

  it("varicela só aparece como grupo (trabalhador da saúde, indígena), não por faixa", () => {
    expect(de("ADULTO", "VARICELA")).toBeUndefined();
    expect(de("IDOSO", "VARICELA")).toBeUndefined();
  });

  it("descreve as idades em cada dose", () => {
    expect(de("CRIANCA", "PENTAVALENTE")?.observacao)
      .toBe("1ª dose (aos 2 meses); 2ª dose (aos 4 meses); 3ª dose (aos 6 meses)");
    expect(de("CRIANCA", "HPV4")?.observacao).toContain("aos 9 anos");
  });

  it("usa as faixas etárias do calendário", () => {
    expect(de("CRIANCA", "BCG")).toMatchObject({ idadeMinima: 0, idadeMaxima: 9 });
    expect(de("ADOLESCENTE", "HPV4")).toMatchObject({ idadeMinima: 10, idadeMaxima: 24 });
    expect(de("ADULTO", "DT")).toMatchObject({ idadeMinima: 25, idadeMaxima: 59 });
  });

});
