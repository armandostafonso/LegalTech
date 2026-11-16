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
 if(await page.locator(".tool:visible").count()!==4)throw Error("Ferramentas não recuperadas");
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
