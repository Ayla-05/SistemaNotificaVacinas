import { describe, it, expect } from "vitest";

import {
  casarVacina,
  extrairDatas,
  extrairDadosCarteirinha,
  extrairDose
} from "../src/utils/extratorCarteirinha";

/* Mesmos nomes do seed do catálogo (vacinasSeed.ts). */
const CATALOGO = [
  "BCG", "Hepatite A", "Hepatite B", "Pentavalente", "DTP", "dT", "dTpa",
  "Poliomielite VIP", "Poliomielite VOP", "Rotavírus Humano", "Febre Amarela",
  "Tríplice Viral SCR", "Tetraviral", "Varicela", "HPV4", "Influenza",
  "COVID-19", "Meningocócica C", "Meningocócica ACWY",
  "Pneumocócica 10-valente", "Pneumocócica 20-valente",
  "Pneumocócica 23-valente", "Dengue DNG4"
];

const HOJE = new Date("2026-10-31T12:00:00Z");

describe("casarVacina", () => {

  it("reconhece todo nome do catálogo escrito por extenso", () => {
    for (const nome of CATALOGO) {
      expect(casarVacina(`| ${nome} | 1ª dose |`, CATALOGO)?.nome).toBe(nome);
    }
  });

  it("ignora acentos e caixa", () => {
    expect(casarVacina("ROTAVIRUS HUMANO", CATALOGO)?.nome).toBe("Rotavírus Humano");
    expect(casarVacina("triplice viral", CATALOGO)?.nome).toBe("Tríplice Viral SCR");
  });

  it("entende abreviações comuns", () => {
    expect(casarVacina("Hep B 2ª dose", CATALOGO)?.nome).toBe("Hepatite B");
    expect(casarVacina("Pneumo 10", CATALOGO)?.nome).toBe("Pneumocócica 10-valente");
    expect(casarVacina("Gotinha (VOP)", CATALOGO)?.nome).toBe("Poliomielite VOP");
    expect(casarVacina("SCR", CATALOGO)?.nome).toBe("Tríplice Viral SCR");
  });

  it("não confunde vacinas parecidas", () => {
    expect(casarVacina("Hepatite A", CATALOGO)?.nome).toBe("Hepatite A");
    expect(casarVacina("dTpa", CATALOGO)?.nome).toBe("dTpa");
    expect(casarVacina("DTP", CATALOGO)?.nome).toBe("DTP");
    expect(casarVacina("Poliomielite VIP", CATALOGO)?.nome).toBe("Poliomielite VIP");
  });

  it("prefere o nome mais específico (pentavalente, não DTP)", () => {
    expect(casarVacina("Pentavalente (DTP+Hib+HB)", CATALOGO)?.nome).toBe("Pentavalente");
  });

  it("devolve null para o que não é vacina do catálogo", () => {
    expect(casarVacina("Cartão Nacional de Saúde", CATALOGO)).toBeNull();
  });

});

describe("extrairDatas", () => {

  it("lê os formatos mais comuns", () => {
    expect(extrairDatas("12/03/2021", HOJE)).toEqual(["2021-03-12"]);
    expect(extrairDatas("12-03-21", HOJE)).toEqual(["2021-03-12"]);
    expect(extrairDatas("2021-03-12", HOJE)).toEqual(["2021-03-12"]);
    expect(extrairDatas("5.1.2020", HOJE)).toEqual(["2020-01-05"]);
  });

  it("interpreta ano de 2 dígitos no século certo", () => {
    expect(extrairDatas("01/01/99", HOJE)).toEqual(["1999-01-01"]);
    expect(extrairDatas("01/01/05", HOJE)).toEqual(["2005-01-01"]);
  });

  it("rejeita datas impossíveis", () => {
    expect(extrairDatas("31/02/2021", HOJE)).toEqual([]);
    expect(extrairDatas("45/13/2021", HOJE)).toEqual([]);
  });

});

