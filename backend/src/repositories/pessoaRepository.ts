import { alterar, consultarTodos, consultarUm, inserir } from "../database/database";

/*
==================================================
LISTAR TODAS AS PESSOAS
==================================================
*/
export function listarPessoas(): Promise<any[]> {

  return consultarTodos(
    `
      SELECT *
      FROM pessoas
      ORDER BY nome
      `,
    []
  );

}

/*
==================================================
BUSCAR PESSOA POR ID
==================================================
*/
export function buscarPessoaPorId(
  id: number
): Promise<any> {

  return consultarUm(
    `
      SELECT *
      FROM pessoas
      WHERE id = ?
      `,
    [id]
  );

}

/*
==================================================
LISTAR PESSOAS DE UM USUÁRIO
==================================================
*/
export function listarPessoasPorUsuario(
  usuarioId: number
): Promise<any[]> {

  return consultarTodos(
    `
      SELECT *
      FROM pessoas
      WHERE usuario_id = ?
      ORDER BY nome
      `,
    [usuarioId]
  );

}

/*
==================================================
CRIAR PESSOA
==================================================
*/
export function criarPessoa(
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
): Promise<number> {

  return inserir(
    `
      INSERT INTO pessoas (

        usuario_id,

        nome,

        email,

        telefone,

        data_nascimento,

        cep,

        logradouro,

        numero,

        complemento,

        bairro,

        cidade,

        estado,

        foto_perfil,

        receber_email,

        receber_whatsapp,

        frequencia_aviso

      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    [
        dados.usuario_id,

        dados.nome,

        dados.email ?? null,

        dados.telefone ?? null,

        dados.data_nascimento,

        dados.cep ?? null,

        dados.logradouro ?? null,

        dados.numero ?? null,

        dados.complemento ?? null,

        dados.bairro ?? null,

        dados.cidade ?? null,

        dados.estado ?? null,

        dados.foto_perfil ?? null,

        dados.receber_email ?? 1,

        dados.receber_whatsapp ?? 1,

        dados.frequencia_aviso ?? "UMA_VEZ"
      ]
  );

}

/*
==================================================
ATUALIZAR PESSOA
==================================================
*/
export function atualizarPessoa(
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
): Promise<number> {

  return alterar(
    `
      UPDATE pessoas
      SET

        nome = ?,

        email = ?,

        telefone = ?,

        data_nascimento = ?,

        cep = ?,

        logradouro = ?,

        numero = ?,

        complemento = ?,

        bairro = ?,

        cidade = ?,

        estado = ?,

        foto_perfil = ?,

        receber_email = ?,

        receber_whatsapp = ?,
        frequencia_aviso = ?

      WHERE id = ?
      `,
    [
        dados.nome,

        dados.email ?? null,

        dados.telefone ?? null,

        dados.data_nascimento,

        dados.cep ?? null,

        dados.logradouro ?? null,

        dados.numero ?? null,

        dados.complemento ?? null,

        dados.bairro ?? null,

        dados.cidade ?? null,

        dados.estado ?? null,

        dados.foto_perfil ?? null,

        dados.receber_email ?? 1,

        dados.receber_whatsapp ?? 1,

        dados.frequencia_aviso ?? "UMA_VEZ",

        id
      ]
  );

}

/*
==================================================
REMOVER PESSOA
==================================================
*/
export function removerPessoa(
  id: number
): Promise<number> {

  /* CORREÇÃO [COR-28]: o ON DELETE CASCADE do esquema apaga os dependentes. */
  return alterar(
    `DELETE FROM pessoas WHERE id = ?`,
    [id]
  );

}

/*
==================================================
REGISTRAR O ÚLTIMO RESUMO ENVIADO
==================================================

Data (AAAA-MM-DD) do último resumo periódico de doses enviado
por e-mail; usada para respeitar a frequência escolhida.
*/
export function registrarUltimoResumo(
  id: number,
  data: string
): Promise<void> {

  return alterar(
    `UPDATE pessoas SET ultimo_resumo_em = ? WHERE id = ?`,
    [data, id]
  ).then(() => undefined);

}
