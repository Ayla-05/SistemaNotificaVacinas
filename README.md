# Notifica Vacinas

Sistema web para gerenciar a carteira de vacinação de uma pessoa e de seus dependentes e avisar, por e-mail,
as doses pendentes e próximas, calculadas pelo Calendário Nacional de Vacinação 2026.

- **Front end:** React 19 + Vite + Tailwind (raiz do projeto)
- **Back end:** Node.js + Express + TypeScript (`backend/`)
- **Banco:** PostgreSQL 16, com esquema e migrações do Prisma (`backend/prisma/`)
- **OCR:** serviço Python com Docling e EasyOCR (`ocr-service/`)

## Como rodar

```bash
docker compose up -d                 # PostgreSQL local (porta 5432)

cd backend
cp .env.example .env                 # preencher JWT_SECRET (e o restante, se quiser e-mail e OCR)
npm install
npm run db:migrar                    # aplica as migrações do Prisma
npm run dev                          # API em http://localhost:3000
```

```bash
npm install                          # na raiz
npm run dev                          # interface em http://localhost:5173
```

Para o OCR de carteirinhas, siga `ocr-service/README.md` e defina `OCR_SERVICE_URL` no `.env`.

## Testes

Com o PostgreSQL de pé (`docker compose up -d`):

```bash
cd backend
npm test                  # toda a suíte (cada arquivo roda em um schema PostgreSQL isolado)
npm run test:relatorio    # suíte + relatório em docs/relatorio-testes.md
```

Categorias: `unitarios`, `integracao`, `funcional`, `logica`, `cenarios`, `seguranca` e `arquitetura` (`npm run test:<categoria>`).

## Documentação

- `docs/monografia/`: o trabalho de graduação, com os diagramas em `figuras/`
- `docs/relatorio-testes.md`: resultado de cada teste
- `docs/correcoes.md`: o que foi corrigido, como e por quê
- `CONTRIBUTING.md`: convenção de nomes de branch
