// src/components/mascotes/estilos.jsx
//
// Peças visuais que tornam cada fadinha única: tipos de asas, penteados e roupas.
// Cada vacina combina uma roupa, um penteado e um par de asas (ver catalogo.js).
// Coordenadas: cabeça no sistema "abs" (rosto em 60,64) e tronco com cintura em y≈110.

import React from 'react';

const PELE = '#fbd5c0';

/* ====================== ASAS ====================== */

const ESC_ASA = 'translate(46 100) scale(1.350) translate(-46 -100)';
const traco = { stroke: '#fff', strokeOpacity: 0.8, strokeWidth: 0.7 };
const veia = { stroke: '#fff', strokeOpacity: 0.6, strokeWidth: 0.5, fill: 'none' };

const FORMAS = {
  borboleta: (g) => (
    <g transform={ESC_ASA}>
      <path d="M46 100 C24 86 4 74 8 44 C14 38 26 46 36 60 C44 72 48 88 48 100 Z" fill={`url(#${g})`} {...traco} />
      <path d="M47 104 C30 106 16 122 24 140 C36 136 47 124 49 108 Z" fill={`url(#${g})`} {...traco} />
      {[[10, 48], [14, 60], [22, 72], [30, 86], [26, 132], [20, 122]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.600" fill="#fff" stroke="#e8e2f2" strokeWidth=".3" />
      ))}
      <path d="M46 100 C30 86 16 64 12 48 M47 104 C34 110 28 124 26 134" {...veia} />
    </g>
  ),
  libelula: (g) => (
    <g transform={ESC_ASA}>
      <path d="M46 98 C30 84 10 66 2 46 C14 42 38 62 48 94 Z" fill={`url(#${g})`} {...traco} />
      <path d="M47 103 C28 98 6 98 0 112 C14 120 38 112 48 107 Z" fill={`url(#${g})`} {...traco} />
      <path d="M46 98 C30 80 14 62 6 48 M47 104 C30 102 12 104 4 112 M30 76 L26 88 M20 66 L14 74" {...veia} />
    </g>
  ),
  folha: (g) => (
    <g transform={ESC_ASA}>
      <path d="M46 100 C20 88 8 62 16 34 C36 44 50 70 48 98 Z" fill={`url(#${g})`} {...traco} />
      <path d="M47 105 C30 108 18 124 26 142 C40 136 50 122 49 106 Z" fill={`url(#${g})`} {...traco} />
      <path d="M46 100 C34 80 24 58 18 38 M47 106 C40 118 32 130 28 140 M34 76 L26 74 M30 62 L22 58" {...veia} />
    </g>
  ),
  petala: (g) => (
    <g transform={ESC_ASA}>
      <ellipse cx="26" cy="76" rx="10" ry="26" transform="rotate(28 26 76)" fill={`url(#${g})`} {...traco} />
      <ellipse cx="30" cy="118" rx="8" ry="17" transform="rotate(52 30 118)" fill={`url(#${g})`} {...traco} />
      <path d="M40 98 C30 80 22 62 20 50" {...veia} />
    </g>
  ),
  pena: (g) => (
    <g transform={ESC_ASA}>
      <path d="M46 100 C20 92 2 70 8 36 C26 46 42 72 48 98 Z" fill={`url(#${g})`} {...traco} />
      <path d="M47 104 C26 108 12 126 20 146 C38 140 49 124 49 108 Z" fill={`url(#${g})`} {...traco} />
      <path d="M46 100 C30 84 16 62 10 40 M18 78 L28 80 M22 66 L32 70 M14 54 L24 58 M47 106 C36 118 26 132 22 144" {...veia} />
    </g>
  ),
  cristal: (g) => (
    <g transform={ESC_ASA}>
      <path d="M46 100 L22 80 L6 48 L30 52 L47 86 Z" fill={`url(#${g})`} {...traco} strokeLinejoin="round" />
      <path d="M47 104 L26 112 L16 138 L40 128 L49 110 Z" fill={`url(#${g})`} {...traco} strokeLinejoin="round" />
      <path d="M22 80 L30 52 M46 100 L30 52 M26 112 L40 128" {...veia} />
    </g>
  )
};

export const TIPOS_ASA = Object.keys(FORMAS);

/** Par de asas atrás do corpo. asas = { tipo, cores: [c1, c2, c3] }. */
export function Asas({ asas, id }) {
  const g = `${id}wg`;
  const forma = FORMAS[asas.tipo] || FORMAS.borboleta;
  const [c1, c2, c3] = asas.cores;
  return (
    <g>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} stopOpacity=".9" />
          <stop offset=".5" stopColor={c2} stopOpacity=".85" />
          <stop offset="1" stopColor={c3} stopOpacity=".9" />
        </linearGradient>
      </defs>
      <g className="chibi-asa-e" style={{ transformOrigin: '46px 100px' }}>{forma(g)}</g>
      <g className="chibi-asa-d" style={{ transformOrigin: '74px 100px' }}>
        <g transform="translate(120 0) scale(-1 1)">{forma(g)}</g>
      </g>
    </g>
  );
}

