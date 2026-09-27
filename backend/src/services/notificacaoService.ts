import { EmailService } from "./emailService";
import { SmsService } from "./smsService";
import { VacinalService } from "./vacinalService";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as usuarioRepository from "../repositories/usuarioRepository";
import * as agendamentoVacinaRepository from "../repositories/agendamentoVacinaRepository";

/*
==================================================
NOTIFICAÇÃO SERVICE
==================================================

Responsabilidades:

- Decidir QUEM recebe notificação (respeita a
  preferência "receber_email" de cada pessoa)
- Resolver o e-mail/telefone de destino
- Orquestrar EmailService e SmsService para os
  4 gatilhos do sistema:
    1. Boas-vindas (novo cadastro)
    2. Confirmação de dose registrada
    3. Alerta de vacina(s) pendente(s)
    4. Lembrete de agendamento próximo

NÃO é responsável por:

- Como o e-mail é enviado (EmailService)
- Como o SMS é enviado (SmsService, ainda sem provedor)
- Calcular pendências (VacinalService)

Dependências:

- EmailService, SmsService, VacinalService
- pessoaRepository, usuarioRepository, agendamentoVacinaRepository
*/

/* Dias de antecedência para lembrar de um agendamento futuro. */
const DIAS_ANTECEDENCIA_LEMBRETE = 3;

export class NotificacaoService {

  /*
  ==================================================
  RESOLVER DESTINATÁRIO DA PESSOA
  ==================================================

  Usa o e-mail cadastrado na própria pessoa; se não
  houver, cai para o e-mail da conta (usuário) dona dela.
  */
  private static async resolverEmailDestino(
    pessoa: any
  ): Promise<string | null> {

    if (pessoa.email) {
      return pessoa.email;
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        pessoa.usuario_id
      );

    return usuario?.email ?? null;

  }

  /*
  ==================================================
  1. BOAS-VINDAS
  ==================================================

  Disparado em POST /auth/registrar.
  */
  static async notificarBoasVindas(
    email: string,
    nome: string
  ) {

    return EmailService.enviarBoasVindas(
      email,
      nome
    );

  }

  /*
  ==================================================
  2. CONFIRMAÇÃO DE DOSE REGISTRADA
  ==================================================

  Disparado ao registrar uma vacina/dose na carteira
  (manualmente ou via confirmação do Scan).
  */
  static async notificarRegistroDose(
    pessoaId: number,
    nomeVacina: string,
    dose: string
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa || !pessoa.receber_email) {
      return;
    }

    const destinatario =
      await this.resolverEmailDestino(pessoa);

    if (destinatario) {

      await EmailService.enviarConfirmacaoDose(
        destinatario,
        pessoa.nome,
        nomeVacina,
        dose
      );

    }

    if (pessoa.telefone) {

      await SmsService.enviar(
        pessoa.telefone,
        `ImuniTrack: ${nomeVacina} (${dose}) registrada na carteira de ${pessoa.nome}.`
      );

    }

  }

  /*
  ==================================================
  3. e 4. VERIFICAÇÃO DIÁRIA
  (pendências em atraso + agendamentos próximos)
  ==================================================

  Chamado uma vez por dia pelo agendador (ver
  backend/src/jobs/notificacaoJob.ts). Percorre todas
  as pessoas cadastradas e dispara os alertas cabíveis.
  */
  static async executarVerificacaoDiaria() {

    const pessoas =
      await pessoaRepository.listarPessoas() as any[];

    for (const pessoa of pessoas) {

      if (!pessoa.receber_email) {
        continue;
      }

      const destinatario =
        await this.resolverEmailDestino(pessoa);

      if (!destinatario) {
        continue;
      }

      await this.verificarPendenciasDaPessoa(
        pessoa,
        destinatario
      );

      await this.verificarAgendamentosDaPessoa(
        pessoa,
        destinatario
      );

    }

  }

  /* 3. Vacina(s) pendente(s) segundo o calendário nacional. */
  private static async verificarPendenciasDaPessoa(
    pessoa: any,
    destinatario: string
  ) {

    try {

      const resumo =
        await VacinalService.obterResumoPessoa(
          pessoa.id
        );

      if (resumo.pendentes.length === 0) {
        return;
      }

      await EmailService.enviarAlertaPendencias(
        destinatario,
        pessoa.nome,
        resumo.pendentes
      );

    } catch (erro: any) {

      console.error(
        `[NotificacaoService] Falha ao verificar pendências da pessoa ${pessoa.id}:`,
        erro.message
      );

    }

  }

  /* 4. Agendamentos com data prevista nos próximos dias. */
  private static async verificarAgendamentosDaPessoa(
    pessoa: any,
    destinatario: string
  ) {

    const agendamentos =
      await agendamentoVacinaRepository
        .listarAgendamentosPessoa(pessoa.id) as any[];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const limite = new Date(hoje);
    limite.setDate(
      limite.getDate() + DIAS_ANTECEDENCIA_LEMBRETE
    );

    const proximos = agendamentos.filter((a) => {

      if (a.status !== "PENDENTE") {
        return false;
      }

      const dataPrevista = new Date(
        a.data_prevista + "T00:00:00"
      );

      return dataPrevista >= hoje && dataPrevista <= limite;

    });

    for (const agendamento of proximos) {

      await EmailService.enviarLembreteAgendamento(
        destinatario,
        pessoa.nome,
        agendamento.vacina,
        agendamento.data_prevista
      );

    }

  }

}
