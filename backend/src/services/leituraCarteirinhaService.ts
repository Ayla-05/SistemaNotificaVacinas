import { OcrService, TipoArquivoOcr } from "./ocrService";

import {
  extrairDadosCarteirinha,
  DadosExtraidosCarteirinha
} from "../utils/extratorCarteirinha";

import * as vacinaRepository from "../repositories/vacinaRepository";

/*
==================================================
LEITURA DE CARTEIRINHA SERVICE
==================================================

Responsabilidades:

- Orquestrar a leitura da carteirinha: OCR (Docling) e
  extração dos campos, já casando o nome da vacina com o
  catálogo do sistema

NÃO é responsável por:

- Requisições HTTP
- Salvar o registro na carteira (isso é o usuário quem
  confirma, via CarteiraService, depois de revisar)

Dependências:

- OcrService, extratorCarteirinha, vacinaRepository
*/
export type { DadosExtraidosCarteirinha };

export class LeituraCarteirinhaService {

  static async analisar(
    arquivo: Buffer,
    tipo: TipoArquivoOcr
  ): Promise<DadosExtraidosCarteirinha> {

    const texto =
      await OcrService.reconhecerTexto(
        arquivo,
        tipo
      );

    const vacinas =
      await vacinaRepository.listarVacinasAtivas() as any[];

    return extrairDadosCarteirinha(
      texto,
      vacinas.map((v) => v.nome)
    );

  }

}
