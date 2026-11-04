import sqlite3 from "sqlite3";

export function criarTabelaPessoaGrupoEspecial(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS pessoa_grupo_especial (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      pessoa_id INTEGER NOT NULL,

      grupo_especial_id INTEGER NOT NULL,

      gestacao_inicio TEXT,

      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (grupo_especial_id)
        REFERENCES grupos_especiais(id)

    )
  `);

}

/*
Data estimada do início da gestação (AAAA-MM-DD), só usada no grupo GESTANTE.
Bancos antigos não têm a coluna; mesmo padrão das outras migrações: tenta
adicionar e ignora o erro de "coluna já existe".
*/
export function migrarColunaGestacao(
  db: sqlite3.Database
) {

  db.run(
    "ALTER TABLE pessoa_grupo_especial ADD COLUMN gestacao_inicio TEXT",
    (erro) => {

      if (erro && !/duplicate column/i.test(erro.message)) {

        console.error(
          "Erro ao migrar a coluna da gestação:",
          erro.message
        );

      }

    }
  );

}
