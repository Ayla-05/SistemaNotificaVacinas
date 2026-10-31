---
title: "NOTIFICA VACINAS: SISTEMA WEB PARA GESTÃO DA CARTEIRA VACINAL E NOTIFICAÇÃO DE DOSES PENDENTES"
author: "Ayla Pedroga Rossi"
date: "Guarulhos, 2026"
lang: pt-BR
---

**FACULDADE DE TECNOLOGIA DE GUARULHOS**

**CURSO SUPERIOR DE TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS**

AYLA PEDROGA ROSSI

**NOTIFICA VACINAS: SISTEMA WEB PARA GESTÃO DA CARTEIRA VACINAL E NOTIFICAÇÃO DE DOSES PENDENTES**

Trabalho de Graduação apresentado à Faculdade de Tecnologia de Guarulhos como requisito parcial para a obtenção do título de Tecnólogo em Análise e Desenvolvimento de Sistemas.

Orientador(a): [nome do(a) orientador(a)]

Guarulhos, 2026

\newpage

# RESUMO

A imunização é uma das intervenções de saúde pública com melhor relação entre custo e benefício já registradas, e o Brasil construiu, por meio do Programa Nacional de Imunizações (PNI), um dos maiores programas públicos de vacinação do mundo. Apesar disso, a última década foi marcada pela queda das coberturas vacinais, pelo retorno de doenças que estavam sob controle e por um problema cotidiano e pouco discutido: o cidadão não sabe, com precisão, quais vacinas e quais doses estão em atraso para si e para seus dependentes, pois o controle ainda depende de cadernetas de papel, frequentemente extraviadas ou ilegíveis. Este trabalho apresenta o *Notifica Vacinas*, um sistema web que permite ao usuário manter a carteira vacinal própria e a de seus dependentes, comparar essa carteira com o calendário vacinal por faixa etária e por grupo especial, e receber notificações por e-mail sobre doses pendentes e agendamentos próximos. O sistema foi desenvolvido com uma arquitetura cliente-servidor em camadas: interface em React, interface de programação (API) REST em Node.js com Express e TypeScript, persistência em SQLite e um *job* agendado para o envio das notificações. Como diferencial, a carteirinha física pode ser fotografada e seus dados são extraídos por reconhecimento óptico de caracteres (OCR) com a biblioteca Docling, em um serviço próprio, sendo sempre submetidos à confirmação do usuário antes de serem gravados. O trabalho descreve o referencial teórico, os requisitos, o projeto, a implementação, as decisões de segurança e de proteção de dados pessoais de saúde (LGPD), as limitações da versão atual e as melhorias futuras, entre as quais a integração com o Meu SUS Digital e com convênios e hospitais para atualização automática da carteira.

**Palavras-chave:** vacinação; Programa Nacional de Imunizações; carteira vacinal; notificações; engenharia de software; LGPD.

\newpage

# ABSTRACT

Immunization is among the most cost-effective public health interventions ever recorded, and Brazil built, through its National Immunization Program (PNI), one of the largest public vaccination programs in the world. Even so, the last decade saw falling vaccination coverage, the return of diseases that were under control, and an everyday problem that receives little attention: citizens often cannot tell precisely which vaccines and doses are overdue for themselves and their dependents, because record keeping still relies on paper booklets that are lost or illegible. This work presents *Notifica Vacinas*, a web system that lets users keep their own vaccination record and that of their dependents, compare it with the vaccination schedule by age group and special group, and receive e-mail notifications about pending doses and upcoming appointments. The system follows a layered client-server architecture: a React front end, a REST API in Node.js with Express and TypeScript, SQLite persistence and a scheduled job for notifications. As a differentiator, the physical vaccination card can be photographed and its data extracted by optical character recognition (OCR) with the Docling library, in a self-hosted service, always subject to user confirmation before being saved. The work describes the theoretical background, requirements, design, implementation, security and personal health data protection decisions (LGPD), limitations of the current version and future work, including integration with Meu SUS Digital and with health insurers and hospitals for automatic record updates.

**Keywords:** vaccination; National Immunization Program; vaccination record; notifications; software engineering; data protection.

\newpage

# LISTA DE SIGLAS

| Sigla | Significado |
|---|---|
| ABNT | Associação Brasileira de Normas Técnicas |
| ADS | Análise e Desenvolvimento de Sistemas |
| API | *Application Programming Interface* (interface de programação de aplicações) |
| CORS | *Cross-Origin Resource Sharing* |
| CRUD | *Create, Read, Update, Delete* |
| FHIR | *Fast Healthcare Interoperability Resources* |
| HTTP | *Hypertext Transfer Protocol* |
| IDOR | *Insecure Direct Object Reference* |
| JSON | *JavaScript Object Notation* |
| JWT | *JSON Web Token* |
| LGPD | Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) |
| MVC | *Model-View-Controller* |
| ODS | Objetivos de Desenvolvimento Sustentável |
| OMS | Organização Mundial da Saúde |
| ONU | Organização das Nações Unidas |
| PNI | Programa Nacional de Imunizações |
| RNDS | Rede Nacional de Dados em Saúde |
| REST | *Representational State Transfer* |
| SI-PNI | Sistema de Informação do Programa Nacional de Imunizações |
| SMTP | *Simple Mail Transfer Protocol* |
| SUS | Sistema Único de Saúde |
| UNICEF | Fundo das Nações Unidas para a Infância |

\newpage

# 1 INTRODUÇÃO

## 1.1 Contextualização

Poucas tecnologias em saúde tiveram o impacto da vacina. A varíola, que matou centenas de milhões de pessoas ao longo da história, foi declarada erradicada pela Organização Mundial da Saúde em 1980. A poliomielite, que deixava milhares de crianças com paralisia permanente, está reduzida a pouquíssimos países com circulação do vírus selvagem. No Brasil, o último caso de poliomielite por poliovírus selvagem foi registrado em 1989 e a certificação da eliminação regional veio em 1994 (BRASIL, [s.d.]). Esses resultados não são obra do acaso: decorrem de programas organizados, financiados e sustentados por décadas de adesão da população.

O Programa Nacional de Imunizações foi instituído em 1973 e regulamentado pela Lei nº 6.259, de 30 de outubro de 1975, que prevê a organização das ações de vigilância epidemiológica e o caráter obrigatório das vacinações definidas pelo Ministério da Saúde. Com a criação do Sistema Único de Saúde, o PNI ganhou capilaridade e passou a ofertar gratuitamente um dos calendários mais amplos do mundo. A obrigatoriedade da vacinação de crianças também está presente no Estatuto da Criança e do Adolescente (Lei nº 8.069/1990).

Entretanto, desde meados da década de 2010 o país vem registrando queda nas coberturas vacinais. Em 2019, o Brasil perdeu a certificação de país livre do sarampo e, somente em 2024, voltou a receber o reconhecimento da Organização Pan-Americana da Saúde (OPAS). Relatórios do UNICEF e da OMS sobre cobertura de imunização apontam que a pandemia de COVID-19 agravou a situação em escala global, aumentando o número de crianças "dose zero", isto é, que não receberam sequer a primeira dose da vacina contra difteria, tétano e coqueluche. Estudos de instituições como a Universidade de São Paulo (USP) e iniciativas do UNICEF no Brasil apontam, entre as causas, fatores como a desinformação, a falsa sensação de segurança gerada pelo próprio sucesso das vacinas, a dificuldade de acesso a unidades de saúde em horários compatíveis com o trabalho e o esquecimento das datas de reforço.

Há ainda um fator operacional que recebe menos atenção do que a desinformação: a **gestão pessoal da informação vacinal**. Um adulto precisa lembrar quais reforços (como dT e dTpa) tomou e quando; uma gestante precisa de vacinas específicas em semanas específicas; um responsável por três crianças e um idoso precisa acompanhar quatro calendários distintos. A caderneta de papel, ainda o principal registro, é frágil e não emite alertas.

## 1.2 Problema de pesquisa

Como um sistema de informação de baixo custo, acessível pelo navegador, pode ajudar o cidadão a **conhecer a situação da própria carteira vacinal e a de seus dependentes** e a **ser lembrado, de forma proativa, de doses pendentes e agendamentos próximos**?

## 1.3 Objetivos

### 1.3.1 Objetivo geral

Desenvolver o *Notifica Vacinas*, um sistema web para registro da carteira vacinal individual e de dependentes, verificação de pendências com base no calendário vacinal e envio de notificações aos usuários.

### 1.3.2 Objetivos específicos

a) levantar o contexto da vacinação no Brasil e no mundo e a importância do registro vacinal individual;

b) especificar requisitos funcionais e não funcionais do sistema;

c) projetar uma arquitetura em camadas, com separação de responsabilidades entre apresentação, regras de negócio e persistência;

d) implementar o cálculo de pendências comparando a carteira da pessoa com o calendário da sua faixa etária e de seus grupos especiais;

