import sqlite3 from "sqlite3";

export function criarTabelaDosesVacina(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS doses_vacina (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      registro_vacinacao_id INTEGER NOT NULL,

      numero_dose INTEGER NOT NULL,

      tipo TEXT,

      data_aplicacao TEXT,

      lote TEXT,

      fabricante TEXT,

      observacao TEXT,

      FOREIGN KEY (registro_vacinacao_id)
        REFERENCES registros_vacinacao(id)

    )
  `);

}