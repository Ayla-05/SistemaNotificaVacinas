// src/components/layout/AppLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all';
const linkAtivo =
  'bg-gradient-to-r from-emerald-500 to-sky-500 text-white shadow-md shadow-emerald-900/20';
const linkInativo =
  'text-slate-500 hover:bg-emerald-50 hover:text-emerald-700';

/**
 * Componente de Layout Principal da Aplicação Web
 * Estrutura: Sidebar fixa à esquerda (estilo "vidro") + Header + Conteúdo
 */
export default function AppLayout() {
  const { dependenteAtivo, setDependenteAtivo, dependentesMock } = useDependente();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleSair() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen font-sans text-slate-800 antialiased overflow-hidden">

      {/* ============================================
          SIDEBAR LATERAL (Fixa à esquerda, estilo vidro)
          ============================================ */}
      <aside className="w-64 m-4 mr-0 card-glass flex flex-col justify-between p-4">

        {/* Topo da Sidebar: Logo e Marca */}
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-emerald-900/5">
            <div className="icon-chip">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg tracking-wide">Notifica Vacinas</h1>
              <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider">Cidadão</p>
            </div>
          </div>

          {/* Navegação Principal */}
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <LayoutDashboard className="w-5 h-5" /> Dashboard
            </NavLink>

            <NavLink
              to="/scan"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <Camera className="w-5 h-5" /> Escanear Carteirinha
            </NavLink>

            <NavLink
              to="/calendario"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <Calendar className="w-5 h-5" /> Calendário Vacinal
            </NavLink>
          </nav>
        </div>

        {/* Rodapé da Sidebar: Sair */}
        <div className="border-t border-emerald-900/5 pt-4 px-2">
          <button
            onClick={handleSair}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* ============================================
          ÁREA PRINCIPAL DE CONTEÚDO
          ============================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">

        {/* HEADER SUPERIOR (Barra de Topo, estilo vidro) */}
        <header className="h-16 shrink-0 card-glass px-6 flex items-center justify-between">

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
                <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none group-hover:text-emerald-600 transition" />
              </div>
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition relative">
              <Bell className="w-5 h-5" />
              {/* Indicador de notificação */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="h-6 w-[1px] bg-slate-200"></div>
            <span className="text-sm font-semibold text-slate-700">Olá, {usuario?.nome?.split(' ')[0] ?? ''}</span>
          </div>
        </header>

        {/* CONTEÚDO DINÂMICO (Renderiza a página da rota atual) */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
