// src/pages/ConfirmarEmail.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, Loader2, RotateCw, FlaskConical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TAMANHO_CODIGO = 6;
const SEGUNDOS_COOLDOWN_REENVIO = 30;

/**
 * Tela de confirmação de e-mail: exibida logo após o cadastro
 * (Login.jsx -> registrar()) ou quando um login é recusado por
 * e-mail ainda não confirmado. Pede o código de 6 dígitos enviado
 * por e-mail (ver EmailService.enviarBoasVindas) e, se válido, já
 * abre a sessão e segue para o onboarding.
 */
export default function ConfirmarEmail() {
  const { confirmarEmail, reenviarCodigo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  /*
   * Só vem preenchido fora de produção (ver authController.ts):
   * mostra o código na tela pra testar sem depender do e-mail
   * chegar (útil com provedores de teste, como o Mailgun
   * sandbox, que só entrega pra destinatários autorizados).
   */
  const [codigoDev, setCodigoDev] = useState(location.state?.codigoDev || '');

  const [digitos, setDigitos] = useState(Array(TAMANHO_CODIGO).fill(''));
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [mensagemReenvio, setMensagemReenvio] = useState('');
  const [cooldown, setCooldown] = useState(0);

  const inputsRef = useRef([]);

  useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  function atualizarDigito(indice, valor) {
    const numeroLimpo = valor.replace(/\D/g, '').slice(-1);
    setDigitos((atual) => {
      const novo = [...atual];
      novo[indice] = numeroLimpo;
      return novo;
    });

    if (numeroLimpo && indice < TAMANHO_CODIGO - 1) {
      inputsRef.current[indice + 1]?.focus();
    }
  }

  function handleKeyDown(indice, e) {
    if (e.key === 'Backspace' && !digitos[indice] && indice > 0) {
      inputsRef.current[indice - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, TAMANHO_CODIGO);
    if (!texto) return;
    e.preventDefault();
    setDigitos((atual) => {
      const novo = [...atual];
      texto.split('').forEach((d, i) => { novo[i] = d; });
      return novo;
    });
    inputsRef.current[Math.min(texto.length, TAMANHO_CODIGO - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const codigo = digitos.join('');

    if (codigo.length !== TAMANHO_CODIGO) {
      setErro('Preencha os 6 dígitos do código.');
      return;
    }

    setErro('');
    setCarregando(true);

    try {
      await confirmarEmail(email, codigo);
      navigate('/completar-cadastro');
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviar() {
    if (cooldown > 0) return;

    setErro('');
    setMensagemReenvio('');
    setReenviando(true);

    try {
      const resultado = await reenviarCodigo(email);
      setCodigoDev(resultado?.codigoDev || '');
      setMensagemReenvio('Novo código enviado para o seu e-mail.');
      setCooldown(SEGUNDOS_COOLDOWN_REENVIO);
      setDigitos(Array(TAMANHO_CODIGO).fill(''));
      inputsRef.current[0]?.focus();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setReenviando(false);
    }
  }

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8 text-center">
          <div className="icon-chip w-14 h-14 mb-3 shadow-md shadow-emerald-900/10">
            <MailCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Confirme seu e-mail</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enviamos um código de 6 dígitos para <strong className="text-slate-700">{email}</strong>.
          </p>
        </div>

        {codigoDev && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 flex-shrink-0" />
            <span>
              <strong>Modo dev:</strong> código <strong className="tracking-widest">{codigoDev}</strong> (sem depender do e-mail chegar)
            </span>
          </div>
        )}

        <div className="card-glass p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
              {digitos.map((digito, i) => (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digito}
                  onChange={(e) => atualizarDigito(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold campo-input"
                />
              ))}
            </div>

            {erro && (
              <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2 text-center">{erro}</p>
            )}
            {mensagemReenvio && !erro && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center">{mensagemReenvio}</p>
            )}

            <button type="submit" disabled={carregando} className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60">
              {carregando && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar código
            </button>

            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando || cooldown > 0}
              className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 disabled:opacity-50 transition flex items-center justify-center gap-1.5"
            >
              {reenviando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
              {cooldown > 0 ? `Reenviar código (${cooldown}s)` : 'Reenviar código'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          O código expira em 15 minutos.
        </p>
      </div>
    </div>
  );
}
