import { db } from "../database/database";

/*
==================================================
LISTAR GRUPOS DE UMA PESSOA
==================================================
*/
export function listarGruposDaPessoa(
  pessoaId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT

        ge.id,

        ge.nome,

        ge.descricao

      FROM pessoa_grupo_especial pge

      INNER JOIN grupos_especiais ge
        ON ge.id = pge.grupo_especial_id

      WHERE pge.pessoa_id = ?

      ORDER BY ge.nome
      `,
      [pessoaId],
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
ADICIONAR GRUPO A UMA PESSOA
==================================================
*/
export function adicionarGrupoPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO pessoa_grupo_especial (

        pessoa_id,

        grupo_especial_id

      )
      VALUES (?, ?)
      `,
      [
        pessoaId,
        grupoEspecialId
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
export function existeGrupoNaPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *

      FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
        AND grupo_especial_id = ?
      `,
      [
        pessoaId,
        grupoEspecialId
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
REMOVER GRUPO DE UMA PESSOA
==================================================
*/
export function removerGrupoPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
        AND grupo_especial_id = ?
      `,
      [
        pessoaId,
        grupoEspecialId
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
REMOVER TODOS OS GRUPOS DA PESSOA
==================================================
*/
export function removerTodosOsGruposPessoa(
  pessoaId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
      `,
      [pessoaId],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.changes);

      }
    );

  });

}