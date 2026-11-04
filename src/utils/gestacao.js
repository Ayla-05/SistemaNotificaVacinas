// src/utils/gestacao.js
//
// Semanas de gestação <-> data de início. O sistema guarda o início (AAAA-MM-DD) porque as
// semanas mudam todo dia; a pessoa informa "quantas semanas hoje".

function paraIso(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Data de início estimada, dadas as semanas completas de hoje. */
export function inicioDaGestacao(semanas, hoje = new Date()) {
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - Number(semanas) * 7);
  return paraIso(inicio);
}

/** Semanas completas de gestação hoje, a partir do início guardado. */
export function semanasDeGestacao(inicioIso, hoje = new Date()) {
  if (!inicioIso) return null;
  const [a, m, d] = inicioIso.slice(0, 10).split('-').map(Number);
  const dias = Math.floor((new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()) - new Date(a, m - 1, d)) / 86400000);
  return Math.floor(dias / 7);
}

/** Data provável do parto (40 semanas depois do início). */
export function partoPrevisto(inicioIso) {
  const [a, m, d] = inicioIso.slice(0, 10).split('-').map(Number);
  return paraIso(new Date(a, m - 1, d + 40 * 7));
}

export const SEMANAS_MIN = 1;
export const SEMANAS_MAX = 42;

/** Semanas válidas (inteiro de 1 a 42)? */
export function semanasValidas(valor) {
  const n = Number(valor);
  return Number.isInteger(n) && n >= SEMANAS_MIN && n <= SEMANAS_MAX;
}
