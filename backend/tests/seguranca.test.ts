import { describe, it, expect } from "vitest";

import {
  calcularBloqueioMinutos,
  detectarTipoArquivoCarteirinha,
  detectarTipoImagem,
  gerarCodigoNumerico,
  gerarTokenOpaco,
  hashToken
} from "../src/utils/seguranca";

describe("calcularBloqueioMinutos", () => {

  it("não bloqueia nas 4 primeiras falhas", () => {
    expect([0, 1, 2, 3, 4].map(calcularBloqueioMinutos))
      .toEqual([0, 0, 0, 0, 0]);
  });

  it("dobra o bloqueio a cada falha a partir da 5ª", () => {
    expect([5, 6, 7, 8].map(calcularBloqueioMinutos))
      .toEqual([1, 2, 4, 8]);
  });

  it("tem teto de 15 minutos", () => {
    expect(calcularBloqueioMinutos(9)).toBe(15);
    expect(calcularBloqueioMinutos(500)).toBe(15);
  });

});

describe("detectarTipoImagem", () => {

  it("reconhece JPEG, PNG e WEBP pelo conteúdo", () => {
    expect(
      detectarTipoImagem(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00]))
    ).toBe("image/jpeg");

    expect(
      detectarTipoImagem(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00])
      )
    ).toBe("image/png");

    expect(
      detectarTipoImagem(Buffer.from("RIFF\0\0\0\0WEBPVP8 "))
    ).toBe("image/webp");
  });

  it("rejeita arquivos que se passam por imagem", () => {
    expect(detectarTipoImagem(Buffer.from("<?php echo 1; ?>"))).toBeNull();
    expect(detectarTipoImagem(Buffer.from("%PDF-1.7"))).toBeNull();
    expect(detectarTipoImagem(Buffer.alloc(0))).toBeNull();
  });

});

describe("detectarTipoArquivoCarteirinha", () => {

  it("aceita PDF além das imagens", () => {
    expect(detectarTipoArquivoCarteirinha(Buffer.from("%PDF-1.4\n..."))).toBe("application/pdf");
    expect(detectarTipoArquivoCarteirinha(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
  });

  it("rejeita o resto", () => {
    expect(detectarTipoArquivoCarteirinha(Buffer.from("MZ executavel"))).toBeNull();
    expect(detectarTipoArquivoCarteirinha(Buffer.from("%PD"))).toBeNull();
  });

});

describe("tokens", () => {

  it("gera tokens únicos e o hash é determinístico", () => {
    const a = gerarTokenOpaco();
    const b = gerarTokenOpaco();

    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThanOrEqual(43);
    expect(hashToken(a)).toBe(hashToken(a));
    expect(hashToken(a)).not.toBe(hashToken(b));
    expect(hashToken(a)).not.toContain(a);
  });

  it("gera código de verificação com 6 dígitos", () => {
    for (let i = 0; i < 200; i++) {
      expect(gerarCodigoNumerico()).toMatch(/^[1-9]\d{5}$/);
    }
  });

});