/* ====================== PENTEADOS ====================== */

const brilho = (d = 'M34 36 C46 26 68 25 84 34') => (
  <path d={d} stroke="#fff" strokeOpacity=".4" strokeWidth="2.600" fill="none" strokeLinecap="round" />
);
const orelhasM = (id) => (
  <>
    <circle cx="26" cy="73" r="6" fill={`url(#${id}k)`} />
    <circle cx="94" cy="73" r="6" fill={`url(#${id}k)`} />
  </>
);
const laco = (x, y, cor = '#fff', borda = '#ddd') => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M0 0 L-7 -4.500 L-7 4.500 Z M0 0 L7 -4.500 L7 4.500 Z" fill={cor} stroke={borda} strokeWidth=".6" />
    <circle r="2.200" fill={borda} />
  </g>
);

/** Cada penteado: tras (atrás do rosto) e frente (franja e detalhes). f = cor do cabelo (url do degradê). */
export const CABELOS = {
  /* ---------- meninas (estilos das referências) ---------- */
  // dois coques no alto, maria-chiquinhas longas e onduladas, franja repartida ao meio e mechas laterais
  'coques-duplos': {
    tras: (f, id, o) => {
      const rabo = o.curto
        ? 'M28 44 C14 58 20 72 16 86 C14 96 20 102 18 104 C26 108 34 100 32 90 C30 80 28 70 34 60 Z'
        : 'M28 44 C12 58 20 76 14 92 C8 106 18 124 14 142 C24 148 34 138 32 122 C30 106 24 92 32 78 C38 64 34 60 38 50 Z';
      const coque = (
        <g>
          <circle cx="30" cy="22" r="12" fill={f} />
          <path d="M22 20 C26 12 36 12 38 20 M24 27 C28 21 36 23 36 27" stroke="#fff" strokeOpacity=".3" strokeWidth="1.200" fill="none" strokeLinecap="round" />
          <circle cx="34" cy="31" r="2.300" fill="#ff9ec2" stroke="#fff" strokeWidth=".5" />
        </g>
      );
      return (
        <>
          <ellipse cx="60" cy="50" rx="42" ry="36" fill={f} />
          <path d={rabo} fill={f} />
          <g transform="translate(120 0) scale(-1 1)"><path d={rabo} fill={f} /></g>
          {coque}
          <g transform="translate(120 0) scale(-1 1)">{coque}</g>
        </>
      );
    },
    frente: (f, id, o) => (
      <>
        <path d="M60 22 C42 22 26 36 26 68 C32 56 40 48 48 44 C54 42 58 38 60 30 Z" fill={f} />
        <path d="M60 22 C78 22 94 36 94 68 C88 56 80 48 72 44 C66 42 62 38 60 30 Z" fill={f} />
        <path d="M46 42 C46 48 44 52 40 56 C46 54 50 50 52 42 Z M74 42 C74 48 76 52 80 56 C74 54 70 50 68 42 Z" fill={f} />
        <path
          d={o.curto
            ? 'M26 66 C20 78 24 90 20 98 C28 92 32 82 34 72 Z M94 66 C100 78 96 90 100 98 C92 92 88 82 86 72 Z'
            : 'M26 66 C20 84 24 100 20 114 C28 106 32 88 34 72 Z M94 66 C100 84 96 100 100 114 C92 106 88 88 86 72 Z'}
          fill={f}
        />
        <path d="M60 24 L60 34 M40 36 C34 42 30 52 30 62 M80 36 C86 42 90 52 90 62" stroke="#fff" strokeOpacity=".35" strokeWidth="1.400" fill="none" strokeLinecap="round" />
      </>
    )
  },
  // meio preso, ondas longas, repartido de lado, com coquinho torcido no lado
  'meio-preso': {
    tras: (f, id, o) => {
      const onda = o.curto
        ? 'M26 52 C12 66 16 82 12 96 C10 104 16 108 20 106 C30 102 30 90 34 78 C36 70 32 62 34 58 Z'
        : 'M26 52 C10 70 14 92 8 112 C4 128 14 142 20 150 C32 142 30 124 34 108 C38 92 30 76 34 62 Z';
      return (
        <>
          <ellipse cx="60" cy="50" rx="42" ry="36" fill={f} />
          <path d={onda} fill={f} />
          <g transform="translate(120 0) scale(-1 1)"><path d={onda} fill={f} /></g>
        </>
      );
    },
    frente: (f, id, o) => (
      <>
        <path d="M26 66 C22 34 40 20 60 20 C82 20 98 34 96 60 C92 46 84 40 72 40 C62 40 54 44 48 52 C42 58 34 62 26 66 Z" fill={f} />
        <path d="M30 52 C30 44 40 42 42 50 C42 58 34 60 30 52 Z" fill={f} />
        <path d="M32 50 C34 46 40 46 40 51 M34 54 C36 52 40 52 40 55" stroke="#fff" strokeOpacity=".45" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path
          d={o.curto
            ? 'M26 62 C20 74 22 86 18 94 C26 88 30 78 32 68 Z M94 62 C100 74 98 86 102 94 C94 88 90 78 88 68 Z'
            : 'M26 62 C20 78 22 94 18 108 C26 100 30 84 32 70 Z M94 62 C100 78 98 94 102 108 C94 100 90 84 88 70 Z'}
          fill={f}
        />
        <path d="M50 24 C62 22 78 28 88 40 M60 30 C70 30 80 34 86 44" stroke="#fff" strokeOpacity=".4" strokeWidth="1.600" fill="none" strokeLinecap="round" />
      </>
    )
  },
  // camadas macias, franja longa caindo de lado e pontas viradas (curto) ou compridas (longo)
  camadas: {
    tras: (f, id, o) => (
      <path
        d={o.curto
          ? 'M14 80 C8 44 28 14 60 13 C92 14 112 44 106 80 C112 88 108 98 98 98 C94 92 98 84 94 78 L26 78 C22 84 26 92 22 98 C12 98 8 88 14 80 Z'
          : 'M12 84 C6 44 28 12 60 11 C92 12 114 44 108 84 L104 120 L96 102 L92 126 L86 100 L34 100 L28 126 L24 102 L16 120 Z'}
        fill={f}
      />
    ),
    frente: (f, id, o) => (
      <>
        <path d="M24 66 C20 34 40 20 60 20 C82 20 100 34 96 62 C94 52 90 46 84 42 C78 50 68 52 62 48 C56 54 48 52 40 56 C34 58 28 62 24 66 Z" fill={f} />
        <path d="M32 38 C42 32 56 34 62 44 C54 46 44 52 40 62 C34 54 30 46 32 38 Z" fill={f} />
        <path
          d={o.curto
            ? 'M24 62 C16 74 18 86 12 94 C22 90 28 80 30 70 Z M96 62 C104 74 102 86 108 94 C98 90 92 80 90 70 Z'
            : 'M24 62 C16 80 18 98 12 116 C22 108 28 90 30 72 Z M96 62 C104 80 102 98 108 116 C98 108 92 90 90 72 Z'}
          fill={f}
        />
        <path d="M46 22 L52 34 M58 22 L60 32 M40 40 C46 38 52 40 56 44" stroke="#fff" strokeOpacity=".45" strokeWidth="1.400" fill="none" strokeLinecap="round" />
      </>
    )
  },

  /* ---------- meninos (estilos das referências) ---------- */
  // liso e repicado, com mechas claras, franja de lado, trancinha na testa e rabinho
  trancinha: {
    tras: (f) => (
      <path
        d="M16 76 C12 42 30 16 60 15 C90 16 108 42 104 76 L98 66 L96 84 L90 68 L84 82 L80 62 L40 62 L36 82 L30 68 L24 84 L22 66 Z"
        fill={f}
      />
    ),
    frente: (f, id, o) => (
      <>
        {orelhasM(id)}
        <path d="M26 66 C22 36 42 22 62 23 C84 23 98 38 94 66 C92 56 90 50 84 46 L78 56 L72 44 L64 56 L56 44 C46 50 38 52 32 50 C29 54 27 60 26 66 Z" fill={f} />
        <path d="M24 64 C22 52 26 42 34 34 M40 28 C48 24 56 23 64 24 M30 70 C26 78 26 86 30 92" stroke={o.listra} strokeWidth="2.400" fill="none" strokeLinecap="round" strokeOpacity=".85" />
        <TrancaBanda />
        <path d="M88 32 C96 20 110 22 112 34 C106 30 100 32 96 38 Z" fill={f} />
        <path d="M92 28 C98 22 106 24 108 30" stroke={o.listra} strokeWidth="1.600" fill="none" strokeLinecap="round" />
        <circle cx="90" cy="34" r="2.800" fill="#e6ebf5" stroke="#aab4c8" strokeWidth=".5" />
      </>
    )
  },
  // ondulado até o queixo, repartido ao meio, com mechas soltas emoldurando o rosto
  lobo: {
    tras: (f) => (
      <path
        d="M14 86 C8 46 28 14 60 13 C92 14 112 46 106 86 L100 74 L98 94 L92 74 L88 88 L84 66 L36 66 L32 88 L28 74 L22 94 L20 74 Z"
        fill={f}
      />
    ),
    frente: (f, id, o) => (
      <>
        {orelhasM(id)}
        <path d="M60 23 C44 24 28 38 26 70 C32 60 38 50 46 46 C52 44 56 40 60 34 Z" fill={f} />
        <path d="M60 23 C76 24 94 38 94 70 C88 58 82 52 72 47 C66 44 62 40 60 34 Z" fill={f} />
        <path d="M26 70 C21 82 24 92 31 101 C28 88 30 78 34 70 Z" fill={f} />
        <path d="M94 70 C99 82 96 92 89 101 C92 88 90 78 86 70 Z" fill={f} />
        <path d="M54 27 C42 31 33 42 30 58 M66 27 C78 31 87 42 90 58 M28 80 C26 88 28 94 32 98" stroke={o.listra} strokeWidth="1.600" fill="none" strokeLinecap="round" strokeOpacity=".55" />
      </>
    )
  },
  // cachos curtos e volumosos, com cachinhos na franja
  'cachos-curtos': {
    tras: (f) => (
      <>
        {[[24, 58], [22, 72], [30, 40], [44, 26], [60, 21], [76, 26], [90, 40], [98, 58], [96, 72]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="13" fill={f} />
        ))}
        <ellipse cx="60" cy="48" rx="38" ry="30" fill={f} />
      </>
    ),
    frente: (f, id, o) => (
      <>
        {orelhasM(id)}
        {[[36, 46, 8], [46, 40, 9], [58, 38, 9], [70, 40, 9], [81, 45, 8.500], [89, 52, 7]].map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={f} />
        ))}
        <path d="M44 38 a5 5 0 1 1 6 6 M64 34 a5 5 0 1 1 6 6 M30 50 a4 4 0 1 1 5 5 M82 40 a4 4 0 1 1 5 5" stroke={o.listra || '#fff'} strokeOpacity=".4" strokeWidth="1.400" fill="none" strokeLinecap="round" />
      </>
    )
  },
  // volumoso e despenteado, repuxado para cima, com franja de lado e pontas picotadas
  despenteado: {
    tras: (f, id, o) => (
      <path
        d={o.longo
          ? 'M16 86 C12 44 30 14 62 13 C94 14 108 40 102 70 L100 92 L92 72 L30 72 L24 92 Z'
          : 'M18 74 C14 42 30 14 62 13 C94 14 108 40 102 70 L98 62 L96 76 L90 62 L30 62 L26 76 L22 62 Z'}
        fill={f}
      />
    ),
    frente: (f, id, o) => (
      <>
        {orelhasM(id)}
        <path d="M26 66 C22 38 34 22 54 18 C70 12 96 20 96 46 C96 56 94 62 94 68 C90 54 80 44 66 44 C56 44 48 50 44 56 C40 50 34 56 26 66 Z" fill={f} />
        <path d="M50 20 L54 6 L60 20 Z M66 16 L76 4 L78 18 Z M82 20 L94 12 L92 26 Z M24 56 L12 62 L26 66 Z" fill={f} />
        {o.longo && (
          <>
            <path d="M24 70 C18 84 20 96 28 102 L32 84 Z" fill={f} />
            <path d="M96 72 C102 84 100 96 92 102 L88 84 Z" fill={f} />
          </>
        )}
        <path d="M40 34 C52 22 72 20 88 30 M62 28 C70 34 76 40 78 48" stroke="#fff" strokeOpacity=".35" strokeWidth="1.800" fill="none" strokeLinecap="round" />
      </>
    )
  }
};

