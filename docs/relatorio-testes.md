# Relatório de testes — Notifica Vacinas

Gerado em 03/11/2026, 20:36:36 (America/São_Paulo) · commit `586a214` · Node v22.23.4

Gerado por `npm run test:relatorio` (backend). Não edite à mão: rode o comando para atualizar.

## Resumo

**223 de 223 testes passaram** · 0 falha(s) · 0 ignorado(s) · 9.2 s de execução.

| Categoria | Arquivos | Testes | Passaram | Falharam |
|---|---:|---:|---:|---:|
| Unitários | 6 | 74 | 74 | 0 |
| Integração | 5 | 38 | 38 | 0 |
| Funcional (ponta a ponta) | 1 | 63 | 63 | 0 |
| Segurança | 1 | 31 | 31 | 0 |
| Arquitetura | 1 | 17 | 17 | 0 |
| **Total** | **14** | **223** | **223** | **0** |

## Falhas

Nenhuma falha nesta execução. As falhas encontradas durante o desenvolvimento e suas correções estão em [`correcoes.md`](correcoes.md).

## Resultado por categoria

### Unitários

Funções puras: extrator da carteirinha, faixa etária, próximas doses, frequência de aviso.

**`tests/unitarios/calendarioDerivado.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calendário por faixa derivado do esquema 2026 › criança: números de doses do calendário 2026 | 2 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › criança: vacinas que saíram do calendário não aparecem | 0 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › adolescente e jovem | 1 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › adulto e idoso | 1 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › varicela só aparece como grupo (trabalhador da saúde, indígena), não por faixa | 0 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › descreve as idades em cada dose | 0 ms |
| ✅ | calendário por faixa derivado do esquema 2026 › usa as faixas etárias do calendário | 1 ms |

**`tests/unitarios/extratorCarteirinha.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | casarVacina › reconhece todo nome do catálogo escrito por extenso | 15 ms |
| ✅ | casarVacina › ignora acentos e caixa | 1 ms |
| ✅ | casarVacina › entende abreviações comuns | 1 ms |
| ✅ | casarVacina › não confunde vacinas parecidas | 2 ms |
| ✅ | casarVacina › prefere o nome mais específico (pentavalente, não DTP) | 0 ms |
| ✅ | casarVacina › devolve null para o que não é vacina do catálogo | 0 ms |
| ✅ | extrairDatas › lê os formatos mais comuns | 1 ms |
| ✅ | extrairDatas › interpreta ano de 2 dígitos no século certo | 0 ms |
| ✅ | extrairDatas › rejeita datas impossíveis | 1 ms |
| ✅ | extrairDose › reconhece as formas usuais | 1 ms |
| ✅ | extrairDose › devolve null quando não há dose | 0 ms |
| ✅ | extrairDadosCarteirinha › lê uma tabela em Markdown (saída típica do Docling) | 12 ms |
| ✅ | extrairDadosCarteirinha › lê linhas soltas com rótulos | 4 ms |
| ✅ | extrairDadosCarteirinha › não confunde o nome da vacina com o lote (COVID-19, HPV4) | 1 ms |
| ✅ | extrairDadosCarteirinha › trata data futura como próxima dose, não como aplicação | 5 ms |
| ✅ | extrairDadosCarteirinha › não usa a data de nascimento como data de aplicação | 1 ms |
| ✅ | extrairDadosCarteirinha › devolve campos nulos quando o OCR não leu o que não existe | 1 ms |
| ✅ | extrairDadosCarteirinha › falha com mensagem clara quando não acha nenhuma vacina | 1 ms |
| ✅ | carteira do Meu SUS Digital › lê o titular da tabela de cabeçalho | 2 ms |
| ✅ | carteira do Meu SUS Digital › febre amarela: 'Dose Inicial' é a 1ª dose | 2 ms |
| ✅ | carteira do Meu SUS Digital › dT: 'Difteria e Tétano Adulto' com 'Revacinação' é reforço | 2 ms |
| ✅ | carteira do Meu SUS Digital › COVID-19 com marca e dose em fração (2/2) | 3 ms |
| ✅ | carteira do Meu SUS Digital › HPV: lote curto (L548) e 'Não informado' | 6 ms |
| ✅ | carteira do Meu SUS Digital › com várias linhas, devolve a mais recente | 3 ms |

