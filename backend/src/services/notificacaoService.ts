import { EmailService } from "./emailService";
import { SmsService } from "./smsService";

import * as pessoaRepository from "../repositories/pessoaRepository";
import * as usuarioRepository from "../repositories/usuarioRepository";
import { ProximasDosesService } from "./proximasDosesService";
import {
  deveEnviarResumo,
  ehResumoPeriodico,
  FREQUENCIA_PADRAO,
  frequenciaValida,
  FrequenciaAviso
} from "../utils/frequenciaAviso";
import * as avisoDoseRepository from "../repositories/avisoDoseRepository";
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
    3. Aviso de dose(s) chegando na data prevista
    4. Lembrete de agendamento próximo

NÃO é responsável por:

- Como o e-mail é enviado (EmailService)
- Como o SMS é enviado (SmsService, ainda sem provedor)
- Calcular as próximas doses (ProximasDosesService)

Dependências:

- EmailService, SmsService, ProximasDosesService
- pessoaRepository, usuarioRepository, agendamentoVacinaRepository
*/

/* Dias de antecedência para lembrar de um agendamento futuro. */
const DIAS_ANTECEDENCIA_LEMBRETE = 3;

/*
Quantos dias antes da data prevista de uma dose o sistema avisa
(uma única vez por dose). Ajustável por AVISO_DOSE_DIAS no .env.
*/
const DIAS_ANTECEDENCIA_AVISO_DOSE =
  Number(process.env.AVISO_DOSE_DIAS) || 7;

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
    nome: string,
    codigoVerificacao: string
  ) {

    return EmailService.enviarBoasVindas(
      email,
      nome,
      codigoVerificacao
    );

  }

  /*
  ==================================================
  1c. CADASTRO CONCLUÍDO (fim do onboarding)
  ==================================================

  Disparado em POST /auth/concluir-cadastro, quando a
  pessoa termina (ou pula) a tela de onboarding.
  */
  static async notificarCadastroConcluido(
    email: string,
    nome: string
  ) {

    return EmailService.enviarCadastroConcluido(
      email,
      nome
    );

  }

  /*
  ==================================================
  1d. REDEFINIÇÃO DE SENHA
  ==================================================

  Disparado em POST /auth/esqueci-senha (e-mail com o link)
  e ao concluir a troca (aviso de segurança).
  */
  static async notificarRedefinicaoSenha(
    email: string,
    nome: string,
    link: string
  ) {

    return EmailService.enviarRedefinicaoSenha(
      email,
      nome,
      link
    );

  }

  static async notificarSenhaAlterada(
    email: string,
    nome: string
  ) {

    return EmailService.enviarSenhaAlterada(
      email,
      nome
    );

  }

  /*
  ==================================================
  1b. REENVIO DE CÓDIGO DE VERIFICAÇÃO
  ==================================================
  */
  static async notificarCodigoVerificacao(
    email: string,
    nome: string,
    codigoVerificacao: string
  ) {

    return EmailService.enviarCodigoVerificacao(
      email,
      nome,
      codigoVerificacao
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
        `Notifica Vacinas: ${nomeVacina} (${dose}) registrada na carteira de ${pessoa.nome}.`
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

      await this.verificarDosesProximasDaPessoa(
        pessoa,
        destinatario
      );

      await this.verificarAgendamentosDaPessoa(
        pessoa,
        destinatario
      );

    }

  }

  /*
  3. Dose(s) chegando na data prevista pelo calendário nacional.

  Avisa UMA vez por dose, quando faltam até DIAS_ANTECEDENCIA_AVISO_DOSE
  dias (ou no dia). A verificação roda todo dia, mas o e-mail só sai
  quando uma dose entra nessa janela; a tabela avisos_dose impede repetir.
  Dose atrasada ou "pode tomar agora" aparece no painel e no calendário,
  sem e-mail diário.
  */
  private static async verificarDosesProximasDaPessoa(
    pessoa: any,
    destinatario: string
  ) {

    const frequencia: FrequenciaAviso =
      frequenciaValida(pessoa.frequencia_aviso)
        ? pessoa.frequencia_aviso
        : FREQUENCIA_PADRAO;

    if (frequencia === "DESATIVADO") {
      return;
    }

    if (ehResumoPeriodico(frequencia)) {

      await this.enviarResumoPeriodico(
        pessoa,
        destinatario,
        frequencia
      );

      return;

    }

    try {

      const proximas =
        await ProximasDosesService.calcular(
          pessoa.id
        );

      const naJanela = proximas.filter(
        (d) =>
          d.dataPrevista !== null &&
          d.diasParaVencer !== null &&
          d.diasParaVencer >= 0 &&
          d.diasParaVencer <= DIAS_ANTECEDENCIA_AVISO_DOSE
      );

      const novas = [];

      for (const dose of naJanela) {

        const primeiraVez =
          await avisoDoseRepository.registrarAviso(
            pessoa.id,
            dose.vacinaCodigo,
            dose.numeroDose,
            dose.dataPrevista as string
          );

        if (primeiraVez) {
          novas.push(dose);
        }

      }

      if (novas.length === 0) {
        return;
      }

      const resultado =
        await EmailService.enviarAvisoDosesProximas(
          destinatario,
          pessoa.nome,
          novas.map((d) => ({
            vacina: d.vacina,
            rotulo: d.rotulo,
            dataPrevista: d.dataPrevista as string,
            diasParaVencer: d.diasParaVencer as number,
            campanha: d.campanha
          }))
        );

      /* Não enviou: desfaz o registro, para tentar de novo amanhã. */
      if (!resultado.enviado) {

        for (const dose of novas) {
          await avisoDoseRepository.removerAviso(
            pessoa.id,
            dose.vacinaCodigo,
            dose.numeroDose,
            dose.dataPrevista as string
          );
        }

      }

    } catch (erro: any) {

      console.error(
        `[NotificacaoService] Falha ao verificar doses próximas da pessoa ${pessoa.id}:`,
        erro.message
      );

    }

  }

  /*
  Resumo periódico (diário, semanal ou mensal): reúne as doses
  atrasadas, disponíveis e as que chegam em até 30 dias e envia no
  ritmo escolhido, enquanto houver alguma. Só marca o envio na pessoa
  se o e-mail saiu, para tentar de novo na verificação seguinte.
  */
  private static async enviarResumoPeriodico(
    pessoa: any,
    destinatario: string,
    frequencia: FrequenciaAviso
  ) {

    try {

      const hoje = new Date();

      const dataHoje =
        `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;

      if (
        !deveEnviarResumo(
          frequencia,
          pessoa.ultimo_resumo_em ?? null,
          dataHoje
        )
      ) {
        return;
      }

      const proximas =
        await ProximasDosesService.calcular(
          pessoa.id,
          hoje
        );

      const doses = proximas.filter(
        (d) =>
          d.status === "ATRASADA" ||
          d.status === "DISPONIVEL" ||
          d.status === "PROXIMA"
      );

      if (doses.length === 0) {
        return;
      }

      const descricao: Record<string, string> = {
        DIARIA: "todos os dias",
        SEMANAL: "toda semana",
        MENSAL: "todo mês"
      };

      const resultado =
        await EmailService.enviarResumoDoses(
          destinatario,
          pessoa.nome,
          descricao[frequencia],
          doses.map((d) => ({
            vacina: d.vacina,
            rotulo: d.rotulo,
            status: d.status,
            dataPrevista: d.dataPrevista,
            diasParaVencer: d.diasParaVencer,
            campanha: d.campanha
          }))
        );

      if (resultado.enviado) {
        await pessoaRepository.registrarUltimoResumo(
          pessoa.id,
          dataHoje
        );
      }

    } catch (erro: any) {

      console.error(
        `[NotificacaoService] Falha ao enviar o resumo da pessoa ${pessoa.id}:`,
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