function Estrelinha({ x, y }) {
  return (
    <path
      transform={`translate(${x} ${y})`}
      d="M0 -6 L1.800 -1.800 L6 -1.500 L2.700 1.300 L3.700 5.500 L0 3.200 L-3.700 5.500 L-2.700 1.300 L-6 -1.500 L-1.800 -1.800 Z"
      fill="#ffd84d"
      stroke="#f2b50d"
      strokeWidth=".6"
      strokeLinejoin="round"
    />
  );
}

/* ====================== ROUPAS DAS MENINAS ====================== */

const borda = (c) => ({ stroke: c, strokeWidth: '.8' });

/** Vestido sol: saia de pétalas de girassol, corpete laranja com girassol no peito. */
export function VestidoSol({ id }) {
  return (
    <>
      {[22, 32, 42, 52, 62, 72, 82, 92, 100].map((x, i) => (
        <ellipse key={`a${x}`} cx={x} cy={125 + (i % 2)} rx="12" ry="9" fill="#ffd85a" {...borda('#f2a81d')} />
      ))}
      {[28, 40, 52, 64, 76, 88, 96].map((x, i) => (
        <ellipse key={`b${x}`} cx={x} cy={120.500 + (i % 2)} rx="12" ry="8.500" fill="#ffe27a" {...borda('#f5b82e')} />
      ))}
      {[36, 47, 58, 69, 80, 90].map((x, i) => (
        <ellipse key={`c${x}`} cx={x} cy={115.500 + (i % 2)} rx="11" ry="7.500" fill="#fff0a8" {...borda('#f6c64a')} />
      ))}
      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M43 100 Q52 96 60 99 Q68 96 77 100 L75 113 Q60 116 45 113 Z" fill="#ffb347" stroke="#f08a1c" strokeWidth=".6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <ellipse key={a} cx="60" cy="98" rx="2.200" ry="4.600" transform={`rotate(${a} 60 105)`} fill="#ffe14d" stroke="#e8a516" strokeWidth=".4" />
      ))}
      <circle cx="60" cy="105" r="4.200" fill="#7a4a24" />
      <rect x="42" y="111" width="36" height="3" rx="1.200" fill="#a35c24" />
    </>
  );
}

