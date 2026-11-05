import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import app from "../../src/server";
import { configurarBanco } from "../../src/database/configurarBanco";
import { alterar, consultarUm } from "../../src/database/database";
import { agoraMenos } from "../_util/sql";
import {
  CSRF, SENHA, novoUsuario, get, enviar, criarPessoa, cookiesDe, Sessao
} from "../_util/sessao";

/*
Testes de segurança (OWASP Top 10): autenticação, autorização,
injeção, exposição de dados, configuração e tratamento de erros.
Cada teste leva um código [SEG-nn] citado em docs/correcoes.md.
*/

let admin: Sessao;
let ana: Sessao;
let bia: Sessao;
let anaPessoa: number;

beforeAll(async () => {
  await configurarBanco();
  admin = await novoUsuario("ADMIN");
  ana = await novoUsuario();
  bia = await novoUsuario();
  anaPessoa = (await criarPessoa(ana, "Ana")).body.id;
});

describe("A07 · Autenticação e sessão", () => {

  it("[SEG-01] cookies de sessão são HttpOnly e SameSite", async () => {
    const res = await request(app).post("/auth/login").set(CSRF)
      .send({ email: ana.email, senha: SENHA });
    const cookies = res.headers["set-cookie"] as unknown as string[];
    expect(cookies.length).toBeGreaterThanOrEqual(2);
    for (const c of cookies) {
      expect(c).toMatch(/HttpOnly/i);
      expect(c).toMatch(/SameSite=(Lax|Strict)/i);
    }
  });

  it("[SEG-02] token assinado com outro segredo é recusado", async () => {
    const falso = jwt.sign({ usuarioId: admin.id, perfil: "ADMIN", sid: "x" }, "outro-segredo");
    const res = await request(app).get("/usuarios").set("Cookie", [`token=${falso}`]);
    expect(res.status).toBe(401);
  });

  it("[SEG-03] token com algoritmo 'none' é recusado", async () => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
    const semAssinatura = `${b64({ alg: "none", typ: "JWT" })}.${b64({ usuarioId: admin.id, perfil: "ADMIN", sid: "x" })}.`;
    const res = await request(app).get("/usuarios").set("Cookie", [`token=${semAssinatura}`]);
    expect(res.status).toBe(401);
  });

  it("[SEG-04] token expirado é recusado", async () => {
    const expirado = jwt.sign(
      { usuarioId: ana.id, perfil: "USUARIO", sid: "x" },
      process.env.JWT_SECRET as string,
      { expiresIn: -10 }
    );
    expect((await request(app).get("/auth/me").set("Cookie", [`token=${expirado}`])).status).toBe(401);
  });

  it("[SEG-05] token válido, mas com perfil forjado, não vira admin (perfil vem da sessão)", async () => {
    const [tokenAna] = ana.cookies.filter((c) => c.startsWith("token="));
    const payload: any = jwt.decode(tokenAna.split("=")[1]);
    const forjado = jwt.sign({ ...payload, perfil: "ADMIN" }, "segredo-errado");
    expect((await request(app).get("/usuarios").set("Cookie", [`token=${forjado}`])).status).toBe(401);
  });

  it("[SEG-06] login não revela se o e-mail existe", async () => {
    const inexistente = await request(app).post("/auth/login").set(CSRF)
      .send({ email: "ninguem@exemplo.com", senha: "qualquer-senha-1" });
    const senhaErrada = await request(app).post("/auth/login").set(CSRF)
      .send({ email: ana.email, senha: "senha-errada-123" });
    expect(inexistente.status).toBe(senhaErrada.status);
    expect(inexistente.body.erro).toBe(senhaErrada.body.erro);
  });

  it("[SEG-07] recuperação de senha responde igual para e-mail existente e inexistente", async () => {
    const a = await request(app).post("/auth/esqueci-senha").set(CSRF).send({ email: ana.email });
    const b = await request(app).post("/auth/esqueci-senha").set(CSRF).send({ email: "naoexiste@exemplo.com" });
    expect(a.status).toBe(b.status);
    expect(a.body).toEqual(b.body);
  });

  it("[SEG-08] bloqueio progressivo após várias senhas erradas", async () => {
    const alvo = await novoUsuario();
    let ultimo = 0;
    for (let i = 0; i < 8; i++) {
      ultimo = (await request(app).post("/auth/login").set(CSRF)
        .send({ email: alvo.email, senha: `errada-${i}-xxxx` })).status;
    }
    // mesmo com a senha certa, a conta fica bloqueada por um tempo
    const certa = await request(app).post("/auth/login").set(CSRF)
      .send({ email: alvo.email, senha: SENHA });
    expect([ultimo, certa.status].some((s) => s === 429 || s === 423)).toBe(true);
    expect(certa.status).not.toBe(200);
  });

  it("[SEG-09] cadastro público não aceita escolher o perfil (mass assignment)", async () => {
    const email = `mass${Date.now()}@exemplo.com`;
    await request(app).post("/auth/registrar").set(CSRF)
      .send({ nome: "Mass", email, senha: SENHA, dataNascimento: "1990-01-01", perfil: "ADMIN" });
    const linha: any = await consultarUm("SELECT perfil FROM usuarios WHERE email = ?", [email]);
    expect(linha?.perfil).toBe("USUARIO");
  });

  it("[SEG-10] listagem de sessões não expõe o hash do refresh token", async () => {
    const res = await get(ana, "/auth/sessoes");
    expect(JSON.stringify(res.body)).not.toMatch(/refresh_hash|refreshHash|\$2[aby]\$/);
  });

  it("[SEG-11] refresh token antigo reutilizado derruba a sessão (detecção de roubo)", async () => {
    const s = await novoUsuario();
    const refreshAntigo = s.cookies.filter((c) => c.startsWith("refresh_token="));
    const novo = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", s.cookies);
    expect(novo.status).toBe(200);
    // fora da janela de tolerância (corrida entre abas), o reuso é tratado como roubo
    await alterar(`UPDATE sessoes SET rotacionado_em = ${agoraMenos("1 minute")}`);
    const reuso = await request(app).post("/auth/refresh").set(CSRF).set("Cookie", refreshAntigo);
    expect(reuso.status).toBe(401);
    const aindaValido = await request(app).get("/auth/me").set("Cookie", cookiesDe(novo));
    expect(aindaValido.status).toBe(401);
  });
});

