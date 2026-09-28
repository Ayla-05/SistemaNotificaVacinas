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
    grupoEspecialId: number
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

    const jaVinculado =
      await pessoaGrupoEspecialRepository
        .existeGrupoNaPessoa(
          pessoaId,
          grupoEspecialId
        );

    if (jaVinculado) {
      return jaVinculado.id;
    }

    return await pessoaGrupoEspecialRepository
      .adicionarGrupoPessoa(
        pessoaId,
        grupoEspecialId
      );

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
