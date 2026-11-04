/*
==================================================
VALIDAÇÃO DE ENTRADA (FUNÇÕES PURAS)
==================================================

Responsabilidades:

- Validar datas, textos, e-mails e números de dose
  vindos do usuário ANTES de chegarem ao banco
- Lançar Error com mensagem em português (os
  controllers traduzem em HTTP 400)

NÃO é responsável por:

- Regras de negócio que consultam o banco
  (unicidade de e-mail, posse, etc.)
*/

export const ANO_MINIMO_NASCIMENTO = 1900;
export const MAX_NUMERO_DOSE = 20;

/* Data local de hoje (AAAA-MM-DD), sem o deslocamento de fuso do toISOString(). */
export function hojeLocalISO(agora: Date = new Date()): string {

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;

}

/* "AAAA-MM-DD" existente no calendário (rejeita 2020-02-31, 2020-13-01...). */
export function dataIsoExiste(texto: unknown): texto is string {

  if (typeof texto !== "string") return false;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto.trim());

  if (!m) return false;

  const [ano, mes, dia] = [Number(m[1]), Number(m[2]), Number(m[3])];

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia
  );

}

export function validarTexto(
  valor: unknown,
  rotulo: string,
  opcoes: { obrigatorio?: boolean; max: number }
): string | undefined {

  if (valor === undefined || valor === null || valor === "") {

    if (opcoes.obrigatorio) {
      throw new Error(`${rotulo} é obrigatório.`);
    }

    return undefined;

  }

  if (typeof valor !== "string") {
    throw new Error(`${rotulo} inválido.`);
  }

  const texto = valor.trim();

  if (opcoes.obrigatorio && !texto) {
    throw new Error(`${rotulo} é obrigatório.`);
  }

  if (texto.length > opcoes.max) {
    throw new Error(
      `${rotulo} muito longo (máximo de ${opcoes.max} caracteres).`
    );
  }

  return texto;

}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function emailValido(email: string): boolean {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  );
}

export function validarDataNascimento(
  texto: unknown,
  hoje: string = hojeLocalISO()
): string {

  if (!dataIsoExiste(texto)) {
    throw new Error(
      "Data de nascimento inválida. Use o formato AAAA-MM-DD."
    );
  }

  const data = texto.trim();

  if (data > hoje) {
    throw new Error(
      "A data de nascimento não pode estar no futuro."
    );
  }

  if (Number(data.slice(0, 4)) < ANO_MINIMO_NASCIMENTO) {
    throw new Error(
      "Data de nascimento inválida."
    );
  }

  return data;

}

/* Data em que a dose foi APLICADA: existente, não futura e não anterior ao nascimento. */
export function validarDataAplicacao(
  texto: unknown,
  nascimento?: string | null,
  hoje: string = hojeLocalISO()
): string {

  if (!dataIsoExiste(texto)) {
    throw new Error(
      "Data de aplicação inválida. Use o formato AAAA-MM-DD."
    );
  }

  const data = texto.trim();

  if (data > hoje) {
    throw new Error(
      "A data de aplicação não pode estar no futuro."
    );
  }

  if (nascimento && data < nascimento.slice(0, 10)) {
    throw new Error(
      "A data de aplicação não pode ser anterior ao nascimento da pessoa."
    );
  }

  return data;

}

export function validarNumeroDose(valor: unknown): number {

  const numero = Number(valor);

  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > MAX_NUMERO_DOSE
  ) {
    throw new Error(
      `Número da dose inválido (use de 1 a ${MAX_NUMERO_DOSE}).`
    );
  }

  return numero;

}

/*
Campos cadastrais de pessoa. Em "criacao" nome e nascimento são obrigatórios;
na atualização só valida o que veio no corpo.
*/
export function validarDadosPessoa(
  dados: Record<string, any>,
  criacao: boolean
) {

  if (criacao || dados.nome !== undefined) {
    validarTexto(dados.nome, "Nome", { obrigatorio: true, max: 120 });
  }

  if (criacao || dados.data_nascimento !== undefined) {
    validarDataNascimento(dados.data_nascimento);
  }

  const email = validarTexto(dados.email, "E-mail", { max: 254 });

  if (email && !emailValido(email)) {
    throw new Error("E-mail inválido.");
  }

  validarTexto(dados.telefone, "Telefone", { max: 30 });
  validarTexto(dados.cep, "CEP", { max: 12 });
  validarTexto(dados.logradouro, "Logradouro", { max: 150 });
  validarTexto(dados.numero, "Número", { max: 20 });
  validarTexto(dados.complemento, "Complemento", { max: 100 });
  validarTexto(dados.bairro, "Bairro", { max: 100 });
  validarTexto(dados.cidade, "Cidade", { max: 100 });

  const estado = validarTexto(dados.estado, "Estado", { max: 2 });

  if (estado && !/^[A-Za-z]{2}$/.test(estado)) {
    throw new Error("Estado inválido (use a sigla com 2 letras).");
  }

}