**`tests/unitarios/faixaEtaria.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | obterFaixaEtaria › respeita os limites do Calendário Nacional 2026 | 2 ms |

**`tests/unitarios/frequenciaAviso.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | frequenciaValida › aceita só as frequências conhecidas | 2 ms |
| ✅ | frequenciaValida › só diária, semanal e mensal são resumos periódicos | 0 ms |
| ✅ | deveEnviarResumo › nunca envia resumo em UMA_VEZ ou DESATIVADO | 0 ms |
| ✅ | deveEnviarResumo › sem envio anterior, envia | 0 ms |
| ✅ | deveEnviarResumo › diária: uma vez por dia | 0 ms |
| ✅ | deveEnviarResumo › semanal: só depois de 7 dias | 0 ms |
| ✅ | deveEnviarResumo › mensal: só depois de 1 mês (respeitando o fim do mês) | 0 ms |

**`tests/unitarios/proximasDoses.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | datas › soma meses sem estourar o fim do mês | 2 ms |
| ✅ | datas › soma dias e conta a diferença | 0 ms |
| ✅ | datas › conta a idade em meses completos | 1 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › penta, VIP, rotavírus e pneumo 1ª dose vencem hoje (2 meses) | 1 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › o que era devido ao nascer e não consta está atrasado | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › meningocócica C: 1ª dose aos 3 meses = em 30 dias | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › doses distantes aparecem como futuras, com a data certa | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › influenza só entra a partir dos 6 meses | 0 ms |
| ✅ | intervalo mínimo entre doses › rotavírus: 2ª dose = a maior entre 4 meses e 1ª dose + 60 dias | 1 ms |
| ✅ | intervalo mínimo entre doses › não marca a dose antes da idade recomendada, mesmo com o intervalo cumprido | 1 ms |
| ✅ | intervalo mínimo entre doses › dose atrasada que foi tomada tarde empurra a seguinte (dT) | 1 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › dT: próxima (4ª) dose aos 24 anos, 10 anos depois da anterior no mínimo | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › o que não tem registro e vale 'conforme histórico' fica disponível agora | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › não cobra o que já foi cumprido nem o que passou da idade | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › não cobra varicela de quem não é trabalhador da saúde nem indígena | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › adulta sem dT: pode tomar agora, em vez de 'atrasada desde os 14 anos' | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › se há dose de DTP/penta (data de referência), segue a regra normal do reforço | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › bebê sem registro continua com a data de cada dose (BCG ao nascer atrasada) | 1 ms |
| ✅ | reforço sem nenhuma dose registrada › criança de 2 anos sem registro: reforços (DTP, VIP) viram 'atualizar o esquema' | 0 ms |
| ✅ | equivalências › a penta completa conta como hepatite B completa | 2 ms |
| ✅ | equivalências › DTP recente reinicia a contagem dos 10 anos do dT | 0 ms |
| ✅ | adulto e idoso › dT periódico atrasado mostra os dias de atraso | 0 ms |
| ✅ | adulto e idoso › SCR para trabalhador da saúde: 2 doses em qualquer idade | 0 ms |
| ✅ | adulto e idoso › idoso: influenza anual e covid semestral a partir da última dose | 0 ms |
| ✅ | adulto e idoso › sem nenhuma dose de uma vacina periódica: disponível agora | 0 ms |
| ✅ | ordenação › atrasadas primeiro, depois disponíveis, próximas e futuras | 1 ms |

**`tests/unitarios/seguranca.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calcularBloqueioMinutos › não bloqueia nas 4 primeiras falhas | 2 ms |
| ✅ | calcularBloqueioMinutos › dobra o bloqueio a cada falha a partir da 5ª | 0 ms |
| ✅ | calcularBloqueioMinutos › tem teto de 15 minutos | 0 ms |
| ✅ | detectarTipoImagem › reconhece JPEG, PNG e WEBP pelo conteúdo | 0 ms |
| ✅ | detectarTipoImagem › rejeita arquivos que se passam por imagem | 0 ms |
| ✅ | detectarTipoArquivoCarteirinha › aceita PDF além das imagens | 0 ms |
| ✅ | detectarTipoArquivoCarteirinha › rejeita o resto | 0 ms |
| ✅ | tokens › gera tokens únicos e o hash é determinístico | 1 ms |
| ✅ | tokens › gera código de verificação com 6 dígitos | 5 ms |

