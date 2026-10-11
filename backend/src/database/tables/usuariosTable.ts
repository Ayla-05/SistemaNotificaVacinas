import sqlite3 from "sqlite3";

/*
==================================================
USUÁRIOS
==================================================

Responsáveis pelo acesso ao sistema.

Um usuário pode possuir:
- A própria carteira vacinal
- Filhos
- Pais
- Outros dependentes

Perfis:

USUARIO
- Utiliza o sistema normalmente

ADMIN
- Gerencia vacinas
- Gerencia campanhas
- Gerencia calendário vacinal
- Gerencia regras vacinais
*/
export function criarTabelaUsuarios(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL,

      email TEXT NOT NULL UNIQUE,

      senha TEXT NOT NULL,

      perfil TEXT NOT NULL DEFAULT 'USUARIO',

      ativo INTEGER DEFAULT 1,

      email_verificado INTEGER DEFAULT 0,

      codigo_verificacao TEXT,

      codigo_verificacao_expira TEXT,

      criado_em TEXT DEFAULT CURRENT_TIMESTAMP

    )
  `);

}

/*
==================================================
MIGRAÇÃO: COLUNAS DE VERIFICAÇÃO DE E-MAIL
==================================================

Para bancos já existentes, criados antes da
verificação por e-mail existir (CREATE TABLE
IF NOT EXISTS não altera tabelas já criadas).

SQLite não tem "ADD COLUMN IF NOT EXISTS" — o
jeito é tentar adicionar e ignorar o erro de
"coluna já existe" nas vezes seguintes.
*/
export function migrarColunasVerificacaoEmail(
  db: sqlite3.Database
) {

  const colunas = [
    /*
    DEFAULT 1 aqui (diferente do CREATE TABLE, que usa 0):
    contas que já existiam antes desta migração nunca
    passaram pela verificação, então não faz sentido
    bloqueá-las agora. Só cadastros novos nascem com 0.
    */
    "ALTER TABLE usuarios ADD COLUMN email_verificado INTEGER DEFAULT 1",
    "ALTER TABLE usuarios ADD COLUMN codigo_verificacao TEXT",
    "ALTER TABLE usuarios ADD COLUMN codigo_verificacao_expira TEXT"
  ];

  for (const sql of colunas) {

    db.run(sql, (erro) => {

      if (erro && !/duplicate column/i.test(erro.message)) {

        console.error(
          "Erro ao migrar coluna de verificação de e-mail:",
          erro.message
        );

      }

    });

  }

}