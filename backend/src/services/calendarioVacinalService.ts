import * as vacinaRepository
  from "../repositories/vacinaRepository";

import * as calendarioVacinalRepository
  from "../repositories/calendarioVacinalRepository";

/*
==================================================
CALENDARIO VACINAL SERVICE
==================================================

Responsabilidades:

- Gerenciar calendário vacinal
- Validar dados antes de persistir
- Garantir existência da vacina
- Consultar calendário por faixa etária
- Consultar calendário por vacina

NÃO é responsável por:

- Requisições HTTP
- SQL
- Cálculo de pendências
- Carteira vacinal
- Agendamentos

Dependências:

- calendarioVacinalRepository
- vacinaRepository
*/
export class CalendarioVacinalService {

  /*
  ==================================================
  LISTAR TODO O CALENDÁRIO
  ==================================================

  Retorna todos os registros do
  calendário vacinal.
  */
  static async listarTodos() {

    return await calendarioVacinalRepository
      .listarCalendarioVacinal();

  }

  /*
  ==================================================
  BUSCAR REGISTRO POR ID
  ==================================================

  Retorna um registro específico
  do calendário.
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID inválido."
      );
    }

    const registro =
      await calendarioVacinalRepository
        .buscarCalendarioPorId(
          id
        );

    if (!registro) {
      throw new Error(
        "Registro não encontrado."
      );
    }

    return registro;

  }

  /*
  ==================================================
  LISTAR POR FAIXA ETÁRIA
  ==================================================

  Exemplo:

  - CRIANCA
  - ADOLESCENTE
  - ADULTO
  - GESTANTE
  - IDOSO
  */
  static async listarPorFaixaEtaria(
    faixaEtaria: string
  ) {

    if (!faixaEtaria?.trim()) {
      throw new Error(
        "Faixa etária não informada."
      );
    }

    return await calendarioVacinalRepository
      .listarPorFaixaEtaria(
        faixaEtaria
      );

  }

  /*
  ==================================================
  LISTAR POR VACINA
  ==================================================

  Retorna todas as regras de
  calendário associadas à vacina.
  */
  static async listarPorVacina(
    vacinaId: number
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(
          vacinaId
        );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await calendarioVacinalRepository
      .listarPorVacina(
        vacinaId
      );

  }

  /*
  ==================================================
  CRIAR REGISTRO
  ==================================================

  Regras:

  - Vacina deve existir
  - Faixa etária obrigatória
  */
  static async criar(
    vacinaId: number,
    faixaEtaria: string,
    idadeMinima: number,
    idadeMaxima: number,
    doses: number,
    reforcos: number,
    observacao: string | null
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorId(
          vacinaId
        );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    if (!faixaEtaria?.trim()) {
      throw new Error(
        "Faixa etária obrigatória."
      );
    }

    return await calendarioVacinalRepository
      .criarCalendarioVacinal(
        vacinaId,
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao
      );

  }

  /*
  ==================================================
  ATUALIZAR REGISTRO
  ==================================================

  Atualiza um registro existente
  do calendário vacinal.
  */
  static async atualizar(
    id: number,
    faixaEtaria: string,
    idadeMinima: number,
    idadeMaxima: number,
    doses: number,
    reforcos: number,
    observacao: string | null
  ) {

    const registro =
      await calendarioVacinalRepository
        .buscarCalendarioPorId(
          id
        );

    if (!registro) {
      throw new Error(
        "Registro não encontrado."
      );
    }

    return await calendarioVacinalRepository
      .atualizarCalendarioVacinal(
        id,
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao
      );

  }

  /*
  ==================================================
  REMOVER REGISTRO
  ==================================================

  Remove um registro do calendário.
  */
  static async remover(
    id: number
  ) {

    const registro =
      await calendarioVacinalRepository
        .buscarCalendarioPorId(
          id
        );

    if (!registro) {
      throw new Error(
        "Registro não encontrado."
      );
    }

    return await calendarioVacinalRepository
      .removerCalendarioVacinal(
        id
      );

  }

}