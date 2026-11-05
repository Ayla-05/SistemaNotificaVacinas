import { dataIsoExiste, hojeLocalISO } from "../utils/validacao";
import { adicionarDias } from "../utils/proximasDoses";
import { GESTACAO_DURACAO_MAX_DIAS } from "../data/esquemaVacinal2026";
import * as grupoEspecialRepository from "../repositories/grupoEspecialRepository";
import * as pessoaGrupoEspecialRepository from "../repositories/pessoaGrupoEspecialRepository";
import * as pessoaRepository from "../repositories/pessoaRepository";

/*
==================================================
PESSOA GRUPO ESPECIAL SERVICE
==================================================

Responsabilidades:

- Listar o catálogo de grupos especiais (gestante,
  idoso, comorbidade, etc) disponível no sistema
- Vincular/desvincular uma pessoa a esses grupos

NÃO é responsável por:

- Requisições HTTP
- SQL
- Ajustar o calendário vacinal com base no grupo
  (hoje as regras por grupo especial existem no
  banco - regrasVacinaisTable - mas o cálculo de
  pendências ainda não as consulta; é uma melhoria
  futura)

Dependências:

- grupoEspecialRepository
- pessoaGrupoEspecialRepository
- pessoaRepository
*/
export class PessoaGrupoEspecialService {

  /*
  ==================================================
  LISTAR CATÁLOGO DE GRUPOS ESPECIAIS
  ==================================================
  */
  static async listarCatalogo() {

    return await grupoEspecialRepository
      .listarGruposEspeciais();

  }

  /*
  ==================================================
  LISTAR GRUPOS DE UMA PESSOA
  ==================================================
  */
  static async listarDaPessoa(
    pessoaId: number
  ) {

    return await pessoaGrupoEspecialRepository
      .listarGruposDaPessoa(
        pessoaId
      );

  }

  /*
  ==================================================
  VINCULAR GRUPO À PESSOA
  ==================================================
  */
  static async vincular(
    pessoaId: number,
    grupoEspecialId: number,
    gestacaoInicio?: string | null
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

    const grupo =
      await grupoEspecialRepository
        .buscarGrupoEspecialPorId(
          grupoEspecialId
        );

    if (!grupo) {
      throw new Error(
        "Grupo especial não encontrado."
      );
    }

    /*
    Gestante precisa do início da gestação: dTpa (20ª semana), VSR (28ª semana)
    e "uma dose a cada gestação" dependem dele.
    */
    const inicio =
      grupo.nome === "GESTANTE"
        ? this.validarInicioGestacao(gestacaoInicio)
        : null;

    const jaVinculado =
      await pessoaGrupoEspecialRepository
        .existeGrupoNaPessoa(
          pessoaId,
          grupoEspecialId
        );

    if (jaVinculado) {

      /* Vincular de novo a gestante atualiza o início (ex.: correção das semanas). */
      if (inicio) {
        await pessoaGrupoEspecialRepository
          .atualizarGestacaoInicio(
            pessoaId,
            grupoEspecialId,
            inicio
          );
      }

      return jaVinculado.id;

    }

    return await pessoaGrupoEspecialRepository
      .adicionarGrupoPessoa(
        pessoaId,
        grupoEspecialId,
        inicio
      );

  }

  /*
  Início da gestação: data existente, não futura e de no máximo
  GESTACAO_DURACAO_MAX_DIAS atrás.
  */
  static validarInicioGestacao(
    valor: unknown
  ): string {

    if (valor === undefined || valor === null || valor === "") {
      throw new Error(
        "Informe há quantas semanas está a gestação."
      );
    }

    if (!dataIsoExiste(valor)) {
      throw new Error(
        "Início da gestação inválido. Use o formato AAAA-MM-DD."
      );
    }

    const data = valor.trim();
    const hoje = hojeLocalISO();

    if (data > hoje) {
      throw new Error(
        "O início da gestação não pode estar no futuro."
      );
    }

    if (data < adicionarDias(hoje, -GESTACAO_DURACAO_MAX_DIAS)) {
      throw new Error(
        "A gestação informada passou de 42 semanas. Confira as semanas."
      );
    }

    return data;

  }

  /*
  ==================================================
  DESVINCULAR GRUPO DA PESSOA
  ==================================================
  */
  static async desvincular(
    pessoaId: number,
    grupoEspecialId: number
  ) {

    return await pessoaGrupoEspecialRepository
      .removerGrupoPessoa(
        pessoaId,
        grupoEspecialId
      );

  }

}
