import { removerEmCascata, alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
USUARIO REPOSITORY
==================================================

Responsabilidades:

- Acesso aos dados de usuários
- Execução de consultas SQL
- CRUD de usuários

NÃO é responsável por:

- Regras de negócio
- Requisições HTTP
- Autenticação

Tabela:

usuarios
*/
 
/*
==================================================
LISTAR TODOS OS USUÁRIOS
==================================================
*/
export function listarUsuarios(): Promise<any[]> {

  return consultarTodos(
    `
      SELECT *
      FROM usuarios
      ORDER BY nome
      `,
    []
  );

}

/*
==================================================
BUSCAR USUÁRIO POR ID
==================================================
*/
export function buscarUsuarioPorId(
  id: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM usuarios
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
BUSCAR USUÁRIO POR EMAIL
==================================================
*/
export function buscarUsuarioPorEmail(
  email: string
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM usuarios
      WHERE email = ?
      `,
    [email.trim()]
  );

}

/*
==================================================
CRIAR USUÁRIO
==================================================

Perfis:

- USUARIO
- ADMIN
*/
export function criarUsuario(
  nome: string,
  email: string,
  senha: string,
  perfil: string = "USUARIO",
  emailVerificado: boolean = false
): Promise<number> {

  return inserir(
    `
      INSERT INTO usuarios (
        nome,
        email,
        senha,
        perfil,
        email_verificado
      )
      VALUES (?, ?, ?, ?, ?)
      `,
    [
        nome,
        email,
        senha,
        perfil,
        emailVerificado ? 1 : 0
      ]
  );

}

/*
==================================================
DEFINIR CÓDIGO DE VERIFICAÇÃO DE E-MAIL
==================================================

Usado no cadastro e no reenvio de código.
*/
export function definirCodigoVerificacao(
  id: number,
  codigo: string,
  expiraEm: string
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET
        codigo_verificacao = ?,
        codigo_verificacao_expira = ?
      WHERE id = ?
      `,
    [
        codigo,
        expiraEm,
        id
      ]
  );

}

/*
==================================================
CONFIRMAR E-MAIL
==================================================

Marca o e-mail como verificado e limpa o código
(não pode mais ser reutilizado depois de confirmado).
*/
export function confirmarEmailUsuario(
  id: number
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET
        email_verificado = 1,
        codigo_verificacao = NULL,
        codigo_verificacao_expira = NULL
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
ATUALIZAR USUÁRIO
==================================================
*/
export function atualizarUsuario(
  id: number,
  nome: string,
  email: string
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET
        nome = ?,
        email = ?
      WHERE id = ?
      `,
    [
        nome,
        email,
        id
      ]
  );

}

/*
==================================================
ATUALIZAR SENHA
==================================================
*/
export function atualizarSenhaUsuario(
  id: number,
  senha: string
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET senha = ?
      WHERE id = ?
      `,
    [
        senha,
        id
      ]
  );

}

/*
==================================================
ATUALIZAR PERFIL
==================================================

Perfis válidos:

- USUARIO
- ADMIN
*/
export function atualizarPerfilUsuario(
  id: number,
  perfil: string
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET perfil = ?
      WHERE id = ?
      `,
    [
        perfil,
        id
      ]
  );

}

/*
==================================================
DESATIVAR USUÁRIO
==================================================
*/
export function desativarUsuario(
  id: number
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET ativo = 0
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
ATIVAR USUÁRIO
==================================================
*/
export function ativarUsuario(
  id: number
): Promise<number> {

  return alterar(
    `
      UPDATE usuarios
      SET ativo = 1
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
REMOVER USUÁRIO
==================================================
*/
/*
Quantos administradores ativos existem. Usado para nunca
deixar o sistema sem ninguém que o administre.
*/
export async function contarAdministradoresAtivos(): Promise<number> {

  const linha = await consultarUm(
    `
      SELECT COUNT(*) AS total
      FROM usuarios
      WHERE perfil = 'ADMIN' AND ativo = 1
      `
  );

  return linha?.total ?? 0;

}

/*
==================================================
REMOVER USUÁRIO (E TUDO QUE É DELE)
==================================================
*/
export function removerUsuario(
  id: number
): Promise<number> {

  return removerEmCascata(
    "usuarios",
    id,
    [
    "DELETE FROM doses_vacina WHERE registro_vacinacao_id IN (SELECT id FROM registros_vacinacao WHERE pessoa_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID))",
    "DELETE FROM registros_vacinacao WHERE pessoa_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID)",
    "DELETE FROM agendamentos_vacina WHERE pessoa_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID)",
    "DELETE FROM avisos_dose WHERE pessoa_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID)",
    "DELETE FROM pessoa_grupo_especial WHERE pessoa_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID)",
    "DELETE FROM dependentes WHERE responsavel_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID) OR dependente_id IN (SELECT id FROM pessoas WHERE usuario_id = $ID)",
    "DELETE FROM pessoas WHERE usuario_id = $ID",
    "DELETE FROM sessoes WHERE usuario_id = $ID",
    "DELETE FROM redefinicoes_senha WHERE usuario_id = $ID"
    ]
  );

}
/*
==================================================
BLOQUEIO PROGRESSIVO DE LOGIN
==================================================
*/
export function registrarFalhaDeLogin(
  id: number,
  tentativas: number,
  bloqueadoAte: string | null
): Promise<void> {

  return alterar(
    `
      UPDATE usuarios
      SET tentativas_falhas = ?,
          bloqueado_ate = ?
      WHERE id = ?
      `,
    [tentativas, bloqueadoAte, id]
  ).then(() => undefined);

}

export function zerarFalhasDeLogin(
  id: number
): Promise<void> {

  return registrarFalhaDeLogin(id, 0, null);

}