/** Vestido sereia: conchas no peito, saia de escamas e barbatana ondulada. */
export function VestidoSereia({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}sg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35b8c4" />
          <stop offset="1" stopColor="#8fe8d8" />
        </linearGradient>
      </defs>
      <path d="M24 124 Q28 144 40 139 Q46 148 54 141 Q60 150 66 141 Q74 148 80 139 Q92 144 96 124 Z" fill={`url(#${id}sg)`} stroke="#2aa0a8" strokeWidth=".7" />
      <path d="M38 108 Q60 104 82 108 L95 126 Q60 134 25 126 Z" fill={`url(#${id}sg)`} stroke="#2aa0a8" strokeWidth=".7" />
      {[0, 1, 2].map((r) =>
        [-24, -14, -4, 6, 16, 26].map((dx) => (
          <path key={`${r}-${dx}`} d={`M${55 + dx + (r % 2) * 5} ${113 + r * 6} q5 6 10 0`} stroke="#d4faf4" strokeWidth=".6" fill="none" strokeLinecap="round" />
        ))
      )}
      {[34, 48, 60, 72, 86].map((x) => (
        <circle key={x} cx={x} cy={140} r="1.500" fill="#fff" stroke="#e8f7f5" strokeWidth=".3" />
      ))}
      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M44 99 Q50 91 58 99 Q57 108 51 110 Q44 108 44 99 Z" fill="#ffd1e0" stroke="#f5a1bd" strokeWidth=".6" />
      <path d="M62 99 Q70 91 76 99 Q76 108 69 110 Q63 108 62 99 Z" fill="#ffd1e0" stroke="#f5a1bd" strokeWidth=".6" />
      <path d="M48 96 L50 108 M52 94 L52 109 M56 96 L55 108 M66 96 L67 108 M70 94 L70 109 M74 96 L72 108" stroke="#f5a1bd" strokeWidth=".5" />
      <path d="M58 100 Q60 104 62 100" stroke="#f5a1bd" strokeWidth=".6" fill="none" />
    </>
  );
}

