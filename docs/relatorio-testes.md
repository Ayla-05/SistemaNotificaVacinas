# Relatório de testes — Notifica Vacinas

Gerado em 03/11/2026, 21:55:33 (America/São_Paulo) · commit `e13c8ad` · Node v22.23.4

Gerado por `npm run test:relatorio` (backend). Não edite à mão: rode o comando para atualizar.

## Resumo

**375 de 375 testes passaram** · 0 falha(s) · 0 ignorado(s) · 10.1 s de execução.

| Categoria | Arquivos | Testes | Passaram | Falharam |
|---|---:|---:|---:|---:|
| Unitários | 6 | 75 | 75 | 0 |
| Integração | 5 | 38 | 38 | 0 |
| Funcional (ponta a ponta) | 1 | 63 | 63 | 0 |
| Lógica de negócio | 4 | 135 | 135 | 0 |
| Segurança | 2 | 47 | 47 | 0 |
| Arquitetura | 1 | 17 | 17 | 0 |
| **Total** | **19** | **375** | **375** | **0** |

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
| ✅ | calendário por faixa derivado do esquema 2026 › usa as faixas etárias do calendário | 0 ms |

**`tests/unitarios/extratorCarteirinha.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | casarVacina › reconhece todo nome do catálogo escrito por extenso | 13 ms |
| ✅ | casarVacina › ignora acentos e caixa | 1 ms |
| ✅ | casarVacina › entende abreviações comuns | 1 ms |
| ✅ | casarVacina › não confunde vacinas parecidas | 1 ms |
| ✅ | casarVacina › prefere o nome mais específico (pentavalente, não DTP) | 0 ms |
| ✅ | casarVacina › devolve null para o que não é vacina do catálogo | 0 ms |
| ✅ | extrairDatas › lê os formatos mais comuns | 1 ms |
| ✅ | extrairDatas › interpreta ano de 2 dígitos no século certo | 0 ms |
| ✅ | extrairDatas › rejeita datas impossíveis | 0 ms |
| ✅ | extrairDose › reconhece as formas usuais | 1 ms |
| ✅ | extrairDose › devolve null quando não há dose | 0 ms |
| ✅ | extrairDadosCarteirinha › lê uma tabela em Markdown (saída típica do Docling) | 7 ms |
| ✅ | extrairDadosCarteirinha › lê linhas soltas com rótulos | 2 ms |
| ✅ | extrairDadosCarteirinha › não confunde o nome da vacina com o lote (COVID-19, HPV4) | 1 ms |
| ✅ | extrairDadosCarteirinha › trata data futura como próxima dose, não como aplicação | 9 ms |
| ✅ | extrairDadosCarteirinha › não usa a data de nascimento como data de aplicação | 1 ms |
| ✅ | extrairDadosCarteirinha › devolve campos nulos quando o OCR não leu o que não existe | 1 ms |
| ✅ | extrairDadosCarteirinha › falha com mensagem clara quando não acha nenhuma vacina | 2 ms |
| ✅ | carteira do Meu SUS Digital › lê o titular da tabela de cabeçalho | 3 ms |
| ✅ | carteira do Meu SUS Digital › febre amarela: 'Dose Inicial' é a 1ª dose | 2 ms |
| ✅ | carteira do Meu SUS Digital › dT: 'Difteria e Tétano Adulto' com 'Revacinação' é reforço | 2 ms |
| ✅ | carteira do Meu SUS Digital › COVID-19 com marca e dose em fração (2/2) | 2 ms |
| ✅ | carteira do Meu SUS Digital › HPV: lote curto (L548) e 'Não informado' | 5 ms |
| ✅ | carteira do Meu SUS Digital › com várias linhas, devolve a mais recente | 4 ms |
| ✅ | carteira do Meu SUS Digital › lê TODAS as vacinas e doses de uma carteira do Meu SUS Digital (PDF lido pelo OCR) | 8 ms |

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
| ✅ | datas › conta a idade em meses completos | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › penta, VIP, rotavírus e pneumo 1ª dose vencem hoje (2 meses) | 2 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › o que era devido ao nascer e não consta está atrasado | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › meningocócica C: 1ª dose aos 3 meses = em 30 dias | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › doses distantes aparecem como futuras, com a data certa | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › influenza só entra a partir dos 6 meses | 0 ms |
| ✅ | intervalo mínimo entre doses › rotavírus: 2ª dose = a maior entre 4 meses e 1ª dose + 60 dias | 1 ms |
| ✅ | intervalo mínimo entre doses › não marca a dose antes da idade recomendada, mesmo com o intervalo cumprido | 0 ms |
| ✅ | intervalo mínimo entre doses › dose atrasada que foi tomada tarde empurra a seguinte (dT) | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › dT: próxima (4ª) dose aos 24 anos, 10 anos depois da anterior no mínimo | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › o que não tem registro e vale 'conforme histórico' fica disponível agora | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › não cobra o que já foi cumprido nem o que passou da idade | 0 ms |
| ✅ | jovem de 21 anos (nascida em 20/06/2005) › não cobra varicela de quem não é trabalhador da saúde nem indígena | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › adulta sem dT: pode tomar agora, em vez de 'atrasada desde os 14 anos' | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › se há dose de DTP/penta (data de referência), segue a regra normal do reforço | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › bebê sem registro continua com a data de cada dose (BCG ao nascer atrasada) | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › criança de 2 anos sem registro: reforços (DTP, VIP) viram 'atualizar o esquema' | 0 ms |
| ✅ | equivalências › a penta completa conta como hepatite B completa | 3 ms |
| ✅ | equivalências › DTP recente reinicia a contagem dos 10 anos do dT | 0 ms |
| ✅ | adulto e idoso › dT periódico atrasado mostra os dias de atraso | 0 ms |
| ✅ | adulto e idoso › SCR para trabalhador da saúde: 2 doses em qualquer idade | 0 ms |
| ✅ | adulto e idoso › idoso: influenza anual e covid semestral a partir da última dose | 0 ms |
| ✅ | adulto e idoso › sem nenhuma dose de uma vacina periódica: disponível agora | 0 ms |
| ✅ | ordenação › atrasadas primeiro, depois disponíveis, próximas e futuras | 0 ms |

**`tests/unitarios/seguranca.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calcularBloqueioMinutos › não bloqueia nas 4 primeiras falhas | 2 ms |
| ✅ | calcularBloqueioMinutos › dobra o bloqueio a cada falha a partir da 5ª | 1 ms |
| ✅ | calcularBloqueioMinutos › tem teto de 15 minutos | 0 ms |
| ✅ | detectarTipoImagem › reconhece JPEG, PNG e WEBP pelo conteúdo | 1 ms |
| ✅ | detectarTipoImagem › rejeita arquivos que se passam por imagem | 0 ms |
| ✅ | detectarTipoArquivoCarteirinha › aceita PDF além das imagens | 0 ms |
| ✅ | detectarTipoArquivoCarteirinha › rejeita o resto | 0 ms |
| ✅ | tokens › gera tokens únicos e o hash é determinístico | 1 ms |
| ✅ | tokens › gera código de verificação com 6 dígitos | 4 ms |

