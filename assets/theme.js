/* LegalTech | Controlador de aparência v1.1
   Uma única preferência, com migração das páginas antigas e sem dependências. */
(function () {
  "use strict";
  const KEY = "legaltech_theme", LEGACY = "theme";
  const root = document.documentElement;
  const valid = value => value === "light" || value === "dark";
  const preferred = () => {
    try {
      const current = localStorage.getItem(KEY);
      if (valid(current)) return current;
      const previous = localStorage.getItem(LEGACY);
      if (valid(previous)) return previous;
    } catch (_) {}
    try { return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    catch (_) { return "light"; }
  };
  function update(theme) {
    if (!valid(theme)) return;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#091629" : "#f4f6f9";
    try {
      if (localStorage.getItem(KEY) !== theme) localStorage.setItem(KEY, theme);
      if (localStorage.getItem(LEGACY) !== theme) localStorage.setItem(LEGACY, theme);
    } catch (_) {}
    document.querySelectorAll(".lt-theme-control").forEach(button => {
      const opposite = theme === "dark" ? "claro" : "escuro";
      button.setAttribute("aria-label", "Ativar modo " + opposite);
      button.setAttribute("title", "Ativar modo " + opposite);
      button.setAttribute("aria-pressed", String(theme === "dark"));
      const icon = button.querySelector(".lt-theme-symbol");
      if (icon) icon.textContent = theme === "dark" ? "☀" : "☾";
    });
  }
  function apply(theme) {
    if (!valid(theme)) return;
    root.setAttribute("data-theme", theme);
    update(theme);
  }
  function setupButton() {
    let button = document.querySelector("#themeToggle, #theme");
    if (!button) {
      const header = document.querySelector(".top-nav, body > header nav, body > header .top");
      if (!header) return;
      button = document.createElement("button");
      button.type = "button";
      button.className = "lt-theme-added";
      header.appendChild(button);
      button.addEventListener("click", () => apply(root.dataset.theme === "dark" ? "light" : "dark"));
    }
    button.classList.add("lt-theme-control");
    /* Substituir apenas o conteúdo visual preserva os listeners anteriores. */
    const symbol = document.createElement("span");
    symbol.className = "lt-theme-symbol";
    symbol.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "lt-theme-label";
    label.textContent = "Claro-Escuro";
    button.replaceChildren(symbol, label);
  }
  function init() {
    setupButton();
    apply(preferred());
    new MutationObserver(records => {
      if (records.some(r => r.attributeName === "data-theme")) update(root.dataset.theme);
    }).observe(root, {attributes:true, attributeFilter:["data-theme"]});
    window.addEventListener("storage", e => {
      if ((e.key === KEY || e.key === LEGACY) && valid(e.newValue) && e.newValue !== root.dataset.theme) apply(e.newValue);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, {once:true});
  else init();
})();
