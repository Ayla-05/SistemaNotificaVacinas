import { describe, it, expect, beforeAll } from "vitest";

import { configurarBanco } from "../../src/database/configurarBanco";
import * as usuarioRepository from "../../src/repositories/usuarioRepository";
import * as pessoaRepository from "../../src/repositories/pessoaRepository";
import * as grupoEspecialRepository from "../../src/repositories/grupoEspecialRepository";
import * as pessoaGrupoEspecialRepository from "../../src/repositories/pessoaGrupoEspecialRepository";
import * as vacinaRepository from "../../src/repositories/vacinaRepository";
import { PessoaGrupoEspecialService } from "../../src/services/pessoaGrupoEspecialService";
import { ProximasDosesService } from "../../src/services/proximasDosesService";
import { adicionarDias } from "../../src/utils/proximasDoses";
import { hojeLocalISO } from "../../src/utils/validacao";

let pessoaId: number;
let gestanteId: number;
let outroGrupoId: number;

beforeAll(async () => {
  await configurarBanco();

  const usuarioId = await usuarioRepository.criarUsuario("Gestante Teste", "gestante@exemplo.com", "hash", "USUARIO", true);
  pessoaId = Number(
    await pessoaRepository.criarPessoa({ usuario_id: usuarioId, nome: "Gestante Teste", data_nascimento: "1996-03-10" } as any)
  );

  const grupos = (await grupoEspecialRepository.listarGruposEspeciais()) as any[];
  gestanteId = grupos.find((g) => g.nome === "GESTANTE").id;
  outroGrupoId = grupos.find((g) => g.nome !== "GESTANTE").id;
});

const hoje = () => hojeLocalISO();

describe("vincular o grupo GESTANTE", () => {

  it("exige o início da gestação", async () => {
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, gestanteId)).rejects.toThrow(/semanas/i);
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, "")).rejects.toThrow(/semanas/i);
  });

  it("recusa data inexistente, no futuro ou de mais de 42 semanas atrás", async () => {
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, "abc")).rejects.toThrow(/inválido/i);
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, adicionarDias(hoje(), 3))).rejects.toThrow(/futuro/i);
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, adicionarDias(hoje(), -320))).rejects.toThrow(/42 semanas/i);
  });

  it("grava o início e as próximas doses passam a usar as semanas de gestação", async () => {
    const inicio = adicionarDias(hoje(), -10 * 7);
    await PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, inicio);

    const grupos = await pessoaGrupoEspecialRepository.listarGruposDaPessoa(pessoaId);
    expect(grupos.find((g: any) => g.nome === "GESTANTE")?.gestacao_inicio).toBe(inicio);

    const proximas = await ProximasDosesService.calcular(pessoaId);
    const codigos = proximas.map((p) => p.vacinaCodigo);
    expect(codigos).toContain("DTPA");
    expect(codigos).toContain("VSR");
    expect(codigos).not.toContain("TRIPLICE_VIRAL_SCR");
    // o nome da vacina nova vem do catálogo
    expect(proximas.find((p) => p.vacinaCodigo === "VSR")?.vacina).toBe("VSR");
  });

  it("vincular de novo atualiza o início (correção das semanas)", async () => {
    const novoInicio = adicionarDias(hoje(), -30 * 7);
    await PessoaGrupoEspecialService.vincular(pessoaId, gestanteId, novoInicio);

    const grupos = await pessoaGrupoEspecialRepository.listarGruposDaPessoa(pessoaId);
    expect(grupos.filter((g: any) => g.nome === "GESTANTE")).toHaveLength(1);
    expect(grupos.find((g: any) => g.nome === "GESTANTE")?.gestacao_inicio).toBe(novoInicio);

    const vsr = (await ProximasDosesService.calcular(pessoaId)).find((p) => p.vacinaCodigo === "VSR");
    expect(vsr?.status).toBe("DISPONIVEL");
  });

  it("outros grupos não pedem data", async () => {
    await expect(PessoaGrupoEspecialService.vincular(pessoaId, outroGrupoId)).resolves.toBeGreaterThan(0);
  });

});

describe("catálogo", () => {

  it("tem a vacina VSR (vírus sincicial respiratório)", async () => {
    const vsr = await vacinaRepository.buscarVacinaPorCodigo("VSR");
    expect(vsr?.nome).toBe("VSR");
  });

});
