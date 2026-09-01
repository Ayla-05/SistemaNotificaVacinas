import * as agendamentoVacinaRepository from "../repositories/agendamentoVacinaRepository";
import * as pessoaRepository from "../repositories/pessoaRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";

/*
==================================================
AGENDAMENTO SERVICE
==================================================

Responsabilidades:

- Gerenciar agendamentos vacinais
- Validar pessoas e vacinas
- Criar agendamentos
- Atualizar status
- Consultar agendamentos
- Remover agendamentos

NÃO é responsável por:

- Requisições HTTP
- SQL
- Cálculo de pendências vacinais
- Regras vacinais
- Geração automática de agendamentos

Dependências:

- agendamentoVacinaRepository
- pessoaRepository
- vacinaRepository
*/
export class AgendamentoService {

  /*
  ==================================================
  LISTAR TODOS OS AGENDAMENTOS
  ==================================================

  Retorna todos os agendamentos cadastrados.
  */
  static async listarTodos() {

    return await agendamentoVacinaRepository
      .listarAgendamentos();

  }

  /*
  ==================================================
  BUSCAR AGENDAMENTO POR ID
  ==================================================

  Retorna um agendamento específico.
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID do agendamento inválido."
      );
    }

    const agendamento =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(id);

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    return agendamento;

  }

  /*
  ==================================================
  LISTAR AGENDAMENTOS DA PESSOA
  ==================================================

  Retorna todos os agendamentos de uma pessoa.
  */
  static async listarPorPessoa(
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

    return await agendamentoVacinaRepository
      .listarAgendamentosPessoa(
        pessoaId
      );

  }

  /*
  ==================================================
  CRIAR AGENDAMENTO
  ==================================================

  Regras:

  - Pessoa deve existir
  - Vacina deve existir
  - Dose deve ser maior que zero
  */
  static async criar(
    pessoaId: number,
    vacinaId: number,
    numeroDose: number,
    dataPrevista: string,
    observacao?: string
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

    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        vacinaId
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    if (numeroDose <= 0) {
      throw new Error(
        "Número da dose inválido."
      );
    }

    if (!dataPrevista?.trim()) {
      throw new Error(
        "Data prevista não informada."
      );
    }

    return await agendamentoVacinaRepository
      .criarAgendamento(
        pessoaId,
        vacinaId,
        numeroDose,
        dataPrevista,
        observacao
      );

  }

  /*
  ==================================================
  ATUALIZAR STATUS
  ==================================================

  Status aceitos:

  - PENDENTE
  - AGENDADA
  - REALIZADA
  - CANCELADA
  - ATRASADA
  */
  static async atualizarStatus(
    id: number,
    status: string
  ) {

    const agendamento =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(id);

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    return await agendamentoVacinaRepository
      .atualizarStatusAgendamento(
        id,
        status
      );

  }

  /*
  ==================================================
  ATUALIZAR OBSERVAÇÃO
  ==================================================

  Atualiza observações do agendamento.
  */
  static async atualizarObservacao(
    id: number,
    observacao: string
  ) {

    const agendamento =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(id);

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    return await agendamentoVacinaRepository
      .atualizarObservacaoAgendamento(
        id,
        observacao
      );

  }

  /*
  ==================================================
  CONTAR AGENDAMENTOS DA PESSOA
  ==================================================

  Retorna a quantidade de agendamentos
  vinculados à pessoa.
  */
  static async contarPessoa(
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

    return await agendamentoVacinaRepository
      .contarAgendamentosPessoa(
        pessoaId
      );

  }

  /*
  ==================================================
  REMOVER AGENDAMENTO
  ==================================================

  Remove definitivamente um agendamento.
  */
  static async remover(
    id: number
  ) {

    const agendamento =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(id);

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    return await agendamentoVacinaRepository
      .removerAgendamento(
        id
      );

  }

}