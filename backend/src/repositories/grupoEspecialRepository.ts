import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

export interface GrupoEspecial {
  id: number;
  nome: string;
  descricao: string;
}

/*
==================================================
LISTAR TODOS OS GRUPOS ESPECIAIS
==================================================
*/
export function listarGruposEspeciais(): Promise<GrupoEspecial[]> {

  return consultarTodos(
    `
      SELECT *
      FROM grupos_especiais
      ORDER BY nome
      `,
    []
  );

}

/*
==================================================
BUSCAR GRUPO POR ID
==================================================
*/
export function buscarGrupoEspecialPorId(
  id: number
): Promise<GrupoEspecial | undefined> {

  return consultarUm(
    `
      SELECT *
      FROM grupos_especiais
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
BUSCAR GRUPO POR NOME
==================================================
*/
export function buscarGrupoEspecialPorNome(
  nome: string
): Promise<GrupoEspecial | undefined> {

  return consultarUm(
    `
      SELECT *
      FROM grupos_especiais
      WHERE nome = ?
      `,
    [nome]
  );

}

/*
==================================================
CRIAR GRUPO ESPECIAL
==================================================
*/
export function criarGrupoEspecial(
  nome: string,
  descricao: string
): Promise<number> {

  return inserir(
    `
      INSERT INTO grupos_especiais (
        nome,
        descricao
      )
      VALUES (?, ?)
      `,
    [nome, descricao]
  );

}

/*
==================================================
ATUALIZAR GRUPO ESPECIAL
==================================================
*/
export function atualizarGrupoEspecial(
  id: number,
  nome: string,
  descricao: string
): Promise<number> {

  return alterar(
    `
      UPDATE grupos_especiais
      SET
        nome = ?,
        descricao = ?
      WHERE id = ?
      `,
    [
        nome,
        descricao,
        id
      ]
  );

}

/*
==================================================
REMOVER GRUPO ESPECIAL
==================================================
*/
export function removerGrupoEspecial(
  id: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM grupos_especiais
      WHERE id = ?
      `,
    [id]
  );

}