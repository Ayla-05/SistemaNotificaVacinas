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
- reforco: a linha é um reforço (depende de doses anteriores). Quem
  não tem NENHUMA dose registrada não está "atrasado no reforço": o
  sistema pede para atualizar o esquema (ver proximasDoses.ts).
- grupo: só vale para quem pertence ao grupo especial.

O que o calendário NÃO diz (e por isso não está aqui):
imunocomprometidos,
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
  reforco: boolean;
  grupo: string | null;
  /* só vale a partir desta semana de gestação (ex.: dTpa 20, VSR 28) */
  semanasGestacao: number | null;
  /* também só libera depois de N meses da 1ª dose da série (ex.: hepatite B: 3ª dose >= 4 meses após a 1ª) */
  desdePrimeiraDoseMeses: number | null;
  /* só contam as doses aplicadas a partir desta idade (ex.: meningo ACWY dos 11 anos vale mesmo com a dose dos 12 meses) */
  contaDesdeIdadeMeses: number | null;
  /* "em cada gestação": só contam as doses aplicadas depois do início da gestação atual */
  porGestacao: boolean;
  fonte: string;
}

/*
Vacinas de vírus vivo atenuado: não entram no esquema da gestante. O calendário
da gestante (Ministério da Saúde) só prevê hepatite B, dT, dTpa, influenza,
COVID-19 e VSR; a febre amarela é permitida apenas em casos excepcionais, com
avaliação de risco e benefício pelo serviço de saúde (gestante sem esquema
completo que vive ou vai viajar para área com circulação viral confirmada).
Por isso o sistema NÃO sugere essas vacinas para quem está no grupo GESTANTE.
(A contraindicação das demais vacinas vivas — tríplice viral, tetraviral e
varicela — na gestação deve ser conferida no calendário oficial.)
*/
/* Maior duração considerada para uma gestação (dias desde o início): depois disso o grupo deixa de valer. */
export const GESTACAO_DURACAO_MAX_DIAS = 300;

export const VACINAS_FORA_DO_ESQUEMA_DA_GESTANTE = [
  "FEBRE_AMARELA",
  "TRIPLICE_VIRAL_SCR",
  "TETRAVIRAL",
  "VARICELA"
];

const ANOS = (n: number) => n * 12;

const CRIANCA = "Calendário Nacional 2026 — Criança";
const ADOLESCENTE = "Calendário Nacional 2026 — Adolescente e Jovem";
const ADULTO = "Calendário Nacional 2026 — Adulto";
const IDOSO = "Calendário Nacional 2026 — Idoso";
const GESTANTE = "Calendário Nacional — Gestante";