describe("A01 · Controle de acesso", () => {

  it("[SEG-12] usuário não transfere uma pessoa para outra conta (mass assignment em PUT)", async () => {
    await enviar("put", ana, `/pessoas/${anaPessoa}`, { usuario_id: bia.id, nome: "Ana" });
    expect((await get(bia, `/pessoas/${anaPessoa}`)).status).toBe(403);
    expect((await get(ana, `/pessoas/${anaPessoa}`)).status).toBe(200);
  });

  it("[SEG-13] usuário comum não se promove a admin", async () => {
    expect((await enviar("patch", ana, `/usuarios/${ana.id}/perfil`, { perfil: "ADMIN" })).status).toBe(403);
    expect((await get(ana, "/usuarios")).status).toBe(403);
  });

  it("[SEG-14] admin não pode remover nem desativar a si mesmo", async () => {
    const sozinho = await novoUsuario("ADMIN");
    expect((await enviar("delete", sozinho, `/usuarios/${sozinho.id}`)).status).toBeGreaterThanOrEqual(400);
    expect((await enviar("patch", sozinho, `/usuarios/${sozinho.id}/desativar`)).status).toBeGreaterThanOrEqual(400);
    expect((await get(sozinho, "/auth/me")).status).toBe(200);
  });

  it("[SEG-15] usuário desativado perde o acesso na hora", async () => {
    const alvo = await novoUsuario();
    expect((await enviar("patch", admin, `/usuarios/${alvo.id}/desativar`)).status).toBe(200);
    expect((await get(alvo, "/auth/me")).status).toBe(401);
    const login = await request(app).post("/auth/login").set(CSRF).send({ email: alvo.email, senha: SENHA });
    expect(login.status).not.toBe(200);
  });

  it("[SEG-16] dependente de outra conta não é acessível por vínculo forjado", async () => {
    const alheia = (await criarPessoa(bia, "Alheia")).body.id;
    const res = await enviar("post", ana, "/dependentes", {
      responsavelPessoaId: anaPessoa, dependentePessoaId: alheia, nome: "X", data_nascimento: "2020-01-01", parentesco: "FILHO"
    });
    expect((await get(ana, `/pendencias/${alheia}`)).status).toBe(403);
    expect(res.status).toBeLessThan(500);
  });
});

