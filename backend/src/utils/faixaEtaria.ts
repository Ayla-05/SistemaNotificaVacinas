/*
==================================================
FAIXAS ETÁRIAS OFICIAIS
==================================================
*/

/*

Baseado na cartilha do Programa Nacional
de Imunizações (PNI).

CRIANCA
0 a 10 anos

ADOLESCENTE
11 a 19 anos

ADULTO
20 a 59 anos
 
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

  if (idade >= 0 && idade <= 10) {
    return "CRIANCA";
  }

  if (idade >= 11 && idade <= 19) {
    return "ADOLESCENTE";
  }

  if (idade >= 20 && idade <= 59) {
    return "ADULTO";
  }

  return "IDOSO";

}