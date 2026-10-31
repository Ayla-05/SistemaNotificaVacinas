/*
==================================================
FAIXAS ETÁRIAS OFICIAIS
==================================================

Baseado no Calendário Nacional de Vacinação 2026
(Ministério da Saúde):

CRIANCA
0 a 9 anos (e 11 meses e 29 dias)

ADOLESCENTE
10 a 24 anos (adolescente e jovem)

ADULTO
25 a 59 anos

IDOSO
60+ anos

GESTANTE é tratada como grupo especial.
*/
export type FaixaEtaria =
  | "CRIANCA"
  | "ADOLESCENTE"
  | "ADULTO"
  | "IDOSO";

export function obterFaixaEtaria(
  idade: number
): FaixaEtaria {

  if (idade <= 9) {
    return "CRIANCA";
  }

  if (idade <= 24) {
    return "ADOLESCENTE";
  }

  if (idade <= 59) {
    return "ADULTO";
  }

  return "IDOSO";

}
