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
    const erro = new Error(dados.erro || "Erro ao comunicar com o servidor.");
    // Repassa campos extras do corpo (ex.: precisaVerificar, email) para quem chamou.
    Object.assign(erro, dados);
    throw erro;
  }

  return dados;
}

/**
 * Rotas de /auth que nunca disparam renovação de sessão: um 401 nelas
 * significa "credencial errada", não "sessão vencida".
 */
const ROTAS_SEM_RENOVACAO = [
  "/auth/login",
  "/auth/refresh",
  "/auth/registrar",
  "/auth/confirmar-email",
  "/auth/reenviar-codigo",
  "/auth/esqueci-senha",
  "/auth/redefinir-senha",
  "/auth/logout"
];

/**
 * Renovação em andamento, compartilhada: várias requisições que tomam 401
 * ao mesmo tempo esperam a MESMA renovação. O refresh token é rotativo e de
 * uso único; disparar várias renovações em paralelo faria o servidor
 * enxergar reuso.
 */
let renovacaoEmAndamento = null;

function renovarSessao() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "X-CSRF-Protection": "1" }
    })
      // 409 = outra aba acabou de renovar; o cookie novo já está no navegador.
      .then((response) => response.ok || response.status === 409)
      .catch(() => false)
      .finally(() => {
        renovacaoEmAndamento = null;
      });
  }

  return renovacaoEmAndamento;
}

/**
 * Wrapper de fetch com "credentials: include" fixo.
 * Necessário para que os cookies httpOnly de sessão
 * (definidos pelo backend em /auth/login) sejam enviados
 * em toda chamada, já que frontend e backend rodam em
 * portas/origens diferentes.
 *
 * Também:
 * - envia o cabeçalho X-CSRF-Protection (exigido pelo backend em
 *   toda requisição que altera dados);
 * - se o token de acesso (curto, 15 min) venceu, renova a sessão
 *   com o refresh token e repete a requisição uma vez.
 */
async function chamarApi(caminho, opcoes = {}) {
  const enviar = () =>
    fetch(`${API_URL}${caminho}`, {
      credentials: "include",
      ...opcoes,
      headers: {
        ...opcoes.headers,
        "X-CSRF-Protection": "1"
      }
    });

  const response = await enviar();

  if (response.status !== 401 || ROTAS_SEM_RENOVACAO.includes(caminho)) {
    return response;
  }

  const renovou = await renovarSessao();

  if (!renovou) {
    window.dispatchEvent(new Event("sessao-expirada"));
    return response;
  }

  return enviar();
}

/* ==================================================
   ENDEREÇO (ViaCEP)
   ================================================== */

/**
 * Busca logradouro/bairro/cidade/estado a partir do CEP,
 * usando a API pública e gratuita do ViaCEP (não passa pelo
 * nosso backend). Retorna null se o CEP for inválido/não
 * encontrado, em vez de lançar erro — é um preenchimento
 * automático "de cortesia", nunca deve travar o formulário.
 */
export async function buscarEnderecoPorCep(cep) {
  const cepLimpo = (cep || "").replace(/\D/g, "");

  if (cepLimpo.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const dados = await response.json();

    if (!response.ok || dados.erro) {
      return null;
    }

    return {
      logradouro: dados.logradouro || "",
      bairro: dados.bairro || "",
      cidade: dados.localidade || "",
      estado: dados.uf || ""
    };
  } catch {
    return null;
  }
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
 * Confirma o e-mail com o código de 6 dígitos recebido
 * no cadastro (ou reenviado). Se válido, já devolve o
 * usuário autenticado e define o cookie de sessão.
 */
export async function confirmarEmail({ email, codigo }) {
  const response = await chamarApi("/auth/confirmar-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, codigo })
  });

  return tratarResposta(response);
}

/**
 * Reenvia o código de confirmação para o e-mail informado.
 */
export async function reenviarCodigo(email) {
  const response = await chamarApi("/auth/reenviar-codigo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  return tratarResposta(response);
}

/**
 * Avisa o backend que o onboarding pós-cadastro terminou
 * (preenchido ou pulado), disparando o e-mail de boas-vindas
 * definitivo. Requer sessão ativa (chamar depois do login/confirmarEmail).
 */
export async function concluirCadastro() {
  const response = await chamarApi("/auth/concluir-cadastro", {
    method: "POST"
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
 * Pede o e-mail com o link para criar uma nova senha. A resposta é
 * sempre a mesma, exista a conta ou não.
 */
export async function esqueciSenha(email) {
  const response = await chamarApi("/auth/esqueci-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  return tratarResposta(response);
}

/**
 * Define a nova senha usando o token do link recebido por e-mail.
 */
export async function redefinirSenha({ token, senha }) {
  const response = await chamarApi("/auth/redefinir-senha", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, senha })
  });

  return tratarResposta(response);
}

/**
 * Dispositivos/navegadores com sessão aberta na conta.
 */
export async function listarSessoes() {
  const response = await chamarApi("/auth/sessoes");
  return tratarResposta(response);
}

/**
 * Encerra a sessão de um dispositivo específico.
 */
export async function encerrarSessao(id) {
  const response = await chamarApi(`/auth/sessoes/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });

  return tratarResposta(response);
}

/**
 * Sai de todos os dispositivos. Com manterAtual, preserva só este.
 */
export async function encerrarTodasSessoes({ manterAtual = false } = {}) {
  const response = await chamarApi("/auth/sessoes/encerrar-todas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manterAtual })
  });

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

/**
 * Cria um novo agendamento manual (data prevista para aplicação de uma dose).
 */
export async function criarAgendamento({ pessoaId, vacinaId, numeroDose, dataPrevista, observacao }) {
  const response = await chamarApi('/agendamentos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pessoaId, vacinaId, numeroDose, dataPrevista, observacao })
  });

  return tratarResposta(response);
}

/**
 * Remove um agendamento.
 */
export async function removerAgendamento(id) {
  const response = await chamarApi(`/agendamentos/${id}`, { method: 'DELETE' });
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
