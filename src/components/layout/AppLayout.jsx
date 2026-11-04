// src/components/layout/AppLayout.jsx

import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Calendar,
  ShieldCheck,
  LogOut,
  Bell,
  UserCircle,
  UserCog,
  MonitorSmartphone,
  Users,
  ChevronDown,
  Syringe,
  Lightbulb
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { obterAgendamentos } from '../../services/api';
import PainelNotificacoes, { calcularNotificacoes } from './PainelNotificacoes';

/** Calcula a idade a partir da data de nascimento (AAAA-MM-DD). */
function calcularIdade(dataNascimento) {
  const hoje = new Date();
  // 'T00:00:00' evita a leitura como UTC (que recuaria um dia no Brasil).
  const nascimento = new Date(`${dataNascimento.slice(0, 10)}T00:00:00`);
  let idade = hoje.getFullYear() - nascimento.getFullYear();

  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());

  if (aindaNaoFezAniversario) idade--;

  return idade;
}

const linkBase =
  'flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-all';
const linkAtivo =
  'bg-white text-emerald-800 shadow-md shadow-emerald-950/20';
const linkInativo =
  'text-emerald-50/80 hover:bg-white/10 hover:text-white';

const DICAS = [
  'Mantenha a carteirinha de vacinação sempre atualizada.',
  'Vacinas de reforço mantêm a proteção por mais tempo.',
  'Dúvidas sobre uma dose? Procure a UBS mais próxima.',
  'Vacinar crianças no prazo protege toda a comunidade.',
  'Fotografe sua carteirinha: o Scan lê as doses para você.',
  'Gestantes têm vacinas específicas. Cadastre o grupo no perfil.',
  'Confirme no calendário cada dose que tomar.'
];

/** Dica do dia: troca uma vez por dia, de forma estável. */
function dicaDoDia() {
  const dia = Math.floor(Date.now() / 86400000);
  return DICAS[dia % DICAS.length];
}

/**
 * Componente de Layout Principal da Aplicação Web
 * Estrutura: Sidebar fixa à esquerda (estilo "vidro") + Header + Conteúdo
 */
export default function AppLayout() {
  const { usuario, pessoas, pessoaAtiva, selecionarPessoa, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [painelAberto, setPainelAberto] = useState(false);
  const [notificacoes, setNotificacoes] = useState([]);

  // Recarrega ao trocar de pessoa, de página ou ao abrir o painel.
  useEffect(() => {
    if (!pessoaAtiva) {
      setNotificacoes([]);
      return;
    }
    obterAgendamentos(pessoaAtiva.id)
      .then((lista) => setNotificacoes(calcularNotificacoes(lista)))
      .catch(() => setNotificacoes([]));
  }, [pessoaAtiva, pathname, painelAberto]);

  const urgentes = notificacoes.filter((n) => n.dias <= 0).length;

  async function handleSair() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen font-sans text-slate-800 antialiased overflow-hidden">

      {/* ============================================
          SIDEBAR LATERAL (Fixa à esquerda, estilo vidro)
          ============================================ */}
      <aside className="w-64 m-4 mr-0 relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-700 via-emerald-800 to-teal-900 text-white shadow-xl shadow-emerald-950/20 flex flex-col justify-between p-4">

        {/* Topo da Sidebar: Logo e Marca */}
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-white/10">
            <div className="icon-chip bg-none bg-white/15 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-lg tracking-wide">Notifica Vacinas</h1>
              <p className="text-[10px] text-emerald-200 font-semibold uppercase tracking-wider">Cidadão</p>
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
              to="/carteira"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <Syringe className="w-5 h-5" /> Carteira de Vacinação
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

            <NavLink
              to="/dependentes"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <Users className="w-5 h-5" /> Dependentes
            </NavLink>

            <NavLink
              to="/perfil"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <UserCog className="w-5 h-5" /> Meu Perfil
            </NavLink>

            <NavLink
              to="/dispositivos"
              className={({ isActive }) => `${linkBase} ${isActive ? linkAtivo : linkInativo}`}
            >
              <MonitorSmartphone className="w-5 h-5" /> Meus dispositivos
            </NavLink>
          </nav>
        </div>

        {/* Rodapé da Sidebar: dica do dia + Sair */}
        <div>
          <div data-perch="stand" data-perch-casa className="relative rounded-2xl bg-white/10 border border-white/10 p-3.5 mb-4">
            <p className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-emerald-100">
              <Lightbulb className="w-3.5 h-3.5" /> Dica do dia
            </p>
            <p className="text-sm text-white mt-1.5 leading-relaxed">{dicaDoDia()}</p>
          </div>
        <div className="border-t border-white/10 pt-4 px-2">
          <button
            onClick={handleSair}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-emerald-100/80 hover:text-white rounded-xl transition"
          >
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
        </div>
      </aside>

      {/* ============================================
          ÁREA PRINCIPAL DE CONTEÚDO
          ============================================ */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">

        {/* HEADER SUPERIOR (Barra de Topo, estilo vidro) */}
        <header className="h-16 shrink-0 card-glass px-6 flex items-center justify-between">

          {/* Pessoa cuja carteira vacinal está sendo exibida (titular ou dependente) */}
          <div className="flex items-center gap-3">
            <UserCircle className="w-7 h-7 text-emerald-600" />
            <div>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Carteira de:</p>
              {pessoaAtiva ? (
                <div className="relative flex items-center gap-1 cursor-pointer group">
                  <select
                    value={pessoaAtiva.id}
                    onChange={(e) => selecionarPessoa(Number(e.target.value))}
                    className="appearance-none font-bold text-slate-800 pr-6 bg-transparent focus:outline-none cursor-pointer text-sm"
                  >
                    {pessoas.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({calcularIdade(p.data_nascimento)} anos)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-0 pointer-events-none group-hover:text-emerald-600 transition" />
                </div>
              ) : (
                <p className="font-semibold text-slate-400 text-sm">Nenhuma pessoa vinculada</p>
              )}
            </div>
          </div>

          {/* Ações do Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPainelAberto(true)}
              aria-label="Notificações"
              className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition relative"
            >
              <Bell className="w-5 h-5" />
              {/* Indicador: vacinas de hoje ou atrasadas */}
              {urgentes > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {urgentes}
                </span>
              )}
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

      <PainelNotificacoes
        aberto={painelAberto}
        aoFechar={() => setPainelAberto(false)}
        notificacoes={notificacoes}
      />

    </div>
  );
}