### Integração

Módulos isolados com banco em memória: autenticação/sessões, avisos de dose, leitura (scan).

**`tests/integracao/auth.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | CSRF › recusa POST sem o cabeçalho de proteção | 45 ms |
| ✅ | CSRF › não exige o cabeçalho em GET | 6 ms |
| ✅ | sessões › login abre sessão com cookie de acesso e de refresh | 18 ms |
| ✅ | sessões › logout revoga a sessão: o token antigo para de funcionar na hora | 29 ms |
| ✅ | sessões › refresh rotaciona o token e detecta o reuso do antigo | 37 ms |
| ✅ | sessões › lista dispositivos e permite sair de todos | 25 ms |
| ✅ | sessões › não deixa encerrar a sessão de outro usuário | 20 ms |
| ✅ | bloqueio de conta › bloqueia após 5 falhas seguidas, mesmo com a senha certa | 30 ms |
| ✅ | recuperação de senha › troca a senha com link de uso único e derruba as sessões | 1001 ms |
| ✅ | recuperação de senha › responde igual para e-mail inexistente (sem enumeração de contas) | 13 ms |
| ✅ | recuperação de senha › recusa token inválido ou expirado | 4 ms |

**`tests/integracao/avisosDose.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calendario_vacinal atualizado para 2026 › troca os dados antigos e registra a versão | 2 ms |
| ✅ | calendario_vacinal atualizado para 2026 › não repete a troca (nem apaga edições) quando a versão já está carregada | 4 ms |
| ✅ | aviso quando a dose está chegando › avisa uma única vez, mesmo rodando a verificação todo dia | 16 ms |
| ✅ | aviso quando a dose está chegando › não avisa quando a dose ainda está longe | 4 ms |
| ✅ | aviso quando a dose está chegando › se o e-mail falhar, tenta de novo na próxima verificação | 8 ms |
| ✅ | período da campanha › a dose traz a campanha da vacina (em andamento ou a próxima) | 2 ms |
| ✅ | período da campanha › escolherCampanha ignora campanhas encerradas e prefere a mais próxima | 0 ms |

**`tests/integracao/frequenciaAviso.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | escolha da frequência de aviso › o padrão é UMA_VEZ | 3 ms |
| ✅ | escolha da frequência de aviso › grava a frequência escolhida e recusa valor inválido | 4 ms |
| ✅ | envio conforme a frequência › DESATIVADO: nenhum aviso de dose | 16 ms |
| ✅ | envio conforme a frequência › DIARIA: manda um resumo por dia, e não duas vezes no mesmo dia | 13 ms |
| ✅ | envio conforme a frequência › SEMANAL: espera 7 dias entre os resumos | 20 ms |
| ✅ | envio conforme a frequência › MENSAL: só no mês seguinte | 18 ms |
| ✅ | envio conforme a frequência › se o e-mail falhar, não marca como enviado e tenta de novo | 9 ms |
| ✅ | envio conforme a frequência › UMA_VEZ continua avisando uma vez por dose (não manda resumo) | 23 ms |

**`tests/integracao/proximasDoses.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | ProximasDosesService (com o banco) › calcula a próxima dose e a data a partir das doses registradas | 11 ms |
| ✅ | ProximasDosesService (com o banco) › usa os grupos especiais da pessoa | 4 ms |
| ✅ | ProximasDosesService (com o banco) › o resumo do Dashboard só cobra o que já venceu e lista as próximas com data | 21 ms |

