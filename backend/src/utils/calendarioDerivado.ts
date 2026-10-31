import {
  DoseEsquema,
  ESQUEMA_2026
} from "../data/esquemaVacinal2026";

/*
==================================================
CALENDÁRIO POR FAIXA ETÁRIA (DERIVADO DO ESQUEMA)
==================================================

Responsabilidades:

- Gerar, a partir do esquema vacinal de 2026, as linhas da
  tabela calendario_vacinal (vacina, faixa etária, quantas
  doses, reforços e uma descrição)

Existe para que a tabela calendario_vacinal e o cálculo das
próximas doses venham da MESMA fonte (esquemaVacinal2026.ts):
atualizar o calendário em um lugar atualiza os dois.

NÃO é responsável por:

- Gravar no banco (seeds/calendarioSeed.ts)

Linhas de grupo especial (trabalhador da saúde, indígenas) ficam
de fora: não são do calendário "da faixa etária".
*/

export const VERSAO_CALENDARIO = "2026";

export const FAIXAS_CALENDARIO = [
  { faixa: "CRIANCA", minMeses: 0, maxMeses: 119, idadeMinima: 0, idadeMaxima: 9 },
  { faixa: "ADOLESCENTE", minMeses: 120, maxMeses: 299, idadeMinima: 10, idadeMaxima: 24 },
  { faixa: "ADULTO", minMeses: 300, maxMeses: 719, idadeMinima: 25, idadeMaxima: 59 },
  { faixa: "IDOSO", minMeses: 720, maxMeses: 1799, idadeMinima: 60, idadeMaxima: 150 }
] as const;

export interface LinhaCalendario {
  vacinaCodigo: string;
  faixa: string;
  idadeMinima: number;
  idadeMaxima: number;
  doses: number;
  reforcos: number;
  observacao: string;
}

function descreverIdade(meses: number): string {

  if (meses < 24 || meses % 12 !== 0) {
    return `${meses} meses`;
  }

  return `${meses / 12} anos`;

}

function descreverLinha(
  linha: DoseEsquema,
  faixa: { minMeses: number; maxMeses: number }
): string {

  const partes: string[] = [];

  if (linha.idadeIdealMeses !== null) {
    partes.push(`aos ${descreverIdade(linha.idadeIdealMeses)}`);
  }

  if (
    linha.idadeMaxMeses !== null &&
    linha.idadeMaxMeses < faixa.maxMeses
  ) {
    partes.push(`até ${descreverIdade(linha.idadeMaxMeses + 1)}`);
  }

  if (linha.idadeMinMeses > faixa.minMeses && linha.idadeIdealMeses === null) {
    partes.push(`a partir de ${descreverIdade(linha.idadeMinMeses)}`);
  }

  return partes.length > 0
    ? `${linha.rotulo} (${partes.join(", ")})`
    : linha.rotulo;

}

export function derivarCalendarioPorFaixa(
  esquema: DoseEsquema[] = ESQUEMA_2026
): LinhaCalendario[] {

  const resultado: LinhaCalendario[] = [];

  for (const faixa of FAIXAS_CALENDARIO) {

    const aplicaveis = esquema.filter(
      (linha) =>
        linha.grupo === null &&
        linha.idadeMinMeses <= faixa.maxMeses &&
        (
          linha.idadeMaxMeses === null ||
          linha.idadeMaxMeses >= faixa.minMeses
        )
    );

    const porVacina = new Map<string, DoseEsquema[]>();

    for (const linha of aplicaveis) {
      porVacina.set(
        linha.vacinaCodigo,
        [...(porVacina.get(linha.vacinaCodigo) ?? []), linha]
      );
    }

    for (const [vacinaCodigo, linhas] of porVacina) {

      const serie = linhas
        .filter((l) => l.numeroDose > 0)
        .sort((a, b) => a.numeroDose - b.numeroDose);

      const periodica = linhas.find((l) => l.numeroDose === 0);

      const descricoes = [
        ...serie.map((l) => descreverLinha(l, faixa)),
        ...(periodica ? [periodica.rotulo.toLowerCase()] : [])
      ];

      resultado.push({
        vacinaCodigo,
        faixa: faixa.faixa,
        idadeMinima: faixa.idadeMinima,
        idadeMaxima: faixa.idadeMaxima,
        doses: new Set(serie.map((l) => l.numeroDose)).size,
        reforcos: periodica ? 1 : 0,
        observacao: descricoes.join("; ")
      });

    }

  }

  return resultado;

}
