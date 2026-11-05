-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "perfil" TEXT NOT NULL DEFAULT 'USUARIO',
    "ativo" INTEGER DEFAULT 1,
    "email_verificado" INTEGER DEFAULT 0,
    "codigo_verificacao" TEXT,
    "codigo_verificacao_expira" TEXT,
    "tentativas_falhas" INTEGER DEFAULT 0,
    "bloqueado_ate" TEXT,
    "criado_em" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessoes" (
    "id" TEXT NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "refresh_hash" TEXT NOT NULL,
    "refresh_hash_anterior" TEXT,
    "rotacionado_em" TEXT,
    "user_agent" TEXT,
    "ip" TEXT,
    "criado_em" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),
    "ultimo_uso" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),
    "expira_em" TEXT NOT NULL,
    "revogada_em" TEXT,

    CONSTRAINT "sessoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redefinicoes_senha" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "token_hash" TEXT NOT NULL,
    "criado_em" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),
    "expira_em" TEXT NOT NULL,
    "usado_em" TEXT,

    CONSTRAINT "redefinicoes_senha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracoes" (
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracoes_pkey" PRIMARY KEY ("chave")
);

-- CreateTable
CREATE TABLE "pessoas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "data_nascimento" TEXT NOT NULL,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "foto_perfil" TEXT,
    "receber_email" INTEGER DEFAULT 1,
    "receber_whatsapp" INTEGER DEFAULT 1,
    "frequencia_aviso" TEXT DEFAULT 'UMA_VEZ',
    "ultimo_resumo_em" TEXT,
    "criado_em" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dependentes" (
    "id" SERIAL NOT NULL,
    "responsavel_id" INTEGER NOT NULL,
    "dependente_id" INTEGER NOT NULL,
    "parentesco" TEXT NOT NULL,

    CONSTRAINT "dependentes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_especiais" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,

    CONSTRAINT "grupos_especiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pessoa_grupo_especial" (
    "id" SERIAL NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "grupo_especial_id" INTEGER NOT NULL,
    "gestacao_inicio" TEXT,

    CONSTRAINT "pessoa_grupo_especial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vacinas" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "doencas_evitadas" TEXT,
    "ativa" INTEGER DEFAULT 1,

    CONSTRAINT "vacinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calendario_vacinal" (
    "id" SERIAL NOT NULL,
    "vacina_id" INTEGER NOT NULL,
    "faixa_etaria" TEXT NOT NULL,
    "idade_minima" INTEGER,
    "idade_maxima" INTEGER,
    "doses" INTEGER,
    "reforcos" INTEGER,
    "observacao" TEXT,

    CONSTRAINT "calendario_vacinal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regras_vacinais" (
    "id" SERIAL NOT NULL,
    "vacina_id" INTEGER NOT NULL,
    "grupo_especial_id" INTEGER,
    "intervalo_dose_1_2" INTEGER,
    "intervalo_dose_2_3" INTEGER,
    "intervalo_dose_3_4" INTEGER,
    "intervalo_dose_reforco" INTEGER,
    "reforco_anos" INTEGER,
    "campanha_anual" INTEGER DEFAULT 0,
    "observacao" TEXT,

    CONSTRAINT "regras_vacinais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campanhas_vacinais" (
    "id" SERIAL NOT NULL,
    "vacina_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "data_inicio" TEXT,
    "data_fim" TEXT,
    "publico_alvo" TEXT,
    "ativa" INTEGER DEFAULT 1,
    "fonte" TEXT,
    "ultima_atualizacao" TEXT,

    CONSTRAINT "campanhas_vacinais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_vacinacao" (
    "id" SERIAL NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "vacina_id" INTEGER NOT NULL,
    "data_registro" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "registros_vacinacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doses_vacina" (
    "id" SERIAL NOT NULL,
    "registro_vacinacao_id" INTEGER NOT NULL,
    "numero_dose" INTEGER NOT NULL,
    "tipo" TEXT,
    "data_aplicacao" TEXT,
    "lote" TEXT,
    "fabricante" TEXT,
    "observacao" TEXT,

    CONSTRAINT "doses_vacina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agendamentos_vacina" (
    "id" SERIAL NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "vacina_id" INTEGER NOT NULL,
    "numero_dose" INTEGER NOT NULL,
    "data_prevista" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDENTE',
    "observacao" TEXT,

    CONSTRAINT "agendamentos_vacina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avisos_dose" (
    "id" SERIAL NOT NULL,
    "pessoa_id" INTEGER NOT NULL,
    "vacina_codigo" TEXT NOT NULL,
    "numero_dose" INTEGER NOT NULL,
    "data_prevista" TEXT NOT NULL,
    "enviado_em" TEXT DEFAULT to_char(timezone('UTC', now()), 'YYYY-MM-DD HH24:MI:SS'),

    CONSTRAINT "avisos_dose_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessoes_refresh_hash_key" ON "sessoes"("refresh_hash");

-- CreateIndex
CREATE INDEX "idx_sessoes_usuario" ON "sessoes"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_sessoes_refresh_anterior" ON "sessoes"("refresh_hash_anterior");

-- CreateIndex
CREATE UNIQUE INDEX "redefinicoes_senha_token_hash_key" ON "redefinicoes_senha"("token_hash");

-- CreateIndex
CREATE INDEX "idx_redefinicoes_usuario" ON "redefinicoes_senha"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_pessoas_usuario" ON "pessoas"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_dependentes_responsavel" ON "dependentes"("responsavel_id");

-- CreateIndex
CREATE INDEX "idx_dependentes_dependente" ON "dependentes"("dependente_id");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_especiais_nome_key" ON "grupos_especiais"("nome");

-- CreateIndex
CREATE INDEX "idx_pessoa_grupo_grupo" ON "pessoa_grupo_especial"("grupo_especial_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_pessoa_grupo" ON "pessoa_grupo_especial"("pessoa_id", "grupo_especial_id");

-- CreateIndex
CREATE UNIQUE INDEX "vacinas_codigo_key" ON "vacinas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "vacinas_nome_key" ON "vacinas"("nome");

-- CreateIndex
CREATE INDEX "idx_calendario_vacina" ON "calendario_vacinal"("vacina_id");

-- CreateIndex
CREATE INDEX "idx_calendario_faixa" ON "calendario_vacinal"("faixa_etaria");

-- CreateIndex
CREATE INDEX "idx_regras_vacina" ON "regras_vacinais"("vacina_id", "grupo_especial_id");

-- CreateIndex
CREATE INDEX "idx_regras_grupo" ON "regras_vacinais"("grupo_especial_id");

-- CreateIndex
CREATE INDEX "idx_campanhas_vacina" ON "campanhas_vacinais"("vacina_id");

-- CreateIndex
CREATE INDEX "idx_registro_vacina" ON "registros_vacinacao"("vacina_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_registro_pessoa_vacina" ON "registros_vacinacao"("pessoa_id", "vacina_id");

-- CreateIndex
CREATE UNIQUE INDEX "ux_dose_registro_numero" ON "doses_vacina"("registro_vacinacao_id", "numero_dose");

-- CreateIndex
CREATE INDEX "idx_agendamento_pessoa_data" ON "agendamentos_vacina"("pessoa_id", "data_prevista");

-- CreateIndex
CREATE INDEX "idx_agendamento_vacina" ON "agendamentos_vacina"("vacina_id");

-- CreateIndex
CREATE INDEX "idx_agendamento_status_data" ON "agendamentos_vacina"("status", "data_prevista");

-- CreateIndex
CREATE UNIQUE INDEX "avisos_dose_pessoa_id_vacina_codigo_numero_dose_data_previs_key" ON "avisos_dose"("pessoa_id", "vacina_codigo", "numero_dose", "data_prevista");

-- AddForeignKey
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redefinicoes_senha" ADD CONSTRAINT "redefinicoes_senha_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoas" ADD CONSTRAINT "pessoas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_responsavel_id_fkey" FOREIGN KEY ("responsavel_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dependentes" ADD CONSTRAINT "dependentes_dependente_id_fkey" FOREIGN KEY ("dependente_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_grupo_especial" ADD CONSTRAINT "pessoa_grupo_especial_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pessoa_grupo_especial" ADD CONSTRAINT "pessoa_grupo_especial_grupo_especial_id_fkey" FOREIGN KEY ("grupo_especial_id") REFERENCES "grupos_especiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calendario_vacinal" ADD CONSTRAINT "calendario_vacinal_vacina_id_fkey" FOREIGN KEY ("vacina_id") REFERENCES "vacinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_vacinais" ADD CONSTRAINT "regras_vacinais_vacina_id_fkey" FOREIGN KEY ("vacina_id") REFERENCES "vacinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "regras_vacinais" ADD CONSTRAINT "regras_vacinais_grupo_especial_id_fkey" FOREIGN KEY ("grupo_especial_id") REFERENCES "grupos_especiais"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campanhas_vacinais" ADD CONSTRAINT "campanhas_vacinais_vacina_id_fkey" FOREIGN KEY ("vacina_id") REFERENCES "vacinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_vacinacao" ADD CONSTRAINT "registros_vacinacao_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_vacinacao" ADD CONSTRAINT "registros_vacinacao_vacina_id_fkey" FOREIGN KEY ("vacina_id") REFERENCES "vacinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doses_vacina" ADD CONSTRAINT "doses_vacina_registro_vacinacao_id_fkey" FOREIGN KEY ("registro_vacinacao_id") REFERENCES "registros_vacinacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_vacina" ADD CONSTRAINT "agendamentos_vacina_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agendamentos_vacina" ADD CONSTRAINT "agendamentos_vacina_vacina_id_fkey" FOREIGN KEY ("vacina_id") REFERENCES "vacinas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avisos_dose" ADD CONSTRAINT "avisos_dose_pessoa_id_fkey" FOREIGN KEY ("pessoa_id") REFERENCES "pessoas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
