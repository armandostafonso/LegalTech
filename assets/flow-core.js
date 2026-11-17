/* LegalTech Flow | Núcleo de preparação e conferência v1.0
   Ferramenta local e determinística. Não interpreta juridicamente despachos,
   não calcula prazos e não certifica o cumprimento de atos. */
(function (root) {
  "use strict";
  const VERSION = "1.0";
  const LIMITS = Object.freeze({ instruction: 2500, reference: 70, notes: 1500 });
  const TYPES = Object.freeze({
    notificacao: {
      label: "Notificação", tools: ["notify.html", "citacheck.html", "minutas.html", "audit-despacho.html"],
      checks: [
        ["representacao", "Conferir a representação e a pessoa ou entidade a notificar."],
        ["comunicacao", "Conferir texto, documentos a transmitir e advertências exigíveis."],
        ["comprovativo", "Prever a conferência do comprovativo de expedição ou notificação."]
      ]
    },
    citacao: {
      label: "Citação", tools: ["notify.html", "citacheck.html", "minutas.html", "expediente.html"],
      checks: [
        ["citando", "Conferir identidade, qualidade e endereço ou canal autorizado do citando."],
        ["elementos", "Conferir peças a transmitir e advertências aplicáveis à citação."],
        ["perfeicao", "Não presumir a data de perfeição sem verificar a modalidade utilizada."]
      ]
    },
    oficio: {
      label: "Ofício", tools: ["minutas.html", "expediente.html", "audit-despacho.html"],
      checks: [
        ["entidade", "Conferir a designação e os dados de expedição da entidade destinatária."],
        ["objeto", "Conferir objeto do pedido, documentos e eventuais referências obrigatórias."],
        ["resposta", "Confirmar se há prazo de resposta e qual a sua fonte."]
      ]
    },
    certidao: {
      label: "Certidão", tools: ["minutas.html", "expediente.html", "privacy-check.html"],
      checks: [
        ["ambito", "Delimitar os factos ou peças a certificar a partir dos autos."],
        ["confronto", "Confrontar o rascunho com os documentos originais e respetivas referências."],
        ["assinatura", "Conferir requisitos de assinatura, autenticação e entrega aplicáveis."]
      ]
    },
    conclusao: {
      label: "Conclusão", tools: ["minutas.html", "roteiros.html", "expediente.html"],
      checks: [
        ["fundamento", "Conferir o motivo da conclusão e os atos entretanto praticados."],
        ["pendencias", "Verificar se existem diligências ou respostas pendentes relevantes."]
      ]
    },
    remessa: {
      label: "Remessa", tools: ["remessas.html", "appeals.html", "expediente.html"],
      checks: [
        ["destino", "Confirmar entidade de destino e fundamento da remessa."],
        ["inventario", "Conferir peças, apensos, anexos e eventuais originais."],
        ["integridade", "Conferir integridade, sequência e registo da remessa."]
      ]
    },
    diligencia: {
      label: "Diligência / ata", tools: ["hearing.html", "roteiros.html", "agenda.html"],
      checks: [
        ["convocatorias", "Conferir convocatórias e elementos da diligência."],
        ["ocorrencias", "Registar apenas presenças, ocorrências e decisões efetivamente verificadas."],
        ["ata", "Conferir ata e assinaturas exigíveis antes de a finalizar."]
      ]
    },
    outro: {
      label: "Outro ato de secretaria", tools: ["roteiros.html", "expediente.html", "minutas.html"],
      checks: [
        ["peculiaridades", "Identificar os pressupostos específicos do ato com base nas fontes aplicáveis."],
        ["destino_final", "Confirmar o procedimento e registo final exigíveis."]
      ]
    }
  });
  const TOOLS = Object.freeze({
    "notify.html": "LegalTech Notify",
    "citacheck.html": "Cita-Check",
    "minutas.html": "LegalTech Docs",
    "audit-despacho.html": "Auditor despacho/minuta",
    "expediente.html": "LegalTech Check",
    "remessas.html": "LegalTech Remessas",
    "appeals.html": "LegalTech Appeals",
    "privacy-check.html": "LegalTech Privacy Check",
    "roteiros.html": "Roteiros de verificação",
    "hearing.html": "LegalTech Hearing",
    "agenda.html": "Agenda local"
  });
  const COMMON = Object.freeze([
    ["instrucoes", "Ler a instrução integral e confirmar que o ato está efetivamente determinado."],
    ["enquadramento", "Confirmar a espécie, a fase processual e as normas aplicáveis."],
    ["intervenientes", "Conferir os intervenientes e a respetiva qualidade, quando aplicável."],
    ["prazo", "Verificar se existe prazo, a sua origem, o início e o termo, quando aplicável."],
    ["anexos", "Conferir peças e anexos necessários, quando aplicável."],
    ["confidencialidade", "Confirmar destinatários, reserva e proteção de dados na comunicação."],
    ["conferencia_final", "Efetuar revisão humana do documento e do ato antes de qualquer execução."]
  ]);
  const HINTS = Object.freeze([
    {id: "registos", rx: /\bregist[oa]s?\b/i, text: "A instrução menciona registos: confirmar situação e prova documental antes de reportar."},
    {id: "mandato", rx: /\b(ren[úu]ncia|mandat[áa]ri[oa]s?|mandato)\b/i, text: "Há referência a mandato ou renúncia: confirmar representação, efeitos e destinatários."},
    {id: "apensos", rx: /\b(apens[oa]s?|desapens|incorporar)\b/i, text: "Há referência a apensos ou incorporação: conferir peças, ligação e integridade."},
    {id: "urgencia", rx: /\b(urgente|urg[êe]ncia)\b/i, text: "Foi mencionada urgência: verificar o regime legal concreto, sem presumir prazos."},
    {id: "documentos", rx: /\b(comprovativ[oa]s?|documentalmente|anexad[oa]s?)\b/i, text: "Foi pedida documentação: conferir os comprovativos e a sua correspondência com o pedido."}
  ]);
  function text(value, max) {
    const raw = value == null ? "" : String(value).replace(/\r\n?/g, "\n");
    return raw.slice(0, max).trim();
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
  }
  function buildPlan(input) {
    const p = input || {};
    const type = p.type || "notificacao";
    if (!Object.prototype.hasOwnProperty.call(TYPES, type)) throw new Error("Tipo de ato desconhecido.");
    if (String(p.instruction || "").length > LIMITS.instruction) throw new Error("A instrução ultrapassa 2500 caracteres.");
    if (String(p.reference || "").length > LIMITS.reference) throw new Error("A referência ultrapassa 70 caracteres.");
    if (String(p.notes || "").length > LIMITS.notes) throw new Error("As notas ultrapassam 1500 caracteres.");
    const confirmedDate = text(p.confirmedDate, 10);
    if (confirmedDate && !validDate(confirmedDate)) throw new Error("Data confirmada inválida.");
    const instruction = text(p.instruction, LIMITS.instruction);
    const checks = COMMON.concat(TYPES[type].checks).map(([id, label]) => ({id, label, origin: "base"}));
    const lower = instruction.toLocaleLowerCase("pt-PT");
    for (const hint of HINTS) if (hint.rx.test(lower)) {
      checks.push({id: hint.id, label: hint.text, origin: "alerta textual"});
    }
    return {
      version: VERSION, type, label: TYPES[type].label,
      reference: text(p.reference, LIMITS.reference),
      instruction, notes: text(p.notes, LIMITS.notes),
      confirmedDate,
      checks, tools: TYPES[type].tools.map(url => ({url, name: TOOLS[url]}))
    };
  }
  function report(plan, checkedIds) {
    const checked = new Set(Array.isArray(checkedIds) ? checkedIds : []);
    const count = plan.checks.filter(item => checked.has(item.id)).length;
    return [
      "LEGALTECH FLOW | ROTEIRO AUXILIAR",
      "Tipo de ato: " + plan.label,
      "Referência genérica: " + (plan.reference || "Não indicada"),
      "Data já confirmada (se aplicável): " + (plan.confirmedDate || "Não indicada"),
      "Estado das verificações assinaladas: " + count + "/" + plan.checks.length,
      "",
      "INSTRUÇÃO INSERIDA PELO UTILIZADOR",
      plan.instruction || "(Não introduzida)",
      "",
      "VERIFICAÇÕES A EFETUAR OU CONFERIR",
      ...plan.checks.map(x => (checked.has(x.id) ? "[x] " : "[ ] ") + x.label + (x.origin === "alerta textual" ? " [alerta textual]" : "")),
      "",
      "NOTAS DO UTILIZADOR",
      plan.notes || "(Sem notas)",
      "",
      "FERRAMENTAS DE APOIO",
      ...plan.tools.map(x => "- " + x.name + " (" + x.url + ")"),
      "",
      "LIMITE: roteiro de preparação, não comprovativo de cumprimento.",
      "As marcas de verificação são declarações do utilizador, não validação jurídica.",
      "Não certifica atos, não executa notificações nem calcula prazos.",
      "Conferir sempre os autos, os despachos, as normas vigentes e os resultados."
    ].join("\n");
  }
  root.LegalTechFlowCore = Object.freeze({VERSION, LIMITS, TYPES, buildPlan, report, validDate});
})(window);
