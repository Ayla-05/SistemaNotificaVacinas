import * as pessoaRepository from "../repositories/pessoaRepository";
import * as vacinaRepository from "../repositories/vacinaRepository";
import * as registroVacinacaoRepository from "../repositories/registroVacinacaoRepository";
import * as doseVacinaRepository from "../repositories/doseVacinaRepository";
import { NotificacaoService } from "./notificacaoService";

/*
==================================================
CARTEIRA SERVICE
==================================================

Responsabilidades:

- Gerenciar a carteira vacinal das pessoas
- Registrar vacinas
- Registrar doses
- Consultar histórico vacinal
- Validar existência de pessoas e vacinas

NÃO é responsável por:

- Requisições HTTP
- SQL
- Cálculos vacinais
- Agendamentos
- Regras vacinais

Dependências:

- pessoaRepository
- vacinaRepository
- registroVacinacaoRepository
- doseVacinaRepository
*/
export class CarteiraService {

  /*
  ==================================================
  LISTAR CARTEIRA DA PESSOA
  ==================================================

  Retorna todas as vacinas registradas
  para uma determinada pessoa.
  */
  static async listarCarteiraPessoa(
    pessoaId: number
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    return await registroVacinacaoRepository
      .listarCarteiraPessoa(
        pessoaId
      );

  }

  /*
  ==================================================
  REGISTRAR VACINA
  ==================================================

  Cria um registro vacinal para
  uma pessoa.
  */
  static async registrarVacina(
    pessoaId: number,
    vacinaId: number
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        vacinaId
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    const registroExistente =
      await registroVacinacaoRepository
        .buscarRegistroPessoaVacina(
          pessoaId,
          vacinaId
        );

    if (registroExistente) {
      throw new Error(
        "Vacina já registrada para esta pessoa."
      );
    }

    return await registroVacinacaoRepository
      .criarRegistroVacinacao(
        pessoaId,
        vacinaId
      );

  }

  /*
  ==================================================
  REGISTRAR DOSE
  ==================================================

  Registra uma dose aplicada
  em um registro vacinal.
  */
  static async registrarDose(
    registroVacinacaoId: number,
    numeroDose: number,
    tipo: string
  ) {

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          registroVacinacaoId
        );

    if (!registro) {
      throw new Error(
        "Registro vacinal não encontrado."
      );
    }

    const doseExistente =
      await doseVacinaRepository.buscarDose(
        registroVacinacaoId,
        numeroDose
      );

    if (doseExistente) {
      throw new Error(
        "Esta dose já foi registrada."
      );
    }

    const doseId =
      await doseVacinaRepository
        .registrarDose(
          registroVacinacaoId,
          numeroDose,
          tipo
        );

    /*
    Dispara em segundo plano (não bloqueia a resposta
    da API nem falha o registro se o e-mail não sair).
    */
    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        registro.vacina_id
      );

    NotificacaoService.notificarRegistroDose(
      registro.pessoa_id,
      (vacina as any)?.nome ?? "Vacina",
      tipo
    );

    return doseId;

  }

  /*
  ==================================================
  LISTAR DOSES
  ==================================================

  Retorna todas as doses registradas
  para uma vacina.
  */
  static async listarDoses(
    registroVacinacaoId: number
  ) {

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          registroVacinacaoId
        );

    if (!registro) {
      throw new Error(
        "Registro vacinal não encontrado."
      );
    }

    return await doseVacinaRepository
      .listarDosesRegistro(
        registroVacinacaoId
      );

  }

  /*
  ==================================================
  CONTAR DOSES
  ==================================================

  Retorna a quantidade de doses
  registradas para uma vacina.
  */
  static async contarDoses(
    registroVacinacaoId: number
  ) {

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          registroVacinacaoId
        );

    if (!registro) {
      throw new Error(
        "Registro vacinal não encontrado."
      );
    }

    return await doseVacinaRepository
      .contarDoses(
        registroVacinacaoId
      );

  }

  /*
  ==================================================
  REMOVER DOSE
  ==================================================

  Remove uma dose registrada.
  */
  static async removerDose(
    doseId: number
  ) {

    const dose =
      await doseVacinaRepository
        .buscarDosePorId(
          doseId
        );

    if (!dose) {
      throw new Error(
        "Dose não encontrada."
      );
    }

    return await doseVacinaRepository
      .removerDose(
        doseId
      );

  }

  /*
  ==================================================
  CONFIRMAR LEITURA DO SCAN (CLAUDE VISION)
  ==================================================

  Recebe os dados já revisados pelo usuário na tela
  de Scan e grava o registro/dose correspondente.

  Localiza a vacina pelo nome lido na carteirinha
  (comparação sem diferenciar maiúsculas/acentos de
  caixa, já que a IA nem sempre devolve o nome
  exatamente como está cadastrado) e reaproveita o
  registro vacinal existente, se já houver um.
  */
  static async confirmarRegistroViaScan(
    pessoaId: number,
    dados: {
      vacina: string;
      dose?: string;
      dataAplicacao?: string | null;
      lote?: string | null;
      localAplicacao?: string | null;
    }
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        pessoaId
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    const vacinasAtivas =
      await vacinaRepository.listarVacinasAtivas() as any[];

    const nomeLido =
      dados.vacina
        ?.trim()
        .toLowerCase();

    const vacina =
      vacinasAtivas.find(
        (v) =>
          v.nome.trim().toLowerCase() ===
          nomeLido
      ) ??
      vacinasAtivas.find(
        (v) =>
          v.nome.trim().toLowerCase()
            .includes(nomeLido) ||
          nomeLido.includes(
            v.nome.trim().toLowerCase()
          )
      );

    if (!vacina) {

      throw new Error(
        `Não encontramos "${dados.vacina}" no calendário de vacinas do sistema. ` +
        "Confira o nome e tente novamente."
      );

    }

    let registro =
      await registroVacinacaoRepository
        .buscarRegistroPessoaVacina(
          pessoaId,
          vacina.id
        );

    let registroId: number;

    if (registro) {
      registroId = registro.id;
    } else {
      registroId =
        await registroVacinacaoRepository
          .criarRegistroVacinacao(
            pessoaId,
            vacina.id
          );
    }

    const dosesExistentes =
      await doseVacinaRepository.contarDoses(
        registroId
      );

    const doseId =
      await doseVacinaRepository.registrarDose(
        registroId,
        dosesExistentes + 1,
        dados.dose || "Não especificada",
        {
          dataAplicacao: dados.dataAplicacao,
          lote: dados.lote,
          observacao:
            dados.localAplicacao
              ? `Aplicada em: ${dados.localAplicacao}`
              : null
        }
      );

    NotificacaoService.notificarRegistroDose(
      pessoaId,
      vacina.nome,
      dados.dose || "Não especificada"
    );

    return {
      registroId,
      doseId,
      vacina: vacina.nome
    };

  }

  /*
  ==================================================
  REMOVER REGISTRO VACINAL
  ==================================================

  Remove o vínculo entre a
  pessoa e a vacina.
  */
  static async removerRegistro(
    registroId: number
  ) {

    const registro =
      await registroVacinacaoRepository
        .buscarRegistroPorId(
          registroId
        );

    if (!registro) {
      throw new Error(
        "Registro vacinal não encontrado."
      );
    }

    return await registroVacinacaoRepository
      .removerRegistroVacinacao(
        registroId
      );

  }

}