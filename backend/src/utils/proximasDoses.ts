import {
  DoseEsquema,
  ESQUEMA_2026,
  EQUIVALENCIA_DATAS,
  EQUIVALENCIA_DOSES
} from "../data/esquemaVacinal2026";

/*
==================================================
PRÓXIMAS DOSES (FUNÇÕES PURAS)
==================================================

Responsabilidades:

- Dada a data de nascimento, as doses já registradas (com data)
  e os grupos especiais da pessoa, calcular QUAL é a próxima
  dose de cada vacina e EM QUE DATA ela é devida, comparando a
  carteira com o esquema do Calendário Nacional (esquemaVacinal2026)

NÃO é responsável por:

- Buscar dados (ProximasDosesService)
- Requisições HTTP

Regra da data prevista da próxima dose:

  data = a MAIOR entre
         - nascimento + idade ideal da dose (ex.: 4 meses)
         - data da última dose + intervalo mínimo (ex.: 60 dias)

Assim a dose nunca é marcada antes do intervalo mínimo, nem
antes da idade recomendada. Reforços periódicos (dT, influenza)
usam: data da última dose + período (ex.: 120 meses).

Todas as datas são "AAAA-MM-DD" e a conta é feita em UTC, para o
fuso do servidor não mover o dia.
*/

export type StatusDose =
  | "ATRASADA"
  | "DISPONIVEL"
  | "PROXIMA"
  | "FUTURA";

export interface DoseRegistrada {
  numero: number;
  data: string | null;
}

export interface EntradaProximasDoses {
  nascimento: string;
  hoje: string;
  /* doses registradas, por código de vacina */
  doses: Record<string, DoseRegistrada[]>;
  /* códigos dos grupos especiais da pessoa (ex.: "TRABALHADOR_SAUDE") */
  grupos: string[];
  esquema?: DoseEsquema[];
}

export interface ProximaDose {
  vacinaCodigo: string;
  numeroDose: number;
  rotulo: string;
  /* null = pode tomar agora, mas o calendário não define uma data */
  dataPrevista: string | null;
  status: StatusDose;
  /* negativo = dias de atraso */
  diasParaVencer: number | null;
  dosesTomadas: number;
  ultimaDose: string | null;
  fonte: string;
}

/* "Próxima" = vence em até 30 dias. */
export const DIAS_PROXIMA = 30;

/*
==================================================
DATAS
==================================================
*/
function parse(iso: string): Date {

  const [a, m, d] = iso.split("-").map(Number);

  return new Date(Date.UTC(a, m - 1, d));

}

