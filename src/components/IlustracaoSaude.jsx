// src/components/IlustracaoSaude.jsx
//
// Ilustração vetorial de saúde (folhagem + escudo com cruz + seringa +
// frascos de vacina), usada na tela de Login (cena inteira) e no banner do
// Dashboard. Tudo é SVG inline: sem imagens externas e leve.
//
// Os gradientes ficam em <DefsSaude/>, que deve aparecer UMA vez por página.

import React from 'react';

/** Gradientes e a "folha" reutilizada várias vezes (via <use>). */
function DefsSaude() {
  return (
    <defs>
      <linearGradient id="gFundo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ecfdf5" />
        <stop offset="0.45" stopColor="#86efac" />
        <stop offset="1" stopColor="#0f766e" />
      </linearGradient>
      <linearGradient id="gFolhaEscura" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#14532d" />
        <stop offset="1" stopColor="#4ade80" />
      </linearGradient>
      <linearGradient id="gFolhaClara" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#16a34a" />
        <stop offset="1" stopColor="#bbf7d0" />
      </linearGradient>
      <linearGradient id="gFolhaAzul" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#0f766e" />
        <stop offset="1" stopColor="#7dd3fc" />
      </linearGradient>
      <linearGradient id="gFolhaSol" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#fef08a" />
      </linearGradient>
      <linearGradient id="gEscudo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#34d399" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="gLiquido" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#5eead4" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
      <g id="folha">
        <path d="M0 0 C62 -70 62 -170 0 -260 C-62 -170 -62 -70 0 0 Z" />
        <path d="M0 0 L0 -228" stroke="rgba(255,255,255,0.4)" strokeWidth="3" fill="none" />
        <path
          d="M0 -60 L26 -92 M0 -60 L-26 -92 M0 -115 L30 -148 M0 -115 L-30 -148 M0 -170 L22 -196 M0 -170 L-22 -196"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2.5"
          fill="none"
        />
      </g>
    </defs>
  );
}

/** Uma folha posicionada: x, y (base), rotação (graus), escala e gradiente. */
function Folha({ x, y, rot = 0, s = 1, fill = 'gFolhaEscura', opacity = 1 }) {
  return (
    <use
      href="#folha"
      transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
      fill={`url(#${fill})`}
      opacity={opacity}
    />
  );
}

/** Escudo com cruz branca, a peça central da ilustração. */
function Escudo({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="190" fill="white" opacity="0.1" />
      <circle r="140" fill="white" opacity="0.14" />
      <path
        d="M0 -118 L102 -80 V12 C102 76 50 112 0 134 C-50 112 -102 76 -102 12 V-80 Z"
        fill="url(#gEscudo)"
        stroke="white"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <rect x="-14" y="-52" width="28" height="104" rx="9" fill="white" />
      <rect x="-52" y="-14" width="104" height="28" rx="9" fill="white" />
    </g>
  );
}

function Seringa({ x, y, rot = 35, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-2.5" y="-158" width="5" height="60" rx="2.5" fill="#e2e8f0" />
      <rect x="-9" y="-102" width="18" height="14" rx="4" fill="#cbd5e1" />
      <rect x="-20" y="-92" width="40" height="156" rx="11" fill="white" opacity="0.92" stroke="#99f6e4" strokeWidth="3" />
      <rect x="-14" y="-24" width="28" height="82" rx="8" fill="url(#gLiquido)" />
      {[-70, -50, -30, -10, 10, 30].map((t) => (
        <line key={t} x1="8" x2={t % 40 === 10 ? 17 : 13} y1={t} y2={t} stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" />
      ))}
      <rect x="-30" y="-96" width="60" height="9" rx="4.5" fill="white" />
      <rect x="-4.5" y="64" width="9" height="62" rx="3" fill="#e2e8f0" />
      <rect x="-28" y="124" width="56" height="12" rx="6" fill="white" />
    </g>
  );
}

function Frasco({ x, y, rot = 0, s = 1, tampa = '#f59e0b' }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-22" y="-8" width="44" height="14" rx="4" fill="white" opacity="0.9" />
      <rect x="-30" y="2" width="60" height="104" rx="14" fill="white" opacity="0.9" stroke="#99f6e4" strokeWidth="3" />
      <rect x="-24" y="38" width="48" height="62" rx="10" fill="url(#gLiquido)" />
      <rect x="-32" y="-26" width="64" height="26" rx="8" fill={tampa} />
      <rect x="-20" y="46" width="40" height="34" rx="7" fill="white" opacity="0.92" />
      <rect x="-3.5" y="52" width="7" height="22" rx="2" fill="#10b981" />
      <rect x="-11" y="59.5" width="22" height="7" rx="2" fill="#10b981" />
    </g>
  );
}

