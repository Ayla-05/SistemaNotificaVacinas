# Proposta de gamificação (fadinhas) para a monografia

Rascunho para encaixar em `NotificaVacinas-REVISADA-11.2026.pdf`. Os textos usam só as fontes que consegui verificar (ABNT completo em `referencias-gamificacao.md`). **A gamificação aparece aqui como hipótese e proposta de avaliação, não como resultado comprovado.** Ainda não existe evidência de que as fadinhas aumentem a vacinação.

## Onde encaixar no trabalho

| Local | O que entra |
|---|---|
| 1.2 Problema de pesquisa | Acrescentar uma segunda pergunta (texto A). |
| 1.3.2 Objetivos específicos | Novo item (texto B). |
| 2.6 (nova) Gamificação e engajamento em saúde | Referencial teórico (texto C). |
| 4.6 Interface (ou nova 4.7) | Descrição das fadinhas como recurso implementado (texto D). |
| 7.3 Limitações | Frase sobre a gamificação não avaliada (texto E). |
| 8.3 ou nova 8.6 | Proposta de estudo de avaliação (texto F). |
| Resumo e Abstract | Uma frase (texto G). |

## A. Pergunta complementar (1.2)

Além disso, em que medida elementos de gamificação, como personagens colecionáveis desbloqueados pela vacinação em dia, podem aumentar o engajamento de crianças e de seus responsáveis com o acompanhamento da carteira vacinal?

## B. Objetivo específico (1.3.2)

i) propor e implementar um recurso de gamificação, as "fadinhas das vacinas", e formular um protocolo para avaliar seu efeito sobre o engajamento e a adesão ao calendário.

## C. Referencial: 2.6 Gamificação e engajamento em saúde

Gamificação é o uso de elementos de design de jogos em contextos que não são jogos (DETERDING *et al.*, 2011). Revisões da literatura indicam que seus efeitos são positivos, mas dependem fortemente do contexto e do tipo de usuário (HAMARI; KOIVISTO; SARSA, 2014). Na saúde, a evidência é encorajadora, porém limitada: a revisão de Johnson *et al.* (2016) encontrou efeitos positivos ou mistos, com qualidade de evidência de moderada a baixa, e uma revisão sobre atividade física em aplicativos móveis relatou resultados mistos e mudanças modestas (XU *et al.*, 2022).

No campo da vacinação, as revisões de escopo reúnem poucos estudos. Montagni, Mabchour e Tzourio (2020) identificaram ferramentas digitais gamificadas bem avaliadas em usabilidade e associadas a maior conhecimento e motivação para vacinar, e observaram que papéis (personagens) e sistemas de recompensa estavam presentes em todos os estudos incluídos. Hakim *et al.* (2024) analisaram 28 artigos e 11 ferramentas e concluíram que tais ferramentas parecem ter potencial para melhorar a adesão, por meio de crenças positivas, conhecimento e intenção, ressalvando que poucos estudos eram ensaios randomizados e que pode haver viés de publicação. Ou seja, os desfechos medidos foram, sobretudo, conhecimento, crenças e intenção, e não a vacinação efetivamente realizada.

Em paralelo, a literatura sobre lembretes mostra efeito comprovado sobre a cobertura: lembretes e convocações aumentam, em média, cerca de 8 pontos percentuais as taxas de imunização (JACOBSON VANN *et al.*, 2018), e lembretes por mensagem de texto têm efeito positivo, ainda que pequeno (LOUW *et al.*, 2024). Isso sugere tratar a gamificação como complemento aos lembretes, e não como substituto.

## D. Interface: as fadinhas das vacinas (recurso implementado)

Cada vacina do calendário tem uma "fadinha" própria (personagem de fantasia com nome, roupa, cabelo, asas e paleta únicos, com versões femininas e masculinas). A fadinha de uma vacina é **desbloqueada quando a pessoa está com aquela vacina em dia**; as vacinas pendentes aparecem como personagens bloqueados, com mensagem de incentivo. As fadinhas desbloqueadas passeiam pela interface, interagem entre si e com os elementos da tela, e um contador ("Fadinhas: X de Y") mostra o progresso da coleção. O recurso pode ser ligado ou desligado pelo usuário.

Do ponto de vista dos elementos de jogo (DETERDING *et al.*, 2011), o recurso combina **coleção**, **desbloqueio de conteúdo**, **personagens** e **feedback de progresso**. O objetivo é tornar a carteira em dia algo visível e agradável para a criança, mantendo o responsável como titular da conta.

## E. Limitação (7.3)

- **Gamificação não avaliada.** O efeito das fadinhas sobre o engajamento e a adesão ao calendário não foi medido. A literatura sugere potencial, mas com evidência limitada e sem desfechos de vacinação efetivamente realizada. Além disso, os dados de vacinação são informados pelo próprio usuário, de modo que o desbloqueio pode refletir um registro incorreto.

## F. Proposta de avaliação (8.3 ou 8.6)

**Pergunta.** As fadinhas aumentam o engajamento de crianças e responsáveis com a carteira vacinal e a adesão ao calendário no prazo?

**Hipóteses.**
- H0: não há diferença de engajamento e de adesão entre quem usa o sistema com e sem as fadinhas.
- H1: quem usa o sistema com as fadinhas apresenta maior engajamento e maior proporção de doses registradas no prazo.

