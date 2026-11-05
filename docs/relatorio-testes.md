# Relatório de testes — Notifica Vacinas

Gerado em 04/11/2026, 23:09:08 (America/São_Paulo) · commit `bfbcc3e` · Node v22.23.4

Gerado por `npm run test:relatorio` (backend). Não edite à mão: rode o comando para atualizar.

## Resumo

**558 de 558 testes passaram** · 0 falha(s) · 0 ignorado(s) · 37.9 s de execução.

| Categoria | Arquivos | Testes | Passaram | Falharam |
|---|---:|---:|---:|---:|
| Unitários | 6 | 87 | 87 | 0 |
| Integração | 5 | 38 | 38 | 0 |
| Funcional (ponta a ponta) | 1 | 63 | 63 | 0 |
| Lógica de negócio | 5 | 142 | 142 | 0 |
| Cenários e jornadas | 2 | 139 | 139 | 0 |
| Segurança | 2 | 47 | 47 | 0 |
| Arquitetura | 1 | 17 | 17 | 0 |
| **Total** | **23** | **558** | **558** | **0** |

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
| ✅ | casarVacina › reconhece todo nome do catálogo escrito por extenso | 10 ms |
| ✅ | casarVacina › ignora acentos e caixa | 3 ms |
| ✅ | casarVacina › entende abreviações comuns | 1 ms |
| ✅ | casarVacina › não confunde vacinas parecidas | 1 ms |
| ✅ | casarVacina › prefere o nome mais específico (pentavalente, não DTP) | 0 ms |
| ✅ | casarVacina › devolve null para o que não é vacina do catálogo | 0 ms |
| ✅ | extrairDatas › lê os formatos mais comuns | 1 ms |
| ✅ | extrairDatas › interpreta ano de 2 dígitos no século certo | 0 ms |
| ✅ | extrairDatas › rejeita datas impossíveis | 1 ms |
| ✅ | extrairDose › reconhece as formas usuais | 1 ms |
| ✅ | extrairDose › devolve null quando não há dose | 0 ms |
| ✅ | extrairDadosCarteirinha › lê uma tabela em Markdown (saída típica do Docling) | 6 ms |
| ✅ | extrairDadosCarteirinha › lê linhas soltas com rótulos | 2 ms |
| ✅ | extrairDadosCarteirinha › não confunde o nome da vacina com o lote (COVID-19, HPV4) | 1 ms |
| ✅ | extrairDadosCarteirinha › trata data futura como próxima dose, não como aplicação | 1 ms |
| ✅ | extrairDadosCarteirinha › não usa a data de nascimento como data de aplicação | 2 ms |
| ✅ | extrairDadosCarteirinha › devolve campos nulos quando o OCR não leu o que não existe | 1 ms |
| ✅ | extrairDadosCarteirinha › falha com mensagem clara quando não acha nenhuma vacina | 1 ms |
| ✅ | carteira do Meu SUS Digital › lê o titular da tabela de cabeçalho | 2 ms |
| ✅ | carteira do Meu SUS Digital › febre amarela: 'Dose Inicial' é a 1ª dose | 10 ms |
| ✅ | carteira do Meu SUS Digital › dT: 'Difteria e Tétano Adulto' com 'Revacinação' é reforço | 2 ms |
| ✅ | carteira do Meu SUS Digital › COVID-19 com marca e dose em fração (2/2) | 3 ms |
| ✅ | carteira do Meu SUS Digital › HPV: lote curto (L548) e 'Não informado' | 7 ms |
| ✅ | carteira do Meu SUS Digital › com várias linhas, devolve a mais recente | 6 ms |
| ✅ | carteira do Meu SUS Digital › lê TODAS as vacinas e doses de uma carteira do Meu SUS Digital (PDF lido pelo OCR) | 5 ms |

**`tests/unitarios/faixaEtaria.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | obterFaixaEtaria › respeita os limites do Calendário Nacional 2026 | 2 ms |

**`tests/unitarios/frequenciaAviso.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | frequenciaValida › aceita só as frequências conhecidas | 3 ms |
| ✅ | frequenciaValida › só diária, semanal e mensal são resumos periódicos | 1 ms |
| ✅ | deveEnviarResumo › nunca envia resumo em UMA_VEZ ou DESATIVADO | 0 ms |
| ✅ | deveEnviarResumo › sem envio anterior, envia | 0 ms |
| ✅ | deveEnviarResumo › diária: uma vez por dia | 1 ms |
| ✅ | deveEnviarResumo › semanal: só depois de 7 dias | 0 ms |
| ✅ | deveEnviarResumo › mensal: só depois de 1 mês (respeitando o fim do mês) | 1 ms |

