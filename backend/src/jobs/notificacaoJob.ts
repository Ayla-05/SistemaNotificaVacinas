import cron from "node-cron";

import { NotificacaoService } from "../services/notificacaoService";

/*
==================================================
NOTIFICAÇÃO JOB (AGENDADOR)
==================================================

Responsabilidades:

- Rodar, uma vez por dia, a verificação de vacinas
  pendentes e agendamentos próximos, disparando os
  e-mails cabíveis (NotificacaoService)

NÃO é responsável por:

- Decidir quem recebe e-mail (NotificacaoService)
- Enviar o e-mail em si (EmailService)

Dependências:

- node-cron
- NotificacaoService
*/

// Todo dia às 8h (horário do servidor). Ajustável via
// NOTIFICACAO_CRON no .env, se precisar de outro horário
// (ex.: a cada 5 minutos, para testar, use os cinco
// campos do cron com um passo de 5 no campo de minutos).
const EXPRESSAO_CRON =
  process.env.NOTIFICACAO_CRON || "0 8 * * *";

export function iniciarJobDeNotificacoes() {

  cron.schedule(EXPRESSAO_CRON, async () => {

    console.log(
      "[NotificacaoJob] Iniciando verificação diária de pendências/agendamentos..."
    );

    try {

      await NotificacaoService.executarVerificacaoDiaria();

    } catch (erro: any) {

      console.error(
        "[NotificacaoJob] Falha na verificação diária:",
        erro.message
      );

    }

  });

  console.log(
    `[NotificacaoJob] Agendado com a expressão cron "${EXPRESSAO_CRON}".`
  );

}
