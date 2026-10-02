// src/pages/Perfil.jsx

import React, { useEffect, useState } from 'react';
import { UserCog, Save, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  obterPessoa,
  atualizarPessoa,
  obterCatalogoGruposEspeciais,
  obterGruposDaPessoa,
  vincularGrupoEspecial,
  desvincularGrupoEspecial
} from '../services/api';

const CAMPOS_VAZIOS = {
  nome: '',
  email: '',
  telefone: '',
  data_nascimento: '',
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: ''
};

/**
 * Tela de Perfil: consulta e edição dos dados cadastrais da
 * pessoa selecionada no cabeçalho, além dos grupos especiais
 * (gestante, idoso, comorbidade, etc) vinculados a ela.
 */
export default function Perfil() {
  const { pessoaAtiva, recarregarPessoas } = useAuth();

  const [form, setForm] = useState(CAMPOS_VAZIOS);
  const [catalogoGrupos, setCatalogoGrupos] = useState([]);
  const [gruposDaPessoa, setGruposDaPessoa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (!pessoaAtiva) {
      setLoading(false);
      return;
    }

    async function carregar() {
      try {
        const [pessoa, catalogo, grupos] = await Promise.all([
          obterPessoa(pessoaAtiva.id),
          obterCatalogoGruposEspeciais(),
          obterGruposDaPessoa(pessoaAtiva.id)
        ]);

        setForm({ ...CAMPOS_VAZIOS, ...pessoa });
        setCatalogoGrupos(catalogo);
        setGruposDaPessoa(grupos.map((g) => g.id));
      } catch (erroCapturado) {
        setErro(erroCapturado.message);
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [pessoaAtiva]);

  function atualizarCampo(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function alternarGrupo(grupoId) {
    const jaTem = gruposDaPessoa.includes(grupoId);

    try {
      if (jaTem) {
        await desvincularGrupoEspecial(pessoaAtiva.id, grupoId);
        setGruposDaPessoa((atual) => atual.filter((id) => id !== grupoId));
      } else {
        await vincularGrupoEspecial(pessoaAtiva.id, grupoId);
        setGruposDaPessoa((atual) => [...atual, grupoId]);
      }
    } catch (erroCapturado) {
      setErro(erroCapturado.message);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setSalvando(true);

    try {
      await atualizarPessoa(pessoaAtiva.id, form);
      await recarregarPessoas();
      setSucesso(true);
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
      <div className="flex items-center gap-3">
        <div className="icon-chip">
          <UserCog className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Meu Perfil</h1>
          <p className="text-sm text-slate-500">Dados cadastrais de {form.nome || pessoaAtiva.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">

        {erro && (
          <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
            {erro}
          </p>
        )}

        {sucesso && (
          <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 flex items-center gap-2">
            <Check className="w-4 h-4" /> Dados salvos com sucesso.
          </p>
        )}

        {/* Dados pessoais */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Dados pessoais</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo label="Nome completo" required>
              <input
                type="text"
                required
                value={form.nome}
                onChange={(e) => atualizarCampo('nome', e.target.value)}
                className="campo-input"
              />
            </Campo>

            <Campo label="Data de nascimento" required>
              <input
                type="date"
                required
                value={form.data_nascimento?.slice(0, 10) ?? ''}
                onChange={(e) => atualizarCampo('data_nascimento', e.target.value)}
                className="campo-input"
              />
            </Campo>

            <Campo label="E-mail">
              <input
                type="email"
                value={form.email ?? ''}
                onChange={(e) => atualizarCampo('email', e.target.value)}
                className="campo-input"
              />
            </Campo>

            <Campo label="Telefone">
              <input
                type="tel"
                value={form.telefone ?? ''}
                onChange={(e) => atualizarCampo('telefone', e.target.value)}
                className="campo-input"
                placeholder="(11) 99999-9999"
              />
            </Campo>
          </div>
        </div>

        {/* Endereço */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-3">Endereço</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Campo label="CEP">
              <input type="text" value={form.cep ?? ''} onChange={(e) => atualizarCampo('cep', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Logradouro" className="sm:col-span-2">
              <input type="text" value={form.logradouro ?? ''} onChange={(e) => atualizarCampo('logradouro', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Número">
              <input type="text" value={form.numero ?? ''} onChange={(e) => atualizarCampo('numero', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Complemento">
              <input type="text" value={form.complemento ?? ''} onChange={(e) => atualizarCampo('complemento', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Bairro">
              <input type="text" value={form.bairro ?? ''} onChange={(e) => atualizarCampo('bairro', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Cidade">
              <input type="text" value={form.cidade ?? ''} onChange={(e) => atualizarCampo('cidade', e.target.value)} className="campo-input" />
            </Campo>
            <Campo label="Estado (UF)">
              <input type="text" maxLength={2} value={form.estado ?? ''} onChange={(e) => atualizarCampo('estado', e.target.value.toUpperCase())} className="campo-input" />
            </Campo>
          </div>
        </div>

        {/* Grupos especiais */}
        <div>
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" /> Grupos especiais / de risco
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Marque se algum se aplica — algumas vacinas têm regras específicas para esses grupos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {catalogoGrupos.map((grupo) => (
              <label
                key={grupo.id}
                className="flex items-center gap-2 text-sm bg-slate-50 hover:bg-emerald-50 border border-slate-200 rounded-xl px-3 py-2 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={gruposDaPessoa.includes(grupo.id)}
                  onChange={() => alternarGrupo(grupo.id)}
                  className="accent-emerald-600"
                />
                <span className="font-medium text-slate-700">{grupo.nome.replaceAll('_', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={salvando} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          <Save className="w-4 h-4" /> {salvando ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  );
}

function Campo({ label, required, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-slate-600 mb-1.5 block">
        {label} {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}
