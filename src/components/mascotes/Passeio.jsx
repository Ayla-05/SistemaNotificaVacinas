// src/components/mascotes/Passeio.jsx
//
// Camada flutuante em que os personagens "vivem" na tela: andam sobre os cards,
// pulam de um para outro, sentam na borda, seguram na borda (espiando por trás),
// apontam para outros cards, olham para o cursor e podem ser arrastados.
//
// Os "poleiros" são os elementos da página marcados com data-perch:
//   data-perch="stand sit hold"   (modos permitidos; vazio = todos)
//   data-perch-nome="Status vacinal"   (usado na fala quando apontam para ele)
//
// O movimento é feito direto no DOM (requestAnimationFrame), sem re-render do React.

import React, { useEffect, useRef, useState } from 'react';
import Chibi from './Chibi';
import { aplicarPose } from './poses';
import { artigoFadinha } from './catalogo';
import './mascotes.css';

const LARGURA = 112;
const ESC = LARGURA / 120;
const PES = 146 * ESC; // distância do topo do personagem até os pés
const ALTURA = 150 * ESC;
const VELOCIDADE = 62; // px/s andando
const TOPO_MIN = 150; // abaixo do cabeçalho
/** Jeitos de dormir (pose + posição na "casa"): sentado, deitado e em pé. */
const SONOS = [
  { pose: 'dormirSentado', u: 0.2 },
  { pose: 'dormirDeitado', u: 0.58 },
  { pose: 'dormirEmPe', u: 0.88 }
];
const aleatorio = (a, b) => a + Math.random() * (b - a);
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- Evitar áreas de texto ---------- */

const LIMIAR = 150; // px² de texto coberto que ainda toleramos
/** Tamanho aproximado (px) que cada pose ocupa acima dos pés. */
const DIM = {
  dormirSentado: { w: 92, h: 98 },
  dormirDeitado: { w: 150, h: 64 },
  dormirEmPe: { w: 84, h: 122 },
  dormirApoiado: { w: 96, h: 98 }
};

/** Pequenas conversas entre duas fadinhas ({a} = quem começa, {b} = quem responde). */
const CONVERSAS = [
  ['Oi, {b}!', 'Oi, {a}!'],
  ['{b}, você está em dia?', 'Estou sim, {a}! E você?'],
  ['Vamos passear?', 'Vamos, {a}!'],
  ['Olha, {b}! Que dia lindo!', 'Lindo mesmo, {a}!'],
  ['Você viu a carteirinha?', 'Vi! Está tudo em dia!']
];
const hashId = (id) => [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 0) % 7;

let cacheTexto = { t: 0, rects: [] };

