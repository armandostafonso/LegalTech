import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser=await chromium.launch({headless:true});
const errors=[];
const page=await browser.newPage({viewport:{width:1280,height:800}});
async function open(name){
 await page.goto(pathToFileURL(resolve(name)).href,{waitUntil:"domcontentloaded",timeout:25000});
 await page.waitForTimeout(250);
}
async function check(name,fn){
 try{await fn();console.log("✓",name)}catch(e){errors.push(name+": "+String(e));console.error("✗",name,e)}
}
await check("Painel de trabalho: pesquisa, filtros e privacidade",async()=>{
 await open("workspace.html");
 if(await page.locator(".workspace-tool").count()!==22)throw Error("Catálogo do painel incompleto");
 await page.locator("#workspace-search").fill("notificacao");
 if(await page.locator(".workspace-tool").count()<1)throw Error("Pesquisa sem normalização de acentos");
 await page.locator("#workspace-search").fill("");
 await page.locator('#workspace-filters button[data-category="Prazos"]').click();
 if(await page.locator(".workspace-tool").count()!==2)throw Error("Filtro de prazos incorreto");
 await page.locator('#workspace-filters button[data-category="Todas"]').click();
 if(await page.locator(".workspace-tool").count()!==22)throw Error("Restauro do catálogo falhou");
 await page.reload();
 if(await page.locator("#workspace-search").inputValue()!=="")throw Error("Pesquisa persistiu após recarga");
});
await check("Ecossistema institucional: 6 áreas e ligações",async()=>{
 await open("index.html");
 if(await page.locator(".home-domain").count()!==6)throw Error("Seis áreas do ecossistema esperadas");
 if(await page.locator(".home-orbit").count()!==1)throw Error("Apresentação visual ausente");
 if(await page.locator(".home-hero-actions a[href='workspace.html']").count()!==1)throw Error("Acesso ao painel ausente");
 if(await page.locator(".home-hero-actions a[href='flow.html']").count()!==1)throw Error("Acesso ao Flow ausente");
 if(!(await page.locator(".home-proof").innerText()).includes("22 ferramentas · 6 áreas"))throw Error("Indicador do catálogo incorreto");
});
await check("Percursos rápidos do Workspace",async()=>{
 await open("workspace.html");
 if(await page.locator(".workspace-journey").count()!==4)throw Error("Quatro tarefas rápidas esperadas");
 for(const name of ["flow.html","citacheck.html","tramitação-taf.html","anonimizador.html"]){
  if(await page.locator('.workspace-journey[href="'+name+'"]').count()!==1)throw Error("Percurso em falta: "+name);
 }
});
await check("Página inicial e pesquisa",async()=>{
 await open("index.html");
 const h=await page.locator("h1").innerText();
 if(!h.includes("Menos tarefas"))throw Error("Título inesperado");
 await page.locator("#search").fill("minuta");
 if(await page.locator(".tool:visible").count()<1||!await page.locator(".tool[href=\"minutas.html\"]").isVisible())throw Error("Pesquisa não encontrou Minutas");
 await page.locator("#search").fill("");
 if(await page.locator(".tool:visible").count()!==22)throw Error("Ferramentas não recuperadas");
});
await check("Catálogo por categorias: filtros e pesquisa combinada",async()=>{
 await open("index.html");
 await page.locator('.filters button[data-filter="prazos"]').click();
 if(await page.locator(".tool:visible").count()!==4)throw Error("Quatro ferramentas de prazos esperadas");
 if(await page.locator('.filters button[data-filter="prazos"]').getAttribute("aria-pressed")!=="true")throw Error("Estado do filtro não exposto");
 await page.locator("#search").fill("Cita-Check");
 if(await page.locator(".tool:visible").count()!==1)throw Error("Pesquisa combinada falhou");
 await page.locator("#search").fill("");
 await page.locator('.filters button[data-filter="all"]').click();
 if(await page.locator(".tool:visible").count()!==22)throw Error("Restauro de ferramentas falhou");
});
await check("Fontes normativas: inventário, filtro e marcas temporárias",async()=>{
 await open("fontes.html");
 if(await page.locator(".audit").count()!==9)throw Error("Inventário normativo incompleto");
 await page.locator("#search").fill("110.º");
 if(await page.locator(".audit").count()<1)throw Error("Pesquisa de artigos falhou");
 await page.locator("#search").fill("");
 await page.locator("#area").selectOption("Tributária");
 if(await page.locator(".audit").count()<1)throw Error("Filtro de jurisdição falhou");
 await page.locator("#area").selectOption("");
 await page.locator(".audit input").first().check();
 if(!(await page.locator("#count").innerText()).includes("1 consultas assinaladas"))throw Error("Marca de consulta não contabilizada");
 await page.locator("#reset").click();
 if(!(await page.locator("#count").innerText()).includes("0 consultas assinaladas"))throw Error("Marcas não repostas");
 await page.locator(".audit input").first().check();
 await page.reload();
 if(!(await page.locator("#count").innerText()).includes("0 consultas assinaladas"))throw Error("Marcas ficaram guardadas após recarga");
});
await check("Conferência de expediente: seis atos e exportação segura",async()=>{
 await open("expediente.html");
 if(await page.locator("#type option").count()!==6)throw Error("Seis modelos de expediente não carregados");
 await page.locator("#type").selectOption("notificacao");
 if(await page.locator("#items input").count()!==7)throw Error("Lista de notificação incompleta");
 await page.locator("#items input").first().check();
 if(!(await page.locator("#metric").innerText()).includes("1 de 7"))throw Error("Progresso de conferência incorreto");
 await page.locator("#type").selectOption("oficio");
 await page.locator("#type").selectOption("notificacao");
 if(!(await page.locator("#items input").first().isChecked()))throw Error("Progresso não conservado na página");
 const download=page.waitForEvent("download");
 await page.locator("#txt").click();
 const file=await download;
 if(!file.suggestedFilename().endsWith(".txt"))throw Error("Exportação TXT falhou");
 const fs=await import("node:fs");
 const data=fs.readFileSync(await file.path(),"utf8");
 if(!data.includes("[x]")||!data.includes("NOTIFICAÇÃO")&&!data.includes("Notificação"))throw Error("Checklist exportada incorretamente");
 await page.locator("#reset").click();
 if(!(await page.locator("#metric").innerText()).includes("0 de 7"))throw Error("Reposição falhou");
 await page.reload();
 if(!(await page.locator("#metric").innerText()).includes("0 de 7"))throw Error("Dados de conferência ficaram guardados");
});
await check("Agenda local: eventos, exportação ICS e limpeza",async()=>{
 await open("agenda.html");
 if(await page.locator("#ics").isEnabled())throw Error("Exportação permitida com lista vazia");
 await page.locator("#date").fill("2026-11-20");
 await page.locator("#eventTitle").selectOption("Diligência judicial");
 await page.locator("#source").selectOption("Indicada por despacho");
 await page.locator("#add").click();
 if(!(await page.locator("#count").innerText()).includes("1 evento"))throw Error("Evento não inserido");
 const ics=page.waitForEvent("download");
 await page.locator("#ics").click();
 const dl=await ics;
 if(!dl.suggestedFilename().endsWith(".ics"))throw Error("Extensão ICS incorreta");
 const fs=await import("node:fs");
 const content=fs.readFileSync(await dl.path(),"utf8");
 if(!content.includes("DTSTART;VALUE=DATE:20261120")||!content.includes("DTEND;VALUE=DATE:20261121"))throw Error("Data ou exclusividade do termo ICS incorreta");
 if(!content.includes("Diligência judicial"))throw Error("Assunto genérico ICS ausente");
 const csv=page.waitForEvent("download");
 await page.locator("#csv").click();
 if(!(await csv).suggestedFilename().endsWith(".csv"))throw Error("Extensão CSV incorreta");
 await page.locator(".event button").first().click();
 if(await page.locator(".event").count()!==0)throw Error("Remoção de evento falhou");
 await page.reload();
 if(await page.locator(".event").count()!==0)throw Error("Eventos persistiram na sessão após recarga");
});
await check("Tramitação TAF: fases, urgência, progressão e remissão CPPT",async()=>{
 await open("tramitação-taf.html");
 if(await page.locator("#workflow option").count()!==9)throw Error("Roteiros TAF incompletos");
 await page.locator("#workflow").selectOption("intimacao-informacao");
 await page.locator("#phase").selectOption("citacao");
 const text=await page.locator("#steps").innerText();
 if(!text.includes("dez dias"))throw Error("Prazo do artigo 107 não identificado");
 await page.locator("#steps input").first().check();
 if(!(await page.locator("#count").innerText()).includes("1 de 4"))throw Error("Progresso errado");
 await page.locator("#workflow").selectOption("intimacao-dlg");
 if(!(await page.locator("#warning").innerText()).includes("sete dias"))throw Error("Ressalva do art. 110 ausente");
 await page.locator("#workflow").selectOption("intimacao-tributaria");
 const sources=await page.locator("#sources").innerText();
 if(!sources.includes("146.º"))throw Error("Remissão CPPT 146 ausente");
 await page.locator("#phase").selectOption("decisao");
 if(await page.locator("#steps input").count()!==4)throw Error("Verificações por fase ausentes");
 await page.locator("#workflow").selectOption("acao-administrativa");
 if(!(await page.locator("#temporal").innerText()).includes("01/12/2026"))throw Error("Aviso transitório da ação ausente");
 if(await page.locator("#steps .actor").count()!==4)throw Error("Distinção secretaria/despacho ausente");
 await page.locator("#workflow").selectOption("impugnacao-judicial");
 if(!(await page.locator("#warning").innerText()).includes("três meses"))throw Error("Prazo de contestação CPPT ausente");
 await page.locator("#workflow").selectOption("providencia-cautelar");
 if(!(await page.locator("#warning").innerText()).includes("48 horas"))throw Error("Urgência cautelar ausente");
 await page.locator("#workflow").selectOption("pre-contratual");
 if(!(await page.locator("#warning").innerText()).includes("48 horas"))throw Error("Prazo liminar pré-contratual ausente");
 await page.locator("#phase").selectOption("suspensao");
 if(!(await page.locator("#steps").innerText()).includes("103.º-A"))throw Error("Incidente pré-contratual ausente");
 await page.locator("#workflow").selectOption("reclamacao-oef");
 if(!(await page.locator("#warning").innerText()).includes("subida imediata"))throw Error("Variante da reclamação OEF ausente");
 await page.locator("#phase").selectOption("subida");
 if(!(await page.locator("#steps").innerText()).includes("278.º/3"))throw Error("Subida imediata não identificada");
 await page.locator("#workflow").selectOption("recurso");
 if(!(await page.locator("#sources").innerText()).includes("279.º"))throw Error("Recursos CPPT ausentes");
});
await check("Fichas TAF: 25 fases, direito transitório e minutas seguras",async()=>{
 await open("tramitação-taf.html");
 await page.locator("#workflow").selectOption("acao-administrativa");
 await page.locator("#phase").selectOption("citacao");
 await page.locator("#steps input").first().check();
 await page.locator("#phase").selectOption("saneamento");
 await page.locator("#phase").selectOption("citacao");
 if(!(await page.locator("#steps input").first().isChecked()))throw Error("Verificações não mantidas entre fases");
 await page.locator("#detailGuide").evaluate(node=>node.open=true);
 if(!(await page.locator("#guide").innerText()).includes("Antes de prosseguir"))throw Error("Ficha de conferência ausente");
 const url=await page.locator("#draftLink").getAttribute("href");
 if(!url.startsWith("minutas.html?tipo=")||url.includes("processo="))throw Error("Passagem para minutas insegura");
 if(!url.includes("tipo=cota"))throw Error("Citação indevidamente convertida em notificação");
 await page.locator("#actionFiled").fill("2026-11-30");
 if(!(await page.locator("#lawStatus").innerText()).includes("não se aplicam"))throw Error("Direito transitório antigo");
 await page.locator("#actionFiled").fill("2026-12-02");
 if(!(await page.locator("#lawStatus").innerText()).includes("novas redações"))throw Error("Direito transitório novo");
 await page.goto(new URL(url,page.url()).href);
 if(!(await page.locator("#assunto").inputValue()).includes("Ação administrativa"))throw Error("Assunto genérico não importado");
 if((await page.locator("#processo").inputValue())!=="")throw Error("Dados de processo transportados");
 if(!(await page.locator("#saida").inputValue()).includes("Ação administrativa"))throw Error("Assunto não incorporado na minuta");
});
await check("Minutas: gerar texto e manter nomes introduzidos",async()=>{
 await open("minutas.html");
 await page.locator("#processo").fill("EXEMPLO/2026");
 await page.locator("#factos").fill("Foi junto um requerimento de teste.");
 await page.locator("#tipo").selectOption("certidao");
 await page.locator("#gerar").click();
 const output=await page.locator("#saida").inputValue();
 if(!output.includes("CERTIDÃO")||!output.includes("EXEMPLO/2026")||!output.includes("requerimento de teste"))throw Error("Minuta não foi gerada");
 await page.locator("#saida").fill("TEXTO EDITADO PELO UTILIZADOR");
 const rtf=page.waitForEvent("download");
 await page.locator("#rtf").click();
 const file=await rtf;
 if(!file.suggestedFilename().endsWith(".rtf"))throw Error("Exportação RTF inválida");
 const fs=await import("node:fs");
 if(!fs.readFileSync(await file.path(),"utf8").includes("TEXTO EDITADO PELO UTILIZADOR"))throw Error("Edição manual não preservada no RTF");
 const txt=page.waitForEvent("download");
 await page.locator("#descarregar").click();
 const download=await txt;
 if(!fs.readFileSync(await download.path(),"utf8").includes("TEXTO EDITADO PELO UTILIZADOR"))throw Error("Edição manual não preservada no TXT");
});
await check("Roteiros: mudar tipo, assinalar e repor",async()=>{
 await open("roteiros.html");
 await page.locator("#roteiro").selectOption("prazo");
 if(!((await page.locator("#count").innerText()).includes("0 de 7")))throw Error("Roteiro errado");
 await page.locator("#list input").first().check();
 if(!((await page.locator("#count").innerText()).includes("1 de 7")))throw Error("Progressão errada");
 await page.locator("#reset").click();
 if(!((await page.locator("#count").innerText()).includes("0 de 7")))throw Error("Reposição falhou");
});
await check("Cita-Check: interface e unidade do prazo",async()=>{
 await open("citacheck.html");
 if(await page.locator("#prazoUnidade").count()!==1)throw Error("Seleção de dias/meses/anos ausente");
 if(await page.locator("#tipoAto").count()!==1)throw Error("Seletor de modalidade ausente");
});
await check("Anonimizador: proteção de camada de texto ligada por predefinição",async()=>{
 await open("anonimizador.html");
 if(!(await page.locator("#raster").isChecked()))throw Error("Modo de rasterização não está ativo por predefinição");
 const note=await page.locator("#rasterNote").innerText();
 if(!note.includes("conserva texto")&&!note.includes("camada de texto"))throw Error("Aviso de segurança ausente");
});
await check("Regimes CPA e CPPT: cálculos e cronologia",async()=>{
 await open("regimes.html");
 await page.locator("#start").fill("2026-11-16");
 await page.locator("#days").fill("10");
 await page.locator("#regime").selectOption("cpa87");
 await page.locator("#calculate").click();
 if(!(await page.locator("#endDate").innerText()).includes("30/11/2026"))throw Error("CPA: prazo errado");
 if(await page.locator("#timeline tr").count()!==14)throw Error("CPA: cronologia incompleta");
 await page.locator("#regime").selectOption("cppt20_1");
 await page.locator("#calculate").click();
 if(!(await page.locator("#endDate").innerText()).includes("26/11/2026"))throw Error("CPPT: prazo errado");
 await page.locator("#start").fill("2026-07-15");
 await page.locator("#days").fill("2");
 await page.locator("#calculate").click();
 if(!(await page.locator("#endDate").innerText()).includes("17/07/2026"))throw Error("Férias judiciais suspenderam indevidamente prazo CPPT");
 await page.locator("#start").fill("2026-06-23");
 await page.locator("#days").fill("1");
 await page.locator("#municipality").selectOption("porto");
 await page.locator("#calculate").click();
 if(!(await page.locator("#endDate").innerText()).includes("25/06/2026"))throw Error("Feriado municipal ignorado");
});
await check("Anonimizador: página própria",async()=>{
 await open("anonimizador.html");
 if(!((await page.locator("h1").first().innerText()).includes("Anonimizador")))throw Error("Página errada");
});
const mobile=await browser.newPage({viewport:{width:390,height:844}});
await check("Página inicial em largura de telemóvel",async()=>{
 await mobile.goto(pathToFileURL(resolve("index.html")).href,{waitUntil:"domcontentloaded"});
 const overflow=await mobile.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+2);
 if(overflow)throw Error("Deslocação horizontal excessiva");
});
await browser.close();
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("7 testes de navegação e interface concluídos.");
