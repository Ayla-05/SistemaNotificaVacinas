import { Request, Response } from "express";

import { LeituraCarteirinhaService }
  from "../services/leituraCarteirinhaService";
import { OcrIndisponivelError }
  from "../services/ocrService";
import { detectarTipoArquivoCarteirinha }
  from "../utils/seguranca";

/*
==================================================
SCAN CONTROLLER
==================================================

Responsabilidades:

- Receber a imagem da carteirinha enviada
  pelo frontend
- Validar tamanho e tipo real da imagem
- Chamar a leitura da carteirinha (OCR com Docling)
- Retornar os dados extraídos para revisão

NÃO é responsável por:

- Chamar a API da Anthropic diretamente
- Confirmar posse da pessoa
  (pessoaDoCorpoPertenceAoUsuario, na rota)
- Salvar o registro na carteira
  (isso é feito depois, via /carteira,
  quando o usuário confirma os dados revisados)

Dependências:

- LeituraCarteirinhaService
*/

/* Limite do arquivo já decodificado (o corpo JSON aceita até 10 MB em base64). */
const TAMANHO_MAXIMO_BYTES =
  5 * 1024 * 1024;

export class ScanController {

  /*
  ==================================================
  ANALISAR CARTEIRINHA
  ==================================================

  POST /scan/analisar

  Body:
  {
    "pessoaId": 1,
    "imagemBase64": "...",
    "mediaType": "image/jpeg"
  }
  */
  static async analisar(
    req: Request,
    res: Response
  ) {

    try {

      const { imagemBase64 } = req.body;

      if (
        typeof imagemBase64 !== "string" ||
        !imagemBase64
      ) {
        return res.status(400).json({
          erro: "Nenhuma imagem foi enviada."
        });
      }

      const bytes =
        Buffer.from(
          imagemBase64,
          "base64"
        );

      if (bytes.length > TAMANHO_MAXIMO_BYTES) {
        return res.status(413).json({
          erro: "Imagem muito grande. O limite é de 5 MB."
        });
      }

      /*
      O tipo é deduzido do conteúdo (magic bytes), não do
      "mediaType" informado pelo cliente.
      */
      const mediaType =
        detectarTipoArquivoCarteirinha(bytes);

      if (!mediaType) {
        return res.status(400).json({
          erro:
            "Formato não suportado. Envie JPG, PNG, WEBP ou PDF."
        });
      }

      const dados =
        await LeituraCarteirinhaService.analisar(
          bytes,
          mediaType
        );

      return res.status(200).json(
        dados
      );

    } catch (error: any) {

      if (error instanceof OcrIndisponivelError) {
        return res.status(503).json({
          erro: error.message
        });
      }

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
