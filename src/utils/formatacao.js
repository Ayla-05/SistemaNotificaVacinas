// src/utils/formatacao.js
//
// Textos usados em mais de uma tela (Dashboard e Carteira) para dizer a mesma coisa do mesmo jeito.

/** "10/02/2027" a partir de "2027-02-10". */
export function formatarData(iso) {
  if (!iso) return '';
  const [ano, mes, dia] = iso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Texto do prazo de uma dose: atrasada, disponível agora ou data prevista. */
export function descreverPrazo(item) {
  if (item.status === 'ATRASADA') {
    const dias = Math.abs(item.dias_para_vencer);
    return `Atrasada há ${dias} dia${dias === 1 ? '' : 's'} (prevista para ${formatarData(item.data_prevista)})`;
  }

  if (item.status === 'DISPONIVEL') {
    return 'Pode tomar agora';
  }

  if (item.dias_para_vencer === 0) {
    return 'Vence hoje';
  }

  return `Prevista para ${formatarData(item.data_prevista)} (em ${item.dias_para_vencer} dias)`;
}

/** Local da aplicação, guardado na observação da dose como "Aplicada em: UBS X". */
export function localDaDose(dose) {
  const m = /^Aplicada em:\s*(.+)$/i.exec(dose?.observacao ?? '');
  return m ? m[1].trim() : null;
}

/** Nome da dose: "3ª dose de reforço", "Reforço", ou "Dose 2" quando só há o número. */
export function nomeDaDose(dose) {
  return dose?.tipo?.trim() || `Dose ${dose?.numero_dose}`;
}
