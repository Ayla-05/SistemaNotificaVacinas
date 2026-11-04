// src/components/mascotes/Chibi.jsx
//
// Personagem "chibi" de uma vacina, desenhado em SVG com um esqueleto articulado:
// tronco (gira no quadril), cabeça (gira no pescoço), braços (ombro + cotovelo)
// e pernas (quadril + joelho). A pose vem de variáveis CSS (ver poses.js), então
// o corpo todo muda de forma, e não só os braços.
//
// Dois estilos: menina ('f': franja em gomos, laço e vestidinho) e menino ('m': cabelo
// liso em capacete com as pontas viradas para fora, florzinhas e estrelinha no cabelo,
// olhos redondos grandes e roupa de marinheiro).
//
// Classes no elemento pai: .hap = olhos sorrindo, .slp = dormindo.

import React, { useId } from 'react';
import { varsDaPose } from './poses';
import { personagemDaVacina } from './catalogo';
import { Asas, resolverCabelo, ROUPAS_NOVAS, MENINOS_NOVOS, TORSOS_M_NOVOS } from './estilos';
import './mascotes.css';

export { PALETAS as TEMAS } from './catalogo';

/** Tema (cores) da fadinha de uma vacina, a partir do nome dela. */
export function temaPorNome(nome = '') {
  return personagemDaVacina(nome).tema;
}

const PELE = '#fbd5c0';

/** Clareia uma cor hex misturando com branco (f de 0 a 1). */
export function clarear(hex, f = 0.5) {
  const n = parseInt(hex.replace('#', ''), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v + (255 - v) * f));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/** Miosótis (florzinha de 5 pétalas) usada no vestido de pétalas. */
function Miosotis({ x, y, r }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle
          key={a}
          cx={r * 0.58}
          cy="0"
          r={r * 0.5}
          transform={`rotate(${a})`}
          fill="#a9bbf3"
          stroke="#fff"
          strokeWidth=".5"
        />
      ))}
      <circle r={r * 0.3} fill="#ffd84d" />
    </g>
  );
}

/**
 * Vestido de pétalas: corpete em coração de pétalas azul-lavanda, florzinhas na
 * cintura e saia farta de pétalas brancas em camadas (coordenadas do tronco).
 */
function VestidoPetalas({ id }) {
  const branco = `url(#${id}pw)`;
  const azul = `url(#${id}pb)`;
  const costas = [22, 32, 42, 52, 60, 68, 78, 88, 98];
  const meio = [28, 39, 50, 60, 70, 81, 92];
  const frente = [36, 47, 58, 69, 80, 90];
  return (
    <>
      {/* saia: camadas de pétalas, de trás para a frente */}
      {costas.map((x, i) => (
        <ellipse key={`c${x}`} cx={x} cy="125" rx="12.500" ry="9" transform={`rotate(${(i % 2 ? 5 : -5) + (x - 60) / 5} ${x} 125)`} fill={branco} stroke="#dbe4f1" strokeWidth=".8" />
      ))}
      {meio.map((x, i) => (
        <ellipse key={`m${x}`} cx={x} cy="120" rx="12" ry="8.500" transform={`rotate(${(i % 2 ? 6 : -6) + (x - 60) / 6} ${x} 120)`} fill={branco} stroke="#dbe4f1" strokeWidth=".8" />
      ))}
      {frente.map((x, i) => (
        <ellipse key={`f${x}`} cx={x} cy="115" rx="11" ry="7.500" transform={`rotate(${(i % 2 ? 7 : -7) + (x - 60) / 7} ${x} 115)`} fill="#f4f6fd" stroke="#d6def0" strokeWidth=".8" />
      ))}
      {/* pétalas azuis caídas sobre a saia */}
      <ellipse cx="50" cy="114" rx="8.500" ry="4.800" transform="rotate(-28 50 114)" fill={azul} stroke="#fff" strokeWidth=".6" />
      <ellipse cx="62" cy="116.500" rx="9.500" ry="5.200" transform="rotate(8 62 116.500)" fill={azul} stroke="#fff" strokeWidth=".6" />
      <ellipse cx="73.500" cy="114" rx="8.500" ry="4.800" transform="rotate(28 73.500 114)" fill={azul} stroke="#fff" strokeWidth=".6" />

      {/* peito e corpete em coração */}
      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M42 101 C42 92.500 52 90.500 59 98 L59 112 C50 112 43 108.500 42 101 Z" fill={azul} stroke="#fff" strokeWidth=".6" />
      <path d="M78 101 C78 92.500 68 90.500 61 98 L61 112 C70 112 77 108.500 78 101 Z" fill={azul} stroke="#fff" strokeWidth=".6" />
      <path d="M48 98 Q52 104 51 110 M72 98 Q68 104 69 110" stroke="#fff" strokeOpacity=".45" strokeWidth=".8" fill="none" strokeLinecap="round" />

      {/* florzinhas na cintura e no meio do corpete */}
      <Miosotis x={45.500} y={111} r={3.400} />
      <Miosotis x={53} y={112.500} r={4} />
      <Miosotis x={60} y={112} r={3.200} />
      <Miosotis x={67} y={112.500} r={4} />
      <Miosotis x={74.500} y={111} r={3.400} />
      <Miosotis x={60} y={104} r={2.500} />
      <Miosotis x={60} y={98.500} r={2.200} />
    </>
  );
}

/* ============ Mais roupas (coordenadas do tronco; cintura em y≈110, saia até y≈136) ============ */

const ouro = '#f1c75a';

/** Estrelinha/lua dourada que pende da barra do vestido noturno. */
function Breloque({ x, y, lua }) {
  return lua ? (
    <path transform={`translate(${x} ${y})`} d="M0 0 a2.800 2.800 0 1 0 2.600 3.400 a2.200 2.200 0 1 1 -2.600 -3.400 Z" fill={ouro} stroke="#d9a93a" strokeWidth=".3" />
  ) : (
    <path
      transform={`translate(${x} ${y + 1.600})`}
      d="M0 -2.600 L0.800 -0.800 L2.700 -0.700 L1.200 0.500 L1.700 2.400 L0 1.300 L-1.700 2.400 L-1.200 0.500 L-2.700 -0.700 L-0.800 -0.800 Z"
      fill={ouro}
      stroke="#d9a93a"
      strokeWidth=".3"
    />
  );
}

/** Vestido noturno: corpete azul-marinho com alças no pescoço, saia em degradê até azul claro e breloques dourados. */
function VestidoNoturno({ id }) {
  return (
    <>
      <path d="M26 122 Q36 112 60 112 Q84 112 94 122 Q99 134 89 137 Q79 132 70 138 Q60 132 50 138 Q41 132 31 137 Q21 134 26 122 Z" fill={`url(#${id}nb)`} />
      <path d="M36 108 Q60 104 84 108 L97 128 Q78 136 60 134 Q42 136 23 128 Z" fill={`url(#${id}ng)`} />
      <path d="M38 111 Q50 123 60 117 Q72 125 85 112" stroke={ouro} strokeWidth="1" strokeDasharray="1.200 1.600" fill="none" strokeLinecap="round" />
      {[30, 41, 52, 64, 76, 88].map((x, i) => (
        <Breloque key={x} x={x} y={i % 2 ? 136 : 135.500} lua={i % 2 === 0} />
      ))}
      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M46 98 L53 88.500 M74 98 L67 88.500" stroke="#1f2f7a" strokeWidth="2.400" strokeLinecap="round" />
      <path d="M41 100 Q50 92 60 97 Q70 92 79 100 L77 112 Q60 115 43 112 Z" fill="#1f2f7a" />
      <path d="M41 100 Q50 92 60 97 Q70 92 79 100" stroke={ouro} strokeWidth="1.100" fill="none" strokeLinecap="round" />
      <rect x="40" y="110" width="40" height="4" rx="1.600" fill="#17245f" />
      <path d="M40.500 111.200 L79.500 111.200 M40.500 113 L79.500 113" stroke={ouro} strokeWidth=".6" />
    </>
  );
}

