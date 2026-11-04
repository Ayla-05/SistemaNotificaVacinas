import { describe, it, expect, vi, afterEach } from "vitest";
import { hojeIso, idadeEmAnos } from "../../src/utils/dataHoje";
import { obterFaixaEtaria } from "../../src/utils/faixaEtaria";
import { VacinalService } from "../../src/services/vacinalService";

/*
Idade, "hoje" e faixa etária nas datas-limite (COR-26): véspera e dia
do aniversário, ano bissexto e virada do dia em fuso diferente do UTC.
*/

afterEach(() => vi.useRealTimers());

describe("idadeEmAnos", () => {
  it("a véspera do aniversário ainda não conta o ano", () => {
    expect(idadeEmAnos("1990-05-14", "2026-05-13")).toBe(35);
  });
  it("no dia do aniversário já conta", () => {
    expect(idadeEmAnos("1990-05-14", "2026-05-14")).toBe(36);
    expect(idadeEmAnos("1990-05-14", "2026-05-15")).toBe(36);
  });
  it("mês anterior e posterior ao aniversário", () => {
    expect(idadeEmAnos("1990-05-14", "2026-04-30")).toBe(35);
    expect(idadeEmAnos("1990-05-14", "2026-06-01")).toBe(36);
  });
  it("nascido em 29/02: em ano comum, completa em 01/03", () => {
    expect(idadeEmAnos("2000-02-29", "2026-02-28")).toBe(25);
    expect(idadeEmAnos("2000-02-29", "2026-03-01")).toBe(26);
    expect(idadeEmAnos("2000-02-29", "2028-02-29")).toBe(28);
  });
  it("recém-nascido tem 0 anos; 11 meses e 29 dias também", () => {
    expect(idadeEmAnos("2026-11-03", "2026-11-03")).toBe(0);
    expect(idadeEmAnos("2025-11-04", "2026-11-03")).toBe(0);
    expect(idadeEmAnos("2025-11-03", "2026-11-03")).toBe(1);
  });
  it("ignora o horário se vier data completa", () => {
    expect(idadeEmAnos("1990-05-14T00:00:00.000Z", "2026-05-13")).toBe(35);
  });
});

describe("hojeIso (dia civil de São Paulo)", () => {
  it("22h de 13/05 em Brasília ainda é dia 13, embora em UTC já seja dia 14", () => {
    expect(hojeIso(new Date("2026-05-14T01:00:00Z"))).toBe("2026-05-13");
  });
  it("meio-dia em Brasília", () => {
    expect(hojeIso(new Date("2026-05-14T15:00:00Z"))).toBe("2026-05-14");
  });
  it("virada de ano", () => {
    expect(hojeIso(new Date("2027-01-01T02:00:00Z"))).toBe("2026-12-31");
    expect(hojeIso(new Date("2027-01-01T03:00:00Z"))).toBe("2027-01-01");
  });
});

describe("VacinalService.calcularIdade (relógio do sistema)", () => {
  it("não antecipa o aniversário, qualquer que seja o fuso da máquina", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-05-13T15:00:00-03:00"));
    expect(VacinalService.calcularIdade("1990-05-14")).toBe(35);
    vi.setSystemTime(new Date("2026-05-14T09:00:00-03:00"));
    expect(VacinalService.calcularIdade("1990-05-14")).toBe(36);
  });
});

describe("faixa etária nas fronteiras (Calendário Nacional 2026)", () => {
  it.each([
    [0, "CRIANCA"], [9, "CRIANCA"], [10, "ADOLESCENTE"], [24, "ADOLESCENTE"],
    [25, "ADULTO"], [59, "ADULTO"], [60, "IDOSO"], [110, "IDOSO"]
  ])("%s anos → %s", (idade, faixa) => expect(obterFaixaEtaria(idade as number)).toBe(faixa));

  it("quem faz 25 anos amanhã ainda é adolescente hoje", () => {
    expect(obterFaixaEtaria(idadeEmAnos("2001-05-14", "2026-05-13"))).toBe("ADOLESCENTE");
    expect(obterFaixaEtaria(idadeEmAnos("2001-05-14", "2026-05-14"))).toBe("ADULTO");
  });
  it("quem faz 60 anos amanhã ainda é adulto hoje", () => {
    expect(obterFaixaEtaria(idadeEmAnos("1966-05-14", "2026-05-13"))).toBe("ADULTO");
    expect(obterFaixaEtaria(idadeEmAnos("1966-05-14", "2026-05-14"))).toBe("IDOSO");
  });
});
