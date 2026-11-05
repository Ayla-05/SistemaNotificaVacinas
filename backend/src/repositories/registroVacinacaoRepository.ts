import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR CARTEIRA DA PESSOA
==================================================
*/
export function listarCarteiraPessoa(
  pessoaId: number
): Promise<any[]> {

  return consultarTodos(
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
    [pessoaId]
  );

}

/*
==================================================
BUSCAR REGISTRO POR ID
==================================================
*/
export function buscarRegistroPorId(
  id: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM registros_vacinacao
      WHERE id = ?
      `,
    [id]
  );

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

  return consultarUm(
    `
      SELECT *
      FROM registros_vacinacao
      WHERE pessoa_id = ?
        AND vacina_id = ?
      `,
    [pessoaId, vacinaId]
  );

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

  return inserir(
    `
      INSERT INTO registros_vacinacao (
        pessoa_id,
        vacina_id
      )
      VALUES (?, ?)
      `,
    [pessoaId, vacinaId]
  );

}

/*
==================================================
REMOVER REGISTRO
==================================================
*/
export function removerRegistroVacinacao(
  id: number
): Promise<number> {

  /* CORREÇÃO [COR-28]: o ON DELETE CASCADE do esquema apaga os dependentes. */
  return alterar(
    `DELETE FROM registros_vacinacao WHERE id = ?`,
    [id]
  );

}

/*
==================================================
CONTAR REGISTROS DA PESSOA
==================================================
*/
export function contarRegistrosPessoa(
  pessoaId: number
): Promise<number> {

  return consultarUm(
    `
      SELECT COUNT(*) AS total
      FROM registros_vacinacao
      WHERE pessoa_id = ?
      `,
    [pessoaId]
  ).then((row) => row?.total ?? 0);

}