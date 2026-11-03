import { describe, it, expect } from "vitest";
import {
  dataIsoValida, dataNaoFutura, dataNascimentoValida, emailValido,
  numeroDoseValido, parentescoValido
} from "../../src/utils/validacao";

/* Regras de validação de entrada (COR-25). "Hoje" fixo: 2026-11-03. */
const HOJE = new Date("2026-11-03T15:00:00Z");

describe("dataIsoValida", () => {
  it.each(["2026-11-03", "2000-02-29", "1990-12-31"])("aceita %s", (v) => expect(dataIsoValida(v)).toBe(true));
  it.each([
    "2026-02-29", "2023-02-29", "2020-02-30", "2026-13-01", "2026-00-10", "2026-04-31",
    "14/05/1990", "1990-5-14", "abc", "", " 2026-11-03", "2026-11-03T10:00:00", null, undefined, 20261103
  ])("recusa %s", (v) => expect(dataIsoValida(v as any)).toBe(false));
});

describe("dataNaoFutura e dataNascimentoValida", () => {
  it("hoje vale; amanhã não", () => {
    expect(dataNaoFutura("2026-11-03", HOJE)).toBe(true);
    expect(dataNaoFutura("2026-11-04", HOJE)).toBe(false);
  });
  it("nascimento: aceita recém-nascido e idoso, recusa futuro e idade absurda", () => {
    expect(dataNascimentoValida("2026-11-03", HOJE)).toBe(true);
    expect(dataNascimentoValida("1930-01-01", HOJE)).toBe(true);
    expect(dataNascimentoValida("2026-11-04", HOJE)).toBe(false);
    expect(dataNascimentoValida("2099-01-01", HOJE)).toBe(false);
    expect(dataNascimentoValida("1800-01-01", HOJE)).toBe(false);
  });
  it("limite de 130 anos: exatamente 130 anos atrás vale, um dia antes não", () => {
    expect(dataNascimentoValida("1896-11-03", HOJE)).toBe(true);
    expect(dataNascimentoValida("1896-11-02", HOJE)).toBe(false);
  });
  it("usa o dia do Brasil: 01h UTC do dia 4 ainda é dia 3 em São Paulo", () => {
    const quase = new Date("2026-11-04T01:00:00Z"); // 22h de 03/11 em Brasília
    expect(dataNaoFutura("2026-11-03", quase)).toBe(true);
    expect(dataNaoFutura("2026-11-04", quase)).toBe(false);
  });
});

describe("emailValido", () => {
  it.each(["a@b.co", "ayla.pedroga@gmail.com", "x+tag@dominio.com.br"])("aceita %s", (v) => expect(emailValido(v)).toBe(true));
  it.each(["", "sem-arroba", "a@b", "a@@b.com", "a b@c.com", "@b.com", "a@.com", null, 5])("recusa %s", (v) => expect(emailValido(v as any)).toBe(false));
  it("recusa e-mail com mais de 254 caracteres", () => expect(emailValido("a".repeat(250) + "@b.com")).toBe(false));
});

describe("numeroDoseValido", () => {
  it.each([1, 2, 3, 20])("aceita %s", (v) => expect(numeroDoseValido(v)).toBe(true));
  it.each([0, -1, 21, 99, 1.5, NaN, Infinity, "1", "a", null, undefined, true])("recusa %s", (v) => expect(numeroDoseValido(v as any)).toBe(false));
});

describe("parentescoValido", () => {
  it.each(["filho", "Filha", "pai", "mae", "Mãe", "CÔNJUGE", "conjuge", " outro ", "avó", "Irmão"])("aceita %s", (v) => expect(parentescoValido(v)).toBe(true));
  it.each(["", "robo", "titular?", null, 3])("recusa %s", (v) => expect(parentescoValido(v as any)).toBe(false));
});
