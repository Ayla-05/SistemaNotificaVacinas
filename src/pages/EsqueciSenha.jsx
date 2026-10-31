// src/pages/EsqueciSenha.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Loader2, MailCheck } from 'lucide-react';
import { esqueciSenha } from '../services/api';

/**
 * Pedido de redefinição de senha. A tela confirma o envio sem dizer se o
 * e-mail existe (o backend responde igual nos dois casos).
 */
export default function EsqueciSenha() {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      await esqueciSenha(email);
      setEnviado(true);
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-wide">Esqueci minha senha</h1>
        </div>

        <div className="card-glass p-8">
          {enviado ? (
            <div className="text-center space-y-3">
              <MailCheck className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="text-sm text-slate-600">
                Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha.
                Ele vale por 30 minutos e só pode ser usado uma vez.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500">
                Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha.
              </p>

              <label className="block">
                <span className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> E-mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="campo-input"
                  placeholder="voce@email.com"
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
                Enviar link
              </button>
            </form>
          )}

          <p className="text-center text-sm mt-6">
            <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
              Voltar para o login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
