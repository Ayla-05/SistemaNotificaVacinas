import sqlite3 from "sqlite3";

export function criarTabelaDependentes(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS dependentes (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      responsavel_id INTEGER NOT NULL,

      dependente_id INTEGER NOT NULL,

      parentesco TEXT NOT NULL,

      FOREIGN KEY (responsavel_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (dependente_id)
        REFERENCES pessoas(id)

    )
  `);

}