import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR TODAS AS CAMPANHAS
==================================================
*/
export function listarCampanhasVacinais(): Promise<any[]> {

  return consultarTodos(
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
    []
  );

}

/*
==================================================
BUSCAR CAMPANHA POR ID
==================================================
*/
export function buscarCampanhaPorId(
  id: number
): Promise<any> {

  return consultarUm(
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
    [id]
  );

}

/*
==================================================
LISTAR CAMPANHAS ATIVAS
==================================================
*/
export function listarCampanhasAtivas(): Promise<any[]> {

  return consultarTodos(
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
    []
  );

}

/*
==================================================
LISTAR CAMPANHAS POR VACINA
==================================================
*/
export function listarCampanhasPorVacina(
  vacinaId: number
): Promise<any[]> {

  return consultarTodos(
    `
      SELECT *
      FROM campanhas_vacinais
      WHERE vacina_id = ?
      ORDER BY data_inicio DESC
      `,
    [vacinaId]
  );

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

  return inserir(
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
      ]
  );

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

  return alterar(
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
      ]
  );

}

/*
==================================================
ATIVAR CAMPANHA
==================================================
*/
export function ativarCampanha(
  id: number
): Promise<number> {

  return alterar(
    `
      UPDATE campanhas_vacinais
      SET ativa = 1
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
DESATIVAR CAMPANHA
==================================================
*/
export function desativarCampanha(
  id: number
): Promise<number> {

  return alterar(
    `
      UPDATE campanhas_vacinais
      SET ativa = 0
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
REMOVER CAMPANHA
==================================================
*/
export function removerCampanha(
  id: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM campanhas_vacinais
      WHERE id = ?
      `,
    [id]
  );

}