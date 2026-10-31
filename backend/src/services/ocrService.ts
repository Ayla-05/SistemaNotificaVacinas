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

const TEMPO_LIMITE_MS = 90_000;

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

      throw new OcrIndisponivelError(erro?.name);

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
