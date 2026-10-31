"""
Serviço de OCR do Notifica Vacinas (Docling).

Recebe a foto ou o PDF da carteirinha e devolve o texto reconhecido em
Markdown (tabelas incluídas). Não interpreta o conteúdo: quem extrai vacina,
dose, data e lote é o back end (utils/extratorCarteirinha.ts).

Roda na infraestrutura do próprio sistema, então o arquivo do usuário não é
enviado a terceiros.
"""

import logging
import os
import tempfile
from functools import lru_cache

from fastapi import FastAPI, File, HTTPException, UploadFile

log = logging.getLogger("ocr-service")

LIMITE_BYTES = int(os.getenv("OCR_LIMITE_BYTES", str(5 * 1024 * 1024)))

# Idiomas do OCR (EasyOCR): português e inglês.
IDIOMAS = [i.strip() for i in os.getenv("OCR_IDIOMAS", "pt,en").split(",") if i.strip()]

EXTENSOES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}

app = FastAPI(title="Notifica Vacinas - OCR", docs_url=None, redoc_url=None)


@lru_cache(maxsize=1)
def obter_conversor():
    """Cria o conversor uma única vez: carregar os modelos é o passo caro."""
    from docling.datamodel.base_models import InputFormat
    from docling.datamodel.pipeline_options import EasyOcrOptions, PdfPipelineOptions
    from docling.document_converter import (
        DocumentConverter,
        ImageFormatOption,
        PdfFormatOption,
    )

    opcoes = PdfPipelineOptions()
    opcoes.do_ocr = True
    opcoes.do_table_structure = True
    opcoes.ocr_options = EasyOcrOptions(lang=IDIOMAS)

    return DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=opcoes),
            InputFormat.IMAGE: ImageFormatOption(pipeline_options=opcoes),
        }
    )


@app.get("/saude")
def saude():
    return {"status": "ok"}


# Endpoint síncrono de propósito: o FastAPI o executa em um pool de threads, e
# o OCR (CPU) não trava o servidor.
@app.post("/extrair")
def extrair(arquivo: UploadFile = File(...)):
    extensao = EXTENSOES.get(arquivo.content_type or "")

    if not extensao:
        raise HTTPException(status_code=415, detail="Envie JPG, PNG, WEBP ou PDF.")

    conteudo = arquivo.file.read(LIMITE_BYTES + 1)

    if len(conteudo) > LIMITE_BYTES:
        raise HTTPException(status_code=413, detail="Arquivo muito grande.")

    with tempfile.NamedTemporaryFile(suffix=extensao) as temporario:
        temporario.write(conteudo)
        temporario.flush()

        try:
            resultado = obter_conversor().convert(temporario.name)
        except Exception:
            # Sem detalhes do erro na resposta: o conteúdo pode ser dado pessoal.
            log.exception("Falha ao converter o arquivo")
            raise HTTPException(status_code=422, detail="Não foi possível ler o arquivo.")

    return {"texto": resultado.document.export_to_markdown()}