e) automatizar o cadastro de doses a partir da foto ou do PDF da carteirinha, por OCR, mantendo o usuário no controle da confirmação;

f) implementar notificações por e-mail disparadas por eventos e por rotina diária agendada;

g) aplicar práticas de segurança e de proteção de dados pessoais sensíveis;

h) identificar limitações e propor evoluções, em especial a integração com o Meu SUS Digital e com convênios e hospitais.

## 1.4 Justificativa

A justificativa é de natureza social, tecnológica e acadêmica. Socialmente, o sistema contribui para a Meta 3.8 e, mais amplamente, para o Objetivo de Desenvolvimento Sustentável 3 (Saúde e Bem-Estar) da Agenda 2030 da ONU, que inclui a ampliação do acesso a vacinas seguras e eficazes. Tecnologicamente, o projeto reúne, em escala de trabalho de graduação, problemas reais de ADS: modelagem de dados relacional, regras de negócio parametrizáveis, autenticação, autorização, tarefas agendadas, integração com serviços externos e tratamento de dados sensíveis. Academicamente, permite aplicar conceitos de Engenharia de Software, Banco de Dados, Segurança e Sistemas Distribuídos em um único produto.

## 1.5 Metodologia

A pesquisa é de natureza **aplicada** e abordagem **qualitativa**, com procedimento de **pesquisa bibliográfica e documental** (legislação, documentos do Ministério da Saúde, publicações da OMS, do UNICEF e de universidades, e reportagens de veículos de imprensa e do portal gov.br) seguida de **desenvolvimento tecnológico** de um artefato de software. O desenvolvimento adotou um processo **incremental e iterativo**, inspirado em métodos ágeis, com entregas pequenas e versionadas em Git: autenticação e cadastro, carteira e calendário, pendências, dependentes e grupos especiais, leitura de carteirinha por IA, verificação de e-mail e notificações. A construção de cada incremento foi validada por requisições de teste manuais documentadas em arquivos `.http` e pelo uso da própria interface.

## 1.6 Estrutura do trabalho

O Capítulo 2 apresenta o referencial teórico sobre vacinação e sobre as tecnologias e práticas de engenharia utilizadas. O Capítulo 3 trata de requisitos e análise. O Capítulo 4 descreve o projeto e a arquitetura. O Capítulo 5 detalha a implementação. O Capítulo 6 discute segurança, privacidade e aspectos de sistemas distribuídos. O Capítulo 7 apresenta resultados e limitações. O Capítulo 8 propõe melhorias futuras e o Capítulo 9 traz as considerações finais.

\newpage

# 2 REFERENCIAL TEÓRICO

## 2.1 Vacinação como política de saúde pública

### 2.1.1 Mecanismo e imunidade coletiva

A vacina apresenta ao sistema imune um antígeno inofensivo (agente inativado, atenuado, fragmento ou instrução genética) para gerar memória imunológica. Quando uma parcela suficiente da população está imunizada, a transmissão se interrompe e pessoas que não podem se vacinar, como imunossuprimidos e recém-nascidos, ficam indiretamente protegidas. Esse fenômeno, a **imunidade coletiva**, explica por que a queda de cobertura, mesmo que pequena, pode reabrir espaço para surtos. O limiar necessário depende da doença: é mais alto para sarampo, altamente transmissível, do que para outras doenças.

### 2.1.2 Panorama internacional

Em 1974, a OMS lançou o Programa Ampliado de Imunização, com o objetivo de levar vacinas a todas as crianças do mundo. Desde então, organismos vinculados à ONU coordenam esforços complementares: a OMS estabelece recomendações técnicas, o UNICEF atua na compra e distribuição de vacinas em dezenas de países e a Aliança Gavi financia a introdução de vacinas em países de menor renda. A **Agenda de Imunização 2030** (IA2030), aprovada pela Assembleia Mundial da Saúde, define metas globais para reduzir o número de crianças "dose zero" e ampliar a cobertura de vacinas ao longo de toda a vida, e não apenas na infância.

Os países organizam seus programas de formas distintas. Há calendários universais gratuitos, como o brasileiro, modelos mistos em que o seguro de saúde cobre parte das vacinas e modelos descentralizados. O ponto em comum nos países com melhor desempenho é a existência de **registros nacionais de imunização** (sistemas que armazenam cada dose aplicada e permitem convocar ativamente a pessoa em atraso), prática conhecida como *recall*. Países como Austrália, Reino Unido, Canadá e diversos países nórdicos mantêm registros dessa natureza, e a OMS recomenda a digitalização dos registros como parte da estratégia de fortalecimento dos sistemas de imunização.

### 2.1.3 O caso brasileiro

A trajetória do Brasil é marcada por episódios que permanecem como lição. A **Revolta da Vacina** (1904), contra a vacinação obrigatória da varíola conduzida de forma autoritária, mostrou que a adesão depende de comunicação e confiança. A campanha de erradicação da varíola e as campanhas nacionais de vacinação contra a poliomielite, a partir de 1980, com o personagem Zé Gotinha criado em 1986, demonstraram a eficácia da mobilização social aliada à capilaridade da rede pública. O PNI incorporou ao longo do tempo novas vacinas, como rotavírus, pneumocócica, meningocócica, HPV e, mais recentemente, a da dengue em faixas etárias selecionadas, e passou a atender não só crianças, mas adolescentes, adultos, idosos, gestantes e povos indígenas.

A partir de 2016 as coberturas de várias vacinas do calendário infantil passaram a ficar abaixo das metas de 95%. Entre as hipóteses discutidas por pesquisadores e pelo UNICEF estão: a desinformação difundida por redes sociais; a redução da percepção de risco das doenças; a descontinuidade da rotina das unidades de saúde durante a pandemia; desigualdades regionais e socioeconômicas de acesso; e problemas de registro, como a dificuldade de contabilizar doses aplicadas e de identificar quem precisa ser chamado. O Ministério da Saúde reagiu com iniciativas como o Movimento Nacional pela Vacinação, em 2023, e com a ampliação da digitalização via Meu SUS Digital e RNDS.

> **Nota ao leitor:** os números exatos de cobertura, os anos de certificação e as publicações específicas do UNICEF, da USP, do gov.br, da CNN Brasil e da Globo citados na versão final devem ser conferidos e referenciados individualmente, conforme a norma ABNT NBR 6023, com data de acesso. Este texto cita fatos históricos amplamente documentados, mas não reproduz números sem fonte.

### 2.1.4 A carteira de vacinação e o registro individual

A caderneta de vacinação é o principal comprovante individual de imunização e é exigida em matrículas escolares, programas sociais, viagens internacionais (como a febre amarela, segundo o Regulamento Sanitário Internacional) e processos de admissão. Seu formato em papel traz limitações práticas conhecidas: perda, deterioração, letra ilegível, ausência de lote ou de data, e inexistência de lembretes. Quando a pessoa perde a caderneta, a recuperação do histórico depende de consultas a unidades onde se vacinou e, muitas vezes, de repetir doses. A versão digital, disponível no aplicativo Meu SUS Digital, reduz o problema, mas depende de o registro ter sido lançado no SI-PNI pelo serviço que aplicou a dose, o que nem sempre ocorre, sobretudo em doses aplicadas na rede privada ou antes da informatização.

## 2.2 Engenharia de Software aplicada ao projeto

### 2.2.1 Processo de desenvolvimento

Sommerville (2019) e Pressman e Maxim (2021) apontam que sistemas cujo domínio é compreendido de forma gradual se beneficiam de processos incrementais. Cada incremento do *Notifica Vacinas* entrega uma funcionalidade utilizável e testável, e o histórico de *commits* funciona como registro da evolução. A prática também reduz o risco de desenvolver recursos que o usuário não utilizará.

### 2.2.2 Requisitos e qualidade

A norma ISO/IEC 25010 organiza a qualidade de produto em características como adequação funcional, desempenho, usabilidade, confiabilidade, segurança, manutenibilidade e portabilidade. Neste trabalho, **segurança** e **manutenibilidade** receberam atenção especial: a primeira pela natureza sensível dos dados de saúde, a segunda pelo desejo de que as regras vacinais, que mudam com a publicação de novos calendários, possam ser atualizadas sem reescrever o sistema.

### 2.2.3 Arquitetura em camadas e princípios de projeto

A arquitetura em camadas (*layered architecture*) divide o software em níveis de abstração, cada um dependendo apenas do imediatamente inferior (FOWLER, 2002). O projeto também se apoia nos princípios SOLID, em especial a **responsabilidade única** (cada classe tem um motivo para mudar) e a **inversão de dependências** parcial por meio do padrão **Repository**, que isola o acesso ao banco. Martin (2019) defende que as regras de negócio sejam independentes de *frameworks*, de interface e de banco de dados, e o projeto procura seguir essa orientação ao concentrar o cálculo de pendências em um serviço de domínio.

