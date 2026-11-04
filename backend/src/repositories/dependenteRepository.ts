import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR DEPENDENTES DE UM RESPONSÁVEL
==================================================
*/
export function listarDependentes(
  responsavelId: number
): Promise<any[]> {

  return consultarTodos(
    `
      SELECT

        d.id,

        d.parentesco,

        p.id AS pessoa_id,

        p.nome,

        p.data_nascimento,

        p.email,

        p.telefone

      FROM dependentes d

      INNER JOIN pessoas p
        ON p.id = d.dependente_id

      WHERE d.responsavel_id = ?

      ORDER BY p.nome
      `,
    [responsavelId]
  );

}

/*
==================================================
BUSCAR DEPENDENTE POR ID
==================================================
*/
export function buscarDependentePorId(
  id: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM dependentes
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
CRIAR RELACIONAMENTO
==================================================
*/
export function criarDependente(
  responsavelId: number,
  dependenteId: number,
  parentesco: string
): Promise<number> {

  return inserir(
    `
      INSERT INTO dependentes (

        responsavel_id,

        dependente_id,

        parentesco

      )
      VALUES (?, ?, ?)
      `,
    [
        responsavelId,
        dependenteId,
        parentesco
      ]
  );

}

/*
==================================================
VERIFICAR RELACIONAMENTO
==================================================
*/
export function verificarDependente(
  responsavelId: number,
  dependenteId: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *

      FROM dependentes

      WHERE responsavel_id = ?
        AND dependente_id = ?
      `,
    [
        responsavelId,
        dependenteId
      ]
  );

}

/*
==================================================
ATUALIZAR PARENTESCO
==================================================
*/
export function atualizarParentesco(
  id: number,
  parentesco: string
): Promise<number> {

  return alterar(
    `
      UPDATE dependentes
      SET parentesco = ?
      WHERE id = ?
      `,
    [
        parentesco,
        id
      ]
  );

}

/*
==================================================
REMOVER DEPENDENTE
==================================================
*/
export function removerDependente(
  id: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM dependentes
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
REMOVER RELACIONAMENTO
==================================================
*/
export function removerRelacionamentoDependente(
  responsavelId: number,
  dependenteId: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM dependentes

      WHERE responsavel_id = ?
        AND dependente_id = ?
      `,
    [
        responsavelId,
        dependenteId
      ]
  );

}