**`tests/unitarios/proximasDoses.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | datas › soma meses sem estourar o fim do mês | 3 ms |
| ✅ | datas › soma dias e conta a diferença | 0 ms |
| ✅ | datas › conta a idade em meses completos | 0 ms |
| ✅ | bebê de 2 meses (nascido em 31/08/2026) › penta, VIP, rotavírus e pneumo 1ª dose vencem hoje (2 meses) | 2 ms |
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
| ✅ | reforço sem nenhuma dose registrada › bebê sem registro continua com a data de cada dose (BCG ao nascer atrasada) | 0 ms |
| ✅ | reforço sem nenhuma dose registrada › criança de 2 anos sem registro: reforços (DTP, VIP) viram 'atualizar o esquema' | 0 ms |
| ✅ | equivalências › a penta completa conta como hepatite B completa | 0 ms |
| ✅ | equivalências › DTP recente reinicia a contagem dos 10 anos do dT | 0 ms |
| ✅ | adulto e idoso › dT periódico atrasado mostra os dias de atraso | 0 ms |
| ✅ | adulto e idoso › SCR para trabalhador da saúde: 2 doses em qualquer idade | 0 ms |
| ✅ | adulto e idoso › idoso: influenza anual e covid semestral a partir da última dose | 0 ms |
| ✅ | adulto e idoso › sem nenhuma dose de uma vacina periódica: disponível agora | 0 ms |
| ✅ | ordenação › atrasadas primeiro, depois disponíveis, próximas e futuras | 3 ms |
| ✅ | dose já tomada x próxima dose (texto da tela) › dT: quem tomou a 3ª dose de reforço aos 14 anos tem como próxima a 4ª, e a tela sabe o nome da tomada | 0 ms |
| ✅ | dose já tomada x próxima dose (texto da tela) › sem dose tomada não há rótulo de dose tomada | 0 ms |
| ✅ | gestante › não recebe sugestão de vacinas de vírus vivo (febre amarela, tríplice viral, varicela, tetraviral) | 3 ms |
| ✅ | gestante › com 10 semanas: hepatite B, dT, influenza e COVID já; dTpa só na 20ª semana e VSR só na 28ª | 1 ms |
| ✅ | gestante › o dT da gestante (3 doses) substitui o reforço de adulto | 1 ms |
| ✅ | gestante › com 25 semanas o dTpa já pode ser tomado (não é atraso) e o VSR está chegando | 0 ms |
| ✅ | gestante › com 30 semanas o VSR também pode ser tomado | 0 ms |
| ✅ | gestante › dose de dTpa desta gestação quita; a de gestação anterior não conta | 0 ms |
| ✅ | gestante › COVID-19 a cada gestação: dose anterior ao início não conta; a de agora conta | 0 ms |
| ✅ | gestante › gestação encerrada (início há mais de 300 dias): volta ao calendário comum | 1 ms |
| ✅ | gestante › cadastro antigo sem data de início: dT e influenza valem; dTpa, VSR e COVID (dependem das semanas) não aparecem | 1 ms |
| ✅ | gestante › quem não é gestante não recebe nenhuma das regras da gestação | 0 ms |

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
| ✅ | tokens › gera código de verificação com 6 dígitos | 3 ms |

### Integração

Módulos isolados, cada arquivo em um schema PostgreSQL próprio: autenticação/sessões, avisos de dose, leitura (scan).

**`tests/integracao/auth.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | CSRF › recusa POST sem o cabeçalho de proteção | 40 ms |
| ✅ | CSRF › não exige o cabeçalho em GET | 5 ms |
| ✅ | sessões › login abre sessão com cookie de acesso e de refresh | 18 ms |
| ✅ | sessões › logout revoga a sessão: o token antigo para de funcionar na hora | 19 ms |
| ✅ | sessões › refresh rotaciona o token e detecta o reuso do antigo | 32 ms |
| ✅ | sessões › lista dispositivos e permite sair de todos | 30 ms |
| ✅ | sessões › não deixa encerrar a sessão de outro usuário | 25 ms |
| ✅ | bloqueio de conta › bloqueia após 5 falhas seguidas, mesmo com a senha certa | 33 ms |
| ✅ | recuperação de senha › troca a senha com link de uso único e derruba as sessões | 1104 ms |
| ✅ | recuperação de senha › responde igual para e-mail inexistente (sem enumeração de contas) | 14 ms |
| ✅ | recuperação de senha › recusa token inválido ou expirado | 3 ms |

**`tests/integracao/avisosDose.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | calendario_vacinal atualizado para 2026 › troca os dados antigos e registra a versão | 5 ms |
| ✅ | calendario_vacinal atualizado para 2026 › não repete a troca (nem apaga edições) quando a versão já está carregada | 8 ms |
| ✅ | aviso quando a dose está chegando › avisa uma única vez, mesmo rodando a verificação todo dia | 45 ms |
| ✅ | aviso quando a dose está chegando › não avisa quando a dose ainda está longe | 11 ms |
| ✅ | aviso quando a dose está chegando › se o e-mail falhar, tenta de novo na próxima verificação | 40 ms |
| ✅ | período da campanha › a dose traz a campanha da vacina (em andamento ou a próxima) | 6 ms |
| ✅ | período da campanha › escolherCampanha ignora campanhas encerradas e prefere a mais próxima | 0 ms |

**`tests/integracao/frequenciaAviso.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | escolha da frequência de aviso › o padrão é UMA_VEZ | 4 ms |
| ✅ | escolha da frequência de aviso › grava a frequência escolhida e recusa valor inválido | 8 ms |
| ✅ | envio conforme a frequência › DESATIVADO: nenhum aviso de dose | 29 ms |
| ✅ | envio conforme a frequência › DIARIA: manda um resumo por dia, e não duas vezes no mesmo dia | 32 ms |
| ✅ | envio conforme a frequência › SEMANAL: espera 7 dias entre os resumos | 39 ms |
| ✅ | envio conforme a frequência › MENSAL: só no mês seguinte | 24 ms |
| ✅ | envio conforme a frequência › se o e-mail falhar, não marca como enviado e tenta de novo | 33 ms |
| ✅ | envio conforme a frequência › UMA_VEZ continua avisando uma vez por dose (não manda resumo) | 17 ms |

