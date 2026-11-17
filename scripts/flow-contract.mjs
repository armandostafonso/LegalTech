import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const source = fs.readFileSync("assets/flow-core.js", "utf8");
const ctx = vm.createContext({window: {}});
vm.runInContext(source, ctx, {filename: "assets/flow-core.js"});
const core = ctx.window.LegalTechFlowCore;
assert.equal(core.VERSION, "1.0");
for (const type of Object.keys(core.TYPES)) {
  const p = core.buildPlan({type});
  assert.equal(p.type, type);
  assert.ok(p.checks.length >= 9, "Checklist insuficiente: " + type);
  assert.equal(new Set(p.checks.map(x => x.id)).size, p.checks.length, "IDs repetidos: " + type);
  assert.ok(p.tools.length >= 2);
  assert.ok(p.tools.every(x => /^[a-z-]+\.html$/.test(x.url)));
  assert.ok(core.report(p, []).includes("não executa notificações"));
}
const p = core.buildPlan({
  type: "notificacao",
  reference: "Exemplo fictício",
  instruction: "Notifique, com urgência, para comprovar os registos e analisar a renúncia ao mandato.",
  confirmedDate: "2026-11-30",
  notes: "Confirmar o prazo previamente indicado."
});
assert.ok(p.checks.some(x => x.id === "registos"));
assert.ok(p.checks.some(x => x.id === "mandato"));
assert.ok(p.checks.some(x => x.id === "urgencia"));
const neg = core.buildPlan({type: "notificacao", instruction: "Não notifique, salvo se houver despacho."});
assert.ok(neg.checks.some(x => x.id === "negacao"));
assert.ok(neg.checks.some(x => x.id === "condicao"));

const flagged = core.report(p, [p.checks[0].id]);
assert.ok(flagged.includes("[x] "));
assert.ok(flagged.includes("[ ] "));
assert.ok(flagged.includes("não comprovativo de cumprimento"));
assert.ok(flagged.includes("2026-11-30"));
assert.throws(() => core.buildPlan({type: "inexistente"}));
assert.throws(() => core.buildPlan({type: "oficio", confirmedDate: "2026-02-29"}));
assert.throws(() => core.buildPlan({type: "oficio", instruction: "x".repeat(2501)}));
assert.throws(() => core.buildPlan({type: "oficio", notes: "x".repeat(1501)}));
const escaped = core.buildPlan({type: "outro", instruction: "<img src=x onerror=alert(1)>"});
assert.ok(core.report(escaped, []).includes("<img src=x"));
for (const file of ["assets/flow-core.js", "assets/flow.js"]) {
  const js = fs.readFileSync(file, "utf8");
  assert.ok(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bsendBeacon\s*\(/.test(js), "Rede: " + file);
  assert.ok(!/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/i.test(js), "Persistência: " + file);
  new vm.Script(js, {filename: file});
}
const html = fs.readFileSync("flow.html", "utf8");
for (const path of ["assets/flow-core.js", "assets/flow.js", "assets/flow.css", "assets/theme.js"]) {
  assert.ok(html.includes(path), "Recurso em falta: " + path);
}
console.log("LegalTech Flow: contrato, limites, alertas e privacidade aprovados.");
