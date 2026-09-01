import * as vacinaRepository from "../repositories/vacinaRepository";

/*
==================================================
VACINA SERVICE
==================================================

Responsabilidades:

- Gerenciar vacinas do sistema
- Validar dados antes de persistir
- Consultar vacinas cadastradas
- Garantir integridade dos dados

NÃO é responsável por:

- Requisições HTTP
- SQL
- Manipulação direta do banco

Dependências:

- vacinaRepository
*/
export class VacinaService {

  /*
  ==================================================
  LISTAR TODAS AS VACINAS
  ==================================================

  Retorna todas as vacinas cadastradas.
  */
  static async listarTodas() {

    return await vacinaRepository.listarTodasVacinas();

  }

  /*
  ==================================================
  LISTAR VACINAS ATIVAS
  ==================================================

  Retorna somente vacinas ativas.
  */
  static async listarAtivas() {

    return await vacinaRepository.listarVacinasAtivas();

  }

  /*
  ==================================================
  BUSCAR POR ID
  ==================================================

  Valida a existência da vacina.
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID da vacina inválido."
      );
    }

    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        id
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return vacina;

  }

  /*
  ==================================================
  BUSCAR POR CÓDIGO
  ==================================================

  Utilizado principalmente pelos Seeds
  e regras vacinais.
  */
  static async buscarPorCodigo(
    codigo: string
  ) {

    if (!codigo?.trim()) {
      throw new Error(
        "Código da vacina não informado."
      );
    }

    const vacina =
      await vacinaRepository.buscarVacinaPorCodigo(
        codigo
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return vacina;

  }

  /*
  ==================================================
  BUSCAR POR NOME
  ==================================================

  Utilizado para pesquisas e consultas.
  */
  static async buscarPorNome(
    nome: string
  ) {

    if (!nome?.trim()) {
      throw new Error(
        "Nome da vacina não informado."
      );
    }

    const vacina =
      await vacinaRepository.buscarVacinaPorNome(
        nome
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return vacina;

  }

  /*
  ==================================================
  CRIAR VACINA
  ==================================================

  Garante que não existe vacina com
  o mesmo código.
  */
  static async criar(
    codigo: string,
    nome: string,
    descricao: string,
    doencasEvitadas: string
  ) {

    if (!codigo?.trim()) {
      throw new Error(
        "Código da vacina é obrigatório."
      );
    }

    if (!nome?.trim()) {
      throw new Error(
        "Nome da vacina é obrigatório."
      );
    }

    const vacinaExistente =
      await vacinaRepository.buscarVacinaPorCodigo(
        codigo
      );

    if (vacinaExistente) {
      throw new Error(
        "Já existe uma vacina com esse código."
      );
    }

    return await vacinaRepository.criarVacina(
      codigo,
      nome,
      descricao,
      doencasEvitadas
    );

  }

  /*
  ==================================================
  ATUALIZAR VACINA
  ==================================================

  Atualiza informações cadastrais
  da vacina.
  */
  static async atualizar(
    id: number,
    nome: string,
    descricao: string,
    doencasEvitadas: string
  ) {

    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        id
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await vacinaRepository.atualizarVacina(
      id,
      nome,
      descricao,
      doencasEvitadas
    );

  }

  /*
  ==================================================
  DESATIVAR VACINA
  ==================================================

  Mantém histórico sem excluir
  registros do banco.
  */
  static async desativar(
    id: number
  ) {

    const vacina =
      await vacinaRepository.buscarVacinaPorId(
        id
      );

    if (!vacina) {
      throw new Error(
        "Vacina não encontrada."
      );
    }

    return await vacinaRepository.desativarVacina(
      id
    );

  }

}