import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR GRUPOS DE UMA PESSOA
==================================================
*/
export function listarGruposDaPessoa(
  pessoaId: number
): Promise<any[]> {

  return consultarTodos(
    `
      SELECT

        ge.id,

        ge.nome,

        ge.descricao

      FROM pessoa_grupo_especial pge

      INNER JOIN grupos_especiais ge
        ON ge.id = pge.grupo_especial_id

      WHERE pge.pessoa_id = ?

      ORDER BY ge.nome
      `,
    [pessoaId]
  );

}

/*
==================================================
ADICIONAR GRUPO A UMA PESSOA
==================================================
*/
export function adicionarGrupoPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<number> {

  return inserir(
    `
      INSERT INTO pessoa_grupo_especial (

        pessoa_id,

        grupo_especial_id

      )
      VALUES (?, ?)
      `,
    [
        pessoaId,
        grupoEspecialId
      ]
  );

}

/*
==================================================
VERIFICAR RELACIONAMENTO
==================================================
*/
export function existeGrupoNaPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *

      FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
        AND grupo_especial_id = ?
      `,
    [
        pessoaId,
        grupoEspecialId
      ]
  );

}

/*
==================================================
REMOVER GRUPO DE UMA PESSOA
==================================================
*/
export function removerGrupoPessoa(
  pessoaId: number,
  grupoEspecialId: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
        AND grupo_especial_id = ?
      `,
    [
        pessoaId,
        grupoEspecialId
      ]
  );

}

/*
==================================================
REMOVER TODOS OS GRUPOS DA PESSOA
==================================================
*/
export function removerTodosOsGruposPessoa(
  pessoaId: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM pessoa_grupo_especial

      WHERE pessoa_id = ?
      `,
    [pessoaId]
  );

}