/*
==================================================
EXTRATOR DE CARTEIRINHA (FUNÇÕES PURAS)
==================================================

Responsabilidades:

- Transformar o texto lido pelo OCR (Docling, em Markdown)
  nos campos de um registro de vacina: vacina, dose, data
  de aplicação, lote, local, nome e nascimento do titular
- Casar o nome escrito na carteirinha com o catálogo de
  vacinas do sistema (inclusive abreviações comuns)

NÃO é responsável por:

- Fazer OCR (ocr-service)
- Chamar o serviço de OCR (OcrService)
- Salvar na carteira (CarteiraService, depois que o
  usuário revisa e confirma)

É determinístico e sem I/O, por isso é testável só com
texto de exemplo.

Limite conhecido: funciona com texto impresso/digital
(PDF do Meu SUS Digital, prints, carteirinhas digitadas).
Letra manuscrita tende a sair com erros no OCR; por isso
o usuário sempre revisa os campos antes de gravar.
*/

export interface DadosExtraidosCarteirinha {
  vacina: string;
  dose: string;
  dataAplicacao: string | null;
  lote: string | null;
  localAplicacao: string | null;
  nomeTitular: string | null;
  dataNascimentoTitular: string | null;
}

/*
Troca cada caractere pela letra base minúscula, SEM alterar
o tamanho do texto: assim, uma posição no texto normalizado
é a mesma posição no texto original.
*/
function normalizar(texto: string): string {

  return Array.from(texto)
    .map((c) => c.normalize("NFD").charAt(0).toLowerCase())
    .join("");

}

/* "Tríplice Viral SCR" -> "triplice viral scr" */
export function slug(texto: string): string {

  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

}

/*
Abreviações e grafias comuns, por nome do catálogo (em slug).
O próprio nome do catálogo sempre vale como apelido.
*/
const APELIDOS: Record<string, string[]> = {
  "bcg": [],
  "hepatite a": ["hep a", "hepa"],
  "hepatite b": ["hep b", "hepb"],
  "pentavalente": ["penta"],
  "dtpa": ["dtap"],
  "dt": [
    "dupla adulto", "dupla tipo adulto",
    "difteria e tetano adulto", "difteria e tetano"
  ],
  "poliomielite vip": [
    "polio vip", "vip", "poliomielite inativada", "polio inativada",
    "poliomielite 1 2 3", "poliomielite 1 2 3 inativada"
  ],
  "poliomielite vop": [
    "polio vop", "vop", "poliomielite oral", "polio oral", "gotinha",
    "poliomielite 1 e 3", "poliomielite atenuada"
  ],
  "rotavirus humano": ["rotavirus", "vrh"],
  "triplice viral scr": [
    "triplice viral", "tri viral", "scr", "sarampo caxumba rubeola"
  ],
  "tetraviral": ["scrv"],
  "varicela": ["catapora"],
  "hpv4": ["hpv", "papilomavirus"],
  "influenza": ["gripe"],
  "covid 19": ["covid", "sars cov 2"],
  "meningococica c": ["meningo c", "menc"],
  "meningococica acwy": ["meningo acwy", "acwy"],
  "pneumococica 10 valente": ["pneumo 10", "pneumococica 10", "pcv10"],
  "pneumococica 20 valente": ["pneumo 20", "pneumococica 20", "pcv20"],
  "pneumococica 23 valente": ["pneumo 23", "pneumococica 23", "ppv23"],
  "dengue dng4": ["dengue"]
};

