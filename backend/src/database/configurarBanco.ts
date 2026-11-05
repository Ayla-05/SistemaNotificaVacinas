import { consultarUm } from "./database";

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

/*
==================================================
CONFIGURAÇÃO INICIAL DO BANCO
==================================================

CORREÇÃO [COR-27]: a criação das tabelas e os ALTER TABLE à mão
saíram daqui. A estrutura vem do Prisma (prisma/schema.prisma) e é
aplicada pelas migrações versionadas, ANTES do servidor subir:

  npm run db:migrar

Este módulo só confere se a estrutura existe e carrega os catálogos
(vacinas, grupos especiais, calendário, regras e administrador
inicial) por seeds idempotentes.
*/
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

/* Falha cedo, com a providência, se o banco não tem as tabelas. */
async function conferirEstrutura() {

  try {

    await consultarUm("SELECT 1 FROM usuarios LIMIT 1");

  } catch (erro: any) {

    throw new Error(
      "Não foi possível acessar as tabelas do banco (" + erro.message + "). " +
      "Confira a DATABASE_URL, suba o PostgreSQL (docker compose up -d) e " +
      "aplique as migrações com: npm run db:migrar"
    );

  }

}

export async function configurarBanco() {

  console.log(
    "Executando configuração inicial..."
  );

  await conferirEstrutura();

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
