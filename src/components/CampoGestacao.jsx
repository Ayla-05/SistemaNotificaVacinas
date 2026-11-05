// src/components/CampoGestacao.jsx
//
// Pergunta "há quantas semanas está a gestação?" (grupo Gestante). O sistema usa a resposta
// para saber quando tomar dTpa (a partir da 20ª semana) e VSR (a partir da 28ª).

import React from 'react';
import { Baby } from 'lucide-react';
import { inicioDaGestacao, partoPrevisto, semanasValidas, SEMANAS_MIN, SEMANAS_MAX } from '../utils/gestacao';
import { formatarData } from '../utils/formatacao';

export default function CampoGestacao({ semanas, onChange, id = 'semanas-gestacao' }) {
  const valida = semanasValidas(semanas);
  const inicio = valida ? inicioDaGestacao(semanas) : null;

  return (
    <div className="rounded-2xl border border-pink-200 bg-pink-50 px-4 py-3 space-y-2">
      <label htmlFor={id} className="text-base font-bold text-slate-800 flex items-center gap-2">
        <Baby className="w-5 h-5 text-pink-600" /> Há quantas semanas está a gestação?
      </label>

      <div className="flex items-center gap-3">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={SEMANAS_MIN}
          max={SEMANAS_MAX}
          value={semanas}
          onChange={(e) => onChange(e.target.value)}
          className="campo-input !w-28 text-lg"
          placeholder="ex.: 12"
          aria-describedby={`${id}-ajuda`}
        />
        <span className="text-base text-slate-700">semanas (de {SEMANAS_MIN} a {SEMANAS_MAX})</span>
      </div>

      <p id={`${id}-ajuda`} className="text-sm text-slate-600">
        Veja no cartão da gestante ou no ultrassom. O sistema usa isso para avisar quando tomar a dTpa
        (a partir da 20ª semana) e a vacina do VSR (a partir da 28ª).
      </p>

      {valida ? (
        <p className="text-sm font-semibold text-pink-800">
          Início estimado: {formatarData(inicio)} · parto previsto por volta de {formatarData(partoPrevisto(inicio))}
        </p>
      ) : (
        semanas !== '' && <p className="text-sm font-semibold text-rose-700">Informe um número de {SEMANAS_MIN} a {SEMANAS_MAX} semanas.</p>
      )}
    </div>
  );
}
