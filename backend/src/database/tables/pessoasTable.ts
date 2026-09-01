import sqlite3 from "sqlite3";

export function criarTabelaPessoas(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS pessoas (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      usuario_id INTEGER NOT NULL,

      nome TEXT NOT NULL,

      email TEXT,

      telefone TEXT,

      data_nascimento TEXT NOT NULL,

      cep TEXT,
      logradouro TEXT,
      numero TEXT,
      complemento TEXT,
      bairro TEXT,
      cidade TEXT,
      estado TEXT,

      foto_perfil TEXT,

      receber_email INTEGER DEFAULT 1,

      receber_whatsapp INTEGER DEFAULT 1,

      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)

    )
  `);

}