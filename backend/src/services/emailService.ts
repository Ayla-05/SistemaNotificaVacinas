import nodemailer, { Transporter } from "nodemailer";

/*
==================================================
EMAIL SERVICE
==================================================

Responsabilidades:

- Configurar o transporte SMTP (Gmail)
- Montar e enviar os e-mails do sistema
  (boas-vindas, confirmação de dose,
  vacina pendente, lembrete de agendamento)

NÃO é responsável por:

- Decidir QUEM deve receber e-mail
  (isso é o NotificacaoService, que
  respeita a preferência "receber_email"
  de cada pessoa)
- SQL
- Requisições HTTP

Dependências:

- nodemailer
- EMAIL_USER / EMAIL_APP_PASSWORD (variáveis de ambiente)
*/

/*
Usa uma conta Gmail comum + "senha de app" (não é a senha
normal da conta — precisa ter a verificação em duas etapas
ativada e gerar uma em myaccount.google.com/apppasswords).
Gratuito, mas com limite de envio diário do Gmail (~500/dia),
o que é mais que suficiente para o volume desse sistema.
*/
let transportador: Transporter | null = null;

function obterTransportador() {

  if (transportador) {
    return transportador;
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    return null;
  }

  transportador = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  return transportador;

}

const REMETENTE =
  process.env.EMAIL_FROM ||
  `ImuniTrack <${process.env.EMAIL_USER}>`;

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

    const smtp = obterTransportador();

    if (!smtp) {

      console.warn(
        "[EmailService] EMAIL_USER/EMAIL_APP_PASSWORD não configurados — e-mail não enviado."
      );

      return {
        enviado: false,
        motivo: "E-mail não configurado no servidor."
      };

    }

    if (!destinatario) {

      return {
        enviado: false,
        motivo: "Destinatário sem e-mail cadastrado."
      };

    }

    try {

      await smtp.sendMail({
        from: REMETENTE,
        to: destinatario,
        subject: assunto,
        html: corpoHtml
      });

      return { enviado: true };

    } catch (erro: any) {

      console.error(
        "[EmailService] Falha ao enviar e-mail:",
        erro.message
      );

      return {
        enviado: false,
        motivo: erro.message
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
    nome: string
  ) {

    return this.enviar(
      destinatario,
      "Bem-vindo(a) ao ImuniTrack!",
      modeloBase(`
        <h2>Olá, ${nome}!</h2>
        <p>Sua conta no ImuniTrack foi criada com sucesso.</p>
        <p>Agora você pode acompanhar sua carteira de vacinação,
        ver quais doses estão em dia ou pendentes, e escanear
        carteirinhas físicas para atualizar seu histórico automaticamente.</p>
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
        <span style="color: white; font-size: 18px; font-weight: bold;">ImuniTrack</span>
      </div>
      <div style="border: 1px solid #e2e8f0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; color: #1e293b;">
        ${conteudo}
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
        Este é um e-mail automático do ImuniTrack. Não é necessário responder.
      </p>
    </div>
  `;

}
