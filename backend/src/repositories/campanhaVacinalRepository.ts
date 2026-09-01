import { db } from "../database/database";

/*
==================================================
LISTAR TODAS AS CAMPANHAS
==================================================
*/
export function listarCampanhasVacinais(): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT
        cv.*,
        v.codigo AS vacina_codigo,
        v.nome AS vacina_nome
      FROM campanhas_vacinais cv
      INNER JOIN vacinas v
        ON v.id = cv.vacina_id
      ORDER BY cv.data_inicio DESC
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
BUSCAR CAMPANHA POR ID
==================================================
*/
export function buscarCampanhaPorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT
        cv.*,
        v.codigo AS vacina_codigo,
        v.nome AS vacina_nome
      FROM campanhas_vacinais cv
      INNER JOIN vacinas v
        ON v.id = cv.vacina_id
      WHERE cv.id = ?
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
LISTAR CAMPANHAS ATIVAS
==================================================
*/
export function listarCampanhasAtivas(): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT
        cv.*,
        v.codigo AS vacina_codigo,
        v.nome AS vacina_nome
      FROM campanhas_vacinais cv
      INNER JOIN vacinas v
        ON v.id = cv.vacina_id
      WHERE cv.ativa = 1
      ORDER BY cv.data_inicio DESC
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
LISTAR CAMPANHAS POR VACINA
==================================================
*/
export function listarCampanhasPorVacina(
  vacinaId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM campanhas_vacinais
      WHERE vacina_id = ?
      ORDER BY data_inicio DESC
      `,
      [vacinaId],
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
CRIAR CAMPANHA
==================================================
*/
export function criarCampanhaVacinal(
  vacinaId: number,
  nome: string,
  dataInicio: string | null,
  dataFim: string | null,
  publicoAlvo: string | null,
  fonte: string | null,
  ultimaAtualizacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO campanhas_vacinais (
        vacina_id,
        nome,
        data_inicio,
        data_fim,
        publico_alvo,
        fonte,
        ultima_atualizacao
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        vacinaId,
        nome,
        dataInicio,
        dataFim,
        publicoAlvo,
        fonte,
        ultimaAtualizacao
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
ATUALIZAR CAMPANHA
==================================================
*/
export function atualizarCampanhaVacinal(
  id: number,
  nome: string,
  dataInicio: string | null,
  dataFim: string | null,
  publicoAlvo: string | null,
  fonte: string | null,
  ultimaAtualizacao: string | null
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE campanhas_vacinais
      SET
        nome = ?,
        data_inicio = ?,
        data_fim = ?,
        publico_alvo = ?,
        fonte = ?,
        ultima_atualizacao = ?
      WHERE id = ?
      `,
      [
        nome,
        dataInicio,
        dataFim,
        publicoAlvo,
        fonte,
        ultimaAtualizacao,
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
ATIVAR CAMPANHA
==================================================
*/
export function ativarCampanha(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE campanhas_vacinais
      SET ativa = 1
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
DESATIVAR CAMPANHA
==================================================
*/
export function desativarCampanha(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE campanhas_vacinais
      SET ativa = 0
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
REMOVER CAMPANHA
==================================================
*/
export function removerCampanha(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM campanhas_vacinais
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