**Delineamento sugerido (piloto).**
- Participantes: responsáveis e crianças (por exemplo, de 4 a 10 anos), em uma unidade de saúde, escola ou grupo comunitário.
- Dois grupos: sistema com notificações + fadinhas (intervenção) e sistema só com notificações (controle). Preferencialmente por sorteio.
- Duração: de 8 a 12 semanas, com acompanhamento das doses previstas no período.

**Medidas.**
- Engajamento: acessos por semana, tempo na carteira, registros feitos, abertura das notificações.
- Adesão: proporção de doses aplicadas no prazo e dias de atraso. A fonte deve ser confirmada pela caderneta ou pelo Meu SUS Digital, e não só pelo auto-registro.
- Percepção: usabilidade (escala SUS, BROOKE, 1996), satisfação e compreensão da criança, por entrevista curta.

**Aspectos éticos.** A pesquisa envolve crianças e dados de saúde. Exige submissão a Comitê de Ética em Pesquisa (Plataforma Brasil, Resoluções CNS nº 466/2012 e nº 510/2016), Termo de Consentimento Livre e Esclarecido do responsável, assentimento da criança e tratamento conforme o art. 14 da LGPD (melhor interesse da criança e consentimento específico de ao menos um dos pais ou responsável legal).

**Riscos de desenho a discutir.**
- **Estigma e frustração:** personagens "bloqueados" podem constranger quem não pôde vacinar por falta de acesso. A mensagem deve incentivar, sem culpar, e a vacinação nunca pode depender de recompensa.
- **Registro incorreto:** a criança ou o responsável podem registrar doses que não ocorreram para desbloquear. Confirmar pela caderneta ou RNDS reduz o risco.
- **Efeito de novidade:** o interesse pode cair depois das primeiras semanas, e por isso o acompanhamento deve ser longo o suficiente.
- **Não substitui lembretes e acesso:** ganhos de cobertura dependem também de acesso a unidades de saúde e de informação confiável.

## G. Resumo / Abstract (frase a acrescentar)

Como recurso adicional, o sistema propõe a gamificação do calendário por meio de personagens colecionáveis ("fadinhas das vacinas") desbloqueados quando a vacina está em dia, cujo efeito sobre o engajamento infantil é apresentado como hipótese e proposta de avaliação.

*As an additional feature, the system proposes gamifying the vaccination schedule through collectible characters ("vaccine fairies") unlocked when a vaccine is up to date; their effect on children's engagement is presented as a hypothesis and an evaluation proposal.*

---

## Pontos do PDF atual que parecem desatualizados em relação ao sistema

Conferi o texto do PDF com o que fizemos no código. Estes trechos merecem revisão:

1. **Leitura da carteirinha (2.5, 3.1, 4.1, 5.1, 5.4, 6.2, 7.3).** O texto diz que o sistema usa um modelo de visão da Anthropic (`ClaudeVisionService`, SDK da Anthropic). O sistema hoje usa um serviço próprio de OCR com **Docling**, executado localmente (`ocr-service`), seguido de um extrator de texto. A imagem **não sai** da infraestrutura do sistema, o que muda a análise de LGPD (6.2, item "e") e de custo por imagem (7.3). O capítulo 2.5 também descreve "modelo multimodal que interpreta escrita manual"; a abordagem atual lê melhor texto impresso e PDF (como o do Meu SUS Digital) e pode errar em letra manuscrita.
2. **Várias doses por carteirinha (UC05, 5.4).** O fluxo agora lê **todas as vacinas e doses** do documento (por exemplo, as 7 do seu PDF) e mostra um cartão por registro para revisão. O texto fala em "dados extraídos" no singular.
3. **Reenvio duplicado (RN, 5.6).** Hoje uma dose igual (mesma vacina, data e lote) não é registrada duas vezes.
4. **Testes automatizados (5.6, 7.3, 8.4).** O texto diz que não há testes automatizados. O backend tem **113 testes** (Vitest) passando, incluindo um com a tabela do Meu SUS Digital.
5. **Agendamentos (RF10, 5.5).** Há agora confirmação "OK, já tomei" (registra a dose e marca como realizada), bloqueio de datas retroativas e painel lateral de notificações.
6. **Faixa etária (RN01).** O texto define criança de 0 a 10 anos. O cálculo de idade foi corrigido para considerar o aniversário e atualiza sozinho com a data de nascimento.
7. **Front end (4.6, 5.1).** O texto cita Axios; `services/api.js` usa `fetch` nativo. Confira também a versão do React.
8. **Telas e identidade visual.** O Login foi redesenhado e o painel (dashboard) ganhou as fadinhas, o carrossel e fontes maiores para acessibilidade; as telas Perfil, Dependentes e Meus dispositivos podem ser citadas.
9. **Avaliação com usuários (7.3).** Continua verdadeira; a proposta F é um caminho para supri-la.
10. **Acessibilidade (8.4).** O texto cita WCAG 2.1 AA. A versão recomendada atual é a **WCAG 2.2** (W3C, 5 de outubro de 2023).

Se quiser, posso reescrever esses trechos do capítulo 5 e do capítulo 2 para refletir o que está no código.
