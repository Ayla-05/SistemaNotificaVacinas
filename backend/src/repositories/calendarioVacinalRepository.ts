import { db } from "../database/database";

export interface CalendarioVacinal {
  id: number;

  vacina_id: number;

  faixa_etaria: string;

  idade_minima: number;

  idade_maxima: number;

  doses: number;

  reforcos: number;

  observacao: string | null;
}

/*
==================================================
LISTAR TODO O CALENDÁRIO
==================================================
*/
export function listarCalendarioVacinal(): Promise<
  CalendarioVacinal[]
> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM calendario_vacinal
      ORDER BY faixa_etaria
      `,
      [],
      (
        err,
        rows: CalendarioVacinal[]
      ) => {

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
export function buscarCalendarioPorId(
  id: number
): Promise<
  CalendarioVacinal | undefined
> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM calendario_vacinal
      WHERE id = ?
      `,
      [id],
      (
        err,
        row: CalendarioVacinal
      ) => {

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
LISTAR POR FAIXA ETÁRIA
==================================================
*/
export function listarPorFaixaEtaria(
  faixaEtaria: string
): Promise<
  CalendarioVacinal[]
> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM calendario_vacinal
      WHERE faixa_etaria = ?
      ORDER BY vacina_id
      `,
      [faixaEtaria],
      (
        err,
        rows: CalendarioVacinal[]
      ) => {

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
LISTAR POR VACINA
==================================================
*/
export function listarPorVacina(
  vacinaId: number
): Promise<
  CalendarioVacinal[]
> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM calendario_vacinal
      WHERE vacina_id = ?
      `,
      [vacinaId],
      (
        err,
        rows: CalendarioVacinal[]
      ) => {

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
CRIAR REGISTRO NO CALENDÁRIO
==================================================
*/
export function criarCalendarioVacinal(
  vacinaId: number,
  faixaEtaria: string,
  idadeMinima: number,
  idadeMaxima: number,
  doses: number,
  reforcos: number,
  observacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO calendario_vacinal (
        vacina_id,
        faixa_etaria,
        idade_minima,
        idade_maxima,
        doses,
        reforcos,
        observacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vacinaId,
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao
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
ATUALIZAR REGISTRO
==================================================
*/
export function atualizarCalendarioVacinal(
  id: number,
  faixaEtaria: string,
  idadeMinima: number,
  idadeMaxima: number,
  doses: number,
  reforcos: number,
  observacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE calendario_vacinal
      SET
        faixa_etaria = ?,
        idade_minima = ?,
        idade_maxima = ?,
        doses = ?,
        reforcos = ?,
        observacao = ?
      WHERE id = ?
      `,
      [
        faixaEtaria,
        idadeMinima,
        idadeMaxima,
        doses,
        reforcos,
        observacao,
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
REMOVER REGISTRO
==================================================
*/
export function removerCalendarioVacinal(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM calendario_vacinal
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