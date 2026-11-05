# Registro de correções

Cada correção tem um código `COR-nn`. O mesmo código aparece no código-fonte, num comentário
`CORREÇÃO [COR-nn]` junto ao trecho alterado, e na coluna **Teste** abaixo, que aponta o teste
automatizado que falhava antes e passa agora (veja os resultados em [`relatorio-testes.md`](relatorio-testes.md)).

Para repetir: `cd backend && npm test` (tudo) ou `npm run test:relatorio` (tudo + relatório).

Severidade: **Crítica** (dado ou controle exposto a qualquer pessoa), **Alta** (usuário logado
acessa ou altera o que não é seu), **Média** (robustez, vazamento limitado, integridade),
**Baixa** (manutenção, desempenho, qualidade de código).

## 1. Segurança e controle de acesso

| Código | Sev. | Problema encontrado | Como foi corrigido | Teste |
|---|---|---|---|---|
| COR-01 | Crítica | `POST/PUT/PATCH /vacinas` eram públicos: qualquer pessoa, sem login, criava, editava e desativava vacinas. | `vacinaRoutes.ts`: `autenticar` + `exigirAdmin` nas três rotas de escrita. A leitura do catálogo continua pública. | `ARQ-15`, funcional "anônimo não cria vacina" |
| COR-02 | Alta | `POST/PUT/DELETE /calendario`: qualquer usuário logado alterava o calendário vacinal. | `calendarioRoutes.ts`: `exigirAdmin` na escrita. | `ARQ-15`, funcional "calendário legível por logados, só admin altera" |
| COR-03 | Alta | `GET /pessoas` devolvia todas as pessoas do sistema a qualquer logado. | `pessoaController.listar`: usuário comum recebe só as pessoas da própria conta; admin vê todas. | funcional "usuário comum não lista todas as pessoas" |
| COR-04 | Alta | `GET/PUT/DELETE /pessoas/:id` sem checagem de dono (IDOR): ler, alterar e apagar a pessoa de outra conta. | Novo middleware `pessoaDoIdPertenceAoUsuario` (reaproveita `validarPosse`) nas três rotas. | funcional (IDOR/altera/remove pessoa alheia) |
| COR-05 | Alta | `POST /pessoas` aceitava `usuario_id` de outra conta. | Middleware `forcarDonoDaPessoa` (`pessoaRoutes.ts`): para quem não é admin, o `usuario_id` do corpo é **ignorado** e a pessoa nasce na conta de quem pediu. | funcional "ao criar pessoa, o usuario_id do corpo é ignorado", `seguranca/autorizacao.test.ts` |
| COR-06 | Alta | Rotas de dose/registro da carteira (`/carteira/dose`, `/registro/:id/doses`, `/contar-doses`, `DELETE dose/registro`) sem posse. | Middlewares `registroDaUrl…`, `registroDoId…`, `registroDoCorpo…`, `doseDoId…PertenceAoUsuario` (fábrica `donoDoRecurso`: resolve o `pessoa_id` dono e confere a conta; inexistente → 403 para o usuário comum). | funcional (carteira vacinal › "não lê/registra/remove…") |
| COR-07 | Alta | Agendamentos por id (ver, alterar status/observação, remover), criação para pessoa alheia e `GET /agendamentos` (lista de todos). | `agendamentoDoIdPertenceAoUsuario`, `pessoaDoCorpoPertenceAoUsuario` nas rotas; `AgendamentoService.listarVisiveis` filtra a listagem pelas pessoas da conta. | funcional (agendamentos › …) |
| COR-08 | Média | Status do agendamento aceitava qualquer texto. | `AgendamentoService.atualizarStatus` valida contra `PENDENTE, AGENDADA, REALIZADA, CANCELADA, ATRASADA` (400). | funcional "recusa status inválido" |
| COR-09 | Alta | `GET /usuarios` e `/usuarios/:id` devolviam `SELECT *`, com hash da senha e código de verificação de e-mail. | `usuarioController.semSegredos` remove `senha`, `codigo_verificacao`, `codigo_verificacao_expira` da resposta. | `SEG-28`, funcional "não vaza hash" |
| COR-11 | Alta | Um admin podia remover, desativar ou rebaixar a própria conta e o **último** administrador, deixando o sistema sem quem o administre. | `UsuarioService.garantirQueNaoPerdeOAdmin` (recusa agir sobre si mesmo e sobre o último admin ativo); `usuarioRepository.contarAdministradoresAtivos`; o controller passa `req.usuarioId`. | `SEG-14` |
| COR-12 | Alta | Desativar um usuário não encerrava as sessões abertas: o token seguia válido até expirar. | `UsuarioService.desativar` chama `sessaoRepository.revogarSessoesDoUsuario`. | `SEG-15` |
| COR-13 | Média | JSON malformado gerava a página de erro padrão do Express, com pilha de execução (caminhos de arquivo e versões). | Manipulador de erros global em `server.ts`: 400 (JSON inválido), 413 (corpo grande), 500 genérico; o detalhe vai só para o log. | `SEG-20`, `SEG-21`, `SEG-27` |
| COR-14 | Média | Respostas com dados de saúde sem `Cache-Control`: o navegador (botão "voltar") ou um proxy podia guardá-las. | Middleware global em `server.ts`: `Cache-Control: no-store` e `Pragma: no-cache`. | `SEG-23` |
| COR-15 | Baixa | `jwt.verify` sem `algorithms`: a proteção contra `alg: none`/troca de algoritmo dependia do padrão da biblioteca. | `authService`: assinatura e verificação fixadas em `HS256` (em todos os pontos de verificação). | `SEG-02`, `SEG-03`, `SEG-05` |

