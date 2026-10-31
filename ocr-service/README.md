# Serviço de OCR (Docling)

Lê a foto ou o PDF da carteirinha de vacinação e devolve o texto em Markdown.
O back end (`backend/`) chama este serviço em `POST /extrair` e extrai os campos
(vacina, dose, data, lote, local) em `backend/src/utils/extratorCarteirinha.ts`.

## Rodar localmente

```bash
cd ocr-service
python -m venv .venv
source .venv/bin/activate        # Windows (PowerShell): .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --port 8000
```

O `docling[easyocr]` instala o motor de OCR (EasyOCR) junto. Na primeira leitura
o Docling baixa os modelos (alguns GB, uma vez só, a partir do Hugging Face e do
GitHub); depois fica em cache. Em máquina sem GPU, a leitura de uma foto leva de
alguns segundos a cerca de um minuto. Em seguida, no `backend/.env`:

```
OCR_SERVICE_URL=http://localhost:8000
```

## Se o Scan disser "serviço de leitura indisponível"

A mensagem agora traz o motivo entre parênteses, e o terminal do back end mostra o detalhe.

| Motivo | O que fazer |
|---|---|
| `nenhum serviço respondeu em ...` | O `ocr-service` não está rodando. Suba com `uvicorn app:app --port 8000` e deixe o terminal aberto. |
| `endereço ... não encontrado` | `OCR_SERVICE_URL` está errada no `backend/.env`. Use `http://localhost:8000`. |
| `o serviço demorou demais` | O serviço acabou de subir e ainda carrega os modelos (na 1ª vez, baixa alguns GB). Espere a linha "Serviço pronto" no terminal do OCR. |
| `OCR_SERVICE_URL não configurada` | Falta a variável no `backend/.env`. Reinicie o back end depois de editar. |

Para conferir que o serviço está de pé, abra `http://localhost:8000/saude` no navegador: deve responder `{"status":"ok"}`.

Para baixar os modelos antes (e não na 1ª leitura):

```bash
python -c "from docling.utils.model_downloader import download_models; download_models(with_easyocr=True, easyocr_languages=['pt', 'en'], with_code_formula=False, with_picture_classifier=False)"
```

## Rodar com Docker

```bash
docker build -t notifica-ocr ocr-service
docker run -p 8000:8000 notifica-ocr
```

## API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/saude` | Verificação de funcionamento. |
| POST | `/extrair` | `multipart/form-data`, campo `arquivo` (JPG, PNG, WEBP ou PDF, até 5 MB). Resposta: `{ "texto": "<markdown>" }`. |

Variáveis opcionais: `OCR_IDIOMAS` (padrão `pt,en`) e `OCR_LIMITE_BYTES`.

## Limites

- Funciona bem com texto impresso ou digital (PDF do Meu SUS Digital, prints,
  carteirinhas digitadas). Letra manuscrita e carimbos borrados saem com erros;
  por isso o usuário sempre revisa os campos antes de gravar na carteira.
- Só o back end deve acessar este serviço (rede interna). Ele não tem
  autenticação própria e recebe dados pessoais de saúde.
