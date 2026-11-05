# Conferência das regras com o calendário do Estado de SP (out/2026)

Fonte: `calendario_atualizado_out26.pdf` (CVE/SES-SP, "Calendário de Vacinação – Estado de São Paulo – 2026", 9 páginas:
criança e adolescente, menores de 7 anos, 7 anos ou mais e adolescentes, adultos de 20 a 59 anos, idosos de 60 anos ou mais,
gestante e puérpera). Regras do sistema: `backend/src/data/esquemaVacinal2026.ts`.

Legenda: **igual** = já estava conforme · **corrigido** = alterado nesta conferência · **diferença** = o calendário do Estado de SP
e o do sistema (Ministério da Saúde) divergem; falta decidir qual vale · **não modelado** = o sistema ainda não calcula.

## Criança (0 a 9 anos)

| Vacina | Calendário SP | Sistema | Situação |
|---|---|---|---|
| BCG | dose única ao nascer | dose única ao nascer | igual |
| Hepatite B | 1ª dose ao nascer | dose ao nascer | igual |
| VIP (pólio inativada) | 2, 4, 6 meses; reforços aos 15 meses e 4 anos | idem | igual |
| VIP, penta, varicela, DTP | podem ser aplicadas até 6a11m29d (VIP: 5 a 6a11m29d sem nenhuma dose faz o esquema básico) | cobradas até 9a11m29d | **corrigido**: limite de 6a11m29d |
| Pneumocócica 10V/20V, meningo C, hepatite A, meningo ACWY (12 meses) | "podem ser administradas até 4a11m29d" | cobradas até 9a11m29d | **corrigido**: limite de 4a11m29d |
| Rotavírus | 2 e 4 meses; 1ª dose até 11m29d, 2ª até 23m29d | idem | igual |
| Pneumocócica | 20V aos 2 meses, 10V aos 4, reforço 20V aos 12 meses | idem | igual |
| Meningo C | 3 e 5 meses | idem | igual |
| Meningo ACWY aos 12 meses | consta como **Reforço** | "Dose única" | **corrigido** (rótulo "Reforço (aos 12 meses)") |
| COVID-19 | 6, 7 e 9 meses | idem | igual |
| Influenza | dose anual de 6 meses a 5a11m29d; na 1ª vez 2 doses com **4 semanas** | 2 doses com 30 dias (texto) | **corrigido** (texto: 4 semanas) |
| Febre amarela | 1ª dose aos 9 meses, 2ª aos 4 anos | idem | igual |
| SCR (tríplice viral) | 12 e 15 meses | idem | igual |
| Varicela | 15 meses e 4 anos | idem | igual |
| DTP | reforços aos 15 meses e 4 anos | idem | igual |
| Dengue | 10 anos, 2 doses com **12 semanas** (84 dias) | 90 dias | **corrigido** (84 dias) |
| HPV | dose única de 9 a 14a11m29d | idem | igual |
| Meningo ACWY aos 11 anos | dose única de 11 a 14 anos, **independentemente** da dose dos 12 meses | a dose dos 12 meses dava o esquema por completo | **corrigido**: só contam doses a partir dos 10 anos |
| dT | **reforço aos 15 anos** e depois a cada 10 anos | 3ª dose de reforço aos **14** anos e 4ª aos 24 | **diferença** (o sistema segue o Ministério) |

## 7 anos ou mais e adolescentes / adultos (20 a 59) / idosos (60+)

