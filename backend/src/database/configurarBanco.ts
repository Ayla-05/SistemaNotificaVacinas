import { db } from "./database";

import { criarTabelaUsuarios }
  from "./tables/usuariosTable";

import { criarTabelaPessoas }
  from "./tables/pessoasTable";

import { criarTabelaDependentes }
  from "./tables/dependentesTable";

import { criarTabelaGruposEspeciais }
  from "./tables/gruposEspeciaisTable";

import { criarTabelaPessoaGrupoEspecial }
  from "./tables/pessoaGrupoEspecialTable";

import { criarTabelaVacinas }
  from "./tables/vacinasTable";

import { criarTabelaCalendarioVacinal }
  from "./tables/calendarioVacinalTable";

import { criarTabelaRegrasVacinais }
  from "./tables/regrasVacinaisTable";

import { criarTabelaCampanhasVacinais }
  from "./tables/campanhasVacinaisTable";

import { criarTabelaRegistrosVacinacao }
  from "./tables/registrosVacinacaoTable";

import { criarTabelaDosesVacina }
  from "./tables/dosesVacinaTable";

import { criarTabelaAgendamentosVacina }
  from "./tables/agendamentosVacinaTable";

import * as vacinasSeedModule
  from "./seeds/vacinasSeed";

import * as gruposEspeciaisSeedModule
  from "./seeds/gruposEspeciaisSeed";

import * as calendarioSeedModule
  from "./seeds/calendarioSeed";

import * as regrasSeedModule
  from "./seeds/regrasSeed";

import * as adminSeedModule
  from "./seeds/adminSeed";

const executarVacinasSeed =
  (vacinasSeedModule as any).executarVacinasSeed;

const executarGruposEspeciaisSeed =
  (gruposEspeciaisSeedModule as any)
    .executarGruposEspeciaisSeed;

const executarCalendarioSeed =
  (calendarioSeedModule as any)
    .executarCalendarioSeed;

const executarRegrasSeed =
  (regrasSeedModule as any)
    .executarRegrasSeed;

const executarAdminSeed =
  (adminSeedModule as any)
    .executarAdminSeed;

export async function configurarBanco() {

  console.log(
    "Executando configuração inicial..."
  );

  /*
  ==========================================
  TABELAS
  ==========================================
  */

  criarTabelaUsuarios(db);

  criarTabelaPessoas(db);

  criarTabelaDependentes(db);

  criarTabelaGruposEspeciais(db);

  criarTabelaPessoaGrupoEspecial(db);

  criarTabelaVacinas(db);

  criarTabelaCalendarioVacinal(db);

  criarTabelaRegrasVacinais(db);

  criarTabelaCampanhasVacinais(db);

  criarTabelaRegistrosVacinacao(db);

  criarTabelaDosesVacina(db);

  criarTabelaAgendamentosVacina(db);

  /*
  ==========================================
  AGUARDA SQLITE
  ==========================================
  */

  await new Promise(
    resolve => setTimeout(
      resolve,
      1000
    )
  );

  /*
  ==========================================
  SEEDS
  ==========================================
  */

  await executarVacinasSeed();

  await executarGruposEspeciaisSeed();

  await executarCalendarioSeed();

  await executarRegrasSeed();

  await executarAdminSeed();

  console.log(
    "Configuração concluída."
  );

}