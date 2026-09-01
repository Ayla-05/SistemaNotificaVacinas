import * as usuarioRepository
  from "../../repositories/usuarioRepository";

import { PerfilUsuario }
  from "../../enums/perfilUsuario";

/*
==================================================
ADMIN SEED
==================================================

Cria o administrador padrão
caso ele não exista.
*/
export async function executarAdminSeed() {

  const email =
    "admin@notificavacinas.com";

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

  await usuarioRepository
    .criarUsuario(
      "Administrador",
      email,
      "admin123",
      PerfilUsuario.ADMIN
    );

  console.log(
    "Administrador criado com sucesso."
  );

}