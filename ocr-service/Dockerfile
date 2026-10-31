FROM python:3.12-slim

WORKDIR /app

# Bibliotecas de sistema usadas pelo OpenCV (dependência do OCR).
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# PyTorch só para CPU (o padrão do pip traz as bibliotecas CUDA, vários GB a mais).
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Baixa os modelos na construção da imagem, para o primeiro pedido não demorar
# e para o serviço rodar sem acesso à internet.
RUN python -c "from docling.utils.model_downloader import download_models; download_models(with_easyocr=True, easyocr_languages=['pt', 'en'], with_code_formula=False, with_picture_classifier=False)"

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