### Integração

Módulos isolados com banco em memória: autenticação/sessões, avisos de dose, leitura (scan).

**`tests/integracao/auth.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | CSRF › recusa POST sem o cabeçalho de proteção | 44 ms |
| ✅ | CSRF › não exige o cabeçalho em GET | 6 ms |
| ✅ | sessões › login abre sessão com cookie de acesso e de refresh | 20 ms |
| ✅ | sessões › logout revoga a sessão: o token antigo para de funcionar na hora | 30 ms |
| ✅ | sessões › refresh rotaciona o token e detecta o reuso do antigo | 29 ms |
| ✅ | sessões › lista dispositivos e permite sair de todos | 23 ms |
| ✅ | sessões › não deixa encerrar a sessão de outro usuário | 21 ms |
| ✅ | bloqueio de conta › bloqueia após 5 falhas seguidas, mesmo com a senha certa | 35 ms |
| ✅ | recuperação de senha › troca a senha com link de uso único e derruba as sessões | 1151 ms |
| ✅ | recuperação de senha › responde igual para e-mail inexistente (sem enumeração de contas) | 11 ms |
| ✅ | recuperação de senha › recusa token inválido ou expirado | 5 ms |

**`tests/integracao/avisosDose.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calendario_vacinal atualizado para 2026 › troca os dados antigos e registra a versão | 3 ms |
| ✅ | calendario_vacinal atualizado para 2026 › não repete a troca (nem apaga edições) quando a versão já está carregada | 7 ms |
| ✅ | aviso quando a dose está chegando › avisa uma única vez, mesmo rodando a verificação todo dia | 12 ms |
| ✅ | aviso quando a dose está chegando › não avisa quando a dose ainda está longe | 4 ms |
| ✅ | aviso quando a dose está chegando › se o e-mail falhar, tenta de novo na próxima verificação | 9 ms |
| ✅ | período da campanha › a dose traz a campanha da vacina (em andamento ou a próxima) | 2 ms |
| ✅ | período da campanha › escolherCampanha ignora campanhas encerradas e prefere a mais próxima | 0 ms |

