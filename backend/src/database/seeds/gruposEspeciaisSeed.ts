/*
==================================================
GRUPOS ESPECIAIS PADRÃO
==================================================

Utilizados para determinar regras vacinais
específicas para determinados públicos.

Uma pessoa pode pertencer a mais de um grupo.

Exemplo:

Maria
├── GESTANTE
└── TRABALHADOR_SAUDE
*/

export const gruposEspeciaisPadrao = [

  {
    nome: "GESTANTE",
    descricao:
      "Pessoa em período gestacional"
  },

  {
    nome: "IDOSO",
    descricao:
      "Pessoa com 60 anos ou mais"
  },

  {
    nome: "TRABALHADOR_SAUDE",
    descricao:
      "Profissional da área da saúde"
  },

  {
    nome: "INDIGENA",
    descricao:
      "Pessoa pertencente a povo indígena"
  },

  {
    nome: "IMUNOCOMPROMETIDO",
    descricao:
      "Pessoa com imunidade reduzida"
  },

  {
    nome: "ESTRANGEIRO",
    descricao:
      "Pessoa sem histórico vacinal nacional"
  }

  

];


import * as grupoEspecialRepository
  from "../../repositories/grupoEspecialRepository";

/*
==================================================
EXECUTAR GRUPOS ESPECIAIS SEED
==================================================
*/
export async function executarGruposEspeciaisSeed() {

  for (
    const grupo
    of gruposEspeciaisPadrao
  ) {

    const existente =
      await grupoEspecialRepository
        .buscarGrupoEspecialPorNome(
          grupo.nome
        );

    if (existente) {
      continue;
    }

    await grupoEspecialRepository
      .criarGrupoEspecial(
        grupo.nome,
        grupo.descricao
      );

  }

  console.log(
    "Grupos especiais carregados."
  );

}