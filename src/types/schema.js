// src/types/schema.js

/**
 * Definições dos Schemas e Data Models do sistema.
 * Estes tipos definem a estrutura dos dados que trafegam entre
 * o Firebase, as Cloud Functions e a interface do usuário.
 */

/**
 * Modelo de Dependente (Usuário Cidadão)
 * Representa uma pessoa vinculada à conta principal (Ana)
 */
export const DependenteSchema = {
  id: "string - ID único do dependente",
  usuarioId: "string - ID do usuário responsável",
  nome: "string - Nome completo",
  dataNascimento: "string - YYYY-MM-DD",
  parentesco: "string - titular, filho, filha, cônjuge",
  avatar: "string - Emoji ou URL da foto"
};

/**
 * Modelo de Registro de Vacina
 * Cada dose aplicada ou agendada
 */
export const VacinaRegistroSchema = {
  id: "string - ID único do registro",
  dependenteId: "string - Referência ao dependente",
  nomeVacina: "string - Nome da vacina",
  dose: "string - Dose 1, Reforço, Dose Única",
  dataAplicacao: "string - YYYY-MM-DD",
  dataProximaDose: "string - YYYY-MM-DD (opcional)",
  lote: "string - Número do lote",
  localAplicacao: "string - Nome do posto/clínica",
  status: "string - aplicada, proxima, atrasada, campanha",
  origemDocumentoUrl: "string - URL da imagem no Storage",
  validadoManualmente: "boolean - Indica revisão humana"
};

/**
 * Schema de Resposta da IA (GPT-4o Vision)
 * Formato esperado ao processar a carteirinha
 */
export const GPT4oVisionResponseSchema = {
  vacina: "",
  dose: "",
  dataAplicacao: "YYYY-MM-DD",
  lote: "",
  localAplicacao: "",
  precisaoLeitura: 0.95 // Score de confiança da extração
};