describe("extrairDose", () => {

  it("reconhece as formas usuais", () => {
    expect(extrairDose("Dose única")).toBe("Dose única");
    expect(extrairDose("DU")).toBe("Dose única");
    expect(extrairDose("1ª dose")).toBe("1ª dose");
    expect(extrairDose("2a dose")).toBe("2ª dose");
    expect(extrairDose("D3")).toBe("3ª dose");
    expect(extrairDose("Reforço")).toBe("Reforço");
    expect(extrairDose("1º reforço")).toBe("1º reforço");
  });

  it("devolve null quando não há dose", () => {
    expect(extrairDose("lote AB1234")).toBeNull();
  });

});

describe("extrairDadosCarteirinha", () => {

  it("lê uma tabela em Markdown (saída típica do Docling)", () => {
    const texto = `
## Caderneta de Vacinação

Nome: Ana Souza Lima
Data de nascimento: 14/05/1990

| Vacina | Dose | Data | Lote | Unidade |
|---|---|---|---|---|
| Hepatite B | 1ª dose | 10/02/2023 | HB2301 | UBS Vila Nova |
| Hepatite B | 2ª dose | 10/03/2023 | HB2377 | UBS Vila Nova |
| dT | Reforço | 22/08/2024 | DT55871 | UBS Centro |
| COVID-19 | 2ª dose | 01/06/2021 | FF7421 | UBS Centro |
`;

    const dados = extrairDadosCarteirinha(texto, CATALOGO, HOJE);

    expect(dados).toEqual({
      vacina: "dT",
      dose: "Reforço",
      dataAplicacao: "2024-08-22",
      lote: "DT55871",
      localAplicacao: "UBS Centro",
      nomeTitular: "Ana Souza Lima",
      dataNascimentoTitular: "1990-05-14"
    });
  });

  it("lê linhas soltas com rótulos", () => {
    const texto = `
Paciente: João Pedro Alves
Nascimento: 03/11/2015

Febre Amarela - Dose única - 15/01/2022 - Lote: 211VFA042Z - Local: UBS Jardim das Flores
`;

    const dados = extrairDadosCarteirinha(texto, CATALOGO, HOJE);

    expect(dados.vacina).toBe("Febre Amarela");
    expect(dados.dose).toBe("Dose única");
    expect(dados.dataAplicacao).toBe("2022-01-15");
    expect(dados.lote).toBe("211VFA042Z");
    expect(dados.localAplicacao).toBe("UBS Jardim das Flores");
    expect(dados.nomeTitular).toBe("João Pedro Alves");
    expect(dados.dataNascimentoTitular).toBe("2015-11-03");
  });

  it("não confunde o nome da vacina com o lote (COVID-19, HPV4)", () => {
    const dados = extrairDadosCarteirinha(
      "| COVID-19 | 1ª dose | 05/05/2021 |  |",
      CATALOGO,
      HOJE
    );

    expect(dados.vacina).toBe("COVID-19");
    expect(dados.lote).toBeNull();
    expect(dados.dose).toBe("1ª dose");
  });

  it("trata data futura como próxima dose, não como aplicação", () => {
    const dados = extrairDadosCarteirinha(
      "| Influenza | Dose única | 10/04/2027 |",
      CATALOGO,
      HOJE
    );

    expect(dados.vacina).toBe("Influenza");
    expect(dados.dataAplicacao).toBeNull();
  });

  it("não usa a data de nascimento como data de aplicação", () => {
    const dados = extrairDadosCarteirinha(
      "Data de nascimento: 01/01/2020\nBCG 01/01/2020 dose única",
      CATALOGO,
      HOJE
    );

    expect(dados.vacina).toBe("BCG");
    expect(dados.dataAplicacao).toBeNull();
  });

  it("devolve campos nulos quando o OCR não leu o que não existe", () => {
    const dados = extrairDadosCarteirinha("Varicela", CATALOGO, HOJE);

    expect(dados).toEqual({
      vacina: "Varicela",
      dose: "Não identificada",
      dataAplicacao: null,
      lote: null,
      localAplicacao: null,
      nomeTitular: null,
      dataNascimentoTitular: null
    });
  });

  it("falha com mensagem clara quando não acha nenhuma vacina", () => {
    expect(() =>
      extrairDadosCarteirinha("Receita médica\nTomar 1 comprimido", CATALOGO, HOJE)
    ).toThrow("Não foi possível identificar nenhuma vacina");
  });

});

