import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

import { configurarBanco } from "../src/database/configurarBanco";
import { NotificacaoService } from "../src/services/notificacaoService";
import { EmailService } from "../src/services/emailService";
import { PessoaService } from "../src/services/pessoaService";

import * as usuarioRepository from "../src/repositories/usuarioRepository";
import * as pessoaRepository from "../src/repositories/pessoaRepository";

let usuarioId: number;

/* Bebê com ~3 meses: a BCG (devida ao nascer) está atrasada. */
function nascimentoDeBebe(): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setMonth(d.getMonth() - 3);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function criarPessoa(nome: string, frequencia?: string) {
  const id = await pessoaRepository.criarPessoa({
    usuario_id: usuarioId,
    nome,
    email: `${nome.toLowerCase().replace(/\s/g, "")}@exemplo.com`,
    data_nascimento: nascimentoDeBebe()
  } as any) as number;

  if (frequencia) {
    await PessoaService.atualizar(id, { frequencia_aviso: frequencia } as any);
  }

  return id;
}

const resumosDe = (espiao: any, nome: string) =>
  espiao.mock.calls.filter(([, n]: any[]) => n === nome);

async function simularUltimoResumo(id: number, data: string) {
  await pessoaRepository.registrarUltimoResumo(id, data);
}

beforeAll(async () => {
  await configurarBanco();

  usuarioId = await usuarioRepository.criarUsuario(
    "Teste", "freq@exemplo.com", "hash", "USUARIO", true
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("escolha da frequência de aviso", () => {

  it("o padrão é UMA_VEZ", async () => {
    const id = await criarPessoa("Padrao");
    const pessoa = await pessoaRepository.buscarPessoaPorId(id) as any;

    expect(pessoa.frequencia_aviso).toBe("UMA_VEZ");
  });

  it("grava a frequência escolhida e recusa valor inválido", async () => {
    const id = await criarPessoa("Escolha");

    await PessoaService.atualizar(id, { frequencia_aviso: "SEMANAL" } as any);
    expect(((await pessoaRepository.buscarPessoaPorId(id)) as any).frequencia_aviso).toBe("SEMANAL");

    await expect(
      PessoaService.atualizar(id, { frequencia_aviso: "DE_HORA_EM_HORA" } as any)
    ).rejects.toThrow("Frequência de aviso inválida");

    // atualização parcial (outro campo) não apaga a frequência
    await PessoaService.atualizar(id, { telefone: "11999999999" } as any);
    expect(((await pessoaRepository.buscarPessoaPorId(id)) as any).frequencia_aviso).toBe("SEMANAL");
  });

});

describe("envio conforme a frequência", () => {

  it("DESATIVADO: nenhum aviso de dose", async () => {
    const resumo = vi.spyOn(EmailService, "enviarResumoDoses").mockResolvedValue({ enviado: true });
    const umaVez = vi.spyOn(EmailService, "enviarAvisoDosesProximas").mockResolvedValue({ enviado: true });

    await criarPessoa("Desativado", "DESATIVADO");
    await NotificacaoService.executarVerificacaoDiaria();

    expect(resumosDe(resumo, "Desativado")).toHaveLength(0);
    expect(resumosDe(umaVez, "Desativado")).toHaveLength(0);
  });

  it("DIARIA: manda um resumo por dia, e não duas vezes no mesmo dia", async () => {
    const resumo = vi.spyOn(EmailService, "enviarResumoDoses").mockResolvedValue({ enviado: true });

    const id = await criarPessoa("Diaria", "DIARIA");

    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Diaria")).toHaveLength(1);

    // "amanhã": o último resumo foi ontem
    await simularUltimoResumo(id, "2000-01-01");
    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Diaria")).toHaveLength(2);

    const [, , descricao, doses] = resumosDe(resumo, "Diaria")[0];
    expect(descricao).toBe("todos os dias");
    expect(doses.find((d: any) => d.vacina === "BCG")).toMatchObject({ status: "ATRASADA" });
  });

  it("SEMANAL: espera 7 dias entre os resumos", async () => {
    const resumo = vi.spyOn(EmailService, "enviarResumoDoses").mockResolvedValue({ enviado: true });

    const id = await criarPessoa("Semanal", "SEMANAL");

    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Semanal")).toHaveLength(1);

    // 3 dias depois: ainda não
    const d = new Date();
    d.setDate(d.getDate() - 3);
    await simularUltimoResumo(
      id,
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Semanal")).toHaveLength(1);

    // 8 dias depois: sim
    d.setDate(d.getDate() - 5);
    await simularUltimoResumo(
      id,
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Semanal")).toHaveLength(2);
  });

  it("MENSAL: só no mês seguinte", async () => {
    const resumo = vi.spyOn(EmailService, "enviarResumoDoses").mockResolvedValue({ enviado: true });

    const id = await criarPessoa("Mensal", "MENSAL");

    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Mensal")).toHaveLength(1);

    await simularUltimoResumo(id, "2000-01-01");
    await NotificacaoService.executarVerificacaoDiaria();
    expect(resumosDe(resumo, "Mensal")).toHaveLength(2);
  });

  it("se o e-mail falhar, não marca como enviado e tenta de novo", async () => {
    const resumo = vi
      .spyOn(EmailService, "enviarResumoDoses")
      .mockResolvedValueOnce({ enviado: false, motivo: "SMTP fora do ar" })
      .mockResolvedValue({ enviado: true });

    await criarPessoa("Falha", "DIARIA");

    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();

    expect(resumosDe(resumo, "Falha")).toHaveLength(2);
  });

  it("UMA_VEZ continua avisando uma vez por dose (não manda resumo)", async () => {
    const resumo = vi.spyOn(EmailService, "enviarResumoDoses").mockResolvedValue({ enviado: true });

    await criarPessoa("UmaVez", "UMA_VEZ");
    await NotificacaoService.executarVerificacaoDiaria();

    expect(resumosDe(resumo, "UmaVez")).toHaveLength(0);
  });

});
