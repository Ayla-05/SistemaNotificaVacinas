import { db } from "../database/database";

/*
==================================================
SESSAO REPOSITORY
==================================================

Responsabilidades:

- Acesso à tabela sessoes (SQL)

NÃO é responsável por:

- Regras de rotação/reuso de refresh token
  (AuthService)
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

function buscarVarias(
  sql: string,
  params: any[] = []
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(sql, params, (err, rows) => {

      if (err) {
        reject(err);
        return;
      }

      resolve(rows || []);

    });

  });

}

export async function criarSessao(sessao: {
  id: string;
  usuarioId: number;
  refreshHash: string;
  userAgent: string | null;
  ip: string | null;
  expiraEm: string;
}): Promise<void> {

  await executar(
    `
    INSERT INTO sessoes (
      id, usuario_id, refresh_hash,
      user_agent, ip, expira_em
    )
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      sessao.id,
      sessao.usuarioId,
      sessao.refreshHash,
      sessao.userAgent,
      sessao.ip,
      sessao.expiraEm
    ]
  );

}

export function buscarSessaoPorId(
  id: string
): Promise<any> {

  return buscarUma(
    `SELECT * FROM sessoes WHERE id = ?`,
    [id]
  );

}

export function buscarPorRefreshHash(
  hash: string
): Promise<any> {

  return buscarUma(
    `SELECT * FROM sessoes WHERE refresh_hash = ?`,
    [hash]
  );

}

export function buscarPorRefreshHashAnterior(
  hash: string
): Promise<any> {

  return buscarUma(
    `SELECT * FROM sessoes WHERE refresh_hash_anterior = ?`,
    [hash]
  );

}

/*
Rotaciona o refresh token. O WHERE confere o hash atual,
então duas renovações simultâneas com o mesmo token não
passam as duas: só a primeira altera a linha.
*/
export async function rotacionarRefresh(
  id: string,
  hashAtual: string,
  novoHash: string,
  novaExpiracao: string
): Promise<boolean> {

  const alteradas = await executar(
    `
    UPDATE sessoes
    SET refresh_hash_anterior = refresh_hash,
        refresh_hash = ?,
        rotacionado_em = CURRENT_TIMESTAMP,
        ultimo_uso = CURRENT_TIMESTAMP,
        expira_em = ?
    WHERE id = ?
      AND refresh_hash = ?
      AND revogada_em IS NULL
    `,
    [novoHash, novaExpiracao, id, hashAtual]
  );

  return alteradas === 1;

}

export function revogarSessao(
  id: string,
  usuarioId?: number
): Promise<number> {

  return executar(
    `
    UPDATE sessoes
    SET revogada_em = CURRENT_TIMESTAMP
    WHERE id = ?
      AND revogada_em IS NULL
      ${usuarioId !== undefined ? "AND usuario_id = ?" : ""}
    `,
    usuarioId !== undefined ? [id, usuarioId] : [id]
  );

}

/*
Revoga todas as sessões do usuário, exceto (opcionalmente)
a informada em "manterId".
*/
export function revogarSessoesDoUsuario(
  usuarioId: number,
  manterId?: string
): Promise<number> {

  return executar(
    `
    UPDATE sessoes
    SET revogada_em = CURRENT_TIMESTAMP
    WHERE usuario_id = ?
      AND revogada_em IS NULL
      ${manterId ? "AND id <> ?" : ""}
    `,
    manterId ? [usuarioId, manterId] : [usuarioId]
  );

}

export function listarSessoesAtivas(
  usuarioId: number
): Promise<any[]> {

  return buscarVarias(
    `
    SELECT id, user_agent, ip, criado_em, ultimo_uso, expira_em
    FROM sessoes
    WHERE usuario_id = ?
      AND revogada_em IS NULL
      AND expira_em > ?
    ORDER BY ultimo_uso DESC
    `,
    [usuarioId, new Date().toISOString()]
  );

}

/*
Limpeza: apaga sessões expiradas/revogadas há mais de 30 dias.
*/
export function apagarSessoesAntigas(): Promise<number> {

  return executar(
    `
    DELETE FROM sessoes
    WHERE COALESCE(revogada_em, expira_em) < datetime('now', '-30 days')
    `
  );

}
