import nodemailer, { Transporter } from "nodemailer";

/*
==================================================
EMAIL SERVICE
==================================================

Responsabilidades:

- Configurar o transporte SMTP (Gmail)
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

- nodemailer
- EMAIL_USER / EMAIL_APP_PASSWORD (variáveis de ambiente)
- EMAIL_SERVICE (opcional — ver abaixo)
*/

/*
Usa uma conta de e-mail comum + "senha de app" (não é a senha
normal da conta — precisa ter a verificação em duas etapas
ativada e gerar uma senha de app específica no provedor:
https://myaccount.google.com/apppasswords para Gmail).

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

const REMETENTE =
  process.env.EMAIL_FROM ||
  `Notifica Vacinas <${process.env.EMAIL_USER}>`;

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
  CADASTRO CONCLUÍDO (fim do onboarding)
  ==================================================

  Disparado quando a pessoa termina (ou pula) o
  onboarding pós-cadastro, em /completar-cadastro —
  diferente do e-mail de boas-vindas, que já foi
  enviado antes, junto com o código de verificação.
  */
  static async enviarCadastroConcluido(
    destinatario: string,
    nome: string
  ) {

    return this.enviar(
      destinatario,
      "Tudo pronto! Seja bem-vindo(a) ao Notifica Vacinas",
      modeloBase(`
        <h2>Oba, ${nome}! Seu cadastro está completo 🎉</h2>
        <p>Muito obrigado por confiar no <strong>Notifica Vacinas</strong> para
        cuidar da sua carteira de vacinação (e da da sua família, se for o caso).</p>
        <p>A partir de agora você pode:</p>
        <ul>
          <li>Acompanhar, no painel inicial, quais vacinas estão em dia e quais estão pendentes;</li>
          <li>Registrar novas doses manualmente ou enviando uma foto da carteirinha física, com leitura automática por inteligência artificial;</li>
          <li>Cadastrar dependentes (filhos, pais, etc.) e gerenciar a carteira de cada um;</li>
          <li>Receber, por e-mail, alertas de vacinas em atraso e lembretes de agendamentos próximos.</li>
        </ul>
        <p>Qualquer vacina pendente que aparecer no seu painel, procure a unidade de
        saúde mais próxima para regularizar — estamos aqui só para ajudar você a não perder o prazo.</p>
        <p style="margin-top: 20px;">Seja bem-vindo(a)! 💙</p>
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
  REDEFINIÇÃO DE SENHA
  ==================================================
  */
  static async enviarRedefinicaoSenha(
    destinatario: string,
    nome: string,
    link: string
  ) {

    return this.enviar(
      destinatario,
      "Redefinição de senha — Notifica Vacinas",
      modeloBase(`
        <h2>Olá, ${nome}!</h2>
        <p>Recebemos um pedido para redefinir a senha da sua conta.</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="${link}" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 12px;">
            Criar nova senha
          </a>
        </div>
        <p style="color: #64748b; font-size: 13px;">O link vale por 30 minutos e só pode ser usado uma vez. Se você não pediu a troca, ignore este e-mail: sua senha continua a mesma.</p>
      `)
    );

  }

  /*
  ==================================================
  AVISO DE SENHA ALTERADA
  ==================================================
  */
  static async enviarSenhaAlterada(
    destinatario: string,
    nome: string
  ) {

    return this.enviar(
      destinatario,
      "Sua senha foi alterada — Notifica Vacinas",
      modeloBase(`
        <h2>Olá, ${nome}!</h2>
        <p>A senha da sua conta acabou de ser alterada e todos os dispositivos conectados foram desconectados.</p>
        <p style="color: #64748b; font-size: 13px;">Se não foi você, redefina a senha novamente agora mesmo pela opção "Esqueci minha senha" e entre em contato com o administrador.</p>
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
  AVISO: DOSE(S) CHEGANDO NA DATA
  ==================================================

  Enviado uma vez por dose, quando falta pouco para a data
  prevista (ver NotificacaoService). Não é aviso diário.
  */
  static async enviarAvisoDosesProximas(
    destinatario: string,
    nomePessoa: string,
    doses: Array<{
      vacina: string;
      rotulo: string;
      dataPrevista: string;
      diasParaVencer: number;
      campanha: {
        nome: string;
        dataInicio: string | null;
        dataFim: string | null;
      } | null;
    }>
  ) {

    const formatar = (iso: string | null) =>
      iso ? iso.split("-").reverse().join("/") : "";

    const listaHtml = doses
      .map((d) => {

        const quando =
          d.diasParaVencer === 0
            ? "hoje"
            : d.diasParaVencer === 1
              ? "amanhã"
              : `em ${d.diasParaVencer} dias`;

        const campanha = d.campanha
          ? `<br><span style="color: #64748b; font-size: 13px;">Campanha &quot;${d.campanha.nome}&quot;${
              d.campanha.dataInicio
                ? `: de ${formatar(d.campanha.dataInicio)}${
                    d.campanha.dataFim
                      ? ` a ${formatar(d.campanha.dataFim)}`
                      : ""
                  }`
                : ""
            }</span>`
          : "";

        return `<li><strong>${d.vacina}</strong> — ${d.rotulo}: ${formatar(d.dataPrevista)} (${quando})${campanha}</li>`;

      })
      .join("");

    return this.enviar(
      destinatario,
      `Vacina chegando: ${nomePessoa}`,
      modeloBase(`
        <h2>Está chegando a hora de vacinar</h2>
        <p>Segundo o calendário nacional, <strong>${nomePessoa}</strong>
        deve tomar em breve:</p>
        <ul>${listaHtml}</ul>
        <p>Procure uma unidade de saúde na data indicada ou nos dias
        seguintes. Depois de tomar, registre a dose no Notifica Vacinas.</p>
      `)
    );

  }

  /*
  ==================================================
  RESUMO PERIÓDICO DE DOSES
  ==================================================

  Enviado no ritmo escolhido pela pessoa (diário, semanal ou
  mensal) enquanto houver dose atrasada, disponível ou chegando.
  */
  static async enviarResumoDoses(
    destinatario: string,
    nomePessoa: string,
    frequenciaDescrita: string,
    doses: Array<{
      vacina: string;
      rotulo: string;
      status: string;
      dataPrevista: string | null;
      diasParaVencer: number | null;
      campanha: {
        nome: string;
        dataInicio: string | null;
        dataFim: string | null;
      } | null;
    }>
  ) {

    const formatar = (iso: string | null) =>
      iso ? iso.split("-").reverse().join("/") : "";

    const linha = (d: (typeof doses)[number]) => {

      const prazo =
        d.status === "DISPONIVEL"
          ? "pode tomar agora"
          : d.status === "ATRASADA"
            ? `prevista para ${formatar(d.dataPrevista)} (atrasada há ${Math.abs(d.diasParaVencer ?? 0)} dia(s))`
            : d.diasParaVencer === 0
              ? `hoje (${formatar(d.dataPrevista)})`
              : `${formatar(d.dataPrevista)} (em ${d.diasParaVencer} dias)`;

      const campanha = d.campanha
        ? `<br><span style="color: #64748b; font-size: 13px;">Campanha &quot;${d.campanha.nome}&quot;${
            d.campanha.dataInicio
              ? `: de ${formatar(d.campanha.dataInicio)}${
                  d.campanha.dataFim ? ` a ${formatar(d.campanha.dataFim)}` : ""
                }`
              : ""
          }</span>`
        : "";

      return `<li><strong>${d.vacina}</strong> — ${d.rotulo}: ${prazo}${campanha}</li>`;

    };

    const secao = (titulo: string, lista: typeof doses) =>
      lista.length > 0
        ? `<h3>${titulo}</h3><ul>${lista.map(linha).join("")}</ul>`
        : "";

    const atrasadas = doses.filter((d) => d.status === "ATRASADA");
    const disponiveis = doses.filter((d) => d.status === "DISPONIVEL");
    const proximas = doses.filter((d) => d.status === "PROXIMA");

    return this.enviar(
      destinatario,
      `Resumo de vacinas: ${nomePessoa}`,
      modeloBase(`
        <h2>Resumo de vacinas de ${nomePessoa}</h2>
        ${secao("Em atraso", atrasadas)}
        ${secao("Pode tomar agora", disponiveis)}
        ${secao("Chegando nos próximos 30 dias", proximas)}
        <p style="color: #64748b; font-size: 13px;">Você recebe este resumo ${frequenciaDescrita}.
        Para mudar ou desativar, abra Meu Perfil &gt; Notificações no Notifica Vacinas.</p>
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