/** Vestido borboleta: saia em dois "asões" estampados e corpete lilás. */
export function VestidoBorboleta({ id }) {
  const pontos = [[20, 124], [28, 132], [16, 134], [100, 124], [92, 132], [104, 134]];
  return (
    <>
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d9b8ff" />
          <stop offset="1" stopColor="#ffc2e6" />
        </linearGradient>
      </defs>
      <path d="M42 110 C20 106 4 120 10 138 C26 142 42 132 50 118 Z" fill={`url(#${id}bg)`} stroke="#fff" strokeWidth=".8" />
      <path d="M78 110 C100 106 116 120 110 138 C94 142 78 132 70 118 Z" fill={`url(#${id}bg)`} stroke="#fff" strokeWidth=".8" />
      {pontos.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="#fff" fillOpacity=".75" />
      ))}
      <path d="M40 108 Q60 104 80 108 L82 128 Q60 134 38 128 Z" fill="#c9a4f5" stroke="#fff" strokeWidth=".6" />
      <path d="M46 114 Q60 118 74 114 M44 120 Q60 124 76 120" stroke="#fff" strokeOpacity=".6" strokeWidth=".6" fill="none" />
      <path d="M42 96 Q60 88 78 96 L78 104 L42 104 Z" fill={`url(#${id}k)`} />
      <path d="M43 100 Q52 96 60 99 Q68 96 77 100 L75 112.500 Q60 116 45 112.500 Z" fill="#b78cf0" stroke="#fff" strokeWidth=".6" />
      <path d="M56 99 Q50 90 46 94 Q50 98 56 99 Z M64 99 Q70 90 74 94 Q70 98 64 99 Z" fill="#fff" fillOpacity=".8" />
      <circle cx="60" cy="106" r="2.200" fill="#ffd84d" stroke="#fff" strokeWidth=".5" />
    </>
  );
}

export const ROUPAS_NOVAS = { sol: VestidoSol, sereia: VestidoSereia, borboleta: VestidoBorboleta };

/* ====================== ROUPAS DOS MENINOS ====================== */