| Item | Calendário SP | Sistema | Situação |
|---|---|---|---|
| Hepatite B: intervalos | 2ª dose com mínimo de **4 semanas**; 3ª dose 4 a 6 meses após a 1ª (ou 2 meses após a 2ª, desde que passados 4 meses da 1ª) | 30 e 180 dias | **corrigido**: 28 dias; 3ª dose = 2 meses após a 2ª **e** 4 meses após a 1ª |
| SCR: 2ª dose | 4 semanas depois da 1ª (20 a 29 anos e profissionais de saúde) | sem intervalo | **corrigido** (28 dias) |
| SCR: quantas doses | 20 a 29 anos e profissionais de saúde: 2 doses; demais até 59: 1 dose | idem | igual |
| Febre amarela | dose única (20 a 59); idosos só após avaliação do serviço de saúde | até 59 anos; não sugere a partir de 60 | **diferença** (cautela do sistema; SP lista com avaliação) |
| Febre amarela com 1 dose só antes dos 5 anos | exige uma dose adicional | não calcula | **não modelado** |
| dT adulto/idoso | quem tem menos de 3 doses faz a série de 3 doses (1ª visita, 2 meses depois, 4 a 6 meses depois); com 3 ou mais doses, reforço a cada 10 anos (5 anos após alguns ferimentos) | só o reforço a cada 10 anos | **não modelado** (série de 3 doses do adulto sem esquema) |
| COVID-19 idoso | uma dose a cada 6 meses | idem | igual |
| Influenza idoso | dose anual | idem | igual |
| Pneumocócica 20V idoso | todos a partir de 85 anos; 60 a 84 só acamados ou institucionalizados | a partir de 85 anos (acamados não avaliados) | igual (acamados fora do alcance) |
| Esquema para 7 anos ou mais sem vacinas (hepatite B, dT, SCR, HPV) | começa aos 7 anos | começa aos 10 anos | **não modelado** (crianças de 7 a 9 anos com esquema atrasado) |

## Gestante e puérpera

| Item | Calendário SP | Sistema | Situação |
|---|---|---|---|
| Hepatite B | 3 doses (1ª visita, 2 meses depois, 4 a 6 meses depois) | regra geral, com os intervalos corrigidos acima | **corrigido** |
| dT | 3 doses, mesmos prazos; **com 3 ou mais doses prévias** de penta, tetravalente, DTP, DT, DTPa, dTpa ou dT basta o dTpa | série de 3 doses mesmo com vacinas anteriores | **corrigido**: 2 meses entre a 1ª e a 2ª; 3ª dose 4 meses após a 1ª; 3 ou mais doses prévias dispensam a série |
| dTpa | a partir da 20ª semana, **a cada gestação** | idem | igual (feito na etapa anterior) |
| VSR | a partir da 28ª semana, a cada gestação | idem | igual |
| COVID-19 | uma dose em qualquer fase, em **cada gestação** | idem | igual |
| Influenza | uma dose em qualquer fase de **cada gestação** | "1 dose por temporada" (Ministério) | **corrigido**: conta só dose aplicada nesta gestação |
| Febre amarela | não aparece no calendário SP para a gestante; o do Ministério só admite em casos excepcionais | não é sugerida | igual |
| Tríplice viral e varicela | o calendário SP **não** as inclui na gestação; a tríplice viral entra no **puerpério** | não são sugeridas na gestação | igual |
| **Puerpério** (até 45 dias após o parto) | dTpa (se não tomou na gestação), COVID-19 e influenza (se não aplicadas), SCR dose única (2 doses até 29 anos e profissionais de saúde) | não existe | **não modelado** (o sistema não guarda a data do parto) |

## Observação final do calendário

"Pessoas com condições clínicas especiais... procurar o CRIE ou uma sala da RIE": o sistema **não** calcula esquemas de imunocomprometidos,
acamados, viajantes e outras situações especiais. Isso continua dependendo da avaliação do serviço de saúde.

## O que decidir

1. **dT aos 14 ou aos 15 anos**: o sistema usa o calendário do Ministério (3ª dose de reforço aos 14 anos e 4ª aos 24). O do Estado de SP diz 15 anos e a cada 10 anos. A diferença é de um ano.
2. **Febre amarela a partir dos 60 anos**: o sistema não sugere; o calendário de SP lista a vacina com avaliação do serviço de saúde.
3. **Puerpério** (45 dias após o parto): exigiria perguntar a data do parto, como foi feito com as semanas de gestação.
4. **Série de dT do adulto sem esquema** e **febre amarela com dose única antes dos 5 anos**: regras que ainda faltam.