### 2.2.4 API REST

REST é um estilo arquitetural proposto por Fielding (2000) que organiza a interação cliente-servidor em torno de recursos identificados por URL e manipulados por verbos HTTP padronizados, de maneira *stateless*. As respostas usam JSON e códigos de status (200, 201, 400, 401, 403, 404) para comunicar resultado.

### 2.2.5 Persistência e modelagem relacional

O modelo relacional (CODD, 1970), implementado em SQL, garante integridade por meio de chaves primárias, estrangeiras e restrições de unicidade. A escolha do SQLite, banco embarcado e baseado em arquivo, atende ao escopo acadêmico por dispensar servidor dedicado, e a camada *Repository* permite substituí-lo por PostgreSQL ou MySQL sem alterar as regras de negócio.

## 2.3 Sistemas distribuídos e integração

Tanenbaum e Van Steen (2017) definem sistema distribuído como um conjunto de computadores independentes que se apresenta ao usuário como um sistema único e coerente. Mesmo em sua forma atual, o *Notifica Vacinas* é um sistema distribuído em sentido amplo: navegador, servidor de aplicação, serviço de e-mail (SMTP) e serviço de inteligência artificial são processos independentes, em redes diferentes, que se comunicam por protocolos de rede. Isso traz as questões clássicas da área: **falhas parciais** (o provedor de e-mail pode estar indisponível sem que o servidor caia), **latência** (a leitura da imagem por IA leva segundos), **consistência** (a gravação da dose e o envio da notificação não são uma transação única), **idempotência** (um reenvio não deve duplicar efeitos) e **segurança em trânsito**.

### 2.3.1 Interoperabilidade em saúde

A integração entre sistemas de saúde exige padrões comuns. O **HL7 FHIR** é um padrão baseado em recursos e em APIs REST para troca de dados de saúde, com o recurso `Immunization` voltado especificamente a registros de vacinação. No Brasil, a **Rede Nacional de Dados em Saúde (RNDS)** é a plataforma do Ministério da Saúde para troca de informações entre pontos de atenção, e adota modelos de informação compatíveis com FHIR. Esse é o caminho natural para a evolução proposta no Capítulo 8.

## 2.4 Proteção de dados pessoais de saúde

A Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018) classifica dados referentes à saúde como **dados pessoais sensíveis** (art. 5º, II) e submete seu tratamento a bases legais mais restritas (art. 11), como o consentimento específico e destacado do titular ou a tutela da saúde. Crianças e adolescentes têm tratamento regido pelo melhor interesse e, para menores de idade, pelo consentimento de ao menos um dos pais ou responsável legal (art. 14). Princípios como finalidade, adequação, necessidade, segurança e prevenção (art. 6º) orientam todo o ciclo de vida do dado. Como o sistema permite que um responsável cadastre dependentes, o tratamento desses dados deve se apoiar na autoridade do responsável sobre a conta.

## 2.5 Reconhecimento óptico de caracteres (OCR) e Docling

O reconhecimento óptico de caracteres converte o texto presente em uma imagem em texto digital. O **Docling**, biblioteca de código aberto em Python, vai além do OCR puro: analisa o *layout* da página, reconhece tabelas e preserva a estrutura do documento, exportando o resultado em formatos como o Markdown. Isso interessa a uma carteirinha de vacinação, cujo conteúdo é essencialmente uma tabela (vacina, dose, data, lote, unidade).

A abordagem escolhida separa duas responsabilidades: o **OCR** (Docling) devolve o texto estruturado, e um **extrator determinístico** interpreta esse texto, identificando em cada linha a vacina (por correspondência com o catálogo do sistema, inclusive abreviações), a dose, as datas, o lote e a unidade de saúde. Em comparação com enviar a imagem a um modelo de linguagem de terceiros, a solução roda na infraestrutura do próprio sistema, o que evita compartilhar dados pessoais de saúde com um operador externo (LGPD), não tem custo por imagem e produz resultados reproduzíveis e testáveis. O preço é a menor tolerância a escrita manuscrita e a carimbos borrados: o OCR tradicional lê bem texto impresso ou digital (por exemplo, o PDF da carteira do Meu SUS Digital), mas erra mais com letra de mão. Daí a decisão de projeto, tratada na Seção 5.4, de nunca gravar automaticamente: o sistema **sugere**, o usuário **revisa e confirma**.

\newpage

# 3 ANÁLISE DE REQUISITOS

## 3.1 Atores

| Ator | Descrição |
|---|---|
| Usuário | Pessoa autenticada que gerencia a própria carteira e a de seus dependentes. |
| Administrador | Usuário com perfil `ADMIN`, que mantém o catálogo de vacinas, o calendário e as regras vacinais. |
| Sistema agendador | Processo interno que dispara a verificação diária de pendências. |
| Serviços externos | Provedor de e-mail (SMTP), serviço próprio de OCR (Docling) e serviço público de consulta de CEP (ViaCEP). |

## 3.2 Requisitos funcionais

| Código | Requisito |
|---|---|
| RF01 | O sistema deve permitir cadastro de usuário com nome, e-mail e senha. |
| RF02 | O sistema deve confirmar o e-mail do usuário por código de 6 dígitos, com expiração e reenvio, e bloquear o login até a confirmação. |
| RF03 | O sistema deve oferecer um fluxo de *onboarding* para dados pessoais, endereço (com preenchimento por CEP) e carteirinha inicial. |
| RF04 | O usuário deve cadastrar dependentes e gerenciar a carteira de cada um. |
| RF05 | O usuário deve registrar doses manualmente, informando vacina, número da dose, data, lote e fabricante. |
| RF06 | O usuário deve enviar a foto da carteirinha e receber os dados extraídos para revisão e confirmação. |
| RF07 | O sistema deve determinar a faixa etária da pessoa (criança, adolescente, adulto, idoso). |
| RF08 | O sistema deve associar a pessoa a grupos especiais (gestante, trabalhador de saúde, indígena, imunocomprometido, estrangeiro, entre outros). |
| RF09 | O sistema deve calcular, para cada pessoa, as vacinas em dia e as pendentes, com número de doses tomadas, necessárias e faltantes. |
| RF10 | O usuário deve visualizar o calendário vacinal da pessoa e agendar manualmente uma vacina. |
| RF11 | O sistema deve enviar e-mails de boas-vindas, confirmação de dose, alerta de pendências e lembrete de agendamento. |
| RF12 | O usuário deve poder desativar o recebimento de e-mails por pessoa. |
| RF13 | O administrador deve manter vacinas, calendário e regras vacinais. |
| RF14 | O sistema deve calcular, para cada vacina, a próxima dose e a data em que ela é devida, a partir da idade e da data da última dose registrada. |

## 3.3 Requisitos não funcionais

| Código | Requisito | Categoria |
|---|---|---|
| RNF01 | Senhas armazenadas somente como *hash* com *salt* (bcrypt). | Segurança |
| RNF02 | Sessão por JWT em *cookie* `httpOnly` e `sameSite`, nunca acessível por JavaScript. | Segurança |
| RNF03 | Um usuário só acessa dados de pessoas vinculadas à sua conta (prevenção de IDOR). | Segurança |
| RNF04 | Limitação de taxa nas rotas de login e de código de verificação. | Segurança |
| RNF05 | Segredos e credenciais fora do código, em variáveis de ambiente. | Segurança |
| RNF06 | Separação em camadas e uma responsabilidade por módulo. | Manutenibilidade |
| RNF07 | Regras vacinais configuráveis em banco de dados, não codificadas em *if/else*. | Manutenibilidade |
| RNF08 | Interface responsiva, utilizável em celular. | Usabilidade |
| RNF09 | Falha do provedor de e-mail ou do serviço de OCR não deve derrubar o servidor. | Confiabilidade |
| RNF10 | Aderência à LGPD no tratamento dos dados de saúde. | Conformidade |

## 3.4 Regras de negócio principais

**RN01.** A faixa etária segue a divisão: criança (0 a 10 anos), adolescente (11 a 19), adulto (20 a 59) e idoso (60 ou mais). Gestação é tratada como grupo especial, e não como faixa etária.

**RN02.** Uma dose só é **pendente** depois da data em que é devida (idade recomendada ou intervalo mínimo desde a dose anterior, o que ocorrer por último); antes disso, é uma dose **próxima**, com data prevista. Uma vacina está **em dia** quando não há dose vencida.

**RN03.** Uma vacina está **pendente** quando não há registro dela na carteira ou quando o maior número de dose registrado é menor que o exigido; o número de doses faltantes é a diferença.

**RN04.** Registrar uma dose informando diretamente "dose N" conta como N doses cumpridas, e não apenas como a próxima dose sequencial (correção feita durante o desenvolvimento, após um caso em que um adulto registrava a 3ª dose de uma série cuja 1ª e 2ª não constavam na caderneta).