/** Configuração de cada roupa masculina: cor da manga/punho/calça/bota e se a calça é larga. */
export const MENINOS_NOVOS = {
  floresta: { manga: '#5b7f3e', punho: '#7a4e2a', calca: '#6a4a2e', bota: '#3b2a1a', larga: false },
  inverno: { manga: '#f4f8ff', punho: '#e0525c', calca: '#c9d6ea', bota: '#8a97ad', larga: false },
  aurora: { manga: '#ffa27a', punho: '#f2c45a', calca: '#7d5fc9', bota: '#ffe27a', larga: false },
  mago: { manga: '#3a2f7a', punho: '#f1c75a', calca: '#2a2260', bota: '#f1c75a', larga: false },
  cavaleiro: { manga: '#9aa7b8', punho: '#c9d2de', calca: '#5c6b82', bota: '#3a2f2a', larga: false }
};

const CORPO = 'M38 96 Q60 88 82 96 L85 124 Q60 130 35 124 Z';

/** Floresta: túnica de musgo, gola e capa de folhas, cinto de couro e bolota. */
function VesteFloresta() {
  return (
    <>
      <path d="M80 98 C98 104 106 124 96 142 C86 136 80 120 80 104 Z" fill="#6f9a4a" stroke="#4f7a34" strokeWidth=".6" />
      <path d="M84 104 C94 112 98 126 94 136" stroke="#9fd07a" strokeWidth=".5" fill="none" />
      <path d="M36 98 C22 104 16 122 24 138 C34 132 40 118 40 104 Z" fill="#7fb05a" stroke="#4f7a34" strokeWidth=".6" />
      <path d={CORPO} fill="#5b7f3e" stroke="#41612b" strokeWidth=".6" />
      <ellipse cx="50" cy="93" rx="6" ry="3" transform="rotate(-25 50 93)" fill="#86bb60" stroke="#4f7a34" strokeWidth=".4" />
      <ellipse cx="70" cy="93" rx="6" ry="3" transform="rotate(25 70 93)" fill="#86bb60" stroke="#4f7a34" strokeWidth=".4" />
      <path d="M60 96 L60 116 M54 104 L60 100 M66 104 L60 100" stroke="#41612b" strokeWidth=".6" strokeLinecap="round" fill="none" />
      <rect x="35" y="117" width="50" height="4.500" rx="1.500" fill="#7a4e2a" />
      <rect x="57" y="116.500" width="6" height="5.500" rx="1.200" fill="none" stroke="#e8c15a" strokeWidth="1" />
      <ellipse cx="60" cy="108" rx="2.600" ry="3.200" fill="#a36a3a" />
      <path d="M57 106.500 Q60 104 63 106.500 Z" fill="#6f4a2a" />
    </>
  );
}

/** Inverno: casaco acolchoado branco, gola de pelúcia e cachecol vermelho. */
function VesteInverno() {
  return (
    <>
      <path d="M38 96 Q60 88 82 96 L86 124 Q60 130 34 124 Z" fill="#f4f8ff" stroke="#d4deee" strokeWidth=".7" />
      <path d="M37 104 Q60 110 83 104 M36 112 Q60 118 84 112 M35 120 Q60 126 85 120" stroke="#d4deee" strokeWidth=".8" fill="none" />
      {[[46, 92], [52, 90], [60, 89], [68, 90], [74, 92], [50, 96], [70, 96]].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="4.200" fill="#fff" stroke="#e1e9f5" strokeWidth=".5" />
      ))}
      <path d="M46 95 Q60 101 74 95 L74 101 Q60 107 46 101 Z" fill="#e0525c" />
      <path d="M66 102 L73 101 L75 120 L67 121 Z" fill="#e0525c" />
      <path d="M67 108 L74 107 M67 113 L74 112" stroke="#fff" strokeWidth="1" />
      <circle cx="52" cy="112" r="1.600" fill="#c9d6ea" />
      <circle cx="52" cy="119" r="1.600" fill="#c9d6ea" />
    </>
  );
}

/** Aurora: túnica em degradê de nascer do sol, com sol dourado no peito. */
function VesteAurora({ id }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}ag`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb36b" />
          <stop offset=".55" stopColor="#ff8fb0" />
          <stop offset="1" stopColor="#a98bf0" />
        </linearGradient>
      </defs>
      <path d="M38 96 Q60 88 82 96 L86 126 Q60 133 34 126 Z" fill={`url(#${id}ag)`} stroke="#fff" strokeOpacity=".6" strokeWidth=".6" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <path key={a} d="M60 99 L60 96" stroke="#ffe27a" strokeWidth="1.200" strokeLinecap="round" transform={`rotate(${a} 60 106)`} />
      ))}
      <circle cx="60" cy="106" r="5" fill="#ffe27a" stroke="#f2b50d" strokeWidth=".6" />
      <path d="M50 90 Q60 87.500 70 90 L69 96 Q60 94 51 96 Z" fill="#ffd58a" stroke="#f2c45a" strokeWidth=".5" />
      <ellipse cx="38" cy="97" rx="5" ry="3" fill="#f2c45a" />
      <ellipse cx="82" cy="97" rx="5" ry="3" fill="#f2c45a" />
      <rect x="35" y="118" width="50" height="4" rx="1.500" fill="#f2c45a" />
    </>
  );
}

