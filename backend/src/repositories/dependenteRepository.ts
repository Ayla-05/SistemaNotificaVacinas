import { db } from "../database/database";

/*
==================================================
LISTAR DEPENDENTES DE UM RESPONSÁVEL
==================================================
*/
export function listarDependentes(
  responsavelId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT

        d.id,

        d.parentesco,

        p.id AS pessoa_id,

        p.nome,

        p.data_nascimento,

        p.email,

        p.telefone

      FROM dependentes d

      INNER JOIN pessoas p
        ON p.id = d.dependente_id

      WHERE d.responsavel_id = ?

      ORDER BY p.nome
      `,
      [responsavelId],
      (err, rows) => {

        if (err) {
          return reject(err);
        }

        resolve(rows || []);

      }
    );

  });

}

/*
==================================================
BUSCAR DEPENDENTE POR ID
==================================================
*/
export function buscarDependentePorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM dependentes
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
CRIAR RELACIONAMENTO
==================================================
*/
export function criarDependente(
  responsavelId: number,
  dependenteId: number,
  parentesco: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO dependentes (

        responsavel_id,

        dependente_id,

        parentesco

      )
      VALUES (?, ?, ?)
      `,
      [
        responsavelId,
        dependenteId,
        parentesco
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
VERIFICAR RELACIONAMENTO
==================================================
*/
export function verificarDependente(
  responsavelId: number,
  dependenteId: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *

      FROM dependentes

      WHERE responsavel_id = ?
        AND dependente_id = ?
      `,
      [
        responsavelId,
        dependenteId
      ],
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
ATUALIZAR PARENTESCO
==================================================
*/
export function atualizarParentesco(
  id: number,
  parentesco: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE dependentes
      SET parentesco = ?
      WHERE id = ?
      `,
      [
        parentesco,
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
REMOVER DEPENDENTE
==================================================
*/
export function removerDependente(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM dependentes
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

/*
==================================================
REMOVER RELACIONAMENTO
==================================================
*/
export function removerRelacionamentoDependente(
  responsavelId: number,
  dependenteId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM dependentes

      WHERE responsavel_id = ?
        AND dependente_id = ?
      `,
      [
        responsavelId,
        dependenteId
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