**`tests/integracao/scan.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | POST /scan/analisar › lê a carteirinha: manda o arquivo ao OCR e extrai os campos | 61 ms |
| ✅ | POST /scan/analisar › aceita PDF | 15 ms |
| ✅ | POST /scan/analisar › recusa arquivo que não é imagem nem PDF, sem chamar o OCR | 4 ms |
| ✅ | POST /scan/analisar › recusa arquivo acima de 5 MB | 150 ms |
| ✅ | POST /scan/analisar › responde 503 quando o serviço de OCR está fora do ar | 7 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço não está rodando (conexão recusada) | 4 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço demora demais (modelos ainda carregando) | 3 ms |
| ✅ | POST /scan/analisar › explica quando o OCR não leu nenhum texto | 3 ms |
| ✅ | POST /scan/analisar › explica quando o texto lido não tem nenhuma vacina | 9 ms |

### Funcional (ponta a ponta)

App completo (CSRF, login, perfis, posse): usuários, pessoas, vacinas, carteira, agendamentos, dependentes, cascata e integridade do banco.

**`tests/funcional/sistemaCompleto.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | saúde e rotas básicas › GET / responde ONLINE | 5 ms |
| ✅ | saúde e rotas básicas › rota inexistente devolve 404 em JSON | 4 ms |
| ✅ | saúde e rotas básicas › envia cabeçalhos de segurança | 5 ms |
| ✅ | saúde e rotas básicas › /usuarios exige login | 3 ms |
| ✅ | saúde e rotas básicas › /pessoas exige login | 3 ms |
| ✅ | saúde e rotas básicas › /carteira/pessoa/1 exige login | 3 ms |
| ✅ | saúde e rotas básicas › /calendario exige login | 3 ms |
| ✅ | saúde e rotas básicas › /regras-vacinais exige login | 3 ms |
| ✅ | saúde e rotas básicas › /agendamentos exige login | 4 ms |
| ✅ | saúde e rotas básicas › /pendencias/1 exige login | 3 ms |
| ✅ | saúde e rotas básicas › /grupos-especiais exige login | 3 ms |
| ✅ | cadastro público e confirmação de e-mail › registra, bloqueia login sem confirmar e confirma com o código | 870 ms |
| ✅ | cadastro público e confirmação de e-mail › recusa senha curta e e-mail inválido | 340 ms |
| ✅ | cadastro público e confirmação de e-mail › login com senha errada devolve 401 | 6 ms |
| ✅ | cadastro público e confirmação de e-mail › /auth/me devolve o usuário logado | 4 ms |
| ✅ | usuários (somente admin) › usuário comum não acessa /usuarios | 3 ms |
| ✅ | usuários (somente admin) › admin lista, busca, cria, atualiza e desativa | 358 ms |
| ✅ | usuários (somente admin) › listagem de usuários não vaza hash de senha | 3 ms |
| ✅ | usuários (somente admin) › recusa e-mail duplicado | 3 ms |
| ✅ | pessoas › cria e busca a própria pessoa | 4 ms |
| ✅ | pessoas › recusa pessoa sem nome ou sem data de nascimento | 6 ms |
| ✅ | pessoas › recusa frequência de aviso inválida | 4 ms |
| ✅ | pessoas › PUT parcial preserva os demais campos | 6 ms |
| ✅ | pessoas › usuário comum não lista todas as pessoas do sistema | 3 ms |
| ✅ | pessoas › não lê pessoa de outro usuário (IDOR) | 2 ms |
| ✅ | pessoas › não altera pessoa de outro usuário | 6 ms |
| ✅ | pessoas › não remove pessoa de outro usuário | 3 ms |
| ✅ | pessoas › não cria pessoa em nome de outro usuário | 3 ms |
| ✅ | pessoas › não lista pessoas de outro usuário | 6 ms |
| ✅ | pessoas › admin acessa qualquer pessoa | 3 ms |
| ✅ | vacinas e calendário (catálogo) › lista vacinas publicamente e busca por id/código/nome | 10 ms |
| ✅ | vacinas e calendário (catálogo) › vacina inexistente devolve 404 | 2 ms |
| ✅ | vacinas e calendário (catálogo) › anônimo não cria vacina | 3 ms |
| ✅ | vacinas e calendário (catálogo) › usuário comum não cria, edita nem desativa vacina | 10 ms |
| ✅ | vacinas e calendário (catálogo) › admin cria, edita e desativa vacina | 22 ms |
| ✅ | vacinas e calendário (catálogo) › admin não cria vacina com código duplicado | 6 ms |
| ✅ | vacinas e calendário (catálogo) › calendário é legível por logados, mas só admin altera | 49 ms |
| ✅ | vacinas e calendário (catálogo) › regras vacinais: usuário comum 403, admin lista | 9 ms |
| ✅ | carteira vacinal › registra vacina, dose e lista a carteira | 47 ms |
| ✅ | carteira vacinal › recusa vacina e dose duplicadas | 10 ms |
| ✅ | carteira vacinal › não lê a carteira de outra pessoa | 6 ms |
| ✅ | carteira vacinal › não lê doses do registro de outro usuário | 19 ms |
| ✅ | carteira vacinal › não registra dose no registro de outro usuário | 4 ms |
| ✅ | carteira vacinal › não remove dose nem registro de outro usuário | 13 ms |
| ✅ | carteira vacinal › confirmar-scan grava o registro lido | 9 ms |
| ✅ | carteira vacinal › dono remove a própria dose e o próprio registro | 15 ms |
| ✅ | carteira vacinal › registro com pessoa inexistente falha | 4 ms |
| ✅ | agendamentos › cria, lista, atualiza status/observação e conta | 42 ms |
| ✅ | agendamentos › recusa status inválido | 4 ms |
| ✅ | agendamentos › usuário comum não cria agendamento para outra pessoa | 3 ms |
| ✅ | agendamentos › não vê, altera nem remove agendamento alheio | 10 ms |
| ✅ | agendamentos › listagem geral não vaza agendamentos de outros usuários | 3 ms |
| ✅ | agendamentos › dono remove o próprio agendamento | 3 ms |
| ✅ | pendências e próximas doses › devolve pendências e próximas doses da própria pessoa | 18 ms |
| ✅ | pendências e próximas doses › nega pendências de outra pessoa | 5 ms |
| ✅ | dependentes › cadastra, lista e remove vínculo | 20 ms |
| ✅ | dependentes › nega cadastrar dependente em pessoa alheia | 3 ms |
| ✅ | grupos especiais › lista catálogo, vincula, lista e desvincula | 14 ms |
| ✅ | sessões › lista sessões e encerra todas | 14 ms |
| ✅ | integridade do banco e remoções em cascata › remover registro apaga as doses dele | 48 ms |
| ✅ | integridade do banco e remoções em cascata › remover pessoa apaga carteira, agendamentos, grupos e vínculos | 34 ms |
| ✅ | integridade do banco e remoções em cascata › remover usuário apaga sessões, pessoas e dados dependentes | 44 ms |
| ✅ | integridade do banco e remoções em cascata › o banco recusa registro órfão (chaves estrangeiras ativas) | 7 ms |

