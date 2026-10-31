import * as vacinaRepository
  from "../../repositories/vacinaRepository";

import * as calendarioVacinalRepository
  from "../../repositories/calendarioVacinalRepository";

import * as configuracaoRepository
  from "../../repositories/configuracaoRepository";

import {
  derivarCalendarioPorFaixa,
  FAIXAS_CALENDARIO,
  VERSAO_CALENDARIO
} from "../../utils/calendarioDerivado";

/*
==================================================
CALENDÁRIO VACINAL — GRUPO GESTANTE
==================================================

Define:

- Quem deve tomar
- Quantas doses
- Quantos reforços

Não define:

- Intervalos
- Campanhas
- Grupos especiais

Essas informações pertencem ao
regrasSeed.ts
*/

export const calendarioVacinalPadrao = [

  /*
  ==================================================
  GESTANTE
  ==================================================
  */
  {
    vacina_codigo: "HEPATITE_B",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 3,
    reforcos: 0,
    observacao: "Conforme situação vacinal"
  },
  {
    vacina_codigo: "DT",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 3,
    reforcos: 0,
    observacao: "Esquema gestacional"
  },
  {
    vacina_codigo: "DTPA",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 0,
    observacao: "Uma dose por gestação"
  },
  {
    vacina_codigo: "INFLUENZA",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 1,
    observacao: "Campanha anual"
  },
  {
    vacina_codigo: "COVID19",
    faixa_etaria: "GESTANTE",
    idade_minima: 10,
    idade_maxima: 59,
    doses: 1,
    reforcos: 1,
    observacao: "Conforme campanha vigente"
  }

];

/*
==================================================
EXECUTAR CALENDÁRIO SEED
==================================================

Faixas etárias (criança, adolescente, adulto, idoso): vêm do
esquema vacinal de 2026 (data/esquemaVacinal2026.ts), a mesma fonte
do cálculo das próximas doses. Quando a versão guardada no banco é
diferente da versão do código, as linhas dessas faixas são trocadas
pelas novas (uma vez só, e de novo só no próximo ano). Edições
feitas pelo administrador nessas linhas são substituídas nessa troca.

Grupo especial GESTANTE: continua vindo da lista abaixo (o calendário
da gestante não faz parte dos calendários de 2026 já incorporados).
*/
const CHAVE_VERSAO = "calendario_versao";

export async function executarCalendarioSeed() {

  await calendarioVacinalRepository
    .removerDuplicatas();

  const versaoNoBanco =
    await configuracaoRepository
      .obterConfiguracao(CHAVE_VERSAO);

  if (versaoNoBanco !== VERSAO_CALENDARIO) {

    await calendarioVacinalRepository
      .removerPorFaixas(
        FAIXAS_CALENDARIO.map((f) => f.faixa)
      );

    for (const linha of derivarCalendarioPorFaixa()) {

      const vacina =
        await vacinaRepository
          .buscarVacinaPorCodigo(
            linha.vacinaCodigo
          );

      const vacinaId =
        (vacina as any)?.id;

      if (!vacinaId) {
        continue;
      }

      await calendarioVacinalRepository
        .criarCalendarioVacinal(
          vacinaId,
          linha.faixa,
          linha.idadeMinima,
          linha.idadeMaxima,
          linha.doses,
          linha.reforcos,
          linha.observacao
        );

    }

    await configuracaoRepository
      .definirConfiguracao(
        CHAVE_VERSAO,
        VERSAO_CALENDARIO
      );

    console.log(
      `Calendário vacinal atualizado para a versão ${VERSAO_CALENDARIO}.`
    );

  }

  for (
    const item
    of calendarioVacinalPadrao.filter(
      (i) => i.faixa_etaria === "GESTANTE"
    )
  ) {

    const vacina =
      await vacinaRepository
        .buscarVacinaPorCodigo(
          item.vacina_codigo
        );

    const vacinaId =
      (vacina as any)?.id;

    if (!vacinaId) {
      continue;
    }

    const jaExiste =
      await calendarioVacinalRepository
        .buscarPorVacinaEFaixa(
          vacinaId,
          item.faixa_etaria
        );

    if (jaExiste) {
      continue;
    }

    await calendarioVacinalRepository
      .criarCalendarioVacinal(
        vacinaId,
        item.faixa_etaria,
        item.idade_minima,
        item.idade_maxima,
        item.doses,
        item.reforcos,
        item.observacao
      );

  }

  console.log(
    "Calendário vacinal carregado."
  );

}
