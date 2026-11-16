/* Ecrãs de iPad: smoke funcional com WebKit Linux, aproxima o motor Safari.
 * Não substitui testes em iPadOS/Safari físico nem auditoria jurídica. */
import {webkit} from "playwright";
import {pathToFileURL} from "node:url";
import {resolve} from "node:path";
import fs from "node:fs";

const browser=await webkit.launch({headless:true});
const context=await browser.newContext({viewport:{width:820,height:1180},deviceScaleFactor:2,hasTouch:true,acceptDownloads:true});
const page=await context.newPage();
const failures=[],errors=[];
page.on("pageerror",error=>errors.push(error.message));
async function open(name){
 await page.goto(pathToFileURL(resolve(name)).href,{waitUntil:"domcontentloaded",timeout:30000});
 const w=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 if(w.scroll>w.width+3)throw Error(name+": rolagem horizontal inesperada");
 const count=await page.locator(".lt-theme-control").count();
 if(count!==1)throw Error(name+": comando Claro/Escuro ausente ou duplicado");
}
async function check(label,task){
 try{await task();console.log("✓ WebKit:",label)}
 catch(e){failures.push(label+": "+e.message);console.error("✗ WebKit:",label,e.message)}
}
await check("Catálogo: pesquisa e filtro de ferramentas",async()=>{
 await open("index.html");
 await page.locator('.filters button[data-filter="documentos"]').click();
 if(!(await page.locator(".tool[href='compare.html']").isVisible()))throw Error("Comparador não aparece na categoria");
 await page.locator("#search").fill("Compare");
 if(await page.locator(".tool:visible").count()!==1)throw Error("Pesquisa combinada não funciona");
});
await check("Assistant: negação bloqueada",async()=>{
 await open("assistant.html");
 await page.locator("#source").fill("Não notifique a entidade, mesmo que exista requerimento.");
 await page.locator("#analyse").click();
 if(await page.locator("#items input").count()||await page.locator("#txt").isEnabled())throw Error("Plano de ato indevido perante proibição");
});
await check("Notify: rascunho genérico editável",async()=>{
 await open("notify.html");
 await page.locator("#kind").selectOption("renuncia");
 await page.locator("#draft").click();
 if(!(await page.locator("#output").inputValue()).includes("[conferir nos autos]"))throw Error("Destinatário presumido");
});
await check("Hearing: RTF exportado com edição manual",async()=>{
 await open("hearing.html");
 await page.locator("#date").fill("2026-11-16");
 await page.locator("#generate").click();
 await page.locator("#output").fill("Ata fictícia revista no iPad.");
 const promise=page.waitForEvent("download");
 await page.locator("#rtf").click();
 const file=await promise;
 if(!file.suggestedFilename().endsWith(".rtf"))throw Error("Ficheiro RTF não descarregado");
 const rtf=fs.readFileSync(await file.path(),"utf8");
 if(!rtf.includes("Ata fict")||!rtf.includes("revista no iPad."))throw Error("Edição não preservada");
 if(!rtf.includes("\\u237?"))throw Error("Acentuação portuguesa não foi codificada em RTF");
});
await check("Agenda: exportação ICS",async()=>{
 await open("agenda.html");
 await page.locator("#date").fill("2026-11-20");
 await page.locator("#add").click();
 const promise=page.waitForEvent("download");
 await page.locator("#ics").click();
 const file=await promise;
 if(!fs.readFileSync(await file.path(),"utf8").includes("DTSTART;VALUE=DATE:20261120"))throw Error("Data ICS divergente");
});
await check("PA: índice de texto sem dependência de rede",async()=>{
 await open("pa.html");
 await page.locator("#source").fill("05/01/2026 — Documento de teste");
 await page.locator("#analyse").click();
 if(await page.locator("#rows tr").count()!==1)throw Error("Indexação de data falhou");
});
await check("Mapa TAF: seleção de fase",async()=>{
 await open("mapa-taf.html");
 await page.locator("#workflow").selectOption("acao-administrativa");
 await page.locator("#next").click();
 if(!(await page.locator("#name").innerText()).includes("Citação"))throw Error("Navegação de fases falhou");
});
await check("Tema Claro/Escuro: alternância no WebKit",async()=>{
 await open("minutas.html");
 const before=await page.locator("html").getAttribute("data-theme");
 await page.locator(".lt-theme-control").click();
 const after=await page.locator("html").getAttribute("data-theme");
 if(before===after||!["light","dark"].includes(after))throw Error("Tema não mudou");
});
await browser.close();
if(errors.length)failures.push("Exceções JavaScript: "+errors.join(" | "));
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("WebKit/iPad: oito percursos de navegação e edição aprovados. Não substitui ensaio em Safari iPadOS real.");
