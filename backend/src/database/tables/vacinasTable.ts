import sqlite3 from "sqlite3";

export function criarTabelaVacinas(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS vacinas (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      codigo TEXT NOT NULL UNIQUE,

      nome TEXT NOT NULL UNIQUE,

      descricao TEXT,

      doencas_evitadas TEXT,

      ativa INTEGER DEFAULT 1

    )
  `);

}