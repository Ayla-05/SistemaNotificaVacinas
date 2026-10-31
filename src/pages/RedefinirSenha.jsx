// src/pages/RedefinirSenha.jsx

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, Loader2 } from 'lucide-react';
import { redefinirSenha } from '../services/api';

/**
 * Define a nova senha a partir do link enviado por e-mail
 * (/redefinir-senha?token=...). O token é de uso único.
 */
export default function RedefinirSenha() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');

  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (senha !== confirmacao) {
      setErro('As senhas não conferem.');
      return;
    }

    setCarregando(true);

    try {
      await redefinirSenha({ token, senha });
      navigate('/login', { replace: true, state: { senhaRedefinida: true } });
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="icon-chip w-14 h-14 mb-3 shadow-md shadow-emerald-900/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">Criar nova senha</h1>
        </div>

        <div className="card-glass p-8">
          {!token ? (
            <p className="text-sm text-rose-600">
              Link inválido. Solicite um novo em{' '}
              <Link to="/esqueci-senha" className="font-semibold underline">Esqueci minha senha</Link>.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Nova senha
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="campo-input"
                  placeholder="Mínimo de 8 caracteres"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Confirmar nova senha
                </span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmacao}
                  onChange={(e) => setConfirmacao(e.target.value)}
                  className="campo-input"
                />
              </label>

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
                Salvar nova senha
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