function formatar(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function adicionarDias(
  iso: string,
  dias: number
): string {

  const data = parse(iso);

  data.setUTCDate(data.getUTCDate() + dias);

  return formatar(data);

}

/*
Soma meses sem estourar o fim do mês:
31/01 + 1 mês = 28/02 (ou 29/02 em ano bissexto).
*/
export function adicionarMeses(
  iso: string,
  meses: number
): string {

  const data = parse(iso);

  const dia = data.getUTCDate();

  data.setUTCDate(1);
  data.setUTCMonth(data.getUTCMonth() + meses);

  const ultimoDia = new Date(
    Date.UTC(
      data.getUTCFullYear(),
      data.getUTCMonth() + 1,
      0
    )
  ).getUTCDate();

  data.setUTCDate(Math.min(dia, ultimoDia));

  return formatar(data);

}

/* Meses completos entre duas datas (11m29d = 11). */
export function idadeEmMeses(
  nascimento: string,
  hoje: string
): number {

  const n = parse(nascimento);
  const h = parse(hoje);

  let meses =
    (h.getUTCFullYear() - n.getUTCFullYear()) * 12 +
    (h.getUTCMonth() - n.getUTCMonth());

  if (h.getUTCDate() < n.getUTCDate()) {
    meses--;
  }

  return Math.max(0, meses);

}

export function diasEntre(
  de: string,
  ate: string
): number {

  return Math.round(
    (parse(ate).getTime() - parse(de).getTime()) /
    86_400_000
  );

}

/*
==================================================
CÁLCULO
==================================================
*/
function maiorData(datas: string[]): string | null {

  return datas.length > 0
    ? datas.reduce((a, b) => (a > b ? a : b))
    : null;

}

function classificar(
  dataPrevista: string | null,
  hoje: string
): { status: StatusDose; diasParaVencer: number | null } {

  if (dataPrevista === null) {
    return { status: "DISPONIVEL", diasParaVencer: null };
  }

  const dias = diasEntre(hoje, dataPrevista);

  if (dias < 0) {
    return { status: "ATRASADA", diasParaVencer: dias };
  }

  return {
    status: dias <= DIAS_PROXIMA ? "PROXIMA" : "FUTURA",
    diasParaVencer: dias
  };

}

const ORDEM_STATUS: Record<StatusDose, number> = {
  ATRASADA: 0,
  DISPONIVEL: 1,
  PROXIMA: 2,
  FUTURA: 3
};

export function calcularProximasDoses(
  entrada: EntradaProximasDoses
): ProximaDose[] {

  const {
    nascimento,
    hoje,
    doses,
    grupos
  } = entrada;

  const esquema = entrada.esquema ?? ESQUEMA_2026;

  const idade = idadeEmMeses(nascimento, hoje);

  const aplicaveis = esquema.filter(
    (linha) =>
      idade >= linha.idadeMinMeses &&
      (
        linha.idadeMaxMeses === null ||
        idade <= linha.idadeMaxMeses
      ) &&
      (
        linha.grupo === null ||
        grupos.includes(linha.grupo)
      )
  );

  const porVacina = new Map<string, DoseEsquema[]>();

  for (const linha of aplicaveis) {

    porVacina.set(
      linha.vacinaCodigo,
      [...(porVacina.get(linha.vacinaCodigo) ?? []), linha]
    );

  }

  const resultado: ProximaDose[] = [];

  for (const [codigo, linhas] of porVacina) {

    const proprias = doses[codigo] ?? [];

    const equivalentes =
      (EQUIVALENCIA_DOSES[codigo] ?? [])
        .flatMap((c) => doses[c] ?? []);

    const dosesTomadas = Math.max(
      0,
      ...proprias.map((d) => d.numero),
      ...equivalentes.map((d) => d.numero)
    );

    const referenciaDatas = [
      ...proprias,
      ...(EQUIVALENCIA_DATAS[codigo] ?? [])
        .flatMap((c) => doses[c] ?? [])
    ];

    const ultimaDose = maiorData(
      referenciaDatas
        .map((d) => d.data)
        .filter((d): d is string => !!d)
    );

    /* Uma linha por número de dose (a primeira aplicável vale). */
    const serie: DoseEsquema[] = [];

    for (const linha of linhas) {

      if (
        linha.numeroDose > 0 &&
        !serie.some((s) => s.numeroDose === linha.numeroDose)
      ) {
        serie.push(linha);
      }

    }

    serie.sort((a, b) => a.numeroDose - b.numeroDose);

    const proximaDaSerie =
      serie.find((s) => s.numeroDose > dosesTomadas);

    const periodica =
      linhas.find((l) => l.numeroDose === 0);

    let linha: DoseEsquema | undefined;
    let dataPrevista: string | null = null;

    if (proximaDaSerie) {

      linha = proximaDaSerie;

      const candidatas: string[] = [];

      if (linha.idadeIdealMeses !== null) {
        candidatas.push(
          adicionarMeses(
            nascimento,
            linha.idadeIdealMeses
          )
        );
      }

      if (ultimaDose) {

        if (linha.intervaloMinDias !== null) {
          candidatas.push(
            adicionarDias(
              ultimaDose,
              linha.intervaloMinDias
            )
          );
        }

        if (linha.intervaloMinMeses !== null) {
          candidatas.push(
            adicionarMeses(
              ultimaDose,
              linha.intervaloMinMeses
            )
          );
        }

      }

      dataPrevista = maiorData(candidatas);

    } else if (periodica) {

      linha = periodica;

      dataPrevista =
        ultimaDose && periodica.repeteMeses !== null
          ? adicionarMeses(
              ultimaDose,
              periodica.repeteMeses
            )
          : null;

    }

    if (!linha) {
      continue;
    }

    resultado.push({
      vacinaCodigo: codigo,
      numeroDose: linha.numeroDose,
      rotulo: linha.rotulo,
      dataPrevista,
      ...classificar(dataPrevista, hoje),
      dosesTomadas,
      ultimaDose,
      fonte: linha.fonte
    });

  }

  return resultado.sort((a, b) => {

    if (a.status !== b.status) {
      return ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status];
    }

    return (a.dataPrevista ?? "").localeCompare(
      b.dataPrevista ?? ""
    );

  });

}
