/*
Gera docs/relatorio-testes.md a partir da execução da suíte.

Uso:  npm run test:relatorio

Roda o vitest com o reporter JSON, agrupa os resultados por
categoria (pasta em tests/) e escreve o relatório em Markdown,
com resumo, tabela por teste e lista de falhas.
*/
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const BACKEND = resolve(AQUI, "../..");
const DESTINO = resolve(BACKEND, "../docs/relatorio-testes.md");

const CATEGORIAS = {
  unitarios: ["Unitários", "Funções puras: extrator da carteirinha, faixa etária, próximas doses, frequência de aviso."],
  integracao: ["Integração", "Módulos isolados, cada arquivo em um schema PostgreSQL próprio: autenticação/sessões, avisos de dose, leitura (scan)."],
  funcional: ["Funcional (ponta a ponta)", "App completo (CSRF, login, perfis, posse): usuários, pessoas, vacinas, carteira, agendamentos, dependentes, cascata e integridade do banco (PostgreSQL)."],
  logica: ["Lógica de negócio", "Validação de entradas, idade e datas-limite (fuso, ano bissexto), pendências e próximas doses conforme as doses registradas, concorrência e idempotência."],
  cenarios: ["Cenários e jornadas", "38 pessoas de idades, grupos e históricos diferentes (fronteiras do calendário, gestantes) e 12 jornadas completas de usuário, do cadastro ao aviso automático."],
  seguranca: ["Segurança", "OWASP Top 10: sessão/JWT, controle de acesso, injeção, exposição de dados, cabeçalhos, CORS, erros."],
  arquitetura: ["Arquitetura", "Camadas, ciclos, SQL parametrizado, segredos e varredura de TODAS as rotas (login, perfil, CSRF)."]
};

const pasta = mkdtempSync(join(tmpdir(), "relatorio-"));
const saida = join(pasta, "resultado.json");

const exec = spawnSync(
  "npx", ["vitest", "run", "--reporter=json", `--outputFile=${saida}`],
  { cwd: BACKEND, encoding: "utf8" }
);

let json;
try { json = JSON.parse(readFileSync(saida, "utf8")); }
catch { console.error(exec.stdout, exec.stderr); process.exit(2); }

const linhas = [];
const porCategoria = {};

for (const arquivo of json.testResults) {
  const rel = relative(join(BACKEND, "tests"), arquivo.name);
  const categoria = rel.split("/")[0];
  (porCategoria[categoria] ??= []).push({ arquivo: rel, testes: arquivo.assertionResults });
}

const todos = json.testResults.flatMap((a) => a.assertionResults);
const total = todos.length;
const ok = todos.filter((t) => t.status === "passed").length;
const falhas = todos.filter((t) => t.status === "failed");
const ignorados = total - ok - falhas.length;
const duracao = (json.testResults.reduce((s, a) => s + (a.endTime - a.startTime), 0) / 1000).toFixed(1);

const agora = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { cwd: BACKEND }).toString().trim(); } catch { return "n/d"; } })();

linhas.push("# Relatório de testes — Notifica Vacinas", "");
linhas.push(`Gerado em ${agora} (America/São_Paulo) · commit \`${commit}\` · Node ${process.version}`, "");
linhas.push("Gerado por `npm run test:relatorio` (backend). Não edite à mão: rode o comando para atualizar.", "");
linhas.push("## Resumo", "");
linhas.push(`**${ok} de ${total} testes passaram** · ${falhas.length} falha(s) · ${ignorados} ignorado(s) · ${duracao} s de execução.`, "");
linhas.push("| Categoria | Arquivos | Testes | Passaram | Falharam |", "|---|---:|---:|---:|---:|");
for (const [chave, [nome]] of Object.entries(CATEGORIAS)) {
  const grupo = porCategoria[chave] ?? [];
  const t = grupo.flatMap((g) => g.testes);
  linhas.push(`| ${nome} | ${grupo.length} | ${t.length} | ${t.filter((x) => x.status === "passed").length} | ${t.filter((x) => x.status === "failed").length} |`);
}
linhas.push(`| **Total** | **${json.testResults.length}** | **${total}** | **${ok}** | **${falhas.length}** |`, "");

linhas.push("## Falhas", "");
if (falhas.length === 0) {
  linhas.push("Nenhuma falha nesta execução. As falhas encontradas durante o desenvolvimento e suas correções estão em [`correcoes.md`](correcoes.md).", "");
} else {
  for (const f of falhas) {
    linhas.push(`- **${f.fullName}**`, "  ```", ...String(f.failureMessages?.[0] ?? "").split("\n").slice(0, 6).map((l) => "  " + l), "  ```");
  }
  linhas.push("");
}

linhas.push("## Resultado por categoria", "");
for (const [chave, [nome, descricao]] of Object.entries(CATEGORIAS)) {
  const grupo = porCategoria[chave];
  if (!grupo) continue;
  linhas.push(`### ${nome}`, "", descricao, "");
  for (const { arquivo, testes } of grupo.sort((a, b) => a.arquivo.localeCompare(b.arquivo))) {
    linhas.push(`**\`tests/${arquivo}\`**`, "", "| | Teste | Tempo |", "|:-:|---|---:|");
    for (const t of testes) {
      const nomeTeste = [...t.ancestorTitles, t.title].join(" › ").replace(/\|/g, "\\|");
      linhas.push(`| ${t.status === "passed" ? "✅" : t.status === "failed" ? "❌" : "⏭"} | ${nomeTeste} | ${t.duration != null ? Math.round(t.duration) + " ms" : "-"} |`);
    }
    linhas.push("");
  }
}

linhas.push("## Não coberto por esta suíte", "",
  "- Leitura real por OCR (serviço Python/Docling) e envio real de e-mail: usados apenas com simulações.",
  "- Interface React (sem framework de teste de front end configurado).",
  "- Auditoria de vulnerabilidades de dependências (`npm audit`), que exige rede.",
  "- Teste de carga e de desempenho sob volume real de dados.", "");

writeFileSync(DESTINO, linhas.join("\n"));
console.log(`Relatório escrito em ${relative(process.cwd(), DESTINO)}: ${ok}/${total} passaram, ${falhas.length} falha(s).`);
process.exit(falhas.length ? 1 : 0);