**`tests/integracao/frequenciaAviso.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | escolha da frequência de aviso › o padrão é UMA_VEZ | 3 ms |
| ✅ | escolha da frequência de aviso › grava a frequência escolhida e recusa valor inválido | 4 ms |
| ✅ | envio conforme a frequência › DESATIVADO: nenhum aviso de dose | 10 ms |
| ✅ | envio conforme a frequência › DIARIA: manda um resumo por dia, e não duas vezes no mesmo dia | 13 ms |
| ✅ | envio conforme a frequência › SEMANAL: espera 7 dias entre os resumos | 11 ms |
| ✅ | envio conforme a frequência › MENSAL: só no mês seguinte | 13 ms |
| ✅ | envio conforme a frequência › se o e-mail falhar, não marca como enviado e tenta de novo | 20 ms |
| ✅ | envio conforme a frequência › UMA_VEZ continua avisando uma vez por dose (não manda resumo) | 7 ms |

**`tests/integracao/proximasDoses.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | ProximasDosesService (com o banco) › calcula a próxima dose e a data a partir das doses registradas | 8 ms |
| ✅ | ProximasDosesService (com o banco) › usa os grupos especiais da pessoa | 3 ms |
| ✅ | ProximasDosesService (com o banco) › o resumo do Dashboard só cobra o que já venceu e lista as próximas com data | 22 ms |

