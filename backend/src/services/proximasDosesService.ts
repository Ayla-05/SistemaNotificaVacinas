import {
  calcularProximasDoses,
  ProximaDose
} from "../utils/proximasDoses";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";
import * as pessoaGrupoEspecialRepository from "../repositories/pessoaGrupoEspecialRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";

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
export interface ProximaDoseComNome extends ProximaDose {
  vacina: string;
}

/* Data de hoje no fuso do servidor (e não em UTC, que vira o dia de noite). */
function hojeIso(hoje: Date): string {

  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${hoje.getFullYear()}-${mes}-${dia}`;

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

    const [carteira, grupos, vacinas] =
      await Promise.all([
        registroVacinacaoRepository.listarCarteiraPessoa(pessoaId),
        pessoaGrupoEspecialRepository.listarGruposDaPessoa(pessoaId),
        vacinaRepository.listarTodasVacinas() as Promise<any[]>
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

    return calcularProximasDoses({
      nascimento: String(pessoa.data_nascimento).slice(0, 10),
      hoje: hojeIso(hoje),
      doses,
      grupos: grupos.map((g) => g.nome)
    }).map((dose) => ({
      ...dose,
      vacina: nomes.get(dose.vacinaCodigo) ?? dose.vacinaCodigo
    }));

  }

}
