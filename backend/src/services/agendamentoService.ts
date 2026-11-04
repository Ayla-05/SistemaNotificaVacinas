import { dataIsoExiste, validarNumeroDose, validarTexto } from "../utils/validacao";
import * as agendamentoVacinaRepository from "../repositories/agendamentoVacinaRepository";
import * as pessoaRepository from "../repositories/pessoaRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";
import { NotificacaoService } from "./notificacaoService";
import { hojeIso } from "../utils/dataHoje";

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
  - Data não pode ser retroativa (anterior a hoje)
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

    validarNumeroDose(numeroDose);
    validarTexto(observacao, "Observação", { max: 300 });

    if (!dataPrevista?.trim()) {
      throw new Error(
        "Data prevista não informada."
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dataPrevista.trim())) {
      throw new Error(
        "Data prevista inválida. Use o formato AAAA-MM-DD."
      );
    }

    if (!dataIsoExiste(dataPrevista)) {
      throw new Error(
        "Data prevista inválida."
      );
    }

    if (dataPrevista.trim() < hojeIso()) {
      throw new Error(
        "Não é possível agendar em uma data que já passou."
      );
    }

    /* Mesma vacina, dose e data já agendadas e ainda abertas: não duplica. */
    const existentes =
      await agendamentoVacinaRepository.listarAgendamentosPessoa(
        pessoaId
      );

    const jaAgendado = existentes.some(
      (a: any) =>
        a.vacina_id === vacinaId &&
        a.numero_dose === numeroDose &&
        a.data_prevista === dataPrevista.trim() &&
        a.status !== "CANCELADA"
    );

    if (jaAgendado) {
      throw new Error(
        "Esta dose já está agendada para essa data."
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

    /*
    CORREÇÃO [COR-08]: o status era gravado sem validação
    (qualquer texto entrava). Agora só os valores abaixo.
    */
    const STATUS_VALIDOS = [
      "PENDENTE",
      "AGENDADA",
      "REALIZADA",
      "CANCELADA",
      "ATRASADA"
    ];

    if (!STATUS_VALIDOS.includes(status)) {
      throw new Error(
        `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}.`
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

    return await agendamentoVacinaRepository
      .atualizarStatusAgendamento(
        id,
        status
      );

  }

  /*
  ==================================================
  CONFIRMAR QUE A VACINA FOI TOMADA
  ==================================================

  Marca o agendamento como REALIZADA e registra a
  dose na carteira vacinal (data de aplicação = hoje).
  */
  static async confirmarRealizacao(
    id: number
  ) {

    const agendamento: any =
      await agendamentoVacinaRepository
        .buscarAgendamentoPorId(id);

    if (!agendamento) {
      throw new Error(
        "Agendamento não encontrado."
      );
    }

    if (agendamento.status === "REALIZADA") {
      throw new Error(
        "Este agendamento já foi confirmado."
      );
    }

    if (agendamento.status === "CANCELADA") {
      throw new Error(
        "Este agendamento foi cancelado."
      );
    }

    if (agendamento.data_prevista > hojeIso()) {
      throw new Error(
        "Só é possível confirmar a vacina a partir da data agendada."
      );
    }

    let registro: any =
      await registroVacinacaoRepository
        .buscarRegistroPessoaVacina(
          agendamento.pessoa_id,
          agendamento.vacina_id
        );

    const registroId: number =
      registro
        ? registro.id
        : await registroVacinacaoRepository
            .criarRegistroVacinacao(
              agendamento.pessoa_id,
              agendamento.vacina_id
            );

    const doseExistente =
      await doseVacinaRepository.buscarDose(
        registroId,
        agendamento.numero_dose
      );

    if (!doseExistente) {

      await doseVacinaRepository.registrarDose(
        registroId,
        agendamento.numero_dose,
        `Dose ${agendamento.numero_dose}`,
        {
          dataAplicacao: hojeIso(),
          observacao: "Confirmada pelo agendamento"
        }
      );

    }

    await agendamentoVacinaRepository
      .atualizarStatusAgendamento(
        id,
        "REALIZADA"
      );

    const vacina: any =
      await vacinaRepository.buscarVacinaPorId(
        agendamento.vacina_id
      );

    NotificacaoService.notificarRegistroDose(
      agendamento.pessoa_id,
      vacina?.nome ?? "Vacina",
      `Dose ${agendamento.numero_dose}`
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


  /*
  ==================================================
  LISTAR OS AGENDAMENTOS QUE O USUÁRIO PODE VER
  ==================================================

  CORREÇÃO [COR-07]: GET /agendamentos devolvia os agendamentos
  de todos os usuários. Administrador vê tudo; usuário comum vê
  só os das pessoas da própria conta.
  */
  static async listarVisiveis(
    usuarioId: number,
    perfil?: string
  ) {

    const agendamentos =
      await this.listarTodos();

    if (perfil === "ADMIN") {
      return agendamentos;
    }

    const minhas =
      await pessoaRepository.listarPessoasPorUsuario(
        usuarioId
      );

    const ids = new Set(
      minhas.map((p: any) => p.id)
    );

    return agendamentos.filter(
      (a: any) => ids.has(a.pessoa_id)
    );

  }
}