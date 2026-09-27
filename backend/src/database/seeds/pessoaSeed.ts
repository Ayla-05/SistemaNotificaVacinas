import * as usuarioRepository
  from "../../repositories/usuarioRepository";

import * as pessoaRepository
  from "../../repositories/pessoaRepository";

import * as vacinaRepository
  from "../../repositories/vacinaRepository";

import * as registroVacinacaoRepository
  from "../../repositories/registroVacinacaoRepository";

import * as doseVacinaRepository
  from "../../repositories/doseVacinaRepository";

import * as agendamentoVacinaRepository
  from "../../repositories/agendamentoVacinaRepository";

/*
==================================================
PESSOA DE DEMONSTRAÇÃO
==================================================

Cria uma pessoa vinculada ao administrador
padrão para que o Dashboard e o Calendário
tenham dados reais para exibir assim que o
sistema sobe pela primeira vez.

Vinculada às vacinas do calendário ADULTO
(cadastradas em calendarioSeed.ts):

- Hepatite B: completa (3/3 doses) -> em dia
- Febre Amarela: sem registro -> pendente
- DT: sem registro -> pendente
- Tríplice Viral (SCR): sem registro -> pendente

E um agendamento futuro para a
dose pendente de Febre Amarela.
*/
export async function executarPessoaSeed() {

  const admin =
    await usuarioRepository
      .buscarUsuarioPorEmail(
        "admin@notificavacinas.com"
      );

  const usuarioId =
    (admin as any)?.id;

  if (!usuarioId) {
    return;
  }

  const pessoasDoUsuario =
    await pessoaRepository
      .listarPessoasPorUsuario(
        usuarioId
      );

  const jaExiste =
    pessoasDoUsuario.some(
      (pessoa: any) =>
        pessoa.nome === "Ana Souza"
    );

  if (jaExiste) {

    console.log(
      "Pessoa de demonstração já cadastrada."
    );

    return;

  }

  const pessoaId =
    await pessoaRepository.criarPessoa({
      usuario_id: usuarioId,
      nome: "Ana Souza",
      email: "ana.souza@example.com",
      data_nascimento: "1992-05-15"
    });

  const hepatiteB =
    await vacinaRepository
      .buscarVacinaPorCodigo(
        "HEPATITE_B"
      );

  if (hepatiteB) {

    const registroId =
      await registroVacinacaoRepository
        .criarRegistroVacinacao(
          pessoaId,
          (hepatiteB as any).id
        );

    for (
      let numeroDose = 1;
      numeroDose <= 3;
      numeroDose++
    ) {

      await doseVacinaRepository
        .registrarDose(
          registroId,
          numeroDose,
          "DOSE"
        );

    }

  }

  const febreAmarela =
    await vacinaRepository
      .buscarVacinaPorCodigo(
        "FEBRE_AMARELA"
      );

  if (febreAmarela) {

    const dataPrevista =
      new Date();

    dataPrevista.setDate(
      dataPrevista.getDate() + 15
    );

    await agendamentoVacinaRepository
      .criarAgendamento(
        pessoaId,
        (febreAmarela as any).id,
        1,
        dataPrevista
          .toISOString()
          .slice(0, 10),
        "Dose única pendente"
      );

  }

  console.log(
    "Pessoa de demonstração criada com sucesso."
  );

}
