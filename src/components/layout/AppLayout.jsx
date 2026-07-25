// src/components/layout/AppLayout.jsx

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Camera, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  ChevronDown 
} from 'lucide-react';
import { useDependente } from '../../context/DependenteContext';

/**
 * Componente de Layout Principal da Aplicação Web
 * Estrutura: Sidebar fixa à esquerda + Header superior + Conteúdo dinâmico
 */
export default function AppLayout() {
  const { dependenteAtivo, setDependenteAtivo, dependentesMock } = useDependente();

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* ============================================
          SIDEBAR LATERAL (Fixa à esquerda)
          ============================================ */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 shadow-xl border-r border-slate-800">
        
        {/* Topo da Sidebar: Logo e Marca */}
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="bg-cyan-500 p-2 rounded-xl text-slate-950 font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-wide">ImuniTrack</h1>
              <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Cidadão</p>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="space-y-1">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </NavLink>

            <NavLink 
              to="/scan" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Camera className="w-5 h-5" /> Escanear Carteirinha
            </NavLink>

            <NavLink 
              to="/calendario" 
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Calendar className="w-5 h-5" /> Calendário Vacinal
            </NavLink>
          </nav>
        </div>

        {/* Rodapé da Sidebar: Sair */}
        <div className="border-t border-slate-800 pt-4 px-2">
          <button className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-400 hover:text-red-400 rounded-lg transition">
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ============================================
          ÁREA PRINCIPAL DE CONTEÚDO
          ============================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER SUPERIOR (Barra de Topo) */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm z-10">
          
          {/* Seletor de Dependente - Troca Global */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">{dependenteAtivo.avatar}</span>
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Carteira de:</p>
              <div className="relative flex items-center gap-1 cursor-pointer group">
                <select 
                  value={dependenteAtivo.id}
                  onChange={(e) => setDependenteAtivo(dependentesMock.find(d => d.id === e.target.value))}
                  className="appearance-none font-bold text-slate-800 pr-6 bg-transparent focus:outline-none cursor-pointer text-sm"
                >
                  {dependentesMock.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.nome} ({dep.idade})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none group-hover:text-cyan-600 transition" />
              </div>
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-cyan-600 hover:bg-slate-50 rounded-full transition relative">
              <Bell className="w-5 h-5" />
              {/* Indicador de notificação */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <span className="text-sm font-semibold text-slate-700">Olá, Ana</span>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO (Renderiza a página da rota atual) */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>

    </div>
  );
}