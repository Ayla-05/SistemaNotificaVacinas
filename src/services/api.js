// src/services/api.js

/**
 * URL base da API do backend.
 * Configurável via VITE_API_URL (.env); assume o valor
 * padrão usado pelo backend (server.ts) em desenvolvimento.
 */
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

/**
 * Trata a resposta do fetch, lançando erro quando o
 * backend retorna um status de falha (4xx/5xx).
 */
async function tratarResposta(response) {
  const dados = await response.json();

  if (!response.ok) {
    throw new Error(dados.erro || "Erro ao comunicar com o servidor.");
  }

  return dados;
}

/**
 * Wrapper de fetch com "credentials: include" fixo.
 * Necessário para que o cookie httpOnly de sessão
 * (definido pelo backend em /auth/login) seja enviado
 * em toda chamada, já que frontend e backend rodam em
 * portas/origens diferentes.
 */
function chamarApi(caminho, opcoes = {}) {
  return fetch(`${API_URL}${caminho}`, {
    credentials: "include",
    ...opcoes
  });
}

/* ==================================================
   AUTENTICAÇÃO
   ================================================== */

/**
 * Cria a conta (perfil USUARIO) e já autentica.
 */
export async function registrar({ nome, email, senha, dataNascimento }) {
  const response = await chamarApi("/auth/registrar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, email, senha, dataNascimento })
  });

  return tratarResposta(response);
}

/**
 * Autentica e recebe o cookie httpOnly de sessão.
 */
export async function login(email, senha) {
  const response = await chamarApi("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  return tratarResposta(response);
}

/**
 * Encerra a sessão atual (limpa o cookie no backend).
 */
export async function logout() {
  const response = await chamarApi("/auth/logout", { method: "POST" });
  return tratarResposta(response);
}

/**
 * Usuário autenticado atual, a partir do cookie de sessão.
 * Retorna null (em vez de lançar erro) quando não há sessão,
 * para facilitar a checagem inicial de autenticação.
 */
export async function obterUsuarioAtual() {
  const response = await chamarApi("/auth/me");

  if (response.status === 401) {
    return null;
  }

  return tratarResposta(response);
}

/* ==================================================
   PESSOAS
   ================================================== */

/**
 * Pessoas (titular + dependentes) vinculadas à conta do usuário.
 */
export async function obterPessoasDoUsuario(idUsuario) {
  const response = await chamarApi(`/pessoas/usuario/${idUsuario}`);
  return tratarResposta(response);
}

/**
 * Dados completos de uma pessoa (usado na tela de Perfil).
 */
export async function obterPessoa(idPessoa) {
  const response = await chamarApi(`/pessoas/${idPessoa}`);
  return tratarResposta(response);
}

/**
 * Atualiza os dados cadastrais de uma pessoa. Aceita atualização
 * parcial (só os campos passados são alterados).
 */
export async function atualizarPessoa(idPessoa, dados) {
  const response = await chamarApi(`/pessoas/${idPessoa}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  });

  return tratarResposta(response);
}

/* ==================================================
   DEPENDENTES
   ================================================== */

/**
 * Dependentes (filhos, pais, etc) vinculados a uma pessoa responsável.
 */
export async function obterDependentes(idPessoaResponsavel) {
  const response = await chamarApi(`/dependentes/pessoa/${idPessoaResponsavel}`);
  return tratarResposta(response);
}

/**
 * Cadastra uma nova pessoa já vinculada como dependente.
 */
export async function cadastrarDependente({
  responsavelPessoaId,
  nome,
  data_nascimento,
  parentesco,
  email,
  telefone
}) {
  const response = await chamarApi("/dependentes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ responsavelPessoaId, nome, data_nascimento, parentesco, email, telefone })
  });

  return tratarResposta(response);
}

/**
 * Remove o vínculo de dependência (a pessoa em si permanece cadastrada).
 */
export async function removerDependente(responsavelId, dependenteId) {
  const response = await chamarApi(`/dependentes/${responsavelId}/${dependenteId}`, {
    method: "DELETE"
  });

  return tratarResposta(response);
}

/* ==================================================
   GRUPOS ESPECIAIS (RISCO)
   ================================================== */

/**
 * Catálogo de grupos especiais disponíveis (gestante, idoso, etc).
 */
export async function obterCatalogoGruposEspeciais() {
  const response = await chamarApi("/grupos-especiais");
  return tratarResposta(response);
}

/**
 * Grupos especiais vinculados a uma pessoa.
 */
export async function obterGruposDaPessoa(idPessoa) {
  const response = await chamarApi(`/grupos-especiais/pessoa/${idPessoa}`);
  return tratarResposta(response);
}

/**
 * Vincula a pessoa a um grupo especial.
 */
export async function vincularGrupoEspecial(idPessoa, grupoEspecialId) {
  const response = await chamarApi(`/grupos-especiais/pessoa/${idPessoa}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ grupoEspecialId })
  });

  return tratarResposta(response);
}

/**
 * Remove o vínculo da pessoa com um grupo especial.
 */
export async function desvincularGrupoEspecial(idPessoa, grupoEspecialId) {
  const response = await chamarApi(`/grupos-especiais/pessoa/${idPessoa}/${grupoEspecialId}`, {
    method: "DELETE"
  });

  return tratarResposta(response);
}

/* ==================================================
   RESUMO VACINAL / CARTEIRA / CALENDÁRIO
   ================================================== */

/**
 * Resumo vacinal da pessoa: vacinas em dia e pendentes.
 * Usado pelo Dashboard.
 */
export async function obterPendencias(idPessoa) {
  const response = await chamarApi(`/pendencias/${idPessoa}`);
  return tratarResposta(response);
}

/**
 * Carteira vacinal completa da pessoa.
 */
export async function obterCarteira(idPessoa) {
  const response = await chamarApi(`/carteira/pessoa/${idPessoa}`);
  return tratarResposta(response);
}

/**
 * Registra uma vacina + dose já revisada pelo usuário
 * (fluxo do Scan, depois da confirmação manual).
 */
export async function registrarVacinaNaCarteira({ pessoaId, vacinaId }) {
  const response = await chamarApi("/carteira/registro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pessoaId, vacinaId })
  });

  return tratarResposta(response);
}

/**
 * Confirma na carteira os dados lidos pelo Claude Vision
 * (já revisados/editados pelo usuário na tela de Scan).
 */
export async function confirmarScanNaCarteira({
  pessoaId,
  vacina,
  dose,
  dataAplicacao,
  lote,
  localAplicacao
}) {
  const response = await chamarApi("/carteira/confirmar-scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pessoaId, vacina, dose, dataAplicacao, lote, localAplicacao })
  });

  return tratarResposta(response);
}

/**
 * Lista de vacinas cadastradas no sistema.
 */
export async function obterVacinas() {
  const response = await chamarApi("/vacinas");
  return tratarResposta(response);
}

/**
 * Calendário vacinal (agendamentos) de uma pessoa.
 * Usado pela tela de Calendário.
 */
export async function obterAgendamentos(idPessoa) {
  const response = await chamarApi(`/agendamentos/pessoa/${idPessoa}`);
  return tratarResposta(response);
}

/* ==================================================
   SCAN (CLAUDE VISION)
   ================================================== */

/**
 * Envia a foto da carteirinha (base64, sem o prefixo
 * "data:image/...;base64,") para leitura via Claude Vision.
 */
export async function analisarCarteirinha({ pessoaId, imagemBase64, mediaType }) {
  const response = await chamarApi("/scan/analisar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pessoaId, imagemBase64, mediaType })
  });

  return tratarResposta(response);
}
