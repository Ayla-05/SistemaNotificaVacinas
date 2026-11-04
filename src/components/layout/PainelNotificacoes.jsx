// src/components/layout/PainelNotificacoes.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, BellOff } from 'lucide-react';
import Chibi from '../mascotes/Chibi';
import { personagemDaVacina, artigoFadinha } from '../mascotes/catalogo';

const MS_DIA = 24 * 60 * 60 * 1000;

/** Dias entre hoje (meia-noite local) e a data AAAA-MM-DD. Negativo = atrasado. */
function diasAte(dataISO) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((new Date(`${dataISO}T00:00:00`) - hoje) / MS_DIA);
}

/** Notificações derivadas dos agendamentos pendentes (atrasados, de hoje e da semana). */
export function calcularNotificacoes(agendamentos) {
  return agendamentos
    .filter((a) => a.status === 'PENDENTE')
    .map((a) => ({ ...a, dias: diasAte(a.data_prevista) }))
    .filter((a) => a.dias <= 7);
}

function rotuloDias(dias) {
  if (dias < 0) return `Atrasada há ${Math.abs(dias)} dia${dias === -1 ? '' : 's'}`;
  if (dias === 0) return 'Hoje';
  if (dias === 1) return 'Amanhã';
  return `Em ${dias} dias`;
}

function Item({ item, aoFechar }) {
  const fadinha = personagemDaVacina(item.vacina);
  const atrasada = item.dias < 0;
  const estado = atrasada ? 'atrasada' : 'pendente';

  return (
    <li>
      <Link
        to="/calendario"
        onClick={aoFechar}
        className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition hover:shadow-sm focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400 ${
          atrasada
            ? 'bg-rose-50 border-rose-200'
            : item.dias === 0
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="w-16 shrink-0 flex justify-center pt-1">
          <Chibi
            tema={fadinha.tema}
            genero={fadinha.genero}
            roupa={fadinha.roupa}
            cabelo={fadinha.cabelo}
            asas={fadinha.asas}
            estado={estado}
            largura={60}
            pose="parado"
            expressao="sonolento"
            bloqueada
          />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-base text-slate-900">
            {item.vacina} · Dose {item.numero_dose}
          </p>
          <p className={`text-sm font-semibold ${atrasada ? 'text-rose-800' : 'text-slate-700'}`}>
            {rotuloDias(item.dias)} ·{' '}
            {new Date(`${item.data_prevista}T00:00:00`).toLocaleDateString('pt-BR')}
          </p>
          <p className="text-sm text-slate-700 mt-0.5">
            Tome esta vacina e desbloqueie {artigoFadinha(fadinha.genero)} {fadinha.nome}!
          </p>
        </div>
      </Link>
    </li>
  );
}

/** Barra lateral com as notificações do dia ou da semana. */
export default function PainelNotificacoes({ aberto, aoFechar, notificacoes }) {
  const [periodo, setPeriodo] = useState('dia');

  if (!aberto) return null;

  const lista =
    periodo === 'dia'
      ? notificacoes.filter((n) => n.dias <= 0)
      : notificacoes;

  const ordenada = [...lista].sort((a, b) => a.dias - b.dias);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={aoFechar} />

      <aside className="relative w-full max-w-sm h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Notificações</h2>
          <button
            onClick={aoFechar}
            className="p-1 rounded-full hover:bg-slate-100"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 p-4">
          {[
            ['dia', 'Hoje'],
            ['semana', 'Semana']
          ].map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setPeriodo(valor)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
                periodo === valor
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {ordenada.length === 0 ? (
            <div className="text-center text-slate-400 mt-16">
              <BellOff className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">
                {periodo === 'dia'
                  ? 'Nenhuma vacina para hoje.'
                  : 'Nenhuma vacina nos próximos 7 dias.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {ordenada.map((n) => (
                <Item key={n.id} item={n} aoFechar={aoFechar} />
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