/** Pequena flor branca de 5 pétalas. */
function FlorBranca({ x, y, r = 2.4 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={r * 0.6} cy="0" r={r * 0.52} transform={`rotate(${a})`} fill="#fff" stroke="#e6ead9" strokeWidth=".4" />
      ))}
      <circle r={r * 0.3} fill="#f3d77a" />
    </g>
  );
}

/** Laço de fita. */
function Laco({ x, y, s = 1, cor = '#a9cf98', borda = '#e6f2de' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 L-3 6 L-1 5.500 Z M0 0 L3 6 L1 5.500 Z" fill={cor} stroke={borda} strokeWidth=".4" />
      <ellipse cx="-5.800" cy="-0.800" rx="6" ry="3.800" transform="rotate(-18 -5.800 -0.800)" fill={cor} stroke={borda} strokeWidth=".6" />
      <ellipse cx="5.800" cy="-0.800" rx="6" ry="3.800" transform="rotate(18 5.800 -0.800)" fill={cor} stroke={borda} strokeWidth=".6" />
      <circle r="2" fill={cor} stroke={borda} strokeWidth=".6" />
    </g>
  );
}

/** Vestido jardim: saia de organza verde-sálvia em camadas com florzinhas, corpete creme com cordões e laço, renda e pérolas. */
function VestidoJardim({ id }) {
  return (
    <>
      {[22, 32, 42, 52, 62, 72, 82, 92, 100].map((x, i) => (
        <ellipse key={`a${x}`} cx={x} cy={125 + (i % 2)} rx="12" ry="9" fill="#cfe6c1" fillOpacity=".9" stroke="#eef6e6" strokeWidth=".8" />
      ))}
      {[28, 40, 52, 64, 76, 88, 96].map((x, i) => (
        <ellipse key={`b${x}`} cx={x} cy={120.500 + (i % 2)} rx="12" ry="8.500" fill="#dff0d4" fillOpacity=".92" stroke="#f1f8ea" strokeWidth=".8" />
      ))}
      {[36, 47, 58, 69, 80, 90].map((x, i) => (
        <ellipse key={`c${x}`} cx={x} cy={115.500 + (i % 2)} rx="11" ry="7.500" fill="#f6f8ec" stroke="#e1ecd5" strokeWidth=".8" />
      ))}
      <ellipse cx="47" cy="119" rx="12" ry="5.500" transform="rotate(-22 47 119)" fill="#b7d7a6" fillOpacity=".85" stroke="#e6f2de" strokeWidth=".6" />
      <ellipse cx="73" cy="119" rx="12" ry="5.500" transform="rotate(22 73 119)" fill="#b7d7a6" fillOpacity=".85" stroke="#e6f2de" strokeWidth=".6" />
      {[[40, 124], [53, 126.500], [66, 123.500], [80, 126], [60, 119.500], [30, 121], [92, 121]].map(([x, y]) => (
        <FlorBranca key={`${x}-${y}`} x={x} y={y} r={2.800} />
      ))}
      <Laco x={45.500} y={112} s={0.62} />
      <Laco x={74.500} y={112} s={0.62} />

      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M42 100 Q51 94 60 99 Q69 94 78 100 L76 113 Q60 116 44 113 Z" fill="#f6f3e3" stroke="#e1dcc2" strokeWidth=".6" />
      <path d="M52 100.500 L56 111 M56 100.500 L52 111 M64 100.500 L68 111 M68 100.500 L64 111" stroke="#c9b98a" strokeWidth=".8" strokeLinecap="round" />
      <ellipse cx="42" cy="96" rx="7.500" ry="3.200" fill="#fff" stroke="#e3e0d2" strokeWidth=".6" />
      <ellipse cx="78" cy="96" rx="7.500" ry="3.200" fill="#fff" stroke="#e3e0d2" strokeWidth=".6" />
      <ellipse cx="42" cy="93.800" rx="6" ry="2.600" fill="#f4f8ee" stroke="#e3e0d2" strokeWidth=".5" />
      <ellipse cx="78" cy="93.800" rx="6" ry="2.600" fill="#f4f8ee" stroke="#e3e0d2" strokeWidth=".5" />
      {[47, 51, 55, 60, 65, 69, 73].map((x, i) => (
        <circle key={x} cx={x} cy={96 + 4 * Math.sin((i / 6) * Math.PI)} r="1.200" fill="#fff" stroke="#e4e4e4" strokeWidth=".3" />
      ))}
      <Laco x={60} y={102.500} s={0.95} />
    </>
  );
}

/** Conjunto blazer: colete branco com lapela e gola, camisinha azul com babado, saia branca assimétrica sobre tule. */
function VestidoBlazer({ id }) {
  return (
    <>
      <path d="M26 123 Q60 134 94 123 Q100 134 90 138 Q60 144 30 138 Q20 134 26 123 Z" fill="#fbfdff" stroke="#e1e9f4" strokeWidth=".8" />
      <path d="M40 110 L26 129 Q60 137 94 129 L80 110 Z" fill="#cfe0f5" />
      <path d="M42 108 L82 108 Q92 120 99 138 Q75 134 62 124 Q48 131 29 123 Z" fill="#fff" stroke="#e1e9f4" strokeWidth=".8" />
      <path d="M62 124 Q76 126 90 134" stroke="#e1e9f4" strokeWidth=".8" fill="none" />

      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M44 98 Q52 94 60 99 Q68 94 76 98 L74 112 L46 112 Z" fill="#bcd3f0" />
      {[48, 52.500, 57, 63, 67.500, 72].map((x, i) => (
        <circle key={x} cx={x} cy={96.500 + (i === 2 || i === 3 ? 2.500 : 0)} r="1.600" fill="#fff" />
      ))}
      {[103, 106.800, 110.600].map((y) => (
        <circle key={y} cx="60" cy={y} r="1" fill="#fff" />
      ))}

      <path d="M42 97 L54 99.500 L58.500 108 L56.500 117 L42 117 Z" fill="#fff" stroke="#dce4f0" strokeWidth=".7" />
      <path d="M78 97 L66 99.500 L61.500 108 L63.500 117 L78 117 Z" fill="#fff" stroke="#dce4f0" strokeWidth=".7" />
      <path d="M43.500 94 L54 98.500 L49.500 108.500 Z" fill="#fff" stroke="#d2dbe9" strokeWidth=".7" strokeLinejoin="round" />
      <path d="M76.500 94 L66 98.500 L70.500 108.500 Z" fill="#fff" stroke="#d2dbe9" strokeWidth=".7" strokeLinejoin="round" />
      <rect x="51" y="88.500" width="18" height="4.200" rx="2" fill="#fff" stroke="#d2dbe9" strokeWidth=".6" />
      <circle cx="60" cy="90.600" r="1" fill="#cfd8e6" />
      <circle cx="60.500" cy="115" r="1.400" fill="#cfd8e6" stroke="#aeb9cc" strokeWidth=".4" />
    </>
  );
}

