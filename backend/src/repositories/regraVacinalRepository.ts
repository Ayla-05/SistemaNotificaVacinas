import { db } from "../database/database";

export interface RegraVacinal {
  id: number;

  vacina_id: number;

  grupo_especial_id: number | null;

  intervalo_dose_1_2: number | null;

  intervalo_dose_2_3: number | null;

  intervalo_dose_3_4: number | null;

  intervalo_dose_reforco: number | null;

  reforco_anos: number | null;

  campanha_anual: number;

  observacao: string | null;
}

/*
==================================================
LISTAR TODAS AS REGRAS
==================================================
*/
export function listarRegrasVacinais(): Promise<
  RegraVacinal[]
> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM regras_vacinais
      ORDER BY vacina_id
      `,
      [],
      (
        err,
        rows: RegraVacinal[]
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
BUSCAR REGRA POR ID
==================================================
*/
export function buscarRegraPorId(
  id: number
): Promise<
  RegraVacinal | undefined
> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM regras_vacinais
      WHERE id = ?
      `,
      [id],
      (
        err,
        row: RegraVacinal
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
BUSCAR REGRA POR VACINA
==================================================
*/
export function buscarRegraPorVacina(
  vacinaId: number
): Promise<
  RegraVacinal | undefined
> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
        AND grupo_especial_id IS NULL
      `,
      [vacinaId],
      (
        err,
        row: RegraVacinal
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
BUSCAR REGRA POR VACINA E GRUPO
==================================================
*/
export function buscarRegraPorVacinaEGrupo(
  vacinaId: number,
  grupoEspecialId: number
): Promise<
  RegraVacinal | undefined
> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
        AND grupo_especial_id = ?
      `,
      [
        vacinaId,
        grupoEspecialId
      ],
      (
        err,
        row: RegraVacinal
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
LISTAR REGRAS DE UMA VACINA
==================================================
*/
export function listarRegrasDaVacina(
  vacinaId: number
): Promise<
  RegraVacinal[]
> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
      ORDER BY grupo_especial_id
      `,
      [vacinaId],
      (
        err,
        rows: RegraVacinal[]
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
CRIAR REGRA VACINAL
==================================================
*/
export function criarRegraVacinal(
  vacinaId: number,
  grupoEspecialId: number | null,
  intervaloDose12: number | null,
  intervaloDose23: number | null,
  intervaloDose34: number | null,
  intervaloDoseReforco: number | null,
  reforcoAnos: number | null,
  campanhaAnual: number,
  observacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO regras_vacinais (

        vacina_id,

        grupo_especial_id,

        intervalo_dose_1_2,

        intervalo_dose_2_3,

        intervalo_dose_3_4,

        intervalo_dose_reforco,

        reforco_anos,

        campanha_anual,

        observacao

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vacinaId,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
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
ATUALIZAR REGRA VACINAL
==================================================
*/
export function atualizarRegraVacinal(
  id: number,
  grupoEspecialId: number | null,
  intervaloDose12: number | null,
  intervaloDose23: number | null,
  intervaloDose34: number | null,
  intervaloDoseReforco: number | null,
  reforcoAnos: number | null,
  campanhaAnual: number,
  observacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE regras_vacinais
      SET

        grupo_especial_id = ?,

        intervalo_dose_1_2 = ?,

        intervalo_dose_2_3 = ?,

        intervalo_dose_3_4 = ?,

        intervalo_dose_reforco = ?,

        reforco_anos = ?,

        campanha_anual = ?,

        observacao = ?

      WHERE id = ?
      `,
      [
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
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
REMOVER REGRA VACINAL
==================================================
*/
export function removerRegraVacinal(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM regras_vacinais
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