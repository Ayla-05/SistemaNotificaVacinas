import { describe, it, expect } from "vitest";

import {
  extrairDadosCarteirinha,
  extrairDose,
  extrairDatas
} from "../src/utils/extratorCarteirinha";
import { validarDataAplicacao, validarDataNascimento, dataIsoExiste, hojeLocalISO } from "../src/utils/validacao";

const CATALOGO = [
  "BCG", "Hepatite A", "Hepatite B", "Pentavalente", "DTP", "dT", "dTpa",
  "Poliomielite VIP", "Poliomielite VOP", "Rotavírus Humano", "Febre Amarela",
  "Tríplice Viral SCR", "Tetraviral", "Varicela", "HPV4", "Influenza",
  "COVID-19", "Meningocócica C", "Meningocócica ACWY"
];
const HOJE = new Date("2026-10-31T12:00:00Z");

describe("extrator: entradas hostis ou vazias", () => {

  it("texto vazio ou só espaços dá erro claro, sem travar", () => {
    expect(() => extrairDadosCarteirinha("", CATALOGO, HOJE)).toThrow(/identificar/i);
    expect(() => extrairDadosCarteirinha("   \n\n  ", CATALOGO, HOJE)).toThrow(/identificar/i);
  });

  it("texto sem nenhuma vacina conhecida dá erro claro", () => {
    expect(() => extrairDadosCarteirinha("Receita de bolo: 3 ovos, 2 xícaras de farinha.", CATALOGO, HOJE)).toThrow(/identificar/i);
  });

  it("texto enorme não trava (sem regex catastrófica)", () => {
    const lixo = "a".repeat(200_000) + "\n" + "| ".repeat(20_000);
    const t0 = Date.now();
    expect(() => extrairDadosCarteirinha(lixo, CATALOGO, HOJE)).toThrow();
    expect(Date.now() - t0).toBeLessThan(3000);
  });

  it("não confunde a data de nascimento com a data de aplicação", () => {
    const texto = "Nome: Maria Silva\nData de nascimento: 12/05/2005\n| BCG | 14/05/2005 | Dose única | L123 |";
    const d = extrairDadosCarteirinha(texto, CATALOGO, HOJE);
    expect(d.dataNascimentoTitular).toBe("2005-05-12");
    expect(d.registros[0].dataAplicacao).toBe("2005-05-14");
  });

  it("ignora datas futuras como data de aplicação", () => {
    const d = extrairDadosCarteirinha("| Influenza | 10/10/2099 | Dose única |", CATALOGO, HOJE);
    expect(d.registros[0].dataAplicacao).toBeNull();
  });

  it("nunca devolve registros duplicados idênticos", () => {
    const linha = "| BCG | 01/02/2020 | Dose única | L1 |";
    const d = extrairDadosCarteirinha([linha, linha, linha].join("\n"), CATALOGO, HOJE);
    expect(d.registros).toHaveLength(1);
  });

});

describe("extrator: doses em formatos variados", () => {

  const casos: Array<[string, string | null]> = [
    ["1ª dose", "1ª dose"],
    ["2a dose", "2ª dose"],
    ["3º dose", "3ª dose"],
    ["D1", "1ª dose"],
    ["D2", "2ª dose"],
    ["Dose única", "Dose única"],
    ["DU", "Dose única"],
    ["Reforço", "Reforço"],
    ["1º reforço", "1º reforço"],
    ["2/3", "2ª dose"],
    ["Revacinação", "Reforço"],
    ["Dose Inicial", "1ª dose"]
  ];

  for (const [entrada, esperado] of casos) {
    it(`"${entrada}" -> ${esperado}`, () => {
      expect(extrairDose(entrada)).toBe(esperado);
    });
  }

  it("data parecida com fração não vira dose", () => {
    expect(extrairDose("aplicada em 10/02/2023")).toBeNull();
  });

});

describe("datas", () => {

  it("rejeita datas impossíveis e aceita 29/02 de ano bissexto", () => {
    expect(extrairDatas("31/04/2020", HOJE)).toEqual([]);
    expect(extrairDatas("29/02/2021", HOJE)).toEqual([]);
    expect(extrairDatas("29/02/2020", HOJE)).toEqual(["2020-02-29"]);
  });

  it("ano de dois dígitos: não inventa um ano no futuro", () => {
    const [d] = extrairDatas("10/10/99", HOJE);
    expect(d <= "2026-10-31").toBe(true);
  });

});

describe("validação de datas (serviço)", () => {

  it("dataIsoExiste", () => {
    expect(dataIsoExiste("2024-02-29")).toBe(true);
    expect(dataIsoExiste("2023-02-29")).toBe(false);
    expect(dataIsoExiste("2023-13-01")).toBe(false);
    expect(dataIsoExiste("2023-1-1")).toBe(false);
    expect(dataIsoExiste(20230101)).toBe(false);
    expect(dataIsoExiste(null)).toBe(false);
  });

  it("nascimento: hoje vale, amanhã não; 1899 não", () => {
    const hoje = "2026-10-31";
    expect(validarDataNascimento("2026-10-31", hoje)).toBe("2026-10-31");
    expect(() => validarDataNascimento("2026-11-01", hoje)).toThrow();
    expect(() => validarDataNascimento("1899-12-31", hoje)).toThrow();
  });

  it("aplicação: no dia do nascimento vale, antes não", () => {
    expect(validarDataAplicacao("2005-05-12", "2005-05-12", "2026-10-31")).toBe("2005-05-12");
    expect(() => validarDataAplicacao("2005-05-11", "2005-05-12", "2026-10-31")).toThrow();
  });

  it("hojeLocalISO usa o dia civil de São Paulo, qualquer que seja o fuso da máquina (COR-26)", () => {
    // 22h30 de 31/10 em Brasília já é 01h30 de 01/11 em UTC: o dia continua sendo 31
    expect(hojeLocalISO(new Date("2026-11-01T01:30:00Z"))).toBe("2026-10-31");
    // 00h05 de 01/01 em Brasília = 03h05 UTC
    expect(hojeLocalISO(new Date("2026-01-01T03:05:00Z"))).toBe("2026-01-01");
    // 21h de 31/12 em Brasília ainda é 2026 (em UTC já é 2027)
    expect(hojeLocalISO(new Date("2027-01-01T00:00:00Z"))).toBe("2026-12-31");
  });

});
