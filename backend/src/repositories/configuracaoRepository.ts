import { alterar, consultarUm } from "../database/database";

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

  return consultarUm(
    `SELECT valor FROM configuracoes WHERE chave = ?`,
    [chave]
  ).then((row) => row ? row.valor : null);

}

export function definirConfiguracao(
  chave: string,
  valor: string
): Promise<void> {

  return alterar(
    `
      INSERT INTO configuracoes (chave, valor)
      VALUES (?, ?)
      ON CONFLICT(chave) DO UPDATE SET valor = excluded.valor
      `,
    [chave, valor]
  ).then(() => undefined);

}