**`tests/integracao/scan.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | POST /scan/analisar › lê a carteirinha: manda o arquivo ao OCR e extrai os campos | 51 ms |
| ✅ | POST /scan/analisar › aceita PDF | 8 ms |
| ✅ | POST /scan/analisar › recusa arquivo que não é imagem nem PDF, sem chamar o OCR | 4 ms |
| ✅ | POST /scan/analisar › recusa arquivo acima de 5 MB | 105 ms |
| ✅ | POST /scan/analisar › responde 503 quando o serviço de OCR está fora do ar | 7 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço não está rodando (conexão recusada) | 3 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço demora demais (modelos ainda carregando) | 3 ms |
| ✅ | POST /scan/analisar › explica quando o OCR não leu nenhum texto | 3 ms |
| ✅ | POST /scan/analisar › explica quando o texto lido não tem nenhuma vacina | 7 ms |

### Funcional (ponta a ponta)

App completo (CSRF, login, perfis, posse): usuários, pessoas, vacinas, carteira, agendamentos, dependentes, cascata e integridade do banco.

**`tests/funcional/sistemaCompleto.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | saúde e rotas básicas › GET / responde ONLINE | 4 ms |
| ✅ | saúde e rotas básicas › rota inexistente devolve 404 em JSON | 3 ms |
| ✅ | saúde e rotas básicas › envia cabeçalhos de segurança | 4 ms |
| ✅ | saúde e rotas básicas › /usuarios exige login | 3 ms |
| ✅ | saúde e rotas básicas › /pessoas exige login | 3 ms |
| ✅ | saúde e rotas básicas › /carteira/pessoa/1 exige login | 2 ms |
| ✅ | saúde e rotas básicas › /calendario exige login | 2 ms |
| ✅ | saúde e rotas básicas › /regras-vacinais exige login | 2 ms |
| ✅ | saúde e rotas básicas › /agendamentos exige login | 2 ms |
| ✅ | saúde e rotas básicas › /pendencias/1 exige login | 2 ms |
| ✅ | saúde e rotas básicas › /grupos-especiais exige login | 2 ms |
| ✅ | cadastro público e confirmação de e-mail › registra, bloqueia login sem confirmar e confirma com o código | 955 ms |
| ✅ | cadastro público e confirmação de e-mail › recusa senha curta e e-mail inválido | 10 ms |
| ✅ | cadastro público e confirmação de e-mail › login com senha errada devolve 401 | 8 ms |
| ✅ | cadastro público e confirmação de e-mail › /auth/me devolve o usuário logado | 5 ms |
| ✅ | usuários (somente admin) › usuário comum não acessa /usuarios | 3 ms |
| ✅ | usuários (somente admin) › admin lista, busca, cria, atualiza e desativa | 354 ms |
| ✅ | usuários (somente admin) › listagem de usuários não vaza hash de senha | 3 ms |
| ✅ | usuários (somente admin) › recusa e-mail duplicado | 3 ms |
| ✅ | pessoas › cria e busca a própria pessoa | 3 ms |
| ✅ | pessoas › recusa pessoa sem nome ou sem data de nascimento | 7 ms |
| ✅ | pessoas › recusa frequência de aviso inválida | 8 ms |
| ✅ | pessoas › PUT parcial preserva os demais campos | 6 ms |
| ✅ | pessoas › usuário comum não lista todas as pessoas do sistema | 9 ms |
| ✅ | pessoas › não lê pessoa de outro usuário (IDOR) | 7 ms |
| ✅ | pessoas › não altera pessoa de outro usuário | 14 ms |
| ✅ | pessoas › não remove pessoa de outro usuário | 7 ms |
| ✅ | pessoas › ao criar pessoa, o usuario_id do corpo é ignorado: ela nasce na conta de quem pediu | 18 ms |
| ✅ | pessoas › não lista pessoas de outro usuário | 5 ms |
| ✅ | pessoas › admin acessa qualquer pessoa | 3 ms |
| ✅ | vacinas e calendário (catálogo) › lista vacinas publicamente e busca por id/código/nome | 9 ms |
| ✅ | vacinas e calendário (catálogo) › vacina inexistente devolve 404 | 2 ms |
| ✅ | vacinas e calendário (catálogo) › anônimo não cria vacina | 2 ms |
| ✅ | vacinas e calendário (catálogo) › usuário comum não cria, edita nem desativa vacina | 7 ms |
| ✅ | vacinas e calendário (catálogo) › admin cria, edita e desativa vacina | 15 ms |
| ✅ | vacinas e calendário (catálogo) › admin não cria vacina com código duplicado | 7 ms |
| ✅ | vacinas e calendário (catálogo) › calendário é legível por logados, mas só admin altera | 24 ms |
| ✅ | vacinas e calendário (catálogo) › regras vacinais: usuário comum 403, admin lista | 12 ms |
| ✅ | carteira vacinal › registra vacina, dose e lista a carteira | 26 ms |
| ✅ | carteira vacinal › recusa vacina e dose duplicadas | 12 ms |
| ✅ | carteira vacinal › não lê a carteira de outra pessoa | 4 ms |
| ✅ | carteira vacinal › não lê doses do registro de outro usuário | 7 ms |
| ✅ | carteira vacinal › não registra dose no registro de outro usuário | 5 ms |
| ✅ | carteira vacinal › não remove dose nem registro de outro usuário | 19 ms |
| ✅ | carteira vacinal › confirmar-scan grava o registro lido | 11 ms |
| ✅ | carteira vacinal › dono remove a própria dose e o próprio registro | 11 ms |
| ✅ | carteira vacinal › registro com pessoa inexistente falha | 5 ms |
| ✅ | agendamentos › cria, lista, atualiza status/observação e conta | 47 ms |
| ✅ | agendamentos › recusa status inválido | 6 ms |
| ✅ | agendamentos › usuário comum não cria agendamento para outra pessoa | 3 ms |
| ✅ | agendamentos › não vê, altera nem remove agendamento alheio | 12 ms |
| ✅ | agendamentos › listagem geral não vaza agendamentos de outros usuários | 4 ms |
| ✅ | agendamentos › dono remove o próprio agendamento | 7 ms |
| ✅ | pendências e próximas doses › devolve pendências e próximas doses da própria pessoa | 13 ms |
| ✅ | pendências e próximas doses › nega pendências de outra pessoa | 11 ms |
| ✅ | dependentes › cadastra, lista e remove vínculo | 17 ms |
| ✅ | dependentes › nega cadastrar dependente em pessoa alheia | 3 ms |
| ✅ | grupos especiais › lista catálogo, vincula, lista e desvincula | 16 ms |
| ✅ | sessões › lista sessões e encerra todas | 15 ms |
| ✅ | integridade do banco e remoções em cascata › remover registro apaga as doses dele | 36 ms |
| ✅ | integridade do banco e remoções em cascata › remover pessoa apaga carteira, agendamentos, grupos e vínculos | 30 ms |
| ✅ | integridade do banco e remoções em cascata › remover usuário apaga sessões, pessoas e dados dependentes | 53 ms |
| ✅ | integridade do banco e remoções em cascata › o banco recusa registro órfão (chaves estrangeiras ativas) | 8 ms |