**RN05.** Notificações só são enviadas a pessoas que não desativaram o recebimento.

**RN06.** O e-mail de destino é o da própria pessoa; se ausente, usa-se o da conta responsável.

## 3.5 Casos de uso

Os principais casos de uso são: **UC01** Cadastrar-se e confirmar e-mail; **UC02** Concluir *onboarding*; **UC03** Cadastrar dependente; **UC04** Registrar dose manualmente; **UC05** Registrar dose por foto da carteirinha; **UC06** Consultar situação vacinal (painel); **UC07** Consultar calendário e agendar vacina; **UC08** Receber notificações; **UC09** Administrar vacinas, calendário e regras.

### Descrição do UC05 (registrar dose por foto)

* **Ator principal:** Usuário autenticado.
* **Pré-condição:** pessoa vinculada à conta do usuário.
* **Fluxo principal:** (1) o usuário seleciona a pessoa e envia a foto ou o PDF; (2) o sistema valida a posse da pessoa; (3) o sistema envia o arquivo ao serviço de OCR (Docling) e extrai os campos do texto lido; (4) o sistema devolve vacina, dose, data, lote e local extraídos; (5) o usuário revisa e corrige os campos; (6) o usuário confirma; (7) o sistema grava o registro e a dose; (8) o sistema envia a confirmação por e-mail, se permitido.
* **Fluxo alternativo A:** o OCR não lê texto ou o texto não contém nenhuma vacina conhecida (imagem ilegível ou não é carteirinha): o sistema informa o motivo e permite novo envio ou o cadastro manual.
* **Fluxo alternativo B:** a pessoa identificada na carteirinha difere da selecionada: o sistema oferece cadastrar a pessoa como dependente (cadastro automático).

\newpage

# 4 PROJETO E ARQUITETURA

## 4.1 Visão geral

O *Notifica Vacinas* segue uma arquitetura **cliente-servidor em três camadas lógicas**, com um *front end* de página única (SPA) que consome uma API REST, e um processo agendador no mesmo servidor de aplicação.

```
+-----------------------+        HTTPS / JSON        +--------------------------------+
|  Navegador (SPA)      | <------------------------> |  Servidor de aplicação (Node)  |
|  React + Vite         |   cookie httpOnly (JWT)    |  Express + TypeScript          |
|  Tailwind CSS         |                            |                                |
+-----------------------+                            |  Rotas -> Controllers          |
                                                     |        -> Services (regras)    |
                                                     |        -> Repositories (SQL)   |
                                                     |                                |
                                                     |  Job agendado (node-cron)      |
                                                     +---------+---------+------------+
                                                               |         |
                                          +--------------------+         +-------------------+
                                          v                                                  v
                                +------------------+                     +----------------------------+
                                |  SQLite (arquivo)|                     | Serviços externos          |
                                +------------------+                     |  - SMTP (e-mail)           |
                                                                         |  - Serviço de OCR (Docling) |
                                                                                                         +----------------------------+
```

## 4.2 Organização do código

O repositório é dividido em duas aplicações: `src/` (front end) e `backend/src/` (back end).

No *back end*, cada requisição atravessa as camadas na ordem abaixo, e cada uma tem uma única responsabilidade:

| Camada | Pasta | Responsabilidade | Não faz |
|---|---|---|---|
| Rotas | `routes/` | Mapear URL e verbo a um controller; aplicar *middlewares*. | Regras de negócio. |
| Middlewares | `middlewares/` | Autenticação (`autenticar`), perfil (`exigirAdmin`) e posse do recurso (`pessoaPertenceAoUsuario`). | Persistência. |
| Controllers | `controllers/` | Ler a requisição HTTP, chamar o serviço e traduzir o resultado em status e JSON. | SQL, regras. |
| Services | `services/` | Regras de negócio: pendências, autenticação, notificações, leitura de carteirinha. | HTTP, SQL. |
| Repositories | `repositories/` | Consultas SQL e mapeamento de linhas. | Regras. |
| Banco | `database/` | Criação de tabelas, migrações e *seeds*. | — |
| Jobs | `jobs/` | Agendamento da verificação diária. | Decidir quem recebe e-mail. |
| Utilitários | `utils/` | Funções puras (ex.: faixa etária). | — |

Essa separação reflete o padrão descrito por Fowler (2002) e permite testar o cálculo de pendências sem subir servidor HTTP ou banco.

## 4.3 Modelo de dados

O modelo relacional possui catorze tabelas.

| Tabela | Finalidade | Relacionamentos principais |
|---|---|---|
| `usuarios` | Conta de acesso (nome, e-mail único, *hash* da senha, perfil, ativo, e-mail verificado, código e expiração). | 1:N com `pessoas`. |
| `pessoas` | Titular ou dependente: nome, e-mail, telefone, data de nascimento, endereço, preferência de e-mail. | N:1 com `usuarios`. |
| `dependentes` | Vínculo de parentesco entre responsável e pessoa dependente. | N:1 com `pessoas`. |
| `grupos_especiais` | Catálogo de grupos (gestante, idoso, trabalhador de saúde, indígena, imunocomprometido, estrangeiro). | — |
| `pessoa_grupo_especial` | Associação N:N entre pessoa e grupo. | `pessoas` × `grupos_especiais`. |
| `vacinas` | Catálogo de vacinas (nome único, descrição, doenças evitadas, ativa). | — |
| `calendario_vacinal` | Quais vacinas, e quantas doses, valem para cada faixa etária. | N:1 com `vacinas`. |
| `regras_vacinais` | Regras de dose (intervalos e condições) por vacina. | N:1 com `vacinas`. |
| `campanhas_vacinais` | Campanhas pontuais (por exemplo, influenza). | N:1 com `vacinas`. |
| `registros_vacinacao` | Uma linha por par pessoa/vacina na carteira. | N:1 com `pessoas` e `vacinas`. |
| `doses_vacina` | Cada dose aplicada: número, tipo, data, lote, fabricante, observação. | N:1 com `registros_vacinacao`. |
| `agendamentos_vacina` | Doses previstas: vacina, número da dose, data prevista, status. | N:1 com `pessoas` e `vacinas`. |
| `sessoes` | Uma linha por login (dispositivo): hash do *refresh token*, hash anterior (detecção de reuso), *user agent*, IP, validade e revogação. | N:1 com `usuarios`. |
| `redefinicoes_senha` | Tokens de redefinição de senha, de uso único, guardados apenas como *hash*, com validade. | N:1 com `usuarios`. |

A separação entre `registros_vacinacao` (a vacina que a pessoa tem na carteira) e `doses_vacina` (cada aplicação) evita repetição de dados e permite registrar quantas doses se desejar para uma mesma vacina, normalizando o modelo até a terceira forma normal.

Os catálogos (vacinas, grupos especiais, calendário e regras) são carregados por *seeds* idempotentes na inicialização. O catálogo inicial contempla vacinas como BCG, hepatites A e B, pentavalente, poliomielite (VIP e VOP), rotavírus, febre amarela, tríplice viral, varicela, HPV, influenza, COVID-19, meningocócicas, pneumocócicas e dengue. O calendário inicial foi baseado nas cartilhas do PNI.

## 4.4 Fluxo de cálculo de pendências

```
pessoaId
   |
   v
obter pessoa  --> calcular idade --> obterFaixaEtaria(idade)
   |
   v
calendário da faixa etária        carteira da pessoa
(vacina, doses exigidas)          (registros + maior nº de dose)
          \                      /
           \                    /
            v                  v
        para cada vacina do calendário:
          sem registro            -> pendente (faltam = doses exigidas)
          maior dose < exigidas   -> pendente (faltam = exigidas - maior dose)
          maior dose >= exigidas  -> em dia
                      |
                      v
         resumo { pessoa, faixa, idade, em_dia[], pendentes[] }
```

