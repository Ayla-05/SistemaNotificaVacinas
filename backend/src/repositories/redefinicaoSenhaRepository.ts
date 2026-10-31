import { db } from "../database/database";

/*
==================================================
REDEFINICAO SENHA REPOSITORY
==================================================

Responsabilidades:

- Acesso à tabela redefinicoes_senha (SQL)
*/

function executar(
  sql: string,
  params: any[] = []
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(sql, params, function (err) {

      if (err) {
        reject(err);
        return;
      }

      resolve(this.changes);

    });

  });

}

function buscarUma(
  sql: string,
  params: any[] = []
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(sql, params, (err, row) => {

      if (err) {
        reject(err);
        return;
      }

      resolve(row);

    });

  });

}

export async function criarToken(
  usuarioId: number,
  tokenHash: string,
  expiraEm: string
): Promise<void> {

  /*
  Só o pedido mais recente vale: invalida os anteriores.
  */
  await executar(
    `
    UPDATE redefinicoes_senha
    SET usado_em = CURRENT_TIMESTAMP
    WHERE usuario_id = ? AND usado_em IS NULL
    `,
    [usuarioId]
  );

  await executar(
    `
    INSERT INTO redefinicoes_senha (usuario_id, token_hash, expira_em)
    VALUES (?, ?, ?)
    `,
    [usuarioId, tokenHash, expiraEm]
  );

}

export function buscarPorHash(
  tokenHash: string
): Promise<any> {

  return buscarUma(
    `SELECT * FROM redefinicoes_senha WHERE token_hash = ?`,
    [tokenHash]
  );

}

/*
Uso único: o WHERE "usado_em IS NULL" garante que dois
envios simultâneos do mesmo link não passam os dois.
*/
export async function marcarComoUsado(
  id: number
): Promise<boolean> {

  const alteradas = await executar(
    `
    UPDATE redefinicoes_senha
    SET usado_em = CURRENT_TIMESTAMP
    WHERE id = ? AND usado_em IS NULL
    `,
    [id]
  );

  return alteradas === 1;

}

export function buscarUltimoPedidoDoUsuario(
  usuarioId: number
): Promise<any> {

  return buscarUma(
    `
    SELECT criado_em
    FROM redefinicoes_senha
    WHERE usuario_id = ?
    ORDER BY id DESC
    LIMIT 1
    `,
    [usuarioId]
  );

}
