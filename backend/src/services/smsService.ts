/*
==================================================
SMS SERVICE (STUB)
==================================================

Estrutura pronta para envio de SMS, mas SEM envio real
ainda: não existe provedor gratuito de verdade para SMS
(diferente de e-mail). Twilio, Zenvia, AWS SNS etc. cobram
por mensagem.

Quando um provedor for contratado, basta implementar o
corpo de `enviar()` aqui (chamando a API do provedor) —
o resto do sistema (NotificacaoService) já está preparado
para chamar este método e não precisa mudar.

NÃO é responsável por:

- Decidir QUEM deve receber SMS (NotificacaoService)
- Envio de e-mail (EmailService)
*/
export class SmsService {

  static async enviar(
    numero: string,
    mensagem: string
  ): Promise<{ enviado: boolean; motivo?: string }> {

    console.warn(
      `[SmsService] Envio de SMS ainda não configurado. ` +
      `Mensagem NÃO enviada para ${numero}: "${mensagem}"`
    );

    return {
      enviado: false,
      motivo:
        "Envio de SMS ainda não configurado (nenhum provedor contratado)."
    };

  }

}
