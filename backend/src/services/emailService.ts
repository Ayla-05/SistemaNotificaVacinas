import nodemailer, { Transporter } from "nodemailer";
import { Resend } from "resend";

/*
==================================================
EMAIL SERVICE
==================================================

Responsabilidades:

- Configurar o transporte de e-mail (Resend, com
  SMTP via Gmail/Yahoo/etc como alternativa)
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

- resend (preferencial — ver RESEND_API_KEY)
- nodemailer (alternativa via SMTP)
- EMAIL_USER / EMAIL_APP_PASSWORD / EMAIL_SERVICE (se não usar Resend)
*/

/*
==================================================
RESEND (opção preferencial)
==================================================

Serviço de envio transacional com API key — sem senha
de app, sem verificação em duas etapas, sem SMTP. Plano
gratuito cobre bem o volume deste sistema.

Se RESEND_API_KEY estiver definida, ela tem prioridade
sobre a configuração SMTP (Gmail/Yahoo) abaixo.
*/
let resend: Resend | null = null;

function obterResend(): Resend | null {

  if (resend) {
    return resend;
  }

  if (!process.env.RESEND_API_KEY) {
    return null;
  }

  resend = new Resend(process.env.RESEND_API_KEY);

  return resend;

}

/*
==================================================
SMTP (alternativa — Gmail, Yahoo, etc)
==================================================

Usa uma conta de e-mail comum + "senha de app" (não é a senha
normal da conta — precisa ter a verificação em duas etapas
ativada e gerar uma senha de app específica no provedor).

Por padrão assume Gmail, mas aceita qualquer serviço que o
Nodemailer reconheça nativamente (ex.: "yahoo", "outlook365",
"hotmail") via a variável EMAIL_SERVICE no .env.
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
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });

  return transportador;

}

/*
Remetente: com Resend, sem domínio próprio verificado,
só é aceito o endereço de testes "onboarding@resend.dev"
(ou um domínio que você tenha verificado no painel deles).
Com SMTP, usa o próprio EMAIL_USER.
*/
const REMETENTE =
  process.env.EMAIL_FROM ||
  (process.env.RESEND_API_KEY
    ? "Notifica Vacinas <onboarding@resend.dev>"
    : `Notifica Vacinas <${process.env.EMAIL_USER}>`);

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

    const api = obterResend();

    if (api) {

      try {

        const resposta = await api.emails.send({
          from: REMETENTE,
          to: destinatario,
          subject: assunto,
          html: corpoHtml
        });

        if (resposta.error) {

          console.error(
            "[EmailService] Falha ao enviar e-mail (Resend):",
            resposta.error.message
          );

          return {
            enviado: false,
            motivo: resposta.error.message
          };

        }

        return { enviado: true };

      } catch (erro: any) {

        console.error(
          "[EmailService] Falha ao enviar e-mail (Resend):",
          erro.message
        );

        return {
          enviado: false,
          motivo: erro.message
        };

      }

    }

    const smtp = obterTransportador();

    if (!smtp) {

      console.warn(
        "[EmailService] Nenhum provedor de e-mail configurado (RESEND_API_KEY ou EMAIL_USER/EMAIL_APP_PASSWORD) — e-mail não enviado."
      );

      return {
        enviado: false,
        motivo: "E-mail não configurado no servidor."
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
        "[EmailService] Falha ao enviar e-mail (SMTP):",
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
