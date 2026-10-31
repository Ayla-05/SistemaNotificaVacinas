import { db } from "../database/database";

/*
==================================================
CONFIGURAÇÃO REPOSITORY
==================================================

Responsabilidades:

- Ler e gravar pares chave/valor (tabela configuracoes)
*/
export function obterConfiguracao(
  chave: string
): Promise<string | null> {

  return new Promise((resolve, reject) => {

    db.get(
      `SELECT valor FROM configuracoes WHERE chave = ?`,
      [chave],
      (err, row: any) => {

        if (err) {
          reject(err);
          return;
        }

        resolve(row ? row.valor : null);

      }
    );

  });

}

export function definirConfiguracao(
  chave: string,
  valor: string
): Promise<void> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      INSERT INTO configuracoes (chave, valor)
      VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor
      `,
      [chave, valor],
      (err) => {

        if (err) {
          reject(err);
          return;
        }

        resolve();

      }
    );

  });

}
