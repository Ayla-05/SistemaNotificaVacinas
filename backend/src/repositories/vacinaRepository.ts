import { db } from "../database/database";

/*
==================================================
LISTAR TODAS AS VACINAS
==================================================
*/
export function listarTodasVacinas() {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM vacinas
      ORDER BY nome
      `,
      [],
      (err, rows) => {

        if (err) {
          return reject(err);
        }

        resolve(rows);

      }
    );

  });

}

/*
==================================================
LISTAR VACINAS ATIVAS
==================================================
*/
export function listarVacinasAtivas() {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM vacinas
      WHERE ativa = 1
      ORDER BY nome
      `,
      [],
      (err, rows) => {

        if (err) {
          return reject(err);
        }

        resolve(rows);

      }
    );

  });

}

/*
==================================================
BUSCAR POR ID
==================================================
*/
export function buscarVacinaPorId(
  id: number
) {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM vacinas
      WHERE id = ?
      `,
      [id],
      (err, row) => {

        if (err) {
          return reject(err);
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
BUSCAR POR CÓDIGO
==================================================
*/
export function buscarVacinaPorCodigo(
  codigo: string
) {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM vacinas
      WHERE codigo = ?
      `,
      [codigo],
      (err, row) => {

        if (err) {
          return reject(err);
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
BUSCAR POR NOME
==================================================
*/
export function buscarVacinaPorNome(
  nome: string
) {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM vacinas
      WHERE nome = ?
      `,
      [nome],
      (err, row) => {

        if (err) {
          return reject(err);
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
CRIAR VACINA
==================================================
*/
export function criarVacina(
  codigo: string,
  nome: string,
  descricao: string,
  doencasEvitadas: string
) {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO vacinas (
        codigo,
        nome,
        descricao,
        doencas_evitadas
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        codigo,
        nome,
        descricao,
        doencasEvitadas
      ],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.lastID);

      }
    );

  });

}

/*
==================================================
ATUALIZAR VACINA
==================================================
*/
export function atualizarVacina(
  id: number,
  nome: string,
  descricao: string,
  doencasEvitadas: string
) {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE vacinas
      SET
        nome = ?,
        descricao = ?,
        doencas_evitadas = ?
      WHERE id = ?
      `,
      [
        nome,
        descricao,
        doencasEvitadas,
        id
      ],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
DESATIVAR VACINA
==================================================
*/
export function desativarVacina(
  id: number
) {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE vacinas
      SET ativa = 0
      WHERE id = ?
      `,
      [id],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.changes);

      }
    );

  });

}