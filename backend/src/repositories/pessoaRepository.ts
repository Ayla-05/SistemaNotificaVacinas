import { db } from "../database/database";

/*
==================================================
LISTAR TODAS AS PESSOAS
==================================================
*/
export function listarPessoas(): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM pessoas
      ORDER BY nome
      `,
      [],
      (err, rows) => {

        if (err) {
          return reject(err);
        }

        resolve(rows || []);

      }
    );

  });

}

/*
==================================================
BUSCAR PESSOA POR ID
==================================================
*/
export function buscarPessoaPorId(
  id: number
): Promise<any> {

  return new Promise((resolve, reject) => {

    db.get(
      `
      SELECT *
      FROM pessoas
      WHERE id = ?
      `,
      [id],
      (err, row) => {

        if (err) {
          return reject(err);
        }

        resolve(row);

      }
    );

  });

}

/*
==================================================
LISTAR PESSOAS DE UM USUÁRIO
==================================================
*/
export function listarPessoasPorUsuario(
  usuarioId: number
): Promise<any[]> {

  return new Promise((resolve, reject) => {

    db.all(
      `
      SELECT *
      FROM pessoas
      WHERE usuario_id = ?
      ORDER BY nome
      `,
      [usuarioId],
      (err, rows) => {

        if (err) {
          return reject(err);
        }

        resolve(rows || []);

      }
    );

  });

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

  return new Promise((resolve, reject) => {

    db.run(
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
      ],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.lastID);

      }
    );

  });

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

  return new Promise((resolve, reject) => {

    db.run(
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
      ],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.changes);

      }
    );

  });

}

/*
==================================================
REMOVER PESSOA
==================================================
*/
export function removerPessoa(
  id: number
): Promise<number> {

  return new Promise((resolve, reject) => {

    db.run(
      `
      DELETE FROM pessoas
      WHERE id = ?
      `,
      [id],
      function (err) {

        if (err) {
          return reject(err);
        }

        resolve(this.changes);

      }
    );

  });

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

  return new Promise((resolve, reject) => {

    db.run(
      `UPDATE pessoas SET ultimo_resumo_em = ? WHERE id = ?`,
      [data, id],
      (err) => {

        if (err) {
          return reject(err);
        }

        resolve();

      }
    );

  });

}
