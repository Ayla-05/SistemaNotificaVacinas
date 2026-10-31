import { describe, it, expect } from "vitest";

import {
  deveEnviarResumo,
  ehResumoPeriodico,
  frequenciaValida
} from "../src/utils/frequenciaAviso";

describe("frequenciaValida", () => {

  it("aceita só as frequências conhecidas", () => {
    for (const f of ["UMA_VEZ", "DIARIA", "SEMANAL", "MENSAL", "DESATIVADO"]) {
      expect(frequenciaValida(f)).toBe(true);
    }

    expect(frequenciaValida("QUINZENAL")).toBe(false);
    expect(frequenciaValida("semanal")).toBe(false);
    expect(frequenciaValida(undefined)).toBe(false);
  });

  it("só diária, semanal e mensal são resumos periódicos", () => {
    expect(ehResumoPeriodico("DIARIA")).toBe(true);
    expect(ehResumoPeriodico("SEMANAL")).toBe(true);
    expect(ehResumoPeriodico("MENSAL")).toBe(true);
    expect(ehResumoPeriodico("UMA_VEZ")).toBe(false);
    expect(ehResumoPeriodico("DESATIVADO")).toBe(false);
  });

});

describe("deveEnviarResumo", () => {

  it("nunca envia resumo em UMA_VEZ ou DESATIVADO", () => {
    expect(deveEnviarResumo("UMA_VEZ", null, "2026-10-31")).toBe(false);
    expect(deveEnviarResumo("DESATIVADO", null, "2026-10-31")).toBe(false);
  });

  it("sem envio anterior, envia", () => {
    expect(deveEnviarResumo("DIARIA", null, "2026-10-31")).toBe(true);
    expect(deveEnviarResumo("SEMANAL", null, "2026-10-31")).toBe(true);
    expect(deveEnviarResumo("MENSAL", null, "2026-10-31")).toBe(true);
  });

  it("diária: uma vez por dia", () => {
    expect(deveEnviarResumo("DIARIA", "2026-10-31", "2026-10-31")).toBe(false);
    expect(deveEnviarResumo("DIARIA", "2026-10-30", "2026-10-31")).toBe(true);
  });

  it("semanal: só depois de 7 dias", () => {
    expect(deveEnviarResumo("SEMANAL", "2026-10-25", "2026-10-31")).toBe(false);
    expect(deveEnviarResumo("SEMANAL", "2026-10-24", "2026-10-31")).toBe(true);
    expect(deveEnviarResumo("SEMANAL", "2026-10-01", "2026-10-31")).toBe(true);
  });

  it("mensal: só depois de 1 mês (respeitando o fim do mês)", () => {
    expect(deveEnviarResumo("MENSAL", "2026-10-15", "2026-11-14")).toBe(false);
    expect(deveEnviarResumo("MENSAL", "2026-10-15", "2026-11-15")).toBe(true);
    // 31/01 + 1 mês = 28/02
    expect(deveEnviarResumo("MENSAL", "2027-01-31", "2027-02-27")).toBe(false);
    expect(deveEnviarResumo("MENSAL", "2027-01-31", "2027-02-28")).toBe(true);
  });

});