/** Pequenos "+" decorativos espalhados. */
function Cruzes({ pontos }) {
  return pontos.map(([cx, cy, t, o]) => (
    <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`} opacity={o}>
      <rect x={-t / 6} y={-t / 2} width={t / 3} height={t} rx={t / 8} fill="white" />
      <rect x={-t / 2} y={-t / 6} width={t} height={t / 3} rx={t / 8} fill="white" />
    </g>
  ));
}

/** Cena de tela cheia para o Login (a parte útil fica à direita e embaixo). */
export function CenaLogin() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <DefsSaude />
      <rect width="1440" height="900" fill="url(#gFundo)" />

      {/* círculos de luz, como na referência */}
      <circle cx="1290" cy="680" r="150" fill="#d9f99d" opacity="0.28" />
      <circle cx="150" cy="620" r="120" fill="#d9f99d" opacity="0.35" />
      <circle cx="980" cy="120" r="90" fill="white" opacity="0.14" />

      {/* folhagem do canto esquerdo (aparece ao lado do card) */}
      <Folha x={40} y={940} rot={-8} s={1.7} fill="gFolhaClara" opacity={0.95} />
      <Folha x={90} y={930} rot={14} s={1.35} fill="gFolhaEscura" />
      <Folha x={20} y={800} rot={-30} s={1.2} fill="gFolhaSol" opacity={0.9} />
      <Folha x={150} y={960} rot={32} s={1.1} fill="gFolhaAzul" />

      {/* folhagem do lado direito */}
      <Folha x={1200} y={960} rot={-52} s={1.9} fill="gFolhaEscura" />
      <Folha x={1290} y={960} rot={-18} s={2.1} fill="gFolhaClara" />
      <Folha x={1360} y={960} rot={8} s={1.9} fill="gFolhaAzul" />
      <Folha x={1420} y={960} rot={32} s={1.7} fill="gFolhaEscura" />
      <Folha x={1130} y={960} rot={-72} s={1.4} fill="gFolhaSol" opacity={0.92} />
      <Folha x={1000} y={960} rot={-90} s={1.1} fill="gFolhaClara" opacity={0.85} />

      {/* folhas do topo */}
      <Folha x={1240} y={-30} rot={170} s={1.5} fill="gFolhaClara" opacity={0.9} />
      <Folha x={1380} y={-20} rot={200} s={1.7} fill="gFolhaEscura" />

      {/* elementos de saúde */}
      <Escudo x={1010} y={400} s={1.35} />
      <Seringa x={1215} y={330} rot={34} s={1.1} />
      <Frasco x={800} y={540} rot={-14} s={1.05} />
      <Frasco x={870} y={640} rot={10} s={0.8} tampa="#38bdf8" />

      <Cruzes
        pontos={[
          [890, 190, 34, 0.7],
          [1150, 140, 24, 0.6],
          [1330, 520, 30, 0.55],
          [760, 380, 22, 0.5],
          [1110, 660, 26, 0.5]
        ]}
      />
    </svg>
  );
}

/** Banner largo e baixo para o topo do Dashboard. */
export function BannerSaude() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1000 260"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <DefsSaude />
      <Folha x={640} y={290} rot={-35} s={0.8} fill="gFolhaClara" opacity={0.55} />
      <Folha x={700} y={300} rot={-10} s={1} fill="gFolhaEscura" opacity={0.6} />
      <Folha x={830} y={300} rot={14} s={0.95} fill="gFolhaAzul" opacity={0.65} />
      <Folha x={940} y={300} rot={36} s={0.9} fill="gFolhaClara" opacity={0.6} />
      <Folha x={990} y={20} rot={190} s={0.7} fill="gFolhaSol" opacity={0.55} />
      <Escudo x={800} y={125} s={0.62} />
      <Seringa x={915} y={115} rot={36} s={0.55} />
      <Frasco x={650} y={105} rot={-12} s={0.6} />
      <Cruzes
        pontos={[
          [580, 50, 18, 0.5],
          [720, 30, 14, 0.5],
          [960, 215, 16, 0.5]
        ]}
      />
    </svg>
  );
}
