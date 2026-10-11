import { db } from "../database/database";

/*
==================================================
LISTAR TODAS AS DOSES DE UM REGISTRO
==================================================
*/
export function listarDosesRegistro(
  registroVacinacaoId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM doses_vacina
      WHERE registro_vacinacao_id = ?
      ORDER BY numero_dose
      `,
      [registroVacinacaoId],
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
BUSCAR DOSE POR ID
==================================================
*/
export function buscarDosePorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM doses_vacina
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
BUSCAR DOSE ESPECÍFICA
==================================================
*/
export function buscarDose(
  registroVacinacaoId: number,
  numeroDose: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM doses_vacina
      WHERE registro_vacinacao_id = ?
        AND numero_dose = ?
      `,
      [
        registroVacinacaoId,
        numeroDose
      ],
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
REGISTRAR DOSE
==================================================
*/
export function registrarDose(
  registroVacinacaoId: number,
  numeroDose: number,
  tipo: string,
  detalhes?: {
    dataAplicacao?: string | null;
    lote?: string | null;
    observacao?: string | null;
  }
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO doses_vacina (
        registro_vacinacao_id,
        numero_dose,
        tipo,
        data_aplicacao,
        lote,
        observacao
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        registroVacinacaoId,
        numeroDose,
        tipo,
        detalhes?.dataAplicacao ?? null,
        detalhes?.lote ?? null,
        detalhes?.observacao ?? null
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
ATUALIZAR DOSE
==================================================
*/
export function atualizarDose(
  id: number,
  numeroDose: number,
  tipo: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE doses_vacina
      SET
        numero_dose = ?,
        tipo = ?
      WHERE id = ?
      `,
      [
        numeroDose,
        tipo,
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
REMOVER DOSE
==================================================
*/
export function removerDose(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM doses_vacina
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
CONTAR DOSES DE UM REGISTRO
==================================================
*/
export function contarDoses(
  registroVacinacaoId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT COUNT(*) AS total
      FROM doses_vacina
      WHERE registro_vacinacao_id = ?
      `,
      [registroVacinacaoId],
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

/*
==================================================
MAIOR NÚMERO DE DOSE REGISTRADO
==================================================

Diferente de contarDoses (quantas linhas existem),
isso reflete quantas doses a pessoa efetivamente já
tomou segundo o que foi declarado: se a pessoa já
registra a vacina direto como "3ª dose" (sem ter
registrado a 1ª e a 2ª individualmente antes), esse
único registro já conta como 3 doses cumpridas.
*/
export function obterMaiorNumeroDose(
  registroVacinacaoId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT MAX(numero_dose) AS maior
      FROM doses_vacina
      WHERE registro_vacinacao_id = ?
      `,
      [registroVacinacaoId],
      (err, row: any) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(row?.maior ?? 0);

      }
    );

  });

}