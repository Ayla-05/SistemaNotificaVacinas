// src/components/PainelVacina.jsx
//
// Painel lateral (direita) com os detalhes de uma vacina da carteira: o que já foi tomado
// (data, lote, unidade de saúde) e o que falta. Também exporta ResumoDoses, usado no
// detalhe das fadinhas do Dashboard, para as duas telas dizerem a mesma coisa.

import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, MapPin, CalendarDays, Syringe, CheckCircle2, ArrowRight } from 'lucide-react';
import Chibi from './mascotes/Chibi';
import { personagemDaVacina } from './mascotes/catalogo';
import { descreverPrazo, formatarData, localDaDose, nomeDaDose } from '../utils/formatacao';

const ORDINAL = /^\d+[ªº]/;

/**
 * "Dose tomada" x "próxima dose", em linguagem simples.
 * - item: linha do resumo (em_dia ou pendente) da vacina, ou null
 * - proxima: próxima dose do calendário (dados.proximas) quando a vacina está em dia
 * - doses: histórico de doses registradas
 */
export function ResumoDoses({ item, proxima, doses = [] }) {
  const pendente = item?.tipo === 'pendente';
  const alvo = pendente ? item : proxima;

  const maisRecente = [...doses].sort((a, b) => (b.data_aplicacao ?? '').localeCompare(a.data_aplicacao ?? ''))[0];

  const nomeTomada = alvo?.rotulo_ultima_tomada || (maisRecente ? nomeDaDose(maisRecente) : null);
  const dataTomada = alvo?.ultima_dose || maisRecente?.data_aplicacao || null;

  const quantas = Math.max(item?.tomadas ?? 0, doses.length);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3">
        <p className="text-sm font-bold uppercase tracking-wide text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Dose tomada
        </p>
        {nomeTomada ? (
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {nomeTomada}
            {dataTomada && <span className="font-medium text-slate-700"> · {formatarData(dataTomada)}</span>}
          </p>
        ) : (
          <p className="text-lg text-slate-700 mt-0.5">Nenhuma dose registrada ainda.</p>
        )}
        {quantas > 0 && (
          <p className="text-base text-slate-600">
            {quantas} {quantas === 1 ? 'dose registrada' : 'doses registradas'} na carteira
          </p>
        )}
      </div>

      <div className={`rounded-2xl border px-4 py-3 ${pendente ? (item.status === 'ATRASADA' ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200') : 'bg-sky-50 border-sky-200'}`}>
        <p className="text-sm font-bold uppercase tracking-wide text-slate-700 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" /> Próxima dose
        </p>
        {alvo ? (
          <>
            <p className="text-lg font-bold text-slate-900 mt-0.5">{alvo.rotulo}</p>
            <p className="text-base text-slate-700">
              {pendente ? descreverPrazo(item) : alvo.data_prevista ? `Prevista para ${formatarData(alvo.data_prevista)}` : 'Sem data definida pelo calendário'}
            </p>
          </>
        ) : (
          <p className="text-lg text-slate-700 mt-0.5">Nenhuma dose pendente no calendário de hoje.</p>
        )}
      </div>

      {/* Frase só quando as duas doses têm número (ex.: 3ª -> 4ª dose de reforço); senão os cartões acima já bastam. */}
      {nomeTomada && alvo && ORDINAL.test(nomeTomada) && ORDINAL.test(alvo.rotulo) && (
        <p className="text-base text-slate-700">
          Você já tomou a <strong>{nomeTomada}</strong>; agora a próxima é a <strong>{alvo.rotulo}</strong>.
        </p>
      )}
    </div>
  );
}

/** Painel lateral com o formulário-resumo da vacina (somente leitura). */
export default function PainelVacina({ vacina, item, registro, proxima, doses, carregandoDoses, aoFechar }) {
  const botaoFechar = useRef(null);
  const pendente = item?.tipo === 'pendente';
  const fadinha = personagemDaVacina(vacina);

  useEffect(() => {
    botaoFechar.current?.focus();
    const aoTeclar = (e) => e.key === 'Escape' && aoFechar();
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aoFechar]);

  const situacao = !item ? 'Registrada' : pendente ? (item.status === 'ATRASADA' ? 'Atrasada' : 'Pendente') : 'Em dia';
  const corSituacao = !item || !pendente
    ? 'bg-emerald-100 text-emerald-900'
    : item.status === 'ATRASADA' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900';

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={aoFechar}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${vacina}`}
        className="painel-entrar w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={botaoFechar} onClick={aoFechar} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100" aria-label="Fechar painel">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-5 pr-10">
          <span className={`w-20 shrink-0 rounded-2xl flex items-end justify-center pt-1 ${pendente ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <Chibi
              tema={fadinha.tema}
              genero={fadinha.genero}
              roupa={fadinha.roupa}
              cabelo={fadinha.cabelo}
              asas={fadinha.asas}
              estado={pendente ? 'pendente' : 'tomada'}
              largura={72}
              pose="parado"
              expressao={pendente ? 'sonolento' : 'sorrisao'}
              bloqueada={pendente}
            />
          </span>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{vacina}</h2>
            <span className={`inline-block mt-1 text-base font-bold px-3 py-0.5 rounded-full ${corSituacao}`}>{situacao}</span>
          </div>
        </div>

        <div className="space-y-5 text-lg text-slate-800">
          {registro?.descricao && <p>{registro.descricao}</p>}
          {registro?.doencas_evitadas && (
            <p>
              <strong>Protege contra:</strong> {registro.doencas_evitadas}
            </p>
          )}

          <ResumoDoses item={item} proxima={proxima} doses={doses} />

          <div>
            <p className="font-bold mb-2 flex items-center gap-2">
              <Syringe className="w-5 h-5 text-emerald-700" /> Doses tomadas
            </p>
            {carregandoDoses ? (
              <p className="text-base text-slate-600">Carregando…</p>
            ) : doses.length === 0 ? (
              <p className="text-base text-slate-600">Nenhuma dose registrada.</p>
            ) : (
              <ul className="space-y-3">
                {doses.map((d) => (
                  <li key={d.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-1">
                    <p className="text-lg font-bold text-slate-900">{nomeDaDose(d)}</p>
                    <p className="text-base text-slate-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 shrink-0" />
                      {d.data_aplicacao ? formatarData(d.data_aplicacao) : 'Sem data informada'}
                    </p>
                    <p className="text-base text-slate-700 flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      {localDaDose(d) ?? 'Unidade não informada'}
                    </p>
                    <p className="text-base text-slate-600">
                      Lote: {d.lote || 'não informado'}
                      {d.fabricante ? ` · ${d.fabricante}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {pendente && (
          <Link to="/calendario" className="btn-primary mt-6 w-full flex items-center justify-center gap-2 text-lg !py-3">
            Agendar no calendário
          </Link>
        )}
      </aside>
    </div>
  );
}
