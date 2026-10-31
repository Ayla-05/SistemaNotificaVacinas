// src/pages/Dispositivos.jsx

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MonitorSmartphone, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  listarSessoes,
  encerrarSessao,
  encerrarTodasSessoes
} from '../services/api';

/** Resume o user agent em "Navegador em Sistema" (sem depender de biblioteca). */
function descreverDispositivo(userAgent) {
  if (!userAgent) return 'Dispositivo desconhecido';

  const navegador =
    /Edg\//.test(userAgent) ? 'Edge'
    : /OPR\/|Opera/.test(userAgent) ? 'Opera'
    : /Chrome\//.test(userAgent) ? 'Chrome'
    : /Firefox\//.test(userAgent) ? 'Firefox'
    : /Safari\//.test(userAgent) ? 'Safari'
    : 'Navegador';

  const sistema =
    /Android/.test(userAgent) ? 'Android'
    : /iPhone|iPad|iOS/.test(userAgent) ? 'iOS'
    : /Windows/.test(userAgent) ? 'Windows'
    : /Mac OS X/.test(userAgent) ? 'macOS'
    : /Linux/.test(userAgent) ? 'Linux'
    : 'sistema desconhecido';

  return `${navegador} em ${sistema}`;
}

/** O SQLite devolve "AAAA-MM-DD HH:MM:SS" em UTC. */
function formatarData(valor) {
  if (!valor) return '';
  const data = new Date(valor.includes('T') ? valor : `${valor.replace(' ', 'T')}Z`);
  return data.toLocaleString('pt-BR');
}

/**
 * Tela "Meus dispositivos": lista os navegadores com sessão aberta na conta
 * e permite encerrar um deles ou sair de todos de uma vez.
 */
export default function Dispositivos() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [sessoes, setSessoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async () => {
    try {
      setSessoes(await listarSessoes());
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function encerrar(sessao) {
    setErro('');
    setProcessando(true);

    try {
      await encerrarSessao(sessao.id);

      if (sessao.atual) {
        await logout().catch(() => {});
        navigate('/login', { replace: true });
        return;
      }

      await carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setProcessando(false);
    }
  }

  async function sairDeTodos() {
    setErro('');
    setProcessando(true);

    try {
      await encerrarTodasSessoes();
      await logout().catch(() => {});
      navigate('/login', { replace: true });
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
      setProcessando(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <MonitorSmartphone className="w-5 h-5 text-emerald-600" /> Meus dispositivos
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Navegadores e aparelhos com a sua conta aberta. Se algum não for seu, encerre a sessão.
        </p>
      </div>

      {erro && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {erro}
        </p>
      )}

      <div className="card-glass divide-y divide-slate-100">
        {carregando ? (
          <div className="p-6 flex justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          </div>
        ) : (
          sessoes.map((sessao) => (
            <div key={sessao.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {descreverDispositivo(sessao.userAgent)}
                  {sessao.atual && (
                    <span className="ml-2 text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                      Este dispositivo
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  IP {sessao.ip || 'desconhecido'} · último uso {formatarData(sessao.ultimoUso)}
                </p>
              </div>

              <button
                onClick={() => encerrar(sessao)}
                disabled={processando}
                className="text-sm font-medium text-slate-500 hover:text-rose-600 disabled:opacity-50"
              >
                Encerrar
              </button>
            </div>
          ))
        )}
      </div>

      <button
        onClick={sairDeTodos}
        disabled={processando}
        className="flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
      >
        <LogOut className="w-4 h-4" /> Sair de todos os dispositivos
      </button>
    </div>
  );
}
