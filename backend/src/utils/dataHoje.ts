/*
==================================================
"HOJE" E IDADE, NO FUSO DO BRASIL
==================================================

CORREÇÃO [COR-26]: a idade era calculada misturando
new Date("AAAA-MM-DD") (que o JavaScript lê como meia-noite em UTC)
com getMonth()/getDate() (que leem no fuso do servidor). Em fuso
atrás de UTC, como o do Brasil (UTC-3), a data de nascimento
"recuava" um dia: a pessoa ficava um ano mais velha na véspera do
aniversário, antecipando a troca de faixa etária (10, 25 e 60 anos)
e mudando as pendências. Em servidor configurado em UTC o erro não
aparecia, por isso só surgia no computador de quem desenvolve.

Aqui as datas são sempre texto AAAA-MM-DD e "hoje" é o dia civil de
America/Sao_Paulo, qualquer que seja o fuso do servidor.
*/

const FUSO_DO_SISTEMA = "America/Sao_Paulo";

const FORMATADOR = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_DO_SISTEMA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

/* Dia civil de hoje (AAAA-MM-DD) no fuso do sistema. */
export function hojeIso(agora: Date = new Date()): string {
  return FORMATADOR.format(agora);
}

/* Anos completos entre duas datas AAAA-MM-DD (aniversário conta no próprio dia). */
export function idadeEmAnos(
  nascimentoIso: string,
  hoje: string = hojeIso()
): number {

  const [an, mn, dn] = nascimentoIso.slice(0, 10).split("-").map(Number);
  const [ah, mh, dh] = hoje.split("-").map(Number);

  let idade = ah - an;

  if (mh < mn || (mh === mn && dh < dn)) {
    idade--;
  }

  return idade;

}
