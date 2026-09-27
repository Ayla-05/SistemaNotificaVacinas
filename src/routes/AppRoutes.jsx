// src/routes/AppRoutes.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Providers de Estado Global
import { AuthProvider } from '../context/AuthContext';
import { DependenteProvider } from '../context/DependenteContext';

// Proteção de rota
import RotaProtegida from '../components/RotaProtegida';

// Layout e Páginas
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Scan from '../pages/Scan';
import Calendario from '../pages/Calendario';

/**
 * Configuração Principal de Rotas da Aplicação Web
 * Utiliza React Router v6 com layout aninhado
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      {/* AuthProvider envolve tudo: /login também precisa saber se já existe sessão */}
      <AuthProvider>
        <DependenteProvider>
          <Routes>

            {/* Rota pública de autenticação (sem sidebar/header) */}
            <Route path="/login" element={<Login />} />

            {/* Rota Pai com o Layout Base (Sidebar + Header), protegida por login */}
            <Route
              path="/"
              element={
                <RotaProtegida>
                  <AppLayout />
                </RotaProtegida>
              }
            >

              {/* Redirecionamento da raiz para /dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Rotas do Usuário Cidadão */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="scan" element={<Scan />} />
              <Route path="calendario" element={<Calendario />} />

              {/* Fallback: redireciona URLs desconhecidas para o Dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Route>
          </Routes>
        </DependenteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
