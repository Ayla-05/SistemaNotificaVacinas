import { Pool, PoolClient, types } from "pg";

/*
==================================================
CONEXÃO COM O POSTGRESQL
==================================================

A conexão vem de DATABASE_URL (ver .env.example). A estrutura das
tabelas NÃO é criada aqui: ela é definida em prisma/schema.prisma e
aplicada pelas migrações versionadas (npm run db:migrar).

CORREÇÃO [COR-27]: o sistema migrou do SQLite (arquivo local, escrita
única, migrações por ALTER TABLE à mão) para o PostgreSQL, com o esquema
e as migrações a cargo do Prisma.
*/

/*
COUNT(*) e SUM() chegam do PostgreSQL como bigint, e o driver os entrega
como texto para não perder precisão. Os totais do sistema são pequenos,
então viram número, como os repositórios sempre esperaram.
*/
types.setTypeParser(20, (valor) => Number(valor));

const URL_DO_BANCO = process.env.DATABASE_URL;

if (!URL_DO_BANCO) {
  console.error(
    "DATABASE_URL não definida. Copie backend/.env.example para backend/.env " +
    "e suba o PostgreSQL (docker compose up -d)."
  );
}

export const pool = new Pool({
  connectionString: URL_DO_BANCO,
  max: Number(process.env.DB_POOL_MAX) || 10
});

/* Erro em conexão ociosa não pode derrubar o processo. */
pool.on("error", (erro) => {
  console.error("Erro numa conexão ociosa do banco:", erro.message);
});

/*
==================================================
HELPERS DE CONSULTA
==================================================

Os repositórios escrevem o SQL com "?" como marcador de parâmetro (como
sempre fizeram); aqui ele vira $1, $2... do PostgreSQL. Os valores
NUNCA são concatenados no texto da consulta.
*/
type Parametros = unknown[];

/*
Data e hora atuais em UTC, no formato de texto que o sistema sempre usou
("AAAA-MM-DD HH:MM:SS"). Use no lugar de CURRENT_TIMESTAMP em colunas de
texto: no PostgreSQL, CURRENT_TIMESTAMP viraria "2026-11-05 03:14:15.123456+00",
que o código não sabe ler (CORREÇÃO COR-29).
*/
export const AGORA_UTC =
  "to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS')";

/* Troca cada "?" fora de aspas simples por $1, $2... */
export function numerarParametros(sql: string): string {

  let saida = "";
  let n = 0;
  let dentroDeTexto = false;

  for (const caractere of sql) {

    if (caractere === "'") {
      dentroDeTexto = !dentroDeTexto;
    }

    saida +=
      caractere === "?" && !dentroDeTexto
        ? `$${++n}`
        : caractere;

  }

  return saida;

}

type Executor = Pick<Pool | PoolClient, "query">;

async function executar(
  executor: Executor,
  sql: string,
  parametros: Parametros
) {
  return executor.query(numerarParametros(sql), parametros as any[]);
}

/* SELECT que devolve várias linhas (lista vazia se não houver). */
export async function consultarTodos<T = any>(
  sql: string,
  parametros: Parametros = []
): Promise<T[]> {
  return (await executar(pool, sql, parametros)).rows as T[];
}

/* SELECT que devolve uma linha (undefined se não houver). */
export async function consultarUm<T = any>(
  sql: string,
  parametros: Parametros = []
): Promise<T> {
  return (await executar(pool, sql, parametros)).rows[0] as T;
}

/* INSERT: devolve o id da linha criada (a tabela precisa ter coluna "id"). */
export async function inserir(
  sql: string,
  parametros: Parametros = []
): Promise<number> {

  const comRetorno = /\bRETURNING\b/i.test(sql)
    ? sql
    : `${sql.trim().replace(/;$/, "")} RETURNING id`;

  const resultado = await executar(pool, comRetorno, parametros);

  return Number(resultado.rows[0]?.id ?? 0);

}

/* UPDATE/DELETE/INSERT sem retorno: devolve quantas linhas foram afetadas. */
export async function alterar(
  sql: string,
  parametros: Parametros = []
): Promise<number> {
  return (await executar(pool, sql, parametros)).rowCount ?? 0;
}

/*
==================================================
TRANSAÇÃO
==================================================

Roda os passos em uma única conexão, com BEGIN/COMMIT e ROLLBACK em
caso de erro. Dentro de "passos" use o objeto recebido (e não os
helpers acima), para tudo ficar na mesma transação.
*/
export async function emTransacao<T>(
  passos: (tx: {
    consultarTodos: <R = any>(sql: string, p?: Parametros) => Promise<R[]>;
    consultarUm: <R = any>(sql: string, p?: Parametros) => Promise<R>;
    alterar: (sql: string, p?: Parametros) => Promise<number>;
  }) => Promise<T>
): Promise<T> {

  const cliente = await pool.connect();

  try {

    await cliente.query("BEGIN");

    const resultado = await passos({
      consultarTodos: async (sql, p = []) =>
        (await executar(cliente, sql, p)).rows,
      consultarUm: async (sql, p = []) =>
        (await executar(cliente, sql, p)).rows[0],
      alterar: async (sql, p = []) =>
        (await executar(cliente, sql, p)).rowCount ?? 0
    });

    await cliente.query("COMMIT");

    return resultado;

  } catch (erro) {

    await cliente.query("ROLLBACK").catch(() => undefined);

    throw erro;

  } finally {

    cliente.release();

  }

}

/* Encerra o pool (testes e desligamento do servidor). */
export async function fecharBanco(): Promise<void> {
  await pool.end();
}
