import { obterFaixaEtaria } from "../utils/faixaEtaria";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as calendarioVacinalRepository from "../repositories/calendarioVacinalRepository";
import * as regraVacinalRepository from "../repositories/regraVacinalRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";

/*
==================================================
VACINAL SERVICE
==================================================

Responsabilidades:

- Calcular idade
- Determinar faixa etária
- Consultar calendário vacinal
- Consultar regras vacinais
- Consultar carteira vacinal
- Calcular doses aplicadas
- Identificar vacinas pendentes
- Identificar vacinas em dia

NÃO é responsável por:

- Requisições HTTP
- SQL
- Cadastro de pessoas
- Cadastro de vacinas

Dependências:

- pessoaRepository
- calendarioVacinalRepository
- regraVacinalRepository
- registroVacinacaoRepository
- doseVacinaRepository
- faixaEtaria.ts
*/
export class VacinalService {

  /*
  ==================================================
  CALCULAR IDADE
  ==================================================

  Calcula a idade atual da pessoa.
  */
  static calcularIdade(
    dataNascimento: string
  ): number {

    const hoje = new Date();

    const nascimento =
      new Date(dataNascimento);

    let idade =
      hoje.getFullYear() -
      nascimento.getFullYear();

    const mesAtual =
      hoje.getMonth();

    const mesNascimento =
      nascimento.getMonth();

    const diaAtual =
      hoje.getDate();

    const diaNascimento =
      nascimento.getDate();

    if (
      mesAtual < mesNascimento ||
      (
        mesAtual === mesNascimento &&
        diaAtual < diaNascimento
      )
    ) {
      idade--;
    }

    return idade;

  }

  /*
  ==================================================
  OBTER FAIXA ETÁRIA DA PESSOA
  ==================================================

  Utiliza a cartilha oficial definida
  em utils/faixaEtaria.ts
  */
  static async obterFaixaEtariaPessoa(
    pessoaId: number
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    const idade =
      this.calcularIdade(
        pessoa.data_nascimento
      );

    return obterFaixaEtaria(
      idade
    );

  }

  /*
  ==================================================
  OBTER CALENDÁRIO DA PESSOA
  ==================================================

  Determina a faixa etária da pessoa
  e retorna o calendário correspondente.
  */
  static async obterCalendarioPessoa(
    pessoaId: number
  ) {

    const faixaEtaria =
      await this.obterFaixaEtariaPessoa(
        pessoaId
      );

    return await calendarioVacinalRepository
      .listarPorFaixaEtaria(
        faixaEtaria
      );

  }

  /*
  ==================================================
  OBTER CARTEIRA DA PESSOA
  ==================================================

  Retorna todas as vacinas registradas.
  */
  static async obterCarteiraPessoa(
    pessoaId: number
  ) {

    return await registroVacinacaoRepository
      .listarCarteiraPessoa(
        pessoaId
      );

  }

  /*
  ==================================================
  CONTAR DOSES DE UMA VACINA
  ==================================================

  Conta quantas doses foram registradas
  para um determinado registro vacinal.
  */
  static async contarDosesAplicadas(
    registroId: number
  ) {

    return await doseVacinaRepository
      .contarDoses(
        registroId
      );

  }

  /*
  ==================================================
  OBTER REGRAS DE UMA VACINA
  ==================================================

  Retorna as regras configuradas para a vacina.
  */
  static async obterRegrasVacina(
    vacinaId: number
  ) {

    return await regraVacinalRepository
      .listarRegrasDaVacina(
        vacinaId
      );

  }

  /*
  ==================================================
  CALCULAR VACINAS PENDENTES
  ==================================================

  Compara:

  Calendário
  versus
  Carteira Vacinal
  */
  static async calcularPendencias(
    pessoaId: number
  ) {

    const calendario =
      await this.obterCalendarioPessoa(
        pessoaId
      );

    const carteira =
      await this.obterCarteiraPessoa(
        pessoaId
      );

    const pendencias = [];

    for (const vacinaCalendario of calendario) {

      const vacinaPessoa =
        carteira.find(
          (item: any) =>
            item.vacina_id ===
            vacinaCalendario.vacina_id
        );

      if (!vacinaPessoa) {

        pendencias.push({
          vacina_id:
            vacinaCalendario.vacina_id,

          doses_necessarias:
            vacinaCalendario.doses,

          doses_registradas: 0,

          faltam:
            vacinaCalendario.doses
        });

        continue;
      }

      const dosesRegistradas =
        await doseVacinaRepository
          .contarDoses(
            vacinaPessoa.id
          );

      const faltam =
        Math.max(
          0,
          vacinaCalendario.doses -
          dosesRegistradas
        );

      if (faltam > 0) {

        pendencias.push({
          vacina_id:
            vacinaCalendario.vacina_id,

          doses_necessarias:
            vacinaCalendario.doses,

          doses_registradas:
            dosesRegistradas,

          faltam
        });

      }

    }

    return pendencias;

  }

  /*
  ==================================================
  CALCULAR VACINAS EM DIA
  ==================================================

  Retorna vacinas que já possuem
  todas as doses obrigatórias.
  */
  static async calcularVacinasEmDia(
    pessoaId: number
  ) {

    const calendario =
      await this.obterCalendarioPessoa(
        pessoaId
      );

    const carteira =
      await this.obterCarteiraPessoa(
        pessoaId
      );

    const resultado = [];

    for (const vacinaCalendario of calendario) {

      const vacinaPessoa =
        carteira.find(
          (item: any) =>
            item.vacina_id ===
            vacinaCalendario.vacina_id
        );

      if (!vacinaPessoa) {
        continue;
      }

      const doses =
        await doseVacinaRepository
          .contarDoses(
            vacinaPessoa.id
          );

      if (
        doses >=
        vacinaCalendario.doses
      ) {

        resultado.push({
          vacina_id:
            vacinaCalendario.vacina_id,

          doses
        });

      }

    }

    return resultado;

  }

}