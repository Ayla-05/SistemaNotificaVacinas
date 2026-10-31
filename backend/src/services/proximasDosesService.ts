import {
  calcularProximasDoses,
  ProximaDose
} from "../utils/proximasDoses";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";
import * as pessoaGrupoEspecialRepository from "../repositories/pessoaGrupoEspecialRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";
import * as campanhaVacinalRepository from "../repositories/campanhaVacinalRepository";

/*
==================================================
PRÓXIMAS DOSES SERVICE
==================================================

Responsabilidades:

- Reunir os dados da pessoa (nascimento, doses com data,
  grupos especiais) e pedir ao cálculo (utils/proximasDoses)
  a próxima dose de cada vacina e a data em que é devida
- Acrescentar o nome da vacina para exibição

NÃO é responsável por:

- A regra do calendário (data/esquemaVacinal2026.ts)
- O cálculo das datas (utils/proximasDoses.ts)
- Requisições HTTP

Dependências:

- pessoaRepository, registroVacinacaoRepository, doseVacinaRepository,
  pessoaGrupoEspecialRepository, vacinaRepository
*/
/* Período de uma campanha de vacinação da vacina (cadastrada pelo administrador). */
export interface PeriodoCampanha {
  nome: string;
  dataInicio: string | null;
  dataFim: string | null;
}

export interface ProximaDoseComNome extends ProximaDose {
  vacina: string;
  /* campanha em andamento ou a próxima campanha dessa vacina, se houver */
  campanha: PeriodoCampanha | null;
}

/* Data de hoje no fuso do servidor (e não em UTC, que vira o dia de noite). */
function hojeIso(hoje: Date): string {

  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${hoje.getFullYear()}-${mes}-${dia}`;

}

/*
Campanha da vacina que ainda não terminou: a que está em andamento
ou, se não houver, a que começa primeiro.
*/
export function escolherCampanha(
  campanhas: any[],
  vacinaCodigo: string,
  hoje: string
): PeriodoCampanha | null {

  const candidatas = campanhas
    .filter(
      (c) =>
        c.vacina_codigo === vacinaCodigo &&
        (!c.data_fim || String(c.data_fim).slice(0, 10) >= hoje)
    )
    .sort((a, b) =>
      String(a.data_inicio ?? "").localeCompare(
        String(b.data_inicio ?? "")
      )
    );

  const escolhida = candidatas[0];

  return escolhida
    ? {
        nome: escolhida.nome,
        dataInicio: escolhida.data_inicio
          ? String(escolhida.data_inicio).slice(0, 10)
          : null,
        dataFim: escolhida.data_fim
          ? String(escolhida.data_fim).slice(0, 10)
          : null
      }
    : null;

}

export class ProximasDosesService {

  static async calcular(
    pessoaId: number,
    hoje: Date = new Date()
  ): Promise<ProximaDoseComNome[]> {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    const [carteira, grupos, vacinas, campanhas] =
      await Promise.all([
        registroVacinacaoRepository.listarCarteiraPessoa(pessoaId),
        pessoaGrupoEspecialRepository.listarGruposDaPessoa(pessoaId),
        vacinaRepository.listarTodasVacinas() as Promise<any[]>,
        campanhaVacinalRepository.listarCampanhasAtivas()
      ]);

    const doses: Record<string, Array<{ numero: number; data: string | null }>> = {};

    for (const registro of carteira) {

      const registradas =
        await doseVacinaRepository.listarDosesRegistro(
          registro.id
        );

      doses[registro.codigo] = [
        ...(doses[registro.codigo] ?? []),
        ...registradas.map((d: any) => ({
          numero: d.numero_dose,
          data: d.data_aplicacao
            ? String(d.data_aplicacao).slice(0, 10)
            : null
        }))
      ];

    }

    const nomes = new Map<string, string>(
      vacinas.map((v) => [v.codigo, v.nome])
    );

    const dataHoje = hojeIso(hoje);

    return calcularProximasDoses({
      nascimento: String(pessoa.data_nascimento).slice(0, 10),
      hoje: dataHoje,
      doses,
      grupos: grupos.map((g) => g.nome)
    }).map((dose) => ({
      ...dose,
      vacina: nomes.get(dose.vacinaCodigo) ?? dose.vacinaCodigo,
      campanha: escolherCampanha(
        campanhas,
        dose.vacinaCodigo,
        dataHoje
      )
    }));

  }

}
