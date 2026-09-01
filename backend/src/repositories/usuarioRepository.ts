import { db } from "../database/database";

/*
==================================================
USUARIO REPOSITORY
==================================================

Responsabilidades:

- Acesso aos dados de usuários
- Execução de consultas SQL
- CRUD de usuários

NÃO é responsável por:

- Regras de negócio
- Requisições HTTP
- Autenticação

Tabela:

usuarios
*/
 
/*
==================================================
LISTAR TODOS OS USUÁRIOS
==================================================
*/
export function listarUsuarios(): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM usuarios
      ORDER BY nome
      `,
      [],
      (err, rows) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(rows || []);

      }
    );

  });

}

/*
==================================================
BUSCAR USUÁRIO POR ID
==================================================
*/
export function buscarUsuarioPorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM usuarios
      WHERE id = ?
      `,
      [id],
      (err, row) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
BUSCAR USUÁRIO POR EMAIL
==================================================
*/
export function buscarUsuarioPorEmail(
  email: string
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM usuarios
      WHERE email = ?
      `,
      [email],
      (err, row) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
CRIAR USUÁRIO
==================================================

Perfis:

- USUARIO
- ADMIN
*/
export function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  perfil: string = "USUARIO"
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO usuarios (
        nome,
        email,
        senha,
        perfil
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        nome,
        email,
        senha,
        perfil
      ],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.lastID);

      }
    );

  });

}

/*
==================================================
ATUALIZAR USUÁRIO
==================================================
*/
export function atualizarUsuario(
  id: number,
  nome: string,
  email: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE usuarios
      SET
        nome = ?,
        email = ?
      WHERE id = ?
      `,
      [
        nome,
        email,
        id
      ],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
ATUALIZAR SENHA
==================================================
*/
export function atualizarSenhaUsuario(
  id: number,
  senha: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE usuarios
      SET senha = ?
      WHERE id = ?
      `,
      [
        senha,
        id
      ],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
ATUALIZAR PERFIL
==================================================

Perfis válidos:

- USUARIO
- ADMIN
*/
export function atualizarPerfilUsuario(
  id: number,
  perfil: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE usuarios
      SET perfil = ?
      WHERE id = ?
      `,
      [
        perfil,
        id
      ],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
DESATIVAR USUÁRIO
==================================================
*/
export function desativarUsuario(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE usuarios
      SET ativo = 0
      WHERE id = ?
      `,
      [id],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
ATIVAR USUÁRIO
==================================================
*/
export function ativarUsuario(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE usuarios
      SET ativo = 1
      WHERE id = ?
      `,
      [id],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
REMOVER USUÁRIO
==================================================
*/
export function removerUsuario(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM usuarios
      WHERE id = ?
      `,
      [id],
      function (err) {

        if (err) {
          reject(err);
          return;
        }

        resolve(this.changes);

      }
    );

  });

}