import { describe, it, expect, beforeAll, vi } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative as relativoDe, dirname, resolve, sep } from "node:path";

/* Caminhos sempre com "/" (no Windows o node usa "\\", e os testes comparam por "/"). */
const posix = (f: string) => f.split(sep).join("/");
const relative = (de: string, para: string) => relativoDe(de, para).split(sep).join("/");
import { execSync } from "node:child_process";
import request from "supertest";

vi.mock("express-rate-limit", () => ({
  default: () => (_req: any, _res: any, next: any) => next(),
  ipKeyGenerator: (ip: string) => ip
}));

import app from "../../src/server";
import { configurarBanco } from "../../src/database/configurarBanco";
import { novoUsuario, CSRF, Sessao } from "../_util/sessao";

/*
Testes de arquitetura: verificam por análise estática do código
(e por varredura de todas as rotas) as regras de projeto —
camadas, autenticação, SQL parametrizado e higiene de segredos.
Cada teste leva um código [ARQ-nn] citado em docs/correcoes.md.
*/

const RAIZ = resolve(__dirname, "../..");
const SRC = join(RAIZ, "src");

function arquivos(pasta: string): string[] {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    return statSync(caminho).isDirectory()
      ? arquivos(caminho)
      : caminho.endsWith(".ts") ? [caminho] : [];
  });
}

const TODOS = arquivos(SRC);
const camada = (c: string) => TODOS.filter((f) => relative(SRC, f).startsWith(c + "/"));
const fonte = (f: string) => readFileSync(f, "utf8");
const importsDe = (f: string) =>
  [...fonte(f).matchAll(/(?:import|export)[^;]*?from\s+["']([^"']+)["']/g)].map((m) => m[1]);

function violacoes(arqs: string[], proibido: RegExp): string[] {
  return arqs.flatMap((f) =>
    importsDe(f).filter((i) => proibido.test(i)).map((i) => `${relative(SRC, f)} importa ${i}`)
  );
}