/** Vestido de organza rosa: ombros de fora com babado, corpete de espartilho e saia de babados em camadas (frente mais curta). */
function VestidoOrganza({ id }) {
  const babado = { stroke: '#f2a6b8', strokeWidth: '.7' };
  return (
    <>
      <ellipse cx="25" cy="128" rx="9" ry="13" transform="rotate(-16 25 128)" fill="#fbd5de" fillOpacity=".8" {...babado} />
      <ellipse cx="95" cy="128" rx="9" ry="13" transform="rotate(16 95 128)" fill="#fbd5de" fillOpacity=".8" {...babado} />
      {[22, 32, 42, 52, 62, 72, 82, 92, 100].map((x, i) => (
        <ellipse key={`a${x}`} cx={x} cy={125 + (i % 2)} rx="12" ry="9" fill={`url(#${id}og)`} fillOpacity=".9" {...babado} />
      ))}
      {[28, 40, 52, 64, 76, 88, 96].map((x, i) => (
        <ellipse key={`b${x}`} cx={x} cy={120.500 + (i % 2)} rx="12" ry="8.500" fill="#fde4ea" fillOpacity=".92" {...babado} />
      ))}
      {[36, 47, 58, 69, 80, 90].map((x, i) => (
        <ellipse key={`c${x}`} cx={x} cy={115.500 + (i % 2)} rx="11" ry="7.500" fill="#ffeef2" {...babado} />
      ))}

      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M43 100 Q52 96 60 99 Q68 96 77 100 L75 112.500 Q60 116 45 112.500 Z" fill="#fdeaea" stroke="#f0c4cf" strokeWidth=".6" />
      <path d="M50 100.500 L50.500 112.500 M55 100 L55 114 M60 100 L60 114.500 M65 100 L65 114 M70 100.500 L69.500 112.500" stroke="#f0c4cf" strokeWidth=".6" />
      {[40, 46, 52, 58, 64, 70, 76, 82].map((x, i) => (
        <ellipse key={x} cx={x} cy={96.500 + (i % 2) * 0.8} rx="6" ry="3.800" fill="#fbc7d4" stroke="#f08ea8" strokeWidth=".6" />
      ))}
      <ellipse cx="37" cy="97" rx="6.500" ry="5" fill="#fcd0db" stroke="#f08ea8" strokeWidth=".6" />
      <ellipse cx="83" cy="97" rx="6.500" ry="5" fill="#fcd0db" stroke="#f08ea8" strokeWidth=".6" />
    </>
  );
}

const ROUPAS = {
  petalas: VestidoPetalas,
  noturno: VestidoNoturno,
  jardim: VestidoJardim,
  blazer: VestidoBlazer,
  organza: VestidoOrganza,
  ...ROUPAS_NOVAS
};

/** Manga de organza (bufante, translúcida) que acompanha o antebraço de cada vestido. */
function Manga({ tipo }) {
  if (tipo === 'mago') {
    return <ellipse cx="0" cy="6" rx="9.500" ry="10.500" fill="#3a2f7a" stroke="#f1c75a" strokeWidth=".5" />;
  }
  if (tipo === 'inverno') {
    return <ellipse cx="0" cy="5.500" rx="8.500" ry="9.500" fill="#f4f8ff" stroke="#d4deee" strokeWidth=".6" />;
  }
  if (tipo === 'fada') {
    return (
      <>
        <ellipse cx="0" cy="5.500" rx="9" ry="10.500" fill="#cfe9ee" fillOpacity=".55" stroke="#fff" strokeWidth=".6" />
        {[-4, 0, 4].map((x) => (
          <circle key={x} cx={x} cy="11.200" r="1.200" fill="#fff" stroke="#e1e8ee" strokeWidth=".3" />
        ))}
      </>
    );
  }
  if (tipo === 'noturno') {
    return (
      <>
        <ellipse cx="0" cy="5.500" rx="9.500" ry="10.500" fill="#3159c6" fillOpacity=".5" stroke="#a9c1f3" strokeWidth=".6" />
        <rect x="-4.800" y="10" width="9.600" height="2.200" rx="1" fill={ouro} />
      </>
    );
  }
  if (tipo === 'organza') {
    return (
      <>
        <ellipse cx="0" cy="5.500" rx="9.500" ry="10.500" fill="#ffd0dc" fillOpacity=".62" stroke="#f2a6b8" strokeWidth=".6" />
        {[-4, 0, 4].map((x) => (
          <circle key={x} cx={x} cy="11.500" r="2.400" fill="#fbc7d4" stroke="#f08ea8" strokeWidth=".4" />
        ))}
      </>
    );
  }
  if (tipo === 'jardim') {
    return (
      <>
        <path d="M-6 8 Q-11 22 -5 33 Q1 25 6 8 Z" fill="#cfe6c1" fillOpacity=".55" stroke="#eaf5e2" strokeWidth=".5" />
        <ellipse cx="0" cy="5.500" rx="9" ry="10" fill="#cfe6c1" fillOpacity=".62" stroke="#eef7e6" strokeWidth=".7" />
      </>
    );
  }
  return null;
}

/** Mão fofinha de 5 dedos (polegar + 4). O formato vem das variáveis --dIe/--dMe... (ver poses.js MAOS). */
function Mao({ lado, id }) {
  const interno = lado === 'e' ? 1 : -1; // lado do polegar (voltado para o corpo)
  const dedos = [
    { k: 'I', x: 3.300 * interno, i: -1.500 * interno, c: 4.800 },
    { k: 'M', x: 1.100 * interno, i: -0.500 * interno, c: 5.400 },
    { k: 'R', x: -1.100 * interno, i: 0.500 * interno, c: 4.800 },
    { k: 'P', x: -3.300 * interno, i: 1.500 * interno, c: 3.800 }
  ];
  return (
    <g transform="scale(1.220)">
      {dedos.map((d) => (
        <g
          key={d.k}
          className="rg-dedo"
          style={{ '--x': `${d.x}px`, '--i': d.i, '--abre': `var(--dS${lado})`, '--esc': `var(--d${d.k}${lado})` }}
        >
          <rect x="-1.250" y="-0.800" width="2.500" height={d.c} rx="1.250" fill={`url(#${id}k)`} stroke="#efbba4" strokeWidth=".3" />
          <ellipse cx="0" cy={d.c - 1.200} rx=".95" ry=".8" fill="#f6c3b2" opacity=".85" />
        </g>
      ))}
      <g
        className="rg-polegar"
        style={{ '--x': `${3.700 * interno}px`, '--lado': interno, '--abre': `var(--dS${lado})`, '--esc': `var(--dT${lado})` }}
      >
        <rect x="-1.500" y="-0.800" width="3" height="4.300" rx="1.500" fill={`url(#${id}k)`} stroke="#efbba4" strokeWidth=".3" />
        <ellipse cx="0" cy="2.400" rx="1.050" ry=".85" fill="#f6c3b2" opacity=".85" />
      </g>
      <ellipse cx="0" cy="3.100" rx="4.500" ry="4.300" fill={`url(#${id}k)`} stroke="#efbba4" strokeWidth=".3" />
      <ellipse cx="0" cy="4.200" rx="2" ry="1.500" fill="#f9b9a8" opacity=".3" />
    </g>
  );
}

/* ============ Estilos masculinos: príncipe de veludo, terno do oceano e príncipe-fada ============ */

/** Cada estilo traz cabelo, cores (sobrepõem a paleta), calça larga e acessórios. */
export const MENINOS = {
  principe: { manga: '#173d36', punho: '#9fb0aa', calca: '#14332f', bota: '#1c1c22', larga: true },
  oceano: { manga: '#24427f', punho: '#ffffff', calca: '#2b4c92', bota: '#f4f7fb', larga: true },
  fada: { manga: null, punho: '#ffffff', calca: '#a9cdd8', bota: '#eef6f7', larga: true },
  ...MENINOS_NOVOS
};