### Segurança

OWASP Top 10: sessão/JWT, controle de acesso, injeção, exposição de dados, cabeçalhos, CORS, erros.

**`tests/seguranca/seguranca.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | A07 · Autenticação e sessão › [SEG-01] cookies de sessão são HttpOnly e SameSite | 8 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-02] token assinado com outro segredo é recusado | 4 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-03] token com algoritmo 'none' é recusado | 3 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-04] token expirado é recusado | 4 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-05] token válido, mas com perfil forjado, não vira admin (perfil vem da sessão) | 5 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-06] login não revela se o e-mail existe | 13 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-07] recuperação de senha responde igual para e-mail existente e inexistente | 11 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-08] bloqueio progressivo após várias senhas erradas | 40 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-09] cadastro público não aceita escolher o perfil (mass assignment) | 343 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-10] listagem de sessões não expõe o hash do refresh token | 4 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-11] refresh token antigo reutilizado derruba a sessão (detecção de roubo) | 13 ms |
| ✅ | A01 · Controle de acesso › [SEG-12] usuário não transfere uma pessoa para outra conta (mass assignment em PUT) | 19 ms |
| ✅ | A01 · Controle de acesso › [SEG-13] usuário comum não se promove a admin | 4 ms |
| ✅ | A01 · Controle de acesso › [SEG-14] admin não pode remover nem desativar a si mesmo | 13 ms |
| ✅ | A01 · Controle de acesso › [SEG-15] usuário desativado perde o acesso na hora | 18 ms |
| ✅ | A01 · Controle de acesso › [SEG-16] dependente de outra conta não é acessível por vínculo forjado | 9 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/nome/' OR '1'='1 não vaza dados nem derruba | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/codigo/'; DROP TABLE vacinas;-- não vaza dados nem derruba | 6 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/1 OR 1=1 não vaza dados nem derruba | 4 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-18] SQL injection no login é tratada como credencial inválida | 3 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-19] ids não numéricos devolvem erro de cliente, nunca 500 | 10 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-20] corpo JSON inválido devolve 400 sem vazar pilha de erro | 4 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-21] corpo acima do limite (10 MB) é recusado | 163 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-22] scan recusa arquivo cujo conteúdo não é imagem/PDF, mesmo com tipo declarado | 4 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-23] respostas autenticadas não podem ser guardadas em cache (dados de saúde) | 8 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-24] cabeçalhos de segurança presentes e X-Powered-By ausente | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-25] CORS não libera origem desconhecida com credenciais | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-26] CORS libera a origem local do front end em desenvolvimento | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-27] erro interno não vaza SQL nem caminho de arquivo | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-28] nenhuma resposta de usuário contém hash de senha ou código de verificação | 11 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-29] proteção CSRF: toda escrita sem o cabeçalho é bloqueada | 8 ms |

### Arquitetura

Camadas, ciclos, SQL parametrizado, segredos e varredura de TODAS as rotas (login, perfil, CSRF).

**`tests/arquitetura/arquitetura.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-01] controllers não acessam repositórios nem o banco | 3 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-02] serviços não dependem de Express nem de controllers/rotas | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-03] repositórios não dependem de serviços, controllers, rotas ou Express | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-04] rotas só usam controllers e middlewares (nada de banco/repositório/serviço) | 1 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-05] utilitários são puros (sem banco, repositório, serviço ou Express) | 4 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-06] só repositórios, banco e seeds falam com o driver SQLite | 13 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-07] não há dependências circulares entre módulos | 23 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-08] o código compila em modo estrito (tsc --noEmit) | 3959 ms |
| ✅ | SQL e segredos › [ARQ-09] consultas SQL usam parâmetros (sem interpolar valores com ${}) | 2 ms |
| ✅ | SQL e segredos › [ARQ-10] não há segredos nem chaves de API gravados no código | 5 ms |
| ✅ | SQL e segredos › [ARQ-11] o log não imprime senha, token ou código de verificação | 2 ms |
| ✅ | SQL e segredos › [ARQ-12] o arquivo do banco e variáveis de ambiente não estão versionados | 7 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-13] o mapeamento encontrou as rotas do sistema | 0 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-14] toda rota não pública exige login (401 sem cookie) | 119 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-15] rotas administrativas recusam usuário comum (403) | 53 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-16] toda rota de escrita exige o cabeçalho anti-CSRF (403 sem ele) | 64 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-17] nenhuma rota responde 500 a entrada vazia de usuário autenticado | 139 ms |

## Não coberto por esta suíte

- Leitura real por OCR (serviço Python/Docling) e envio real de e-mail: usados apenas com simulações.
- Interface React (sem framework de teste de front end configurado).
- Auditoria de vulnerabilidades de dependências (`npm audit`), que exige rede.
- Teste de carga e de desempenho sob volume real de dados.