### Lógica de negócio

Validação de entradas, idade e datas-limite (fuso, ano bissexto), pendências e próximas doses conforme as doses registradas, concorrência e idempotência.

**`tests/logica/datas.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | idadeEmAnos › a véspera do aniversário ainda não conta o ano | 2 ms |
| ✅ | idadeEmAnos › no dia do aniversário já conta | 0 ms |
| ✅ | idadeEmAnos › mês anterior e posterior ao aniversário | 0 ms |
| ✅ | idadeEmAnos › nascido em 29/02: em ano comum, completa em 01/03 | 0 ms |
| ✅ | idadeEmAnos › recém-nascido tem 0 anos; 11 meses e 29 dias também | 0 ms |
| ✅ | idadeEmAnos › ignora o horário se vier data completa | 0 ms |
| ✅ | hojeIso (dia civil de São Paulo) › 22h de 13/05 em Brasília ainda é dia 13, embora em UTC já seja dia 14 | 2 ms |
| ✅ | hojeIso (dia civil de São Paulo) › meio-dia em Brasília | 0 ms |
| ✅ | hojeIso (dia civil de São Paulo) › virada de ano | 1 ms |
| ✅ | VacinalService.calcularIdade (relógio do sistema) › não antecipa o aniversário, qualquer que seja o fuso da máquina | 1 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 0 anos → CRIANCA | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 9 anos → CRIANCA | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 10 anos → ADOLESCENTE | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 24 anos → ADOLESCENTE | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 25 anos → ADULTO | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 59 anos → ADULTO | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 60 anos → IDOSO | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › 110 anos → IDOSO | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › quem faz 25 anos amanhã ainda é adolescente hoje | 0 ms |
| ✅ | faixa etária nas fronteiras (Calendário Nacional 2026) › quem faz 60 anos amanhã ainda é adulto hoje | 0 ms |

**`tests/logica/negocio.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | pendências e próximas doses › [LOG-01] adulto sem registros: pendente de Hepatite B e Febre Amarela, nada em dia | 16 ms |
| ✅ | pendências e próximas doses › [LOG-02] o esquema avança dose a dose (Hepatite B, 3 doses) e só então fica em dia | 70 ms |
| ✅ | pendências e próximas doses › [LOG-02b] vacina de dose única (Febre Amarela) fica em dia com uma dose | 30 ms |
| ✅ | pendências e próximas doses › [LOG-03] remover a dose devolve a vacina às pendências | 43 ms |
| ✅ | pendências e próximas doses › [LOG-04] bebê é criança e tem esquema de dose inicial pendente | 8 ms |
| ✅ | pendências e próximas doses › [LOG-05] próximas doses: toda dose devolvida tem vacina, número e status válidos | 9 ms |
| ✅ | pendências e próximas doses › [LOG-06] registrar a dose 1 faz a próxima dose da mesma vacina ser a 2 (nunca repete a 1) | 21 ms |
| ✅ | pendências e próximas doses › [LOG-07] quem faz 25 anos amanhã (Brasília) ainda é adolescente hoje, e adulto no dia | 16 ms |
| ✅ | pendências e próximas doses › [LOG-08] dependente tem as próprias pendências, visíveis só para o responsável | 14 ms |
| ✅ | concorrência e idempotência › [LOG-09] a mesma dose enviada 8 vezes ao mesmo tempo é gravada uma única vez | 32 ms |
| ✅ | concorrência e idempotência › [LOG-10] a mesma vacina registrada 8 vezes ao mesmo tempo cria um único registro | 30 ms |
| ✅ | concorrência e idempotência › [LOG-11] o mesmo grupo especial vinculado duas vezes não duplica | 48 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento futura | 7 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento texto | 10 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento dd/mm/aaaa | 5 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento ano 1800 | 5 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento 30 de fevereiro | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-13] recusa e-mail inválido e atualização com nome vazio ou nascimento futuro | 18 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 0 sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose -1 sem vazar erro do banco | 7 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 1.5 sem vazar erro do banco | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose a sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 99 sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose null sem vazar erro do banco | 10 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-15] nenhuma dose inválida foi gravada | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 2020-02-30 | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento ontem | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 2026-13-01 | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 31/12/2030 | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento  | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-17] recusa dose de agendamento inválida e vacina inexistente | 6 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2099-01-01","parentesco":"filho"} é recusado | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2024-01-01","parentesco":"robô"} é recusado | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2024-01-01","parentesco":"filho","email":"x"} é recusado | 9 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-19] parentesco com acento e caixa diferentes é aceito (como o front envia) | 22 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-20] confirmar-scan recusa data de aplicação futura ou impossível | 12 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-21] confirmar-scan aceita data válida passada | 4 ms |
| ✅ | cadastro público › [LOG-22] recusa data de nascimento inválida no cadastro | 6 ms |