## 2. Banco de dados

| Código | Sev. | Problema encontrado | Como foi corrigido | Teste |
|---|---|---|---|---|
| COR-16 | Alta | **Chaves estrangeiras não eram aplicadas.** O SQLite as ignora por padrão; confirmado inserindo uma pessoa de usuário inexistente (aceita). | `PRAGMA foreign_keys = ON` na abertura da conexão (`database.ts`). | funcional "o banco recusa registro órfão" |
| COR-17 | Alta | Com FK ligada, apagar registro/pessoa/usuário com filhos falharia (e antes deixava órfãos). As tabelas não têm `ON DELETE CASCADE` e o SQLite não altera FK depois de criada. | `removerEmCascata` (`database.ts`): apaga os filhos e o pai numa única transação (`BEGIN IMMEDIATE … COMMIT`, `ROLLBACK` em erro). Usada por `removerRegistroVacinacao`, `removerPessoa` e `removerUsuario`. | funcional › "integridade do banco e remoções em cascata" (4 testes) |
| COR-18 | Baixa | Nenhum índice além de PK/UNIQUE: toda busca "da pessoa X"/"da vacina Y" varria a tabela. | Novo `database/indices.ts` (19 índices): FKs e consultas frequentes; `UNIQUE` em `(pessoa, vacina)` no registro, `(registro, nº da dose)` na dose e `(pessoa, grupo)`. Se a base antiga tiver duplicatas, cai para índice comum e registra o erro. Planos de consulta conferidos com `EXPLAIN QUERY PLAN` (`SEARCH … USING INDEX`). | funcional + `EXPLAIN` (ver `monografia.md`, seção 4.3) |
| COR-19 | Baixa | A criação das tabelas rodava em paralelo e o código esperava **1 s fixo** (`setTimeout`) torcendo para acabar. | `configurarBanco`: tudo em `db.serialize` e uma consulta final (`SELECT 1`) sinaliza o término. | toda a suíte (cada arquivo sobe o banco) |
| COR-20 | Baixa | Sem ajustes de concorrência/desempenho. | `busy_timeout = 5000`; `journal_mode = WAL` e `synchronous = NORMAL` (só em banco de arquivo). `.gitignore` ignora `*.db-wal` e `*.db-shm`. | verificado em banco de arquivo com dados reais |
| COR-21 | Baixa | `inicializarBanco()` em `database.ts` era código morto (nunca chamado e já desatualizado: faltavam 4 tabelas). | Removida; `configurarBanco.ts` é a única fonte da estrutura. | `tsc` + suíte |
| COR-24 | Alta | `backend/vacinas.db` (com contas e *hashes* de senha) estava **versionado** no Git. | `git rm --cached` e `*.db` no `.gitignore`. O arquivo local não foi apagado. **Atenção:** o histórico do Git ainda contém o arquivo; troque as senhas das contas administrativas e, se o repositório for público, considere reescrever o histórico. | `ARQ-12` |