**`tests/integracao/proximasDoses.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | ProximasDosesService (com o banco) › calcula a próxima dose e a data a partir das doses registradas | 31 ms |
| ✅ | ProximasDosesService (com o banco) › usa os grupos especiais da pessoa | 12 ms |
| ✅ | ProximasDosesService (com o banco) › o resumo do Dashboard só cobra o que já venceu e lista as próximas com data | 19 ms |

**`tests/integracao/scan.integracao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | POST /scan/analisar › lê a carteirinha: manda o arquivo ao OCR e extrai os campos | 52 ms |
| ✅ | POST /scan/analisar › aceita PDF | 9 ms |
| ✅ | POST /scan/analisar › recusa arquivo que não é imagem nem PDF, sem chamar o OCR | 3 ms |
| ✅ | POST /scan/analisar › recusa arquivo acima de 5 MB | 97 ms |
| ✅ | POST /scan/analisar › responde 503 quando o serviço de OCR está fora do ar | 7 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço não está rodando (conexão recusada) | 3 ms |
| ✅ | POST /scan/analisar › diz o motivo quando o serviço demora demais (modelos ainda carregando) | 4 ms |
| ✅ | POST /scan/analisar › explica quando o OCR não leu nenhum texto | 3 ms |
| ✅ | POST /scan/analisar › explica quando o texto lido não tem nenhuma vacina | 6 ms |

### Funcional (ponta a ponta)

App completo (CSRF, login, perfis, posse): usuários, pessoas, vacinas, carteira, agendamentos, dependentes, cascata e integridade do banco (PostgreSQL).

