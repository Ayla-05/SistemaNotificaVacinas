import { describe, it, expect, beforeAll } from "vitest";

import { configurarBanco } from "../src/database/configurarBanco";
import { ProximasDosesService } from "../src/services/proximasDosesService";
import { VacinalService } from "../src/services/vacinalService";

import * as usuarioRepository from "../src/repositories/usuarioRepository";
import * as pessoaRepository from "../src/repositories/pessoaRepository";
import * as vacinaRepository from "../src/repositories/vacinaRepository";
import * as registroVacinacaoRepository from "../src/repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../src/repositories/doseVacinaRepository";
import * as grupoEspecialRepository from "../src/repositories/grupoEspecialRepository";
import * as pessoaGrupoEspecialRepository from "../src/repositories/pessoaGrupoEspecialRepository";

/* Hoje, para o teste: 31/10/2026 (meio-dia, para o fuso não mudar o dia). */
const HOJE = new Date(2026, 9, 31, 12, 0, 0);

let usuarioId: number;

async function criarPessoa(nascimento: string) {
  return pessoaRepository.criarPessoa({
    usuario_id: usuarioId,
    nome: "Pessoa de Teste",
    data_nascimento: nascimento
  } as any) as Promise<number>;
}

async function registrarDose(
  pessoaId: number,
  codigo: string,
  numero: number,
  data: string
) {
  const vacina = await vacinaRepository.buscarVacinaPorCodigo(codigo) as any;

  const registroId =
    await registroVacinacaoRepository.criarRegistroVacinacao(pessoaId, vacina.id);

  await doseVacinaRepository.registrarDose(registroId, numero, "DOSE", {
    dataAplicacao: data
  });
}

beforeAll(async () => {
  await configurarBanco();

  usuarioId = await usuarioRepository.criarUsuario(
    "Teste", "proximas@exemplo.com", "hash", "USUARIO", true
  );
});

describe("ProximasDosesService (com o banco)", () => {

  it("calcula a próxima dose e a data a partir das doses registradas", async () => {
    // 21 anos; dT de reforço em 2019 => 4ª dose aos 24 anos
    const pessoaId = await criarPessoa("2005-06-20");

    await registrarDose(pessoaId, "DT", 1, "2019-05-06");
    await registrarDose(pessoaId, "FEBRE_AMARELA", 1, "2017-12-21");

    const lista = await ProximasDosesService.calcular(pessoaId, HOJE);

    const dt = lista.find((d) => d.vacinaCodigo === "DT");

    expect(dt).toMatchObject({
      vacina: "dT",
      numeroDose: 2,
      dataPrevista: "2029-06-20",
      status: "FUTURA",
      ultimaDose: "2019-05-06"
    });

    expect(lista.find((d) => d.vacinaCodigo === "FEBRE_AMARELA")).toBeUndefined();
    expect(lista.find((d) => d.vacinaCodigo === "HEPATITE_B")).toMatchObject({ status: "DISPONIVEL" });
  });

  it("usa os grupos especiais da pessoa", async () => {
    const pessoaId = await criarPessoa("1986-01-01");

    await registrarDose(pessoaId, "TRIPLICE_VIRAL_SCR", 1, "2015-01-01");

    const antes = await ProximasDosesService.calcular(pessoaId, HOJE);
    expect(antes.find((d) => d.vacinaCodigo === "TRIPLICE_VIRAL_SCR")).toBeUndefined();

    const grupo = await grupoEspecialRepository.buscarGrupoEspecialPorNome("TRABALHADOR_SAUDE") as any;
    await pessoaGrupoEspecialRepository.adicionarGrupoPessoa(pessoaId, grupo.id);

    const depois = await ProximasDosesService.calcular(pessoaId, HOJE);
    expect(depois.find((d) => d.vacinaCodigo === "SCR" || d.vacinaCodigo === "TRIPLICE_VIRAL_SCR"))
      .toMatchObject({ numeroDose: 2, status: "DISPONIVEL" });
  });

  it("o resumo do Dashboard só cobra o que já venceu e lista as próximas com data", async () => {
    // bebê de 2 meses
    const pessoaId = await criarPessoa("2026-08-31");

    await registrarDose(pessoaId, "BCG", 1, "2026-09-01");

    const resumo = await VacinalService.obterResumoPessoa(pessoaId);

    const pendentes = resumo.pendentes.map((p: any) => p.vacina);

    // venceu ao nascer e não foi tomada
    expect(pendentes).toContain("Hepatite B");
    // BCG foi tomada
    expect(pendentes).not.toContain("BCG");
    // ainda não venceu (15 meses): não é pendência, é "próxima"
    expect(pendentes).not.toContain("Varicela");
    expect(resumo.proximas.find((p: any) => p.vacina === "Varicela"))
      .toMatchObject({ data_prevista: "2027-11-30", status: "FUTURA" });

    expect(resumo.em_dia.map((v: any) => v.vacina)).toContain("BCG");
    expect(resumo.faixa_etaria).toBe("CRIANCA");
  });

});
