// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  login as apiLogin,
  logout as apiLogout,
  registrar as apiRegistrar,
  obterUsuarioAtual,
  obterPessoasDoUsuario
} from '../services/api';

const AuthContext = createContext(null);

/**
 * Provider de Autenticação
 *
 * Fonte da verdade sobre "quem está logado". Ao montar, verifica se já
 * existe uma sessão válida (cookie httpOnly) chamando /auth/me; se sim,
 * carrega também a(s) pessoa(s) vinculadas à conta (hoje só o titular,
 * já que o vínculo de dependentes ainda não tem UI própria).
 */
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [pessoaAtiva, setPessoaAtiva] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregarPessoas(usuarioLogado) {
    try {
      const pessoas = await obterPessoasDoUsuario(usuarioLogado.id);
      setPessoaAtiva(pessoas?.[0] ?? null);
    } catch (erro) {
      console.error('Falha ao carregar pessoas do usuário:', erro);
      setPessoaAtiva(null);
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
    setPessoaAtiva(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, pessoaAtiva, carregando, login, registrar, logout }}
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