**`tests/funcional/sistemaCompleto.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | saúde e rotas básicas › GET / responde ONLINE | 6 ms |
| ✅ | saúde e rotas básicas › rota inexistente devolve 404 em JSON | 4 ms |
| ✅ | saúde e rotas básicas › envia cabeçalhos de segurança | 6 ms |
| ✅ | saúde e rotas básicas › /usuarios exige login | 4 ms |
| ✅ | saúde e rotas básicas › /pessoas exige login | 3 ms |
| ✅ | saúde e rotas básicas › /carteira/pessoa/1 exige login | 3 ms |
| ✅ | saúde e rotas básicas › /calendario exige login | 3 ms |
| ✅ | saúde e rotas básicas › /regras-vacinais exige login | 3 ms |
| ✅ | saúde e rotas básicas › /agendamentos exige login | 4 ms |
| ✅ | saúde e rotas básicas › /pendencias/1 exige login | 3 ms |
| ✅ | saúde e rotas básicas › /grupos-especiais exige login | 3 ms |
| ✅ | cadastro público e confirmação de e-mail › registra, bloqueia login sem confirmar e confirma com o código | 1139 ms |
| ✅ | cadastro público e confirmação de e-mail › recusa senha curta e e-mail inválido | 5 ms |
| ✅ | cadastro público e confirmação de e-mail › login com senha errada devolve 401 | 5 ms |
| ✅ | cadastro público e confirmação de e-mail › /auth/me devolve o usuário logado | 4 ms |
| ✅ | usuários (somente admin) › usuário comum não acessa /usuarios | 3 ms |
| ✅ | usuários (somente admin) › admin lista, busca, cria, atualiza e desativa | 391 ms |
| ✅ | usuários (somente admin) › listagem de usuários não vaza hash de senha | 3 ms |
| ✅ | usuários (somente admin) › recusa e-mail duplicado | 4 ms |
| ✅ | pessoas › cria e busca a própria pessoa | 4 ms |
| ✅ | pessoas › recusa pessoa sem nome ou sem data de nascimento | 5 ms |
| ✅ | pessoas › recusa frequência de aviso inválida | 3 ms |
| ✅ | pessoas › PUT parcial preserva os demais campos | 7 ms |
| ✅ | pessoas › usuário comum não lista todas as pessoas do sistema | 3 ms |
| ✅ | pessoas › não lê pessoa de outro usuário (IDOR) | 3 ms |
| ✅ | pessoas › não altera pessoa de outro usuário | 6 ms |
| ✅ | pessoas › não remove pessoa de outro usuário | 3 ms |
| ✅ | pessoas › ao criar pessoa, o usuario_id do corpo é ignorado: ela nasce na conta de quem pediu | 10 ms |
| ✅ | pessoas › não lista pessoas de outro usuário | 6 ms |
| ✅ | pessoas › admin acessa qualquer pessoa | 3 ms |
| ✅ | vacinas e calendário (catálogo) › lista vacinas publicamente e busca por id/código/nome | 9 ms |
| ✅ | vacinas e calendário (catálogo) › vacina inexistente devolve 404 | 2 ms |
| ✅ | vacinas e calendário (catálogo) › anônimo não cria vacina | 5 ms |
| ✅ | vacinas e calendário (catálogo) › usuário comum não cria, edita nem desativa vacina | 7 ms |
| ✅ | vacinas e calendário (catálogo) › admin cria, edita e desativa vacina | 15 ms |
| ✅ | vacinas e calendário (catálogo) › admin não cria vacina com código duplicado | 5 ms |
| ✅ | vacinas e calendário (catálogo) › calendário é legível por logados, mas só admin altera | 16 ms |
| ✅ | vacinas e calendário (catálogo) › regras vacinais: usuário comum 403, admin lista | 5 ms |
| ✅ | carteira vacinal › registra vacina, dose e lista a carteira | 24 ms |
| ✅ | carteira vacinal › recusa vacina e dose duplicadas | 7 ms |
| ✅ | carteira vacinal › não lê a carteira de outra pessoa | 3 ms |
| ✅ | carteira vacinal › não lê doses do registro de outro usuário | 6 ms |
| ✅ | carteira vacinal › não registra dose no registro de outro usuário | 3 ms |
| ✅ | carteira vacinal › não remove dose nem registro de outro usuário | 10 ms |
| ✅ | carteira vacinal › confirmar-scan grava o registro lido | 9 ms |
| ✅ | carteira vacinal › dono remove a própria dose e o próprio registro | 10 ms |
| ✅ | carteira vacinal › registro com pessoa inexistente falha | 4 ms |
| ✅ | agendamentos › cria, lista, atualiza status/observação e conta | 29 ms |
| ✅ | agendamentos › recusa status inválido | 3 ms |
| ✅ | agendamentos › usuário comum não cria agendamento para outra pessoa | 3 ms |
| ✅ | agendamentos › não vê, altera nem remove agendamento alheio | 13 ms |
| ✅ | agendamentos › listagem geral não vaza agendamentos de outros usuários | 3 ms |
| ✅ | agendamentos › dono remove o próprio agendamento | 4 ms |
| ✅ | pendências e próximas doses › devolve pendências e próximas doses da própria pessoa | 28 ms |
| ✅ | pendências e próximas doses › nega pendências de outra pessoa | 13 ms |
| ✅ | dependentes › cadastra, lista e remove vínculo | 26 ms |
| ✅ | dependentes › nega cadastrar dependente em pessoa alheia | 8 ms |
| ✅ | grupos especiais › lista catálogo, vincula, lista e desvincula | 18 ms |
| ✅ | sessões › lista sessões e encerra todas | 15 ms |
| ✅ | integridade do banco e remoções em cascata › remover registro apaga as doses dele | 59 ms |
| ✅ | integridade do banco e remoções em cascata › remover pessoa apaga carteira, agendamentos, grupos e vínculos | 45 ms |
| ✅ | integridade do banco e remoções em cascata › remover usuário apaga sessões, pessoas e dados dependentes | 43 ms |
| ✅ | integridade do banco e remoções em cascata › o banco recusa registro órfão (chaves estrangeiras ativas) | 3 ms |

### Lógica de negócio

Validação de entradas, idade e datas-limite (fuso, ano bissexto), pendências e próximas doses conforme as doses registradas, concorrência e idempotência.

**`tests/logica/datas.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | idadeEmAnos › a véspera do aniversário ainda não conta o ano | 3 ms |
| ✅ | idadeEmAnos › no dia do aniversário já conta | 1 ms |
| ✅ | idadeEmAnos › mês anterior e posterior ao aniversário | 0 ms |
| ✅ | idadeEmAnos › nascido em 29/02: em ano comum, completa em 01/03 | 1 ms |
| ✅ | idadeEmAnos › recém-nascido tem 0 anos; 11 meses e 29 dias também | 0 ms |
| ✅ | idadeEmAnos › ignora o horário se vier data completa | 0 ms |
| ✅ | hojeIso (dia civil de São Paulo) › 22h de 13/05 em Brasília ainda é dia 13, embora em UTC já seja dia 14 | 2 ms |
| ✅ | hojeIso (dia civil de São Paulo) › meio-dia em Brasília | 0 ms |
| ✅ | hojeIso (dia civil de São Paulo) › virada de ano | 1 ms |
| ✅ | VacinalService.calcularIdade (relógio do sistema) › não antecipa o aniversário, qualquer que seja o fuso da máquina | 2 ms |
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

