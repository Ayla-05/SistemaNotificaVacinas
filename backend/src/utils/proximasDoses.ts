import {
  DoseEsquema,
  ESQUEMA_2026,
  EQUIVALENCIA_DATAS,
  EQUIVALENCIA_DOSES,
  VACINAS_FORA_DO_ESQUEMA_DA_GESTANTE,
  GESTACAO_DURACAO_MAX_DIAS
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
  /* início estimado da gestação atual (AAAA-MM-DD), para o grupo GESTANTE */
  gestacaoInicio?: string | null;
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
  /* nome da dose já tomada no esquema (ex.: "3ª dose de reforço"), se o calendário a define */
  rotuloUltimaTomada: string | null;
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

  const inicioGestacao = entrada.gestacaoInicio ?? null;

  const esquema = entrada.esquema ?? ESQUEMA_2026;

  const idade = idadeEmMeses(nascimento, hoje);

  /*
  Gestante com gestação em andamento: sem data de início (cadastro antigo) vale o
  grupo; com data, só até a duração máxima de uma gestação. Depois disso a pessoa
  volta ao calendário comum.
  */
  const gestante =
    grupos.includes("GESTANTE") &&
    (
      inicioGestacao === null ||
      hoje <= adicionarDias(
        inicioGestacao,
        GESTACAO_DURACAO_MAX_DIAS
      )
    );

  const aplicaveis = esquema.filter(
    (linha) =>
      !(
        gestante &&
        VACINAS_FORA_DO_ESQUEMA_DA_GESTANTE.includes(
          linha.vacinaCodigo
        )
      ) &&
      /* o dT da gestante (3 doses) substitui o reforço de adulto */
      !(
        gestante &&
        linha.vacinaCodigo === "DT" &&
        linha.grupo === null
      ) &&
      /* regras "a cada gestação" precisam saber quando a gestação começou */
      !(linha.porGestacao && inicioGestacao === null) &&
      idade >= linha.idadeMinMeses &&
      (
        linha.idadeMaxMeses === null ||
        idade <= linha.idadeMaxMeses
      ) &&
      (
        linha.grupo === null ||
        (
          linha.grupo === "GESTANTE"
            ? gestante
            : grupos.includes(linha.grupo)
        )
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

    /* "A cada gestação": dose aplicada antes do início desta gestação não conta. */
    const soDestaGestacao = (lista: DoseRegistrada[]) =>
      gestante &&
      inicioGestacao !== null &&
      linhas.some((l) => l.porGestacao)
        ? lista.filter(
            (d) => d.data === null || d.data >= inicioGestacao
          )
        : lista;

    /* Só contam doses a partir de certa idade (ex.: meningo ACWY dos 11 anos). */
    const idadeCorte = linhas.reduce(
      (maior, l) =>
        l.contaDesdeIdadeMeses !== null
          ? Math.max(maior, l.contaDesdeIdadeMeses)
          : maior,
      0
    );
    const dataCorte =
      idadeCorte > 0
        ? adicionarMeses(nascimento, idadeCorte)
        : null;

    const restringir = (lista: DoseRegistrada[]) =>
      soDestaGestacao(
        dataCorte !== null
          ? lista.filter(
              (d) => d.data === null || d.data >= dataCorte
            )
          : lista
      );

    const proprias = restringir(doses[codigo] ?? []);
    const equivalentes = restringir(
      (EQUIVALENCIA_DOSES[codigo] ?? [])
        .flatMap((c) => doses[c] ?? [])
    );

    /* Data da 1ª dose da série (para regras do tipo "3ª dose >= 4 meses após a 1ª"). */
    const datasPrimeira = [...proprias, ...equivalentes]
      .filter((d) => d.numero === 1 && d.data !== null)
      .map((d) => d.data as string)
      .sort();
    const primeiraDose = datasPrimeira[0] ?? null;

    let dosesTomadas = Math.max(
      0,
      ...proprias.map((d) => d.numero),
      ...equivalentes.map((d) => d.numero)
    );

    /*
    Gestante: 3 ou mais doses de penta, tetravalente, DTP, DT, DTPa, dTpa ou dT
    (em qualquer época) já completam o esquema; falta só o dTpa a cada gestação
    (calendário do Estado de SP, out/2026).
    */
    if (gestante && codigo === "DT") {

      const dosesComTetano = [
        "DT",
        "DTP",
        "DTPA",
        "PENTAVALENTE"
      ].reduce(
        (total, c) => total + (doses[c] ?? []).length,
        0
      );

      dosesTomadas = Math.max(
        dosesTomadas,
        dosesComTetano
      );

    }

    const referenciaDatas = [
      ...proprias,
      ...restringir(
        (EQUIVALENCIA_DATAS[codigo] ?? [])
          .flatMap((c) => doses[c] ?? [])
      )
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
    let rotuloExibido: string | null = null;

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

      /* Série com "N meses depois da 1ª dose" (hepatite B e dT: 3ª dose >= 4 meses após a 1ª). */
      if (
        linha.desdePrimeiraDoseMeses !== null &&
        primeiraDose !== null
      ) {
        candidatas.push(
          adicionarMeses(
            primeiraDose,
            linha.desdePrimeiraDoseMeses
          )
        );
      }

      /* Dose liberada a partir de uma semana de gestação (ex.: dTpa na 20ª, VSR na 28ª). */
      if (
        linha.semanasGestacao !== null &&
        inicioGestacao !== null
      ) {
        candidatas.push(
          adicionarDias(
            inicioGestacao,
            linha.semanasGestacao * 7
          )
        );
      }

      dataPrevista = maiorData(candidatas);

      /* Janela já aberta: pode tomar agora (não é "atraso" de quem passou da 20ª semana). */
      if (
        linha.semanasGestacao !== null &&
        dataPrevista !== null &&
        dataPrevista <= hoje
      ) {
        dataPrevista = null;
      }

      /*
      Reforço sem nenhuma dose anterior registrada (nem de vacina
      equivalente): dizer "atrasado desde os 14 anos" seria enganoso,
      porque o que falta é o esquema inteiro. Nesse caso a pessoa pode
      tomar agora e o rótulo pede para atualizar o esquema.
      */
      if (
        linha.reforco &&
        dosesTomadas === 0 &&
        ultimaDose === null &&
        dataPrevista !== null &&
        dataPrevista < hoje
      ) {
        dataPrevista = null;
        rotuloExibido =
          "Sem doses registradas: atualizar o esquema na unidade de saúde";
      }

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
      rotulo: rotuloExibido ?? linha.rotulo,
      dataPrevista,
      ...classificar(dataPrevista, hoje),
      dosesTomadas,
      ultimaDose,
      rotuloUltimaTomada:
        dosesTomadas > 0
          ? (
              serie.find((s) => s.numeroDose === dosesTomadas) ??
              esquema.find(
                (e) =>
                  e.vacinaCodigo === codigo &&
                  e.numeroDose === dosesTomadas
              )
            )?.rotulo ?? null
          : null,
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
