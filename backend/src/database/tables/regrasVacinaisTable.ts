import sqlite3 from "sqlite3";

export function criarTabelaRegrasVacinais(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS regras_vacinais (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      vacina_id INTEGER NOT NULL,

      grupo_especial_id INTEGER,

      intervalo_dose_1_2 INTEGER,

      intervalo_dose_2_3 INTEGER,

      intervalo_dose_3_4 INTEGER,

      intervalo_dose_reforco INTEGER,

      reforco_anos INTEGER,

      campanha_anual INTEGER DEFAULT 0,

      observacao TEXT,

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id),

      FOREIGN KEY (grupo_especial_id)
        REFERENCES grupos_especiais(id)

    )
  `)};
