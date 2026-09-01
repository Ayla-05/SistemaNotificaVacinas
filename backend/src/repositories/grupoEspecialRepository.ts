import { db } from "../database/database";

export interface GrupoEspecial {
  id: number;
  nome: string;
  descricao: string;
}

/*
==================================================
LISTAR TODOS OS GRUPOS ESPECIAIS
==================================================
*/
export function listarGruposEspeciais(): Promise<GrupoEspecial[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM grupos_especiais
      ORDER BY nome
      `,
      [],
      (err, rows: GrupoEspecial[]) => {

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
BUSCAR GRUPO POR ID
==================================================
*/
export function buscarGrupoEspecialPorId(
  id: number
): Promise<GrupoEspecial | undefined> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM grupos_especiais
      WHERE id = ?
      `,
      [id],
      (err, row: GrupoEspecial) => {

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
BUSCAR GRUPO POR NOME
==================================================
*/
export function buscarGrupoEspecialPorNome(
  nome: string
): Promise<GrupoEspecial | undefined> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM grupos_especiais
      WHERE nome = ?
      `,
      [nome],
      (err, row: GrupoEspecial) => {

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
CRIAR GRUPO ESPECIAL
==================================================
*/
export function criarGrupoEspecial(
  nome: string,
  descricao: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO grupos_especiais (
        nome,
        descricao
      )
      VALUES (?, ?)
      `,
      [nome, descricao],
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
ATUALIZAR GRUPO ESPECIAL
==================================================
*/
export function atualizarGrupoEspecial(
  id: number,
  nome: string,
  descricao: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE grupos_especiais
      SET
        nome = ?,
        descricao = ?
      WHERE id = ?
      `,
      [
        nome,
        descricao,
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
REMOVER GRUPO ESPECIAL
==================================================
*/
export function removerGrupoEspecial(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM grupos_especiais
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