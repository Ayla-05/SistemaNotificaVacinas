import * as dependenteRepository from "../repositories/dependenteRepository";
import * as pessoaRepository from "../repositories/pessoaRepository";

/*
==================================================
DEPENDENTE SERVICE
==================================================

Responsabilidades:

- Vincular uma pessoa já cadastrada como dependente
  de um responsável (ex.: filho, pai/mãe)
- Cadastrar, na mesma operação, uma pessoa nova que
  ainda não existe no sistema e já vinculá-la
- Listar e remover vínculos

NÃO é responsável por:

- Requisições HTTP
- SQL
- Autenticação/login (o dependente não tem conta própria,
  quem gerencia a carteira dele é o responsável)

Dependências:

- dependenteRepository
- pessoaRepository
*/
export class DependenteService {

  /*
  ==================================================
  LISTAR DEPENDENTES DE UM RESPONSÁVEL
  ==================================================
  */
  static async listar(
    responsavelId: number
  ) {

    return await dependenteRepository.listarDependentes(
      responsavelId
    );

  }

  /*
  ==================================================
  CADASTRAR NOVO DEPENDENTE
  ==================================================

  Cria a pessoa (filho, pai, etc. — sem conta de
  login própria, por isso não passa por usuarioRepository)
  vinculada ao MESMO usuário do responsável, e já
  registra o parentesco.
  */
  static async cadastrarNovo(
    responsavelPessoaId: number,
    dados: {
      nome: string;
      data_nascimento: string;
      parentesco: string;
      email?: string;
      telefone?: string;
    }
  ) {

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

    if (!dados.parentesco?.trim()) {
      throw new Error(
        "Parentesco é obrigatório."
      );
    }

    const responsavel =
      await pessoaRepository.buscarPessoaPorId(
        responsavelPessoaId
      );

    if (!responsavel) {
      throw new Error(
        "Pessoa responsável não encontrada."
      );
    }

    const dependenteId =
      await pessoaRepository.criarPessoa({
        usuario_id: responsavel.usuario_id,
        nome: dados.nome,
        data_nascimento: dados.data_nascimento,
        email: dados.email,
        telefone: dados.telefone
      });

    await dependenteRepository.criarDependente(
      responsavelPessoaId,
      dependenteId,
      dados.parentesco
    );

    return dependenteId;

  }

  /*
  ==================================================
  REMOVER VÍNCULO
  ==================================================

  Remove só o vínculo de dependência - a pessoa
  em si (e a carteira vacinal dela) permanece no
  sistema, só deixa de aparecer para o responsável.
  */
  static async removerVinculo(
    responsavelId: number,
    dependenteId: number
  ) {

    const vinculo =
      await dependenteRepository.verificarDependente(
        responsavelId,
        dependenteId
      );

    if (!vinculo) {
      throw new Error(
        "Vínculo de dependente não encontrado."
      );
    }

    return await dependenteRepository
      .removerRelacionamentoDependente(
        responsavelId,
        dependenteId
      );

  }

}
