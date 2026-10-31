# Auditoria: banco e lógica de vacinas × Calendário Nacional 2026

Comparação do que o sistema tinha (`calendarioSeed.ts`, `regrasSeed.ts`, `faixaEtaria.ts`, `VacinalService`)
com os quatro calendários do Ministério da Saúde de 2026 (Criança, Adolescente e Jovem, Adulto, Idoso).

**Conclusão:** o calendário que estava no banco **não estava de acordo** com o de 2026, e a lógica de pendências
não usava o tempo (idade e data das doses). O cálculo novo (`data/esquemaVacinal2026.ts` +
`utils/proximasDoses.ts`) corrige a lógica e passa a usar o calendário de 2026. A tabela `calendario_vacinal`
antiga **não foi alterada** (ver "O que ficou").

## 1. Divergências de dados (calendarioSeed.ts)

| Vacina | No banco | Calendário 2026 |
|---|---|---|
| Hepatite B (criança) | 3 doses | 1 dose ao nascer (a penta traz o restante) |
| Poliomielite VIP (criança) | 3 doses | 3 doses + reforços aos 15 meses e aos 4 anos |
| Poliomielite VOP (criança) | 1 dose + 2 reforços | não consta (os reforços são com VIP) |
| Tetraviral | 1 dose "SCR + Varicela" | não consta (só se faltar varicela) |
| Pneumocócica (criança) | 10-valente: 2 doses + 1 reforço | 20-valente aos 2 meses, 10-valente aos 4 meses, reforço 20-valente aos 12 meses |
| Meningocócica ACWY (criança) | ausente | 1 dose aos 12 meses (e 1 dose aos 11 anos) |
| Febre amarela (criança) | dose única | dose aos 9 meses + reforço aos 4 anos |
| Tríplice viral SCR (criança) | 1 dose | 2 doses (12 e 15 meses) |
| Varicela (criança) | dose única | 2 doses (15 meses e 4 anos) |
| Influenza (criança) | ausente | anual, dos 6 meses aos 5 anos |
| COVID-19 (criança) | ausente | 3 doses (6, 7 e 9 meses) |
| HPV4 | 2 doses (11 a 19 anos) | 1 dose, aos 9 anos (atraso até 14 anos) |
| Dengue DNG4 | existe a vacina, mas fora do calendário | 2 doses a partir dos 10 anos (até 14 anos) |
| dT (adolescente) | 1 dose + 1 reforço | 3ª dose de reforço aos 14 anos e 4ª aos 24 anos |
| dT (adulto) | 1 dose + 1 reforço | 3 doses + reforço aos 34 anos e depois a cada 10 anos |
| SCR (adulto) | 2 doses para todos | até 29 anos: 2 doses; 30 a 59: 1 dose; trabalhador da saúde: 2 doses |
| SCR (idoso) | 1 dose para todos | só trabalhador da saúde (2 doses) |
| Varicela (jovem, adulto, idoso) | ausente | 2 doses, só trabalhador da saúde e povos indígenas |
| Pneumocócica (idoso) | 23-valente, dose única, todos | 20-valente: acamados/institucionalizados (60 a 84), todos a partir de 85, indígenas |
| COVID-19 (idoso) | 1 dose + 1 reforço "campanha" | 1 dose semestral |

Calendário da **gestante**: não estava entre os documentos enviados; não foi verificado.

## 2. Divergências de lógica

1. **Faixas etárias**: o código usava criança 0–10, adolescente 11–19, adulto 20–59. O calendário usa criança 0–9,
   adolescente e jovem 10–24, adulto 25–59 (corrigido em `faixaEtaria.ts`, com teste).
2. **Não usava o tempo**: `calcularPendencias` comparava só "doses registradas" com "doses da faixa". Um bebê de 3 meses
   aparecia com pendência de varicela, SCR e hepatite A (que só vencem aos 12–15 meses). Corrigido: a dose só é
   pendência depois da data em que é devida.
3. **Reforços ignorados**: a coluna `reforcos` nunca era lida; reforços nunca viravam pendência.
4. **Grupos especiais ignorados**: `pessoa_grupo_especial` e `regras_vacinais.grupo_especial_id` existiam, mas o cálculo
   só olhava a faixa etária. Corrigido para trabalhador da saúde e povos indígenas.
5. **Intervalos nunca usados**: `regras_vacinais` guardava intervalos entre doses, mas nada os lia. Agora a data da
   próxima dose respeita o intervalo mínimo (ex.: rotavírus 60 dias).
6. **Sem data**: o sistema dizia *que* faltava uma dose, não *quando*. Agora calcula a data prevista.

## 3. O que o cálculo novo faz

Para cada vacina, acha a próxima dose e a data: a **maior** entre
`nascimento + idade recomendada` e `data da última dose + intervalo mínimo`. Reforços periódicos (dT a cada 10 anos,
influenza anual, COVID-19 semestral no idoso) usam `última dose + período`. Status: `ATRASADA`, `DISPONIVEL` (sem data
no calendário), `PROXIMA` (até 30 dias) e `FUTURA`. Dose que passou da idade máxima deixa de ser cobrada
(ex.: rotavírus). A penta conta como hepatite B, e dTpa/DTP/penta reiniciam os 10 anos do dT.

Endpoints: `GET /pendencias/:pessoaId` (agora com `proximas` e datas) e `GET /pendencias/:pessoaId/proximas-doses`.

## 4. Valores que NÃO vêm dos calendários (conferir)

Onde o calendário não diz o intervalo, usei o que o sistema já tinha em `regrasSeed.ts`:
hepatite B 30 e 180 dias; dengue DNG4 90 dias. Os intervalos de COVID-19 em criança (28 e 56 dias) e de rotavírus
(60 dias) estão nas notas do calendário da criança.

## 5. Correções feitas depois da auditoria

- **`calendario_vacinal` atualizada**: as linhas das quatro faixas etárias agora são derivadas do mesmo esquema do
  cálculo (`utils/calendarioDerivado.ts`). A versão ("2026") fica em `configuracoes`; se o banco tiver outra versão,
  o seed troca as linhas dessas faixas uma vez. Linhas do grupo GESTANTE não são alteradas. Edições manuais do
  administrador nas faixas são substituídas na troca de versão.
- **Aviso por e-mail**: deixou de ser diário. Sai uma vez por dose, quando faltam até 7 dias (`AVISO_DOSE_DIAS`),
  com o período da campanha da vacina, se houver. Controle de repetição em `avisos_dose`.
- **Calendário da pessoa**: marca a data prevista de cada dose e o período da campanha da vacina.

## 6. O que ainda falta

- `regras_vacinais` continua no banco, mas o cálculo não a usa (as regras estão em `esquemaVacinal2026.ts`).
- Casos não modelados: gestantes, imunocomprometidos, acamados, viajantes e áreas de risco de febre amarela.
- Não há campanhas cadastradas por padrão: o período da campanha só aparece se o administrador cadastrar a campanha
  (a influenza, por exemplo, usa "última dose + 12 meses" como data até lá).
- O calendário muda todo ano: atualizar = editar `esquemaVacinal2026.ts` e os testes.