**`tests/logica/validacao.api.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa data de aplicação que não é data | 13 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa data de aplicação inexistente (31/02) | 7 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa dose 'aplicada' no futuro | 6 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa aplicação anterior ao nascimento da pessoa | 7 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa número de dose absurdo | 7 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa vacina vazia e campos gigantes | 10 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › aceita um registro válido | 10 ms |
| ✅ | cadastro de pessoas › recusa nascimento no futuro, inválido ou ausente | 18 ms |
| ✅ | cadastro de pessoas › recusa nome vazio ou gigante | 11 ms |
| ✅ | cadastro de pessoas › atualização também valida o nascimento | 5 ms |
| ✅ | cadastro de pessoas › recusa e-mail malformado | 4 ms |
| ✅ | agendamentos › recusa data passada, inválida e número de dose inválido | 22 ms |
| ✅ | agendamentos › não cria dois agendamentos iguais (mesma vacina, dose e data) | 9 ms |
| ✅ | agendamentos › confirmar o mesmo agendamento duas vezes não duplica a dose | 20 ms |
| ✅ | dependentes › responsável não vira dependente de si mesmo | 6 ms |
| ✅ | dependentes › recusa parentesco inventado e nascimento no futuro | 4 ms |
| ✅ | robustez da API › JSON malformado devolve JSON 400, sem stack trace | 4 ms |
| ✅ | robustez da API › id não numérico não derruba o servidor | 3 ms |
| ✅ | robustez da API › injeção de SQL no id é tratada como dado | 3 ms |
| ✅ | cadastro e senha › recusa senha curta e e-mail inválido | 6 ms |
| ✅ | cadastro e senha › e-mail é único sem diferenciar maiúsculas de minúsculas | 373 ms |
| ✅ | cadastro e senha › login com e-mail em caixa diferente funciona | 21 ms |
| ✅ | cadastro e senha › não revela se o e-mail existe ao errar o login | 15 ms |

**`tests/logica/validacao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | dataIsoExiste › aceita 2026-11-03 | 2 ms |
| ✅ | dataIsoExiste › aceita 2000-02-29 | 0 ms |
| ✅ | dataIsoExiste › aceita 1990-12-31 | 0 ms |
| ✅ | dataIsoExiste › recusa 2026-02-29 | 0 ms |
| ✅ | dataIsoExiste › recusa 2023-02-29 | 0 ms |
| ✅ | dataIsoExiste › recusa 2020-02-30 | 0 ms |
| ✅ | dataIsoExiste › recusa 2026-13-01 | 0 ms |
| ✅ | dataIsoExiste › recusa 2026-00-10 | 0 ms |
| ✅ | dataIsoExiste › recusa 2026-04-31 | 0 ms |
| ✅ | dataIsoExiste › recusa 14/05/1990 | 0 ms |
| ✅ | dataIsoExiste › recusa 1990-5-14 | 0 ms |
| ✅ | dataIsoExiste › recusa abc | 0 ms |
| ✅ | dataIsoExiste › recusa  | 0 ms |
| ✅ | dataIsoExiste › recusa 2026-11-03T10:00:00 | 0 ms |
| ✅ | dataIsoExiste › recusa null | 0 ms |
| ✅ | dataIsoExiste › recusa undefined | 0 ms |
| ✅ | dataIsoExiste › recusa 20261103 | 0 ms |
| ✅ | validarDataNascimento › aceita recém-nascido, hoje e idoso | 0 ms |
| ✅ | validarDataNascimento › recusa data no futuro, ano anterior a 1900 e formato inválido | 1 ms |
| ✅ | validarDataAplicacao › aceita hoje e data posterior ao nascimento | 0 ms |
| ✅ | validarDataAplicacao › recusa futura, impossível e anterior ao nascimento | 0 ms |
| ✅ | hojeLocalISO (dia civil de São Paulo, COR-26) › 01h UTC do dia 4 ainda é dia 3 em Brasília | 0 ms |
| ✅ | emailValido e normalizarEmail › aceita a@b.co | 0 ms |
| ✅ | emailValido e normalizarEmail › aceita ayla.pedroga@gmail.com | 0 ms |
| ✅ | emailValido e normalizarEmail › aceita x+tag@dominio.com.br | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa  | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa sem-arroba | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa a@b | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa a@@b.com | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa a b@c.com | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa @b.com | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa a@.com | 0 ms |
| ✅ | emailValido e normalizarEmail › recusa e-mail com mais de 254 caracteres | 0 ms |
| ✅ | emailValido e normalizarEmail › normaliza espaços e caixa | 0 ms |
| ✅ | validarNumeroDose › aceita 1 | 0 ms |
| ✅ | validarNumeroDose › aceita 2 | 0 ms |
| ✅ | validarNumeroDose › aceita 3 | 0 ms |
| ✅ | validarNumeroDose › aceita 20 | 0 ms |
| ✅ | validarNumeroDose › aceita 2 | 3 ms |
| ✅ | validarNumeroDose › recusa 0 | 0 ms |
| ✅ | validarNumeroDose › recusa -1 | 0 ms |
| ✅ | validarNumeroDose › recusa 21 | 0 ms |
| ✅ | validarNumeroDose › recusa 99 | 0 ms |
| ✅ | validarNumeroDose › recusa 1.5 | 0 ms |
| ✅ | validarNumeroDose › recusa NaN | 0 ms |
| ✅ | validarNumeroDose › recusa Infinity | 0 ms |
| ✅ | validarNumeroDose › recusa a | 0 ms |
| ✅ | validarNumeroDose › recusa null | 0 ms |
| ✅ | validarNumeroDose › recusa undefined | 0 ms |
| ✅ | validarTexto › devolve o texto sem espaços nas pontas e aceita ausente quando opcional | 0 ms |
| ✅ | validarTexto › recusa obrigatório vazio, tipo errado e texto longo | 0 ms |
| ✅ | validarDadosPessoa › aceita cadastro completo e atualização parcial | 0 ms |
| ✅ | validarDadosPessoa › na criação exige nome e nascimento; na atualização recusa nome vazio | 0 ms |
| ✅ | validarDadosPessoa › recusa e-mail inválido, estado com mais de 2 letras e textos longos | 0 ms |

