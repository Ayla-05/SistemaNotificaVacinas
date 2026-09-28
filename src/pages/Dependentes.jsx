// src/pages/Dependentes.jsx

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { obterDependentes, cadastrarDependente, removerDependente } from '../services/api';

const FORM_VAZIO = { nome: '', data_nascimento: '', parentesco: '' };

/**
 * Tela de Dependentes: lista quem já está vinculado à pessoa titular
 * (filhos, pais, etc) e permite cadastrar um novo ou remover o vínculo.
 * Cada dependente ganha sua própria carteira vacinal, selecionável
 * no seletor de pessoas do cabeçalho.
 */
export default function Dependentes() {
  const { pessoaAtiva, recarregarPessoas } = useAuth();

  const [dependentes, setDependentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [salvando, setSalvando] = useState(false);

  const responsavelId = pessoaAtiva?.id;

  async function carregar() {
    if (!responsavelId) {
      setLoading(false);
      return;
    }

    try {
      const lista = await obterDependentes(responsavelId);
      setDependentes(lista);
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsavelId]);

  async function handleCadastrar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);

    try {
      await cadastrarDependente({ responsavelPessoaId: responsavelId, ...form });
      setForm(FORM_VAZIO);
      setMostrarForm(false);
      await carregar();
      await recarregarPessoas();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    } finally {
      setSalvando(false);
    }
  }

  async function handleRemover(dependentePessoaId) {
    if (!confirm('Remover este dependente da sua conta? A carteira vacinal dele não será apagada.')) return;

    try {
      await removerDependente(responsavelId, dependentePessoaId);
      await carregar();
      await recarregarPessoas();
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="icon-chip">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Dependentes</h1>
            <p className="text-sm text-slate-500">Filhos, pais ou outras pessoas sob sua responsabilidade</p>
          </div>
        </div>

        <button onClick={() => setMostrarForm((v) => !v)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Novo dependente
        </button>
      </div>

      {erro && (
        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
          {erro}
        </p>
      )}

      {mostrarForm && (
        <form onSubmit={handleCadastrar} className="card space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block sm:col-span-1">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Nome</span>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                className="campo-input"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Data de nascimento</span>
              <input
                type="date"
                required
                value={form.data_nascimento}
                onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                className="campo-input"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Parentesco</span>
              <select
                required
                value={form.parentesco}
                onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
                className="campo-input"
              >
                <option value="">Selecione</option>
                <option value="filho">Filho(a)</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="conjuge">Cônjuge</option>
                <option value="outro">Outro</option>
              </select>
            </label>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
              {salvando && <Loader2 className="w-4 h-4 animate-spin" />} Cadastrar
            </button>
            <button type="button" onClick={() => setMostrarForm(false)} className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 text-sm font-semibold hover:bg-slate-50 transition">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="card">
        {dependentes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">Nenhum dependente cadastrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {dependentes.map((dep) => (
              <div key={dep.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-800">{dep.nome}</p>
                  <p className="text-xs text-slate-500 capitalize">{dep.parentesco} • nascido(a) em {new Date(dep.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                </div>
                <button
                  onClick={() => handleRemover(dep.pessoa_id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Remover vínculo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
