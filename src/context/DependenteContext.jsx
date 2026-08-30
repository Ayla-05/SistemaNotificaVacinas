// src/context/DependenteContext.jsx

import React, { createContext, useState, useContext } from 'react';

// Criação do Contexto
const DependenteContext = createContext(null);

// Dados mocados para simular o Firestore
// Em produção, estes dados viriam de uma consulta ao Firebase
export const dependentesMock = [
  { 
    id: 'dep_1', 
    nome: 'Ana (Você)', 
    idade: '34 anos', 
    avatar: '👩', 
    parentesco: 'titular',
    dataNascimento: '1992-05-15'
  },
  { 
    id: 'dep_2', 
    nome: 'Leo', 
    idade: '3 anos', 
    avatar: '👦', 
    parentesco: 'filho',
    dataNascimento: '2023-03-10'
  },
  { 
    id: 'dep_3', 
    nome: 'Sofia', 
    idade: '7 anos', 
    avatar: '👧', 
    parentesco: 'filha',
    dataNascimento: '2019-08-22'
  }
];

/**
 * Provider do Contexto de Dependente
 * Envolve toda a aplicação para fornecer o estado global
 */
export function DependenteProvider({ children }) {
  // Define o titular (Ana) como dependente padrão
  const [dependenteAtivo, setDependenteAtivo] = useState(dependentesMock[0]);

  /**
   * Função para trocar o dependente ativo pelo ID
   * @param {string} id - ID do dependente
   */
  const selecionarDependentePorId = (id) => {
    const encontrado = dependentesMock.find((d) => d.id === id);
    if (encontrado) {
      setDependenteAtivo(encontrado);
    }
  };

  return (
    <DependenteContext.Provider 
      value={{ 
        dependenteAtivo,          // Objeto do dependente selecionado
        setDependenteAtivo,       // Função para atualizar diretamente
        selecionarDependentePorId, // Função para selecionar por ID
        dependentesMock           // Lista completa de dependentes
      }}
    >
      {children}
    </DependenteContext.Provider>
  );
}

/**
 * Hook personalizado para consumir o contexto
 * Garante que o contexto esteja disponível antes de usar
 */
export const useDependente = () => {
  const context = useContext(DependenteContext);
  if (!context) {
    throw new Error('useDependente deve ser usado dentro de um DependenteProvider');
  }
  return context;
};