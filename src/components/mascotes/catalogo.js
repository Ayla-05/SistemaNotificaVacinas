// src/components/mascotes/catalogo.js
//
// Cada vacina tem a SUA fadinha — e nenhuma repete o design: cada uma combina
// uma roupa, um penteado, um par de asas e cores próprias (o que dá vontade de
// desbloquear a próxima). Para vacinas fora da lista, a fadinha é gerada a partir do nome.
//
//   roupa   meninas: petalas, organza, blazer, jardim, noturno, sol, sereia, borboleta
//           meninos: principe, oceano, fada, floresta, inverno, aurora, mago, cavaleiro, marinheiro
//   cabelo  meninas: coques-duplos, meio-preso, camadas  (+curto +espelho +enfeite: brilho, lacinhos, brinco, perolas)
//           meninos: trancinha, lobo, cachos-curtos, despenteado  (+espelho +longo +enfeite: perolas, estrela, folhas, floco, sol, lua)
//   asas    { tipo: borboleta | libelula | folha | petala | pena | cristal, cores: [c1, c2, c3] }

export const PALETAS = [
  { h1: '#fff3a6', h2: '#9fdcf5', olho: '#5bb8e8', roupa1: '#7fcbee', roupa2: '#ffe97a', bota: '#f5c94a', folha: '#a4d94f' },
  { h1: '#ffe6f0', h2: '#f7a8c6', olho: '#f27aa6', roupa1: '#f58db5', roupa2: '#ffe08a', bota: '#f2b134', folha: '#ffc247' },
  { h1: '#fff0cc', h2: '#f8b878', olho: '#f0a24a', roupa1: '#f7aa68', roupa2: '#9fe3c4', bota: '#6fcfa5', folha: '#7fd6b0' },
  { h1: '#e4eaff', h2: '#a9b8f6', olho: '#7a8ff0', roupa1: '#8fa3f2', roupa2: '#e2bdf8', bota: '#9a8fe8', folha: '#b58df0' },
  { h1: '#e2fbe9', h2: '#8fdcb0', olho: '#46c58a', roupa1: '#6fd3a0', roupa2: '#ffe97a', bota: '#f0cf55', folha: '#8ed05f' },
  { h1: '#fde6ff', h2: '#d3a2ee', olho: '#b36ee0', roupa1: '#c58aea', roupa2: '#ffcfa3', bota: '#f5a972', folha: '#ee8fc0' },
  { h1: '#d9fbff', h2: '#6fd6e6', olho: '#2fb4c8', roupa1: '#5fcfe0', roupa2: '#fff3b0', bota: '#f6d56a', folha: '#7bdc8a' },
  { h1: '#ffe3d6', h2: '#f59a7a', olho: '#e8744f', roupa1: '#f58a68', roupa2: '#ffe9a6', bota: '#f2c14e', folha: '#9ddc6b' },
  { h1: '#f4ffd1', h2: '#b7e05a', olho: '#79b52c', roupa1: '#9fd24f', roupa2: '#ffd9a8', bota: '#f6b56a', folha: '#6fcf8a' },
  { h1: '#dde7ff', h2: '#7f9be8', olho: '#4d6fd6', roupa1: '#6f8de0', roupa2: '#bff0e0', bota: '#8fe0c4', folha: '#7bd6c0' }
];

const asas = (tipo, ...cores) => ({ tipo, cores });

