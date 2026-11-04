import { db } from "./database";

import { criarIndices }
  from "./indices";
import { criarTabelaUsuarios, migrarColunasVerificacaoEmail }
  from "./tables/usuariosTable";

import { criarTabelaPessoas, migrarColunasFrequenciaAviso }
  from "./tables/pessoasTable";

import { criarTabelaDependentes }
  from "./tables/dependentesTable";

import { criarTabelaGruposEspeciais }
  from "./tables/gruposEspeciaisTable";

import { criarTabelaPessoaGrupoEspecial, migrarColunaGestacao }
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

import { criarTabelaSessoes, criarTabelaRedefinicoesSenha, migrarColunasBloqueioLogin }
  from "./tables/sessoesTable";
import { criarTabelaConfiguracoes, criarTabelaAvisosDose }
  from "./tables/calendarioAvisosTable";
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

  /*
  criarTabelaUsuarios + migrarColunasVerificacaoEmail
  precisam rodar em sequência garantida (a migração faz
  ALTER TABLE na tabela que o CREATE TABLE acabou de
  criar) — sem db.serialize(), o driver sqlite3 pode
  disparar os dois em paralelo e a migração falha com
  "no such table" numa base nova.
  */
  /*
  CORREÇÃO [COR-19]: a estrutura era criada "em paralelo" e o código
  esperava 1 segundo fixo (setTimeout) torcendo para terminar —
  lento em todo boot e sujeito a corrida em máquina lenta. Agora
  tudo roda em série e uma consulta final sinaliza o término.
  */
  await new Promise<void>((resolve, reject) => {

    db.serialize(() => {

      criarTabelaUsuarios(db);
      migrarColunasVerificacaoEmail(db);
      migrarColunasBloqueioLogin(db);

      criarTabelaPessoas(db);
      migrarColunasFrequenciaAviso(db);

      criarTabelaDependentes(db);
      criarTabelaGruposEspeciais(db);
      criarTabelaPessoaGrupoEspecial(db);
      migrarColunaGestacao(db);
      criarTabelaVacinas(db);
      criarTabelaCalendarioVacinal(db);
      criarTabelaRegrasVacinais(db);
      criarTabelaCampanhasVacinais(db);
      criarTabelaRegistrosVacinacao(db);
      criarTabelaDosesVacina(db);
      criarTabelaAgendamentosVacina(db);
      criarTabelaSessoes(db);
      criarTabelaRedefinicoesSenha(db);
      criarTabelaConfiguracoes(db);
      criarTabelaAvisosDose(db);

      criarIndices(db);

      /*
      Em modo serial, esta consulta só roda depois de todos
      os comandos acima: é o sinal de que a estrutura está
      pronta (no lugar da antiga espera fixa de 1 s).
      */
      db.get("SELECT 1", (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });

    });

  });

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