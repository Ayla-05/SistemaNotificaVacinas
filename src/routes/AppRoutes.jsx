// src/routes/AppRoutes.jsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Provider de Estado Global
import { DependenteProvider } from '../context/DependenteContext';

// Layout e Páginas
import AppLayout from '../components/layout/AppLayout';
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
      {/* Provider de Dependente envolve toda a aplicação */}
      <DependenteProvider>
        <Routes>
          {/* Rota Pai com o Layout Base (Sidebar + Header) */}
          <Route path="/" element={<AppLayout />}>
            
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
    </BrowserRouter>
  );
}