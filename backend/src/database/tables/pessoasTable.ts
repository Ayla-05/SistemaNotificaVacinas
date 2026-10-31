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
      frequencia_aviso TEXT DEFAULT 'UMA_VEZ',
      ultimo_resumo_em TEXT,

      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)

    )
  `);

}

/*
Bancos criados antes da frequência de aviso não têm as colunas
(CREATE TABLE IF NOT EXISTS não altera tabela existente). Mesmo
padrão de migrarColunasVerificacaoEmail: tenta adicionar e ignora
o erro de "coluna já existe".
*/
export function migrarColunasFrequenciaAviso(
  db: sqlite3.Database
) {

  const colunas = [
    "ALTER TABLE pessoas ADD COLUMN frequencia_aviso TEXT DEFAULT 'UMA_VEZ'",
    "ALTER TABLE pessoas ADD COLUMN ultimo_resumo_em TEXT"
  ];

  for (const sql of colunas) {

    db.run(sql, (erro) => {

      if (erro && !/duplicate column/i.test(erro.message)) {

        console.error(
          "Erro ao migrar colunas de frequência de aviso:",
          erro.message
        );

      }

    });

  }

}
