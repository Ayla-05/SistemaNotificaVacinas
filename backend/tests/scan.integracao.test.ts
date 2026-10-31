import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import express from "express";
import request from "supertest";

import { configurarBanco } from "../src/database/configurarBanco";
import scanRoutes from "../src/routes/scanRoutes";

/*
Os limitadores de taxa e a posse da pessoa têm testes próprios;
aqui interessa o caminho: arquivo -> OCR -> extração -> resposta.
*/
vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

vi.mock("../src/middlewares/pessoaOwnershipMiddleware", () => ({
  pessoaDoCorpoPertenceAoUsuario: (_req: any, _res: any, next: any) => next(),
  pessoaPertenceAoUsuario: (_req: any, _res: any, next: any) => next()
}));

const app = express();
app.use(express.json({ limit: "10mb" }));
app.use("/scan", scanRoutes);

const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]);
const PDF = Buffer.from("%PDF-1.7 conteudo");

const TEXTO_OCR = `
Nome: Ana Souza Lima
Data de nascimento: 14/05/1990

| Vacina | Dose | Data | Lote | Unidade |
|---|---|---|---|---|
| Hepatite B | 1ª dose | 10/02/2023 | HB2301 | UBS Vila Nova |
`;

function respostaOcr(corpo: object, status = 200) {
  return Promise.resolve(
    new Response(JSON.stringify(corpo), {
      status,
      headers: { "Content-Type": "application/json" }
    })
  );
}

function enviar(arquivo: Buffer) {
  return request(app)
    .post("/scan/analisar")
    .send({ pessoaId: 1, imagemBase64: arquivo.toString("base64") });
}

beforeAll(async () => {
  process.env.OCR_SERVICE_URL = "http://ocr.teste";
  await configurarBanco();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("POST /scan/analisar", () => {

  it("lê a carteirinha: manda o arquivo ao OCR e extrai os campos", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => respostaOcr({ texto: TEXTO_OCR }));

    const res = await enviar(JPEG);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      vacina: "Hepatite B",
      dose: "1ª dose",
      dataAplicacao: "2023-02-10",
      lote: "HB2301",
      localAplicacao: "UBS Vila Nova",
      nomeTitular: "Ana Souza Lima",
      dataNascimentoTitular: "1990-05-14"
    });

    const [url, opcoes] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://ocr.teste/extrair");
    expect(opcoes.method).toBe("POST");
    expect((opcoes.body as FormData).get("arquivo")).toBeInstanceOf(Blob);
  });

  it("aceita PDF", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(() => respostaOcr({ texto: TEXTO_OCR }));

    const res = await enviar(PDF);

    expect(res.status).toBe(200);

    const corpo = (fetchMock.mock.calls[0][1] as RequestInit).body as FormData;
    expect((corpo.get("arquivo") as File).type).toBe("application/pdf");
  });

  it("recusa arquivo que não é imagem nem PDF, sem chamar o OCR", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    const res = await enviar(Buffer.from("<?php echo 1; ?>"));

    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("recusa arquivo acima de 5 MB", async () => {
    const grande = Buffer.concat([JPEG, Buffer.alloc(5 * 1024 * 1024)]);

    const res = await enviar(grande);

    expect(res.status).toBe(413);
  });

  it("responde 503 quando o serviço de OCR está fora do ar", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    const res = await enviar(JPEG);

    expect(res.status).toBe(503);
    expect(res.body.erro).toContain("indisponível");
  });

  it("explica quando o OCR não leu nenhum texto", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() => respostaOcr({ texto: "   " }));

    const res = await enviar(JPEG);

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("nenhum texto");
  });

  it("explica quando o texto lido não tem nenhuma vacina", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      respostaOcr({ texto: "Receita médica\nTomar 1 comprimido" })
    );

    const res = await enviar(JPEG);

    expect(res.status).toBe(400);
    expect(res.body.erro).toContain("nenhuma vacina");
  });

});
