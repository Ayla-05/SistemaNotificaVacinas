import { alterar } from "../database/database";

/*
==================================================
AVISO DOSE REPOSITORY
==================================================

Responsabilidades:

- Registrar que uma dose já foi avisada
*/

/*
Tenta registrar o aviso. Devolve true se foi a PRIMEIRA vez
(pode enviar) e false se já existia (não envia de novo).
O INSERT OR IGNORE sobre a chave única faz o papel de trava,
mesmo com duas verificações rodando ao mesmo tempo.
*/
export function registrarAviso(
  pessoaId: number,
  vacinaCodigo: string,
  numeroDose: number,
  dataPrevista: string
): Promise<boolean> {

  return alterar(
    `
      INSERT OR IGNORE INTO avisos_dose (
        pessoa_id, vacina_codigo, numero_dose, data_prevista
      )
      VALUES (?, ?, ?, ?)
      `,
    [pessoaId, vacinaCodigo, numeroDose, dataPrevista]
  ).then((changes) => changes === 1);

}

/* Desfaz o registro (se o e-mail falhar, a dose pode ser avisada de novo amanhã). */
export function removerAviso(
  pessoaId: number,
  vacinaCodigo: string,
  numeroDose: number,
  dataPrevista: string
): Promise<void> {

  return alterar(
    `
      DELETE FROM avisos_dose
      WHERE pessoa_id = ? AND vacina_codigo = ?
        AND numero_dose = ? AND data_prevista = ?
      `,
    [pessoaId, vacinaCodigo, numeroDose, dataPrevista]
  ).then(() => undefined);

}
