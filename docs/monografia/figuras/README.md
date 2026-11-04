# Figuras da monografia

- `figura-modelo-er.*`: modelo de dados (16 tabelas) — Figura 2.
- `figura-fluxo-ocr.*`: fluxo da leitura da carteirinha por OCR — Figura 4.
- `figura-casos-de-uso.*`: diagrama de casos de uso (19 casos, 5 atores).
- `figura-arquitetura.*`: arquitetura do sistema (navegador, servidor em camadas, SQLite, OCR, e-mail e ViaCEP).

Os `.svg` são gerados por `python3 gerar_figuras.py` (só biblioteca padrão). Os `.png` usados no Word são
renderizados a partir dos SVG (por exemplo, abrindo o SVG no Chromium/Playwright com escala 2x).
Para regenerar o `.docx` a partir do Markdown:

```bash
cd docs/monografia
pandoc monografia.md -o Monografia-NotificaVacinas.docx --toc --toc-depth=3 --resource-path=.
```
