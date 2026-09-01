/*
==================================================
VACINAS PADRÃO DO SISTEMA
==================================================

Fonte única de verdade para as vacinas.

Responsável por definir:

- Código interno
- Nome
- Descrição
- Doenças evitadas

NÃO definir:

- Calendário vacinal
- Doses
- Reforços
- Intervalos
- Campanhas

Essas informações pertencem aos outros seeds.
*/

export const vacinasPadrao = [

  {
    codigo: "BCG",
    nome: "BCG",
    descricao: "Previne formas graves de tuberculose",
    doencas_evitadas: "Tuberculose",
    ativa: 1
  },

  {
    codigo: "HEPATITE_A",
    nome: "Hepatite A",
    descricao: "Previne hepatite A",
    doencas_evitadas: "Hepatite A",
    ativa: 1
  },

  {
    codigo: "HEPATITE_B",
    nome: "Hepatite B",
    descricao: "Previne hepatite B",
    doencas_evitadas: "Hepatite B",
    ativa: 1
  },

  {
    codigo: "PENTAVALENTE",
    nome: "Pentavalente",
    descricao: "Previne difteria, tétano, coqueluche, hepatite B e Hib",
    doencas_evitadas: "Difteria, Tétano, Coqueluche, Hepatite B e Hib",
    ativa: 1
  },

  {
    codigo: "DTP",
    nome: "DTP",
    descricao: "Previne difteria, tétano e coqueluche",
    doencas_evitadas: "Difteria, Tétano e Coqueluche",
    ativa: 1
  },

  {
    codigo: "DT",
    nome: "dT",
    descricao: "Previne difteria e tétano",
    doencas_evitadas: "Difteria e Tétano",
    ativa: 1
  },

  {
    codigo: "DTPA",
    nome: "dTpa",
    descricao: "Previne difteria, tétano e coqueluche",
    doencas_evitadas: "Difteria, Tétano e Coqueluche",
    ativa: 1
  },

  {
    codigo: "POLIO_VIP",
    nome: "Poliomielite VIP",
    descricao: "Vacina inativada contra poliomielite",
    doencas_evitadas: "Poliomielite",
    ativa: 1
  },

  {
    codigo: "POLIO_VOP",
    nome: "Poliomielite VOP",
    descricao: "Vacina oral contra poliomielite",
    doencas_evitadas: "Poliomielite",
    ativa: 1
  },

  {
    codigo: "ROTAVIRUS",
    nome: "Rotavírus Humano",
    descricao: "Previne diarreia causada por rotavírus",
    doencas_evitadas: "Rotavírus",
    ativa: 1
  },

  {
    codigo: "FEBRE_AMARELA",
    nome: "Febre Amarela",
    descricao: "Previne febre amarela",
    doencas_evitadas: "Febre Amarela",
    ativa: 1
  },

  {
    codigo: "TRIPLICE_VIRAL_SCR",
    nome: "Tríplice Viral SCR",
    descricao: "Previne sarampo, caxumba e rubéola",
    doencas_evitadas: "Sarampo, Caxumba e Rubéola",
    ativa: 1
  },

  {
    codigo: "TETRAVIRAL",
    nome: "Tetraviral",
    descricao: "Previne sarampo, caxumba, rubéola e varicela",
    doencas_evitadas: "Sarampo, Caxumba, Rubéola e Varicela",
    ativa: 1
  },

  {
    codigo: "VARICELA",
    nome: "Varicela",
    descricao: "Previne catapora",
    doencas_evitadas: "Varicela",
    ativa: 1
  },

  {
    codigo: "HPV4",
    nome: "HPV4",
    descricao: "Previne infecções pelo Papilomavírus Humano",
    doencas_evitadas: "HPV",
    ativa: 1
  },

  {
    codigo: "INFLUENZA",
    nome: "Influenza",
    descricao: "Previne gripe",
    doencas_evitadas: "Influenza",
    ativa: 1
  },

  {
    codigo: "COVID19",
    nome: "COVID-19",
    descricao: "Previne formas graves da COVID-19",
    doencas_evitadas: "COVID-19",
    ativa: 1
  },

  {
    codigo: "MENINGOCOCICA_C",
    nome: "Meningocócica C",
    descricao: "Previne doença meningocócica do sorogrupo C",
    doencas_evitadas: "Doença Meningocócica",
    ativa: 1
  },

  {
    codigo: "MENINGOCOCICA_ACWY",
    nome: "Meningocócica ACWY",
    descricao: "Previne doença meningocócica dos sorogrupos A, C, W e Y",
    doencas_evitadas: "Doença Meningocócica",
    ativa: 1
  },

  {
    codigo: "PNEUMOCOCICA_10V",
    nome: "Pneumocócica 10-valente",
    descricao: "Previne pneumonia, meningite e otite",
    doencas_evitadas: "Doenças Pneumocócicas",
    ativa: 1
  },

  {
    codigo: "PNEUMOCOCICA_20V",
    nome: "Pneumocócica 20-valente",
    descricao: "Previne pneumonia, meningite e otite",
    doencas_evitadas: "Doenças Pneumocócicas",
    ativa: 1
  },

  {
    codigo: "PNEUMOCOCICA_23V",
    nome: "Pneumocócica 23-valente",
    descricao: "Previne pneumonia, meningite e otite",
    doencas_evitadas: "Doenças Pneumocócicas",
    ativa: 1
  },

  {
    codigo: "DENGUE_DNG4",
    nome: "Dengue DNG4",
    descricao: "Previne dengue",
    doencas_evitadas: "Dengue",
    ativa: 1
  }

];


import * as vacinaRepository
  from "../../repositories/vacinaRepository";

/*
==================================================
EXECUTAR VACINAS SEED
==================================================
*/
export async function executarVacinasSeed() {

  for (const vacina of vacinasPadrao) {

    const existente =
      await vacinaRepository
        .buscarVacinaPorCodigo(
          vacina.codigo
        );

    if (existente) {
      continue;
    }

    await vacinaRepository.criarVacina(
      vacina.codigo,
      vacina.nome,
      vacina.descricao,
      vacina.doencas_evitadas
    );

  }

  console.log(
    "Vacinas carregadas."
  );

}