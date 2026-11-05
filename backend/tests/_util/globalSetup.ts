import { Client } from "pg";

/*
Roda uma vez antes de toda a suíte: garante que o banco de testes exista
e limpa schemas temporários de execuções anteriores interrompidas.

A suíte usa o PostgreSQL. Por padrão, o do docker-compose.yml da raiz:
  docker compose up -d
Outro servidor pode ser indicado em TEST_DATABASE_URL.
*/
export const URL_TESTE =
  process.env.TEST_DATABASE_URL ??
  "postgresql://notifica:notifica_dev@127.0.0.1:5432/notifica_vacinas_teste";

export default async function () {

  const alvo = new URL(URL_TESTE);
  const nomeDoBanco = alvo.pathname.slice(1);

  const admin = new URL(URL_TESTE);
  admin.pathname = "/postgres";

  const cliente = new Client({ connectionString: admin.toString() });

  try {
    await cliente.connect();
  } catch (erro: any) {
    throw new Error(
      "Não consegui conectar ao PostgreSQL de testes (" + erro.message + "). " +
      "Suba o banco com: docker compose up -d"
    );
  }

  const existe = await cliente.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [nomeDoBanco]
  );

  if (!existe.rowCount) {
    await cliente.query(`CREATE DATABASE "${nomeDoBanco}"`);
  }

  await cliente.end();

  const doTeste = new Client({ connectionString: URL_TESTE });
  await doTeste.connect();

  const sobras = await doTeste.query(
    "SELECT nspname FROM pg_namespace WHERE nspname LIKE 't\\_%'"
  );

  for (const { nspname } of sobras.rows) {
    await doTeste.query(`DROP SCHEMA "${nspname}" CASCADE`);
  }

  await doTeste.end();

}
