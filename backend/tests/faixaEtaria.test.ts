import { describe, it, expect } from "vitest";

import { obterFaixaEtaria } from "../src/utils/faixaEtaria";

/* Limites dos calendários 2026: criança 0-9, adolescente e jovem 10-24, adulto 25-59, idoso 60+. */
describe("obterFaixaEtaria", () => {

  it("respeita os limites do Calendário Nacional 2026", () => {
    expect(obterFaixaEtaria(0)).toBe("CRIANCA");
    expect(obterFaixaEtaria(9)).toBe("CRIANCA");
    expect(obterFaixaEtaria(10)).toBe("ADOLESCENTE");
    expect(obterFaixaEtaria(24)).toBe("ADOLESCENTE");
    expect(obterFaixaEtaria(25)).toBe("ADULTO");
    expect(obterFaixaEtaria(59)).toBe("ADULTO");
    expect(obterFaixaEtaria(60)).toBe("IDOSO");
    expect(obterFaixaEtaria(95)).toBe("IDOSO");
  });

});
