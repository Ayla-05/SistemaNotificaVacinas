// src/pages/Carteira.jsx

import React, { useEffect, useState } from 'react';
import { Syringe, PlusCircle, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obterCarteira, obterVacinas, confirmarScanNaCarteira } from '../services/api';

const FORM_VAZIO = { vacina: '', dose: '', dataAplicacao: '', lote: '', localAplicacao: '' };

/**
 * Tela de Carteira: lista as vacinas já registradas para a pessoa
 * ativa e permite adicionar manualmente uma vacina que a pessoa já
 * tomou (sem precisar escanear a carteirinha física).
 *
 * Reaproveita o mesmo endpoint de confirmação do fluxo de Scan
 * (POST /carteira/confirmar-scan) - ele resolve a vacina pelo nome
 * e cria o registro/dose, então serve igualmente bem para entrada
 * manual ou para dados extraídos por IA.
 */
export default function Carteira() {
  const { pessoaAtiva } = useAuth();

  const [registros, setRegistros] = useState([]);
  const [vacinasDisponiveis, setVacinasDisponiveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    if (!pessoaAtiva) {
      setLoading(false);
      return;
    }

    try {
      const [carteira, vacinas] = await Promise.all([
        obterCarteira(pessoaAtiva.id),
        obterVacinas()
      ]);

      setRegistros(carteira);
      setVacinasDisponiveis(vacinas);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pessoaAtiva]);

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso('');
    setSalvando(true);

    try {
      await confirmarScanNaCarteira({ pessoaId: pessoaAtiva.id, ...form });
      setSucesso(`${form.vacina} registrada na carteira.`);
      setForm(FORM_VAZIO);
      setMostrarForm(false);
      await carregar();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!pessoaAtiva) {
    return <div className="card">Nenhuma pessoa vinculada à sua conta ainda.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-chip">
            <Syringe className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Carteira de Vacinação</h1>
            <p className="text-sm text-slate-500">Vacinas registradas para {pessoaAtiva.nome}</p>
          </div>
        </div>

        <button onClick={() => setMostrarForm((v) => !v)} className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Registrar vacina
        </button>
      </div>

      {erro && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">{erro}</p>
      )}
      {sucesso && (
        <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <Check className="w-4 h-4" /> {sucesso}
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <p className="text-xs text-slate-500">
            Use esta opção quando já souber quais vacinas foram tomadas (ex.: informação de outra
            unidade de saúde). Para ler automaticamente uma carteirinha física, use a aba
            "Escanear Carteirinha".
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Vacina</span>
              <select
                required
                value={form.vacina}
                onChange={(e) => setForm({ ...form, vacina: e.target.value })}
                className="campo-input"
              >
                <option value="">Selecione</option>
                {vacinasDisponiveis.map((v) => (
                  <option key={v.id} value={v.nome}>{v.nome}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Dose</span>
              <input
                type="text"
                required
                placeholder="Ex.: 1ª dose, Dose única, Reforço"
                value={form.dose}
                onChange={(e) => setForm({ ...form, dose: e.target.value })}
                className="campo-input"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Data da aplicação</span>
              <input
                type="date"
                value={form.dataAplicacao}
                onChange={(e) => setForm({ ...form, dataAplicacao: e.target.value })}
                className="campo-input"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Lote (opcional)</span>
              <input
                type="text"
                value={form.lote}
                onChange={(e) => setForm({ ...form, lote: e.target.value })}
                className="campo-input"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Local de aplicação (opcional)</span>
              <input
                type="text"
                value={form.localAplicacao}
                onChange={(e) => setForm({ ...form, localAplicacao: e.target.value })}
                className="campo-input"
              />
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {salvando && <Loader2 className="w-4 h-4 animate-spin" />} Salvar
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {registros.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Nenhuma vacina registrada ainda.</p>
        ) : (
          <div className="space-y-3">
            {registros.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{r.nome}</p>
                  {r.doencas_evitadas && <p className="text-xs text-slate-500">{r.doencas_evitadas}</p>}
                </div>
                <span className="badge badge-success">Registrada</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
