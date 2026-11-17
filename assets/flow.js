/* LegalTech Flow | interface. Não há envio de texto, chamadas de API ou armazenamento documental. */
(function () {
  "use strict";
  const C = window.LegalTechFlowCore;
  const N = window.LegalNext;
  const byId = id => document.getElementById(id);
  const form = byId("flow-form"), checks = byId("flow-checks");
  const report = byId("flow-report"), progress = byId("flow-progress");
  const meter = byId("flow-meter"), links = byId("flow-tools");
  let plan = null, selected = new Set(), edited = false;
  const actions = ["flow-copy", "flow-txt", "flow-rtf", "flow-regenerate"];
  function status(message) { byId("status").textContent = message; }
  function enableActions(on) { actions.forEach(id => { byId(id).disabled = !on; }); }
  function buildText() {
    if (!plan) return "";
    return C.report(plan, [...selected]);
  }
  function updateProgress() {
    const total = plan ? plan.checks.length : 0;
    const done = plan ? plan.checks.filter(item => selected.has(item.id)).length : 0;
    const pct = total ? Math.round(100 * done / total) : 0;
    progress.textContent = done + " de " + total + " verificações assinaladas";
    meter.style.width = pct + "%";
    byId("flow-meter-box").setAttribute("aria-valuenow", String(pct));
    if (!edited) report.value = buildText();
  }
  function transferText() {
    if (!plan) return "";
    const verified = plan.checks.filter(item => selected.has(item.id)).map(item => "- " + item.label);
    return [
      "LEGALTECH SUITE | CONTEXTO AUXILIAR",
      "Tipo de ato: " + plan.label,
      "Etiqueta genérica: " + (plan.reference || "Não indicada"),
      "Data previamente confirmada: " + (plan.confirmedDate || "Não indicada"),
      "Instrução desidentificada:", plan.instruction || "(Não introduzida)",
      "Notas:", plan.notes || "(Sem notas)",
      "Verificações assinaladas manualmente:",
      ...(verified.length ? verified : ["(Nenhuma)"]),
      "Roteiro auxiliar; não comprova atos nem valida prazos."
    ].join("\n");
  }
  function render() {
    checks.replaceChildren();
    links.replaceChildren();
    for (const item of plan.checks) {
      const label = document.createElement("label");
      label.className = "flow-check";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item.id;
      checkbox.checked = selected.has(item.id);
      const wrap = document.createElement("span");
      wrap.textContent = item.label;
      if (item.origin === "alerta textual") {
        const detail = document.createElement("small");
        detail.textContent = "Alerta por expressão encontrada; pode não ser aplicável.";
        wrap.append(detail);
      }
      checkbox.addEventListener("change", () => {
        checkbox.checked ? selected.add(item.id) : selected.delete(item.id);
        updateProgress();
        if (edited) status("O relatório foi editado. Clica em «Recriar relatório» para incluir as novas marcas.");
      });
      label.append(checkbox, wrap);
      checks.append(label);
    }
    for (const tool of plan.tools) {
      const anchor = document.createElement("a");
      anchor.href = tool.url;
      anchor.textContent = tool.name + " ↗";
      links.append(anchor);
    }
    byId("flow-empty").hidden = true;
    byId("flow-generated").hidden = false;
    enableActions(true);
    edited = false;
    updateProgress();
  }
  function reset() {
    plan = null; selected = new Set(); edited = false;
    form.reset(); checks.replaceChildren(); links.replaceChildren();
    report.value = ""; progress.textContent = "0 verificações assinaladas";
    meter.style.width = "0%";
    byId("flow-meter-box").setAttribute("aria-valuenow", "0");
    byId("flow-empty").hidden = false;
    byId("flow-generated").hidden = true;
    enableActions(false);
    status("Sessão limpa. Os dados não foram guardados.");
    byId("flow-type").focus();
  }
  form.addEventListener("submit", event => {
    event.preventDefault();
    try {
      plan = C.buildPlan({
        type: byId("flow-type").value,
        reference: byId("flow-reference").value,
        instruction: byId("flow-instruction").value,
        confirmedDate: byId("flow-date").value,
        notes: byId("flow-notes").value
      });
      selected = new Set();
      render();
      status("Roteiro preparado. Confirma todos os pressupostos e as fontes aplicáveis.");
      byId("flow-checks-title").focus();
    } catch (error) { status(error.message || "Não foi possível preparar o roteiro."); }
  });
  byId("flow-clear").addEventListener("click", reset);
  byId("flow-handoff-copy").addEventListener("click", () => { if (plan) N.copy(transferText()); });
  byId("flow-notes").addEventListener("input", () => {
    if (!plan) return;
    plan.notes = byId("flow-notes").value.slice(0, C.LIMITS.notes);
    if (!edited) report.value = buildText();
  });
  report.addEventListener("input", () => {
    if (!plan) return;
    edited = true;
    status("Relatório editado manualmente. As próximas marcas não substituirão o teu texto.");
  });
  byId("flow-regenerate").addEventListener("click", () => {
    if (!plan) return;
    edited = false;
    report.value = buildText();
    status("Relatório recriado com as verificações e notas atuais. As edições diretas anteriores foram substituídas.");
  });
  byId("flow-copy").addEventListener("click", () => { if (plan) N.copy(report.value); });
  byId("flow-txt").addEventListener("click", () => { if (plan) N.save(report.value, "legaltech-flow-roteiro.txt"); });
  byId("flow-rtf").addEventListener("click", () => {
    if (plan) N.save(N.rtf(report.value), "legaltech-flow-roteiro.rtf", "application/rtf");
  });
  enableActions(false);
})();
