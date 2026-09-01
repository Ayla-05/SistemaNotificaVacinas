import * as vacinaRepository from "../repositories/vacinaRepository";
import * as regraVacinalRepository from "../repositories/regraVacinalRepository";

/*
==================================================
REGRA VACINAL SERVICE
==================================================

Responsabilidades:

- Gerenciar regras vacinais
- Validar dados antes da persistência
- Garantir existência da vacina
- Garantir integridade das regras
- Consultar regras vacinais

NÃO é responsável por:

- Requisições HTTP
- SQL
- Carteira vacinal
- Agendamentos

Dependências:

- regraVacinalRepository
- vacinaRepository
*/
export class RegraVacinalService {

  /*
  ==================================================
  LISTAR TODAS AS REGRAS
  ==================================================
  */
  static async listarTodas() {

    return await regraVacinalRepository
      .listarRegrasVacinais();

  }

  /*
  ==================================================
  BUSCAR REGRA POR ID
  ==================================================
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID da regra inválido."
      );
    }

    const regra =
      await regraVacinalRepository
        .buscarRegraPorId(id);

    if (!regra) {
      throw new Error(
        "Regra não encontrada."
      );
    }

    return regra;

  }

  /*
  ==================================================
  BUSCAR REGRA PADRÃO DA VACINA
  ==================================================
  */
  static async buscarPorVacina(
    vacinaId: number
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(vacinaId);

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await regraVacinalRepository
      .buscarRegraPorVacina(
        vacinaId
      );

  }

  /*
  ==================================================
  BUSCAR REGRA DA VACINA PARA
  GRUPO ESPECIAL
  ==================================================
  */
  static async buscarPorVacinaEGrupo(
    vacinaId: number,
    grupoEspecialId: number
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(vacinaId);

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await regraVacinalRepository
      .buscarRegraPorVacinaEGrupo(
        vacinaId,
        grupoEspecialId
      );

  }

  /*
  ==================================================
  LISTAR REGRAS DA VACINA
  ==================================================
  */
  static async listarPorVacina(
    vacinaId: number
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(vacinaId);

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await regraVacinalRepository
      .listarRegrasDaVacina(
        vacinaId
      );

  }

  /*
  ==================================================
  CRIAR REGRA VACINAL
  ==================================================
  */
  static async criar(
    vacinaId: number,
    grupoEspecialId: number | null,
    intervaloDose12: number | null,
    intervaloDose23: number | null,
    intervaloDose34: number | null,
    intervaloDoseReforco: number | null,
    reforcoAnos: number | null,
    campanhaAnual: number,
    observacao: string | null
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(vacinaId);

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await regraVacinalRepository
      .criarRegraVacinal(
        vacinaId,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      );

  }

  /*
  ==================================================
  ATUALIZAR REGRA VACINAL
  ==================================================
  */
  static async atualizar(
    id: number,
    grupoEspecialId: number | null,
    intervaloDose12: number | null,
    intervaloDose23: number | null,
    intervaloDose34: number | null,
    intervaloDoseReforco: number | null,
    reforcoAnos: number | null,
    campanhaAnual: number,
    observacao: string | null
  ) {

    const regra =
      await regraVacinalRepository
        .buscarRegraPorId(id);

    if (!regra) {
      throw new Error(
        "Regra não encontrada."
      );
    }

    return await regraVacinalRepository
      .atualizarRegraVacinal(
        id,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      );

  }

  /*
  ==================================================
  REMOVER REGRA VACINAL
  ==================================================
  */
  static async remover(
    id: number
  ) {

    const regra =
      await regraVacinalRepository
        .buscarRegraPorId(id);

    if (!regra) {
      throw new Error(
        "Regra não encontrada."
      );
    }

    return await regraVacinalRepository
      .removerRegraVacinal(
        id
      );

  }

}