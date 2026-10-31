/*
==================================================
OCR SERVICE (CLIENTE DO SERVIÇO DOCLING)
==================================================

Responsabilidades:

- Enviar a imagem/PDF da carteirinha ao serviço de OCR
  (pasta ocr-service/, Python + Docling) e devolver o
  texto reconhecido em Markdown

NÃO é responsável por:

- Interpretar o texto (utils/extratorCarteirinha)
- Requisições HTTP do usuário (scanController)

O serviço roda na infraestrutura do próprio sistema: o arquivo
do usuário não é enviado a terceiros.

Dependências:

- OCR_SERVICE_URL (variável de ambiente)
*/

/*
Tempo máximo de uma leitura. A PRIMEIRA leitura de um serviço recém-iniciado
pode demorar (carrega os modelos); por isso o serviço os carrega ao subir
(ver ocr-service/app.py) e o limite é folgado. Ajustável por OCR_TIMEOUT_MS.
*/
const TEMPO_LIMITE_MS =
  Number(process.env.OCR_TIMEOUT_MS) || 120_000;

export type TipoArquivoOcr =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "application/pdf";

const EXTENSOES: Record<TipoArquivoOcr, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf"
};

export class OcrIndisponivelError extends Error {
  constructor(motivo?: string) {
    super(
      "O serviço de leitura de carteirinha está indisponível no momento. " +
      "Tente novamente em instantes ou cadastre a dose manualmente." +
      (motivo ? ` (${motivo})` : "")
    );
    this.name = "OcrIndisponivelError";
  }
}

/*
Traduz o erro técnico do fetch em algo que diga o que fazer.
"TypeError: fetch failed" sozinho não ajuda: a causa de verdade
(recusou a conexão, endereço inexistente...) vem em erro.cause.
*/
function descreverFalhaDeConexao(
  erro: any,
  url: string
): string {

  const causa = erro?.cause?.code ?? erro?.cause?.name;

  if (erro?.name === "TimeoutError" || erro?.name === "AbortError") {
    return (
      "o serviço demorou demais para responder; na primeira leitura ele baixa os modelos, " +
      "então aguarde alguns minutos e tente de novo"
    );
  }

  if (causa === "ECONNREFUSED") {
    return `nenhum serviço respondeu em ${url}; confira se o ocr-service está rodando`;
  }

  if (causa === "ENOTFOUND" || causa === "EAI_AGAIN") {
    return `endereço ${url} não encontrado; confira OCR_SERVICE_URL`;
  }

  return `falha ao conectar em ${url}${causa ? ` (${causa})` : ""}`;

}

export class OcrService {

  static async reconhecerTexto(
    arquivo: Buffer,
    tipo: TipoArquivoOcr
  ): Promise<string> {

    const url = process.env.OCR_SERVICE_URL;

    if (!url) {
      throw new OcrIndisponivelError(
        "OCR_SERVICE_URL não configurada"
      );
    }

    const formulario = new FormData();

    formulario.append(
      "arquivo",
      new Blob([new Uint8Array(arquivo)], { type: tipo }),
      `carteirinha.${EXTENSOES[tipo]}`
    );

    let resposta: Response;

    try {

      resposta = await fetch(
        `${url.replace(/\/$/, "")}/extrair`,
        {
          method: "POST",
          body: formulario,
          signal: AbortSignal.timeout(TEMPO_LIMITE_MS)
        }
      );

    } catch (erro: any) {

      const motivo =
        descreverFalhaDeConexao(erro, url);

      /* O detalhe técnico vai para o log do servidor e para a mensagem. */
      console.error(
        `[OcrService] Falha ao chamar o OCR: ${motivo}`,
        erro?.cause ?? erro
      );

      throw new OcrIndisponivelError(motivo);

    }

    if (resposta.status === 422 || resposta.status === 415) {
      throw new Error(
        "Não foi possível ler este arquivo. Envie uma foto nítida (JPG, PNG, WEBP) ou um PDF."
      );
    }

    if (!resposta.ok) {
      throw new OcrIndisponivelError(`HTTP ${resposta.status}`);
    }

    const corpo = await resposta.json() as { texto?: unknown };

    if (typeof corpo.texto !== "string" || !corpo.texto.trim()) {
      throw new Error(
        "Não foi possível ler nenhum texto na imagem. Tente uma foto mais nítida e bem iluminada."
      );
    }

    return corpo.texto;

  }

}
