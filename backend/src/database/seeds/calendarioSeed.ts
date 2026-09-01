/*
==================================================
CALENDÁRIO VACINAL PADRÃO
==================================================

Define:

- Quem deve tomar
- Quantas doses
- Quantos reforços

Não define:

- Intervalos
- Campanhas
- Grupos especiais

Essas informações pertencem ao
regrasSeed.ts
*/

export const calendarioVacinalPadrao = [

  /*
  ==================================================
  CRIANÇA (0 A 10 ANOS)
  ==================================================
  */

  {
    vacina_codigo: "BCG",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 3,
    reforcos: 0,
    observacao: "Esquema básico"
  },

  {
    vacina_codigo: "PENTAVALENTE",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 3,
    reforcos: 0,
    observacao: "1ª, 2ª e 3ª dose"
  },

  {
    vacina_codigo: "POLIO_VIP",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 3,
    reforcos: 0,
    observacao: "1ª, 2ª e 3ª dose"
  },

  {
    vacina_codigo: "ROTAVIRUS",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 2,
    reforcos: 0,
    observacao: "1ª e 2ª dose"
  },

  {
    vacina_codigo: "MENINGOCOCICA_C",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 2,
    reforcos: 0,
    observacao: "1ª e 2ª dose"
  },

  {
    vacina_codigo: "PNEUMOCOCICA_10V",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 2,
    reforcos: 1,
    observacao: "2 doses + 1 reforço"
  },

  {
    vacina_codigo: "FEBRE_AMARELA",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "TRIPLICE_VIRAL_SCR",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "1ª dose"
  },

  {
    vacina_codigo: "HEPATITE_A",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "DTP",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 2,
    observacao: "1º e 2º reforço"
  },

  {
    vacina_codigo: "POLIO_VOP",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 2,
    observacao: "1º e 2º reforço"
  },

  {
    vacina_codigo: "TETRAVIRAL",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "SCR + Varicela"
  },

  {
    vacina_codigo: "VARICELA",
    faixa_etaria: "CRIANCA",
    idade_minima: 0,
    idade_maxima: 10,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  /*
  ==================================================
  ADOLESCENTE (11 A 19 ANOS)
  ==================================================
  */

  {
    vacina_codigo: "HPV4",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 2,
    reforcos: 0,
    observacao: "2 doses com intervalo de 6 meses"
  },

  {
    vacina_codigo: "MENINGOCOCICA_ACWY",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 3,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },

  {
    vacina_codigo: "FEBRE_AMARELA",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 1,
    reforcos: 0,
    observacao: "Se nunca vacinado"
  },

  {
    vacina_codigo: "DT",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 1,
    reforcos: 1,
    observacao: "Reforço a cada 10 anos"
  },

  {
    vacina_codigo: "TRIPLICE_VIRAL_SCR",
    faixa_etaria: "ADOLESCENTE",
    idade_minima: 11,
    idade_maxima: 19,
    doses: 2,
    reforcos: 0,
    observacao: "Conforme histórico vacinal"
  },

  /*
  ==================================================
  ADULTO (20 A 59 ANOS)
  ==================================================
  */

  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "ADULTO",
    idade_minima: 20,
    idade_maxima: 59,
    doses: 3,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },

  {
    vacina_codigo: "FEBRE_AMARELA",
    faixa_etaria: "ADULTO",
    idade_minima: 20,
    idade_maxima: 59,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "DT",
    faixa_etaria: "ADULTO",
    idade_minima: 20,
    idade_maxima: 59,
    doses: 1,
    reforcos: 1,
    observacao: "Reforço a cada 10 anos"
  },

  {
    vacina_codigo: "TRIPLICE_VIRAL_SCR",
    faixa_etaria: "ADULTO",
    idade_minima: 20,
    idade_maxima: 59,
    doses: 2,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },

  /*
  ==================================================
  GESTANTE
  ==================================================
  */

  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 3,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },

  {
    vacina_codigo: "DT",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 3,
    reforcos: 0,
    observacao: "Esquema gestacional"
  },

  {
    vacina_codigo: "DTPA",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 0,
    observacao: "Uma dose por gestação"
  },

  {
    vacina_codigo: "INFLUENZA",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 1,
    observacao: "Campanha anual"
  },

  {
    vacina_codigo: "COVID19",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 1,
    observacao: "Conforme campanha vigente"
  },

  /*
  ==================================================
  IDOSO (60+)
  ==================================================
  */

  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 3,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },

  {
    vacina_codigo: "FEBRE_AMARELA",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 0,
    observacao: "Verificar histórico vacinal"
  },

  {
    vacina_codigo: "TRIPLICE_VIRAL_SCR",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 0,
    observacao: "Se não vacinado anteriormente"
  },

  {
    vacina_codigo: "DT",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 1,
    observacao: "Reforço a cada 10 anos"
  },

  {
    vacina_codigo: "PNEUMOCOCICA_23V",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 0,
    observacao: "Dose única"
  },

  {
    vacina_codigo: "INFLUENZA",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 1,
    observacao: "Campanha anual"
  },

  {
    vacina_codigo: "COVID19",
    faixa_etaria: "IDOSO",
    idade_minima: 60,
    idade_maxima: 150,
    doses: 1,
    reforcos: 1,
    observacao: "Conforme campanha vigente"
  }

  

];
import * as vacinaRepository
  from "../../repositories/vacinaRepository";

import * as calendarioVacinalRepository
  from "../../repositories/calendarioVacinalRepository";

/*
==================================================
EXECUTAR CALENDÁRIO SEED
==================================================
*/
export async function executarCalendarioSeed() {

  for (
    const item
    of calendarioVacinalPadrao
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorCodigo(
          item.vacina_codigo
        );

    const vacinaId =
      (vacina as any)?.id;

    if (!vacinaId) {
      continue;
    }

    await calendarioVacinalRepository
      .criarCalendarioVacinal(
        vacinaId,
        item.faixa_etaria,
        item.idade_minima,
        item.idade_maxima,
        item.doses,
        item.reforcos,
        item.observacao
      );

  }

  console.log(
    "Calendário vacinal carregado."
  );

}
