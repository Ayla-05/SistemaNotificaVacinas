// src/pages/Dashboard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight, 
  UploadCloud 
} from 'lucide-react';
import { useDependente } from '../context/DependenteContext';

/**
 * Página Dashboard - Visão Geral do Usuário Cidadão
 * Exibe: Cards de resumo, Widget de próximos passos, Timeline de histórico
 */
export default function Dashboard() {
  const { dependenteAtivo } = useDependente();

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* ============================================
          TÍTULO DA PÁGINA
          ============================================ */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
        <p className="text-sm text-slate-500">
          Acompanhe a situação vacinal de <strong className="text-slate-700">{dependenteAtivo.nome}</strong>
        </p>
      </div>

      {/* ============================================
          CARDS DE RESUMO (3 colunas)
          ============================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card: Total Registradas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registradas</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">12</p>
          </div>
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Pendentes / Próximas */}
        <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/40 to-white shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pendentes / Próximas</p>
            <p className="text-3xl font-extrabold text-amber-700 mt-1">2</p>
          </div>
          <div className="bg-amber-100 text-amber-700 p-3 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card: Última Atualização */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Última Carga</p>
            <p className="text-xl font-bold text-slate-800 mt-2">24/07/2026</p>
          </div>
          <div className="bg-slate-100 text-slate-600 p-3 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ============================================
          GRID PRINCIPAL (70% - 30%)
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA (70%): Banner + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Widget: Próximos Passos - Destaque Urgente */}
          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Efeito decorativo de fundo */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-start justify-between">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Próximo Passo
              </span>
              <span className="text-xs text-amber-300 font-medium">Vence em 15 dias</span>
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-bold">Vacina de Reforço da Gripe (Influenza)</h3>
              <p className="text-slate-300 text-sm mt-1">Recomendada aplicação anual para imunização da cepa atual.</p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Local sugerido: <strong>UBS Guarulhos - Vila Fátima</strong></span>
              </div>
              <Link 
                to="/calendario" 
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                Ver no Calendário <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Timeline de Vacinação - Histórico Recente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6">Histórico Recente</h3>
            
            <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
              
              {/* Item 1: Vacina Aplicada */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0 w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-white"></span>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Tríplice Viral (Dose 2)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Aplicada em 10/02/2026 • Lote #AB9821</p>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    Concluída
                  </span>
                </div>
              </div>

              {/* Item 2: Próxima Vacina */}
              <div className="relative pl-6">
                <span className="absolute -left-[9px] top-0 w-4 h-4 bg-amber-500 rounded-full ring-4 ring-white"></span>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm">Reforço Influenza (Gripe)</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Janela aberta • Previsão para 08/08/2026</p>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                    Pendente
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (30%): Ações Rápidas */}
        <div className="space-y-6">
          
          {/* Card: Nova Carteirinha - Atalho para Scan */}
          <div className="bg-gradient-to-br from-cyan-900 to-slate-900 text-white p-6 rounded-2xl shadow-md">
            <UploadCloud className="w-10 h-10 text-cyan-400 mb-4" />
            <h3 className="font-bold text-lg">Nova Carteirinha?</h3>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Tire uma foto do papel físico. O GPT-4o extrai os lotes e atualiza seu calendário em segundos.
            </p>
            <Link 
              to="/scan" 
              className="mt-6 inline-flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition"
            >
              Escanear Documento
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}