/*
==================================================
ESQUEMA VACINAL — CALENDÁRIO NACIONAL 2026
==================================================

Fonte: Calendário Nacional de Vacinação 2026 (Ministério da
Saúde), páginas Criança, Adolescente e Jovem, Adulto e Idoso.

Cada linha é UMA dose (ou uma regra de repetição) de uma
vacina e diz QUANDO ela é devida:

- idadeIdealMeses: idade, contada do nascimento, em que a
  dose é recomendada (ex.: penta 2, 4 e 6 meses). Nulo quando
  o calendário diz só "conforme histórico vacinal".
- intervaloMinDias / intervaloMinMeses: mínimo após a dose
  anterior. Só preenchido quando o calendário (ou a regra que o
  sistema já usava) define o intervalo.
- idadeMinMeses / idadeMaxMeses: quem a linha alcança. Passou
  da idade máxima, a dose deixa de ser cobrada (oportunidade
  encerrada). Nulo = sem limite.
- numeroDose 0: regra de repetição periódica (reforço a cada
  N meses depois da última dose).
- grupo: só vale para quem pertence ao grupo especial.

O que o calendário NÃO diz (e por isso não está aqui):
gestantes (calendário próprio, não incluído), imunocomprometidos,
acamados, viajantes e áreas de risco. Esses casos precisam de
avaliação do serviço de saúde.

Atualizar o calendário = editar este arquivo (e os testes).
*/

export interface DoseEsquema {
  vacinaCodigo: string;
  numeroDose: number;
  rotulo: string;
  idadeIdealMeses: number | null;
  intervaloMinDias: number | null;
  intervaloMinMeses: number | null;
  idadeMinMeses: number;
  idadeMaxMeses: number | null;
  repeteMeses: number | null;
  grupo: string | null;
  fonte: string;
}

const ANOS = (n: number) => n * 12;

const CRIANCA = "Calendário Nacional 2026 — Criança";
const ADOLESCENTE = "Calendário Nacional 2026 — Adolescente e Jovem";
const ADULTO = "Calendário Nacional 2026 — Adulto";
const IDOSO = "Calendário Nacional 2026 — Idoso";

interface Opcoes {
  ideal?: number;
  intervalo?: number;
  intervaloMeses?: number;
  min?: number;
  max?: number | null;
  grupo?: string;
}

function dose(
  vacinaCodigo: string,
  numeroDose: number,
  rotulo: string,
  fonte: string,
  o: Opcoes = {}
): DoseEsquema {

  return {
    vacinaCodigo,
    numeroDose,
    rotulo,
    idadeIdealMeses: o.ideal ?? null,
    intervaloMinDias: o.intervalo ?? null,
    intervaloMinMeses: o.intervaloMeses ?? null,
    idadeMinMeses: o.min ?? 0,
    idadeMaxMeses: o.max === undefined ? null : o.max,
    repeteMeses: null,
    grupo: o.grupo ?? null,
    fonte
  };

}

function periodica(
  vacinaCodigo: string,
  rotulo: string,
  repeteMeses: number,
  fonte: string,
  o: Opcoes = {}
): DoseEsquema {

  return {
    ...dose(vacinaCodigo, 0, rotulo, fonte, o),
    repeteMeses
  };

}

/* Idade em meses COMPLETOS: 119 = 9 anos e 11 meses. */
const ATE_CRIANCA = ANOS(10) - 1;

