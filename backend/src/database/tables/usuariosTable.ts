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

      criado_em TEXT DEFAULT CURRENT_TIMESTAMP

    )
  `);

}