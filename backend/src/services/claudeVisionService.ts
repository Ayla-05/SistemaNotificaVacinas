import Anthropic from "@anthropic-ai/sdk";

/*
==================================================
CLAUDE VISION SERVICE
==================================================

Responsabilidades:

- Enviar a foto da carteirinha de vacinação
  para o Claude (modelo com visão)
- Extrair vacina, dose, data de aplicação,
  lote e local de aplicação
- Devolver os dados já estruturados em JSON

NÃO é responsável por:

- Requisições HTTP
- Salvar o registro na carteira
  (isso é o usuário quem confirma,
  via CarteiraService, depois de revisar)

Dependências:

- @anthropic-ai/sdk
- ANTHROPIC_API_KEY (variável de ambiente)
*/

const MODELO_VISAO =
  process.env.CLAUDE_VISION_MODEL ||
  "claude-sonnet-5";

/*
Tipos de imagem aceitos pela API da Anthropic.
*/
export type MediaTypeImagem =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export interface DadosExtraidosCarteirinha {
  vacina: string;
  dose: string;
  dataAplicacao: string | null;
  lote: string | null;
  localAplicacao: string | null;
}

const PROMPT_EXTRACAO = `
Você está analisando a foto de uma carteirinha de vacinação
brasileira. Extraia os dados do registro de vacina mais
recente e visível na imagem.

Responda APENAS com um JSON válido, sem nenhum texto antes
ou depois, no formato exato:

{
  "vacina": "nome da vacina como está escrito",
  "dose": "ex: 1ª dose, Dose única, Reforço",
  "dataAplicacao": "AAAA-MM-DD ou null se não for legível",
  "lote": "número do lote ou null se não for legível",
  "localAplicacao": "nome da unidade de saúde ou null"
}

Se a imagem não for uma carteirinha de vacinação ou não for
possível ler nenhum dado com confiança, responda com:

{ "erro": "motivo em poucas palavras" }
`.trim();

export class ClaudeVisionService {

  /*
  ==================================================
  ANALISAR CARTEIRINHA
  ==================================================

  Recebe a imagem em base64 (sem o prefixo
  "data:image/...;base64,") e devolve os
  campos extraídos pela IA.
  */
  static async analisarCarteirinha(
    imagemBase64: string,
    mediaType: MediaTypeImagem
  ): Promise<DadosExtraidosCarteirinha> {

    if (!process.env.ANTHROPIC_API_KEY) {

      throw new Error(
        "ANTHROPIC_API_KEY não configurada no servidor."
      );

    }

    if (!imagemBase64) {

      throw new Error(
        "Nenhuma imagem foi enviada."
      );

    }

    const anthropic = new Anthropic({
      apiKey:
        process.env.ANTHROPIC_API_KEY
    });

    const resposta =
      await anthropic.messages.create({
        model: MODELO_VISAO,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imagemBase64
                }
              },
              {
                type: "text",
                text: PROMPT_EXTRACAO
              }
            ]
          }
        ]
      });

    const blocoTexto =
      resposta.content.find(
        (bloco) => bloco.type === "text"
      );

    if (!blocoTexto || blocoTexto.type !== "text") {

      throw new Error(
        "O Claude Vision não retornou uma resposta legível."
      );

    }

    let dados: any;

    try {

      dados = JSON.parse(
        blocoTexto.text.trim()
      );

    } catch {

      throw new Error(
        "Não foi possível interpretar a resposta da IA."
      );

    }

    if (dados.erro) {
      throw new Error(dados.erro);
    }

    if (!dados.vacina) {

      throw new Error(
        "Não foi possível identificar a vacina na imagem."
      );

    }

    return {
      vacina: dados.vacina,
      dose: dados.dose ?? "Não identificada",
      dataAplicacao: dados.dataAplicacao ?? null,
      lote: dados.lote ?? null,
      localAplicacao: dados.localAplicacao ?? null
    };

  }

}