describe("Camadas (rotas → controllers → serviços → repositórios → banco)", () => {

  it("[ARQ-01] controllers não acessam repositórios nem o banco", () => {
    expect(violacoes(camada("controllers"), /repositories|database/)).toEqual([]);
  });

  it("[ARQ-02] serviços não dependem de Express nem de controllers/rotas", () => {
    expect(violacoes(camada("services"), /^express$|controllers|routes/)).toEqual([]);
  });

  it("[ARQ-03] repositórios não dependem de serviços, controllers, rotas ou Express", () => {
    expect(violacoes(camada("repositories"), /services|controllers|routes|^express$/)).toEqual([]);
  });

  it("[ARQ-04] rotas só usam controllers e middlewares (nada de banco/repositório/serviço)", () => {
    expect(violacoes(camada("routes"), /repositories|database|services/)).toEqual([]);
  });

  it("[ARQ-05] utilitários são puros (sem banco, repositório, serviço ou Express)", () => {
    expect(violacoes(camada("utils"), /repositories|database|services|controllers|^express$/)).toEqual([]);
  });

  it("[ARQ-06] só repositórios e o módulo de banco falam com o driver do PostgreSQL", () => {
    const fora = TODOS.filter((f) => {
      const c = relative(SRC, f).split("/")[0];
      return !["repositories", "database"].includes(c) && /from ["']pg["']|\bpool\.(query|connect)\(/.test(fonte(f));
    });
    expect(fora.map((f) => relative(SRC, f))).toEqual([]);
  });

  it("[ARQ-07] não há dependências circulares entre módulos", () => {
    const grafo = new Map<string, string[]>();
    for (const f of TODOS) {
      grafo.set(f, importsDe(f).filter((i) => i.startsWith(".")).map((i) => resolve(dirname(f), i) + ".ts")
        .filter((p) => grafo.has(p) || TODOS.includes(p)));
    }
    const ciclos: string[] = [];
    const estado = new Map<string, 1 | 2>();
    const pilha: string[] = [];
    const visitar = (n: string) => {
      estado.set(n, 1); pilha.push(n);
      for (const v of grafo.get(n) ?? []) {
        if (estado.get(v) === 1) ciclos.push([...pilha.slice(pilha.indexOf(v)), v].map((x) => relative(SRC, x)).join(" → "));
        else if (!estado.has(v)) visitar(v);
      }
      pilha.pop(); estado.set(n, 2);
    };
    for (const n of grafo.keys()) if (!estado.has(n)) visitar(n);
    expect(ciclos).toEqual([]);
  });

  it("[ARQ-08] o código compila em modo estrito (tsc --noEmit)", () => {
    expect(() => execSync("npx tsc --noEmit", { cwd: RAIZ, stdio: "pipe" })).not.toThrow();
  }, 60000);
});

describe("SQL e segredos", () => {

  it("[ARQ-09] consultas SQL usam parâmetros (sem interpolar valores com ${})", () => {
    const suspeitos = [...camada("repositories"), ...camada("database")].flatMap((f) =>
      [...fonte(f).matchAll(/`([^`]*\b(?:SELECT|INSERT|UPDATE|DELETE)\b[^`]*)`/gi)]
        .filter((m) => /\$\{/.test(m[1]))
        // permitido: trechos fixos escolhidos por código (ternário de literais), lista de "?"
        // e a constante AGORA_UTC (expressão fixa de data, sem dado do usuário)
        .filter((m) => [...m[1].matchAll(/\$\{([^}]*)\}/g)].some((x) =>
          !(/^[^"]*"[^"]*"\s*:\s*"[^"]*"$/.test(x[1].trim()) ||
            /\.map\(\(\) => "\?"\)/.test(x[1]) ||
            /^AGORA_UTC$/.test(x[1].trim()))))
        .map((m) => `${relative(SRC, f)}: ${m[1].trim().slice(0, 60)}`)
    );
    expect(suspeitos).toEqual([]);
  });

  it("[ARQ-10] não há segredos nem chaves de API gravados no código", () => {
    const padroes = /(sk-ant-[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:senha|password|secret|api_?key|token)\s*[:=]\s*["'][^"'\s]{8,}["'])/i;
    const achados = TODOS.filter((f) => !f.includes("/seeds/")).flatMap((f) =>
      fonte(f).split("\n").map((l, i) => ({ f, i, l })).filter(({ l }) => padroes.test(l) && !/process\.env|exemplo|example|placeholder/i.test(l))
        .map(({ f, i }) => `${relative(SRC, f)}:${i + 1}`)
    );
    expect(achados).toEqual([]);
  });

  it("[ARQ-11] o log não imprime senha, token ou código de verificação", () => {
    const achados = TODOS.flatMap((f) =>
      [...fonte(f).matchAll(/console\.(?:log|info|warn|error)\(([^;]*?)\);/gs)]
        .filter((m) => /\b(senha|password|refreshToken|token|codigo)\b(?!\s*[:"'`])/i.test(m[1].replace(/"[^"]*"|'[^']*'|`[^`]*`/g, "")))
        .map((m) => `${relative(SRC, f)}: ${m[0].slice(0, 70).replace(/\s+/g, " ")}`)
    );
    expect(achados).toEqual([]);
  });

  it("[ARQ-12] o arquivo do banco e variáveis de ambiente não estão versionados", () => {
    const rastreados = execSync("git ls-files", { cwd: RAIZ }).toString().split("\n");
    expect(rastreados.filter((f) => /\.db(-wal|-shm)?$|(^|\/)\.env$/.test(f))).toEqual([]);
  });
});

/* ----- varredura de todas as rotas declaradas nos arquivos de rota ----- */

type Rota = { metodo: "get" | "post" | "put" | "patch" | "delete"; caminho: string; prefixo: string };

const PREFIXOS: Record<string, string> = {
  authRoutes: "/auth", usuarioRoutes: "/usuarios", pessoaRoutes: "/pessoas", vacinaRoutes: "/vacinas",
  carteiraRoutes: "/carteira", calendarioRoutes: "/calendario", regraVacinalRoutes: "/regras-vacinais",
  agendamentoRoutes: "/agendamentos", vacinalRoutes: "/pendencias", scanRoutes: "/scan",
  dependenteRoutes: "/dependentes", grupoEspecialPessoaRoutes: "/grupos-especiais"
};

function rotas(): Rota[] {
  return camada("routes").flatMap((f) => {
    const nome = relative(join(SRC, "routes"), f).replace(".ts", "");
    return [...fonte(f).matchAll(/router\.(get|post|put|patch|delete)\(\s*["']([^"']*)["']/g)].map((m) => ({
      metodo: m[1] as Rota["metodo"],
      caminho: (PREFIXOS[nome] + (m[2] === "/" ? "" : m[2])).replace(/:[A-Za-z]+/g, "1"),
      prefixo: PREFIXOS[nome]
    }));
  });
}

/* rotas intencionalmente públicas */
const PUBLICAS = [
  /^get \/$/, /^get \/vacinas/,
  /^post \/auth\/(registrar|confirmar-email|reenviar-codigo|login|logout|refresh|esqueci-senha|redefinir-senha)$/
];
const ADMIN_PREFIXOS = ["/usuarios", "/regras-vacinais"];
/* escritas em catálogos: só admin, embora a leitura seja aberta */
const ESCRITA_ADMIN = ["/vacinas", "/calendario"];

describe("Cobertura de segurança de TODAS as rotas", () => {
  let comum: Sessao;
  const lista = rotas();

  beforeAll(async () => {
    await configurarBanco();
    comum = await novoUsuario("USUARIO", "arq");
  });

  it("[ARQ-13] o mapeamento encontrou as rotas do sistema", () => {
    expect(lista.length).toBeGreaterThan(70);
  });

  it("[ARQ-14] toda rota não pública exige login (401 sem cookie)", async () => {
    const falhas: string[] = [];
    for (const r of lista) {
      const id = `${r.metodo} ${r.caminho}`;
      if (PUBLICAS.some((p) => p.test(id))) continue;
      const res = await request(app)[r.metodo](r.caminho).set(CSRF).send({});
      if (res.status !== 401) falhas.push(`${id} → ${res.status}`);
    }
    expect(falhas).toEqual([]);
  }, 60000);

  it("[ARQ-15] rotas administrativas recusam usuário comum (403)", async () => {
    const falhas: string[] = [];
    for (const r of lista.filter((x) => ADMIN_PREFIXOS.includes(x.prefixo) ||
      (ESCRITA_ADMIN.includes(x.prefixo) && x.metodo !== "get"))) {
      const res = await request(app)[r.metodo](r.caminho).set(CSRF).set("Cookie", comum.cookies).send({});
      if (res.status !== 403) falhas.push(`${r.metodo} ${r.caminho} → ${res.status}`);
    }
    expect(falhas).toEqual([]);
  }, 60000);

  it("[ARQ-16] toda rota de escrita exige o cabeçalho anti-CSRF (403 sem ele)", async () => {
    const falhas: string[] = [];
    for (const r of lista.filter((x) => x.metodo !== "get")) {
      const res = await request(app)[r.metodo](r.caminho).set("Cookie", comum.cookies).send({});
      if (res.status !== 403) falhas.push(`${r.metodo} ${r.caminho} → ${res.status}`);
    }
    expect(falhas).toEqual([]);
  }, 60000);

  it("[ARQ-17] nenhuma rota responde 500 a entrada vazia de usuário autenticado", async () => {
    const falhas: string[] = [];
    for (const r of lista.filter((x) => !(x.metodo === "post" && x.prefixo === "/auth"))) {
      const res = await request(app)[r.metodo](r.caminho).set(CSRF).set("Cookie", comum.cookies).send({});
      if (res.status >= 500) falhas.push(`${r.metodo} ${r.caminho} → ${res.status}`);
    }
    expect(falhas).toEqual([]);
  }, 60000);
});
