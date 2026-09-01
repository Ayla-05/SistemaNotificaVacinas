import { db } from "../database/database";

/*
==================================================
LISTAR CARTEIRA DA PESSOA
==================================================
*/
export function listarCarteiraPessoa(
  pessoaId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT
        rv.id,
        rv.pessoa_id,
        rv.vacina_id,
        rv.data_registro,
        v.codigo,
        v.nome,
        v.descricao,
        v.doencas_evitadas
      FROM registros_vacinacao rv

      INNER JOIN vacinas v
        ON v.id = rv.vacina_id

      WHERE rv.pessoa_id = ?

      ORDER BY v.nome
      `,
      [pessoaId],
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
BUSCAR REGISTRO POR ID
==================================================
*/
export function buscarRegistroPorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM registros_vacinacao
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
BUSCAR REGISTRO DA PESSOA E VACINA
==================================================
*/
export function buscarRegistroPessoaVacina(
  pessoaId: number,
  vacinaId: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM registros_vacinacao
      WHERE pessoa_id = ?
        AND vacina_id = ?
      `,
      [pessoaId, vacinaId],
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
CRIAR REGISTRO
==================================================
*/
export function criarRegistroVacinacao(
  pessoaId: number,
  vacinaId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO registros_vacinacao (
        pessoa_id,
        vacina_id
      )
      VALUES (?, ?)
      `,
      [pessoaId, vacinaId],
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
REMOVER REGISTRO
==================================================
*/
export function removerRegistroVacinacao(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM registros_vacinacao
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
CONTAR REGISTROS DA PESSOA
==================================================
*/
export function contarRegistrosPessoa(
  pessoaId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT COUNT(*) AS total
      FROM registros_vacinacao
      WHERE pessoa_id = ?
      `,
      [pessoaId],
      (err, row: any) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(row?.total ?? 0);

      }
    );

  });

}