/** Mago: túnica roxa estrelada com lua dourada, corda na cintura e mangas largas. */
function VesteMago() {
  return (
    <>
      <path d="M38 96 Q60 88 82 96 L91 128 Q60 137 29 128 Z" fill="#3a2f7a" stroke="#241c52" strokeWidth=".6" />
      <path d="M50 90 Q60 87 70 90 L69 97 Q60 94.500 51 97 Z" fill="#f1c75a" />
      {[[44, 110], [74, 112], [52, 124], [68, 122], [40, 122], [80, 124], [60, 128]].map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          transform={`translate(${x} ${y})`}
          d="M0 -2.800 L0.900 -0.900 L2.900 -0.700 L1.300 0.600 L1.800 2.600 L0 1.400 L-1.800 2.600 L-1.300 0.600 L-2.900 -0.700 L-0.900 -0.900 Z"
          fill="#f1c75a"
        />
      ))}
      <path d="M56 100 a5 5 0 1 0 5 6 a4 4 0 1 1 -5 -6 Z" fill="#f1c75a" stroke="#d9a93a" strokeWidth=".4" />
      <path d="M35 117 Q60 123 85 117" stroke="#f1c75a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 118 L74 130 M76 118 L79 128" stroke="#f1c75a" strokeWidth="1.200" strokeLinecap="round" />
    </>
  );
}

/** Cavaleiro: túnica clara com cruz vermelha, capa vermelha, ombreiras e cinto de couro. */
function VesteCavaleiro() {
  return (
    <>
      <path d="M36 96 Q18 112 22 142 L42 128 Z" fill="#c0394b" stroke="#8f2636" strokeWidth=".6" />
      <path d="M84 96 Q102 112 98 142 L78 128 Z" fill="#c0394b" stroke="#8f2636" strokeWidth=".6" />
      <path d="M40 96 Q60 90 80 96 L82 126 Q60 130 38 126 Z" fill="#dfe5ee" stroke="#aeb9c9" strokeWidth=".6" />
      <rect x="57" y="98" width="6" height="22" rx="1.200" fill="#c0394b" />
      <rect x="49" y="105" width="22" height="6" rx="1.200" fill="#c0394b" />
      {[[48, 91], [54, 89.500], [60, 89], [66, 89.500], [72, 91]].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3" fill="#c9d2de" stroke="#9aa7b8" strokeWidth=".5" />
      ))}
      <ellipse cx="38" cy="98" rx="6.500" ry="4.500" fill="#c9d2de" stroke="#9aa7b8" strokeWidth=".5" />
      <ellipse cx="82" cy="98" rx="6.500" ry="4.500" fill="#c9d2de" stroke="#9aa7b8" strokeWidth=".5" />
      <rect x="36" y="118" width="48" height="4.500" rx="1.500" fill="#7a4e2a" />
      <rect x="56" y="117.500" width="8" height="5.500" rx="1.200" fill="#c9d2de" stroke="#9aa7b8" strokeWidth=".5" />
    </>
  );
}

export const TORSOS_M_NOVOS = {
  floresta: VesteFloresta,
  inverno: VesteInverno,
  aurora: VesteAurora,
  mago: VesteMago,
  cavaleiro: VesteCavaleiro
};

/* ====================== BANDA TRANÇADA, ENFEITES E OPÇÕES DE PENTEADO ====================== */

const bez = (t, [x0, y0], [x1, y1], [x2, y2], [x3, y3]) => {
  const u = 1 - t;
  return [
    u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3
  ];
};

/** Trancinha prateada que atravessa a cabeça até o rabinho (referência 1). */
function TrancaBanda() {
  const pts = Array.from({ length: 14 }, (_, i) => bez(i / 13, [32, 40], [46, 22], [74, 22], [88, 34]));
  return (
    <>
      {pts.map(([x, y], i) => {
        const [xn, yn] = pts[Math.min(i + 1, pts.length - 1)];
        const [xp, yp] = pts[Math.max(i - 1, 0)];
        const ang = (Math.atan2(yn - yp, xn - xp) * 180) / Math.PI;
        return (
          <ellipse
            key={i}
            cx={x}
            cy={y}
            rx="4.200"
            ry="2.400"
            transform={`rotate(${ang} ${x} ${y})`}
            fill={i % 2 ? '#eef1f8' : '#d9dfec'}
            stroke="#aab4c8"
            strokeWidth=".4"
          />
        );
      })}
    </>
  );
}

export const ENFEITES = ['perolas', 'estrela', 'folhas', 'floco', 'sol', 'lua', 'brilho', 'lacinhos', 'brinco'];

