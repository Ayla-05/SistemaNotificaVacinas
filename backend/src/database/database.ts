import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

/*
==================================================
CONEXÃO
==================================================

Arquivo definido em DATABASE_FILE (":memory:" nos testes).
A estrutura das tabelas é criada em configurarBanco().
*/
const ARQUIVO =
  process.env.DATABASE_FILE || "./vacinas.db";

export const db = new sqlite.Database(
  ARQUIVO,
  (err) => {

    if (err) {
      console.error(
        "Erro ao conectar ao banco:",
        err
      );
      return;
    }

    console.log(
      "✅ Banco SQLite conectado"
    );

  }
);

/*
==================================================
AJUSTES DA CONEXÃO (PRAGMAs)
==================================================

- foreign_keys: o SQLite NÃO aplica chaves estrangeiras
  por padrão; sem isto era possível gravar registros
  órfãos (ex.: pessoa de um usuário inexistente).
- busy_timeout: espera até 5 s por um bloqueio em vez de
  falhar na hora com SQLITE_BUSY.
- journal_mode=WAL e synchronous=NORMAL: leituras não
  bloqueiam a escrita e cada gravação custa menos. Só em
  banco de arquivo (em memória não há o que ajustar).
*/
/*
CORREÇÃO [COR-16/20]: o banco rodava com chaves estrangeiras
desligadas (padrão do SQLite) e sem ajustes de concorrência.
*/
db.serialize(() => {

  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA busy_timeout = 5000");

  if (ARQUIVO !== ":memory:") {
    db.run("PRAGMA journal_mode = WAL");
    db.run("PRAGMA synchronous = NORMAL");
  }

});

/*
==================================================
HELPERS DE CONSULTA
==================================================

Embrulham o callback do driver em Promise, para os
repositórios descreverem só o SQL e os parâmetros.
*/
type Parametros = unknown[];

/*
CORREÇÃO [COR-22]: cada repositório repetia ~12 linhas de
new Promise + callback por consulta (120 vezes). Os quatro
helpers abaixo concentram isso; os repositórios caíram de 4478
para ~3100 linhas, só com SQL e parâmetros.
*/

/* SELECT que devolve várias linhas (lista vazia se não houver). */
export function consultarTodos<T = any>(
  sql: string,
  parametros: Parametros = []
): Promise<T[]> {

  return new Promise((resolve, reject) => {

    db.all(sql, parametros, (err, linhas) => {

      if (err) {
        reject(err);
        return;
      }

      resolve((linhas || []) as T[]);

    });

  });

}

/* SELECT que devolve uma linha (undefined se não houver). */
export function consultarUm<T = any>(
  sql: string,
  parametros: Parametros = []
): Promise<T> {

  return new Promise((resolve, reject) => {

    db.get(sql, parametros, (err, linha) => {

      if (err) {
        reject(err);
        return;
      }

      resolve(linha as T);

    });

  });

}

/* INSERT: devolve o id da linha criada. */
export function inserir(
  sql: string,
  parametros: Parametros = []
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(sql, parametros, function (err) {

      if (err) {
        reject(err);
        return;
      }

      resolve(this.lastID);

    });

  });

}

/* UPDATE/DELETE: devolve quantas linhas foram afetadas. */
export function alterar(
  sql: string,
  parametros: Parametros = []
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(sql, parametros, function (err) {

      if (err) {
        reject(err);
        return;
      }

      resolve(this.changes);

    });

  });

}

/*
==================================================
REMOÇÃO EM CASCATA (ATÔMICA)
==================================================

As tabelas foram criadas sem ON DELETE CASCADE e o SQLite
não altera chaves estrangeiras depois de criadas. Por isso,
apagar um registro "pai" exige apagar antes os filhos, tudo
dentro de uma única transação (db.exec roda de forma
exclusiva na conexão, sem outras consultas no meio).

Cada comando usa $ID, trocado pelo id já validado como
inteiro (exec não aceita parâmetros).

Devolve 1 se o registro existia e foi removido, 0 se não.
*/
/* CORREÇÃO [COR-17]: ver explicação acima. */
export async function removerEmCascata(
  tabela: string,
  id: number,
  comandosDosFilhos: string[]
): Promise<number> {

  if (!Number.isInteger(id)) {
    throw new Error("ID inválido.");
  }

  const existente = await consultarUm(
    `SELECT 1 AS achou FROM ${tabela} WHERE id = ?`,
    [id]
  );

  if (!existente) {
    return 0;
  }

  const comandos = [
    ...comandosDosFilhos,
    `DELETE FROM ${tabela} WHERE id = $ID`
  ]
    .map((sql) => sql.replace(/\$ID/g, String(id)))
    .join(";\n");

  await new Promise<void>((resolve, reject) => {

    db.exec(
      `BEGIN IMMEDIATE;\n${comandos};\nCOMMIT;`,
      (err) => {

        if (!err) {
          resolve();
          return;
        }

        /* desfaz o que já tinha rodado; o erro original é o que importa */
        db.exec("ROLLBACK", () => reject(err));

      }
    );

  });

  return 1;

}
