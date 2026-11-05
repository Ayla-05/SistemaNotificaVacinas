import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/*
Configuração do Prisma (usado para o esquema e as migrações do PostgreSQL).

  npm run db:migrar     aplica as migrações pendentes (produção e desenvolvimento)
  npm run db:nova       cria uma nova migração a partir de mudanças no schema.prisma

A conexão vem de DATABASE_URL (ver .env.example).
*/
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: env("DATABASE_URL")
  }
});