**`tests/logica/gestante.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | vincular o grupo GESTANTE › exige o início da gestação | 5 ms |
| ✅ | vincular o grupo GESTANTE › recusa data inexistente, no futuro ou de mais de 42 semanas atrás | 4 ms |
| ✅ | vincular o grupo GESTANTE › grava o início e as próximas doses passam a usar as semanas de gestação | 22 ms |
| ✅ | vincular o grupo GESTANTE › vincular de novo atualiza o início (correção das semanas) | 9 ms |
| ✅ | vincular o grupo GESTANTE › outros grupos não pedem data | 3 ms |
| ✅ | catálogo › tem a vacina VSR (vírus sincicial respiratório) | 1 ms |

**`tests/logica/negocio.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | pendências e próximas doses › [LOG-01] adulto sem registros: pendente de Hepatite B e Febre Amarela, nada em dia | 37 ms |
| ✅ | pendências e próximas doses › [LOG-02] o esquema avança dose a dose (Hepatite B, 3 doses) e só então fica em dia | 83 ms |
| ✅ | pendências e próximas doses › [LOG-02b] vacina de dose única (Febre Amarela) fica em dia com uma dose | 35 ms |
| ✅ | pendências e próximas doses › [LOG-03] remover a dose devolve a vacina às pendências | 36 ms |
| ✅ | pendências e próximas doses › [LOG-04] bebê é criança e tem esquema de dose inicial pendente | 11 ms |
| ✅ | pendências e próximas doses › [LOG-05] próximas doses: toda dose devolvida tem vacina, número e status válidos | 11 ms |
| ✅ | pendências e próximas doses › [LOG-06] registrar a dose 1 faz a próxima dose da mesma vacina ser a 2 (nunca repete a 1) | 40 ms |
| ✅ | pendências e próximas doses › [LOG-07] quem faz 25 anos amanhã (Brasília) ainda é adolescente hoje, e adulto no dia | 24 ms |
| ✅ | pendências e próximas doses › [LOG-08] dependente tem as próprias pendências, visíveis só para o responsável | 19 ms |
| ✅ | concorrência e idempotência › [LOG-09] a mesma dose enviada 8 vezes ao mesmo tempo é gravada uma única vez | 65 ms |
| ✅ | concorrência e idempotência › [LOG-10] a mesma vacina registrada 8 vezes ao mesmo tempo cria um único registro | 52 ms |
| ✅ | concorrência e idempotência › [LOG-11] o mesmo grupo especial vinculado duas vezes não duplica | 26 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento futura | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento texto | 2 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento dd/mm/aaaa | 2 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento ano 1800 | 2 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-12] recusa data de nascimento 30 de fevereiro | 2 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-13] recusa e-mail inválido e atualização com nome vazio ou nascimento futuro | 11 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 0 sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose -1 sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 1.5 sem vazar erro do banco | 6 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose a sem vazar erro do banco | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose 99 sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-14] recusa número de dose null sem vazar erro do banco | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-15] nenhuma dose inválida foi gravada | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 2020-02-30 | 6 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento ontem | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 2026-13-01 | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento 31/12/2030 | 4 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-16] recusa data prevista de agendamento  | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-17] recusa dose de agendamento inválida e vacina inexistente | 6 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2099-01-01","parentesco":"filho"} é recusado | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2024-01-01","parentesco":"robô"} é recusado | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-18] dependente inválido {"data_nascimento":"2024-01-01","parentesco":"filho","email":"x"} é recusado | 3 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-19] parentesco com acento e caixa diferentes é aceito (como o front envia) | 17 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-20] confirmar-scan recusa data de aplicação futura ou impossível | 13 ms |
| ✅ | validação de dados pela API (COR-25) › [LOG-21] confirmar-scan aceita data válida passada | 7 ms |
| ✅ | cadastro público › [LOG-22] recusa data de nascimento inválida no cadastro | 2 ms |