/** Príncipe: casaco de veludo verde com bordado prateado, broche com corrente, cinto de folhas e capa de tule. */
function VestePrincipe() {
  const prata = '#cfd8d4';
  return (
    <>
      <path d="M78 96 Q104 106 109 136 Q110 148 92 147 Q82 138 80 118 Z" fill="#1d3f3a" fillOpacity=".72" stroke="#8fa39d" strokeWidth=".6" />
      <path d="M82 104 Q100 118 100 142" stroke="#9fb4ae" strokeOpacity=".5" strokeWidth=".6" fill="none" />
      <path d="M80 100 Q94 112 96 134" stroke="#9fb4ae" strokeOpacity=".6" strokeWidth=".6" fill="none" />
      {[[94, 118], [98, 128], [90, 136], [96, 137], [92, 124]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r=".7" fill="#e8f0ed" />
      ))}
      <path d="M38 96 Q60 88 82 96 L85 124 Q60 130 35 124 Z" fill="#173d36" stroke="#0f2b26" strokeWidth=".6" />
      <path d="M50 90.500 Q60 87.500 70 90.500 L69 96 Q60 93.500 51 96 Z" fill="#1f4b42" stroke={prata} strokeWidth=".5" />
      <path d="M53 98 Q57 104 55 112 M55 104 L59 102 M55 108 L51 106 M56 100 L52 99 M60 98 Q64 104 62 114 M62 103 L66 101 M62 108 L66 107" stroke={prata} strokeWidth=".6" strokeLinecap="round" fill="none" />
      {[[53, 103], [58, 106], [63, 109], [50, 110], [66, 104]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r=".75" fill={prata} />
      ))}
      <circle cx="74" cy="99" r="2.200" fill={prata} stroke="#7d8f8a" strokeWidth=".4" />
      <path d="M74 101 Q78 112 76 121" stroke={prata} strokeWidth=".5" fill="none" />
      <rect x="36" y="117" width="48" height="4.500" rx="1.500" fill="#b9c2bd" />
      <path d="M38 119.200 L82 119.200" stroke="#7d8f8a" strokeWidth=".4" strokeDasharray="1.600 1.400" />
    </>
  );
}

/** Terno do oceano: paletó azul aberto sobre camisa branca, organza translúcida com coral bordado e concha no ombro. */
function VesteOceano() {
  return (
    <>
      <path d="M82 98 Q100 112 98 140 Q90 136 86 126 Q84 112 80 104 Z" fill="#e6f0fb" fillOpacity=".65" stroke="#fff" strokeWidth=".6" />
      <path d="M90 120 L90 130 M90 124 L94 120 M90 128 L86 124 M93 132 L96 128" stroke="#fff" strokeWidth=".7" strokeLinecap="round" />
      <path d="M38 96 Q60 88 82 96 L85 124 Q60 130 35 124 Z" fill="#fff" />
      <path d="M48 91 L60 112 L72 91 L67 89.500 L60 98 L53 89.500 Z" fill="#fff" stroke="#d9e3f0" strokeWidth=".6" />
      <path d="M38 96 L50 93 L58 114 L57 125 L35 124 Z" fill="#24427f" />
      <path d="M82 96 L70 93 L62 114 L63 125 L85 124 Z" fill="#24427f" />
      <path d="M45 94 L53 92 L58 108 Z M75 94 L67 92 L62 108 Z" fill="#2f549f" stroke="#8fa8d8" strokeWidth=".5" strokeLinejoin="round" />
      <ellipse cx="46" cy="99" rx="2.600" ry="2.200" fill="#fff" stroke="#d9e3f0" strokeWidth=".4" />
      <path d="M44 103 L44 109 M44 105 L41 102 M44 107 L47 104 M42 110 L39 107" stroke="#fff" strokeWidth=".7" strokeLinecap="round" />
      <rect x="35" y="119" width="50" height="6" rx="1.500" fill="#2b4c92" />
      <path d="M35 121 L85 121" stroke="#6f8cc6" strokeWidth=".4" />
    </>
  );
}

/** Príncipe-fada: túnica furta-cor com gola alta, folhinhas bordadas e pérolas. */
function VesteFada({ id }) {
  return (
    <>
      <path d="M38 96 Q60 88 82 96 L85 126 Q60 133 35 126 Z" fill={`url(#${id}fg)`} stroke="#cfe3ea" strokeWidth=".6" />
      <path d="M44 94 L76 104 L70 126 L42 121 Z" fill="#dff1ea" fillOpacity=".55" stroke="#fff" strokeWidth=".5" />
      <path d="M51 90.500 Q60 88 69 90.500 L68 96 Q60 94 52 96 Z" fill="#c8e6dc" stroke="#9cc9b8" strokeWidth=".5" />
      {[[48, 98, -30], [53, 103, -20], [58, 108, -12], [63, 113, -8], [68, 118, -4], [51, 110, 30], [57, 116, 24]].map(([x, y, a]) => (
        <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="3" ry="1.500" transform={`rotate(${a} ${x} ${y})`} fill="#8fc79a" stroke="#6fae80" strokeWidth=".3" />
      ))}
      {[[46, 102], [52, 108], [58, 113], [64, 118], [70, 122]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.100" fill="#fff" stroke="#e1e8ee" strokeWidth=".3" />
      ))}
      <rect x="35" y="119" width="50" height="5" rx="1.500" fill="#b9d8e0" />
    </>
  );
}

const TORSOS_M = { principe: VestePrincipe, oceano: VesteOceano, fada: VesteFada, ...TORSOS_M_NOVOS };

/** Cabelo de trás de cada estilo masculino. */
function CabeloTras({ tipo, id }) {
  const f = `url(#${id}h)`;
  if (tipo === 'lateral') {
    return <path d="M19 74 C14 46 28 20 60 19 C92 20 106 46 101 74 C97 68 93 62 91 54 L29 54 C27 62 23 68 19 74 Z" fill={f} />;
  }
  if (tipo === 'repicado') {
    return (
      <path
        d="M14 82 C10 46 28 16 60 15 C92 16 110 46 106 82 L101 70 L97 86 L91 70 L86 82 L82 64 L38 64 L34 82 L29 70 L23 86 L19 70 Z"
        fill={f}
      />
    );
  }
  return <path d="M16 74 C14 44 30 18 60 17 C90 18 106 44 104 74 L99 62 L95 78 L89 60 L31 60 L25 78 L21 62 Z" fill={f} />;
}

