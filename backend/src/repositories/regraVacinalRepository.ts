import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

export interface RegraVacinal {
  id: number;

  vacina_id: number;

  grupo_especial_id: number | null;

  intervalo_dose_1_2: number | null;

  intervalo_dose_2_3: number | null;

  intervalo_dose_3_4: number | null;

  intervalo_dose_reforco: number | null;

  reforco_anos: number | null;

  campanha_anual: number;

  observacao: string | null;
}

/*
==================================================
LISTAR TODAS AS REGRAS
==================================================
*/
export function listarRegrasVacinais(): Promise<
  RegraVacinal[]
> {

  return consultarTodos(
    `
      SELECT *
      FROM regras_vacinais
      ORDER BY vacina_id
      `,
    []
  );

}

/*
==================================================
BUSCAR REGRA POR ID
==================================================
*/
export function buscarRegraPorId(
  id: number
): Promise<
  RegraVacinal | undefined
> {

  return consultarUm(
    `
      SELECT *
      FROM regras_vacinais
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
BUSCAR REGRA POR VACINA
==================================================
*/
export function buscarRegraPorVacina(
  vacinaId: number
): Promise<
  RegraVacinal | undefined
> {

  return consultarUm(
    `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
        AND grupo_especial_id IS NULL
      `,
    [vacinaId]
  );

}

/*
==================================================
BUSCAR REGRA POR VACINA E GRUPO
==================================================
*/
export function buscarRegraPorVacinaEGrupo(
  vacinaId: number,
  grupoEspecialId: number
): Promise<
  RegraVacinal | undefined
> {

  return consultarUm(
    `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
        AND grupo_especial_id = ?
      `,
    [
        vacinaId,
        grupoEspecialId
      ]
  );

}

/*
==================================================
LISTAR REGRAS DE UMA VACINA
==================================================
*/
export function listarRegrasDaVacina(
  vacinaId: number
): Promise<
  RegraVacinal[]
> {

  return consultarTodos(
    `
      SELECT *
      FROM regras_vacinais
      WHERE vacina_id = ?
      ORDER BY grupo_especial_id
      `,
    [vacinaId]
  );

}

/*
==================================================
CRIAR REGRA VACINAL
==================================================
*/
export function criarRegraVacinal(
  vacinaId: number,
  grupoEspecialId: number | null,
  intervaloDose12: number | null,
  intervaloDose23: number | null,
  intervaloDose34: number | null,
  intervaloDoseReforco: number | null,
  reforcoAnos: number | null,
  campanhaAnual: number,
  observacao: string | null
): Promise<number> {

  return inserir(
    `
      INSERT INTO regras_vacinais (

        vacina_id,

        grupo_especial_id,

        intervalo_dose_1_2,

        intervalo_dose_2_3,

        intervalo_dose_3_4,

        intervalo_dose_reforco,

        reforco_anos,

        campanha_anual,

        observacao

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    [
        vacinaId,
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao
      ]
  );

}

/*
==================================================
ATUALIZAR REGRA VACINAL
==================================================
*/
export function atualizarRegraVacinal(
  id: number,
  grupoEspecialId: number | null,
  intervaloDose12: number | null,
  intervaloDose23: number | null,
  intervaloDose34: number | null,
  intervaloDoseReforco: number | null,
  reforcoAnos: number | null,
  campanhaAnual: number,
  observacao: string | null
): Promise<number> {

  return alterar(
    `
      UPDATE regras_vacinais
      SET

        grupo_especial_id = ?,

        intervalo_dose_1_2 = ?,

        intervalo_dose_2_3 = ?,

        intervalo_dose_3_4 = ?,

        intervalo_dose_reforco = ?,

        reforco_anos = ?,

        campanha_anual = ?,

        observacao = ?

      WHERE id = ?
      `,
    [
        grupoEspecialId,
        intervaloDose12,
        intervaloDose23,
        intervaloDose34,
        intervaloDoseReforco,
        reforcoAnos,
        campanhaAnual,
        observacao,
        id
      ]
  );

}

/*
==================================================
REMOVER REGRA VACINAL
==================================================
*/
export function removerRegraVacinal(
  id: number
): Promise<number> {

  return alterar(
    `
      DELETE FROM regras_vacinais
      WHERE id = ?
      `,
    [id]
  );

}