interface Correspondencia {
  nome: string;
  inicio: number;
  fim: number;
  tamanho: number;
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*
Acha qual vacina do catálogo a linha cita. Vale o apelido mais
longo (assim "Pentavalente (DTP+Hib+HB)" é pentavalente, e não DTP)
e, em empate, o que aparece primeiro.
*/
export function casarVacina(
  linha: string,
  catalogo: string[]
): Correspondencia | null {

  const normalizada = normalizar(linha);

  let melhor: Correspondencia | null = null;

  for (const nome of catalogo) {

    const chave = slug(nome);

    const apelidos = new Set([
      chave,
      ...(APELIDOS[chave] ?? [])
    ]);

    for (const apelido of apelidos) {

      if (!apelido) continue;

      const padrao = new RegExp(
        `(?<![a-z0-9])${apelido
          .split(" ")
          .map(escaparRegex)
          .join("[^a-z0-9]+")}(?![a-z0-9])`
      );

      const achado = padrao.exec(normalizada);

      if (!achado) continue;

      const candidato = {
        nome,
        inicio: achado.index,
        fim: achado.index + achado[0].length,
        tamanho: apelido.length
      };

      if (
        !melhor ||
        candidato.tamanho > melhor.tamanho ||
        (
          candidato.tamanho === melhor.tamanho &&
          candidato.inicio < melhor.inicio
        )
      ) {
        melhor = candidato;
      }

    }

  }

  return melhor;

}

/*
==================================================
DATAS
==================================================
*/
const REGEX_DATA =
  /(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)|(?<!\d)(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4}|\d{2})(?!\d)/g;

function paraIso(
  dia: number,
  mes: number,
  ano: number,
  hoje: Date
): string | null {

  if (ano < 100) {
    const anoAtual = hoje.getFullYear() % 100;
    ano += ano <= anoAtual ? 2000 : 1900;
  }

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null;
  }

  return data.toISOString().slice(0, 10);

}

export function extrairDatas(
  texto: string,
  hoje: Date = new Date()
): string[] {

  const datas: string[] = [];

  for (const m of texto.matchAll(REGEX_DATA)) {

    const iso = m[1]
      ? paraIso(Number(m[3]), Number(m[2]), Number(m[1]), hoje)
      : paraIso(Number(m[4]), Number(m[5]), Number(m[6]), hoje);

    if (iso) datas.push(iso);

  }

  return datas;

}

/*
==================================================
DOSE
==================================================
*/
export function extrairDose(texto: string): string | null {

  /* Datas fora: "10/02/2023" não pode virar a fração "0/2". */
  texto = texto.replace(REGEX_DATA, " ");

  if (/dose\s+[uú]nica|(?<![a-z])d\.?\s?[uú](?![a-z])/i.test(texto)) {
    return "Dose única";
  }

  const reforco = /(?:(\d)\s*[ºo°]?\s*)?refor[cç]o(?:\s*(\d))?/i.exec(texto);

  if (reforco) {
    const numero = reforco[1] ?? reforco[2];
    return numero ? `${numero}º reforço` : "Reforço";
  }

  /* "Revacinação" (carteira do Meu SUS Digital) é reforço. */
  if (/revacina/i.test(texto)) {
    return "Reforço";
  }

  const dose =
    /(\d)\s*[ªaº°o]?\s*dose/i.exec(texto) ??
    /(?<![A-Za-z0-9])d\s?(\d)(?![A-Za-z0-9])/i.exec(texto) ??
    /(?<![\d\/])(\d)\s*\/\s*\d(?![\d\/])/.exec(texto);

  if (dose) {
    return `${dose[1]}ª dose`;
  }

  /* "Dose Inicial" (ex.: febre amarela no Meu SUS Digital) é a 1ª dose. */
  if (/dose\s+inicial/i.test(texto)) {
    return "1ª dose";
  }

  return null;

}

/*
==================================================
LOTE E LOCAL
==================================================
*/
function extrairLote(texto: string): string | null {

  const rotulado =
    /lote\s*(?:n[ºo°.]*)?\s*[:.\-]?\s*([A-Z0-9][A-Z0-9\-\/]{3,})/i.exec(texto);

  if (rotulado) {
    return rotulado[1].toUpperCase();
  }

  /*
  Sem rótulo, aceita um código com letras E números
  (ex.: "AB1234", "21VCD045Z"). Data não conta.
  */
  const semDatas = texto.replace(REGEX_DATA, " ");

  const solto = /(?<![A-Za-z0-9])(?=[A-Z0-9\-]*\d)(?=[A-Z0-9\-]*[A-Z])[A-Z0-9\-]{5,}(?![A-Za-z0-9])/.exec(
    semDatas
  );

  return solto ? solto[0] : null;

}

