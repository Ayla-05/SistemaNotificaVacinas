import sqlite3 from "sqlite3";

export function criarTabelaAgendamentosVacina(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS agendamentos_vacina (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      pessoa_id INTEGER NOT NULL,

      vacina_id INTEGER NOT NULL,

      numero_dose INTEGER NOT NULL,

      data_prevista TEXT NOT NULL,

      status TEXT DEFAULT 'PENDENTE',

      observacao TEXT,

      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)

    )
  `);

}