/** Retângulos de todo texto visível da página (cache curto: o layout pode mudar). */
function retangulosTexto() {
  const agora = performance.now();
  if (agora - cacheTexto.t < 450) return cacheTexto.rects;
  const rects = [];
  const andador = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      const pai = n.parentElement;
      if (!pai || pai.closest('.passeio-raiz, script, style, svg, noscript, .marquee')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const faixa = document.createRange();
  let no = andador.nextNode();
  while (no) {
    faixa.selectNodeContents(no);
    const linhas = faixa.getClientRects();
    for (let i = 0; i < linhas.length; i++) {
      const r = linhas[i];
      if (r.width < 4 || r.height < 6 || r.bottom < 0 || r.top > window.innerHeight) continue;
      rects.push({ left: r.left - 3, right: r.right + 3, top: r.top - 2, bottom: r.bottom + 2 });
    }
    no = andador.nextNode();
  }
  cacheTexto = { t: agora, rects };
  return rects;
}

/** Quanto texto (px²) o personagem cobriria se ficasse nesse ponto do poleiro. */
function cobertura(perch, u, modo, dim) {
  const a = ancora(perch, u, modo);
  const w = dim ? dim.w : 84;
  const h = dim ? dim.h : 128;
  let y0 = a.y - h;
  let y1 = a.y;
  if (modo === 'hold') {
    const r = perch.getBoundingClientRect();
    y0 = r.top - 100;
    y1 = r.top;
  }
  const x0 = a.x - w / 2;
  const x1 = a.x + w / 2;
  let area = 0;
  retangulosTexto().forEach((t) => {
    const largura = Math.min(x1, t.right) - Math.max(x0, t.left);
    const altura = Math.min(y1, t.bottom) - Math.max(y0, t.top);
    if (largura > 0 && altura > 0) area += largura * altura;
  });
  return area;
}

function embaralhar(lista) {
  const c = [...lista];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** "Casa" (data-perch-casa): onde dormem; só entra na lista de passeio se pedido. */
function poleirosVisiveis(incluirCasa = false) {
  return [...document.querySelectorAll('[data-perch]')].filter((el) => {
    if (!incluirCasa && el.hasAttribute('data-perch-casa')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 170 && r.height > 60 && r.top > TOPO_MIN && r.top < window.innerHeight - 70;
  });
}

function modosDe(el) {
  const v = (el.getAttribute('data-perch') || '').trim();
  return v ? v.split(/\s+/) : ['stand', 'sit', 'hold'];
}

/** Ponto (pés) de um personagem num poleiro, conforme o modo. */
function ancora(el, u, modo) {
  const r = el.getBoundingClientRect();
  let y = r.top;
  if (modo === 'sit') y += 24 * ESC;
  if (modo === 'hold') y += 61 * ESC;
  return { x: r.left + limitar(u, 0.12, 0.88) * r.width, y, largura: r.width };
}

function brilhar(el, classe, ms) {
  el.classList.remove(classe);
  void el.offsetWidth;
  el.classList.add(classe);
  setTimeout(() => el.classList.remove(classe), ms);
}

/** Telas estreitas (celular/tablet em pé) não têm passeio: não há espaço sem cobrir o conteúdo. */
function useTelaLarga() {
  const consulta = '(min-width: 1024px)';
  const [larga, setLarga] = useState(() => window.matchMedia(consulta).matches);
  useEffect(() => {
    const m = window.matchMedia(consulta);
    const aoMudar = () => setLarga(m.matches);
    m.addEventListener('change', aoMudar);
    return () => m.removeEventListener('change', aoMudar);
  }, []);
  return larga;
}

export default function Passeio({ personagens, onAbrir }) {
  const larga = useTelaLarga();
  const nos = useRef(new Map());
  const [expr, setExpr] = useState({});
  const setExprRef = useRef(setExpr);
  setExprRef.current = setExpr;
  const dadosRef = useRef(personagens);
  const abrirRef = useRef(onAbrir);
  dadosRef.current = personagens;
  abrirRef.current = onAbrir;
  const chave = personagens.map((p) => p.id).join('|');

  useEffect(() => {
    if (!larga) return undefined;
    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const estados = new Map();
    let mouseX = null;
    let mouseY = null;
    let ultimoMouse = Date.now();
    let dormindo = false;
    let ultimo = performance.now();
    let raf = 0;

    function dadosDe(id) {
      let c = estados.get(id);
      if (!c) {
        c = { id, x: 0, y: 0, dir: 1, modo: 'novo', perch: null, u: 0.5, permitido: 'stand', proximo: performance.now() + 1500, tbolha: 0, olhar: { x: 0, y: 0 } };
        estados.set(id, c);
      }
      return c;
    }

    /* ---------- convivência entre as fadinhas ---------- */

    const nomeDe = (c) => (dadosRef.current.find((p) => p.id === c.id) || {}).nome || '';
    const outros = (c) => [...estados.values()].filter((o) => o !== c && o.perch && o.perch.isConnected && nos.current.has(o.id));
    function maisPerto(c, max) {
      let melhor = null;
      let menor = max;
      outros(c).forEach((o) => {
        const d = Math.hypot(o.x - c.x, o.y - c.y);
        if (d < menor) {
          menor = d;
          melhor = o;
        }
      });
      return melhor;
    }

    /** Dá um passinho para o lado (usado depois de um esbarrão). */
    function empurrar(x, lado) {
      const e = nos.current.get(x.id);
      if (!e || !x.perch || (x.modo !== 'stand' && x.modo !== 'andando')) return;
      const w = ancora(x.perch, x.u, 'stand').largura;
      x.alvoU = limitar(x.u + lado * (70 / w), 0.12, 0.88);
      x.modo = 'andando';
      e.classList.add('walking');
    }

    /** Esbarrão: as duas se assustam, pedem desculpa, afastam-se e dão risada. */
    function esbarrar(c, o) {
      const ec = nos.current.get(c.id);
      const eo = nos.current.get(o.id);
      if (!ec || !eo || dormindo) return;
      const lado = c.x < o.x ? -1 : 1;
      brilhar(ec, 'land', 320);
      brilhar(eo, 'land', 320);
      expressar(c, 'surpreso', 1100);
      expressar(o, 'surpreso', 1100);
      falar(ec, ['Ops!', 'Eita!', 'Desculpa!'][Math.floor(Math.random() * 3)], 1500);
      setTimeout(() => falar(eo, ['Opa!', 'Sem problema!', 'Tudo bem!'][Math.floor(Math.random() * 3)], 1500), 400);
      empurrar(c, lado);
      empurrar(o, -lado);
      setTimeout(() => {
        expressar(c, 'risada', 1300);
        expressar(o, 'risada', 1300);
      }, 1300);
    }

    /** Uma fadinha cumprimenta a outra e as duas conversam (olhando uma para a outra). */
    function socializar(c, o) {
      const ec = nos.current.get(c.id);
      const eo = nos.current.get(o.id);
      if (!ec || !eo) return;
      const [fa, fb] = CONVERSAS[Math.floor(Math.random() * CONVERSAS.length)];
      const a = nomeDe(c);
      const b = nomeDe(o);
      const texto = (t) => t.replace('{a}', a).replace('{b}', b);
      c.dir = o.x >= c.x ? 1 : -1;
      o.dir = -c.dir;
      c.parceiro = o;
      o.parceiro = c;
      c.socialAte = Date.now() + 4300;
      o.socialAte = c.socialAte;
      c.proximo = performance.now() + 5600;
      o.proximo = c.proximo;
      ec.classList.add('wave');
      posar(ec, 'acenar');
      expressar(c, 'feliz', 2200);
      falar(ec, texto(fa), 2500);
      setTimeout(() => {
        eo.classList.add('wave');
        posar(eo, 'acenar');
        expressar(o, 'sorrisao', 2000);
        falar(eo, texto(fb), 2300);
      }, 1400);
      setTimeout(() => {
        [[ec, c], [eo, o]].forEach(([e, x]) => {
          e.classList.remove('wave');
          if (x.modo === 'stand') posar(e, 'parado');
          else if (x.modo === 'sit') posar(e, 'sentado');
        });
      }, 3600);
    }

    function falar(el, texto, ms) {
      const bb = el.querySelector('.passeio-bb');
      bb.textContent = texto;
      bb.classList.add('on');
      clearTimeout(bb._t);
      if (ms) bb._t = setTimeout(() => bb.classList.remove('on'), ms);
    }

    /** Troca a expressão do rosto por um tempo e depois volta ao normal do estado. */
    function expressar(c, nome, ms = 1800) {
      setExprRef.current((a) => ({ ...a, [c.id]: nome }));
      clearTimeout(c.te);
      c.te = setTimeout(() => {
        setExprRef.current((a) => {
          const n = { ...a };
          delete n[c.id];
          return n;
        });
      }, ms);
    }

    function posar(el, nome, extra) {
      aplicarPose(el, nome, extra);
    }

    function limparPose(c, el) {
      el.classList.remove('walking', 'wave', 'cheer', 'air');
      if (c.modo === 'hold') posar(el, 'segurar');
      else if (c.modo === 'sit') posar(el, 'sentado');
      else posar(el, 'parado');
    }

    function colocar(c, el, perch, u, modo) {
      c.perch = perch;
      c.u = u;
      c.modo = modo;
      c.permitido = modo;
      const a = ancora(perch, u, modo);
      c.x = a.x;
      c.y = a.y;
      el.classList.toggle('sit', modo === 'sit');
      limparPose(c, el);
      el.querySelector('.passeio-fl').style.clipPath =
        modo === 'hold' ? `inset(-80px -80px ${65 * ESC}px -80px)` : '';
      el.style.zIndex = modo === 'hold' ? 1 : 2;
    }

    function ocupado(c, perch, u) {
      const a = ancora(perch, u, 'stand');
      return [...estados.values()].some(
        (o) => o !== c && o.perch === perch && Math.abs(ancora(perch, o.u, 'stand').x - a.x) < 130
      );
    }

    /** Posições (0..1) do poleiro onde o personagem fica livre de texto e de outros personagens. */
    function uLivres(c, perch, modo, dim) {
      const livres = [];
      for (let u = 0.12; u <= 0.881; u += 0.055) {
        if (modo !== 'hold' && !dim && ocupado(c, perch, u)) continue;
        if (cobertura(perch, u, modo, dim) <= LIMIAR) livres.push(u);
      }
      return livres;
    }

    /** Melhor ponto do poleiro (menos texto coberto), com preferência por perto de "preferido". */
    function melhorU(c, perch, modo, dim, preferido) {
      let melhor = null;
      for (let u = 0.12; u <= 0.881; u += 0.055) {
        const area = cobertura(perch, u, modo, dim);
        const custo = area + (preferido != null ? Math.abs(u - preferido) * 60 : 0) + (ocupado(c, perch, u) ? 5000 : 0);
        if (!melhor || custo < melhor.custo) melhor = { u, area, custo };
      }
      return melhor;
    }

    /** Escolhe onde dormir: a "casa" se estiver livre, senão um poleiro sem texto. */
    /** Já tem outra fadinha (ou casal) dormindo — ou reservando lugar — perto desse ponto? */
    function sonoOcupado(c, perch, u, folga = 120) {
      const x = ancora(perch, u, 'stand').x;
      return [...estados.values()].some((o) => {
        if (o === c || o === c.par) return false;
        if (!o.sonoAlvo && !o.dormindoPronto) return false;
        const alvo = o.sonoAlvo || (o.perch ? { perch: o.perch, u: o.u } : null);
        if (!alvo || alvo.perch !== perch) return false;
        return Math.abs(ancora(alvo.perch, alvo.u, 'stand').x - x) < folga;
      });
    }

    /** Duas fadinhas dormem encostadas uma na outra, com os rostos livres (cada uma inclina para a parceira). */
    function iniciarSonoPar(c, el, lista) {
      const dim = DIM.dormirApoiado;
      if (c.parLado === 'esq' && !c.sonoAlvo) {
        const casa = poleirosVisiveis(true).find((x) => x.hasAttribute('data-perch-casa'));
        let achou = null;
        for (const perch of [casa, ...embaralhar(lista)].filter(Boolean)) {
          const du = 96 / ancora(perch, 0.5, 'stand').largura;
          if (du > 0.74) continue;
          const centro = 0.5 - du / 2;
          const opcoes = [];
          for (let u1 = 0.12; u1 + du <= 0.881; u1 += 0.04) {
            if (
              cobertura(perch, u1, 'stand', dim) <= LIMIAR &&
              cobertura(perch, u1 + du, 'stand', dim) <= LIMIAR &&
              !sonoOcupado(c, perch, u1, 130) &&
              !sonoOcupado(c, perch, u1 + du, 130)
            ) {
              opcoes.push(u1);
            }
          }
          if (opcoes.length) {
            opcoes.sort((x, y) => Math.abs(x - centro) - Math.abs(y - centro));
            achou = { perch, u1: opcoes[0], du };
            break;
          }
        }
        if (!achou) {
          // sem espaço livre para as duas juntas: cada uma dorme sozinha
          const outra = c.par;
          outra.par = null;
          c.par = null;
          outra.encaixe = SONOS[1];
          c.encaixe = SONOS[0];
          return;
        }
        c.sonoAlvo = { perch: achou.perch, u: achou.u1 };
        c.par.sonoAlvo = { perch: achou.perch, u: achou.u1 + achou.du };
      }
      if (!c.sonoAlvo) return; // quem fica à direita espera a parceira escolher o lugar
      const alvo = c.sonoAlvo;
      c.dormirPose = 'dormirApoiado';
      c.dormirDir = c.parLado === 'esq' ? 1 : -1;
      c.dormindoPronto = true;
      el.classList.remove('sit', 'walking', 'wave', 'cheer');
      if (alvo.perch !== c.perch || Math.abs(alvo.u - c.u) > 0.03) {
        pular(c, el, alvo.perch, alvo.u, 'stand');
      } else {
        c.dir = c.dormirDir;
        posar(el, 'dormirApoiado');
      }
    }

    function iniciarSono(c, el, lista) {
      if (c.par && !estados.has(c.par.id)) c.par = null;
      if (c.par) {
        iniciarSonoPar(c, el, lista);
        return;
      }
      const encaixe = c.encaixe || SONOS[0];
      const dim = DIM[encaixe.pose];
      const casa = poleirosVisiveis(true).find((x) => x.hasAttribute('data-perch-casa'));
      let alvo = null;
      if (casa && cobertura(casa, encaixe.u, 'stand', dim) <= LIMIAR && !sonoOcupado(c, casa, encaixe.u, 120)) alvo = { perch: casa, u: encaixe.u };
      if (!alvo) {
        for (const perch of embaralhar(lista)) {
          const us = uLivres(c, perch, 'stand', dim).filter((u) => !sonoOcupado(c, perch, u, 120));
          if (us.length) {
            alvo = { perch, u: us[Math.floor(Math.random() * us.length)] };
            break;
          }
        }
      }
      c.dormirPose = encaixe.pose;
      c.dormindoPronto = true;
      el.classList.remove('sit', 'walking', 'wave', 'cheer');
      if (alvo && (alvo.perch !== c.perch || Math.abs(alvo.u - c.u) > 0.06)) {
        pular(c, el, alvo.perch, alvo.u, 'stand');
      } else {
        posar(el, encaixe.pose);
      }
    }

    /** Há texto embaixo do personagem (a página mudou): sai do lugar. */
    function afastar(c, el, lista) {
      if (c.modo === 'stand' && c.perch) {
        const longe = uLivres(c, c.perch, 'stand').filter((u) => Math.abs(u - c.u) > 0.1);
        if (longe.length) {
          c.alvoU = longe[Math.floor(Math.random() * longe.length)];
          c.modo = 'andando';
          el.classList.add('walking');
          return;
        }
      }
      const modo = c.modo === 'sit' || c.modo === 'hold' ? c.modo : 'stand';
      for (const perch of embaralhar(lista)) {
        if (perch === c.perch || !modosDe(perch).includes(modo)) continue;
        const us = uLivres(c, perch, modo);
        if (us.length) {
          pular(c, el, perch, us[Math.floor(Math.random() * us.length)], modo);
          return;
        }
      }
    }

    function pular(c, el, perch, u, modo) {
      const destino = ancora(perch, u, modo);
      c.hx0 = c.x;
      c.hy0 = c.y;
      c.dest = { perch, u, modo };
      const d = Math.hypot(destino.x - c.x, destino.y - c.y);
      c.t0 = performance.now();
      c.dur = limitar(430 + d * 0.9, 430, 950);
      c.altura = limitar(34 + d * 0.13, 34, 100);
      c.modo = 'pulo';
      c.conferir = performance.now() + 4500; // sossego depois de pousar
      if (Math.abs(destino.x - c.x) > 4) c.dir = destino.x > c.x ? 1 : -1;
      el.classList.remove('sit', 'walking', 'wave', 'cheer');
      el.classList.add('air');
      el.querySelector('.passeio-fl').style.clipPath = '';
      el.style.zIndex = 3;
      posar(el, 'pulo');
    }

    function pousou(c, el, p) {
      const { perch, u, modo } = c.dest;
      colocar(c, el, perch, u, modo);
      if (dormindo && c.dormirPose) {
        if (c.dormirDir) c.dir = c.dormirDir;
        posar(el, c.dormirPose);
        el.classList.remove('sit');
        el.classList.add('slp');
        return;
      }
      brilhar(el, 'land', 320);
      expressar(c, modo === 'hold' ? 'travesso' : ['feliz', 'sorrisao', 'surpreso'][Math.floor(Math.random() * 3)], 1500);
      if (modo === 'stand') brilhar(perch, 'passeio-afunda', 440);
      if (modo === 'hold') {
        perch.classList.add('passeio-balanca');
        c.segurando = perch;
        setTimeout(() => perch.classList.remove('passeio-balanca'), 3200);
        falar(el, 'Segurando firme!', 2200);
      } else if (modo === 'sit') {
        falar(el, 'Que vista boa daqui!', 2200);
      } else if (Math.random() < 0.45) {
        falar(el, falaVacina(p), 2800);
      }
      c.proximo = performance.now() + aleatorio(3200, 6500);
      const colado = outros(c).find((o) => o.perch === perch && Math.abs(o.x - c.x) < 58 && (o.modo === 'stand' || o.modo === 'sit'));
      if (colado) esbarrar(c, colado);
    }

    function falaVacina(p) {
      if (p.estado === 'tomada') return `${p.vacina} em dia!`;
      if (p.estado === 'atrasada') return `${p.vacina} está atrasada...`;
      return `Falta tomar ${p.vacina}!`;
    }

    function escolherPoleiro(c, lista, modo) {
      const opcoes = lista.filter((el) => {
        if (el === c.perch) return false;
        if (!modosDe(el).includes(modo)) return false;
        if (modo === 'hold' && el.getBoundingClientRect().height < 130) return false;
        return true;
      });
      if (!opcoes.length) return null;
      return opcoes[Math.floor(Math.random() * opcoes.length)];
    }

    function decidir(c, el, p, lista) {
      const r = Math.random();
      c.proximo = performance.now() + aleatorio(3000, 6000);

      // vê uma amiga por perto: cumprimenta e conversa
      const viz = maisPerto(c, 380);
      if (viz && Math.random() < 0.32 && (c.modo === 'stand' || c.modo === 'sit') && (viz.modo === 'stand' || viz.modo === 'sit') && Date.now() > (viz.socialAte || 0)) {
        socializar(c, viz);
        return;
      }
      // às vezes anda até a amiga (e pode acabar esbarrando nela)
      if (c.modo === 'stand' && c.perch && Math.random() < 0.18) {
        const mesmo = outros(c).find((o) => o.perch === c.perch && o.modo === 'stand');
        if (mesmo) {
          c.alvoU = limitar(mesmo.u + (c.u < mesmo.u ? -0.03 : 0.03), 0.12, 0.88);
          c.modo = 'andando';
          el.classList.add('walking');
          return;
        }
      }

      if (r < 0.22 && c.modo === 'stand' && c.perch) {
        const livres = uLivres(c, c.perch, 'stand').filter((u) => Math.abs(u - c.u) > 0.12);
        if (livres.length) {
          c.alvoU = livres[Math.floor(Math.random() * livres.length)];
          c.modo = 'andando';
          el.classList.add('walking');
          return;
        }
      }
      if (r < 0.62) {
        const modo = r < 0.4 ? 'stand' : r < 0.52 ? 'sit' : 'hold';
        for (const alvo of embaralhar(lista)) {
          if (alvo === c.perch || !modosDe(alvo).includes(modo)) continue;
          if (modo === 'hold' && alvo.getBoundingClientRect().height < 130) continue;
          const livres = uLivres(c, alvo, modo);
          if (livres.length) {
            pular(c, el, alvo, livres[Math.floor(Math.random() * livres.length)], modo);
            return;
          }
        }
      }
      if (r < 0.82 && c.modo === 'stand') {
        const alvo = lista.filter((x) => x !== c.perch)[Math.floor(Math.random() * Math.max(1, lista.length - 1))];
        if (alvo) {
          apontar(c, el, alvo);
          return;
        }
      }
      if (c.modo === 'stand' && r < 0.9) {
        const gestos = ['esticar', 'pensar', 'chao', 'agachado', 'paz', 'olhar'];
        const g = gestos[Math.floor(Math.random() * gestos.length)];
        posar(el, g);
        expressar(c, g === 'pensar' || g === 'olhar' ? 'curioso' : g === 'esticar' ? 'sonolento' : g === 'paz' ? 'travesso' : 'fofo', 2600);
        c.proximo = performance.now() + 4200;
        setTimeout(() => {
          if (c.modo === 'stand') posar(el, 'parado');
        }, g === 'chao' ? 4000 : 2600);
        if (g === 'pensar') falar(el, 'Hmm... qual será a próxima vacina?', 2600);
        if (g === 'esticar') falar(el, 'Aaah, que preguiça boa!', 2200);
        return;
      }
      if (c.modo === 'stand' || c.modo === 'sit') {
        if (p.estado === 'tomada') {
          el.classList.add('cheer');
          posar(el, 'comemorar');
          expressar(c, 'risada', 1800);
          setTimeout(() => {
            el.classList.remove('cheer', 'hap');
            if (c.modo === 'stand') posar(el, 'parado');
          }, 1800);
        } else {
          el.classList.add('wave');
          posar(el, 'acenar');
          expressar(c, p.estado === 'atrasada' ? ['preocupado', 'choro', 'zangado'][Math.floor(Math.random() * 3)] : 'feliz', 1900);
          setTimeout(() => {
            el.classList.remove('wave');
            if (c.modo === 'stand') posar(el, 'parado');
          }, 1800);
        }
        if (Math.random() < 0.5) falar(el, falaVacina(p), 2600);
      }
    }

    function apontar(c, el, alvo) {
      const r = alvo.getBoundingClientRect();
      const dx = r.left + r.width / 2 - c.x;
      const dy = r.top + r.height / 2 - (c.y - 90 * ESC);
      c.dir = dx >= 0 ? 1 : -1;
      const lx = Math.abs(dx);
      const graus = (Math.atan2(-lx, dy) * 180) / Math.PI;
      posar(el, 'apontar', { sr: graus });
      expressar(c, 'travesso', 2800);
      const nome = alvo.getAttribute('data-perch-nome');
      falar(el, nome ? `Olha só: ${nome}!` : 'Olha aqui!', 2800);
      alvo.classList.add('passeio-alvo');
      setTimeout(() => {
        alvo.classList.remove('passeio-alvo');
        if (c.modo === 'stand') posar(el, 'parado');
      }, 2800);
      c.proximo = performance.now() + 4200;
    }

    function atualizar(c, el, p, t, dt, lista) {
      el.style.display = lista.length ? '' : 'none';
      if (!lista.length) return;

      const naCasa = c.perch && c.perch.hasAttribute('data-perch-casa') && c.perch.isConnected;
      if (dormindo && naCasa) {
        // dormindo em casa: segue o cartão da barra lateral
      } else if (naCasa && !dormindo && c.modo !== 'pulo') {
        // acordou: volta a passear
        c.modo = 'novo';
      }
      if (c.modo === 'novo' || (c.perch && !naCasa && !lista.includes(c.perch) && c.modo !== 'pulo' && c.modo !== 'arrasto')) {
        const modoIni = reduzido ? 'sit' : 'stand';
        const opcoes = lista.filter((e) => modosDe(e).includes(modoIni));
        let escolha = null;
        embaralhar(opcoes.length ? opcoes : lista).forEach((perch) => {
          const m = melhorU(c, perch, modoIni, null, null);
          if (!escolha || m.custo < escolha.m.custo) escolha = { perch, m };
        });
        colocar(c, el, escolha.perch, escolha.m.u, modosDe(escolha.perch).includes(modoIni) ? modoIni : modosDe(escolha.perch)[0]);
      }

      if (c.modo === 'stand' || c.modo === 'sit' || c.modo === 'hold') {
        const a = ancora(c.perch, c.u, c.modo);
        c.x = a.x;
        c.y = a.y;
      } else if (c.modo === 'andando') {
        const a0 = ancora(c.perch, c.u, 'stand');
        const falta = (c.alvoU - c.u) * a0.largura;
        if (Math.abs(falta) < 3) {
          c.modo = 'stand';
          el.classList.remove('walking');
        } else {
          c.dir = falta > 0 ? 1 : -1;
          c.u += (c.dir * VELOCIDADE * dt) / a0.largura;
          const a = ancora(c.perch, c.u, 'stand');
          c.x = a.x;
          c.y = a.y;
          if (t > (c.bate || 0)) {
            const o = outros(c).find((x) => x.perch === c.perch && (x.modo === 'stand' || x.modo === 'andando') && Math.abs(x.x - c.x) < 54 && Math.sign(x.x - c.x) === c.dir);
            if (o) {
              c.bate = t + 4000;
              o.bate = t + 4000;
              esbarrar(c, o);
            }
          }
        }
      } else if (c.modo === 'pulo') {
        const destino = ancora(c.dest.perch, c.dest.u, c.dest.modo);
        const k = (t - c.t0) / c.dur;
        if (k >= 1) {
          c.x = destino.x;
          c.y = destino.y;
          pousou(c, el, p);
        } else {
          const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          c.x = c.hx0 + (destino.x - c.hx0) * e;
          c.y = c.hy0 + (destino.y - c.hy0) * e - 4 * c.altura * k * (1 - k);
        }
      } else if (c.modo === 'ocioso') {
        c.modo = 'stand';
      }

      const estavel = c.modo === 'stand' || c.modo === 'sit' || c.modo === 'hold';
      if (dormindo && !c.dormindoPronto && estavel) iniciarSono(c, el, lista);

      // a cada ~1,3 s confere se apareceu texto embaixo do personagem
      if (estavel && t > (c.conferir || 0)) {
        c.conferir = t + 1300 + Math.random() * 400;
        const dim = dormindo && c.dormirPose ? DIM[c.dormirPose] : null;
        const area = cobertura(c.perch, c.u, c.modo, dim);
        if (area > LIMIAR * (dormindo ? 8 : 3)) {
          if (dormindo) {
            c.reloc = (c.reloc || 0) + 1;
            if (c.reloc <= 3) {
              c.dormindoPronto = false;
              c.sonoAlvo = null;
              if (c.par) {
                c.par.dormindoPronto = false;
                c.par.sonoAlvo = null;
              }
            }
          } else afastar(c, el, lista);
        }
      }

      if (!reduzido && !dormindo && c.modo !== 'pulo' && c.modo !== 'arrasto' && c.modo !== 'andando' && t > c.proximo) {
        decidir(c, el, p, lista);
      }

      el.style.transform = `translate(${(c.x - LARGURA / 2).toFixed(1)}px, ${(c.y - PES).toFixed(1)}px)`;
      el.querySelector('.passeio-fl').style.transform = `scaleX(${c.dir})`;

      // olhar para o cursor
      let gx = 0;
      let gy = 0;
      let alvoX = mouseX;
      let alvoY = mouseY;
      if (c.socialAte > Date.now() && c.parceiro) {
        alvoX = c.parceiro.x;
        alvoY = c.parceiro.y - 85 * ESC;
      } else {
        const vizinha = maisPerto(c, 230);
        if (vizinha && !dormindo && Math.floor(t / 3500 + hashId(c.id)) % 3 === 0) {
          alvoX = vizinha.x;
          alvoY = vizinha.y - 85 * ESC;
        }
      }
      if (alvoX !== null) {
        const dx = alvoX - c.x;
        const dy = alvoY - (c.y - 85 * ESC);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 150);
        gx = (dx / d) * k;
        gy = (dy / d) * k;
      }
      c.olhar.x += (gx - c.olhar.x) * 0.2;
      c.olhar.y += (gy - c.olhar.y) * 0.2;
      const tr = `translate(${(c.olhar.x * c.dir * 1.5).toFixed(2)}px, ${(c.olhar.y * 1.2).toFixed(2)}px)`;
      el.querySelectorAll('.chibi-pupila').forEach((q) => { q.style.transform = tr; });
    }

    function quadro(t) {
      const dt = Math.min(0.05, (t - ultimo) / 1000);
      ultimo = t;
      const lista = poleirosVisiveis();
      dadosRef.current.forEach((p) => {
        const el = nos.current.get(p.id);
        if (!el) return;
        try {
          atualizar(dadosDe(p.id), el, p, t, dt, lista);
        } catch (erro) {
          // um personagem com problema não pode parar os outros
          console.error('[Passeio]', p.id, erro);
        }
      });
      raf = requestAnimationFrame(quadro);
    }

    function aoMover(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      ultimoMouse = Date.now();
      if (dormindo) {
        dormindo = false;
        nos.current.forEach((el, id) => {
          el.classList.remove('slp');
          const c = estados.get(id);
          if (c) {
            c.dormindoPronto = false;
            c.par = null;
            c.sonoAlvo = null;
            c.dormirDir = null;
            c.dormirPose = null;
            c.reloc = 0;
          }
          const modo = c ? c.modo : 'stand';
          posar(el, modo === 'sit' ? 'sentado' : modo === 'hold' ? 'segurar' : 'parado');
          if (modo === 'sit') el.classList.add('sit');
        });
      }
    }

    const sono = setInterval(() => {
      if (!reduzido && !dormindo && Date.now() - ultimoMouse > 25000) {
        dormindo = true;
        // cada um dorme de um jeito (sentado, deitado ou em pé; o encaixe gira a cada noite),
        // de preferência na "casa" (cartão da dica) e sempre longe de textos
        const desloc = Math.floor(Math.random() * SONOS.length);
        nos.current.forEach((el, id) => {
          el.classList.add('slp');
          el.querySelector('.passeio-bb').classList.remove('on');
          const c = estados.get(id);
          if (!c) return;
          const indice = Math.max(0, dadosRef.current.findIndex((x) => x.id === id));
          c.encaixe = SONOS[(indice + desloc) % SONOS.length];
          c.dormindoPronto = false;
          c.par = null;
          c.sonoAlvo = null;
          c.dormirDir = null;
          c.reloc = 0;
        });
        // as fadinhas dormem de duas em duas, encostadas uma na outra (a sobrante dorme sozinha)
        const ids = dadosRef.current.map((p) => p.id).filter((id) => estados.has(id));
        for (let i = 0; i + 1 < ids.length; i += 2) {
          const a = estados.get(ids[i]);
          const b = estados.get(ids[i + 1]);
          a.par = b;
          b.par = a;
          a.parLado = 'esq';
          b.parLado = 'dir';
        }
      }
    }, 2000);

    /* ---- clique e arrasto ---- */
    function aoPressionar(e) {
      const el = e.target.closest('.passeio-ch');
      if (!el) return;
      const id = el.getAttribute('data-id');
      const c = estados.get(id);
      const p = dadosRef.current.find((x) => x.id === id);
      if (!c || !p || c.modo === 'pulo') return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const antes = c.modo;
      const sx = e.clientX;
      const sy = e.clientY;
      let moveu = 0;
      el.classList.add('lift');

      const mover = (ev) => {
        moveu = Math.max(moveu, Math.hypot(ev.clientX - sx, ev.clientY - sy));
        if (moveu > 6) {
          if (c.modo !== 'arrasto') expressar(c, 'assustado', 60000);
          c.modo = 'arrasto';
          el.classList.remove('sit', 'walking', 'wave', 'cheer');
          el.querySelector('.passeio-fl').style.clipPath = '';
          el.style.zIndex = 5;
          c.x = ev.clientX;
          c.y = ev.clientY + 70;
          falar(el, 'Uiii!', 0);
        }
      };
      const soltar = () => {
        el.removeEventListener('pointermove', mover);
        el.removeEventListener('pointerup', soltar);
        el.classList.remove('lift');
        if (moveu <= 6) {
          c.modo = antes;
          expressar(c, 'risada', 1500);
          falar(el, `Vamos ver a ${p.vacina}?`, 2000);
          if (abrirRef.current) abrirRef.current(p);
          return;
        }
        el.querySelector('.passeio-bb').classList.remove('on');
        expressar(c, 'surpreso', 1200);
        const lista = poleirosVisiveis().filter((x) => modosDe(x).includes('stand'));
        let melhor = null;
        let dist = Infinity;
        lista.forEach((x) => {
          const r = x.getBoundingClientRect();
          const px = limitar(c.x, r.left + r.width * 0.15, r.right - r.width * 0.15);
          const d = Math.hypot(c.x - px, c.y - r.top) + (r.top < c.y - 16 ? 140 : 0);
          if (d < dist) { dist = d; melhor = { x, u: (px - r.left) / r.width }; }
        });
        if (melhor) {
          const m = melhorU(c, melhor.x, 'stand', null, melhor.u);
          pular(c, el, melhor.x, m.u, 'stand');
        }
        else c.modo = 'novo';
      };
      el.addEventListener('pointermove', mover);
      el.addEventListener('pointerup', soltar);
    }

    function aoPassar(e) {
      const el = e.target.closest && e.target.closest('.passeio-ch');
      if (!el || (e.relatedTarget && el.contains(e.relatedTarget))) return;
      const c = estados.get(el.getAttribute('data-id'));
      const p = dadosRef.current.find((x) => x.id === el.getAttribute('data-id'));
      if (!c || !p || c.modo === 'pulo' || c.modo === 'arrasto') return;
      el.classList.add('wave');
      posar(el, 'acenar');
      expressar(c, 'curioso', 2600);
      falar(el, `Oi! Sou ${p.nome}, ${artigoFadinha(p.genero)} da vacina ${p.vacina}. Clique em mim!`, 3400);
      setTimeout(() => {
        el.classList.remove('wave');
        if (c.modo === 'stand') posar(el, 'parado');
      }, 1600);
    }

    window.addEventListener('pointermove', aoMover);
    document.addEventListener('pointerdown', aoPressionar);
    document.addEventListener('mouseover', aoPassar);
    raf = requestAnimationFrame(quadro);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(sono);
      window.removeEventListener('pointermove', aoMover);
      document.removeEventListener('pointerdown', aoPressionar);
      document.removeEventListener('mouseover', aoPassar);
    };
  }, [chave, larga]);

  if (!larga) return null;

  return (
    <div className="passeio-raiz" aria-hidden="true">
      {personagens.map((p) => (
        <div
          key={p.id}
          data-id={p.id}
          className="passeio-ch"
          ref={(el) => {
            if (el) nos.current.set(p.id, el);
            else nos.current.delete(p.id);
          }}
        >
          <div className="passeio-bb" />
          <div className="passeio-fl">
            <Chibi tema={p.tema} genero={p.genero} roupa={p.roupa} cabelo={p.cabelo} asas={p.asas} estado={p.estado} expressao={expr[p.id]} largura={LARGURA} seringa={p.estado !== 'tomada'} />
          </div>
        </div>
      ))}
    </div>
  );
}