## 3. Código limpo e arquitetura

| Código | Sev. | Problema encontrado | Como foi corrigido | Teste |
|---|---|---|---|---|
| COR-10 | Baixa | `server.ts` abria a porta ao ser importado, impedindo testar o app inteiro. | Bootstrap (`iniciarServidor`) só roda fora de `NODE_ENV=test`. | todos os testes de app completo |
| COR-22 | Baixa | ~120 blocos `new Promise` + callback repetidos nos 16 repositórios (violação de DRY; ruído que escondia o SQL). | Helpers `consultarTodos`, `consultarUm`, `inserir`, `alterar` em `database.ts`; conversão mecânica de 99 blocos (restaram 5, de formato diferente). Repositórios: 4478 → ~3100 linhas, sem mudança de comportamento. | suíte inteira + `tsc` |
| COR-23 | Média | `authController` e (por uma alteração minha) `agendamentoController` acessavam repositórios direto, pulando a camada de serviço. | Lógica movida para `AuthService` (`gerarEGravarCodigoVerificacao`, `buscarUsuarioAutenticado`, `destinatarioDasBoasVindas`) e `AgendamentoService.listarVisiveis`. | `ARQ-01` |

## 3b. Lógica de negócio

| Código | Sev. | Problema encontrado | Como foi corrigido | Teste |
|---|---|---|---|---|
| COR-25 | Alta | **Validação de entrada ausente.** A API aceitava data de nascimento futura, "abc", "14/05/1990" ou do ano 1800; e-mail inválido; atualização de pessoa com nome vazio; número de dose 0, negativo, decimal, texto ou 99; dose sem número (devolvia o erro cru do SQLite, `SQLITE_CONSTRAINT: NOT NULL…`); datas impossíveis em agendamento (30/02, "ontem"); qualquer texto como parentesco; data de aplicação futura no scan. Dado ruim na carteira vacinal distorce pendências. | Camada `utils/validacao.ts` (funções puras que lançam erro em português: `dataIsoExiste`, `validarDataNascimento`, `validarDataAplicacao` (não futura e não anterior ao nascimento), `validarNumeroDose` 1–20, `validarTexto` com limite de tamanho, `validarDadosPessoa`, `emailValido`; dependente com lista de parentescos aceitos, com/sem acento) aplicada em `PessoaService`, `DependenteService`, `CarteiraService` (dose e confirmar-scan) e `AgendamentoService` (inclui recusar agendamento retroativo ou duplicado). Erros voltam como 400 com mensagem clara. | `LOG-12` a `LOG-22`, `tests/logica/validacao.test.ts`, `validacao.api.test.ts` |
| COR-26 | Alta | **Idade errada em fuso do Brasil.** `calcularIdade` fazia `new Date("1990-05-14")` (meia-noite UTC) e lia mês/dia no fuso local: em UTC−3 a data "recuava" um dia, e a pessoa ficava um ano mais velha **na véspera** do aniversário (36 em vez de 35), antecipando a troca de faixa etária (10, 25, 60 anos) e as pendências. Em servidor UTC o erro não aparecia. Também havia "hoje" em UTC (vira o dia às 21h de Brasília) e em fuso local, de forma inconsistente. | Novo `utils/dataHoje.ts`: `hojeIso()` (dia civil de `America/Sao_Paulo`, via `Intl`) e `idadeEmAnos()` (compara texto AAAA-MM-DD, sem `Date`). Usados em `VacinalService`, `ProximasDosesService`, `NotificacaoService` (resumo e lembrete de agendamento), extrator da carteirinha e validação. A suíte passa em 4 fusos (UTC, São Paulo, Auckland, Honolulu). | `LOG-07`, `tests/logica/datas.test.ts` |

