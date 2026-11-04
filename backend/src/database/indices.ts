import sqlite3 from "sqlite3";

/*
==================================================
ÍNDICES
==================================================

O SQLite não cria índice para chave estrangeira. Sem eles,
toda busca "da pessoa X" ou "da vacina Y" varre a tabela
inteira — e a verificação de chave estrangeira ao apagar
uma linha "pai" também.

Os índices UNIQUE reforçam no banco regras que o código já
assumia (uma vacina por pessoa na carteira, uma dose de cada
número por registro, um grupo especial por pessoa). Se uma
base antiga já tiver duplicatas, o UNIQUE não é criado (o
erro é registrado) e o índice comum equivalente é usado.
*/
/* CORREÇÃO [COR-18]: antes não havia nenhum índice além das PK/UNIQUE. */
const INDICES: { nome: string; sql: string; fallback?: string }[] = [
  {
    nome: "idx_pessoas_usuario",
    sql: "CREATE INDEX IF NOT EXISTS idx_pessoas_usuario ON pessoas (usuario_id)"
  },
  {
    nome: "idx_dependentes_responsavel",
    sql: "CREATE INDEX IF NOT EXISTS idx_dependentes_responsavel ON dependentes (responsavel_id)"
  },
  {
    nome: "idx_dependentes_dependente",
    sql: "CREATE INDEX IF NOT EXISTS idx_dependentes_dependente ON dependentes (dependente_id)"
  },
  {
    nome: "ux_pessoa_grupo",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS ux_pessoa_grupo ON pessoa_grupo_especial (pessoa_id, grupo_especial_id)",
    fallback: "CREATE INDEX IF NOT EXISTS idx_pessoa_grupo ON pessoa_grupo_especial (pessoa_id, grupo_especial_id)"
  },
  {
    nome: "idx_pessoa_grupo_grupo",
    sql: "CREATE INDEX IF NOT EXISTS idx_pessoa_grupo_grupo ON pessoa_grupo_especial (grupo_especial_id)"
  },
  {
    nome: "ux_registro_pessoa_vacina",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS ux_registro_pessoa_vacina ON registros_vacinacao (pessoa_id, vacina_id)",
    fallback: "CREATE INDEX IF NOT EXISTS idx_registro_pessoa_vacina ON registros_vacinacao (pessoa_id, vacina_id)"
  },
  {
    nome: "idx_registro_vacina",
    sql: "CREATE INDEX IF NOT EXISTS idx_registro_vacina ON registros_vacinacao (vacina_id)"
  },
  {
    nome: "ux_dose_registro_numero",
    sql: "CREATE UNIQUE INDEX IF NOT EXISTS ux_dose_registro_numero ON doses_vacina (registro_vacinacao_id, numero_dose)",
    fallback: "CREATE INDEX IF NOT EXISTS idx_dose_registro_numero ON doses_vacina (registro_vacinacao_id, numero_dose)"
  },
  {
    nome: "idx_agendamento_pessoa_data",
    sql: "CREATE INDEX IF NOT EXISTS idx_agendamento_pessoa_data ON agendamentos_vacina (pessoa_id, data_prevista)"
  },
  {
    nome: "idx_agendamento_vacina",
    sql: "CREATE INDEX IF NOT EXISTS idx_agendamento_vacina ON agendamentos_vacina (vacina_id)"
  },
  {
    nome: "idx_agendamento_status_data",
    sql: "CREATE INDEX IF NOT EXISTS idx_agendamento_status_data ON agendamentos_vacina (status, data_prevista)"
  },
  {
    nome: "idx_calendario_vacina",
    sql: "CREATE INDEX IF NOT EXISTS idx_calendario_vacina ON calendario_vacinal (vacina_id)"
  },
  {
    nome: "idx_calendario_faixa",
    sql: "CREATE INDEX IF NOT EXISTS idx_calendario_faixa ON calendario_vacinal (faixa_etaria)"
  },
  {
    nome: "idx_regras_vacina",
    sql: "CREATE INDEX IF NOT EXISTS idx_regras_vacina ON regras_vacinais (vacina_id, grupo_especial_id)"
  },
  {
    nome: "idx_regras_grupo",
    sql: "CREATE INDEX IF NOT EXISTS idx_regras_grupo ON regras_vacinais (grupo_especial_id)"
  },
  {
    nome: "idx_campanhas_vacina",
    sql: "CREATE INDEX IF NOT EXISTS idx_campanhas_vacina ON campanhas_vacinais (vacina_id)"
  },
  {
    nome: "idx_redefinicoes_usuario",
    sql: "CREATE INDEX IF NOT EXISTS idx_redefinicoes_usuario ON redefinicoes_senha (usuario_id)"
  }
];

/* Deve rodar dentro de db.serialize(), depois de criar as tabelas. */
export function criarIndices(db: sqlite3.Database) {

  for (const indice of INDICES) {

    db.run(indice.sql, (err) => {

      if (!err) {
        return;
      }

      console.error(
        `Erro ao criar o índice ${indice.nome}:`,
        err.message
      );

      if (indice.fallback) {
        db.run(indice.fallback);
      }

    });

  }

}
