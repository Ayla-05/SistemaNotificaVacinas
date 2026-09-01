import sqlite3 from "sqlite3";

export function criarTabelaCampanhasVacinais(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS campanhas_vacinais (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      vacina_id INTEGER NOT NULL,

      nome TEXT NOT NULL,

      data_inicio TEXT,

      data_fim TEXT,

      publico_alvo TEXT,

      ativa INTEGER DEFAULT 1,

      fonte TEXT,

      ultima_atualizacao TEXT,

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)

    )
  `);

}