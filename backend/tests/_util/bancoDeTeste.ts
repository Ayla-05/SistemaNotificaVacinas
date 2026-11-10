import { Client } from "pg";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterAll } from "vitest";

import { URL_TESTE } from "./globalSetup";

/*
Roda antes de CADA arquivo de teste: cria um schema PostgreSQL só dele,
aplica nele as migrações reais do Prisma (prisma/migrations) e aponta
DATABASE_URL para esse schema. Assim os arquivos rodam em paralelo sem
se misturar, e o esquema testado é exatamente o de produção.
O schema é apagado ao final.
*/
const schema = `t_${process.pid}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const pastaMigracoes = resolve(__dirname, "../../prisma/migrations");

const cliente = new Client({ connectionString: URL_TESTE });
await cliente.connect();

await cliente.query(`CREATE SCHEMA "${schema}"`);
await cliente.query(`SET search_path TO "${schema}"`);

for (const pasta of readdirSync(pastaMigracoes).sort()) {

  if (pasta.endsWith(".toml")) {
    continue;
  }

  await cliente.query(
    readFileSync(join(pastaMigracoes, pasta, "migration.sql"), "utf8")
  );

}

await cliente.end();

const separador = URL_TESTE.includes("?") ? "&" : "?";

process.env.DATABASE_URL =
  `${URL_TESTE}${separador}options=${encodeURIComponent(`-c search_path=${schema}`)}`;

afterAll(async () => {

  const { fecharBanco } = await import("../../src/database/database");
  await fecharBanco();

  const limpeza = new Client({ connectionString: URL_TESTE });
  await limpeza.connect();
  await limpeza.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await limpeza.end();

});
