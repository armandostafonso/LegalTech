import { chromium } from "playwright";
import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1100,height:860},acceptDownloads:true});
const issues=[];
async function open(file){await page.goto(pathToFileURL(resolve(file)).href,{waitUntil:"domcontentloaded",timeout:25000})}
async function test(name,fn){try{await fn();console.log("✓",name)}catch(e){issues.push(name+": "+e.message);console.error("✗",name,String(e))}}
async function downloadBy(selector){const pending=page.waitForEvent("download");await page.locator(selector).click();const file=await pending;return {name:file.suggestedFilename(),body:fs.readFileSync(await file.path(),"utf8")}}
await test("Assistant: sugestões de notificação e conclusão sem texto original em URL",async()=>{
 await open("assistant.html");
 await page.locator("#source").fill("Notifique a entidade para juntar documentos em cinco dias. Após, abra conclusão.");
 await page.locator("#analyse").click();
 if(await page.locator("#items input").count()<3)throw Error("Checklist insuficiente");
 const links=await page.locator("#links a").evaluateAll(nodes=>nodes.map(x=>x.getAttribute("href")));
 if(links.some(x=>x.includes("entidade")||x.includes("documentos")))throw Error("Texto original passou para os links");
 const result=await downloadBy("#txt");
 if(!result.body.includes("NOTIFICAÇÃO")&&!result.body.includes("Notificação"))throw Error("Plano não exportado");
 await page.locator("#clear").click();
 if(await page.locator("#source").inputValue())throw Error("Texto não foi apagado");
});
await test("Assistant: instrução negativa bloqueia atos e exportação",async()=>{
 await open("assistant.html");
 await page.locator("#source").fill("Não notifique a entidade. Abra conclusão apenas quando determinado.");
 await page.locator("#analyse").click();
 if(await page.locator("#items input").count())throw Error("Foram sugeridos atos apesar de uma proibição");
 if(await page.locator("#links a").count())throw Error("Foram abertos caminhos de atos apesar de proibição");
 if(await page.locator("#txt").isEnabled())throw Error("Exportação não foi bloqueada");
 if(!(await page.locator("#warning").innerText()).includes("não sugere"))throw Error("Advertência de negação ausente");
});
await test("Assistant: ressalva condicional exige conferência explícita",async()=>{
 await open("assistant.html");
 await page.locator("#source").fill("Caso seja legalmente admissível, notifique a entidade.");
 await page.locator("#analyse").click();
 if(await page.locator("#items input").count()<1)throw Error("Não foram apresentados pontos a conferir");
 if(!(await page.locator("#warning").innerText()).includes("condição"))throw Error("Condição não assinalada");
 const exported=await downloadBy("#txt");
 if(!exported.body.includes("ALERTA:")||!exported.body.includes("possível condição"))throw Error("Plano exportado perdeu a ressalva");
 await page.locator("#clear").click();
 if(await page.locator("#warning").isVisible())throw Error("Advertência persistiu após limpeza");
});
await test("Privacy Check: deteção e substituição de dados fictícios",async()=>{
 await open("privacy-check.html");
 await page.locator("#source").fill("Exemplo fictício: email pessoa@exemplo.pt e NIF 123456789.");
 await page.locator("#check").click();
 const out=await page.locator("#safe").inputValue();
 if(out.includes("pessoa@exemplo.pt")||out.includes("123456789"))throw Error("Identificadores originais permaneceram");
 if(!out.includes("[ENDEREÇO DE EMAIL]"))throw Error("Email não sinalizado");
 await page.locator("#source").fill("Contacto fictício 912345678, endereço 1000-001, NISS 12345678901.");
 await page.locator("#check").click();
 const phone=await page.locator("#safe").inputValue();
 if(phone.includes("912345678")||phone.includes("12345678901"))throw Error("Telefone ou NISS não sinalizados");
 await page.locator("#clear").click();
 if(await page.locator("#safe").inputValue())throw Error("Saída não foi apagada");
});
await test("Compare: diferenças entre dois textos",async()=>{
 await open("compare.html");
 await page.locator("#before").fill("Linha inicial\nPrazo de cinco dias");
 await page.locator("#after").fill("Linha inicial\nPrazo de sete dias");
 await page.locator("#compare").click();
 const t=await page.locator("#status").innerText();
 if(!t.includes("1 linha(s) adicionada(s); 1 linha(s) removida(s)"))throw Error(t);
 const x=await downloadBy("#txt");if(!x.body.includes("sete dias"))throw Error("Comparação incompleta");
});
await test("Hearing: rascunho editável e exportação RTF",async()=>{
 await open("hearing.html");
 await page.locator("#date").fill("2026-11-16");
 await page.locator("#time").fill("10:00");
 await page.locator("#occurrences").fill("Ocorrência inteiramente fictícia.");
 await page.locator("#generate").click();
 if(!(await page.locator("#output").inputValue()).includes("Ocorrência inteiramente fictícia"))throw Error("Ocorrência não incorporada");
 await page.locator("#output").fill("Ata editada manualmente");
 const x=await downloadBy("#rtf");if(!x.body.includes("Ata editada manualmente"))throw Error("Edição não exportada");
});
await test("Notify: checklist da renúncia e minuta sem destinatário inventado",async()=>{
 await open("notify.html");await page.locator("#kind").selectOption("renuncia");
 const text=await page.locator("#items").innerText();
 if(!text.includes("desassociar"))throw Error("Ressalva da renúncia ausente");
 await page.locator("#draft").click();const v=await page.locator("#output").inputValue();
 if(!v.includes("[conferir nos autos]"))throw Error("Destinatário assumido");
});
await test("Remessas: checklist por modalidade e relatório de conferência",async()=>{
 await open("remessas.html");await page.locator("#kind").selectOption("pa");await page.locator("#items input").first().check();
 await page.locator("#summary").click();const t=await page.locator("#output").inputValue();
 if(!t.includes("Processo administrativo")||!t.includes("[x]"))throw Error("Relatório incompleto");
});
await test("Appeals: distinção de regime e ausência de prazo automático",async()=>{
 await open("appeals.html");await page.locator("#regime").selectOption("cppt");await page.locator("#report").click();
 const s=await page.locator("#output").inputValue();if(!s.includes("CPPT")||!s.includes("Não determina prazo"))throw Error("Recurso tributário incorreto");
});
await test("PA: índice textual e CSV",async()=>{
 await open("pa.html");await page.locator("#source").fill("05/01/2026 — Pedido fictício\n10/01/2026 — Resposta fictícia");
 await page.locator("#analyse").click();if(await page.locator("#rows tr").count()!==2)throw Error("Datas não extraídas");
 const x=await downloadBy("#csv");if(!x.body.includes("2026-01-05"))throw Error("CSV sem data");
});
await test("Termos: cota conferida e ICS de dia inteiro",async()=>{
 await open("termos.html");await page.locator("#start").fill("2026-11-16");await page.locator("#end").fill("2026-11-26");
 await page.locator("#generate").click();
 if(!(await page.locator("#output").inputValue()).includes("2026-11-26"))throw Error("Termo não incorporado");
 const x=await downloadBy("#ics");if(!x.body.includes("DTEND;VALUE=DATE:20261127"))throw Error("ICS incorreto");
});
await test("Lex Audit: registo manual sem estado persistente",async()=>{
 await open("lex-monitor.html");await page.locator("#law").selectOption("CPPT");await page.locator("#review").fill("2026-11-16");
 await page.locator("#mark").click();if(await page.locator("#rows tr").count()!==1)throw Error("Registo ausente");
 await page.reload();if(await page.locator("#rows tr").count())throw Error("Registo persistiu após recarga");
});
await test("Auditor textual: sinalizar duração de prazo omitida",async()=>{
 await open("audit-despacho.html");await page.locator("#instruction").fill("Notifique e abra conclusão após cinco dias. Prazo de 5 dias.");
 await page.locator("#draft").fill("Notifica-se o documento à parte, sem indicação do prazo.");
 await page.locator("#review").click();const out=await page.locator("#results").innerText();
 if(!out.includes("5 dias"))throw Error("Duração não sinalizada");
 await page.locator("#review").click();if(!(await page.locator("#results").innerText()).includes("5 dias"))throw Error("A segunda verificação divergiu");
});
await test("Mapa TAF: fases e navegação ao roteiro",async()=>{
 await open("mapa-taf.html");await page.locator("#workflow").selectOption("acao-administrativa");
 if(await page.locator("#timeline button").count()!==4)throw Error("Quatro fases esperadas");
 await page.locator("#next").click();
 if(!(await page.locator("#name").innerText()).includes("Citação"))throw Error("Navegação falhou");
 const link=await page.locator("#full").getAttribute("href");
 if(!link.includes("especie=acao-administrativa")||!link.includes("fase=citacao"))throw Error("Ligação de fase incorreta");
 await page.goto(new URL(link,page.url()).href);
 if(await page.locator("#workflow").inputValue()!=="acao-administrativa"||await page.locator("#phase").inputValue()!=="citacao")throw Error("Roteiro não recebeu seleção da fase");
});
await browser.close();
if(issues.length){console.error("\nFALHAS:",issues.join("\n"));process.exit(1)}
console.log("12 módulos especializados: testes de browser aprovados.");
