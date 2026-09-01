/*
==================================================
REGRAS VACINAIS PADRÃO
==================================================

Define:

- Intervalos entre doses
- Reforços
- Campanhas
- Grupos especiais

NÃO define:

- Faixa etária
- Quantidade de doses

Essas informações pertencem ao
calendarioSeed.ts
*/

export const regrasVacinaisPadrao = [

  /*
  ==================================================
  BCG
  ==================================================
  */
  {
    vacina_codigo: "BCG",

    intervalo_dose_1_2: null,
    intervalo_dose_2_3: null,
    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  HEPATITE A
  ==================================================
  */
  {
    vacina_codigo: "HEPATITE_A",

    intervalo_dose_1_2: null,
    intervalo_dose_2_3: null,
    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  HEPATITE B
  ==================================================
  */
  {
    vacina_codigo: "HEPATITE_B",

    intervalo_dose_1_2: 30,

    intervalo_dose_2_3: 180,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema básico"
  },

  /*
  ==================================================
  PENTAVALENTE
  ==================================================
  */
  {
    vacina_codigo: "PENTAVALENTE",

    intervalo_dose_1_2: 60,

    intervalo_dose_2_3: 60,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema infantil"
  },

  /*
  ==================================================
  DTP
  ==================================================
  */
  {
    vacina_codigo: "DTP",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: 3650,

    reforco_anos: 10,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Reforço a cada 10 anos"
  },

  /*
  ==================================================
  DT
  ==================================================
  */
  {
    vacina_codigo: "DT",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: 3650,

    reforco_anos: 10,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Reforço a cada 10 anos"
  },

  /*
  ==================================================
  DTPA
  ==================================================
  */
  {
    vacina_codigo: "DTPA",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: "GESTANTE",

    observacao: "Uma dose por gestação"
  },

  /*
  ==================================================
  POLIO VIP
  ==================================================
  */
  {
    vacina_codigo: "POLIO_VIP",

    intervalo_dose_1_2: 60,

    intervalo_dose_2_3: 60,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema infantil"
  },

  /*
  ==================================================
  POLIO VOP
  ==================================================
  */
  {
    vacina_codigo: "POLIO_VOP",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Vacina de reforço"
  },

  /*
  ==================================================
  ROTAVÍRUS
  ==================================================
  */
  {
    vacina_codigo: "ROTAVIRUS",

    intervalo_dose_1_2: 60,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema de duas doses"
  },

  /*
  ==================================================
  FEBRE AMARELA
  ==================================================
  */
  {
    vacina_codigo: "FEBRE_AMARELA",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  TRÍPLICE VIRAL
  ==================================================
  */
  {
    vacina_codigo: "TRIPLICE_VIRAL_SCR",

    intervalo_dose_1_2: 30,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dependente do histórico vacinal"
  },

  /*
  ==================================================
  TETRAVIRAL
  ==================================================
  */
  {
    vacina_codigo: "TETRAVIRAL",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  VARICELA
  ==================================================
  */
  {
    vacina_codigo: "VARICELA",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  HPV4
  ==================================================
  */
  {
    vacina_codigo: "HPV4",

    intervalo_dose_1_2: 180,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Duas doses com intervalo de 6 meses"
  },

  /*
  ==================================================
  INFLUENZA
  ==================================================
  */
  {
    vacina_codigo: "INFLUENZA",

    intervalo_dose_reforco: 365,

    intervalo_dose_1_2: null,
    intervalo_dose_2_3: null,
    intervalo_dose_3_4: null,

    reforco_anos: 1,

    campanha_anual: 1,

    grupo_especial_codigo: null,

    observacao: "Campanha anual"
  },

  /*
  ==================================================
  COVID-19
  ==================================================
  */
  {
    vacina_codigo: "COVID19",

    intervalo_dose_reforco: 365,

    intervalo_dose_1_2: null,
    intervalo_dose_2_3: null,
    intervalo_dose_3_4: null,

    reforco_anos: 1,

    campanha_anual: 1,

    grupo_especial_codigo: null,

    observacao: "Conforme campanhas vigentes"
  },

  /*
  ==================================================
  MENINGOCÓCICA C
  ==================================================
  */
  {
    vacina_codigo: "MENINGOCOCICA_C",

    intervalo_dose_1_2: 90,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema infantil"
  },

  /*
  ==================================================
  MENINGOCÓCICA ACWY
  ==================================================
  */
  {
    vacina_codigo: "MENINGOCOCICA_ACWY",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Dose única"
  },

  /*
  ==================================================
  PNEUMOCÓCICA 10V
  ==================================================
  */
  {
    vacina_codigo: "PNEUMOCOCICA_10V",

    intervalo_dose_1_2: 60,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: 365,

    reforco_anos: 1,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Esquema infantil"
  },

  /*
  ==================================================
  PNEUMOCÓCICA 20V
  ==================================================
  */
  {
    vacina_codigo: "PNEUMOCOCICA_20V",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Conforme protocolo vigente"
  },

  /*
  ==================================================
  PNEUMOCÓCICA 23V
  ==================================================
  */
  {
    vacina_codigo: "PNEUMOCOCICA_23V",

    intervalo_dose_1_2: null,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: "IMUNOCOMPROMETIDO",

    observacao: "Indicada para grupos específicos"
  },

  /*
  ==================================================
  DENGUE
  ==================================================
  */
  {
    vacina_codigo: "DENGUE_DNG4",

    intervalo_dose_1_2: 90,

    intervalo_dose_2_3: null,

    intervalo_dose_3_4: null,

    intervalo_dose_reforco: null,

    reforco_anos: null,

    campanha_anual: 0,

    grupo_especial_codigo: null,

    observacao: "Conforme protocolo vigente"
  }

];

/*
==================================================
EXECUTAR REGRAS SEED
==================================================
*/
export async function executarRegrasSeed() {

  console.log(
    "Regras vacinais carregadas."
  );

}