import sqlite3 from "sqlite3";

export function criarTabelaCalendarioVacinal(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS calendario_vacinal (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      vacina_id INTEGER NOT NULL,

      faixa_etaria TEXT NOT NULL,

      idade_minima INTEGER,

      idade_maxima INTEGER,

      doses INTEGER,

      reforcos INTEGER,

      observacao TEXT,

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)

    )
  `);

}