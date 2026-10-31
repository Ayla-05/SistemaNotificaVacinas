import sqlite3 from "sqlite3";

/*
==================================================
CONFIGURAÇÕES
==================================================

Chave/valor. Hoje guarda a versão do calendário carregada no
banco ("calendario_versao"), para o seed saber quando precisa
atualizar a tabela calendario_vacinal.
*/
export function criarTabelaConfiguracoes(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS configuracoes (
      chave TEXT PRIMARY KEY,
      valor TEXT NOT NULL
    )
  `);

}

/*
==================================================
AVISOS DE DOSE ENVIADOS
==================================================

Uma linha por aviso "sua dose está chegando". A chave única
(pessoa, vacina, nº da dose, data prevista) garante que cada
dose é avisada uma vez só, mesmo que a verificação rode todo
dia. Se a data prevista mudar (ex.: a dose anterior foi tomada
mais tarde), vale um novo aviso.
*/
export function criarTabelaAvisosDose(
  db: sqlite3.Database
) {

  db.run(`
    CREATE TABLE IF NOT EXISTS avisos_dose (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pessoa_id INTEGER NOT NULL,
      vacina_codigo TEXT NOT NULL,
      numero_dose INTEGER NOT NULL,
      data_prevista TEXT NOT NULL,
      enviado_em TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (pessoa_id, vacina_codigo, numero_dose, data_prevista),
      FOREIGN KEY (pessoa_id)
        REFERENCES pessoas(id)
    )
  `);

}
