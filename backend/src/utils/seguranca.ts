import crypto from "crypto";

/*
==================================================
SEGURANÇA (FUNÇÕES PURAS)
==================================================

Responsabilidades:

- Gerar e fazer hash de tokens opacos (refresh,
  redefinição de senha)
- Calcular o bloqueio progressivo de conta
- Detectar o tipo real de uma imagem pelos
  primeiros bytes (magic bytes)

NÃO é responsável por:

- Persistência
- Requisições HTTP
*/

/*
Token aleatório de 256 bits, seguro para cookie e URL.
Só o hash (hashToken) vai para o banco: se o banco
vazar, os tokens não podem ser reaproveitados.
*/
export function gerarTokenOpaco(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/*
Código numérico de verificação, com fonte de
aleatoriedade criptográfica.
*/
export function gerarCodigoNumerico(): string {
  return String(crypto.randomInt(100000, 1000000));
}

/*
==================================================
BLOQUEIO PROGRESSIVO DE CONTA
==================================================

Até 4 falhas seguidas: sem bloqueio.
A partir da 5ª: 1, 2, 4, 8 minutos... com teto de 15.

O teto existe porque um bloqueio longo permitiria que
um atacante trancasse a conta de outra pessoa de
propósito (negação de serviço).
*/
export const FALHAS_ANTES_DO_BLOQUEIO = 5;
export const BLOQUEIO_MAXIMO_MINUTOS = 15;

export function calcularBloqueioMinutos(
  falhasConsecutivas: number
): number {

  if (falhasConsecutivas < FALHAS_ANTES_DO_BLOQUEIO) {
    return 0;
  }

  const expoente =
    falhasConsecutivas - FALHAS_ANTES_DO_BLOQUEIO;

  return Math.min(
    2 ** expoente,
    BLOQUEIO_MAXIMO_MINUTOS
  );

}

/*
==================================================
TIPO REAL DE IMAGEM (MAGIC BYTES)
==================================================

O "mediaType" enviado pelo cliente não é confiável.
Aqui o tipo é deduzido do conteúdo.
*/
export type TipoImagem =
  | "image/jpeg"
  | "image/png"
  | "image/webp";

export type TipoArquivoCarteirinha =
  | TipoImagem
  | "application/pdf";

export function detectarTipoImagem(
  bytes: Buffer
): TipoImagem | null {

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  const assinaturaPng = [
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a
  ];

  if (
    bytes.length >= 8 &&
    assinaturaPng.every((b, i) => bytes[i] === b)
  ) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;

}

/*
Igual a detectarTipoImagem, mas também aceita PDF
(assinatura "%PDF-"), como o da carteira do Meu SUS Digital.
*/
export function detectarTipoArquivoCarteirinha(
  bytes: Buffer
): TipoArquivoCarteirinha | null {

  if (
    bytes.length >= 5 &&
    bytes.toString("ascii", 0, 5) === "%PDF-"
  ) {
    return "application/pdf";
  }

  return detectarTipoImagem(bytes);

}
