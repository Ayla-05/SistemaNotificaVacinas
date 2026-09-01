import { PerfilUsuario } from "../enums/perfilUsuario";
import * as usuarioRepository from "../repositories/usuarioRepository";

/*
==================================================
USUARIO SERVICE
==================================================

Responsabilidades:

- Gerenciar usuários do sistema
- Validar dados antes de persistir
- Garantir unicidade do e-mail
- Consultar usuários cadastrados
- Ativar e desativar usuários
- Alterar perfis de acesso

NÃO é responsável por:

- Requisições HTTP
- SQL
- JWT
- Autenticação
- Senhas criptografadas

Dependências:

- usuarioRepository
*/
export class UsuarioService {

  /*
  ==================================================
  LISTAR TODOS OS USUÁRIOS
  ==================================================

  Retorna todos os usuários cadastrados.
  */
  static async listarTodos() {

    return await usuarioRepository.listarUsuarios();

  }

  /*
  ==================================================
  BUSCAR USUÁRIO POR ID
  ==================================================

  Retorna um usuário pelo ID.
  */
  static async buscarPorId(
    id: number
  ) {

    if (!id || id <= 0) {
      throw new Error(
        "ID do usuário inválido."
      );
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return usuario;

  }

  /*
  ==================================================
  BUSCAR USUÁRIO POR EMAIL
  ==================================================

  Utilizado principalmente para
  autenticação e validações.
  */
  static async buscarPorEmail(
    email: string
  ) {

    if (!email?.trim()) {
      throw new Error(
        "E-mail não informado."
      );
    }

    return await usuarioRepository.buscarUsuarioPorEmail(
      email
    );

  }

  /*
  ==================================================
  CRIAR USUÁRIO
  ==================================================

  Regras:

  - Nome obrigatório
  - E-mail obrigatório
  - Senha obrigatória
  - E-mail único
  - Perfil válido
  */
  static async criar(
    nome: string,
    email: string,
    senha: string,
    perfil: PerfilUsuario =
      PerfilUsuario.USUARIO
  ) {

    if (!nome?.trim()) {
      throw new Error(
        "Nome é obrigatório."
      );
    }

    if (!email?.trim()) {
      throw new Error(
        "E-mail é obrigatório."
      );
    }

    if (!senha?.trim()) {
      throw new Error(
        "Senha é obrigatória."
      );
    }

    const usuarioExistente =
      await usuarioRepository.buscarUsuarioPorEmail(
        email
      );

    if (usuarioExistente) {
      throw new Error(
        "Já existe um usuário com este e-mail."
      );
    }

    if (
      perfil !== PerfilUsuario.USUARIO &&
      perfil !== PerfilUsuario.ADMIN
    ) {
      throw new Error(
        "Perfil inválido."
      );
    }

    return await usuarioRepository.criarUsuario(
      nome,
      email,
      senha,
      perfil
    );

  }

  /*
  ==================================================
  ATUALIZAR USUÁRIO
  ==================================================

  Atualiza nome e e-mail.
  */
  static async atualizar(
    id: number,
    nome: string,
    email: string
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await usuarioRepository.atualizarUsuario(
      id,
      nome,
      email
    );

  }

  /*
  ==================================================
  ATUALIZAR SENHA
  ==================================================

  Atualiza a senha do usuário.
  */
  static async atualizarSenha(
    id: number,
    senha: string
  ) {

    if (!senha?.trim()) {
      throw new Error(
        "Senha não informada."
      );
    }

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await usuarioRepository.atualizarSenhaUsuario(
      id,
      senha
    );

  }

  /*
  ==================================================
  ALTERAR PERFIL
  ==================================================

  Perfis válidos:

  - USUARIO
  - ADMIN
  */
  static async alterarPerfil(
    id: number,
    perfil: PerfilUsuario
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    if (
      perfil !== PerfilUsuario.USUARIO &&
      perfil !== PerfilUsuario.ADMIN
    ) {
      throw new Error(
        "Perfil inválido."
      );
    }

    return await usuarioRepository.atualizarPerfilUsuario(
      id,
      perfil
    );

  }

  /*
  ==================================================
  DESATIVAR USUÁRIO
  ==================================================

  Mantém os dados históricos
  sem excluir o cadastro.
  */
  static async desativar(
    id: number
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await usuarioRepository.desativarUsuario(
      id
    );

  }

  /*
  ==================================================
  ATIVAR USUÁRIO
  ==================================================

  Reativa um cadastro previamente
  desativado.
  */
  static async ativar(
    id: number
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await usuarioRepository.ativarUsuario(
      id
    );

  }

  /*
  ==================================================
  REMOVER USUÁRIO
  ==================================================

  Remove definitivamente o usuário.

  Utilizar com cautela.
  */
  static async remover(
    id: number
  ) {

    const usuario =
      await usuarioRepository.buscarUsuarioPorId(
        id
      );

    if (!usuario) {
      throw new Error(
        "Usuário não encontrado."
      );
    }

    return await usuarioRepository.removerUsuario(
      id
    );

  }

}