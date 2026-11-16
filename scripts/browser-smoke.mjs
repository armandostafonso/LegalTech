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
await check("Página inicial e pesquisa",async()=>{
 await open("index.html");
 const h=await page.locator("h1").innerText();
 if(!h.includes("Menos tarefas"))throw Error("Título inesperado");
 await page.locator("#search").fill("minuta");
 if(await page.locator(".tool:visible").count()!==1)throw Error("Pesquisa não filtra para uma ferramenta");
 await page.locator("#search").fill("");
 if(await page.locator(".tool:visible").count()!==6)throw Error("Ferramentas não recuperadas");
});
await check("Tramitação TAF: fases, urgência, progressão e remissão CPPT",async()=>{
 await open("tramitação-taf.html");
 if(await page.locator("#workflow option").count()!==7)throw Error("Roteiros TAF incompletos");
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
});
await check("Minutas: gerar texto e manter nomes introduzidos",async()=>{
 await open("minutas.html");
 await page.locator("#processo").fill("EXEMPLO/2026");
 await page.locator("#factos").fill("Foi junto um requerimento de teste.");
 await page.locator("#tipo").selectOption("certidao");
 await page.locator("#gerar").click();
 const output=await page.locator("#saida").innerText();
 if(!output.includes("CERTIDÃO")||!output.includes("EXEMPLO/2026")||!output.includes("requerimento de teste"))throw Error("Minuta não foi gerada");
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
