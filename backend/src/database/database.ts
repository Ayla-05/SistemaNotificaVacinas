import sqlite3 from "sqlite3";

import { criarTabelaUsuarios } from "./tables/usuariosTable";
import { criarTabelaPessoas } from "./tables/pessoasTable";
import { criarTabelaDependentes } from "./tables/dependentesTable";

import { criarTabelaGruposEspeciais } from "./tables/gruposEspeciaisTable";
import { criarTabelaPessoaGrupoEspecial } from "./tables/pessoaGrupoEspecialTable";

import { criarTabelaVacinas } from "./tables/vacinasTable";
import { criarTabelaCalendarioVacinal } from "./tables/calendarioVacinalTable";
import { criarTabelaRegrasVacinais } from "./tables/regrasVacinaisTable";
import { criarTabelaCampanhasVacinais } from "./tables/campanhasVacinaisTable";

import { criarTabelaRegistrosVacinacao } from "./tables/registrosVacinacaoTable";
import { criarTabelaDosesVacina } from "./tables/dosesVacinaTable";
import { criarTabelaAgendamentosVacina } from "./tables/agendamentosVacinaTable";

const sqlite = sqlite3.verbose();

/*
==================================================
CONEXÃO
==================================================
*/
export const db = new sqlite.Database(
  "./vacinas.db",
  (err) => {
    if (err) {
      console.error(
        "Erro ao conectar ao banco:",
        err
      );

      return;
    }

    console.log(
      "✅ Banco SQLite conectado"
    );
  }
);

/*
==================================================
CRIAR ESTRUTURA DO BANCO
==================================================
*/
export function inicializarBanco() {

  db.serialize(() => {

    console.log(
      "📦 Criando estrutura do banco..."
    );

    /*
    ==============================================
    USUÁRIOS
    ==============================================
    */
    criarTabelaUsuarios(db);

    /*
    ==============================================
    PESSOAS
    ==============================================
    */
    criarTabelaPessoas(db);

    /*
    ==============================================
    DEPENDENTES
    ==============================================
    */
    criarTabelaDependentes(db);

    /*
    ==============================================
    GRUPOS ESPECIAIS
    ==============================================
    */
    criarTabelaGruposEspeciais(db);

    criarTabelaPessoaGrupoEspecial(db);

    /*
    ==============================================
    VACINAS
    ==============================================
    */
    criarTabelaVacinas(db);

    /*
    ==============================================
    CALENDÁRIO VACINAL
    ==============================================
    */
    criarTabelaCalendarioVacinal(db);

    /*
    ==============================================
    REGRAS VACINAIS
    ==============================================
    */
    criarTabelaRegrasVacinais(db);

    /*
    ==============================================
    CAMPANHAS
    ==============================================
    */
    criarTabelaCampanhasVacinais(db);

    /*
    ==============================================
    REGISTROS DE VACINAÇÃO
    ==============================================
    */
    criarTabelaRegistrosVacinacao(db);

    criarTabelaDosesVacina(db);

    /*
    ==============================================
    AGENDAMENTOS
    ==============================================
    */
    criarTabelaAgendamentosVacina(db);

    console.log(
      "✅ Estrutura criada com sucesso"
    );

  });

}