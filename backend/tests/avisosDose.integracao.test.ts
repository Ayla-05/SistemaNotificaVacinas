import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";

import { configurarBanco } from "../src/database/configurarBanco";
import { executarCalendarioSeed } from "../src/database/seeds/calendarioSeed";
import { NotificacaoService } from "../src/services/notificacaoService";
import { EmailService } from "../src/services/emailService";
import { ProximasDosesService, escolherCampanha } from "../src/services/proximasDosesService";

import * as usuarioRepository from "../src/repositories/usuarioRepository";
import * as pessoaRepository from "../src/repositories/pessoaRepository";
import * as vacinaRepository from "../src/repositories/vacinaRepository";
import * as calendarioVacinalRepository from "../src/repositories/calendarioVacinalRepository";
import * as campanhaVacinalRepository from "../src/repositories/campanhaVacinalRepository";
import * as configuracaoRepository from "../src/repositories/configuracaoRepository";

let usuarioId: number;

/* Data de nascimento que faz a 1ª dose da penta (2 meses) vencer daqui a `dias` dias. */
function nascimentoParaVencerEm(dias: number): string {
  const alvo = new Date();
  alvo.setHours(12, 0, 0, 0);
  alvo.setDate(alvo.getDate() + dias);
  alvo.setMonth(alvo.getMonth() - 2);
  const mes = String(alvo.getMonth() + 1).padStart(2, "0");
  const dia = String(alvo.getDate()).padStart(2, "0");
  return `${alvo.getFullYear()}-${mes}-${dia}`;
}

async function criarBebe(nome: string, dias: number) {
  return pessoaRepository.criarPessoa({
    usuario_id: usuarioId,
    nome,
    email: `${nome.toLowerCase().replace(/\s/g, "")}@exemplo.com`,
    data_nascimento: nascimentoParaVencerEm(dias)
  } as any) as Promise<number>;
}

beforeAll(async () => {
  await configurarBanco();

  usuarioId = await usuarioRepository.criarUsuario(
    "Teste", "avisos@exemplo.com", "hash", "USUARIO", true
  );
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("calendario_vacinal atualizado para 2026", () => {

  it("troca os dados antigos e registra a versão", async () => {
    expect(await configuracaoRepository.obterConfiguracao("calendario_versao")).toBe("2026");

    const hepB = await vacinaRepository.buscarVacinaPorCodigo("HEPATITE_B") as any;
    const linha = await calendarioVacinalRepository.buscarPorVacinaEFaixa(hepB.id, "CRIANCA") as any;

    // antes: 3 doses (calendário antigo); 2026: 1 dose ao nascer
    expect(linha.doses).toBe(1);

    const vop = await vacinaRepository.buscarVacinaPorCodigo("POLIO_VOP") as any;
    expect(await calendarioVacinalRepository.buscarPorVacinaEFaixa(vop.id, "CRIANCA")).toBeFalsy();
  });

  it("não repete a troca (nem apaga edições) quando a versão já está carregada", async () => {
    const hepB = await vacinaRepository.buscarVacinaPorCodigo("HEPATITE_B") as any;
    const linha = await calendarioVacinalRepository.buscarPorVacinaEFaixa(hepB.id, "CRIANCA") as any;

    await calendarioVacinalRepository.atualizarCalendarioVacinal(
      linha.id, "CRIANCA", 0, 9, 2, 0, "editado pelo administrador"
    );

    await executarCalendarioSeed();

    const depois = await calendarioVacinalRepository.buscarPorVacinaEFaixa(hepB.id, "CRIANCA") as any;
    expect(depois.observacao).toBe("editado pelo administrador");
  });

});

describe("aviso quando a dose está chegando", () => {

  it("avisa uma única vez, mesmo rodando a verificação todo dia", async () => {
    const enviar = vi
      .spyOn(EmailService, "enviarAvisoDosesProximas")
      .mockResolvedValue({ enviado: true });

    await criarBebe("Bebe Cinco", 5);

    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();

    expect(enviar).toHaveBeenCalledTimes(1);

    const [destinatario, nome, doses] = enviar.mock.calls[0];
    expect(destinatario).toBe("bebecinco@exemplo.com");
    expect(nome).toBe("Bebe Cinco");

    const penta = doses.find((d) => d.vacina === "Pentavalente");
    expect(penta).toMatchObject({ rotulo: "1ª dose", diasParaVencer: 5 });
  });

  it("não avisa quando a dose ainda está longe", async () => {
    const enviar = vi
      .spyOn(EmailService, "enviarAvisoDosesProximas")
      .mockResolvedValue({ enviado: true });

    await criarBebe("Bebe Vinte", 20);

    await NotificacaoService.executarVerificacaoDiaria();

    const chamadasDoBebe = enviar.mock.calls.filter(([, nome]) => nome === "Bebe Vinte");
    expect(chamadasDoBebe).toHaveLength(0);
  });

  it("se o e-mail falhar, tenta de novo na próxima verificação", async () => {
    const enviar = vi
      .spyOn(EmailService, "enviarAvisoDosesProximas")
      .mockResolvedValueOnce({ enviado: false, motivo: "SMTP fora do ar" })
      .mockResolvedValue({ enviado: true });

    await criarBebe("Bebe Tres", 3);

    await NotificacaoService.executarVerificacaoDiaria();
    await NotificacaoService.executarVerificacaoDiaria();

    const chamadas = enviar.mock.calls.filter(([, nome]) => nome === "Bebe Tres");
    expect(chamadas).toHaveLength(2);
  });

});

describe("período da campanha", () => {

  it("a dose traz a campanha da vacina (em andamento ou a próxima)", async () => {
    const penta = await vacinaRepository.buscarVacinaPorCodigo("PENTAVALENTE") as any;

    await campanhaVacinalRepository.criarCampanhaVacinal(
      penta.id, "Campanha de teste", "2020-01-01", "2099-12-31", "Crianças", null
    );

    const id = await criarBebe("Bebe Campanha", 10);
    const lista = await ProximasDosesService.calcular(id);

    expect(lista.find((d) => d.vacinaCodigo === "PENTAVALENTE")?.campanha).toEqual({
      nome: "Campanha de teste",
      dataInicio: "2020-01-01",
      dataFim: "2099-12-31"
    });
  });

  it("escolherCampanha ignora campanhas encerradas e prefere a mais próxima", () => {
    const campanhas = [
      { vacina_codigo: "INFLUENZA", nome: "Passada", data_inicio: "2025-04-01", data_fim: "2025-05-31" },
      { vacina_codigo: "INFLUENZA", nome: "Outra vacina", data_inicio: "2026-04-01", data_fim: "2026-05-31" },
      { vacina_codigo: "INFLUENZA", nome: "Atual", data_inicio: "2026-10-01", data_fim: "2026-12-31" },
      { vacina_codigo: "BCG", nome: "Nao e esta", data_inicio: "2026-10-01", data_fim: "2026-12-31" }
    ];

    expect(escolherCampanha(campanhas, "INFLUENZA", "2026-10-31")?.nome).toBe("Atual");
    expect(escolherCampanha(campanhas, "INFLUENZA", "2027-06-01")).toBeNull();
    expect(escolherCampanha(campanhas, "COVID19", "2026-10-31")).toBeNull();
  });

});