/*
Formato da Carteira Nacional de Vacinação Digital (Meu SUS Digital), como
o Docling o devolve em Markdown. Todos os dados abaixo são inventados.
*/
describe("carteira do Meu SUS Digital", () => {

  const CABECALHO = `
Carteira Nacional de Vacinação Digital

| Nome | Data de nascimento | CPF/CNS |
|---|---|---|
| MARIA TESTE DA SILVA | 01/02/2000 | 000.000.000-00 |

| Vacina/Profilaxia | Data | Dose | Lote | Estratégia | * CNES | Estabelecimento de Saúde | Município | UF |
|---|---|---|---|---|---|---|---|---|
`;

  const linha = (vacina: string, data: string, dose: string, lote: string) =>
    `| ${vacina} | ${data} | ${dose} | ${lote} | Rotina | 0000000 | UBS EXEMPLO | GUARULHOS | SP |\n`;

  const ler = (...linhas: string[]) =>
    extrairDadosCarteirinha(CABECALHO + linhas.join(""), CATALOGO, HOJE);

  it("lê o titular da tabela de cabeçalho", () => {
    const dados = ler(linha("VACINA FEBRE AMARELA", "21/12/2017", "Dose Inicial", "174VFC047Z"));

    expect(dados.nomeTitular).toBe("MARIA TESTE DA SILVA");
    expect(dados.dataNascimentoTitular).toBe("2000-02-01");
  });

  it("febre amarela: 'Dose Inicial' é a 1ª dose", () => {
    expect(ler(linha("VACINA FEBRE AMARELA", "21/12/2017", "Dose Inicial", "174VFC047Z"))).toMatchObject({
      vacina: "Febre Amarela",
      dose: "1ª dose",
      dataAplicacao: "2017-12-21",
      lote: "174VFC047Z",
      localAplicacao: "UBS EXEMPLO"
    });
  });

  it("dT: 'Difteria e Tétano Adulto' com 'Revacinação' é reforço", () => {
    expect(ler(linha("VACINA DIFTERIA E TÉTANO ADULTO", "06/05/2019", "Revacinação", "221502516A"))).toMatchObject({
      vacina: "dT",
      dose: "Reforço",
      dataAplicacao: "2019-05-06"
    });
  });

  it("COVID-19 com marca e dose em fração (2/2)", () => {
    expect(ler(linha("COVID-19 PFIZER - COMIRNATY", "26/11/2021", "2/2", "FM0000"))).toMatchObject({
      vacina: "COVID-19",
      dose: "2ª dose",
      dataAplicacao: "2021-11-26",
      lote: "FM0000"
    });
  });

  it("HPV: lote curto (L548) e 'Não informado'", () => {
    expect(ler(linha("VACINA HPV QUADRIVALENTE", "13/01/2016", "2ª Dose", "L548"))).toMatchObject({
      vacina: "HPV4",
      dose: "2ª dose",
      lote: "L548"
    });

    expect(ler(linha("VACINA HPV QUADRIVALENTE", "29/06/2015", "1ª Dose", "Não informado"))).toMatchObject({
      vacina: "HPV4",
      dose: "1ª dose",
      lote: null
    });
  });

  it("com várias linhas, devolve a mais recente", () => {
    const dados = ler(
      linha("COVID-19 PFIZER - COMIRNATY", "08/07/2022", "Reforço", "FN0000"),
      linha("COVID-19 PFIZER - COMIRNATY", "26/11/2021", "2/2", "FM0000"),
      linha("VACINA FEBRE AMARELA", "21/12/2017", "Dose Inicial", "174VFC047Z")
    );

    expect(dados).toMatchObject({
      vacina: "COVID-19",
      dose: "Reforço",
      dataAplicacao: "2022-07-08"
    });
  });

});