/** Franja (e orelhas) de cada estilo masculino: lateral lisa, bagunçada ou repicada com pérolas. */
function FranjaMasc({ tipo, id }) {
  const f = `url(#${id}h)`;
  const brilho = <path d="M34 36 C46 26 68 25 84 34" stroke="#fff" strokeOpacity=".3" strokeWidth="2.600" fill="none" strokeLinecap="round" />;
  const orelhas = (
    <>
      <circle cx="26" cy="73" r="6" fill={`url(#${id}k)`} />
      <circle cx="94" cy="73" r="6" fill={`url(#${id}k)`} />
    </>
  );
  if (tipo === 'lateral') {
    return (
      <>
        <path d="M27 66 C24 40 38 26 62 25 C86 26 97 42 93 66 C91 56 88 50 82 47 C74 51 54 57 37 50 C32 53 29 58 27 66 Z" fill={f} />
        {brilho}
        {orelhas}
      </>
    );
  }
  if (tipo === 'repicado') {
    return (
      <>
        <path d="M25 66 C21 36 42 22 62 23 C84 23 99 38 95 66 L90 52 L86 62 L79 49 L73 60 L65 47 L58 60 L50 48 L44 59 L37 50 L32 62 Z" fill={f} />
        {brilho}
        {orelhas}
        {[[34, 40], [88, 38]].map(([x, y]) => (
          <g key={x} transform={`translate(${x} ${y})`}>
            <path d="M-4 3 Q0 -2 4 3 M0 -1 L0 -5" stroke="#cfa94a" strokeWidth=".7" fill="none" strokeLinecap="round" />
            <circle cx="0" cy="0" r="2.300" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
            <circle cx="-3.800" cy="3.200" r="1.600" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
            <circle cx="3.800" cy="3.200" r="1.600" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
          </g>
        ))}
      </>
    );
  }
  return (
    <>
      <path d="M26 66 C22 38 42 23 62 24 C84 24 98 40 94 66 C92 58 90 52 86 47 L82 58 L78 46 L70 58 L65 46 L57 57 L50 46 L44 56 L37 48 C31 53 28 59 26 66 Z" fill={f} />
      <path d="M64 47 L72 52 L76 62 L68 55 Z" fill={f} />
      {brilho}
      {orelhas}
    </>
  );
}

/** Margarida de enfeite no cabelo (centro x, y e raio). */
function Margarida({ x, y, r, centro }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx={r * 0.62}
          cy="0"
          rx={r * 0.52}
          ry={r * 0.38}
          transform={`rotate(${a})`}
          fill="#fff"
          stroke="#dbe6f5"
          strokeWidth=".6"
        />
      ))}
      <circle r={r * 0.36} fill={centro} />
    </g>
  );
}


/* ============ Expressões do rosto (traço fino, tudo pequeno para caber na carinha) ============ */

const TRACO = '#7a5a54';
const BOCA = '#e08a90';
const LINHA = '#9a5a5c';
const EY = 70; // altura dos olhos
const XS = [46, 74];

/** Cada expressão: olhos, sobrancelha, boca e (opcional) para onde olha / lágrimas. */
export const EXPRESSOES = {
  fofo: { olhos: 'abertos', brow: null, boca: 'sorriso' },
  feliz: { olhos: 'abertos', brow: 'alta-leve', boca: 'aberta' },
  sorrisao: { olhos: 'abertos', brow: 'alta-leve', boca: 'sorrisao' },
  risada: { olhos: 'fechados', brow: null, boca: 'risada' },
  travesso: { olhos: 'abertos', brow: 'assimetrica', boca: 'torta', mira: [1, 0] },
  emburrado: { olhos: 'abertos', brow: 'suave-baixa', boca: 'emburrada' },
  preocupado: { olhos: 'abertos', brow: 'preocupada', boca: 'ondulada', mira: [0, -0.6] },
  assustado: { olhos: 'arregalados', brow: 'preocupada', boca: 'ondulada' },
  surpreso: { olhos: 'arregalados', brow: 'alta', boca: 'o' },
  choro: { olhos: 'abertos', brow: 'preocupada', boca: 'chorando', mira: [0, -1.6], lagrimas: true },
  curioso: { olhos: 'abertos', brow: 'uma-alta', boca: 'biquinho', mira: [1.6, -1.6] },
  sonolento: { olhos: 'meio', brow: null, boca: 'bocejo' }
};
// nomes antigos continuam valendo (mais suaves)
EXPRESSOES.zangado = EXPRESSOES.emburrado;
EXPRESSOES.choque = EXPRESSOES.surpreso;

const SOBRANCELHAS = {
  'alta-leve': ['M42 59 Q46 57.500 50 59', 'M70 59 Q74 57.500 78 59'],
  alta: ['M41.500 58.500 Q46 55.500 50.500 58.500', 'M69.500 58.500 Q74 55.500 78.500 58.500'],
  assimetrica: ['M41.500 58.500 Q46 56 50.500 58.500', 'M69.500 60 Q74 58 78.500 58.500'],
  'suave-baixa': ['M41.500 58 L50.500 59.500', 'M78.500 58 L69.500 59.500'],
  preocupada: ['M41.500 60 L50.500 57.500', 'M78.500 60 L69.500 57.500'],
  'uma-alta': ['M41.500 58.500 Q46 55.500 50.500 58.500', 'M69.500 59.500 Q74 58.500 78.500 59.500']
};

/** Cílios: pequenos riscos que saem do canto de fora do olho (abertos, alegres ^^ ou dormindo). */
const CILIOS = {
  aberto: [[3.3, -0.4], [2.9, -2.6], [1.7, -3.8]],
  alegre: [[2.6, 0.1], [2.1, -1.7]],
  sono: [[2.4, 0.6], [1.7, 2.3]]
};

function Cilios({ x, y, tipo, menino }) {
  const lado = x < 60 ? -1 : 1;
  const f = menino ? 0.85 : 1;
  return (
    <g stroke="#4a2c3a" strokeWidth="1.05" strokeLinecap="round" fill="none">
      {CILIOS[tipo].map(([dx, dy]) => (
        <path key={`${dx}-${dy}`} d={`M${x} ${y} l${(lado * dx * f).toFixed(2)} ${(dy * f).toFixed(2)}`} />
      ))}
    </g>
  );
}