/** Lista oficial. `rotulo` é só para o catálogo/documentação. */
export const FADINHAS = [
  /* ---------------- meninas ---------------- */
  { k: ['hepatite b'], rotulo: 'Hepatite B', nome: 'Hepa', genero: 'f', paleta: 1, roupa: 'organza', cabelo: 'meio-preso+brinco',
    cor: { h1: '#f9c3d0', h2: '#ee86a3', olho: '#e8688f' }, asas: asas('petala', '#ffd6e6', '#ffb3cf', '#ffe9f1') },
  { k: ['covid'], rotulo: 'COVID-19', nome: 'Covi', genero: 'f', paleta: 3, roupa: 'petalas', cabelo: 'coques-duplos',
    cor: { h1: '#6f63c9', h2: '#d6c8ff', olho: '#6f86e8' }, asas: asas('borboleta', '#e1e6ff', '#f3dcff', '#dff6ff') },
  { k: ['febre amarela'], rotulo: 'Febre Amarela', nome: 'Amarelinha', genero: 'f', paleta: 5, roupa: 'blazer', cabelo: 'camadas+brilho',
    cor: { h1: '#fff6cf', h2: '#f5d58a', olho: '#d9962b' }, asas: asas('cristal', '#e7f4ff', '#bfe0ff', '#f4fbff') },
  { k: ['varicela'], rotulo: 'Varicela', nome: 'Vari', genero: 'f', paleta: 7, roupa: 'jardim', cabelo: 'camadas+curto+lacinhos',
    cor: { h1: '#ffd5c4', h2: '#f08a6a', olho: '#c9604f' }, asas: asas('folha', '#d4efc4', '#9fd68b', '#e9f7d9') },
  { k: ['dtpa'], rotulo: 'dTpa', nome: 'Tica', genero: 'f', paleta: 8, roupa: 'noturno', cabelo: 'coques-duplos+curto',
    cor: { h1: '#4b2a5a', h2: '#b0609f', olho: '#8f7fe0' }, asas: asas('libelula', '#8fb0ff', '#c8b8ff', '#f1d98a') },
  { k: ['hpv'], rotulo: 'HPV', nome: 'Hipê', genero: 'f', paleta: 0, roupa: 'sol', cabelo: 'meio-preso+curto+espelho',
    cor: { h1: '#ffe9a0', h2: '#ffc23a', olho: '#c98a1c' }, asas: asas('pena', '#fff6cf', '#ffe08a', '#fffdf2') },
  { k: ['meningo'], rotulo: 'Meningocócica', nome: 'Meni', genero: 'f', paleta: 6, roupa: 'sereia', cabelo: 'meio-preso+espelho+perolas',
    cor: { h1: '#a8f0ea', h2: '#2fb4c8', olho: '#2fb4c8' }, asas: asas('cristal', '#d9fff8', '#8fe8dd', '#e9fffb') },
  { k: ['polio', 'vip', 'vop'], rotulo: 'Poliomielite (VIP/VOP)', nome: 'Polly', genero: 'f', paleta: 5, roupa: 'borboleta', cabelo: 'camadas+espelho+lacinhos',
    cor: { h1: '#f5e0ff', h2: '#c898ee', olho: '#b36ee0' }, asas: asas('borboleta', '#f9d6ff', '#d6c8ff', '#ffe6f6') },

  /* ---------------- meninos ---------------- */
  { k: ['triplice viral'], rotulo: 'Tríplice Viral (SCR)', nome: 'Tri', genero: 'm', paleta: 6, roupa: 'principe', cabelo: 'lobo',
    cor: { h1: '#3b3e4c', h2: '#14151c', olho: '#3f9a72', folha: '#cfd8d4', listra: '#7d8f8a' }, asas: asas('cristal', '#1f4a3f', '#3f7d68', '#9fd6bf') },
  { k: ['hepatite a'], rotulo: 'Hepatite A', nome: 'Hepi', genero: 'm', paleta: 2, roupa: 'oceano', cabelo: 'trancinha',
    cor: { h1: '#3f4863', h2: '#161b2d', olho: '#4a7fd0', listra: '#e3e9f4' }, asas: asas('libelula', '#b9d8ff', '#7fb0f0', '#e6f2ff') },
  { k: ['influenza'], rotulo: 'Influenza', nome: 'Flu', genero: 'm', paleta: 4, roupa: 'fada', cabelo: 'despenteado+perolas',
    cor: { h1: '#f6b09c', h2: '#c9604f', olho: '#c9645a' }, asas: asas('borboleta', '#ffcfee', '#cfe0ff', '#b7f0de') },
  { k: ['dt'], rotulo: 'dT (Dupla adulto)', nome: 'Dedê', genero: 'm', paleta: 9, roupa: 'marinheiro', cabelo: 'cachos-curtos+estrela',
    cor: { h1: '#b9695a', h2: '#6e2f2f', olho: '#4d6fd6' }, asas: asas('petala', '#cfe0ff', '#9fb7f5', '#eef3ff') },
  { k: ['bcg'], rotulo: 'BCG', nome: 'Bê', genero: 'm', paleta: 4, roupa: 'floresta', cabelo: 'cachos-curtos+espelho+folhas',
    cor: { h1: '#6b4a36', h2: '#2f1f16', olho: '#6aa84f' }, asas: asas('folha', '#d7f3b5', '#a8e08a', '#7fcf8f') },
  { k: ['pneumo'], rotulo: 'Pneumocócica', nome: 'Pneu', genero: 'm', paleta: 9, roupa: 'inverno', cabelo: 'lobo+espelho+floco',
    cor: { h1: '#f5f7fb', h2: '#b8c4dc', olho: '#7fa6d8', listra: '#8fa0bf' }, asas: asas('cristal', '#f2fbff', '#bfe3f7', '#ffffff') },
  { k: ['rotav'], rotulo: 'Rotavírus', nome: 'Roti', genero: 'm', paleta: 7, roupa: 'aurora', cabelo: 'despenteado+espelho+sol',
    cor: { h1: '#ffc88a', h2: '#e8793a', olho: '#c9602f' }, asas: asas('pena', '#ffd9a8', '#ff9d8a', '#ffe9c9') },
  { k: ['penta'], rotulo: 'Pentavalente', nome: 'Penta', genero: 'm', paleta: 3, roupa: 'mago', cabelo: 'trancinha+espelho+lua',
    cor: { h1: '#a68bff', h2: '#4a2fb0', olho: '#7a5de8', listra: '#e3d9ff' }, asas: asas('libelula', '#c9b8ff', '#8f78e8', '#f1d98a') },
  { k: ['raiva'], rotulo: 'Raiva', nome: 'Rabi', genero: 'm', paleta: 8, roupa: 'cavaleiro', cabelo: 'despenteado+longo',
    cor: { h1: '#c9967a', h2: '#7a4a38', olho: '#c9703f' }, asas: asas('folha', '#ffe0a8', '#f0b35a', '#fff1d0') }
];

