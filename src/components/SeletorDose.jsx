// src/components/SeletorDose.jsx

import React from 'react';

const OPCOES_FIXAS = ['1ª dose', '2ª dose', '3ª dose', 'Dose única', 'Reforço'];
const OUTRA = '__outra__';

/**
 * Campo de dose com opções pré-definidas (1ª dose, 2ª dose, Dose
 * única, Reforço) e uma opção "Outra quantidade de doses", que
 * libera um campo numérico pra informar o número da dose.
 *
 * Totalmente controlado pelo valor final (string, ex.: "2ª dose"):
 * reconstrói sozinho qual opção do select deve ficar selecionada
 * a partir desse valor, então reseta junto com o formulário do
 * pai sem precisar de estado próprio sincronizado.
 */
export default function SeletorDose({ value, onChange, required }) {
  const ehFixa = OPCOES_FIXAS.includes(value);
  const opcaoSelecionada = !value ? '' : ehFixa ? value : OUTRA;
  const numero = !ehFixa ? (value.match(/\d+/)?.[0] ?? '') : '';

  function handleSelecionarOpcao(novaOpcao) {
    if (novaOpcao === OUTRA) {
      onChange(numero ? `${numero}ª dose` : '');
    } else {
      onChange(novaOpcao);
    }
  }

  function handleAlterarNumero(novoNumero) {
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
