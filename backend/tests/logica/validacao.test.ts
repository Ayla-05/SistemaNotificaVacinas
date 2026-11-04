import { describe, it, expect } from "vitest";
import {
  dataIsoExiste, emailValido, hojeLocalISO, normalizarEmail, validarDadosPessoa,
  validarDataAplicacao, validarDataNascimento, validarNumeroDose, validarTexto
} from "../../src/utils/validacao";

/* Regras de validação de entrada (COR-25). "Hoje" fixo: 2026-11-03. */
const HOJE = "2026-11-03";

describe("dataIsoExiste", () => {
  it.each(["2026-11-03", "2000-02-29", "1990-12-31"])("aceita %s", (v) => expect(dataIsoExiste(v)).toBe(true));
  it.each([
    "2026-02-29", "2023-02-29", "2020-02-30", "2026-13-01", "2026-00-10", "2026-04-31",
    "14/05/1990", "1990-5-14", "abc", "", "2026-11-03T10:00:00", null, undefined, 20261103
  ])("recusa %s", (v) => expect(dataIsoExiste(v as any)).toBe(false));
});

describe("validarDataNascimento", () => {
  it("aceita recém-nascido, hoje e idoso", () => {
    expect(validarDataNascimento("2026-11-03", HOJE)).toBe("2026-11-03");
    expect(validarDataNascimento("1930-01-01", HOJE)).toBe("1930-01-01");
  });
  it("recusa data no futuro, ano anterior a 1900 e formato inválido", () => {
    expect(() => validarDataNascimento("2026-11-04", HOJE)).toThrow(/futuro/);
    expect(() => validarDataNascimento("2099-01-01", HOJE)).toThrow(/futuro/);
    expect(() => validarDataNascimento("1800-01-01", HOJE)).toThrow(/inválida/);
    expect(() => validarDataNascimento("14/05/1990", HOJE)).toThrow(/AAAA-MM-DD/);
    expect(() => validarDataNascimento("2020-02-30", HOJE)).toThrow(/inválida/);
  });
});

describe("validarDataAplicacao", () => {
  it("aceita hoje e data posterior ao nascimento", () => {
    expect(validarDataAplicacao("2026-11-03", "1990-05-14", HOJE)).toBe("2026-11-03");
    expect(validarDataAplicacao("2023-02-10", "1990-05-14", HOJE)).toBe("2023-02-10");
  });
  it("recusa futura, impossível e anterior ao nascimento", () => {
    expect(() => validarDataAplicacao("2026-11-04", "1990-05-14", HOJE)).toThrow(/futuro/);
    expect(() => validarDataAplicacao("2020-02-30", null, HOJE)).toThrow(/inválida/);
    expect(() => validarDataAplicacao("1980-01-01", "1990-05-14", HOJE)).toThrow(/anterior ao nascimento/);
  });
});

describe("hojeLocalISO (dia civil de São Paulo, COR-26)", () => {
  it("01h UTC do dia 4 ainda é dia 3 em Brasília", () => {
    expect(hojeLocalISO(new Date("2026-11-04T01:00:00Z"))).toBe("2026-11-03");
    expect(hojeLocalISO(new Date("2026-11-04T03:00:00Z"))).toBe("2026-11-04");
  });
});

describe("emailValido e normalizarEmail", () => {
  it.each(["a@b.co", "ayla.pedroga@gmail.com", "x+tag@dominio.com.br"])("aceita %s", (v) => expect(emailValido(v)).toBe(true));
  it.each(["", "sem-arroba", "a@b", "a@@b.com", "a b@c.com", "@b.com", "a@.com"])("recusa %s", (v) => expect(emailValido(v)).toBe(false));
  it("recusa e-mail com mais de 254 caracteres", () => expect(emailValido("a".repeat(250) + "@b.com")).toBe(false));
  it("normaliza espaços e caixa", () => expect(normalizarEmail("  Ana@Exemplo.COM ")).toBe("ana@exemplo.com"));
});

describe("validarNumeroDose", () => {
  it.each([1, 2, 3, 20, "2"])("aceita %s", (v) => expect(validarNumeroDose(v)).toBe(Number(v)));
  it.each([0, -1, 21, 99, 1.5, NaN, Infinity, "a", null, undefined])("recusa %s", (v) =>
    expect(() => validarNumeroDose(v)).toThrow(/Número da dose inválido/));
});

describe("validarTexto", () => {
  it("devolve o texto sem espaços nas pontas e aceita ausente quando opcional", () => {
    expect(validarTexto("  oi ", "Campo", { max: 10 })).toBe("oi");
    expect(validarTexto(undefined, "Campo", { max: 10 })).toBeUndefined();
  });
  it("recusa obrigatório vazio, tipo errado e texto longo", () => {
    expect(() => validarTexto("   ", "Nome", { obrigatorio: true, max: 10 })).toThrow(/obrigatório/);
    expect(() => validarTexto(5, "Nome", { max: 10 })).toThrow(/inválido/);
    expect(() => validarTexto("x".repeat(11), "Nome", { max: 10 })).toThrow(/muito longo/);
  });
});

describe("validarDadosPessoa", () => {
  const base = { nome: "Ana", data_nascimento: "1990-05-14" };
  it("aceita cadastro completo e atualização parcial", () => {
    expect(() => validarDadosPessoa(base, true)).not.toThrow();
    expect(() => validarDadosPessoa({ telefone: "11999999999" }, false)).not.toThrow();
  });
  it("na criação exige nome e nascimento; na atualização recusa nome vazio", () => {
    expect(() => validarDadosPessoa({ data_nascimento: "1990-05-14" }, true)).toThrow(/Nome/);
    expect(() => validarDadosPessoa({ nome: "Ana" }, true)).toThrow(/nascimento/i);
    expect(() => validarDadosPessoa({ nome: "   " }, false)).toThrow(/Nome/);
  });
  it("recusa e-mail inválido, estado com mais de 2 letras e textos longos", () => {
    expect(() => validarDadosPessoa({ ...base, email: "x" }, true)).toThrow(/E-mail/);
    expect(() => validarDadosPessoa({ ...base, estado: "São Paulo" }, true)).toThrow(/Estado/);
    expect(() => validarDadosPessoa({ ...base, nome: "x".repeat(121) }, true)).toThrow(/muito longo/);
  });
});