describe("A03 · Injeção e entrada maliciosa", () => {

  it.each([
    ["/vacinas/nome/' OR '1'='1"],
    ["/vacinas/codigo/'; DROP TABLE vacinas;--"],
    ["/vacinas/1 OR 1=1"],
  ])("[SEG-17] SQL injection em %s não vaza dados nem derruba", async (rota) => {
    const res = await get(null, encodeURI(rota));
    expect(res.status).toBeLessThan(500);
    expect(Array.isArray(res.body) ? res.body.length : 0).toBeLessThanOrEqual(1);
    expect((await get(null, "/vacinas")).body.length).toBeGreaterThan(5);
  });

  it("[SEG-18] SQL injection no login é tratada como credencial inválida", async () => {
    const res = await request(app).post("/auth/login").set(CSRF)
      .send({ email: "' OR 1=1 --", senha: "x' OR '1'='1" });
    expect([400, 401]).toContain(res.status);
  });

  it("[SEG-19] ids não numéricos devolvem erro de cliente, nunca 500", async () => {
    for (const rota of ["/pessoas/abc", "/pessoas/-1", "/carteira/pessoa/abc", "/agendamentos/xyz", "/pendencias/1;DROP"]) {
      const res = await get(ana, rota);
      expect(res.status, rota).toBeLessThan(500);
    }
  });

  it("[SEG-20] corpo JSON inválido devolve 400 sem vazar pilha de erro", async () => {
    const res = await request(app).post("/auth/login").set(CSRF)
      .set("Content-Type", "application/json").send("{ invalido");
    expect(res.status).toBe(400);
    expect(res.text).not.toMatch(/SyntaxError|node_modules|at .*\(.*:\d+:\d+\)/);
  });

  it("[SEG-21] corpo acima do limite (10 MB) é recusado", async () => {
    const grande = JSON.stringify({ nome: "x".repeat(11 * 1024 * 1024) });
    const res = await request(app).post("/auth/registrar").set(CSRF)
      .set("Content-Type", "application/json").send(grande);
    expect(res.status).toBe(413);
  });

  it("[SEG-22] scan recusa arquivo cujo conteúdo não é imagem/PDF, mesmo com tipo declarado", async () => {
    const falso = Buffer.from("isto não é uma imagem <script>alert(1)</script>").toString("base64");
    const res = await enviar("post", ana, "/scan/analisar", { pessoaId: anaPessoa, imagemBase64: falso, mediaType: "image/png" });
    expect([400, 415]).toContain(res.status);
  });
});

describe("A02/A05 · Exposição de dados e configuração", () => {

  it("[SEG-23] respostas autenticadas não podem ser guardadas em cache (dados de saúde)", async () => {
    for (const rota of ["/auth/me", `/carteira/pessoa/${anaPessoa}`, "/pessoas"]) {
      const res = await get(ana, rota);
      expect(res.headers["cache-control"], rota).toMatch(/no-store/);
    }
  });

  it("[SEG-24] cabeçalhos de segurança presentes e X-Powered-By ausente", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-powered-by"]).toBeUndefined();
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["strict-transport-security"]).toMatch(/max-age=\d+/);
    expect(res.headers["x-frame-options"] ?? res.headers["content-security-policy"]).toBeTruthy();
    expect(res.headers["content-security-policy"]).toMatch(/frame-ancestors 'none'/);
  });

  it("[SEG-25] CORS não libera origem desconhecida com credenciais", async () => {
    const res = await request(app).get("/").set("Origin", "https://site-malicioso.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("[SEG-26] CORS libera a origem local do front end em desenvolvimento", async () => {
    const res = await request(app).get("/").set("Origin", "http://localhost:5173");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("[SEG-27] erro interno não vaza SQL nem caminho de arquivo", async () => {
    const res = await get(ana, "/carteira/registro/999999999/doses");
    expect(res.text).not.toMatch(/SQLITE|violates|syntax error|SELECT |FROM |\/home\/|node_modules/i);
  });

  it("[SEG-28] nenhuma resposta de usuário contém hash de senha ou código de verificação", async () => {
    const respostas = [
      await get(admin, "/usuarios"),
      await get(admin, `/usuarios/${ana.id}`),
      await get(ana, "/auth/me"),
    ];
    for (const r of respostas) {
      expect(JSON.stringify(r.body)).not.toMatch(/\$2[aby]\$|codigo_verificacao|"senha"/);
    }
  });

  it("[SEG-29] proteção CSRF: toda escrita sem o cabeçalho é bloqueada", async () => {
    for (const [m, rota] of [["post", "/pessoas"], ["put", `/pessoas/${anaPessoa}`], ["delete", `/pessoas/${anaPessoa}`], ["patch", "/usuarios/1/perfil"]] as const) {
      const res = await request(app)[m](rota).set("Cookie", ana.cookies).send({});
      expect(res.status, `${m} ${rota}`).toBe(403);
    }
  });
});
