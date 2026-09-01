import { db } from "../database/database";

/*
==================================================
LISTAR TODOS OS AGENDAMENTOS
==================================================
*/
export function listarAgendamentos(): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM agendamentos_vacina
      ORDER BY data_prevista
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
BUSCAR AGENDAMENTO POR ID
==================================================
*/
export function buscarAgendamentoPorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM agendamentos_vacina
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
LISTAR AGENDAMENTOS DA PESSOA
==================================================
*/
export function listarAgendamentosPessoa(
  pessoaId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT

        av.id,

        av.pessoa_id,

        av.vacina_id,

        av.numero_dose,

        av.data_prevista,

        av.status,

        av.observacao,

        v.codigo,

        v.nome

      FROM agendamentos_vacina av

      INNER JOIN vacinas v
        ON v.id = av.vacina_id

      WHERE av.pessoa_id = ?

      ORDER BY av.data_prevista
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
CRIAR AGENDAMENTO
==================================================
*/
export function criarAgendamento(
  pessoaId: number,
  vacinaId: number,
  numeroDose: number,
  dataPrevista: string,
  observacao?: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO agendamentos_vacina (

        pessoa_id,

        vacina_id,

        numero_dose,

        data_prevista,

        observacao

      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        pessoaId,
        vacinaId,
        numeroDose,
        dataPrevista,
        observacao ?? null
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
ATUALIZAR STATUS
==================================================
*/
export function atualizarStatusAgendamento(
  id: number,
  status: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE agendamentos_vacina

      SET status = ?

      WHERE id = ?
      `,
      [status, id],
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
ATUALIZAR OBSERVAÇÃO
==================================================
*/
export function atualizarObservacaoAgendamento(
  id: number,
  observacao: string
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      UPDATE agendamentos_vacina

      SET observacao = ?

      WHERE id = ?
      `,
      [observacao, id],
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
REMOVER AGENDAMENTO
==================================================
*/
export function removerAgendamento(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM agendamentos_vacina
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
CONTAR AGENDAMENTOS DA PESSOA
==================================================
*/
export function contarAgendamentosPessoa(
  pessoaId: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT COUNT(*) AS total

      FROM agendamentos_vacina

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