function Rosto({ exp, menino, id }) {
  const e = EXPRESSOES[exp] || EXPRESSOES.fofo;
  const arregalado = e.olhos === 'arregalados';
  const rx = (menino ? 5.7 : 5.3) * (arregalado ? 1.08 : 1);
  const ry = (menino ? 7 : 6.7) * (arregalado ? 1.1 : 1);
  const [mx, my0] = e.mira || [0, 0];
  const my = menino ? 81 : 80; // linha da boca
  const t = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' };

  const olho = (x) => {
    if (e.olhos === 'fechados') {
      return (
        <g key={x}>
          <path
            d={`M${x - 5.2} ${EY + 1.6} Q${x} ${EY - 4.4} ${x + 5.2} ${EY + 1.6}`}
            stroke="#4a2c3a"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
          <Cilios x={x + (x < 60 ? -5.2 : 5.2)} y={EY + 1.6} tipo="alegre" menino={menino} />
        </g>
      );
    }
    return (
      <g key={x} className="chibi-olho">
        <ellipse
          cx={x}
          cy={EY}
          rx={rx}
          ry={ry}
          fill={menino ? `url(#${id}m)` : `url(#${id}i)`}
          stroke={menino ? 'rgba(36,44,80,.6)' : 'none'}
          strokeWidth=".6"
        />
        <g className="chibi-pupila">
          <ellipse
            cx={x + mx}
            cy={EY + my0}
            rx={(menino ? 2.8 : 2.9) * (arregalado ? 0.8 : 1)}
            ry={(menino ? 3.6 : 3.8) * (arregalado ? 0.8 : 1)}
            fill={menino ? '#1b2438' : '#3a2433'}
            opacity={menino ? 0.5 : 1}
          />
        </g>
        <circle cx={x - 1.8} cy={EY - 2.5 + my0 / 2} r={arregalado ? 2.2 : 1.9} fill="#fff" />
        <circle cx={x + 1.9} cy={EY + 2.6 + my0 / 2} r="0.9" fill="#fff" />
        <path
          d={`M${x - rx - 0.5} ${EY - 1.5} Q${x} ${EY - ry - 1.6} ${x + rx + 0.5} ${EY - 1.5}`}
          stroke="#4a2c3a"
          strokeWidth=".9"
          strokeOpacity=".6"
          fill="none"
          strokeLinecap="round"
        />
        <Cilios x={x + (x < 60 ? -1 : 1) * rx * 0.88} y={EY - ry * 0.5} tipo="aberto" menino={menino} />
        {e.olhos === 'meio' && (
          <>
            <path
              d={`M${x - rx - 1} ${EY - ry - 2} L${x + rx + 1} ${EY - ry - 2} L${x + rx + 1} ${EY + 0.5} Q${x} ${EY + 2.500} ${x - rx - 1} ${EY + 0.5} Z`}
              fill="#fcdcc9"
            />
            <path d={`M${x - rx} ${EY + 0.5} Q${x} ${EY + 2.600} ${x + rx} ${EY + 0.5}`} stroke="#4a2c3a" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>
    );
  };

  const boca = () => {
    switch (e.boca) {
      case 'aberta':
        return (
          <>
            <path d={`M56 ${my} Q60 ${my + 6.500} 64 ${my} Z`} fill={BOCA} />
            <ellipse cx="60" cy={my + 3.600} rx="1.700" ry="1" fill="#f6b0b4" />
          </>
        );
      case 'sorrisao':
        return (
          <>
            <path d={`M54.500 ${my - 0.500} Q60 ${my + 7} 65.500 ${my - 0.500} Z`} fill={BOCA} />
            <ellipse cx="60" cy={my + 4} rx="2.200" ry="1.200" fill="#f6b0b4" />
          </>
        );
      case 'risada':
        return (
          <>
            <path d={`M54 ${my - 1} Q60 ${my + 9} 66 ${my - 1} Z`} fill={BOCA} />
            <ellipse cx="60" cy={my + 4.600} rx="2.800" ry="1.500" fill="#f6b0b4" />
          </>
        );
      case 'torta':
        return (
          <>
            <path d={`M56.500 ${my + 1.500} Q60 ${my + 3} 64.500 ${my - 0.500}`} stroke={LINHA} strokeWidth="1.400" {...t} />
            <path d={`M65.500 ${my - 1.800} Q66.800 ${my - 0.600} 66.200 ${my + 0.600}`} stroke="#d99a8c" strokeWidth=".8" {...t} />
          </>
        );
      case 'emburrada':
        return <path d={`M57 ${my + 2.500} Q60 ${my - 0.300} 63 ${my + 2.500}`} stroke={LINHA} strokeWidth="1.300" {...t} />;
      case 'ondulada':
        return <path d={`M56 ${my + 2} Q58 ${my - 0.500} 60 ${my + 2} Q62 ${my - 0.500} 64 ${my + 2}`} stroke={LINHA} strokeWidth="1.300" {...t} />;
      case 'o':
        return <ellipse cx="60" cy={my + 2.600} rx="2.600" ry="3.300" fill={BOCA} />;
      case 'chorando':
        return <path d={`M56.500 ${my + 5} Q60 ${my - 1.500} 63.500 ${my + 5} Z`} fill={BOCA} />;
      case 'biquinho':
        return <ellipse cx="60" cy={my + 2} rx="1.700" ry="2" fill="#f4b3a8" stroke={LINHA} strokeWidth=".7" />;
      case 'bocejo':
        return <ellipse cx="60" cy={my + 3} rx="2.600" ry="3.600" fill={BOCA} />;
      case 'sorriso':
      default:
        return (
          <path
            d={menino ? `M57 ${my + 0.500} Q60 ${my + 2.800} 63 ${my + 0.500}` : `M56.500 ${my} Q60 ${my + 3.800} 63.500 ${my}`}
            stroke={LINHA}
            strokeWidth="1.400"
            {...t}
          />
        );
    }
  };

  const brow = e.brow ? SOBRANCELHAS[e.brow] : null;

  return (
    <>
      <g className="chibi-aberto">
        {XS.map(olho)}
        {brow &&
          brow.map((d) => (
            <path key={d} d={d} stroke={TRACO} strokeOpacity=".6" strokeWidth="1.100" fill="none" strokeLinecap="round" />
          ))}
        {e.lagrimas &&
          XS.map((x, i) => (
            <path
              key={x}
              className="chibi-gota"
              style={{ animationDelay: `${i * 0.8}s` }}
              d={`M${x - 5} ${EY + 7} C${x - 3.700} ${EY + 9.500} ${x - 2.500} ${EY + 10.500} ${x - 2.500} ${EY + 12} A2.500 2.500 0 0 1 ${x - 7.500} ${EY + 12} C${x - 7.500} ${EY + 10.500} ${x - 6.300} ${EY + 9.500} ${x - 5} ${EY + 7} Z`}
              fill="#bfe6fb"
              stroke="#fff"
              strokeWidth=".5"
            />
          ))}
      </g>

      <g className="chibi-feliz" stroke="#4a2c3a" strokeWidth="1.600" fill="none" strokeLinecap="round">
        <path d={`M40.500 ${EY + 1.500} Q46 ${EY - 5} 51.500 ${EY + 1.500}`} />
        <path d={`M68.500 ${EY + 1.500} Q74 ${EY - 5} 79.500 ${EY + 1.500}`} />
        <Cilios x={40.5} y={EY + 1.5} tipo="alegre" menino={menino} />
        <Cilios x={79.5} y={EY + 1.5} tipo="alegre" menino={menino} />
      </g>
      <g className="chibi-dormindo" stroke="#4a2c3a" strokeWidth="1.500" fill="none" strokeLinecap="round">
        <path d={`M40.500 ${EY - 1} Q46 ${EY + 3.500} 51.500 ${EY - 1}`} />
        <path d={`M68.500 ${EY - 1} Q74 ${EY + 3.500} 79.500 ${EY - 1}`} />
        <Cilios x={40.5} y={EY - 1} tipo="sono" menino={menino} />
        <Cilios x={79.5} y={EY - 1} tipo="sono" menino={menino} />
        <ellipse cx="60" cy={my + 2} rx="1.600" ry="2" fill="#e59aa0" stroke="none" />
        <text className="chibi-z" x="96" y="44" fontSize="14" fill="#6b7a99" stroke="none">z</text>
      </g>

      <circle cx="60" cy="76.500" r={menino ? 1.2 : 0.9} fill="#e8a089" />
      <g className="chibi-boca">{boca()}</g>
    </>
  );
}

/**
 * genero: 'f' (padrão) ou 'm' · tema: uma paleta de catalogo.js · estado: 'tomada' | 'pendente' | 'atrasada'
 * pose: nome em poses.js (opcional: sem ela, herda as variáveis CSS do elemento pai)
 * seringa: seringinha na mão direita (convite para tomar a vacina)
 */
export default function Chibi({ tema: temaBase, genero = 'f', estado = 'pendente', largura = 104, seringa = false, pose, poseExtra, expressao, bloqueada = false, roupa, cabelo, asas, pele, modo }) {
  const id = useId().replace(/:/g, '');
  const feliz = estado === 'tomada';
  const aflita = estado === 'atrasada';
  const menino = genero === 'm';
  const eM = menino ? MENINOS[roupa] : null; // estilo masculino especial
  const tema = temaBase;
  const corPele = pele || PELE;
  const NOVO = cabelo ? resolverCabelo(cabelo, tema) : null; // penteados (estilos.jsx)
  const antigoM = ['lateral', 'bagunca', 'repicado'].includes(cabelo) ? cabelo : null;
  const fCab = `url(#${id}h)`;
  const TorsoM = eM ? TORSOS_M[roupa] : null;
  const Roupa = menino ? null : ROUPAS[roupa];
  const petalas = !!Roupa; // vestido com os braços de fora
  const padrao = feliz ? 'feliz' : aflita ? 'preocupado' : 'fofo';
  const estilo = { overflow: 'visible', ...(pose ? varsDaPose(pose, poseExtra) : {}) };

  const perna = (lado) => (
    <g className={`rg-quadril rg-q${lado}`}>
      {eM ? (
        <rect x={eM.larga ? -7.500 : -6} y="-2" width={eM.larga ? 15 : 12} height="17" rx="6" fill={eM.calca} />
      ) : menino ? (
        <>
          <rect x="-6" y="-2" width="12" height="16" rx="6" fill={corPele} />
          <rect x="-7.2" y="-2" width="14.4" height="11" rx="5.5" fill={tema.roupa1} />
        </>
      ) : (
        <rect x="-6" y="-2" width="12" height="16" rx="6" fill={tema.roupa1} />
      )}
      <g className={`rg-joelho rg-j${lado}`}>
        {!eM &&
          (menino ? (
            <>
              <rect x="-5.5" y="0" width="11" height="13" rx="5.5" fill={corPele} />
              <rect x="-5.9" y="3" width="11.8" height="10" rx="4" fill="#fff" />
              <rect x="-5.9" y="4.6" width="11.8" height="1.6" fill={tema.roupa1} />
            </>
          ) : (
            <rect x="-5.5" y="0" width="11" height="13" rx="5.5" fill={tema.roupa1} />
          ))}
        <g className={`rg-tornozelo rg-t${lado}`}>
          <ellipse cx="2" cy={eM ? 2.500 : -1} rx={eM ? 9.500 : 12} ry={eM ? 5.500 : 7} fill={eM ? eM.bota : tema.bota} />
          {!eM && <ellipse cx="-2" cy="-3.500" rx="4" ry="2" fill="#fff" opacity=".35" />}
        </g>
        {eM && <path d={eM.larga ? 'M-6.500 -1 L6.500 -1 L9.500 12.500 L-9.500 12.500 Z' : 'M-5.500 -1 L5.500 -1 L6.200 12.500 L-6.200 12.500 Z'} fill={eM.calca} />}
      </g>
    </g>
  );

  const braco = (lado, comSeringa) => {
    const manga = eM ? eM.manga || corPele : menino ? '#fff' : petalas ? corPele : tema.roupa1;
    const antebraco = eM ? eM.manga || corPele : menino || petalas ? corPele : tema.roupa1;
    return (
      <g className={`rg-ombro rg-o${lado}`}>
        {/* ombro arredondado (deltoide) que se funde ao tronco, e braço afunilado */}
        <ellipse cx="0" cy="1.500" rx="7.200" ry="6.600" fill={manga} />
        <path d="M-5.900 1 C-5.900 5 -5.200 9 -4.500 12.500 L4.500 12.500 C5.200 9 5.900 5 5.900 1 Z" fill={manga} />
        {menino && !eM && <path d="M-5.200 8 L5.200 8 L5.000 10 L-5.000 10 Z" fill={tema.roupa1} />}
        <g className={`rg-cotovelo rg-c${lado}`}>
          <ellipse cx="0" cy="0.500" rx="4.700" ry="4.500" fill={antebraco} />
          <path d="M-4.500 0 C-4.300 4.500 -3.800 8 -3.200 10.800 L3.200 10.800 C3.800 8 4.300 4.500 4.500 0 Z" fill={antebraco} />
          {eM && <rect x="-4.400" y="8.200" width="8.800" height="2.800" rx="1.100" fill={eM.punho} />}
          {(!menino || ['fada', 'mago', 'inverno'].includes(roupa)) && <Manga tipo={roupa} />}
          <g className={`rg-pulso rg-p${lado}`}>
            <Mao lado={lado} id={id} />
            {comSeringa && (
              <g transform="translate(2 5.500) rotate(20)">
                <rect x="-1" y="-1" width="2" height="8" rx="1" fill="#b9c3cf" />
                <rect x="-3.400" y="6" width="6.800" height="15" rx="2.600" fill="#fff" stroke="#c3ccd6" strokeWidth=".8" />
                <rect x="-2" y="12" width="4" height="6.500" rx="1.600" fill={tema.olho} />
              </g>
            )}
          </g>
        </g>
      </g>
    );
  };

  const defs = (
      <defs>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tema.h1} />
          <stop offset="1" stopColor={tema.h2} />
        </linearGradient>
        <radialGradient id={`${id}k`} cx=".4" cy=".3" r=".9">
          <stop offset="0" stopColor={pele ? clarear(corPele, 0.55) : '#fff6ee'} />
          <stop offset="1" stopColor={corPele} />
        </radialGradient>
        <linearGradient id={`${id}r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tema.roupa1} />
          <stop offset="1" stopColor={tema.roupa2} />
        </linearGradient>
        <radialGradient id={`${id}i`} cx=".5" cy=".25" r=".95">
          <stop offset="0" stopColor="#3b2a3a" />
          <stop offset=".45" stopColor={tema.olho} />
          <stop offset="1" stopColor="#ffffff" stopOpacity=".9" />
        </radialGradient>
        <radialGradient id={`${id}m`} cx=".5" cy=".7" r=".8">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".55" />
          <stop offset=".5" stopColor={tema.olho} />
          <stop offset="1" stopColor={tema.olho} />
        </radialGradient>
        <linearGradient id={`${id}pb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c2cdf7" />
          <stop offset="1" stopColor="#8fa1e8" />
        </linearGradient>
        <radialGradient id={`${id}pw`} cx=".5" cy=".3" r=".9">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eaf0f9" />
        </radialGradient>
        <linearGradient id={`${id}ng`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b2a6b" />
          <stop offset=".5" stopColor="#3563c9" />
          <stop offset="1" stopColor="#a6cdf3" />
        </linearGradient>
        <linearGradient id={`${id}nb`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6f95de" />
          <stop offset="1" stopColor="#c9defa" />
        </linearGradient>
        <linearGradient id={`${id}og`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbc7d4" />
          <stop offset="1" stopColor="#fff3f6" />
        </linearGradient>
        <linearGradient id={`${id}fg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#bfe6e6" />
          <stop offset=".5" stopColor="#cdbdf0" />
          <stop offset="1" stopColor="#bfe9d8" />
        </linearGradient>
        <linearGradient id={`${id}wg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffcfee" stopOpacity=".9" />
          <stop offset=".5" stopColor="#cfe0ff" stopOpacity=".85" />
          <stop offset="1" stopColor="#b7f0de" stopOpacity=".9" />
        </linearGradient>
        <filter id={`${id}z`}><feGaussianBlur stdDeviation="2.4" /></filter>
      </defs>
  );

  const cabeca = (
          <g className="rg-cabeca">
            <g transform="translate(-60 -90)">
              {/* cabelo de trás */}
              {NOVO ? (
                NOVO.tras(fCab, id)
              ) : antigoM ? (
                <CabeloTras tipo={antigoM} id={id} />
              ) : menino ? (
                <path
                  d="M14 71 C19 62 18 40 34 24 C46 12 74 12 86 24 C102 40 101 62 106 71 C98 74 91 69 91 61 L29 61 C29 69 22 74 14 71 Z"
                  fill={`url(#${id}h)`}
                />
              ) : (
                <>
                  <ellipse cx="60" cy="54" rx="45" ry="40" fill={`url(#${id}h)`} />
                  <circle cx="21" cy="74" r="12" fill={tema.h2} />
                  <circle cx="99" cy="74" r="12" fill={tema.h2} />
                </>
              )}

              {!menino && <circle cx="26" cy="68" r="6.5" fill={`url(#${id}k)`} />}
              {!menino && <circle cx="94" cy="68" r="6.5" fill={`url(#${id}k)`} />}
              <ellipse cx="60" cy="64" rx="35" ry="30" fill={`url(#${id}k)`} />

              <ellipse cx="37" cy="79" rx="7" ry="4.200" fill="#ff9d8f" opacity=".5" filter={`url(#${id}z)`} />
              <ellipse cx="83" cy="79" rx="7" ry="4.200" fill="#ff9d8f" opacity=".5" filter={`url(#${id}z)`} />

              <Rosto exp={expressao || padrao} menino={menino} id={id} />

              {/* franja */}
              {NOVO ? (
                NOVO.frente(fCab, id)
              ) : antigoM ? (
                <FranjaMasc tipo={antigoM} id={id} />
              ) : menino ? (
                <>
                  <path
                    d="M27 68 C24 44 34 29 60 27 C86 29 96 44 93 68 C91 58 89 52 84 47 C78 52 70 44 60 48 C50 44 42 52 36 46 C31 50 29 58 27 68 Z"
                    fill={`url(#${id}h)`}
                  />
                  <path d="M34 36 C46 26 68 25 84 34" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <circle cx="26" cy="73" r="6" fill={`url(#${id}k)`} />
                  <circle cx="94" cy="73" r="6" fill={`url(#${id}k)`} />
                </>
              ) : (
                <>
                  <path
                    d="M22 62 C20 24 100 24 98 62 C98 70 90 70 88 62 C87 47 80 42 74 51 C72 41 66 37 60 49 C54 37 48 41 46 51 C40 42 33 47 32 62 C30 70 22 70 22 62 Z"
                    fill={`url(#${id}h)`}
                  />
                  <g transform="translate(88 40)">
                    <path d="M0 0 L-8 -5 L-8 5 Z M0 0 L8 -5 L8 5 Z" fill={tema.roupa2} stroke="#fff" strokeWidth=".8" />
                    <circle r="2.4" fill={tema.roupa1} />
                  </g>
                  <path d="M32 40 C44 30 62 28 80 34" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
                </>
              )}

              {/* enfeite da cabeça: brotinho (menina) · estrelinha e margaridas (marinheiro) */}
              {NOVO || antigoM ? null : menino ? (
                <>
                  <Margarida x={36} y={40} r={8.5} centro={tema.roupa2} />
                  <Margarida x={52} y={25} r={5.5} centro={tema.roupa2} />
                  <Margarida x={72} y={28} r={6.5} centro={tema.roupa2} />
                  <Margarida x={90} y={42} r={8} centro={tema.roupa2} />
                  <g className="chibi-broto" style={{ transformOrigin: '60px 20px' }}>
                    <path
                      transform="translate(61 12) rotate(8)"
                      d="M0 -11 L3.300 -3.600 L11 -2.800 L5.200 2.400 L7 10 L0 6 L-7 10 L-5.200 2.400 L-11 -2.800 L-3.300 -3.600 Z"
                      fill="#ffd84d"
                      stroke="#f2b50d"
                      strokeWidth="1.200"
                      strokeLinejoin="round"
                    />
                  </g>
                </>
              ) : (
                <>
                  <g className="chibi-broto" style={{ transformOrigin: '60px 28px' }}>
                    <path d="M60 30 Q60 20 62 15" stroke={tema.folha} strokeWidth="3.2" fill="none" strokeLinecap="round" />
                    <ellipse cx="53" cy="14" rx="9" ry="5" transform="rotate(-22 53 14)" fill={tema.folha} />
                    <ellipse cx="71" cy="12" rx="9" ry="5" transform="rotate(22 71 12)" fill={tema.folha} opacity=".85" />
                  </g>
                  <path d="M31 46 C34 51 36 53 36 55 A4.6 4.6 0 0 1 26.8 55 C26.8 53 28.6 51 31 46 Z" fill="#dff4ff" stroke="#fff" strokeWidth=".9" opacity=".95" />
                </>
              )}
              {aflita && <path className="chibi-gota" d="M102 54 C105 59 107 61 107 64 A5 5 0 0 1 97 64 C97 61 99 59 102 54 Z" fill="#9edaf8" />}
            </g>
          </g>

  );

  if (modo === 'cabeca') {
    return (
      <svg viewBox="0 0 120 150" width={largura} height={largura * 1.25} className={`chibi chibi-${estado}`} style={estilo} aria-hidden="true">
        {defs}
        <g transform="translate(60 118)">{cabeca}</g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 120 150"
      width={largura}
      height={largura * 1.25}
      className={`chibi chibi-${estado}${bloqueada ? ' chibi-bloqueada' : ''}`}
      style={estilo}
      aria-hidden="true"
    >
      {defs}

      <ellipse className="rg-sombra" cx="60" cy="146" rx="30" ry="4.5" fill="#000" opacity=".14" />
      <ellipse className="rg-travesseiro" cx="22" cy="141" rx="36" ry="9" fill="#fff" stroke="#d6e4ef" strokeWidth="1.5" />

      <g className="rg-corpo">
        {asas && <Asas asas={asas} id={id} />}
        {perna('e')}
        {perna('d')}

        <g className="rg-tronco">
          <g className="rg-respira">
            <g transform="translate(-60 -118)">
              {Roupa ? (
                <Roupa id={id} />
              ) : TorsoM ? (
                <TorsoM id={id} />
              ) : menino ? (
                <>
                  {/* camisa de marinheiro, short e gola com lencinho */}
                  <path d="M38 96 Q60 88 82 96 L85 124 Q60 129 35 124 Z" fill="#fff" stroke="#e3ecf7" strokeWidth=".8" />
                  <path d="M35 117 Q60 122 85 117 L85 125 Q60 130 35 125 Z" fill={tema.roupa1} />
                  <path d="M40 97 Q48 88 60 90 Q72 88 80 97 L65 113 L60 107 L55 113 Z" fill={tema.roupa1} />
                  <path d="M45 97 L57 110 M75 97 L63 110" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M60 108 L52.500 103.500 L52.500 114 Z M60 108 L67.500 103.500 L67.500 114 Z" fill={tema.roupa1} stroke="#fff" strokeWidth=".9" strokeLinejoin="round" />
                  <circle cx="60" cy="108" r="2.4" fill={tema.roupa1} stroke="#fff" strokeWidth=".9" />
                </>
              ) : (
                <>
                  <path d="M36 96 Q60 88 84 96 L90 126 Q60 134 30 126 Z" fill={`url(#${id}r)`} />
                  <path d="M44 92 Q60 102 76 92 Q72 86 60 88 Q48 86 44 92 Z" fill={tema.roupa2} />
                  <path d="M60 99 C56 104 55 107 55 109 A5 5 0 0 0 65 109 C65 107 64 104 60 99 Z" fill="#d8f3ff" stroke="#fff" strokeWidth=".9" />
                  <circle cx="58.4" cy="108" r="1.3" fill="#fff" />
                  <circle cx="42" cy="114" r="2.2" fill="#fff" opacity=".7" />
                  <circle cx="79" cy="112" r="1.8" fill="#fff" opacity=".7" />
                </>
              )}
            </g>
          </g>

          {cabeca}

          {braco('e', false)}
          {braco('d', seringa)}
        </g>
      </g>

      {feliz && (
        <g fill="#ffd84d">
          <path className="chibi-brilho" d="M10 34 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 Z" />
          <path className="chibi-brilho" style={{ animationDelay: '.7s' }} d="M110 44 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" />
        </g>
      )}
    </svg>
  );
}
