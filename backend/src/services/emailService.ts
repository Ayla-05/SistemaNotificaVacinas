import axios from "axios";

/*
==================================================
EMAIL SERVICE
==================================================

Responsabilidades:

- Configurar o transporte de e-mail (Mailgun)
- Montar e enviar os e-mails do sistema
  (boas-vindas com código de confirmação,
  confirmação de dose, vacina pendente,
  lembrete de agendamento)

NÃO é responsável por:

- Decidir QUEM deve receber e-mail
  (isso é o NotificacaoService, que
  respeita a preferência "receber_email"
  de cada pessoa)
- SQL
- Requisições HTTP

Dependências:

- axios
- MAILGUN_API_KEY / MAILGUN_DOMAIN (variáveis de ambiente)
*/

/*
==================================================
MAILGUN
==================================================

Serviço de envio transacional com API key — sem senha
de app, sem verificação em duas etapas, sem SMTP. No
plano sandbox (gratuito, sem domínio verificado), só
entrega para destinatários autorizados manualmente no
painel do Mailgun (Sending -> Authorized Recipients).
*/
function obterConfigMailgun() {

  if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
    return null;
  }

  return {
    apiKey: process.env.MAILGUN_API_KEY,
    dominio: process.env.MAILGUN_DOMAIN,
    baseUrl: process.env.MAILGUN_BASE_URL || "https://api.mailgun.net"
  };

}

/*
Remetente padrão (sobrescrito por EMAIL_FROM se definida).
No plano sandbox do Mailgun, precisa ser
postmaster@<domínio-sandbox>.
*/
const configMailgun = obterConfigMailgun();

const REMETENTE =
  process.env.EMAIL_FROM ||
  (configMailgun
    ? `Notifica Vacinas <postmaster@${configMailgun.dominio}>`
    : "Notifica Vacinas <postmaster@exemplo.com>");

export class EmailService {

  /*
  ==================================================
  ENVIAR E-MAIL (BASE)
  ==================================================

  Nunca lança erro para quem chamou: falha de e-mail
  não pode derrubar um cadastro, um registro de dose,
  etc. Só registra no log e devolve se conseguiu ou não.
  */
  static async enviar(
    destinatario: string,
    assunto: string,
    corpoHtml: string
  ): Promise<{ enviado: boolean; motivo?: string }> {

    if (!destinatario) {

      return {
        enviado: false,
        motivo: "Destinatário sem e-mail cadastrado."
      };

    }

    if (!configMailgun) {

      console.warn(
        "[EmailService] MAILGUN_API_KEY/MAILGUN_DOMAIN não configurados — e-mail não enviado."
      );

      return {
        enviado: false,
        motivo: "E-mail não configurado no servidor."
      };

    }

    try {

      const corpo = new URLSearchParams();
      corpo.append("from", REMETENTE);
      corpo.append("to", destinatario);
      corpo.append("subject", assunto);
      corpo.append("html", corpoHtml);

      await axios.post(
        `${configMailgun.baseUrl}/v3/${configMailgun.dominio}/messages`,
        corpo,
        { auth: { username: "api", password: configMailgun.apiKey } }
      );

      return { enviado: true };

    } catch (erro: any) {

      const motivo =
        erro.response?.data?.message || erro.message;

      console.error(
        "[EmailService] Falha ao enviar e-mail (Mailgun):",
        motivo
      );

      return {
        enviado: false,
        motivo
      };

    }

  }

  /*
  ==================================================
  BOAS-VINDAS (novo cadastro)
  ==================================================
  */
  static async enviarBoasVindas(
    destinatario: string,
    nome: string,
    codigoVerificacao: string
  ) {

    return this.enviar(
      destinatario,
      "Confirme seu e-mail — Notifica Vacinas",
      modeloBase(`
        <h2>Olá, ${nome}!</h2>
        <p>Sua conta no Notifica Vacinas foi criada com sucesso.</p>
        <p>Antes de começar, confirme seu e-mail digitando o código abaixo
        na tela de verificação:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; background: #f0fdfa; border: 2px solid #059669; color: #065f46; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 12px;">
            ${codigoVerificacao}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">Esse código é válido por 15 minutos.
        Se você não criou essa conta, pode ignorar este e-mail.</p>
        <p>Depois de confirmar, você poderá acompanhar sua carteira de vacinação,
        ver quais doses estão em dia ou pendentes, e escanear carteirinhas
        físicas para atualizar seu histórico automaticamente.</p>
      `)
    );

  }