function normalizar(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function hash(texto) {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

function achar(chave) {
  return FADINHAS.find((f) =>
    f.k.some((trecho) => (trecho === 'dt' ? /^dt(\s|$)/.test(chave) : chave.includes(trecho)))
  );
}

const POOL_M = { roupa: ['marinheiro', 'floresta', 'aurora', 'oceano'], cabelo: ['trancinha', 'lobo', 'cachos-curtos', 'despenteado'] };
const POOL_F = { roupa: ['sol', 'sereia', 'borboleta', 'jardim'], cabelo: ['coques-duplos', 'meio-preso', 'camadas', 'camadas+curto'] };
const TIPOS = ['borboleta', 'libelula', 'folha', 'petala', 'pena', 'cristal'];

/** Fadinha de uma vacina: tudo o que o desenho precisa (sempre a mesma para a mesma vacina). */
export function personagemDaVacina(vacina = '') {
  const chave = normalizar(vacina);
  const f = achar(chave);

  if (f) {
    return {
      nome: f.nome,
      genero: f.genero,
      tema: { ...PALETAS[f.paleta], ...f.cor },
      roupa: f.roupa,
      cabelo: f.cabelo,
      asas: f.asas
    };
  }

  // vacina fora da lista: fadinha gerada a partir do nome
  const h = hash(chave);
  const genero = h % 2 === 0 ? 'f' : 'm';
  const pool = genero === 'f' ? POOL_F : POOL_M;
  const paleta = PALETAS[h % PALETAS.length];
  const primeira = (vacina.split(' ')[0] || 'Vaci').slice(0, 4);
  return {
    nome: `${primeira}i`,
    genero,
    tema: paleta,
    roupa: pool.roupa[(h >> 2) % pool.roupa.length],
    cabelo: pool.cabelo[(h >> 5) % pool.cabelo.length],
    asas: asas(TIPOS[(h >> 3) % TIPOS.length], paleta.h1, paleta.h2, '#ffffff')
  };
}

/** "a fadinha" / "o fadinho", para as falas. */
export function artigoFadinha(genero) {
  return genero === 'm' ? 'o fadinho' : 'a fadinha';
}
