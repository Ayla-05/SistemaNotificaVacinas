import sqlite3 from "sqlite3";

/*
==================================================
GRUPOS ESPECIAIS TABLE
==================================================

Responsabilidades:

- Criar tabela de grupos especiais
- Armazenar categorias de risco
- Permitir associação com pessoas

Exemplos:

- Gestante
- Imunossuprimido
- Profissional de Saúde
- Indígena
- Idoso

Dependências:

- sqlite3
*/
export function criarTabelaGruposEspeciais(
  db: sqlite3.Database
) {

  db.run(
    `
    CREATE TABLE IF NOT EXISTS grupos_especiais (

      id INTEGER PRIMARY KEY AUTOINCREMENT,

      nome TEXT NOT NULL UNIQUE,

      descricao TEXT

    )
    `,
    (erro) => {

      if (erro) {

        console.error(
          "Erro ao criar tabela grupos_especiais:",
          erro.message
        );

        return;

      }

      console.log(
        "Tabela grupos_especiais criada."
      );


      

    }



    
  );


  

}


