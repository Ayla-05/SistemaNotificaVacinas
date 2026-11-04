// Gera docs/catalogo-fadinhas.html (todas as fadinhas, para revisar o design).
// Uso: npx esbuild scripts/gerar-catalogo-fadinhas.jsx --bundle --platform=node --format=cjs --outfile=scripts/.catalogo.cjs --loader:.css=empty && node scripts/.catalogo.cjs
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import Chibi from '../src/components/mascotes/Chibi.jsx';
import { FADINHAS, PALETAS } from '../src/components/mascotes/catalogo.js';

const ROUPA = {
  organza: 'Vestido de organza rosa, ombros de fora e saia de babados',
  petalas: 'Vestido de pétalas: corpete azul-lavanda com miosótis e saia de pétalas brancas',
  blazer: 'Conjunto com colete de lapela, camisinha azul e saia branca assimétrica',
  jardim: 'Vestido verde-sálvia com laço, renda, pérolas e saia de organza florida',
  noturno: 'Vestido noturno azul-marinho em degradê, com estrelas e luas douradas',
  sol: 'Vestido de girassol: saia de pétalas amarelas e girassol no peito',
  sereia: 'Vestido de sereia: conchas, escamas e barbatana na barra',
  borboleta: 'Vestido borboleta: saia em dois "asões" estampados, corpete lilás',
  principe: 'Casaco de veludo verde bordado, broche com corrente, capa de tule e calça larga',
  oceano: 'Terno azul com organza, coral e concha bordados, camisa branca e calça larga',
  fada: 'Túnica furta-cor com folhinhas e pérolas, mangas translúcidas e calça larga',
  marinheiro: 'Roupa de marinheiro: gola listrada, lencinho e short',
  floresta: 'Túnica de musgo com gola e capa de folhas, cinto de couro e bolota',
  inverno: 'Casaco acolchoado branco, gola de pelúcia e cachecol vermelho',
  aurora: 'Túnica em degradê de nascer do sol, com sol dourado no peito',
  mago: 'Túnica roxa estrelada com lua dourada e mangas largas',
  cavaleiro: 'Túnica clara com cruz vermelha, capa, ombreiras e cinto de couro'
};
const CABELO = {
  'coques-duplos': 'Dois coques no alto, maria-chiquinhas longas onduladas e franja repartida',
  'meio-preso': 'Meio preso, ondas longas, repartido de lado, com coquinho torcido',
  camadas: 'Em camadas macias, franja longa de lado',
  trancinha: 'Liso repicado com mechas claras, trancinha e rabinho',
  lobo: 'Ondulado até o queixo, repartido ao meio',
  'cachos-curtos': 'Cachos curtos e volumosos',
  despenteado: 'Despenteado, repuxado para cima, franja de lado'
};
const cabeloTxt = (c) => {
  const [e, ...fl] = c.split('+');
  const extra = [];
  if (fl.includes('espelho')) extra.push('lado invertido');
  if (fl.includes('longo')) extra.push('mechas longas');
  if (fl.includes('curto')) extra.push('comprimento curto');
  const en = fl.filter((x) => ['perolas', 'estrela', 'folhas', 'floco', 'sol', 'lua', 'brilho', 'lacinhos', 'brinco'].includes(x));
  if (en.length) extra.push('enfeite: ' + en.join(', '));
  return CABELO[e] + (extra.length ? ' (' + extra.join('; ') + ')' : '');
};
const ASA = { borboleta: 'Borboleta', libelula: 'Libélula', folha: 'Folha', petala: 'Pétala', pena: 'Pena', cristal: 'Cristal' };

const p = (f) => ({ ...PALETAS[f.paleta], ...f.cor });
const fig = (f, pose, exp, largura, extra = {}) => (
  <Chibi tema={p(f)} genero={f.genero} roupa={f.roupa} cabelo={f.cabelo} asas={f.asas} estado="tomada" largura={largura} pose={pose} expressao={exp} {...extra} />
);

