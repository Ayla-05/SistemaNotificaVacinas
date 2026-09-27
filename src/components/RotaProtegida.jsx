// src/components/RotaProtegida.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Bloqueia o acesso às rotas internas do sistema para quem não
 * está autenticado, redirecionando para /login.
 *
 * Enquanto a sessão ainda está sendo verificada (chamada a /auth/me
 * em andamento), mostra um loading em vez de redirecionar direto —
 * senão todo refresh de página jogaria o usuário logado de volta
 * para o login por uma fração de segundo.
 */
export default function RotaProtegida({ children }) {
  const { usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
