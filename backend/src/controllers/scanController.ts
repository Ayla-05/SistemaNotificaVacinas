import { Request, Response } from "express";

import { ClaudeVisionService, MediaTypeImagem }
  from "../services/claudeVisionService";

/*
==================================================
SCAN CONTROLLER
==================================================

Responsabilidades:

- Receber a imagem da carteirinha enviada
  pelo frontend
- Chamar o ClaudeVisionService
- Retornar os dados extraídos para revisão

NÃO é responsável por:

- Chamar a API da Anthropic diretamente
- Confirmar posse da pessoa
  (pessoaDoCorpoPertenceAoUsuario, na rota)
- Salvar o registro na carteira
  (isso é feito depois, via /carteira,
  quando o usuário confirma os dados revisados)

Dependências:

- ClaudeVisionService
*/

const TIPOS_AICEITOS: MediaTypeImagem[] = [
  "image/jpeg",
  "image/png",
  "image/webp"
];

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

      const {
        imagemBase64,
        mediaType
      } = req.body;

      if (
        !TIPOS_AICEITOS.includes(
          mediaType
        )
      ) {

        return res.status(400).json({
          erro:
            "Formato de imagem não suportado. Envie JPG, PNG ou WEBP."
        });

      }

      const dados =
        await ClaudeVisionService
          .analisarCarteirinha(
            imagemBase64,
            mediaType
          );

      return res.status(200).json(
        dados
      );

    } catch (error: any) {

      return res.status(400).json({
        erro: error.message
      });

    }

  }

}