**`tests/logica/validacao.api.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa data de aplicação que não é data | 11 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa data de aplicação inexistente (31/02) | 13 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa dose 'aplicada' no futuro | 5 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa aplicação anterior ao nascimento da pessoa | 6 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa número de dose absurdo | 8 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › recusa vacina vazia e campos gigantes | 8 ms |
| ✅ | datas e doses inválidas na carteira (confirmar-scan) › aceita um registro válido | 11 ms |
| ✅ | cadastro de pessoas › recusa nascimento no futuro, inválido ou ausente | 19 ms |
| ✅ | cadastro de pessoas › recusa nome vazio ou gigante | 8 ms |
| ✅ | cadastro de pessoas › atualização também valida o nascimento | 4 ms |
| ✅ | cadastro de pessoas › recusa e-mail malformado | 3 ms |
| ✅ | agendamentos › recusa data passada, inválida e número de dose inválido | 19 ms |
| ✅ | agendamentos › não cria dois agendamentos iguais (mesma vacina, dose e data) | 10 ms |
| ✅ | agendamentos › confirmar o mesmo agendamento duas vezes não duplica a dose | 21 ms |
| ✅ | dependentes › responsável não vira dependente de si mesmo | 7 ms |
| ✅ | dependentes › recusa parentesco inventado e nascimento no futuro | 3 ms |
| ✅ | robustez da API › JSON malformado devolve JSON 400, sem stack trace | 5 ms |
| ✅ | robustez da API › id não numérico não derruba o servidor | 2 ms |
| ✅ | robustez da API › injeção de SQL no id é tratada como dado | 3 ms |
| ✅ | cadastro e senha › recusa senha curta e e-mail inválido | 4 ms |
| ✅ | cadastro e senha › e-mail é único sem diferenciar maiúsculas de minúsculas | 374 ms |
| ✅ | cadastro e senha › login com e-mail em caixa diferente funciona | 9 ms |
| ✅ | cadastro e senha › não revela se o e-mail existe ao errar o login | 7 ms |
| ✅ | serviço de usuários (admin) › atualizar e-mail não permite o e-mail de outra conta nem e-mail inválido | 10 ms |

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
| ✅ | dataIsoExiste › recusa 2026-04-31 | 1 ms |
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
| ✅ | validarDataAplicacao › recusa futura, impossível e anterior ao nascimento | 1 ms |
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
| ✅ | validarNumeroDose › aceita 2 | 0 ms |
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
| ✅ | validarDadosPessoa › recusa e-mail inválido, estado com mais de 2 letras e textos longos | 2 ms |

### Cenários e jornadas

38 pessoas de idades, grupos e históricos diferentes (fronteiras do calendário, gestantes) e 12 jornadas completas de usuário, do cadastro ao aviso automático.

**`tests/cenarios/jornadas.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | jornada: Jovem de 22 anos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1316 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-02] completa os dados pessoais e as preferências | 35 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 6 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 1 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 52 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 69 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 79 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 939 ms |
| ✅ | jornada: Jovem de 22 anos › [JOR-09] sair encerra a sessão de vez | 12 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1203 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-02] completa os dados pessoais e as preferências | 11 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 58 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 24 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 28 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 87 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 793 ms |
| ✅ | jornada: Mãe de 34 anos com três filhos › [JOR-09] sair encerra a sessão de vez | 10 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1159 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-02] completa os dados pessoais e as preferências | 7 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 13 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 22 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-06] registra mais doses à mão e a situação vacinal avança | 26 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 42 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 801 ms |
| ✅ | jornada: Pai de 41 anos cuidando do pai idoso › [JOR-09] sair encerra a sessão de vez | 7 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1181 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-02] completa os dados pessoais e as preferências | 8 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 23 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 22 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 42 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 724 ms |
| ✅ | jornada: Idoso de 68 anos › [JOR-09] sair encerra a sessão de vez | 8 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1169 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-02] completa os dados pessoais e as preferências | 9 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 17 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 18 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 24 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 34 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 740 ms |
| ✅ | jornada: Gestante de 27 anos › [JOR-09] sair encerra a sessão de vez | 6 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1131 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-02] completa os dados pessoais e as preferências | 7 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 9 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 20 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 24 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 35 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 730 ms |
| ✅ | jornada: Trabalhador de saúde de 29 anos › [JOR-09] sair encerra a sessão de vez | 7 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1073 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-02] completa os dados pessoais e as preferências | 7 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 20 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-06] registra mais doses à mão e a situação vacinal avança | 26 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 32 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 717 ms |
| ✅ | jornada: Adolescente de 16 anos › [JOR-09] sair encerra a sessão de vez | 6 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1122 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-02] completa os dados pessoais e as preferências | 6 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 12 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 16 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-06] registra mais doses à mão e a situação vacinal avança | 18 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 31 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 722 ms |
| ✅ | jornada: Avó de 70 anos com neto de 5 meses › [JOR-09] sair encerra a sessão de vez | 5 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1062 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-02] completa os dados pessoais e as preferências | 6 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 20 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-06] registra mais doses à mão e a situação vacinal avança | 21 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 35 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 725 ms |
| ✅ | jornada: Usuária que desligou os e-mails › [JOR-09] sair encerra a sessão de vez | 6 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1069 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-02] completa os dados pessoais e as preferências | 7 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 17 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-06] registra mais doses à mão e a situação vacinal avança | 18 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 27 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 732 ms |
| ✅ | jornada: Usuário com aviso semanal › [JOR-09] sair encerra a sessão de vez | 6 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1076 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-02] completa os dados pessoais e as preferências | 8 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 12 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 16 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-06] registra mais doses à mão e a situação vacinal avança | 18 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 32 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 727 ms |
| ✅ | jornada: Casal: pessoa A (28 anos) › [JOR-09] sair encerra a sessão de vez | 5 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-01] cadastra-se, confirma o e-mail e entra (login só funciona depois da confirmação) | 1094 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-02] completa os dados pessoais e as preferências | 7 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-03] cadastra os dependentes e cada um tem a própria carteira, só visível para ele | 3 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-04] informa o grupo especial (gestante com semanas de gestação) | 0 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-05] lê a carteirinha por foto (OCR simulado), revisa e confirma: a dose entra na carteira | 16 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-06] registra mais doses à mão e a situação vacinal avança | 17 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-07] agenda uma vacina, não confirma antes da data, confirma no dia e cancela outra | 39 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-08] gerencia os dispositivos: lista, entra em outro e encerra todos | 758 ms |
| ✅ | jornada: Casal: pessoa B (30 anos) › [JOR-09] sair encerra a sessão de vez | 5 ms |
| ✅ | avisos automáticos para vários perfis ao mesmo tempo › [JOR-10] avisa só quem tem dose chegando, respeita quem desligou os e-mails e não repete no dia seguinte | 96 ms |
| ✅ | avisos automáticos para vários perfis ao mesmo tempo › [JOR-11] o aviso lista a dose certa, com os dias que faltam | 1 ms |
| ✅ | avisos automáticos para vários perfis ao mesmo tempo › [JOR-12] o registro de avisos enviados evita duplicar no banco | 2 ms |

