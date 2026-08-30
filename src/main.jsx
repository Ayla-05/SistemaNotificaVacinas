// src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Ponto de entrada da aplicação React
 * Renderiza o componente raiz no elemento com id 'root'
 * 
 * StrictMode ativo para detectar problemas em desenvolvimento
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);