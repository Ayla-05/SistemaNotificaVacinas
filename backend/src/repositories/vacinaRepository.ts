import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR TODAS AS VACINAS
==================================================
*/
export function listarTodasVacinas() {

  return consultarTodos(
    `
      SELECT *
      FROM vacinas
      ORDER BY nome
      `,
    []
  );

}

/*
==================================================
LISTAR VACINAS ATIVAS
==================================================
*/
export function listarVacinasAtivas() {

  return consultarTodos(
    `
      SELECT *
      FROM vacinas
      WHERE ativa = 1
      ORDER BY nome
      `,
    []
  );

}

/*
==================================================
BUSCAR POR ID
==================================================
*/
export function buscarVacinaPorId(
  id: number
) {

  return consultarUm(
    `
      SELECT *
      FROM vacinas
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
BUSCAR POR CÓDIGO
==================================================
*/
export function buscarVacinaPorCodigo(
  codigo: string
) {

  return consultarUm(
    `
      SELECT *
      FROM vacinas
      WHERE codigo = ?
      `,
    [codigo]
  );

}

/*
==================================================
BUSCAR POR NOME
==================================================
*/
export function buscarVacinaPorNome(
  nome: string
) {

  return consultarUm(
    `
      SELECT *
      FROM vacinas
      WHERE nome = ?
      `,
    [nome]
  );

}

/*
==================================================
CRIAR VACINA
==================================================
*/
export function criarVacina(
  codigo: string,
  nome: string,
  descricao: string,
  doencasEvitadas: string
) {

  return inserir(
    `
      INSERT INTO vacinas (
        codigo,
        nome,
        descricao,
        doencas_evitadas
      )
      VALUES (?, ?, ?, ?)
      `,
    [
        codigo,
        nome,
        descricao,
        doencasEvitadas
      ]
  );

}

/*
==================================================
ATUALIZAR VACINA
==================================================
*/
export function atualizarVacina(
  id: number,
  nome: string,
  descricao: string,
  doencasEvitadas: string
) {

  return alterar(
    `
      UPDATE vacinas
      SET
        nome = ?,
        descricao = ?,
        doencas_evitadas = ?
      WHERE id = ?
      `,
    [
        nome,
        descricao,
        doencasEvitadas,
        id
      ]
  );

}

/*
==================================================
DESATIVAR VACINA
==================================================
*/
export function desativarVacina(
  id: number
) {

  return alterar(
    `
      UPDATE vacinas
      SET ativa = 0
      WHERE id = ?
      `,
    [id]
  );

}