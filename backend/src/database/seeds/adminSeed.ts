import { UsuarioService }
  from "../../services/usuarioService";

import * as usuarioRepository
  from "../../repositories/usuarioRepository";

import { PerfilUsuario }
  from "../../enums/perfilUsuario";

/*
==================================================
ADMIN SEED
==================================================

Cria o administrador inicial, mas SOMENTE se
ADMIN_EMAIL e ADMIN_SENHA estiverem definidos no
.env. Sem credencial fixa embutida no código —
em produção não pode existir usuário/senha
conhecidos de antemão.

Se você já tem um administrador e só quer criar
usuários comuns, pode deixar essas duas variáveis
vazias/ausentes que este seed não faz nada.
*/
export async function executarAdminSeed() {

  const email =
    process.env.ADMIN_EMAIL;

  const senha =
    process.env.ADMIN_SENHA;

  if (!email || !senha) {

    console.log(
      "ADMIN_EMAIL/ADMIN_SENHA não definidos — nenhum administrador foi criado automaticamente."
    );

    return;

  }

  const usuario =
    await usuarioRepository
      .buscarUsuarioPorEmail(
        email
      );

  if (usuario) {

    console.log(
      "Administrador já cadastrado."
    );

    return;

  }

  /*
  Passa pelo UsuarioService (não pelo
  repository direto) para que a senha
  seja armazenada com hash bcrypt.
  */
  await UsuarioService.criar(
    "Administrador",
    email,
    senha,
    PerfilUsuario.ADMIN
  );

  console.log(
    "Administrador criado com sucesso."
  );

}