## 4.5 Principais endpoints

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/registrar` | Público | Cria conta e envia código. |
| POST | `/auth/login` | Público (limitado) | Autentica, abre a sessão e emite os *cookies*. |
| POST | `/auth/refresh` | Cookie de renovação | Rotaciona o *refresh token* e emite novo token de acesso. |
| POST | `/auth/esqueci-senha`, `/auth/redefinir-senha` | Público (limitado) | Recuperação de senha por link de uso único. |
| GET/DELETE/POST | `/auth/sessoes`, `/auth/sessoes/:id`, `/auth/sessoes/encerrar-todas` | Autenticado | Meus dispositivos: listar e encerrar sessões. |
| POST | `/auth/confirmar-email` | Público (limitado) | Valida o código de 6 dígitos. |
| GET | `/vacinas` | Público | Lista o catálogo. |
| GET | `/pendencias/:pessoaId` | Autenticado + posse | Resumo vacinal. |
| GET | `/pendencias/:pessoaId/proximas-doses` | Autenticado + posse | Próxima dose de cada vacina, com data prevista e status. |
| POST | `/scan/analisar` | Autenticado + posse | Envia foto ou PDF para leitura por OCR. |
| POST | `/carteira/confirmar-scan` | Autenticado + posse | Grava o resultado confirmado. |
| GET/POST | `/calendario`, `/agendamentos` | Autenticado | Calendário e agendamentos. |
| GET/POST | `/dependentes`, `/grupos-especiais` | Autenticado | Dependentes e grupos. |
| CRUD | `/usuarios`, `/regras-vacinais` | Administrador | Gestão. |

## 4.6 Interface

O *front end* foi construído como SPA em React 19 com roteamento por React Router, estilização com Tailwind CSS e ícones Lucide. As telas são: Login, Confirmar e-mail, Completar cadastro, Painel (*dashboard*), Carteira, Scan, Calendário, Dependentes e Perfil. Rotas autenticadas são protegidas por um componente `RotaProtegida` e o estado de sessão é compartilhado por `AuthContext`. A comunicação com o servidor é centralizada em `services/api.js` (Axios), com `withCredentials` para envio do *cookie*. O preenchimento automático do endereço é feito diretamente pelo navegador, consultando o serviço público ViaCEP.

\newpage

# 5 IMPLEMENTAÇÃO

## 5.1 Tecnologias

| Camada | Tecnologia | Motivo da escolha |
|---|---|---|
| Front end | React 19, Vite, React Router, Tailwind CSS, Axios | Ecossistema maduro, componentização, desenvolvimento rápido. |
| Back end | Node.js, Express 5, TypeScript | Mesma linguagem nas duas pontas; tipagem estática reduz erros. |
| Banco | SQLite (driver `sqlite3`) | Zero configuração; adequado ao escopo acadêmico. |
| Autenticação | `bcryptjs`, `jsonwebtoken`, `cookie-parser` | Padrões consolidados. |
| Segurança | `cors`, `helmet`, `express-rate-limit` | Controle de origem, cabeçalhos de segurança e abuso. |
| Notificações | `nodemailer`, `node-cron` | E-mail por SMTP e agendamento. |
| OCR | Docling (Python), FastAPI | Leitura de texto e tabelas da carteirinha, em serviço próprio. |
| Controle de versão | Git | Histórico incremental. |

## 5.2 Autenticação e autorização

O cadastro grava a senha com `bcrypt` e gera um código numérico de seis dígitos, sorteado com `crypto.randomInt`, com data de expiração, enviado por e-mail. Enquanto `email_verificado` for falso, o login é recusado. Essa verificação confirma a posse do e-mail no cadastro; **não** é autenticação em dois fatores, pois o login segue exigindo apenas e-mail e senha.

**Sessões revogáveis no servidor.** Um JWT puramente *stateless* tem o defeito de que, uma vez emitido, vale até expirar: um token roubado continuaria funcionando mesmo após o logout. Por isso, cada login cria uma linha em `sessoes` e emite dois *cookies* `httpOnly`: o token de acesso (JWT de 15 minutos, que carrega o identificador da sessão) e um *refresh token* opaco, válido por 30 dias, enviado apenas às rotas `/auth`. O servidor guarda somente o *hash* (SHA-256) do *refresh token*, de modo que um vazamento do banco não permite reaproveitá-lo. A cada renovação o *refresh token* é **rotacionado**: o anterior deixa de valer e seu *hash* fica registrado. Se um *refresh token* já usado reaparece fora de uma janela de tolerância de 10 segundos (que absorve corridas entre abas do navegador), presume-se cópia indevida e a sessão inteira é revogada. O `authMiddleware` confere, a cada requisição, se a sessão continua ativa, de modo que o logout, o encerramento de um dispositivo ("Meus dispositivos"), o "sair de todos" e a troca de senha tenham efeito imediato. Esse desenho troca uma consulta ao banco por requisição pela capacidade de revogação, um compromisso clássico entre escalabilidade e controle.

**Recuperação de senha.** O pedido gera um token aleatório de 256 bits, guardado apenas como *hash*, com validade de 30 minutos e uso único; um novo pedido invalida os anteriores. A resposta é idêntica exista a conta ou não, evitando a enumeração de usuários, e há limite de pedidos por IP e intervalo mínimo por conta. Ao concluir a troca, todas as sessões são revogadas, o bloqueio de login é zerado e um e-mail avisa o titular.

**Bloqueio progressivo de conta.** Além do limite de tentativas por IP, a conta é bloqueada após cinco falhas seguidas, por 1, 2, 4 e 8 minutos, com teto de 15. O teto é intencional: um bloqueio longo permitiria que um atacante trancasse a conta de outra pessoa de propósito.

**Proteção contra CSRF e cabeçalhos de segurança.** Toda requisição que altera dados (POST, PUT, PATCH, DELETE) exige o cabeçalho customizado `X-CSRF-Protection`. Um site de terceiros consegue disparar requisições que levam o *cookie* da vítima, mas não consegue adicionar cabeçalhos customizados sem passar pelo *preflight* do CORS, que autoriza apenas a origem do *front end*; somado ao `sameSite` do *cookie*, isso dispensa guardar token CSRF no servidor. O `helmet` aplica política de segurança de conteúdo restritiva, HSTS, `X-Content-Type-Options` e `frame-ancestors 'none'`. Atrás de proxy reverso, `TRUST_PROXY` faz o Express enxergar o IP real do cliente (sem isso o limite por IP trataria todos como um só) e, em produção, o HTTP é redirecionado para HTTPS.

A autorização é feita em duas camadas: o perfil (`USUARIO` ou `ADMIN`) por `exigirAdmin`, e a **posse do recurso** por `pessoaPertenceAoUsuario` e `pessoaDoCorpoPertenceAoUsuario`. Sem a segunda, qualquer usuário logado poderia trocar o `:pessoaId` da URL e ver a carteira de outra pessoa, vulnerabilidade conhecida como IDOR (*Insecure Direct Object Reference*), que figura há anos no OWASP Top 10 na categoria de controle de acesso quebrado. O administrador inicial é criado a partir de variáveis de ambiente, sem credencial fixa no código-fonte, correção aplicada após revisão do repositório.

## 5.3 Cálculo de pendências e de próximas doses

A primeira versão do cálculo comparava apenas o **número de doses registradas** com o **número de doses da faixa etária**. A auditoria contra os calendários de 2026 (Apêndice C) mostrou que isso falhava em dois pontos: o calendário guardado no banco estava desatualizado e a lógica **ignorava o tempo**. Um bebê de três meses aparecia com pendência de varicela e de tríplice viral, doses que só vencem aos 12 e 15 meses; os intervalos entre doses, os reforços e os grupos especiais existiam no modelo de dados, mas nenhum código os lia; e o sistema dizia *que* faltava uma dose, não *quando*.

O cálculo atual é orientado a datas. O Calendário Nacional 2026 foi transcrito para `data/esquemaVacinal2026.ts`, em que cada linha é uma dose com a **idade recomendada** (em meses, contados do nascimento), o **intervalo mínimo** desde a dose anterior, a **janela de idade** em que ela é cobrada e o **grupo especial** a que se aplica, quando houver. A função pura `calcularProximasDoses` (`utils/proximasDoses.ts`) recebe a data de nascimento, as doses registradas com suas datas e os grupos da pessoa e, para cada vacina, determina a próxima dose não cumprida e a sua data prevista:

> data prevista = **maior** entre (nascimento + idade recomendada) e (data da última dose + intervalo mínimo)

Assim, a dose nunca é marcada antes do intervalo mínimo nem antes da idade recomendada: se a 1ª dose do rotavírus é aplicada com atraso, a 2ª é empurrada para 60 dias depois dela. Reforços periódicos (dT a cada 10 anos, influenza anual, COVID-19 semestral do idoso) usam *data da última dose + período*. Cada dose recebe um status: `ATRASADA`, `DISPONIVEL` (pode ser tomada agora, mas o calendário não define data, como na hepatite B de quem nunca se vacinou), `PROXIMA` (vence em até 30 dias) ou `FUTURA`. Doses que passaram da idade máxima (como o rotavírus, cuja janela se encerra aos 11 meses e 29 dias) deixam de ser cobradas. Duas equivalências são tratadas: a pentavalente conta como hepatite B, e qualquer vacina com componente tetânico (DTP, dTpa, penta) reinicia a contagem dos 10 anos do dT.

A aritmética de datas é feita em UTC e soma meses sem estourar o fim do mês (31/01 mais um mês é 28/02 ou 29/02), para que o fuso do servidor e a duração dos meses não desloquem o dia. O `VacinalService` usa esse resultado para montar o resumo do *Dashboard*: as doses `ATRASADA` e `DISPONIVEL` são as pendências, e as demais compõem a lista de "próximas doses" com data. O teste de integração com banco em memória confere esse caminho de ponta a ponta.

Essa abordagem tem um custo: o calendário passa a viver em um arquivo versionado, e não em tabelas editáveis pelo administrador, o que simplifica o cálculo e o torna testável, mas exige uma nova versão do sistema a cada atualização anual do calendário. Mover o esquema de volta para o banco, com edição e histórico de versões, é uma melhoria futura.

## 5.4 Leitura da carteirinha por IA

O `OcrService` envia o arquivo (JPEG, PNG, WebP ou PDF) ao serviço de OCR, um pequeno servidor FastAPI em Python (pasta `ocr-service/`) que executa o Docling e devolve o texto em Markdown, tabelas incluídas. Em seguida, o `LeituraCarteirinhaService` carrega o catálogo de vacinas ativas e entrega o texto ao extrator (`utils/extratorCarteirinha.ts`), uma função pura. Para cada linha do texto, o extrator:

* identifica a vacina pelo nome do catálogo ou por apelidos (por exemplo, "Hep B", "Pneumo 10", "SCR"), escolhendo o apelido mais longo para não confundir vacinas parecidas (uma linha "Pentavalente (DTP+Hib+HB)" é pentavalente, não DTP);
* lê a dose ("1ª dose", "Dose única", "Reforço"), as datas (formatos `dd/mm/aaaa`, `dd-mm-aa` e `aaaa-mm-dd`, descartando datas impossíveis), o lote e a unidade de saúde;
* trata datas futuras como "próxima dose", e não como aplicação, e ignora a data de nascimento do titular;
* devolve o registro mais recente, além do nome e da data de nascimento do titular, quando presentes. Campos não encontrados voltam como `null`.

Quatro decisões de projeto merecem destaque:

1. **Humano no circuito.** O endpoint `/scan/analisar` apenas devolve a sugestão. A gravação ocorre em `/carteira/confirmar-scan`, após revisão do usuário. Isso trata o risco de erro de leitura (OCR em letra manuscrita, por exemplo), relevante porque um dado vacinal incorreto pode levar a uma conclusão errada de que a pessoa está protegida.
2. **Validação do arquivo.** O corpo aceita até 10 MB (a imagem trafega em *base64*), mas a imagem decodificada é limitada a 5 MB e seu tipo é deduzido dos primeiros bytes (*magic bytes* de JPEG, PNG e WEBP), e não do `mediaType` informado pelo cliente. A rota tem limite de chamadas por usuário, porque cada análise consome processamento do serviço de OCR.
3. **Cadastro automático de dependente** quando a carteirinha pertence a outra pessoa, usando nome e data de nascimento extraídos, também sujeito à confirmação.
4. **Isolamento do OCR.** O serviço de OCR é um processo separado, chamado por HTTP com tempo limite. Se estiver fora do ar, o `/scan/analisar` responde 503 com mensagem clara e o usuário cadastra a dose manualmente, sem derrubar o servidor principal (RNF09). Como o serviço recebe dados pessoais de saúde e não tem autenticação própria, deve ficar em rede interna, acessível só pelo back end.

## 5.5 Notificações

O `NotificacaoService` decide quem recebe e o `EmailService` sabe como enviar, separação que permite trocar o provedor sem mexer na regra. Quatro gatilhos foram implementados:

| Gatilho | Evento | Canal |
|---|---|---|
| Boas-vindas e código | Cadastro | E-mail |
| Confirmação de dose | Registro de dose | E-mail |
| Alerta de pendências | Rotina diária | E-mail |
| Lembrete de agendamento | Rotina diária, 3 dias antes | E-mail |

A rotina diária é um *job* do `node-cron`, por padrão às 8h, configurável pela variável `NOTIFICACAO_CRON`. Falhas são capturadas e registradas em *log*, sem derrubar o processo (RNF09). O módulo de SMS existe como ponto de extensão, ainda sem provedor.

A história do projeto registra uma decisão pertinente: o envio foi trocado entre diferentes provedores (Resend, Mailgun e novamente SMTP via Gmail) conforme restrições de custo e de configuração. A camada de serviço absorveu essas mudanças sem impacto nos demais módulos, o que valida a decisão de isolar a integração.

## 5.6 Qualidade e testes

A verificação foi feita por arquivos `.http` versionados (`backend/tests/`), que documentam e reproduzem os fluxos de cada módulo (pessoas, carteira, calendário, agendamentos, vacinas, CEP e fluxo completo do usuário), além de testes manuais na interface. O processo revelou e corrigiu defeitos, como a duplicação do calendário vacinal na *seed*, o cálculo incorreto de pendências ao registrar "Na dose N" e o seletor de dose que retornava ao estado inicial. Para os mecanismos de segurança, há testes automatizados (Vitest e Supertest) que cobrem a proteção CSRF, a abertura e a revogação de sessões, a rotação e a detecção de reuso do *refresh token*, o isolamento entre usuários, o bloqueio de conta e o fluxo de recuperação de senha, além de testes unitários das funções puras de segurança. Reconhece-se, porém, que **a cobertura automatizada ainda não alcança o cálculo de pendências nem o *front end*** (Seção 7.3).

\newpage

# 6 SEGURANÇA, PRIVACIDADE E ASPECTOS DISTRIBUÍDOS

## 6.1 Medidas de segurança implementadas

| Ameaça | Contramedida |
|---|---|
| Armazenamento de senhas em claro | *Hash* com bcrypt. |
| Roubo de sessão por script (XSS) | Tokens em *cookies* `httpOnly`. |
| Token roubado continua válido | Token de acesso de 15 minutos, sessão revogável no servidor e *refresh token* rotativo com detecção de reuso. |
| Sequestro de conta por recuperação de senha | Token de uso único, só o *hash* no banco, 30 minutos de validade, resposta uniforme e revogação das sessões ao trocar a senha. |
| Ataque distribuído de senhas | Bloqueio progressivo por conta, além do limite por IP. |
| Arquivo malicioso enviado como imagem | Validação de tamanho e de *magic bytes*. |
| Clickjacking e sniffing de conteúdo | `helmet` (CSP, `frame-ancestors`, `X-Content-Type-Options`, HSTS). |
| Requisições forjadas (CSRF) | Cabeçalho customizado obrigatório em requisições que alteram dados, `sameSite: "lax"` e CORS restrito à origem do front end em produção. |
| Força bruta em login e códigos | `express-rate-limit` nas rotas de autenticação. |
| Acesso a dados de terceiros (IDOR) | *Middlewares* de posse do recurso. |
| Escalada de privilégio | `exigirAdmin` em rotas administrativas. |
| Vazamento de segredos | `.env` fora do Git, `.env.example` documentado, sem credenciais fixas. |
| Banco versionado com dados reais | `vacinas.db` removido do controle de versão. |
| Conta falsa ou e-mail de terceiros | Verificação de e-mail por código com expiração. |

## 6.2 Conformidade com a LGPD

Os dados de vacinação são dados sensíveis. O sistema aplica o princípio da **necessidade**, coletando apenas o que a finalidade exige, e da **segurança**, pelas medidas acima. Permanecem pendentes, e são tratados como trabalho necessário antes de uma versão pública: (a) política de privacidade e termo de consentimento específicos, inclusive para dependentes menores; (b) mecanismos de exportação e **exclusão** de dados a pedido do titular (art. 18); (c) registro de operações de tratamento; (d) criptografia do banco em repouso; e (e) definição de que o serviço de OCR permanece em rede interna, sem acesso externo e sem guardar os arquivos recebidos (o OCR é feito em arquivo temporário apagado ao fim do pedido), de modo que as imagens da carteirinha não são compartilhadas com terceiros nem transferidas para fora da infraestrutura do sistema, o que dispensa, nesse ponto, contrato com operador e análise de transferência internacional (arts. 33 a 36). Recomenda-se também elaborar um Relatório de Impacto à Proteção de Dados Pessoais (RIPD).

## 6.3 Visão de sistemas distribuídos

Analisando o sistema pelas propriedades clássicas:

* **Transparência de acesso e de localização:** o cliente conhece apenas a URL da API; a troca de banco ou de provedor de e-mail é invisível a ele.
* **Tolerância a falhas parciais:** erros de SMTP ou do serviço de OCR geram mensagens de erro tratadas, e a rotina diária isola as falhas em `try/catch`.
* **Escalabilidade:** a API é *stateless* (a sessão está no JWT), o que permite replicá-la atrás de um balanceador de carga. Contudo, o SQLite em arquivo local e o agendador no mesmo processo impedem a replicação horizontal imediata: com duas instâncias, o *job* rodaria duas vezes e os usuários receberiam e-mails duplicados. A solução é mover o banco para um SGBD cliente-servidor e executar o agendador em um único *worker* dedicado ou com *lock* distribuído.
* **Consistência:** o registro da dose e o envio da confirmação não são atômicos. O desenho aceita **consistência eventual** para a notificação, mas a gravação da dose e de seu registro pai deve ocorrer em transação para evitar linhas órfãs.
* **Idempotência:** o envio de lembretes deve guardar a data do último disparo por agendamento para evitar duplicidade em reexecuções. É uma melhoria listada no Capítulo 8.
* **Observabilidade:** o sistema usa `console.log`; a evolução natural é *logging* estruturado, métricas e rastreamento.

\newpage

# 7 RESULTADOS E DISCUSSÃO

## 7.1 Resultados alcançados

O sistema cumpre os objetivos específicos propostos: o usuário cria conta com verificação de e-mail, preenche o *onboarding*, cadastra dependentes, registra doses manualmente ou por foto, visualiza no painel as vacinas em dia e pendentes por pessoa, consulta o calendário, agenda vacinas e recebe notificações por e-mail. O administrador mantém o catálogo e as regras sem alterar código. A arquitetura em camadas se mostrou útil na prática: trocar o provedor de e-mail três vezes e corrigir regras de pendência não exigiu reescrever telas nem repositórios.

## 7.2 Comparação com soluções existentes

| Característica | Caderneta de papel | Meu SUS Digital | Notifica Vacinas |
|---|---|---|---|
| Disponível offline | Sim | Parcial | Não |
| Fonte do dado | Profissional, manual | SI-PNI (oficial) | Usuário (manual ou foto) |
| Cobre doses da rede privada | Se anotadas | Nem sempre | Sim, se o usuário registrar |
| Gerencia dependentes | Uma caderneta por pessoa | Sim | Sim |
| Lembretes ativos | Não | Limitados | Sim (e-mail) |
| Valor oficial/comprobatório | Sim | Sim | **Não** |

O *Notifica Vacinas* **não substitui** o registro oficial; atua como camada de apoio à gestão pessoal e de lembrete. Esse posicionamento é importante e deve ser comunicado ao usuário na interface.

## 7.3 Limitações

1. **Fonte de dados manual.** A confiabilidade da carteira depende do que o usuário lança. Não há validação cruzada com o SI-PNI.
2. **Cobertura do calendário.** O cálculo usa o Calendário Nacional 2026 (idade, intervalo e grupo especial), mas não modela gestantes (o calendário próprio não foi incluído), imunocomprometidos, acamados, viajantes e áreas de risco, que dependem de avaliação do serviço de saúde. Onde o calendário não informa o intervalo entre doses (hepatite B e dengue), foram mantidos os valores que o sistema já utilizava. A tabela `calendario_vacinal` antiga, hoje fora do cálculo do painel, ainda precisa ser atualizada ou aposentada.
3. **Cobertura de testes parcial.** Os mecanismos de autenticação e sessão têm testes automatizados, mas o cálculo de pendências, a faixa etária e o *front end* ainda não, e não há integração contínua executando-os.
4. **Banco embarcado e agendador no mesmo processo** (Seção 6.3).
5. **Canal único de notificação e ausência de segundo fator.** SMS não foi implementado, e e-mails podem cair em *spam* ou não ser lidos. O login depende apenas de e-mail e senha; autenticação em dois fatores (TOTP) permanece como melhoria futura, e deveria ser obrigatória para administradores.
6. **Conformidade com a LGPD incompleta** (Seção 6.2).
7. **Limites do OCR.** A leitura é boa para texto impresso ou digital, mas letra manuscrita e carimbos borrados saem com erros; a revisão do usuário é obrigatória. O extrator por regras também reconhece apenas o registro mais recente por envio e depende de o nome da vacina estar no catálogo. O serviço de OCR exige mais memória (carrega modelos de aprendizado de máquina) e precisa ser implantado e monitorado à parte.
8. **Escrita manual de tabelas SQL** e migrações por `ALTER TABLE` com tratamento de erro, em vez de ferramenta de migração versionada. O esquema Prisma no repositório está incompleto em relação às tabelas reais, o que gera inconsistência de manutenção.
9. **Ausência de avaliação com usuários.** Não houve teste de usabilidade com público-alvo, em especial idosos e pessoas de baixa familiaridade digital.

\newpage

# 8 MELHORIAS FUTURAS

## 8.1 Integração com o Meu SUS Digital (gov.br)

**Objetivo:** buscar e atualizar automaticamente a carteira vacinal oficial do cidadão, eliminando a digitação.

**Proposta técnica:**

1. **Identidade federada.** Adotar o login único **gov.br** (OAuth 2.0 / OpenID Connect) como método de autenticação, com nível de confiabilidade prata ou ouro, substituindo ou complementando o cadastro por e-mail e senha. O CPF validado passa a ser chave de identificação.
2. **Consentimento explícito.** Tela que informe quais dados serão lidos, para qual finalidade e por quanto tempo, com possibilidade de revogação (LGPD, arts. 7º, 8º e 11).
3. **Consumo da RNDS.** Credenciar o sistema junto ao Ministério da Saúde como solução integradora e consumir o histórico de imunização em formato **HL7 FHIR** (recurso `Immunization`), mapeando os códigos de imunobiológico do SI-PNI para o catálogo local de vacinas. O mapeamento deve ser tabelado e versionado.
4. **Sincronização.** Um *worker* assíncrono consulta periodicamente a RNDS, com política de *retry* e *backoff* exponencial. A carteira local passa a ter um campo **origem** (`MANUAL`, `SCAN`, `RNDS`) e uma regra de conciliação: dado oficial prevalece sobre manual; divergências são sinalizadas ao usuário, nunca sobrescritas silenciosamente.
5. **Dependentes.** Respeitar as regras do Meu SUS Digital para responsáveis legais, com validação de vínculo.
6. **Resiliência.** Cache da última sincronização bem-sucedida, indicação ao usuário do horário da última atualização e operação degradada quando a RNDS estiver indisponível, em linha com a tolerância a falhas parciais discutida na Seção 6.3.

**Riscos e dependências:** necessidade de convênio ou credenciamento formal, aprovação de segurança do Ministério da Saúde, disponibilidade de ambiente de homologação e mudanças de especificação.

## 8.2 Integração com convênios e hospitais

**Objetivo:** capturar doses aplicadas na rede privada e suplementar, hoje a principal lacuna da carteira digital pública.

**Proposta técnica:**

1. **API de integração com padrão FHIR** (recurso `Immunization` e `Patient`), com contratos documentados em OpenAPI, para que clínicas, hospitais e operadoras enviem ou publiquem as doses aplicadas.
2. **Autenticação entre sistemas** com OAuth 2.0 *client credentials* ou mTLS, e escopos por parceiro.
3. **Consentimento do titular** para cada parceiro, com revogação.
4. **Eventos assíncronos.** Uso de fila de mensagens (como RabbitMQ ou Kafka) ou *webhooks* com assinatura HMAC para receber eventos de vacinação, com **idempotência** por identificador do evento externo, evitando duplicação.
5. **Resolução de identidade.** Correspondência por CPF e Cartão Nacional de Saúde, com tratamento de homônimos e registros incompletos.
6. **Via convênios.** Notificar o beneficiário de vacinas disponíveis em sua cobertura e indicar a rede credenciada próxima, usando o endereço já cadastrado.
7. **Auditoria.** Registro imutável de toda alteração vinda de terceiros, com quem enviou, quando e o quê.

## 8.3 Evolução do domínio vacinal

* Intervalos mínimos e máximos entre doses, idade mínima por dose e esquemas de resgate, possivelmente por um motor de regras declarativas.
* Calendário por **idade em meses** para os primeiros dois anos de vida.
* Regras completas para gestantes, imunocomprometidos, viajantes e trabalhadores de saúde.
* Alertas de **campanhas e surtos** regionais, vinculando o CEP do usuário a avisos oficiais.
* Informações educativas verificadas sobre cada vacina, com links para fontes oficiais, para contribuir contra a desinformação.

## 8.4 Evolução técnica

| Tema | Melhoria |
|---|---|
| Banco | Migrar de SQLite para PostgreSQL, com ferramenta de migração versionada (como o Prisma Migrate) e transações. |
| Testes | Testes unitários (Vitest/Jest) para pendências e faixa etária; testes de integração da API; testes ponta a ponta (Playwright); pipeline de CI. |
| Notificação | Fila de tarefas, controle de idempotência por agendamento, *push* web/PWA, WhatsApp e SMS, preferência por canal e horário. |
| Observabilidade | *Logs* estruturados, métricas, rastreamento e alertas. |
| Segurança | Autenticação multifator, rotação de segredos, *rate limit* global, cabeçalhos de segurança (`helmet`), CSP, criptografia de campos sensíveis. |
| Implantação | Contêineres (Docker), ambiente de homologação, HTTPS obrigatório, *backup* automatizado. |
| Experiência | PWA com modo offline, acessibilidade conforme WCAG 2.1 AA e o eMAG, modo de alto contraste, internacionalização. |
| Dados | Painéis agregados e anonimizados de cobertura para gestores públicos, com privacidade diferencial. |
| OCR | Pontuação de confiança por campo, instrução ao usuário para melhorar a foto, leitura de todas as linhas da carteirinha em lote, avaliação de acurácia com um conjunto de carteirinhas reais, e tratamento de letra manuscrita. |

## 8.5 Dimensão internacional

Como o sistema é parametrizado por catálogo e calendário em banco, pode ser estendido a calendários de outros países (por exemplo, para brasileiros que viajam ou residem no exterior e estrangeiros no Brasil, já previstos como grupo especial) e adotar o padrão internacional de certificado digital de vacinação, como o modelo de credenciais verificáveis adotado durante a COVID-19 e as recomendações da OMS para o **Smart Vaccination Certificate**.

\newpage

# 9 CONSIDERAÇÕES FINAIS

O presente trabalho mostrou que um sistema de informação enxuto, construído com tecnologias abertas e boas práticas de engenharia de software, pode contribuir com um problema concreto de saúde pública: ajudar as pessoas a saberem o que lhes falta e a serem lembradas a tempo. O *Notifica Vacinas* reúne uma API REST em camadas, regras vacinais configuráveis, controle de acesso por posse do recurso, tratamento de dados sensíveis, leitura assistida por IA com confirmação humana e notificações automáticas, e documenta suas decisões e limitações com transparência.

Do ponto de vista formativo, o trabalho integrou conteúdos centrais do curso de ADS: levantamento de requisitos, modelagem, bancos de dados, programação web, segurança, integração e noções de sistemas distribuídos. O maior aprendizado foi perceber que, em saúde, o desafio não é só técnico: **a qualidade do dado e a confiança do usuário** pesam tanto quanto o código. Por isso, a IA sugere e o humano confirma; por isso, o sistema se declara apoio e não registro oficial.

Os trabalhos futuros mais relevantes são a integração com o Meu SUS Digital, via gov.br e RNDS, que passaria a alimentar a carteira com dados oficiais, e com convênios e hospitais, que cobririam a rede privada. Somadas à automação de testes, à migração para um banco cliente-servidor e à conformidade integral com a LGPD, essas evoluções poderiam transformar o protótipo em um produto adequado ao uso em larga escala, em linha com o esforço nacional e internacional de recuperar e sustentar altas coberturas vacinais.

\newpage

# REFERÊNCIAS

> **Atenção:** as referências abaixo são obras e normas existentes de uso corrente na área, mas **devem ser conferidas** (edição, ano, páginas, URL e data de acesso) antes da entrega. Acrescente também as reportagens e os estudos específicos do gov.br, da CNN Brasil, da Globo, da USP e do UNICEF que forem efetivamente citados no texto, no formato NBR 6023.

BRASIL. Lei nº 6.259, de 30 de outubro de 1975. Dispõe sobre a organização das ações de Vigilância Epidemiológica, sobre o Programa Nacional de Imunizações, estabelece normas relativas à notificação compulsória de doenças, e dá outras providências.

BRASIL. Lei nº 8.069, de 13 de julho de 1990. Estatuto da Criança e do Adolescente.

BRASIL. Lei nº 8.080, de 19 de setembro de 1990. Lei Orgânica da Saúde.

BRASIL. Lei nº 13.709, de 14 de agosto de 2018. Lei Geral de Proteção de Dados Pessoais (LGPD).

BRASIL. Ministério da Saúde. **Programa Nacional de Imunizações (PNI)**. Brasília: Ministério da Saúde. Disponível em: https://www.gov.br/saude. Acesso em: [data].

BRASIL. Ministério da Saúde. **Meu SUS Digital** e **Rede Nacional de Dados em Saúde (RNDS)**. Disponível em: https://www.gov.br/saude. Acesso em: [data].

CODD, E. F. A relational model of data for large shared data banks. **Communications of the ACM**, v. 13, n. 6, p. 377-387, 1970.

FIELDING, R. T. **Architectural Styles and the Design of Network-based Software Architectures**. 2000. Tese (Doutorado) — University of California, Irvine, 2000.

FOWLER, M. **Patterns of Enterprise Application Architecture**. Boston: Addison-Wesley, 2002.

GAMMA, E. et al. **Padrões de projeto**: soluções reutilizáveis de software orientado a objetos. Porto Alegre: Bookman, 2000.

HL7 INTERNATIONAL. **FHIR**: Immunization resource. Disponível em: https://hl7.org/fhir. Acesso em: [data].

ISO/IEC 25010. **Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — System and software quality models**. 2011.

MARTIN, R. C. **Arquitetura limpa**: o guia do artesão para estrutura e design de software. Rio de Janeiro: Alta Books, 2019.

ORGANIZAÇÃO DAS NAÇÕES UNIDAS. **Transformando nosso mundo**: a Agenda 2030 para o Desenvolvimento Sustentável. 2015. ODS 3.

ORGANIZAÇÃO MUNDIAL DA SAÚDE. **Immunization Agenda 2030**: a global strategy to leave no one behind. Genebra: OMS, 2020.

ORGANIZAÇÃO MUNDIAL DA SAÚDE; UNICEF. **WHO/UNICEF Estimates of National Immunization Coverage (WUENIC)**. Disponível em: https://www.who.int/. Acesso em: [data].

OWASP FOUNDATION. **OWASP Top 10**. Disponível em: https://owasp.org/www-project-top-ten/. Acesso em: [data].

PRESSMAN, R. S.; MAXIM, B. R. **Engenharia de software**: uma abordagem profissional. 9. ed. Porto Alegre: AMGH, 2021.

SOMMERVILLE, I. **Engenharia de software**. 10. ed. São Paulo: Pearson, 2019.

TANENBAUM, A. S.; VAN STEEN, M. **Sistemas distribuídos**: princípios e paradigmas. 3. ed. São Paulo: Pearson, 2017.

UNICEF BRASIL. [Publicações sobre cobertura vacinal e crianças "dose zero" no Brasil]. Disponível em: https://www.unicef.org/brazil. Acesso em: [data].

UNIVERSIDADE DE SÃO PAULO. [Estudos sobre cobertura vacinal e hesitação vacinal no Brasil]. [Preencher autoria, título, ano e URL].

\newpage

# APÊNDICE A — VARIÁVEIS DE AMBIENTE DO SERVIDOR

| Variável | Finalidade |
|---|---|
| `PORT` | Porta do servidor Express. |
| `FRONTEND_URL` | Origem permitida pelo CORS. |
| `JWT_SECRET` | Segredo de assinatura dos tokens (obrigatório). |
| `DATABASE_URL` | Caminho do arquivo SQLite. |
| `ADMIN_EMAIL`, `ADMIN_SENHA` | Criação do administrador inicial. |
| `OCR_SERVICE_URL` | URL do serviço de OCR (Docling). |
| `EMAIL_USER`, `EMAIL_APP_PASSWORD`, `EMAIL_SERVICE`, `EMAIL_FROM` | Envio de e-mail. |
| `NOTIFICACAO_CRON` | Expressão cron da verificação diária. |

# APÊNDICE B — INSTRUÇÕES DE EXECUÇÃO

Back end:

```bash
cd backend
cp .env.example .env   # preencher JWT_SECRET e demais valores
npm install
npm run dev
```

Front end:

```bash
npm install
npm run dev
```

# APÊNDICE C — AUDITORIA DO CALENDÁRIO VACINAL

Comparação entre o que o sistema guardava (`calendarioSeed.ts`, `regrasSeed.ts`, `faixaEtaria.ts` e `VacinalService`) e os quatro calendários do Ministério da Saúde de 2026. O texto completo, com a tabela de divergências por vacina, está em `docs/auditoria-calendario-2026.md`.

* **Dados:** 20 divergências, entre elas: hepatite B da criança com 3 doses (o calendário traz 1 dose ao nascer); poliomielite sem os reforços aos 15 meses e 4 anos; tríplice viral, febre amarela e varicela da criança com número de doses a menos; HPV com 2 doses (o calendário traz 1 dose, aos 9 anos); influenza, COVID-19 e dengue ausentes do calendário; pneumocócica 23-valente no idoso (o calendário traz a 20-valente, para grupos específicos).
* **Lógica:** faixas etárias com limites diferentes (criança 0–10, e não 0–9; adulto a partir dos 20, e não dos 25); pendências sem considerar a idade em que cada dose é devida; reforços, intervalos e grupos especiais gravados, mas nunca lidos; nenhuma data prevista.
* **Correção:** o cálculo de próximas doses (Seção 5.3) e a revisão dos limites das faixas etárias.
