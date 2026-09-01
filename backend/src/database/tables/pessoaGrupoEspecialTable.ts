import sqlite3 from "sqlite3";

export function criarTabelaPessoaGrupoEspecial(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS pessoa_grupo_especial (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      pessoa_id INTEGER NOT NULL,

      grupo_especial_id INTEGER NOT NULL,

      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (grupo_especial_id)
        REFERENCES grupos_especiais(id)

    )
  `);

}