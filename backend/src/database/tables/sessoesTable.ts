import sqlite3 from "sqlite3";

/*
==================================================
SESSÕES
==================================================

Uma linha por login (dispositivo/navegador).

O refresh token nunca é guardado: só o hash.
"refresh_hash_anterior" permite detectar o reuso de
um refresh token já rotacionado (sinal de roubo).
*/
export function criarTabelaSessoes(
  db: sqlite3.Database
) {

  /* Em série: o índice precisa nascer depois da tabela. */
  db.serialize(() => {

    db.run(`
      CREATE TABLE IF NOT EXISTS sessoes (
        id TEXT PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        refresh_hash TEXT NOT NULL UNIQUE,
        refresh_hash_anterior TEXT,
        rotacionado_em TEXT,
        user_agent TEXT,
        ip TEXT,
        criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        ultimo_uso TEXT DEFAULT CURRENT_TIMESTAMP,
        expira_em TEXT NOT NULL,
        revogada_em TEXT,
        FOREIGN KEY (usuario_id)
          REFERENCES usuarios(id)
      )
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_sessoes_usuario
      ON sessoes(usuario_id)
    `);

    db.run(`
      CREATE INDEX IF NOT EXISTS idx_sessoes_refresh_anterior
      ON sessoes(refresh_hash_anterior)
    `);


  });

}

/*
==================================================
REDEFINIÇÃO DE SENHA
==================================================

Token de uso único, guardado só como hash.
*/
export function criarTabelaRedefinicoesSenha(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS redefinicoes_senha (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      expira_em TEXT NOT NULL,
      usado_em TEXT,
      FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
    )
  `);

}

/*
==================================================
BLOQUEIO DE CONTA (colunas em usuarios)
==================================================

Mesmo padrão de migrarColunasVerificacaoEmail:
SQLite não tem "ADD COLUMN IF NOT EXISTS".
*/
export function migrarColunasBloqueioLogin(
  db: sqlite3.Database
) {

  const colunas = [
    "ALTER TABLE usuarios ADD COLUMN tentativas_falhas INTEGER DEFAULT 0",
    "ALTER TABLE usuarios ADD COLUMN bloqueado_ate TEXT"
  ];

  for (const sql of colunas) {

    db.run(sql, (erro) => {

      if (erro && !/duplicate column/i.test(erro.message)) {

        console.error(
          "Erro ao migrar colunas de bloqueio de login:",
          erro.message
        );

      }

    });

  }

}
