/*
==================================================
VALIDAÇÃO DE DADOS DE ENTRADA
==================================================

CORREÇÃO [COR-25]: a API aceitava datas de nascimento futuras ou
sem sentido ("abc", "14/05/1990", ano 1800), e-mails inválidos,
número de dose 0, negativo, decimal ou texto, datas impossíveis
(30/02) em agendamentos e qualquer parentesco. Dado ruim na carteira
vacinal leva a cálculo errado de pendências; estas funções puras
concentram as regras e são usadas pelos serviços.

Todas devolvem boolean; nenhuma lança erro nem acessa banco.
*/

import { hojeIso } from "./dataHoje";

const REGEX_DATA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

/* Idade máxima aceita para uma pessoa (anos). */
export const IDADE_MAXIMA_ANOS = 130;

/* Maior número de dose aceito (nenhum esquema vacinal chega perto). */
export const MAIOR_NUMERO_DOSE = 20;

/* AAAA-MM-DD que existe de verdade no calendário (rejeita 2020-02-30). */
export function dataIsoValida(valor: unknown): valor is string {

  if (typeof valor !== "string") {
    return false;
  }

  const m = REGEX_DATA_ISO.exec(valor);

  if (!m) {
    return false;
  }

  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );

}


/* Data válida e que já passou (ou é hoje): data de aplicação de dose. */
export function dataNaoFutura(
  valor: unknown,
  hoje: Date = new Date()
): boolean {
  return dataIsoValida(valor) && valor <= hojeIso(hoje);
}

/* Data de nascimento: válida, não futura e não mais de 130 anos atrás. */
export function dataNascimentoValida(
  valor: unknown,
  hoje: Date = new Date()
): boolean {

  if (!dataNaoFutura(valor, hoje)) {
    return false;
  }

  const [ano, resto] = [Number(hojeIso(hoje).slice(0, 4)), hojeIso(hoje).slice(4)];

  return (valor as string) >= `${ano - IDADE_MAXIMA_ANOS}${resto}`;

}

export function emailValido(valor: unknown): boolean {
  return (
    typeof valor === "string" &&
    valor.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)
  );
}

/* Número de dose: inteiro de 1 a MAIOR_NUMERO_DOSE. */
export function numeroDoseValido(valor: unknown): valor is number {
  return (
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor >= 1 &&
    valor <= MAIOR_NUMERO_DOSE
  );
}

const PARENTESCOS = new Set([
  "filho", "filha", "pai", "mae", "conjuge", "avo", "neto", "irmao", "irma", "outro"
]);

/* Aceita com ou sem acento e em qualquer caixa ("Mãe", "cônjuge"). */
export function parentescoValido(valor: unknown): boolean {

  if (typeof valor !== "string") {
    return false;
  }

  const chave = valor
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();

  return PARENTESCOS.has(chave);

}