Também verificado, **sem defeito**: o esquema avança dose a dose (Hepatite B de adulto: 1ª → 2ª → 3ª → em dia), dose
única (Febre Amarela) fica em dia, remover a dose devolve a pendência, 8 requisições simultâneas da mesma dose/vacina
gravam uma só (graças aos índices únicos, COR-18), e o cadastro público já recusava nascimento futuro (`LOG-01` a `LOG-11`, `LOG-22`).

## 3c. Integração com o trabalho local da autora

Em 04/11/2026, a branch `feat/interface-mascotes-e-painel-notificacoes` (interface com mascotes, painel de
notificações, ajustes de OCR e materiais da monografia) foi integrada à `main`. Ela continha correções
**paralelas** às COR-01 a COR-29 (autorização, validação, tratador de erros e o mesmo defeito de idade em fuso).
Resolução dos conflitos, arquivo a arquivo:

| Assunto | Decisão |
|---|---|
| Validação de entrada | Mantida a camada da branch da autora (`utils/validacao.ts`), mais completa (limites de texto, estado com 2 letras, aplicação não anterior ao nascimento, agendamento retroativo/duplicado). Única alteração: o "hoje" dela passou a vir de `utils/dataHoje.ts` (dia civil de São Paulo, COR-26). Os validadores duplicados da outra versão foram removidos. |
| Posse de recursos | Mantidos os middlewares da `main` (resposta 403 uniforme, sem revelar se o recurso existe); a rota `PATCH /agendamentos/:id/confirmar` da branch da autora foi religada a eles. |
| Funcionalidade nova | Preservados `confirmarRealizacao` (confirma o agendamento e registra a dose na carteira), `forcarDonoDaPessoa` e o texto de erro de parentesco. |
| Tratador de erros | Mantido o `erroMiddleware.ts` (arquivo separado, mais limpo); acrescentada a guarda `res.headersSent`. |
| Idade | Mantida a versão `idadeEmAnos` (`dataHoje.ts`); a versão da branch corrigia o mesmo bug de fuso. |
| Testes | Os dois testes da branch foram movidos para `tests/seguranca/autorizacao.test.ts` e `tests/logica/validacao.api.test.ts`; um deles deixou de assumir o fuso da máquina. O teste unitário de validação foi reescrito sobre a camada adotada. |

Resultado: 375 testes passando (UTC, São Paulo e Auckland) e o front end compila (`npm run build`).

## 4. Falsos alarmes (testes escritos, sem defeito)

Ficam registrados porque mostram o que foi verificado e está correto: `SEG-01` a `SEG-13`, `SEG-16` a
`SEG-19`, `SEG-22`, `SEG-24` a `SEG-26` e `SEG-29` passaram de primeira (cookies HttpOnly/SameSite, JWT de outro
segredo e `alg: none`, e-mail inexistente indistinguível no login e na recuperação de senha, bloqueio
progressivo, perfil não escolhido no cadastro, reuso de *refresh token*, SQL *injection*, magic bytes no scan,
cabeçalhos do helmet, CORS e CSRF). `SEG-11` falhou por erro do **teste** (a API tolera 10 s de corrida entre
abas antes de tratar reuso como roubo); o teste foi ajustado para envelhecer a rotação.

## 4b. Migração do banco: SQLite → PostgreSQL com Prisma