export const ESQUEMA_2026: DoseEsquema[] = [

  /* ---------------- CRIANÇA (0 a 9 anos, 11 meses e 29 dias) ---------------- */

  dose("HEPATITE_B", 1, "Dose ao nascer", CRIANCA, { ideal: 0, max: ATE_CRIANCA }),
  dose("BCG", 1, "Dose única", CRIANCA, { ideal: 0, max: ATE_CRIANCA }),

  dose("PENTAVALENTE", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_CRIANCA }),
  dose("PENTAVALENTE", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_CRIANCA }),
  dose("PENTAVALENTE", 3, "3ª dose", CRIANCA, { ideal: 6, max: ATE_CRIANCA }),

  dose("POLIO_VIP", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_CRIANCA }),
  dose("POLIO_VIP", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_CRIANCA }),
  dose("POLIO_VIP", 3, "3ª dose", CRIANCA, { ideal: 6, max: ATE_CRIANCA }),
  dose("POLIO_VIP", 4, "1ª dose de reforço", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),
  dose("POLIO_VIP", 5, "2ª dose de reforço", CRIANCA, { ideal: 48, max: ATE_CRIANCA }),

  /* Rotavírus: 1ª dose até 11m29d e 2ª até 23m29d; depois disso perde-se a oportunidade. */
  dose("ROTAVIRUS", 1, "1ª dose", CRIANCA, { ideal: 2, max: 11 }),
  dose("ROTAVIRUS", 2, "2ª dose", CRIANCA, { ideal: 4, intervalo: 60, max: 23 }),

  /* O calendário lista a 20-valente aos 2 meses e a 10-valente aos 4 meses (2ª dose). */
  dose("PNEUMOCOCICA_20V", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_CRIANCA }),
  dose("PNEUMOCOCICA_10V", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_CRIANCA }),
  dose("PNEUMOCOCICA_20V", 2, "Dose de reforço", CRIANCA, { ideal: 12, max: ATE_CRIANCA }),

  dose("MENINGOCOCICA_C", 1, "1ª dose", CRIANCA, { ideal: 3, max: ATE_CRIANCA }),
  dose("MENINGOCOCICA_C", 2, "2ª dose", CRIANCA, { ideal: 5, max: ATE_CRIANCA }),
  dose("MENINGOCOCICA_ACWY", 1, "Dose única", CRIANCA, { ideal: 12, max: ATE_CRIANCA }),

  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", CRIANCA, { ideal: 12, max: ATE_CRIANCA }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),

  dose("HEPATITE_A", 1, "Dose única", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),

  dose("VARICELA", 1, "1ª dose", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),
  dose("VARICELA", 2, "2ª dose", CRIANCA, { ideal: 48, max: ATE_CRIANCA }),

  dose("DTP", 1, "1ª dose de reforço", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),
  dose("DTP", 2, "2ª dose de reforço", CRIANCA, { ideal: 48, max: ATE_CRIANCA }),

  dose("FEBRE_AMARELA", 1, "Dose inicial", CRIANCA, { ideal: 9, max: ATE_CRIANCA }),
  dose("FEBRE_AMARELA", 2, "Dose de reforço", CRIANCA, { ideal: 48, max: ATE_CRIANCA }),

  /* COVID-19: 3 doses (6, 7 e 9 meses); em atraso, vacinar até 4a11m29d. */
  dose("COVID19", 1, "1ª dose", CRIANCA, { ideal: 6, max: 59 }),
  dose("COVID19", 2, "2ª dose", CRIANCA, { ideal: 7, intervalo: 28, max: 59 }),
  dose("COVID19", 3, "3ª dose", CRIANCA, { ideal: 9, intervalo: 56, max: 59 }),

  /* Influenza: todo ano dos 6 meses aos 5a11m29d (na 1ª vez, 2 doses com 30 dias de intervalo). */
  dose("INFLUENZA", 1, "1ª dose (na 1ª vez, são 2 doses com 30 dias de intervalo)", CRIANCA, { ideal: 6, min: 6, max: 71 }),
  periodica("INFLUENZA", "Dose anual", 12, CRIANCA, { min: 6, max: 71 }),

  /* HPV4: 1 dose aos 9 anos; em atraso, vacinar até 14a11m29d. */
  dose("HPV4", 1, "Dose única", CRIANCA, { ideal: ANOS(9), min: ANOS(9), max: ANOS(15) - 1 }),

  /* ---------------- ADOLESCENTE E JOVEM (10 a 24 anos) ---------------- */

  dose("DENGUE_DNG4", 1, "1ª dose", ADOLESCENTE, { ideal: ANOS(10), min: ANOS(10), max: ANOS(15) - 1 }),
  /* O calendário não informa o intervalo; usa-se o que o sistema já tinha (90 dias). */
  dose("DENGUE_DNG4", 2, "2ª dose", ADOLESCENTE, { intervalo: 90, min: ANOS(10), max: ANOS(15) - 1 }),

  dose("MENINGOCOCICA_ACWY", 1, "Dose única", ADOLESCENTE, { ideal: ANOS(11), min: ANOS(10), max: ANOS(15) - 1 }),

  dose("DT", 1, "3ª dose de reforço", ADOLESCENTE, { ideal: ANOS(14), min: ANOS(10), max: ANOS(30) - 1 }),
  /* 4ª dose aos 24 anos, e nunca antes de 10 anos da dose anterior. */
  dose("DT", 2, "4ª dose de reforço", ADOLESCENTE, { ideal: ANOS(24), intervaloMeses: 120, min: ANOS(10), max: ANOS(30) - 1 }),

  /* ---------------- CONFORME HISTÓRICO VACINAL (10 anos ou mais) ---------------- */

  /* Hepatite B: 3 doses. O calendário não traz os intervalos; usa-se 30 e 180 dias (regra que o sistema já tinha). */
  dose("HEPATITE_B", 1, "1ª dose", ADOLESCENTE, { min: ANOS(10) }),
  dose("HEPATITE_B", 2, "2ª dose", ADOLESCENTE, { intervalo: 30, min: ANOS(10) }),
  dose("HEPATITE_B", 3, "3ª dose", ADOLESCENTE, { intervalo: 180, min: ANOS(10) }),

  dose("FEBRE_AMARELA", 1, "Dose única", ADOLESCENTE, { min: ANOS(10), max: ANOS(60) - 1 }),

  /* SCR: até 29 anos, 2 doses; de 30 a 59 anos, 1 dose. */
  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", ADOLESCENTE, { min: ANOS(10), max: ANOS(30) - 1 }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", ADOLESCENTE, { min: ANOS(10), max: ANOS(30) - 1 }),
  dose("TRIPLICE_VIRAL_SCR", 1, "Dose única", ADULTO, { min: ANOS(30), max: ANOS(60) - 1 }),

  /* dT: reforço a cada 10 anos (adulto e idoso), contado da última dose com componente tetânico. */
  periodica("DT", "Reforço (a cada 10 anos)", 120, ADULTO, { min: ANOS(10) }),

  /* ---------------- GRUPOS ESPECIAIS ---------------- */

  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", ADULTO, { min: ANOS(10), grupo: "TRABALHADOR_SAUDE" }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", ADULTO, { min: ANOS(10), grupo: "TRABALHADOR_SAUDE" }),

  ...["TRABALHADOR_SAUDE", "INDIGENA"].flatMap((grupo) => [
    dose("VARICELA", 1, "1ª dose", ADULTO, { min: ANOS(10), grupo }),
    dose("VARICELA", 2, "2ª dose", ADULTO, { min: ANOS(10), grupo })
  ]),

  dose("PNEUMOCOCICA_20V", 1, "Dose única", ADULTO, { min: ANOS(5), grupo: "INDIGENA" }),

  /* ---------------- IDOSO (60 anos ou mais) ---------------- */

  periodica("INFLUENZA", "Dose anual", 12, IDOSO, { min: ANOS(60) }),
  periodica("COVID19", "Dose semestral", 6, IDOSO, { min: ANOS(60) }),

  /* Pneumocócica 20-valente: todos a partir de 85 anos (60 a 84 só acamados/institucionalizados, não avaliado aqui). */
  dose("PNEUMOCOCICA_20V", 1, "Dose única", IDOSO, { min: ANOS(85) })

];

/*
Doses de OUTRAS vacinas que contam como dose desta (a penta já
traz hepatite B). Vale para o número da dose.
*/
export const EQUIVALENCIA_DOSES: Record<string, string[]> = {
  HEPATITE_B: ["PENTAVALENTE"]
};

/*
Doses de outras vacinas que servem de referência de DATA para
reforços periódicos (qualquer vacina com componente tetânico
reinicia a contagem dos 10 anos do dT).
*/
export const EQUIVALENCIA_DATAS: Record<string, string[]> = {
  DT: ["DTP", "DTPA", "PENTAVALENTE"]
};