/* Valor de célula de lote: "Não informado" e "-" significam "sem lote". */
function limparLote(valor: string | undefined): string | null {

  const texto = valor?.trim();

  if (!texto || /^(?:-+|n[aã]o\s+informado|n\/?i)$/i.test(texto)) {
    return null;
  }

  return texto.toUpperCase();

}

const TERMOS_LOCAL =
  /\b(?:ubs|ubsf|upa|ama|ceme|posto|hospital|cl[ií]nica|policl[ií]nica|unidade|centro de sa[uú]de|cs)\b/i;

function extrairLocal(
  linha: string,
  celulas: string[]
): string | null {

  const rotulado =
    /(?:local|unidade|estabelecimento)(?:\s+de\s+\w+)?\s*[:\-]\s*([^|\n]+)/i.exec(linha);

  if (rotulado) {
    return rotulado[1].trim() || null;
  }

  const celula = celulas.find((c) => TERMOS_LOCAL.test(c));

  if (celula) {
    return celula.trim();
  }

  const solto = TERMOS_LOCAL.exec(linha);

  return solto ? linha.slice(solto.index).trim() : null;

}

/*
==================================================
TITULAR
==================================================
*/
function extrairTitular(
  texto: string,
  hoje: Date
) {

  const nome =
    /(?:^|\n|\|)\s*\**\s*(?:nome(?:\s+completo)?|titular|paciente|cidad[aã]o)\s*\**\s*[:\-]\s*\**\s*([^\n|]+?)(?=\s{2,}|\s+(?:data|nascimento|cpf|sus|cns)\b|\s*\||\s*$)/im.exec(texto);

  const nascimento =
    /(?:data\s+de\s+nascimento|nascimento|nasc\.?|dn)\s*\**\s*[:\-]?\s*\**\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4})/i.exec(texto);

  const doRotulo = {
    nomeTitular: nome ? nome[1].replace(/\*+/g, "").trim() : null,
    dataNascimentoTitular: nascimento
      ? extrairDatas(nascimento[1], hoje)[0] ?? null
      : null
  };

  if (doRotulo.nomeTitular || doRotulo.dataNascimentoTitular) {
    return doRotulo;
  }

  /*
  Cabeçalho em tabela (carteira do Meu SUS Digital): uma linha com
  "Nome | Data de nascimento | CPF/CNS" e, logo abaixo, os valores.
  */
  const linhas = texto
    .split(/\r?\n/)
    .filter((l) => l.includes("|") && !/^\s*\|?[\s:\-|]+\|?\s*$/.test(l))
    .map((l) => l.split("|").map((c) => c.trim()).filter(Boolean));

  for (let i = 0; i < linhas.length - 1; i++) {

    const nomes = linhas[i].map(slug);
    const colNome = nomes.indexOf("nome");
    const colNascimento = nomes.indexOf("data de nascimento");

    if (colNome === -1 || colNascimento === -1) {
      continue;
    }

    return {
      nomeTitular: linhas[i + 1][colNome] ?? null,
      dataNascimentoTitular:
        extrairDatas(linhas[i + 1][colNascimento] ?? "", hoje)[0] ?? null
    };

  }

  return doRotulo;

}