/** Presilha/enfeite pequeno no cabelo (opcional, escolhido no catálogo). */
function Enfeite({ tipo }) {
  switch (tipo) {
    case 'perolas':
      return (
        <>
          {[[34, 40], [88, 38]].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <path d="M-4 3 Q0 -2 4 3 M0 -1 L0 -5" stroke="#cfa94a" strokeWidth=".7" fill="none" strokeLinecap="round" />
              <circle r="2.300" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
              <circle cx="-3.800" cy="3.200" r="1.600" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
              <circle cx="3.800" cy="3.200" r="1.600" fill="#fff" stroke="#e1dce8" strokeWidth=".4" />
            </g>
          ))}
        </>
      );
    case 'estrela':
      return (
        <>
          <Estrelinha x={86} y={34} />
          <g transform="translate(37 40) scale(.6)"><Estrelinha x={0} y={0} /></g>
        </>
      );
    case 'folhas':
      return (
        <>
          {[[34, 36, -30], [41, 31, 10], [30, 43, -70]].map(([x, y, a]) => (
            <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="6" ry="2.800" transform={`rotate(${a} ${x} ${y})`} fill="#7fb05a" stroke="#4f7a34" strokeWidth=".4" />
          ))}
        </>
      );
    case 'floco':
      return (
        <g transform="translate(84 38)" stroke="#fff" strokeWidth="1.300" strokeLinecap="round">
          <circle r="5.500" fill="#cfe6fb" stroke="#8fb6e0" strokeWidth=".6" />
          <path d="M-4 0 L4 0 M0 -4 L0 4 M-2.800 -2.800 L2.800 2.800 M-2.800 2.800 L2.800 -2.800" />
        </g>
      );
    case 'sol':
      return (
        <g transform="translate(84 36)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <path key={a} d="M0 -6.500 L0 -4.500" stroke="#f2a81d" strokeWidth="1.300" strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
          <circle r="3.800" fill="#ffd84d" stroke="#f2a81d" strokeWidth=".6" />
        </g>
      );
    case 'lua':
      return <path transform="translate(84 34)" d="M0 -6 a6 6 0 1 0 5 8 a4.800 4.800 0 1 1 -5 -8 Z" fill="#f1c75a" stroke="#d9a93a" strokeWidth=".5" />;
    case 'brilho':
      return (
        <path
          transform="translate(84 36)"
          d="M0 -6 C0.800 -2 2 -0.800 6 0 C2 0.800 0.800 2 0 6 C-0.800 2 -2 0.800 -6 0 C-2 -0.800 -0.800 -2 0 -6 Z"
          fill="#fff"
          stroke="#e8b7c9"
          strokeWidth=".7"
          strokeLinejoin="round"
        />
      );
    case 'lacinhos':
      return (
        <>
          {[[22, 86], [98, 86]].map(([x, y]) => (
            <g key={x} transform={`translate(${x} ${y})`}>
              <path d="M0 0 L-6 -4 L-6 4 Z M0 0 L6 -4 L6 4 Z" fill="#ffc2dc" stroke="#ee86b2" strokeWidth=".6" />
              <circle r="1.800" fill="#ee86b2" />
            </g>
          ))}
        </>
      );
    case 'brinco':
      return (
        <g transform="translate(24 80)">
          <path d="M0 0 L0 5" stroke="#cfd6e4" strokeWidth=".8" />
          <path d="M0 5 L3 8.500 L0 13 L-3 8.500 Z" fill="#dfe8fb" stroke="#9fb0d8" strokeWidth=".6" strokeLinejoin="round" />
        </g>
      );
    default:
      return null;
  }
}

/**
 * Interpreta o texto do penteado, ex.: "lobo+espelho+floco".
 *   estilo | espelho (inverte o lado) | longo (mechas maiores) | enfeite (perolas, estrela, folhas, floco, sol, lua)
 * Devolve { tras, frente } prontos para desenhar, ou null se o estilo não existir.
 */
export function resolverCabelo(texto, tema) {
  const [estilo, ...flags] = (texto || '').split('+');
  const def = CABELOS[estilo];
  if (!def) return null;
  const o = {
    longo: flags.includes('longo'),
    curto: flags.includes('curto'),
    listra: (tema && tema.listra) || '#e6ebf5',
    enfeites: flags.filter((x) => ENFEITES.includes(x))
  };
  const espelho = flags.includes('espelho');
  const envolver = (no) => (espelho ? <g transform="translate(120 0) scale(-1 1)">{no}</g> : no);
  return {
    tras: (f, id) => envolver(def.tras(f, id, o)),
    frente: (f, id) =>
      envolver(
        <>
          {def.frente(f, id, o)}
          {o.enfeites.map((e) => <Enfeite key={e} tipo={e} />)}
        </>
      )
  };
}