### Segurança

OWASP Top 10: sessão/JWT, controle de acesso, injeção, exposição de dados, cabeçalhos, CORS, erros.

**`tests/seguranca/autorizacao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | rotas administrativas expostas › criar vacina exige login | 6 ms |
| ✅ | rotas administrativas expostas › usuário comum não cria vacina | 5 ms |
| ✅ | rotas administrativas expostas › usuário comum não altera nem desativa vacina | 6 ms |
| ✅ | rotas administrativas expostas › usuário comum não altera o calendário vacinal | 11 ms |
| ✅ | rotas administrativas expostas › administrador continua podendo gerir vacinas e calendário | 3 ms |
| ✅ | IDOR em /pessoas › outro usuário não lê os dados de uma pessoa alheia | 3 ms |
| ✅ | IDOR em /pessoas › outro usuário não altera nem remove uma pessoa alheia | 10 ms |
| ✅ | IDOR em /pessoas › listar pessoas não vaza as de outras contas | 3 ms |
| ✅ | IDOR em /pessoas › não cria pessoa em nome de outra conta | 11 ms |
| ✅ | IDOR em /pessoas › dono acessa a própria pessoa | 3 ms |
| ✅ | IDOR na carteira › não registra dose na carteira de outra pessoa | 3 ms |
| ✅ | IDOR na carteira › não lê nem conta as doses de um registro alheio | 7 ms |
| ✅ | IDOR na carteira › não remove dose nem registro alheios | 10 ms |
| ✅ | IDOR na carteira › o dono continua acessando | 4 ms |
| ✅ | IDOR em dependentes, grupos e pendências › não vê pendências, dependentes nem grupos de pessoa alheia | 10 ms |
| ✅ | IDOR em dependentes, grupos e pendências › não agenda vacina para pessoa alheia | 3 ms |

**`tests/seguranca/seguranca.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | A07 · Autenticação e sessão › [SEG-01] cookies de sessão são HttpOnly e SameSite | 8 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-02] token assinado com outro segredo é recusado | 9 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-03] token com algoritmo 'none' é recusado | 5 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-04] token expirado é recusado | 5 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-05] token válido, mas com perfil forjado, não vira admin (perfil vem da sessão) | 5 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-06] login não revela se o e-mail existe | 7 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-07] recuperação de senha responde igual para e-mail existente e inexistente | 8 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-08] bloqueio progressivo após várias senhas erradas | 35 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-09] cadastro público não aceita escolher o perfil (mass assignment) | 351 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-10] listagem de sessões não expõe o hash do refresh token | 5 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-11] refresh token antigo reutilizado derruba a sessão (detecção de roubo) | 23 ms |
| ✅ | A01 · Controle de acesso › [SEG-12] usuário não transfere uma pessoa para outra conta (mass assignment em PUT) | 9 ms |
| ✅ | A01 · Controle de acesso › [SEG-13] usuário comum não se promove a admin | 6 ms |
| ✅ | A01 · Controle de acesso › [SEG-14] admin não pode remover nem desativar a si mesmo | 18 ms |
| ✅ | A01 · Controle de acesso › [SEG-15] usuário desativado perde o acesso na hora | 16 ms |
| ✅ | A01 · Controle de acesso › [SEG-16] dependente de outra conta não é acessível por vínculo forjado | 13 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/nome/' OR '1'='1 não vaza dados nem derruba | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/codigo/'; DROP TABLE vacinas;-- não vaza dados nem derruba | 9 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/1 OR 1=1 não vaza dados nem derruba | 4 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-18] SQL injection no login é tratada como credencial inválida | 4 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-19] ids não numéricos devolvem erro de cliente, nunca 500 | 16 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-20] corpo JSON inválido devolve 400 sem vazar pilha de erro | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-21] corpo acima do limite (10 MB) é recusado | 400 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-22] scan recusa arquivo cujo conteúdo não é imagem/PDF, mesmo com tipo declarado | 6 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-23] respostas autenticadas não podem ser guardadas em cache (dados de saúde) | 14 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-24] cabeçalhos de segurança presentes e X-Powered-By ausente | 3 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-25] CORS não libera origem desconhecida com credenciais | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-26] CORS libera a origem local do front end em desenvolvimento | 3 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-27] erro interno não vaza SQL nem caminho de arquivo | 4 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-28] nenhuma resposta de usuário contém hash de senha ou código de verificação | 18 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-29] proteção CSRF: toda escrita sem o cabeçalho é bloqueada | 13 ms |

