// src/pages/Login.jsx

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CenaLogin } from '../components/IlustracaoSaude';

/**
 * Tela de Login / Cadastro
 *
 * Fica fora do AppLayout (sem sidebar/header) — é a porta de entrada
 * do sistema. Alterna entre "Entrar" e "Criar conta" no mesmo card,
 * no estilo vidro (glassmorphism) sobre o degradê de saúde definido
 * em index.css.
 */
export default function Login() {
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    dataNascimento: ''
  });

  const { login, registrar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      if (modo === 'login') {
        await login(form.email, form.senha);
        navigate('/dashboard');
      } else {
        const resultado = await registrar(form);
        navigate('/confirmar-email', { state: { email: resultado.email } });
      }
    } catch (erroCapturado) {
      if (erroCapturado.precisaVerificar) {
        navigate('/confirmar-email', { state: { email: erroCapturado.email || form.email } });
        return;
      }
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <CenaLogin />

      {/* Mancha branca orgânica atrás do formulário (telas largas) */}
      <svg
        className="hidden lg:block absolute left-0 top-0 h-full w-[58vw] drop-shadow-2xl"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M10 0 L70 0 C90 16 97 32 86 50 C75 68 64 86 36 100 L10 100 C3 80 10 62 5 44 C1 28 7 14 10 0 Z"
          fill="white"
        />
      </svg>

      <p className="hidden lg:block absolute bottom-10 right-12 max-w-xs text-right text-white font-semibold text-lg drop-shadow">
        Sua carteira de vacinação, sempre em dia.
      </p>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 lg:justify-start lg:pl-[9vw]">
        <div className="w-full max-w-sm bg-white/90 backdrop-blur rounded-3xl p-7 shadow-xl lg:bg-transparent lg:backdrop-blur-none lg:shadow-none lg:p-0 lg:max-w-[22rem]">

          {/* Marca */}
          <div className="flex items-center gap-2 mb-8">
            <div className="icon-chip w-10 h-10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-emerald-800 tracking-wide">Notifica Vacinas</span>
          </div>

          <h1 className="text-3xl text-slate-700 leading-tight">
            Olá,
            <span className="block font-bold text-emerald-900">
              {modo === 'login' ? 'bem-vindo(a) de volta!' : 'vamos criar sua conta!'}
            </span>
          </h1>

          {/* Alternância Entrar / Criar conta */}
          <div className="flex bg-emerald-50 rounded-2xl p-1 my-6">
            <button
              type="button"
              onClick={() => setModo('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                modo === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setModo('cadastro')}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                modo === 'cadastro'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Criar conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {modo === 'cadastro' && (
              <Campo icone={<User className="w-4 h-4" />} label="Nome completo">
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => atualizarCampo('nome', e.target.value)}
                  className="campo-input"
                  placeholder="Como você se chama"
                />
              </Campo>
            )}

            <Campo icone={<Mail className="w-4 h-4" />} label="E-mail">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => atualizarCampo('email', e.target.value)}
                className="campo-input"
                placeholder="voce@email.com"
              />
            </Campo>

            <Campo icone={<Lock className="w-4 h-4" />} label="Senha">
              <input
                type="password"
                required
                minLength={8}
                value={form.senha}
                onChange={(e) => atualizarCampo('senha', e.target.value)}
                className="campo-input"
                placeholder="Mínimo de 8 caracteres"
              />
            </Campo>

            {modo === 'cadastro' && (
              <Campo icone={<Calendar className="w-4 h-4" />} label="Data de nascimento">
                <input
                  type="date"
                  required
                  value={form.dataNascimento}
                  onChange={(e) => atualizarCampo('dataNascimento', e.target.value)}
                  className="campo-input"
                />
              </Campo>
            )}

            {modo === 'login' && (
              <p className="text-right -mt-2">
                <Link to="/esqueci-senha" className="text-xs font-semibold text-emerald-700 hover:underline">
                  Esqueci minha senha
                </Link>
              </p>
            )}

            {location.state?.senhaRedefinida && !erro && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                Senha alterada. Entre com a nova senha.
              </p>
            )}

            {erro && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
            >
              {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
              {modo === 'login' ? 'Entrar' : 'Criar minha conta'}
            </button>

          </form>

          <p className="text-xs text-slate-400 mt-6">
            Seus dados de saúde são protegidos e visíveis só para você.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Campo de formulário com rótulo e ícone, no padrão visual do card. */
function Campo({ icone, label, children }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
        {icone} {label}
      </span>
      {children}
    </label>
  );
}
