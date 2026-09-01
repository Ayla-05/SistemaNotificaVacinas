import * as campanhaVacinalRepository from "../repositories/campanhaVacinalRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";

/*
==================================================
CAMPANHA VACINAL SERVICE
==================================================

Responsabilidades:

- Gerenciar campanhas vacinais
- Validar dados antes da persistência
- Garantir existência da vacina
- Consultar campanhas
- Ativar e desativar campanhas

NÃO é responsável por:

- Requisições HTTP
- SQL
- Agendamentos
- Regras vacinais

Dependências:

- campanhaVacinalRepository
- vacinaRepository
*/
export class CampanhaVacinalService {

  /*
  ==================================================
  LISTAR TODAS AS CAMPANHAS
  ==================================================
  */
  static async listarTodas() {

    return await campanhaVacinalRepository
      .listarCampanhasVacinais();

  }

  /*
  ==================================================
  LISTAR CAMPANHAS ATIVAS
  ==================================================
  */
  static async listarAtivas() {

    return await campanhaVacinalRepository
      .listarCampanhasAtivas();

  }

  /*
  ==================================================
  BUSCAR CAMPANHA POR ID
  ==================================================
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID da campanha inválido."
      );
    }

    const campanha =
      await campanhaVacinalRepository
        .buscarCampanhaPorId(id);

    if (!campanha) {
      throw new Error(
        "Campanha não encontrada."
      );
    }

    return campanha;

  }

  /*
  ==================================================
  LISTAR CAMPANHAS POR VACINA
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

    return await campanhaVacinalRepository
      .listarCampanhasPorVacina(vacinaId);

  }

  /*
  ==================================================
  CRIAR CAMPANHA
  ==================================================

  Regras:

  - Vacina deve existir
  - Nome obrigatório
  */
  static async criar(
    vacinaId: number,
    nome: string,
    dataInicio: string | null,
    dataFim: string | null,
    publicoAlvo: string | null,
    fonte: string | null,
    ultimaAtualizacao: string | null
  ) {

    if (!nome?.trim()) {
      throw new Error(
        "Nome da campanha é obrigatório."
      );
    }

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(vacinaId);

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await campanhaVacinalRepository
      .criarCampanhaVacinal(
        vacinaId,
        nome,
        dataInicio,
        dataFim,
        publicoAlvo,
        fonte,
        ultimaAtualizacao
      );

  }

  /*
  ==================================================
  ATUALIZAR CAMPANHA
  ==================================================
  */
  static async atualizar(
    id: number,
    nome: string,
    dataInicio: string | null,
    dataFim: string | null,
    publicoAlvo: string | null,
    fonte: string | null,
    ultimaAtualizacao: string | null
  ) {

    const campanha =
      await campanhaVacinalRepository
        .buscarCampanhaPorId(id);

    if (!campanha) {
      throw new Error(
        "Campanha não encontrada."
      );
    }

    return await campanhaVacinalRepository
      .atualizarCampanhaVacinal(
        id,
        nome,
        dataInicio,
        dataFim,
        publicoAlvo,
        fonte,
        ultimaAtualizacao
      );

  }

  /*
  ==================================================
  ATIVAR CAMPANHA
  ==================================================
  */
  static async ativar(
    id: number
  ) {

    const campanha =
      await campanhaVacinalRepository
        .buscarCampanhaPorId(id);

    if (!campanha) {
      throw new Error(
        "Campanha não encontrada."
      );
    }

    return await campanhaVacinalRepository
      .ativarCampanha(id);

  }

  /*
  ==================================================
  DESATIVAR CAMPANHA
  ==================================================
  */
  static async desativar(
    id: number
  ) {

    const campanha =
      await campanhaVacinalRepository
        .buscarCampanhaPorId(id);

    if (!campanha) {
      throw new Error(
        "Campanha não encontrada."
      );
    }

    return await campanhaVacinalRepository
      .desativarCampanha(id);

  }

  /*
  ==================================================
  REMOVER CAMPANHA
  ==================================================

  Remove definitivamente a campanha.
  */
  static async remover(
    id: number
  ) {

    const campanha =
      await campanhaVacinalRepository
        .buscarCampanhaPorId(id);

    if (!campanha) {
      throw new Error(
        "Campanha não encontrada."
      );
    }

    return await campanhaVacinalRepository
      .removerCampanha(id);

  }

}