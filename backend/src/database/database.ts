import sqlite3 from "sqlite3";

const sqlite = sqlite3.verbose();

export const db = new sqlite.Database("./vacinas.db", (err) => {
  if (err) {
    console.error("Erro ao conectar no banco:", err);
    return;
  }

  console.log("Banco SQLite conectado");
});

db.serialize(() => {

  // =========================
  // TABELA VACINAS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS vacinas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      descricao TEXT,
      doencas_evitadas TEXT,
      ativa INTEGER DEFAULT 1
    )
  `);

  // =========================
  // TABELA CALENDÁRIO VACINAL
  // =========================
  db.run(`
  CREATE TABLE IF NOT EXISTS calendario_vacinal (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    vacina_id INTEGER NOT NULL,

    faixa_etaria TEXT NOT NULL,

    idade_minima INTEGER,

    idade_maxima INTEGER,

    doses INTEGER,

    reforcos INTEGER,

    observacao TEXT,

    FOREIGN KEY (vacina_id)
      REFERENCES vacinas(id)

  )
  `);

  
// =========================
// TABELA REGRAS VACINAIS
// =========================
db.run(`
  CREATE TABLE IF NOT EXISTS regras_vacinais (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    vacina_id INTEGER NOT NULL,

    intervalo_dose_1_2 INTEGER,

    intervalo_dose_2_3 INTEGER,

    intervalo_dose_3_4 INTEGER,

    intervalo_dose_reforco INTEGER,

    reforco_anos INTEGER,

    campanha_anual INTEGER DEFAULT 0,

    idade_minima INTEGER,

    idade_maxima INTEGER,

    grupo_especial TEXT,

    observacao TEXT,

    FOREIGN KEY (vacina_id)
      REFERENCES vacinas(id)

  )
`);


// =========================
// TABELA CAMPANHAS VACINAIS
// =========================
db.run(`
  CREATE TABLE IF NOT EXISTS campanhas_vacinais (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    vacina_id INTEGER NOT NULL,

    nome TEXT NOT NULL,

    data_inicio TEXT,

    data_fim TEXT,

    publico_alvo TEXT,

    ativa INTEGER DEFAULT 1,

    fonte TEXT,

    ultima_atualizacao TEXT,

    FOREIGN KEY (vacina_id)
      REFERENCES vacinas(id)

  )
`);

  // =========================
  // TABELA PESSOAS
  // =========================
  db.run(`
  CREATE TABLE IF NOT EXISTS pessoas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    nome TEXT NOT NULL,

    email TEXT UNIQUE,

    data_nascimento TEXT NOT NULL,

    telefone TEXT,

    cep TEXT,

    logradouro TEXT,

    numero TEXT,

    complemento TEXT,

    bairro TEXT,

    cidade TEXT,

    estado TEXT,

    receber_email INTEGER DEFAULT 1,

    receber_whatsapp INTEGER DEFAULT 1,

    foto_perfil TEXT,

    gestante INTEGER DEFAULT 0,

    trabalhador_saude INTEGER DEFAULT 0,

    indigena INTEGER DEFAULT 0,

    imunocomprometido INTEGER DEFAULT 0
  )
`);

  // =========================
  // TABELA REGISTRO DE VACINAS
  // =========================
  db.run(`
    CREATE TABLE IF NOT EXISTS registros_vacinacao (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      pessoa_id INTEGER NOT NULL,

      vacina_id INTEGER NOT NULL,

      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id),

      FOREIGN KEY (vacina_id)
        REFERENCES vacinas(id)
    )
  `);

 // =========================
// TABELA DOSES
// =========================
db.run(`
  CREATE TABLE IF NOT EXISTS doses_vacina (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    registro_vacinacao_id INTEGER NOT NULL,

    numero_dose INTEGER NOT NULL,

    tipo TEXT,

    FOREIGN KEY (registro_vacinacao_id)
      REFERENCES registros_vacinacao(id)

  )
`);

// =========================
// TABELA AGENDAMENTOS
// =========================
db.run(`
  CREATE TABLE IF NOT EXISTS agendamentos_vacina (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    pessoa_id INTEGER NOT NULL,

    vacina_id INTEGER NOT NULL,

    numero_dose INTEGER NOT NULL,

    data_prevista TEXT NOT NULL,

    status TEXT DEFAULT 'PENDENTE',

    observacao TEXT,

    FOREIGN KEY (pessoa_id)
      REFERENCES pessoas(id),

    FOREIGN KEY (vacina_id)
      REFERENCES vacinas(id)

  )
`);
  

  // =========================
  // VACINAS INICIAIS
  // =========================
  const vacinas = [
    "BCG",
    "Hepatite A",
    "Hepatite B",
    "Penta",
    "DTP",
    "dT",
    "dTpa",
    "Poliomielite VIP",
    "Rotavírus Humano",
    "Febre Amarela",
    "Tríplice Viral SCR",
    "Varicela",
    "HPV4",
    "Influenza",
    "COVID-19",
    "Meningocócica C",
    "Meningocócica ACWY",
    "Pneumocócica 10-valente",
    "Pneumocócica 20-valente",
    "Dengue DNG4"
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO vacinas(nome)
    VALUES(?)
  `);

  vacinas.forEach((vacina) => {
    stmt.run(vacina);
  });

  stmt.finalize();
});