### Arquitetura

Camadas, ciclos, SQL parametrizado, segredos e varredura de TODAS as rotas (login, perfil, CSRF).

**`tests/arquitetura/arquitetura.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-01] controllers não acessam repositórios nem o banco | 3 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-02] serviços não dependem de Express nem de controllers/rotas | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-03] repositórios não dependem de serviços, controllers, rotas ou Express | 3 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-04] rotas só usam controllers e middlewares (nada de banco/repositório/serviço) | 5 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-05] utilitários são puros (sem banco, repositório, serviço ou Express) | 1 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-06] só repositórios, banco e seeds falam com o driver SQLite | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-07] não há dependências circulares entre módulos | 7 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-08] o código compila em modo estrito (tsc --noEmit) | 3445 ms |
| ✅ | SQL e segredos › [ARQ-09] consultas SQL usam parâmetros (sem interpolar valores com ${}) | 2 ms |
| ✅ | SQL e segredos › [ARQ-10] não há segredos nem chaves de API gravados no código | 5 ms |
| ✅ | SQL e segredos › [ARQ-11] o log não imprime senha, token ou código de verificação | 5 ms |
| ✅ | SQL e segredos › [ARQ-12] o arquivo do banco e variáveis de ambiente não estão versionados | 6 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-13] o mapeamento encontrou as rotas do sistema | 0 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-14] toda rota não pública exige login (401 sem cookie) | 137 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-15] rotas administrativas recusam usuário comum (403) | 76 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-16] toda rota de escrita exige o cabeçalho anti-CSRF (403 sem ele) | 89 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-17] nenhuma rota responde 500 a entrada vazia de usuário autenticado | 223 ms |

## Não coberto por esta suíte

- Leitura real por OCR (serviço Python/Docling) e envio real de e-mail: usados apenas com simulações.
- Interface React (sem framework de teste de front end configurado).
- Auditoria de vulnerabilidades de dependências (`npm audit`), que exige rede.
- Teste de carga e de desempenho sob volume real de dados.
