import { adicionarDias, adicionarMeses } from "./proximasDoses";

/*
==================================================
FREQUÊNCIA DE AVISO (FUNÇÕES PURAS)
==================================================

Responsabilidades:

- Definir as frequências que a pessoa pode escolher para receber
  avisos de vacina por e-mail
- Decidir se já passou tempo suficiente para enviar o próximo resumo

NÃO é responsável por:

- Enviar e-mail (NotificacaoService)
- Calcular as doses (ProximasDosesService)

Frequências:

- UMA_VEZ (padrão): um aviso por dose, quando ela está chegando
- DIARIA / SEMANAL / MENSAL: um resumo nesse ritmo, enquanto houver
  dose atrasada, disponível ou chegando
- DESATIVADO: nenhum aviso de dose
*/

export const FREQUENCIAS_AVISO = [
  "UMA_VEZ",
  "DIARIA",
  "SEMANAL",
  "MENSAL",
  "DESATIVADO"
] as const;

export type FrequenciaAviso = (typeof FREQUENCIAS_AVISO)[number];

export const FREQUENCIA_PADRAO: FrequenciaAviso = "UMA_VEZ";

export function frequenciaValida(
  valor: unknown
): valor is FrequenciaAviso {

  return FREQUENCIAS_AVISO.includes(valor as FrequenciaAviso);

}

/* Frequências que mandam um resumo periódico (as demais não). */
export function ehResumoPeriodico(
  frequencia: FrequenciaAviso
): boolean {

  return (
    frequencia === "DIARIA" ||
    frequencia === "SEMANAL" ||
    frequencia === "MENSAL"
  );

}

/*
Já passou tempo para o próximo resumo?

- diária: em dia diferente do último envio
- semanal: 7 dias depois do último envio
- mensal: 1 mês depois do último envio (31/01 -> 28/02)

Sem envio anterior, pode enviar. As datas são "AAAA-MM-DD".
*/
export function deveEnviarResumo(
  frequencia: FrequenciaAviso,
  ultimoResumo: string | null,
  hoje: string
): boolean {

  if (!ehResumoPeriodico(frequencia)) {
    return false;
  }

  if (!ultimoResumo) {
    return true;
  }

  const proximo =
    frequencia === "DIARIA"
      ? adicionarDias(ultimoResumo, 1)
      : frequencia === "SEMANAL"
        ? adicionarDias(ultimoResumo, 7)
        : adicionarMeses(ultimoResumo, 1);

  return hoje >= proximo;

}