**`tests/cenarios/personas.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-01] foram criadas todas as pessoas, cada uma em uma conta própria | 2 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-02] idade e faixa etária batem com a data de nascimento (incluindo as fronteiras) | 210 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-03] nenhuma vacina aparece ao mesmo tempo em dia e pendente, nem repetida | 198 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-04] contagens coerentes: 1 ≤ faltam ≤ necessárias − tomadas; em dia = tomadas ≥ necessárias | 192 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-05] próximas doses: status e dias para vencer seguem a data prevista; nada antes do nascimento | 168 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-06] cada vacina aparece no máximo uma vez nas próximas doses | 187 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-07] pendências (resumo) e próximas doses concordam: pendente = atrasada ou disponível | 346 ms |
| ✅ | regras gerais, válidas para todas as pessoas › [CEN-08] só aparecem vacinas do catálogo e ativas | 195 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-09] cada pessoa recebe as vacinas esperadas e nenhuma das proibidas para a sua situação | 240 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-09b] passada a janela do rotavírus (11 meses), a 1ª dose nunca é sugerida | 125 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-10] as datas previstas dos bebês seguem nascimento + idade recomendada | 78 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-11] gestante: dTpa na 20ª semana e VSR na 28ª; febre amarela e vacinas vivas nunca | 33 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-12] fronteira dos 60 anos: quem tem 59 anos e 364 dias ainda recebe febre amarela; aos 60, não | 8 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-13] fronteira dos 15 anos: HPV e dengue saem do esquema | 9 ms |
| ✅ | expectativas do Calendário Nacional 2026 por pessoa › [CEN-14] sarampo (tríplice viral): 25 a 29 anos duas doses; 30 a 59, dose única | 8 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-15] registrar a 1ª dose da penta faz a próxima ser a 2ª, na idade recomendada (4 meses) | 7 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-16] dose tomada com atraso empurra a seguinte: rotavírus 2ª = 1ª + 60 dias | 5 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-17] hepatite B de adulto: 2ª dose 30 dias depois da 1ª; 3ª ainda não é pedida | 8 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-18] influenza anual: próxima dose 12 meses depois da última | 4 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-19] dT de adulto: reforço 10 anos depois da última dose (já vencido? não: faltam ~9 anos) | 6 ms |
| ✅ | histórico de doses: a próxima dose respeita idade e intervalo › [CEN-20] a penta com a 1ª dose tomada aos 3 meses está EM DIA (a 2ª só vence aos 4) e não pendente | 11 ms |
| ✅ | isolamento entre as contas › [CEN-21] ninguém lê a carteira, as pendências nem as pessoas de outra conta (todos contra todos, amostra) | 213 ms |
| ✅ | isolamento entre as contas › [CEN-22] cada usuário só enxerga a própria pessoa na listagem | 25 ms |
| ✅ | isolamento entre as contas › [CEN-23] o administrador lê qualquer uma delas | 11 ms |
| ✅ | banco PostgreSQL: estrutura e remoção em cascata › [CEN-24] as 16 tabelas existem, com chaves estrangeiras e ON DELETE CASCADE nos dados dependentes | 26 ms |
| ✅ | banco PostgreSQL: estrutura e remoção em cascata › [CEN-25] os índices do esquema existem (únicos e de consulta) | 2 ms |
| ✅ | banco PostgreSQL: estrutura e remoção em cascata › [CEN-26] os dados de saúde ficaram gravados (registros e doses dos cenários com histórico) | 1 ms |
| ✅ | banco PostgreSQL: estrutura e remoção em cascata › [CEN-27] apagar uma conta apaga, em cascata, pessoas, carteira, doses, grupos e sessões — e só dela | 18 ms |

### Segurança

OWASP Top 10: sessão/JWT, controle de acesso, injeção, exposição de dados, cabeçalhos, CORS, erros.

**`tests/seguranca/autorizacao.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | rotas administrativas expostas › criar vacina exige login | 6 ms |
| ✅ | rotas administrativas expostas › usuário comum não cria vacina | 5 ms |
| ✅ | rotas administrativas expostas › usuário comum não altera nem desativa vacina | 7 ms |
| ✅ | rotas administrativas expostas › usuário comum não altera o calendário vacinal | 11 ms |
| ✅ | rotas administrativas expostas › administrador continua podendo gerir vacinas e calendário | 4 ms |
| ✅ | IDOR em /pessoas › outro usuário não lê os dados de uma pessoa alheia | 3 ms |
| ✅ | IDOR em /pessoas › outro usuário não altera nem remove uma pessoa alheia | 17 ms |
| ✅ | IDOR em /pessoas › listar pessoas não vaza as de outras contas | 7 ms |
| ✅ | IDOR em /pessoas › não cria pessoa em nome de outra conta | 12 ms |
| ✅ | IDOR em /pessoas › dono acessa a própria pessoa | 5 ms |
| ✅ | IDOR na carteira › não registra dose na carteira de outra pessoa | 4 ms |
| ✅ | IDOR na carteira › não lê nem conta as doses de um registro alheio | 6 ms |
| ✅ | IDOR na carteira › não remove dose nem registro alheios | 13 ms |
| ✅ | IDOR na carteira › o dono continua acessando | 5 ms |
| ✅ | IDOR em dependentes, grupos e pendências › não vê pendências, dependentes nem grupos de pessoa alheia | 16 ms |
| ✅ | IDOR em dependentes, grupos e pendências › não agenda vacina para pessoa alheia | 3 ms |

