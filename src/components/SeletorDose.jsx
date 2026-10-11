// src/components/SeletorDose.jsx

import React, { useState } from 'react';

const OPCOES_FIXAS = ['1ª dose', '2ª dose', '3ª dose', 'Dose única', 'Reforço'];
const OUTRA = '__outra__';

/** A partir do valor final (ex.: "2ª dose" ou "4ª dose"), descobre qual opção do select corresponde a ele. */
function opcaoInicialPara(value) {
  if (!value) return '';
  if (OPCOES_FIXAS.includes(value)) return value;
  return OUTRA;
}

/** A partir do valor final, extrai o número já digitado (só é relevante quando a opção é "outra"). */
function numeroInicialPara(value) {
  if (!value || OPCOES_FIXAS.includes(value)) return '';
  return value.match(/\d+/)?.[0] ?? '';
}

/**
 * Campo de dose com opções pré-definidas (1ª dose, 2ª dose, Dose
 * única, Reforço) e uma opção "Outra quantidade de doses", que
 * libera um campo numérico pra informar o número da dose.
 *
 * Mantém a opção escolhida como estado próprio (não dá pra
 * reconstruir com segurança a partir só do valor final: ao
 * escolher "Outra quantidade" antes de digitar o número, o
 * valor final ainda é "", que é indistinguível de "nada
 * selecionado"). O pai pode resetar o campo normalmente
 * trocando a `key` do componente (força ele a remontar).
 */
export default function SeletorDose({ value, onChange, required }) {
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(() => opcaoInicialPara(value));
  const [numero, setNumero] = useState(() => numeroInicialPara(value));

  function handleSelecionarOpcao(novaOpcao) {
    setOpcaoSelecionada(novaOpcao);

    if (novaOpcao === OUTRA) {
      onChange(numero ? `${numero}ª dose` : '');
    } else {
      onChange(novaOpcao);
    }
  }

  function handleAlterarNumero(novoNumero) {
    setNumero(novoNumero);
    onChange(novoNumero ? `${novoNumero}ª dose` : '');
  }

  return (
    <div className="space-y-2">
      <select
        required={required}
        value={opcaoSelecionada}
        onChange={(e) => handleSelecionarOpcao(e.target.value)}
        className="campo-input"
      >
        <option value="">Selecione</option>
        {OPCOES_FIXAS.map((opcao) => (
          <option key={opcao} value={opcao}>{opcao}</option>
        ))}
        <option value={OUTRA}>Outra quantidade de doses</option>
      </select>

      {opcaoSelecionada === OUTRA && (
        <label className="block">
          <span className="text-xs font-semibold text-slate-600 mb-1.5 block">Qtd. (nº da dose)</span>
          <input
            type="number"
            min={1}
            required={required}
            placeholder="Ex.: 4"
            value={numero}
            onChange={(e) => handleAlterarNumero(e.target.value)}
            className="campo-input"
          />
        </label>
      )}
    </div>
  );
}
