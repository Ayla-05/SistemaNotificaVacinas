// src/pages/Calendario.jsx

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  List, 
  MessageCircle, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Clock 
} from 'lucide-react';
import { useDependente } from '../context/DependenteContext';

/**
 * Página de Calendário Vacinal
 * Visualizações: Mês (grid) e Lista Anual
 * Cores: Azul (Campanhas), Verde (Aplicadas), Amarelo (Próximas), Vermelho (Atrasadas)
 */
export default function Calendario() {
  const { dependenteAtivo } = useDependente();
  
  const [viewMode, setViewMode] = useState('mes');
  const [selectedVacina, setSelectedVacina] = useState(null);

  // Dados mocados de vacinas com status e cores correspondentes
  const vacinasMock = [
    { 
      id: 1, 
      nome: "Reforço Influenza (Gripe)", 
      data: "2026-08-08", 
      status: "proxima", 
      cor: "bg-amber-500", 
      border: "border-amber-200", 
      local: "UBS Vila Fátima - Guarulhos" 
    },
    { 
      id: 2, 
      nome: "Hepatite B (Dose 3)", 
      data: "2026-07-01", 
      status: "aplicada", 
      cor: "bg-emerald-500", 
      border: "border-emerald-200", 
      local: "Clínica Imuni Guarulhos" 
    },
    { 
      id: 3, 
      nome: "DTPa (Reforço Escolar)", 
      data: "2026-06-15", 
      status: "atrasada", 
      cor: "bg-rose-500", 
      border: "border-rose-200", 
      local: "UBS Guarulhos Central" 
    },
    { 
      id: 4, 
      nome: "Campanha Nacional Dengue", 
      data: "2026-08-20", 
      status: "campanha", 
      cor: "bg-blue-500", 
      border: "border-blue-200", 
      local: "Rede Pública de Saúde" 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ============================================
          CABEÇALHO E ALTERNÂNCIA DE VISUALIZAÇÃO
          ============================================ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Calendário Vacinal</h2>
          <p className="text-sm text-slate-500">
            Cronograma e histórico de imunização de <strong className="text-slate-700">{dependenteAtivo.nome}</strong>
          </p>
        </div>

        {/* Alternador Mês / Lista Anual */}
        <div className="bg-slate-200 p-1 rounded-xl flex items-center gap-1">
          <button 
            onClick={() => setViewMode('mes')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'mes' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" /> Mês
          </button>
          <button 
            onClick={() => setViewMode('ano')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === 'ano' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Lista Anual
          </button>
        </div>
      </div>

      {/* ============================================
          LEGENDA DE STATUS POR CORES
          ============================================ */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap gap-6 text-xs font-semibold text-slate-600">
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> 🔵 Campanhas
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"></span> 🟢 Aplicadas
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span> 🟡 Próximas
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500"></span> 🔴 Atrasadas
        </span>
      </div>

      {/* ============================================
          CONTEÚDO PRINCIPAL
          ============================================ */}
      {viewMode === 'mes' ? (
        
        /* --- VISUALIZAÇÃO: MÊS (Grid) --- */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Barra de Navegação do Mês */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Agosto de 2026</h3>
            <div className="flex gap-1">
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Cabeçalho dos Dias da Semana */}
          <div className="grid grid-cols-7 text-center border-b text-[11px] font-bold text-slate-400 py-2 bg-slate-50">
            <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span>
            <span>QUI</span><span>SEX</span><span>SÁB</span>
          </div>

          {/* Grid de Dias do Mês */}
          <div className="grid grid-cols-7 auto-rows-fr gap-px bg-slate-100">
            {Array.from({ length: 31 }).map((_, i) => {
              const dia = i + 1;
              // Verifica se há vacina neste dia
              const vacinaDoDia = vacinasMock.find(v => 
                v.data.endsWith(`-${dia < 10 ? '0' + dia : dia}`)
              );

              return (
                <div key={dia} className="bg-white min-h-[100px] p-2 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-slate-400">{dia}</span>
                  {vacinaDoDia && (
                    <div 
                      onClick={() => setSelectedVacina(vacinaDoDia)}
                      className={`p-1.5 rounded-lg border text-left cursor-pointer transition hover:scale-105 shadow-sm ${vacinaDoDia.border} bg-slate-50`}
                    >
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${vacinaDoDia.cor}`}></span>
                        <p className="text-[10px] font-bold text-slate-800 truncate">
                          {vacinaDoDia.nome}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      ) : (
        
        /* --- VISUALIZAÇÃO: LISTA ANUAL --- */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100">
          {vacinasMock.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedVacina(item)}
              className="p-4 flex items-center justify-between hover:bg-slate-50/80 cursor-pointer transition"
            >
              <div className="flex items-center gap-4">
                <span className={`w-3 h-3 rounded-full ${item.cor}`}></span>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{item.nome}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Local: {item.local}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {item.data}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ============================================
          DRAWER / MODAL DE DETALHES DA VACINA
          ============================================ */}
      {selectedVacina && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            
            {/* Botão Fechar */}
            <button 
              onClick={() => setSelectedVacina(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-3 h-3 rounded-full ${selectedVacina.cor}`}></span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detalhes do Agendamento
              </span>
            </div>

            {/* Nome da Vacina */}
            <h3 className="text-xl font-bold text-slate-800">{selectedVacina.nome}</h3>
            
            {/* Informações da Vacina */}
            <div className="mt-4 space-y-3 border-y border-slate-100 py-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Data limite/prevista: <strong>{selectedVacina.data}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>{selectedVacina.local}</span>
              </div>
            </div>

            {/* Ações: Agendamento via WhatsApp */}
            <div className="mt-6 space-y-2">
              <button 
                onClick={() => alert(`📱 Enviando lembrete no WhatsApp para: ${selectedVacina.nome}`)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" /> Agendar Lembrete no WhatsApp
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}