**`tests/seguranca/seguranca.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | A07 · Autenticação e sessão › [SEG-01] cookies de sessão são HttpOnly e SameSite | 8 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-02] token assinado com outro segredo é recusado | 4 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-03] token com algoritmo 'none' é recusado | 3 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-04] token expirado é recusado | 3 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-05] token válido, mas com perfil forjado, não vira admin (perfil vem da sessão) | 4 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-06] login não revela se o e-mail existe | 9 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-07] recuperação de senha responde igual para e-mail existente e inexistente | 9 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-08] bloqueio progressivo após várias senhas erradas | 42 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-09] cadastro público não aceita escolher o perfil (mass assignment) | 366 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-10] listagem de sessões não expõe o hash do refresh token | 7 ms |
| ✅ | A07 · Autenticação e sessão › [SEG-11] refresh token antigo reutilizado derruba a sessão (detecção de roubo) | 21 ms |
| ✅ | A01 · Controle de acesso › [SEG-12] usuário não transfere uma pessoa para outra conta (mass assignment em PUT) | 13 ms |
| ✅ | A01 · Controle de acesso › [SEG-13] usuário comum não se promove a admin | 5 ms |
| ✅ | A01 · Controle de acesso › [SEG-14] admin não pode remover nem desativar a si mesmo | 17 ms |
| ✅ | A01 · Controle de acesso › [SEG-15] usuário desativado perde o acesso na hora | 19 ms |
| ✅ | A01 · Controle de acesso › [SEG-16] dependente de outra conta não é acessível por vínculo forjado | 15 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/nome/' OR '1'='1 não vaza dados nem derruba | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/codigo/'; DROP TABLE vacinas;-- não vaza dados nem derruba | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-17] SQL injection em /vacinas/1 OR 1=1 não vaza dados nem derruba | 5 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-18] SQL injection no login é tratada como credencial inválida | 3 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-19] ids não numéricos devolvem erro de cliente, nunca 500 | 24 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-20] corpo JSON inválido devolve 400 sem vazar pilha de erro | 3 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-21] corpo acima do limite (10 MB) é recusado | 111 ms |
| ✅ | A03 · Injeção e entrada maliciosa › [SEG-22] scan recusa arquivo cujo conteúdo não é imagem/PDF, mesmo com tipo declarado | 5 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-23] respostas autenticadas não podem ser guardadas em cache (dados de saúde) | 16 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-24] cabeçalhos de segurança presentes e X-Powered-By ausente | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-25] CORS não libera origem desconhecida com credenciais | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-26] CORS libera a origem local do front end em desenvolvimento | 2 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-27] erro interno não vaza SQL nem caminho de arquivo | 3 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-28] nenhuma resposta de usuário contém hash de senha ou código de verificação | 8 ms |
| ✅ | A02/A05 · Exposição de dados e configuração › [SEG-29] proteção CSRF: toda escrita sem o cabeçalho é bloqueada | 6 ms |

### Arquitetura

Camadas, ciclos, SQL parametrizado, segredos e varredura de TODAS as rotas (login, perfil, CSRF).

**`tests/arquitetura/arquitetura.test.ts`**

| | Teste | Tempo |
|:-:|---|---:|
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-01] controllers não acessam repositórios nem o banco | 4 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-02] serviços não dependem de Express nem de controllers/rotas | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-03] repositórios não dependem de serviços, controllers, rotas ou Express | 1 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-04] rotas só usam controllers e middlewares (nada de banco/repositório/serviço) | 2 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-05] utilitários são puros (sem banco, repositório, serviço ou Express) | 1 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-06] só repositórios e o módulo de banco falam com o driver do PostgreSQL | 5 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-07] não há dependências circulares entre módulos | 7 ms |
| ✅ | Camadas (rotas → controllers → serviços → repositórios → banco) › [ARQ-08] o código compila em modo estrito (tsc --noEmit) | 4257 ms |
| ✅ | SQL e segredos › [ARQ-09] consultas SQL usam parâmetros (sem interpolar valores com ${}) | 3 ms |
| ✅ | SQL e segredos › [ARQ-10] não há segredos nem chaves de API gravados no código | 7 ms |
| ✅ | SQL e segredos › [ARQ-11] o log não imprime senha, token ou código de verificação | 4 ms |
| ✅ | SQL e segredos › [ARQ-12] o arquivo do banco e variáveis de ambiente não estão versionados | 6 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-13] o mapeamento encontrou as rotas do sistema | 0 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-14] toda rota não pública exige login (401 sem cookie) | 120 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-15] rotas administrativas recusam usuário comum (403) | 63 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-16] toda rota de escrita exige o cabeçalho anti-CSRF (403 sem ele) | 71 ms |
| ✅ | Cobertura de segurança de TODAS as rotas › [ARQ-17] nenhuma rota responde 500 a entrada vazia de usuário autenticado | 191 ms |

## Não coberto por esta suíte

- Leitura real por OCR (serviço Python/Docling) e envio real de e-mail: usados apenas com simulações.
- Interface React (sem framework de teste de front end configurado).
- Auditoria de vulnerabilidades de dependências (`npm audit`), que exige rede.
- Teste de carga e de desempenho sob volume real de dados.
