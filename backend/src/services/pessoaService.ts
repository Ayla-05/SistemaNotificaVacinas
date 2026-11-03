import { frequenciaValida, FREQUENCIAS_AVISO } from "../utils/frequenciaAviso";
import { dataNascimentoValida, emailValido } from "../utils/validacao";
import * as pessoaRepository from "../repositories/pessoaRepository";
import * as usuarioRepository from "../repositories/usuarioRepository";

/*
==================================================
PESSOA SERVICE
==================================================

Responsabilidades:

- Gerenciar pessoas do sistema
- Validar dados cadastrais
- Garantir integridade dos relacionamentos
- Consultar pessoas por usuário
- Atualizar cadastros

NÃO é responsável por:

- Requisições HTTP
- SQL
- Regras vacinais
- Agendamentos

Dependências:

- pessoaRepository
- usuarioRepository
*/
export class PessoaService {

  /*
  Frequência dos avisos de dose por e-mail (ver utils/frequenciaAviso.ts).
  Ausente = não alterar.
  */
  /*
  CORREÇÃO [COR-25]: nascimento (formato, futuro, idade absurda) e
  e-mail eram aceitos sem conferência.
  */
  private static validarDadosCadastrais(
    dados: { data_nascimento?: string; email?: string }
  ) {

    if (
      dados.data_nascimento !== undefined &&
      !dataNascimentoValida(dados.data_nascimento)
    ) {
      throw new Error(
        "Data de nascimento inválida. Use AAAA-MM-DD, sem datas futuras."
      );
    }

    if (dados.email && !emailValido(dados.email)) {
      throw new Error(
        "E-mail inválido."
      );
    }

  }

  private static validarFrequenciaAviso(
    valor: unknown
  ) {

    if (
      valor !== undefined &&
      valor !== null &&
      !frequenciaValida(valor)
    ) {
      throw new Error(
        `Frequência de aviso inválida. Use: ${FREQUENCIAS_AVISO.join(", ")}.`
      );
    }

  }


  /*
  ==================================================
  LISTAR TODAS AS PESSOAS
  ==================================================

  Retorna todas as pessoas cadastradas.
  */
  static async listarTodas() {

    return await pessoaRepository.listarPessoas();

  }

  /*
  ==================================================
  BUSCAR PESSOA POR ID
  ==================================================

  Valida a existência da pessoa.
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID da pessoa inválido."
      );
    }

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        id
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    return pessoa;

  }

  /*
  ==================================================
  LISTAR PESSOAS DE UM USUÁRIO
  ==================================================

  Retorna a pessoa principal e
  todos os dependentes vinculados.
  */
  static async listarPorUsuario(
    usuarioId: number
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        usuarioId
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await pessoaRepository.listarPessoasPorUsuario(
      usuarioId
    );

  }

  /*
  ==================================================
  CRIAR PESSOA
  ==================================================

  Regras:

  - Usuário deve existir
  - Nome obrigatório
  - Data de nascimento obrigatória
  */
  static async criar(
    dados: {
      usuario_id: number;

      nome: string;

      email?: string;

      telefone?: string;

      data_nascimento: string;

      cep?: string;

      logradouro?: string;

      numero?: string;

      complemento?: string;

      bairro?: string;

      cidade?: string;

      estado?: string;

      foto_perfil?: string;

      receber_email?: number;

      receber_whatsapp?: number;

      frequencia_aviso?: string;
    }
  ) {

    this.validarFrequenciaAviso(dados.frequencia_aviso);

    if (!dados.nome?.trim()) {
      throw new Error(
        "Nome é obrigatório."
      );
    }

    if (!dados.data_nascimento?.trim()) {
      throw new Error(
        "Data de nascimento é obrigatória."
      );
    }

    this.validarDadosCadastrais(dados);

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        dados.usuario_id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await pessoaRepository.criarPessoa(
      dados
    );

  }

  /*
  ==================================================
  ATUALIZAR PESSOA
  ==================================================

  Atualiza dados cadastrais da pessoa.
  */
  static async atualizar(
    id: number,
    dados: {
      nome: string;

      email?: string;

      telefone?: string;

      data_nascimento: string;

      cep?: string;

      logradouro?: string;

      numero?: string;

      complemento?: string;

      bairro?: string;

      cidade?: string;

      estado?: string;

      foto_perfil?: string;

      receber_email?: number;

      receber_whatsapp?: number;

      frequencia_aviso?: string;
    }
  ) {

    this.validarFrequenciaAviso(dados.frequencia_aviso);

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        id
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    /*
    atualizarPessoa faz UPDATE de todas as colunas
    de uma vez - por isso mesclamos com o registro
    atual antes de salvar. Sem isso, um PUT parcial
    (ex.: só trocando o telefone) apagaria os demais
    campos que não vieram no corpo da requisição.
    */
    const dadosCompletos = {
      ...pessoa,
      ...dados
    };

    if (!dadosCompletos.nome?.trim()) {
      throw new Error(
        "Nome é obrigatório."
      );
    }

    this.validarDadosCadastrais(dadosCompletos);

    return await pessoaRepository.atualizarPessoa(
      id,
      dadosCompletos
    );

  }

  /*
  ==================================================
  REMOVER PESSOA
  ==================================================

  Remove definitivamente o cadastro.

  Utilizar com cuidado.
  */
  static async remover(
    id: number
  ) {

    const pessoa =
      await pessoaRepository.buscarPessoaPorId(
        id
      );

    if (!pessoa) {
      throw new Error(
        "Pessoa não encontrada."
      );
    }

    return await pessoaRepository.removerPessoa(
      id
    );

  }

}