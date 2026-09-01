import sqlite3 from "sqlite3";

export function criarTabelaRegistrosVacinacao(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS registros_vacinacao (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      pessoa_id INTEGER NOT NULL,

      vacina_id INTEGER NOT NULL,

      data_registro TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)

    )
  `);

}