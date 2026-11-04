// src/components/mascotes/poses.js
//
// Poses do esqueleto do Chibi. Cada pose é um conjunto de ângulos (graus) e
// deslocamentos (px) aplicados como variáveis CSS; o CSS faz a transição suave
// entre uma pose e outra.
//
//   rx, ry, rot   corpo inteiro (deslocamento e giro em torno do quadril)
//   torso         inclinação do tronco · giro (0.85-1) torção do tronco · cx deslocamento lateral da cabeça
//   cabeca/cy     inclinação e altura da cabeça
//   sl/el, sr/er  ombro e cotovelo (esquerdo/direito) · pe/pd pulso · oe/od "encolher" o ombro (px)
//   me/md         formato da mão (ver MAOS): aberta, relaxada, fofa, fechada, apontar, paz
//   hl/kl, hr/kr  quadril e joelho · tl/tr tornozelo
//   sombra        largura da sombra no chão · trav  travesseiro (0 ou 1)
//
// Ângulo positivo gira no sentido horário. Braço/perna do lado esquerdo do
// desenho abrem para fora com ângulo positivo; os do lado direito, com negativo.

/** Formatos de mão: escala de cada dedo (1 = esticado, ~0.35 = dobrado) e abertura em graus. */
export const MAOS = {
  aberta: { I: 1, M: 1.05, R: 0.98, P: 0.85, T: 1, S: 11 },
  relaxada: { I: 0.82, M: 0.86, R: 0.8, P: 0.7, T: 0.8, S: 5 },
  fofa: { I: 0.62, M: 0.64, R: 0.6, P: 0.5, T: 0.7, S: 2 },
  fechada: { I: 0.36, M: 0.36, R: 0.36, P: 0.34, T: 0.55, S: 0 },
  apontar: { I: 1.05, M: 0.36, R: 0.36, P: 0.34, T: 0.55, S: 0 },
  paz: { I: 1.05, M: 1.05, R: 0.36, P: 0.34, T: 0.5, S: 16 }
};

export const PADRAO = {
  rx: 0, ry: 0, rot: 0,
  torso: 0, giro: 1, cabeca: 0, cy: 0, cx: 0,
  sl: 6, el: 0, sr: -6, er: 0,
  pe: 0, pd: 0, oe: 0, od: 0,
  me: 'relaxada', md: 'relaxada',
  hl: 0, kl: 0, hr: 0, kr: 0, tl: 0, tr: 0,
  sombra: 1, trav: 0
};

export const POSES = {
  parado: {},

  // acordado
  pulo: { sl: 130, sr: -130, oe: -2, od: -2, me: 'aberta', md: 'aberta', hl: 24, kl: -40, hr: -24, kr: 40, tl: 18, tr: -18, ry: -2 },
  sentado: { hl: 4, hr: -4, sl: 20, sr: -20, tl: -14, tr: 14, me: 'fofa', md: 'fofa' },
  chao: { ry: 12, hl: 62, kl: -6, hr: -62, kr: 6, sl: 40, el: 28, sr: -40, er: -28, me: 'fofa', md: 'fofa' },
  agachado: { ry: 15, hl: 52, kl: -92, hr: -52, kr: 92, sl: 30, el: 26, sr: -30, er: -26, me: 'fofa', md: 'fofa' },
  esticar: { sl: 150, sr: -150, oe: -3, od: -3, ry: -5, cabeca: -6, hl: 3, hr: -3, tl: 22, tr: -22, me: 'aberta', md: 'aberta' },
  pensar: { sr: -22, er: -148, cabeca: 9, sl: 10, md: 'fofa', cx: 2 },
  acenar: { sr: -150, er: -10, od: -2, md: 'aberta', me: 'relaxada' },
  comemorar: { sl: 128, sr: -128, oe: -2, od: -2, me: 'aberta', md: 'aberta' },
  apontar: { sr: -90, er: 0, torso: 3, md: 'apontar', me: 'fofa' },
  paz: { sr: -135, er: -30, od: -2, md: 'paz', me: 'fofa', cabeca: -5 },
  olhar: { cx: 3.5, giro: 0.9, cabeca: 7, torso: 2 },
  segurar: { sl: 140, sr: -140, oe: -2, od: -2, me: 'fechada', md: 'fechada' },
  erguido: { sl: 140, sr: -140, oe: -2, od: -2, hl: 6, hr: -6, me: 'aberta', md: 'aberta' },

  // dormindo
  dormirEmPe: { torso: 9, cabeca: 30, cy: 3, sl: 16, el: 14, sr: -16, er: -14, hl: 7, kl: -14, hr: -7, kr: 14, ry: 3, me: 'fofa', md: 'fofa' },
  dormirSentado: { ry: 12, hl: 62, kl: -6, hr: -62, kr: 6, torso: 24, cabeca: 34, cy: 4, sl: 34, el: 48, sr: -34, er: -48, me: 'fofa', md: 'fofa' },
  // duas fadinhas dormindo encostadas uma na outra (cada uma inclina um pouco para a parceira)
  dormirApoiado: { ry: 12, hl: 62, kl: -6, hr: -62, kr: 6, torso: 14, cabeca: 30, cy: 3, sl: 30, el: 40, sr: -30, er: -40, me: 'fofa', md: 'fofa' },
  dormirDeitado: { rot: -90, rx: 14, ry: -7, cabeca: 70, cy: -7, sl: 28, sr: -28, hl: 4, hr: -4, sombra: 1.5, trav: 1, me: 'fofa', md: 'fofa' }
};

const UNIDADE = { rx: 'px', ry: 'px', cy: 'px', cx: 'px', oe: 'px', od: 'px', sombra: '', trav: '', giro: '' };
const TEXTO = ['me', 'md'];

/** Variáveis CSS (--sl, --hl, --dIe...) de uma pose, já com unidade. */
export function varsDaPose(nome = 'parado', extra = {}) {
  const valores = { ...PADRAO, ...(POSES[nome] || {}), ...extra };
  const css = {};

  Object.keys(valores).forEach((k) => {
    if (TEXTO.includes(k)) return;
    css[`--${k}`] = `${valores[k]}${UNIDADE[k] !== undefined ? UNIDADE[k] : 'deg'}`;
  });

  // formato das mãos -> escala de cada dedo (I, M, R, P, T) e abertura (S)
  ['e', 'd'].forEach((lado) => {
    const mao = MAOS[valores[`m${lado}`]] || MAOS.relaxada;
    Object.keys(mao).forEach((dedo) => {
      css[`--d${dedo}${lado}`] = dedo === 'S' ? `${mao[dedo]}deg` : `${mao[dedo]}`;
    });
  });

  return css;
}

/** Aplica uma pose direto num elemento (usado pelo motor de passeio). */
export function aplicarPose(el, nome, extra) {
  const css = varsDaPose(nome, extra);
  Object.keys(css).forEach((k) => el.style.setProperty(k, css[k]));
}