| Código | Sev. | Problema encontrado | Como foi corrigido | Teste |
|---|---|---|---|---|
| COR-27 | Média | Banco embarcado (SQLite): um único escritor, arquivo local (impede replicar a API), estrutura criada por `CREATE TABLE` escritos à mão e migrações por `ALTER TABLE` com tratamento de erro; `schema.prisma` incompleto e sem uso. | Banco migrado para o **PostgreSQL 16**. `prisma/schema.prisma` descreve as 16 tabelas, chaves, índices e regras de remoção; a migração `inicial` foi gerada por `prisma migrate dev` e é aplicada por `npm run db:migrar`. `database.ts` usa `pg` (pool, `consultarTodos`, `consultarUm`, `inserir`, `alterar`, `emTransacao`; `?` vira `$n`); `configurarBanco` só confere a estrutura e roda os *seeds*. `docker-compose.yml`, `.env.example` (`DATABASE_URL`) e scripts `db:migrar`, `db:nova`, `db:status`. O `prisma.config.ts` do repositório era inválido (função inexistente) e foi reescrito. | toda a suíte (558 testes, cada arquivo em um schema PostgreSQL próprio criado das migrações reais); `CEN-24`, `CEN-25` |
| COR-28 | Média | A cascata de remoção era feita no código (`removerEmCascata`) porque o SQLite não altera chaves estrangeiras. | `ON DELETE CASCADE` declarado no esquema para os dados que pertencem a outro registro (`RESTRICT` nos catálogos). Cada remoção virou um único `DELETE`, atômico. A função `removerEmCascata` foi removida. | funcional "remoção em cascata" (3 testes), `CEN-27` |
| COR-29 | Média | `CURRENT_TIMESTAMP` gravado em coluna de texto no PostgreSQL produz `2026-11-05 03:14:15.123456+00`; o código, que lê datas como UTC sem fuso, tratava como data inválida (a rotação de *refresh token* devolvia 401 em vez de 409). | Constante `AGORA_UTC` (`to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS')`), igual ao formato antigo, usada nos `UPDATE` e nos valores padrão do esquema. O teste de arquitetura `ARQ-09` aceita essa constante (expressão fixa). | `auth.integracao` (rotação e reuso do *refresh token*) |

As correções **COR-16** (`foreign_keys`), **COR-17** (cascata no código), **COR-18** (índices em `indices.ts`), **COR-19**
(espera fixa na inicialização), **COR-20** (WAL e `busy_timeout`) e **COR-21** (código morto) tratavam de limitações do SQLite
e foram **superadas** por esta migração: no PostgreSQL, as chaves estrangeiras são sempre aplicadas, a cascata e os 19 índices
estão no esquema, a estrutura vem das migrações e o pool de conexões substitui os ajustes do arquivo.

## 4c. Achados em aberto (a verificar com a fonte oficial)

Os testes de cenários com 38 pessoas de idades diferentes apontaram dois pontos do **esquema vacinal** que não foram
alterados, porque são regras de saúde e dependem do Calendário Nacional oficial:

* **A-01 · Pneumocócica 10-valente.** O calendário de 2026 prevê 20-valente aos 2 meses, **10-valente aos 4 meses** e reforço
  20-valente aos 12 meses (série mista, transcrita fielmente em `esquemaVacinal2026.ts`). Como o esquema trata 10V e 20V como
  vacinas distintas, a 10V só tem a "2ª dose", e o resumo mostra "0 tomadas, 2 necessárias, falta 1". Não é erro de cálculo, mas
  pode confundir o usuário; avaliar tratar a série mista como uma só.
* **A-02 · Rotavírus.** A 2ª dose tem janela até 23 meses e a 1ª, até 11; uma criança de 12 a 23 meses sem nenhuma dose recebe
  a "2ª dose" como atrasada, sem a 1ª. Conferir as idades máximas de cada dose no calendário oficial.

O teste `CEN-09b` garante o que é seguro: depois da janela, a 1ª dose nunca é sugerida.

## 5. Pendências conhecidas (não corrigidas)

1. **Histórico do Git** ainda contém `vacinas.db` (COR-24). Trocar senhas administrativas.
2. **`authService.ts` tem ~980 linhas** (login, sessões, refresh, recuperação de senha, tokens): candidato a divisão
   em serviços menores. Não foi feito para não misturar refatoração grande com correção de segurança.
3. **Arquivos obsoletos do SQLite a remover:** `backend/src/database/tables/` e `backend/src/database/indices.ts` não são mais
   usados (estão fora da compilação, em `tsconfig.json`). A remoção foi bloqueada pela verificação de segurança do ambiente e deve
   ser feita manualmente: `git rm -r backend/src/database/tables backend/src/database/indices.ts`.
4. **Repositórios ainda usam SQL escrito à mão** (parametrizado); trocar pelo cliente do Prisma e converter as datas de texto em
   tipos de data do PostgreSQL são melhorias futuras.
5. **`npm audit`** (vulnerabilidades de dependências) não foi executado: exige rede.
6. **Front end** sem testes automatizados; **OCR real** e e-mail real testados só com simulações.
7. Achados **A-01** e **A-02** (seção 4c), a conferir com o calendário oficial.
