// src/pages/Login.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
      } else {
        await registrar(form);
      }

      navigate('/dashboard');
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Marca */}
        <div className="flex flex-col items-center mb-8">
          <div className="icon-chip w-14 h-14 mb-3 shadow-md shadow-emerald-900/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">ImuniTrack</h1>
          <p className="text-sm text-slate-500 mt-1">Sua carteira de vacinação, sempre em dia.</p>
        </div>

        {/* Card de vidro */}
        <div className="card-glass p-8">

          {/* Alternância Entrar / Criar conta */}
          <div className="flex bg-slate-100/70 rounded-2xl p-1 mb-6">
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
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Seus dados de saúde são protegidos e visíveis só para você.
        </p>
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