  /*
  ==================================================
  REENVIO DE CÓDIGO DE VERIFICAÇÃO
  ==================================================
  */
  static async enviarCodigoVerificacao(
    destinatario: string,
    nome: string,
    codigoVerificacao: string
  ) {

    return this.enviar(
      destinatario,
      "Seu novo código de confirmação — Notifica Vacinas",
      modeloBase(`
        <h2>Olá, ${nome}!</h2>
        <p>Aqui está seu novo código de confirmação:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; background: #f0fdfa; border: 2px solid #059669; color: #065f46; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 12px;">
            ${codigoVerificacao}
          </span>
        </div>
        <p style="color: #64748b; font-size: 13px;">Esse código é válido por 15 minutos.</p>
      `)
    );

  }

  /*
  ==================================================
  CONFIRMAÇÃO DE DOSE REGISTRADA
  ==================================================
  */
  static async enviarConfirmacaoDose(
    destinatario: string,
    nomePessoa: string,
    nomeVacina: string,
    dose: string
  ) {

    return this.enviar(
      destinatario,
      `Registro salvo: ${nomeVacina}`,
      modeloBase(`
        <h2>Registro atualizado</h2>
        <p>A vacina <strong>${nomeVacina}</strong> (${dose}) foi
        registrada na carteira de <strong>${nomePessoa}</strong>.</p>
      `)
    );

  }

  /*
  ==================================================
  ALERTA DE VACINA(S) PENDENTE(S)
  ==================================================
  */
  static async enviarAlertaPendencias(
    destinatario: string,
    nomePessoa: string,
    pendencias: { vacina: string; faltam: number }[]
  ) {

    const listaHtml = pendencias
      .map(
        (p) =>
          `<li><strong>${p.vacina}</strong> — faltam ${p.faltam} dose(s)</li>`
      )
      .join("");

    return this.enviar(
      destinatario,
      `Vacinas pendentes: ${nomePessoa}`,
      modeloBase(`
        <h2>Atenção: vacinas pendentes</h2>
        <p>A carteira de <strong>${nomePessoa}</strong> tem vacinas
        em atraso segundo o calendário nacional:</p>
        <ul>${listaHtml}</ul>
        <p>Procure uma unidade de saúde para regularizar.</p>
      `)
    );

  }

  /*
  ==================================================
  LEMBRETE DE AGENDAMENTO PRÓXIMO
  ==================================================
  */
  static async enviarLembreteAgendamento(
    destinatario: string,
    nomePessoa: string,
    nomeVacina: string,
    dataPrevista: string
  ) {

    const dataFormatada =
      new Date(dataPrevista + "T00:00:00")
        .toLocaleDateString("pt-BR");

    return this.enviar(
      destinatario,
      `Lembrete: ${nomeVacina} em breve`,
      modeloBase(`
        <h2>Lembrete de vacinação</h2>
        <p><strong>${nomePessoa}</strong> tem a aplicação de
        <strong>${nomeVacina}</strong> prevista para
        <strong>${dataFormatada}</strong>.</p>
      `)
    );

  }

}

/* Moldura HTML simples, reaproveitada por todos os e-mails. */
function modeloBase(conteudo: string): string {

  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #059669, #0284c7); padding: 20px; border-radius: 12px 12px 0 0;">
        <span style="color: white; font-size: 18px; font-weight: bold;">Notifica Vacinas</span>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; color: #1e293b;">
        ${conteudo}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
        Este é um e-mail automático do Notifica Vacinas. Não é necessário responder.
      </p>
    </div>
  `;

}
