import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR TODOS OS AGENDAMENTOS
==================================================
*/
export function listarAgendamentos(): Promise<any[]> {

  return consultarTodos(
    `
      SELECT *
      FROM agendamentos_vacina
      ORDER BY data_prevista
      `,
    []
  );

}

/*
==================================================
BUSCAR AGENDAMENTO POR ID
==================================================
*/
export function buscarAgendamentoPorId(
  id: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM agendamentos_vacina
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
LISTAR AGENDAMENTOS DA PESSOA
==================================================
*/
export function listarAgendamentosPessoa(
  pessoaId: number
): Promise<any[]> {

  return consultarTodos(
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

        v.nome AS vacina

      FROM agendamentos_vacina av

      INNER JOIN vacinas v
        ON v.id = av.vacina_id

      WHERE av.pessoa_id = ?

      ORDER BY av.data_prevista
      `,
    [pessoaId]
  );

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

  return inserir(
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
      ]
  );

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

  return alterar(
    `
      UPDATE agendamentos_vacina

      SET status = ?

      WHERE id = ?
      `,
    [status, id]
  );

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

  return alterar(
    `
      UPDATE agendamentos_vacina

      SET observacao = ?

      WHERE id = ?
      `,
    [observacao, id]
  );

}

/*
==================================================
REMOVER AGENDAMENTO
==================================================
*/
export function removerAgendamento(
  id: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM agendamentos_vacina
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
CONTAR AGENDAMENTOS DA PESSOA
==================================================
*/
export function contarAgendamentosPessoa(
  pessoaId: number
): Promise<number> {

  return consultarUm(
    `
      SELECT COUNT(*) AS total

      FROM agendamentos_vacina

      WHERE pessoa_id = ?
      `,
    [pessoaId]
  ).then((row) => row?.total ?? 0);

}