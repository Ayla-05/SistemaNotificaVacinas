# Relatório de testes automatizados

Suíte: `cd backend && npm test` (vitest + supertest). 12 arquivos, 171 testes, todos passando.
Novo arquivo: `backend/tests/sistemaCompleto.integracao.test.ts` (59 testes sobre o app inteiro, com CSRF, autenticação e rotas reais).

## Acertos (já funcionavam)
- Health check, 404 em JSON, cabeçalhos de segurança (helmet), CSRF em métodos de escrita.
- Rotas protegidas devolvem 401 sem login.
- Cadastro público, confirmação de e-mail por código, login, `/auth/me`, sessões (listar/encerrar todas), logout/refresh.
- Admin: CRUD de usuários, regras vacinais restritas a admin.
- Vacinas: leitura pública, busca por id/código/nome, 404 para inexistente, código duplicado recusado.
- Carteira: registrar vacina/dose, duplicidade recusada, listagem da carteira própria e de terceiros bloqueada, confirmar-scan.
- Agendamentos: criar, listar por pessoa, atualizar observação, contar.
- Pendências/próximas doses (com bloqueio de pessoa alheia), dependentes, grupos especiais, PUT parcial de pessoa, validação de frequência de aviso.

## Erros encontrados e corrigidos
| # | Erro | Correção |
|---|------|----------|
| 1 | `POST/PUT/PATCH /vacinas` sem login nem perfil admin: qualquer anônimo criava/editava/desativava vacinas | `autenticar` + `exigirAdmin` nas rotas de escrita |
| 2 | `POST/PUT/DELETE /calendario` sem admin: qualquer usuário logado alterava o calendário vacinal | `exigirAdmin` |
| 3 | `GET /pessoas` listava todas as pessoas do sistema para qualquer usuário | usuário comum recebe só as da própria conta; admin vê todas |
| 4 | `GET/PUT/DELETE /pessoas/:id` sem checagem de posse (IDOR): era possível ler, alterar e apagar pessoa de outro usuário | middleware `pessoaDoIdPertenceAoUsuario` |
| 5 | `POST /pessoas` aceitava `usuario_id` de outra conta | 403 se não for a própria conta (admin liberado) |
| 6 | Doses/registros da carteira (`/carteira/dose`, `/registro/:id/doses`, `/contar-doses`, `DELETE dose/registro`) sem posse | middlewares de posse por registro/dose |
| 7 | Agendamentos por id (ver, alterar status/observação, remover) e criação para pessoa alheia sem posse | middlewares de posse |
| 8 | `GET /agendamentos` devolvia agendamentos de todos | filtrado pelas pessoas da conta (admin vê todos) |
| 9 | Status de agendamento aceitava qualquer texto | valida PENDENTE/AGENDADA/REALIZADA/CANCELADA/ATRASADA (400) |
| 10 | `GET /usuarios` e `/usuarios/:id` devolviam hash da senha e código de verificação | campos removidos da resposta |
| 11 | `server.ts` subia a porta ao ser importado, impossibilitando testar o app inteiro | bootstrap só roda fora de `NODE_ENV=test` |

## Não coberto
- OCR real (serviço Python/Claude Vision) e envio real de e-mail/SMS: testados apenas com mocks.
- Frontend React (sem framework de teste configurado).