/*
==================================================
EXTRAÇÃO
==================================================

Cada linha do texto (ou linha de tabela em Markdown) que cita
uma vacina do catálogo vira um candidato. Devolve o registro
mais recente (maior data de aplicação), como o fluxo de Scan
sempre fez; datas no futuro são tratadas como "próxima dose" e
não como aplicação.
*/
export function extrairDadosCarteirinha(
  texto: string,
  catalogo: string[],
  hoje: Date = new Date()
): DadosExtraidosCarteirinha {

  const titular = extrairTitular(texto, hoje);

  const hojeIso = hoje.toISOString().slice(0, 10);

  const candidatos: Array<{
    ordem: number;
    registro: Omit<DadosExtraidosCarteirinha, "nomeTitular" | "dataNascimentoTitular">;
  }> = [];

  /*
  Cabeçalho da tabela (ex.: "Vacina/Profilaxia | Data | Dose | Lote | ...",
  como na carteira do Meu SUS Digital): guarda em que coluna está cada
  campo e usa nas linhas seguintes. Sem cabeçalho, vale a leitura por
  padrões de cada linha.
  */
  let colunas: {
    vacina?: number;
    data?: number;
    dose?: number;
    lote?: number;
    local?: number;
  } = {};

  texto.split(/\r?\n/).forEach((bruta, ordem) => {

    /* Linha de separação de tabela Markdown (| --- | --- |) */
    if (/^\s*\|?[\s:\-|]+\|?\s*$/.test(bruta)) {
      return;
    }

    const celulas = bruta.includes("|")
      ? bruta.split("|").map((c) => c.trim()).filter(Boolean)
      : [];

    const nomes = celulas.map(slug);

    if (
      celulas.length >= 3 &&
      nomes.some((n) => n.startsWith("vacina")) &&
      nomes.some((n) => n === "data")
    ) {

      colunas = {
        vacina: nomes.findIndex((n) => n.startsWith("vacina")),
        data: nomes.indexOf("data"),
        dose: nomes.indexOf("dose"),
        lote: nomes.indexOf("lote"),
        local: nomes.findIndex(
          (n) =>
            n.includes("estabelecimento") ||
            n.includes("unidade") ||
            n === "local"
        )
      };

      for (const chave of Object.keys(colunas) as Array<keyof typeof colunas>) {
        if (colunas[chave] === -1) delete colunas[chave];
      }

      return;

    }

    const celula = (indice?: number) =>
      indice !== undefined ? celulas[indice] : undefined;

    const linha = celulas.length > 0 ? celulas.join(" | ") : bruta.trim();

    const textoVacina = celula(colunas.vacina) ?? linha;

    const vacina =
      casarVacina(textoVacina, catalogo) ??
      (textoVacina === linha ? null : casarVacina(linha, catalogo));

    if (!vacina) {
      return;
    }

    const celulaVacinaCasou =
      casarVacina(textoVacina, catalogo) !== null;

    /* Tira o nome da vacina para ele não ser confundido com lote ou dose. */
    const semVacina = celulaVacinaCasou && textoVacina !== linha
      ? linha.replace(textoVacina, " ")
      : linha.slice(0, vacina.inicio) + " " + linha.slice(vacina.fim);

    const datas = extrairDatas(celula(colunas.data) ?? linha, hoje)
      .filter((d) => d <= hojeIso && d !== titular.dataNascimentoTitular);

    const dose =
      extrairDose(celula(colunas.dose) ?? semVacina) ??
      extrairDose(semVacina);

    const lote =
      colunas.lote !== undefined && celula(colunas.lote) !== undefined
        ? limparLote(celula(colunas.lote))
        : extrairLote(semVacina);

    const local =
      colunas.local !== undefined && celula(colunas.local)
        ? celula(colunas.local)!
        : extrairLocal(semVacina, celulas);

    candidatos.push({
      ordem,
      registro: {
        vacina: vacina.nome,
        dose: dose ?? "Não identificada",
        dataAplicacao: datas[0] ?? null,
        lote,
        localAplicacao: local
      }
    });

  });

  if (candidatos.length === 0) {
    throw new Error(
      "Não foi possível identificar nenhuma vacina na imagem."
    );
  }

  candidatos.sort((a, b) => {

    const dataA = a.registro.dataAplicacao ?? "";
    const dataB = b.registro.dataAplicacao ?? "";

    if (dataA !== dataB) {
      return dataB.localeCompare(dataA);
    }

    return b.ordem - a.ordem;

  });

  return {
    ...candidatos[0].registro,
    ...titular
  };

}