interface Opcoes {
  ideal?: number;
  intervalo?: number;
  intervaloMeses?: number;
  min?: number;
  max?: number | null;
  grupo?: string;
  semanas?: number;
  porGestacao?: boolean;
  desdePrimeira?: number;
  contaDesde?: number;
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
    reforco: /refor/i.test(rotulo),
    grupo: o.grupo ?? null,
    semanasGestacao: o.semanas ?? null,
    desdePrimeiraDoseMeses: o.desdePrimeira ?? null,
    contaDesdeIdadeMeses: o.contaDesde ?? null,
    porGestacao: o.porGestacao ?? false,
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

/* Limites de idade do calendário de rotina (Estado de SP, out/2026): depois deles a vacina deixa de ser cobrada. */
const ATE_4_ANOS = 59; /* até 4 anos, 11 meses e 29 dias */
const ATE_6_ANOS = 83; /* até 6 anos, 11 meses e 29 dias */

export const ESQUEMA_2026: DoseEsquema[] = [

  /* ---------------- CRIANÇA (0 a 9 anos, 11 meses e 29 dias) ---------------- */

  dose("HEPATITE_B", 1, "Dose ao nascer", CRIANCA, { ideal: 0, max: ATE_CRIANCA }),
  dose("BCG", 1, "Dose única", CRIANCA, { ideal: 0, max: ATE_CRIANCA }),

  dose("PENTAVALENTE", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_6_ANOS }),
  dose("PENTAVALENTE", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_6_ANOS }),
  dose("PENTAVALENTE", 3, "3ª dose", CRIANCA, { ideal: 6, max: ATE_6_ANOS }),

  dose("POLIO_VIP", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_6_ANOS }),
  dose("POLIO_VIP", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_6_ANOS }),
  dose("POLIO_VIP", 3, "3ª dose", CRIANCA, { ideal: 6, max: ATE_6_ANOS }),
  dose("POLIO_VIP", 4, "1ª dose de reforço", CRIANCA, { ideal: 15, max: ATE_6_ANOS }),
  dose("POLIO_VIP", 5, "2ª dose de reforço", CRIANCA, { ideal: 48, max: ATE_6_ANOS }),

  /* Rotavírus: 1ª dose até 11m29d e 2ª até 23m29d; depois disso perde-se a oportunidade. */
  dose("ROTAVIRUS", 1, "1ª dose", CRIANCA, { ideal: 2, max: 11 }),
  dose("ROTAVIRUS", 2, "2ª dose", CRIANCA, { ideal: 4, intervalo: 60, max: 23 }),

  /* O calendário lista a 20-valente aos 2 meses e a 10-valente aos 4 meses (2ª dose). */
  dose("PNEUMOCOCICA_20V", 1, "1ª dose", CRIANCA, { ideal: 2, max: ATE_4_ANOS }),
  dose("PNEUMOCOCICA_10V", 2, "2ª dose", CRIANCA, { ideal: 4, max: ATE_4_ANOS }),
  dose("PNEUMOCOCICA_20V", 2, "Dose de reforço", CRIANCA, { ideal: 12, max: ATE_4_ANOS }),

  dose("MENINGOCOCICA_C", 1, "1ª dose", CRIANCA, { ideal: 3, max: ATE_4_ANOS }),
  dose("MENINGOCOCICA_C", 2, "2ª dose", CRIANCA, { ideal: 5, max: ATE_4_ANOS }),
  dose("MENINGOCOCICA_ACWY", 1, "Reforço (aos 12 meses)", CRIANCA, { ideal: 12, max: ATE_4_ANOS }),

  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", CRIANCA, { ideal: 12, max: ATE_CRIANCA }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", CRIANCA, { ideal: 15, max: ATE_CRIANCA }),

  dose("HEPATITE_A", 1, "Dose única", CRIANCA, { ideal: 15, max: ATE_4_ANOS }),

  dose("VARICELA", 1, "1ª dose", CRIANCA, { ideal: 15, max: ATE_6_ANOS }),
  dose("VARICELA", 2, "2ª dose", CRIANCA, { ideal: 48, max: ATE_6_ANOS }),

  dose("DTP", 1, "1ª dose de reforço", CRIANCA, { ideal: 15, max: ATE_6_ANOS }),
  dose("DTP", 2, "2ª dose de reforço", CRIANCA, { ideal: 48, max: ATE_6_ANOS }),

  dose("FEBRE_AMARELA", 1, "Dose inicial", CRIANCA, { ideal: 9, max: ATE_CRIANCA }),
  dose("FEBRE_AMARELA", 2, "Dose de reforço", CRIANCA, { ideal: 48, max: ATE_CRIANCA }),

  /* COVID-19: 3 doses (6, 7 e 9 meses); em atraso, vacinar até 4a11m29d. */
  dose("COVID19", 1, "1ª dose", CRIANCA, { ideal: 6, max: 59 }),
  dose("COVID19", 2, "2ª dose", CRIANCA, { ideal: 7, intervalo: 28, max: 59 }),
  dose("COVID19", 3, "3ª dose", CRIANCA, { ideal: 9, intervalo: 56, max: 59 }),

  /* Influenza: todo ano dos 6 meses aos 5a11m29d (na 1ª vez, 2 doses com 4 semanas de intervalo). */
  dose("INFLUENZA", 1, "1ª dose (na 1ª vez, são 2 doses com 4 semanas de intervalo)", CRIANCA, { ideal: 6, min: 6, max: 71 }),
  periodica("INFLUENZA", "Dose anual", 12, CRIANCA, { min: 6, max: 71 }),

  /* HPV4: 1 dose aos 9 anos; em atraso, vacinar até 14a11m29d. */
  dose("HPV4", 1, "Dose única", CRIANCA, { ideal: ANOS(9), min: ANOS(9), max: ANOS(15) - 1 }),

  /* ---------------- ADOLESCENTE E JOVEM (10 a 24 anos) ---------------- */

  dose("DENGUE_DNG4", 1, "1ª dose", ADOLESCENTE, { ideal: ANOS(10), min: ANOS(10), max: ANOS(15) - 1 }),
  /* 2ª dose com 12 semanas (84 dias) de intervalo (calendário do Estado de SP, out/2026). */
  dose("DENGUE_DNG4", 2, "2ª dose", ADOLESCENTE, { intervalo: 84, min: ANOS(10), max: ANOS(15) - 1 }),

  /* Vale independentemente da dose de reforço dos 12 meses: só contam doses a partir dos 10 anos. */
  dose("MENINGOCOCICA_ACWY", 1, "Dose única", ADOLESCENTE, { ideal: ANOS(11), min: ANOS(10), max: ANOS(15) - 1, contaDesde: ANOS(10) }),

  dose("DT", 1, "3ª dose de reforço", ADOLESCENTE, { ideal: ANOS(14), min: ANOS(10), max: ANOS(30) - 1 }),
  /* 4ª dose aos 24 anos, e nunca antes de 10 anos da dose anterior. */
  dose("DT", 2, "4ª dose de reforço", ADOLESCENTE, { ideal: ANOS(24), intervaloMeses: 120, min: ANOS(10), max: ANOS(30) - 1 }),

  /* ---------------- CONFORME HISTÓRICO VACINAL (10 anos ou mais) ---------------- */

  /* Hepatite B: 3 doses. Intervalo mínimo de 4 semanas entre a 1ª e a 2ª; a 3ª pode ser 2 meses após a 2ª,
     desde que passados 4 meses da 1ª (calendário do Estado de SP, out/2026). */
  dose("HEPATITE_B", 1, "1ª dose", ADOLESCENTE, { min: ANOS(10) }),
  dose("HEPATITE_B", 2, "2ª dose", ADOLESCENTE, { intervalo: 28, min: ANOS(10) }),
  dose("HEPATITE_B", 3, "3ª dose", ADOLESCENTE, { intervalo: 60, desdePrimeira: 4, min: ANOS(10) }),

  dose("FEBRE_AMARELA", 1, "Dose única", ADOLESCENTE, { min: ANOS(10), max: ANOS(60) - 1 }),

  /* SCR: até 29 anos, 2 doses; de 30 a 59 anos, 1 dose. */
  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", ADOLESCENTE, { min: ANOS(10), max: ANOS(30) - 1 }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", ADOLESCENTE, { intervalo: 28, min: ANOS(10), max: ANOS(30) - 1 }),
  dose("TRIPLICE_VIRAL_SCR", 1, "Dose única", ADULTO, { min: ANOS(30), max: ANOS(60) - 1 }),

  /* dT: reforço a cada 10 anos (adulto e idoso), contado da última dose com componente tetânico. */
  periodica("DT", "Reforço (a cada 10 anos)", 120, ADULTO, { min: ANOS(10) }),

  /* ---------------- GRUPOS ESPECIAIS ---------------- */

  dose("TRIPLICE_VIRAL_SCR", 1, "1ª dose", ADULTO, { min: ANOS(10), grupo: "TRABALHADOR_SAUDE" }),
  dose("TRIPLICE_VIRAL_SCR", 2, "2ª dose", ADULTO, { intervalo: 28, min: ANOS(10), grupo: "TRABALHADOR_SAUDE" }),

  ...["TRABALHADOR_SAUDE", "INDIGENA"].flatMap((grupo) => [
    dose("VARICELA", 1, "1ª dose", ADULTO, { min: ANOS(10), grupo }),
    dose("VARICELA", 2, "2ª dose", ADULTO, { min: ANOS(10), grupo })
  ]),

  dose("PNEUMOCOCICA_20V", 1, "Dose única", ADULTO, { min: ANOS(5), grupo: "INDIGENA" }),

  /* ---------------- GESTANTE (a gestante e o bebê, até o nascimento) ----------------

     Valem só para quem está no grupo GESTANTE e tem a gestação em andamento (ver
     proximasDoses.ts). Hepatite B (3 doses) já vem da regra geral de 10 anos ou mais.
     dT: 2ª dose 2 meses após a 1ª e 3ª dose 4 a 6 meses após a 1ª (calendário do Estado de SP,
     out/2026). Febre amarela só em casos excepcionais, com avaliação do serviço de saúde: por
     isso não é sugerida. */

  dose("DT", 1, "1ª dose (ao saber da gravidez)", GESTANTE, { min: ANOS(10), grupo: "GESTANTE" }),
  dose("DT", 2, "2ª dose", GESTANTE, { intervalo: 60, min: ANOS(10), grupo: "GESTANTE" }),
  dose("DT", 3, "3ª dose", GESTANTE, { intervalo: 60, desdePrimeira: 4, min: ANOS(10), grupo: "GESTANTE" }),

  /* Uma dose em qualquer fase de CADA gestação (SP); o Ministério diz "1 dose por temporada". */
  periodica("INFLUENZA", "1 dose por temporada (em cada gestação)", 12, GESTANTE, { min: ANOS(10), grupo: "GESTANTE", porGestacao: true }),

  dose("COVID19", 1, "1 dose a cada gestação", GESTANTE, { min: ANOS(10), grupo: "GESTANTE", porGestacao: true }),

  dose("DTPA", 1, "1 dose a partir da 20ª semana de gestação", GESTANTE, { min: ANOS(10), grupo: "GESTANTE", semanas: 20, porGestacao: true }),

  dose("VSR", 1, "1 dose a partir da 28ª semana de gestação", GESTANTE, { min: ANOS(10), grupo: "GESTANTE", semanas: 28, porGestacao: true }),

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