const card = (f) => (
  <article className="card" key={f.nome}>
    <div className="palco">{fig(f, 'parado', 'fofo', 190)}</div>
    <h2>{f.nome} <small>{f.genero === 'm' ? 'fadinho' : 'fadinha'}</small></h2>
    <p className="vacina">Vacina: <b>{f.rotulo}</b></p>
    <ul>
      <li><b>Roupa:</b> {ROUPA[f.roupa]}</li>
      <li><b>Cabelo:</b> {cabeloTxt(f.cabelo)}</li>
      <li><b>Asas:</b> {ASA[f.asas.tipo]} {f.asas.cores.map((c) => <i key={c} className="cor" style={{ background: c }} />)}</li>
    </ul>
    <div className="mini">
      <div>{fig(f, 'acenar', 'feliz', 70)}<span>acenando</span></div>
      <div>{fig(f, 'comemorar', 'risada', 70)}<span>comemorando</span></div>
      <div>{fig(f, 'paz', 'travesso', 70)}<span>paz</span></div>
      <div>{fig(f, 'parado', 'sonolento', 70, { estado: 'pendente', bloqueada: true })}<span>bloqueada</span></div>
    </div>
  </article>
);

const css = fs.readFileSync('C:/Users/AylaPedrogaRossi/SistemaNotificaVacinas/src/components/mascotes/mascotes.css', 'utf-8');
const meninas = FADINHAS.filter((f) => f.genero === 'f');
const meninos = FADINHAS.filter((f) => f.genero === 'm');

const html = '<!DOCTYPE html>' + renderToStaticMarkup(
  <html lang="pt-BR">
    <head>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Catálogo das fadinhas</title>
      <style dangerouslySetInnerHTML={{ __html: css + `
        body{margin:0;background:linear-gradient(135deg,#ecfdf5,#f0f9ff);font-family:Inter,system-ui,sans-serif;color:#1e293b}
        header{padding:28px 24px 8px;max-width:1280px;margin:0 auto}
        h1{margin:0 0 6px;font-size:30px}
        header p{margin:0;font-size:17px;color:#334155}
        h3{max-width:1280px;margin:28px auto 8px;padding:0 24px;font-size:22px;color:#065f46}
        main{max-width:1280px;margin:0 auto;padding:0 24px 40px;display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:18px}
        .card{background:#fff;border-radius:24px;border:1px solid rgba(6,95,70,.1);padding:16px 18px 14px;box-shadow:0 2px 8px rgba(6,95,70,.06)}
        .palco{height:230px;display:flex;align-items:flex-end;justify-content:center;background:radial-gradient(circle at 50% 70%,#e6f7ef,#f6fbff);border-radius:18px;overflow:hidden;padding-bottom:6px}
        h2{margin:12px 0 2px;font-size:22px}h2 small{font-size:14px;font-weight:500;color:#64748b}
        .vacina{margin:0 0 6px;font-size:15px;color:#334155}
        ul{margin:0;padding-left:18px;font-size:14.5px;line-height:1.5;color:#334155}
        .cor{display:inline-block;width:14px;height:14px;border-radius:50%;margin-left:4px;vertical-align:-2px;border:1px solid #cbd5e1}
        .mini{display:flex;gap:6px;margin-top:10px;padding-top:8px;border-top:1px dashed #e2e8f0;justify-content:space-between}
        .mini div{display:flex;flex-direction:column;align-items:center;font-size:11.5px;color:#64748b;width:25%}
      ` }} />
    </head>
    <body>
      <header>
        <h1>Catálogo das fadinhas</h1>
        <p>{FADINHAS.length} fadinhas, uma para cada vacina. Cada uma tem roupa, penteado, asas e cores só dela: nenhuma se repete.</p>
      </header>
      <h3>Meninas ({meninas.length})</h3>
      <main>{meninas.map(card)}</main>
      <h3>Meninos ({meninos.length})</h3>
      <main>{meninos.map(card)}</main>
    </body>
  </html>
);
fs.writeFileSync('C:/Users/AylaPedrogaRossi/SistemaNotificaVacinas/docs/catalogo-fadinhas.html', html);
console.log('ok', html.length);
