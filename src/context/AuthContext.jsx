// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  registrar as apiRegistrar,
  obterUsuarioAtual,
  obterPessoasDoUsuario,
  obterDependentes
} from '../services/api';

const AuthContext = createContext(null);

/** Normaliza um registro de dependente (pessoa_id) para o mesmo formato de uma pessoa titular (id). */
function normalizarDependente(dependente) {
  return {
    id: dependente.pessoa_id,
    nome: dependente.nome,
    data_nascimento: dependente.data_nascimento,
    email: dependente.email,
    telefone: dependente.telefone,
    parentesco: dependente.parentesco
  };
}

/**
 * Provider de Autenticação
 *
 * Fonte da verdade sobre "quem está logado" e sobre qual pessoa
 * (titular ou dependente) está sendo visualizada no momento.
 *
 * Ao montar, verifica se já existe uma sessão válida (cookie httpOnly)
 * chamando /auth/me; se sim, carrega o titular da conta e a lista de
 * dependentes vinculados a ele, formando a lista de pessoas que podem
 * ser selecionadas no cabeçalho.
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [pessoas, setPessoas] = useState([]);
  const [pessoaAtiva, setPessoaAtivaState] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarPessoas(usuarioLogado, manterPessoaAtivaId) {
    try {
      const titulares = await obterPessoasDoUsuario(usuarioLogado.id);
      const titular = titulares?.[0] ?? null;

      let lista = titular ? [titular] : [];

      if (titular) {
        const dependentes = await obterDependentes(titular.id);
        lista = [...lista, ...dependentes.map(normalizarDependente)];
      }

      setPessoas(lista);

      const pessoaMantida = lista.find((p) => p.id === manterPessoaAtivaId);
      setPessoaAtivaState(pessoaMantida ?? lista[0] ?? null);
    } catch (erro) {
      console.error('Falha ao carregar pessoas do usuário:', erro);
      setPessoas([]);
      setPessoaAtivaState(null);
    }
  }

  useEffect(() => {
    async function verificarSessao() {
      try {
        const usuarioAtual = await obterUsuarioAtual();
        setUsuario(usuarioAtual);

        if (usuarioAtual) {
          await carregarPessoas(usuarioAtual);
        }
      } finally {
        setCarregando(false);
      }
    }

    verificarSessao();
  }, []);

  async function login(email, senha) {
    const { usuario: usuarioLogado } = await apiLogin(email, senha);
    setUsuario(usuarioLogado);
    await carregarPessoas(usuarioLogado);
    return usuarioLogado;
  }

  async function registrar(dados) {
    const { usuario: usuarioCriado } = await apiRegistrar(dados);
    setUsuario(usuarioCriado);
    await carregarPessoas(usuarioCriado);
    return usuarioCriado;
  }

  async function logout() {
    await apiLogout();
    setUsuario(null);
    setPessoas([]);
    setPessoaAtivaState(null);
  }

  /** Troca qual pessoa (titular ou dependente) está sendo visualizada. */
  function selecionarPessoa(pessoaId) {
    const encontrada = pessoas.find((p) => p.id === pessoaId);
    if (encontrada) setPessoaAtivaState(encontrada);
  }

  /** Rebusca titular + dependentes (após editar perfil ou add/remover dependente). */
  async function recarregarPessoas() {
    if (usuario) {
      await carregarPessoas(usuario, pessoaAtiva?.id);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        usuario,
        pessoas,
        pessoaAtiva,
        carregando,
        login,
        registrar,
        logout,
        selecionarPessoa,
        recarregarPessoas
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return contexto;
}
