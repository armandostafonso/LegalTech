import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
const browser=await chromium.launch({headless:true});
const paths=["minutas.html","tramitação-taf.html","agenda.html","expediente.html"];
const violations=[];
for(const filename of paths){
 const page=await browser.newPage({acceptDownloads:true});
 const network=[];
 page.on("request",request=>{if(/^https?:\/\//.test(request.url()))network.push(request.url())});
 await page.goto(pathToFileURL(resolve(filename)).href,{waitUntil:"domcontentloaded"});
 if(filename==="minutas.html"){
   await page.locator("#processo").fill("FICTICIO/2026");
   await page.locator("#factos").fill("Evento meramente fictício");
   await page.locator("#gerar").click();
   await page.reload();
   if(await page.locator("#processo").inputValue())violations.push("Minutas: dados persistiram após recarga");
   await page.goto(pathToFileURL(resolve("minutas.html")).href+"?tipo=cota&assunto="+encodeURIComponent("<img src=x onerror=alert(1)>"));
   const value=await page.locator("#saida").inputValue();
   if(!value.includes("<img src=x onerror=alert(1)>"))violations.push("Minutas: parâmetro textual perdido");
   if(await page.locator("#saida img").count())violations.push("Minutas: HTML injetado por parâmetros");
 }
 if(filename==="expediente.html"){
   await page.locator("#type").selectOption("citacao");
   await page.locator("#items input").first().check();
   await page.reload();
   if((await page.locator("#metric").innerText()).includes("1 de"))violations.push("Expediente: estado persistiu após recarga");
   const unsafe=page.url().split("?")[0]+"?tipo="+encodeURIComponent('<img src=x onerror=alert(1)>');
   await page.goto(unsafe);
   if(await page.locator("#type").inputValue()!=="citacao")violations.push("Expediente: parâmetro inesperado aceite");
   if(await page.locator("img").count())violations.push("Expediente: HTML injetado");
 }
 if(filename==="agenda.html"){
   await page.locator("#date").fill("2026-11-20");
   await page.locator("#add").click();
   await page.reload();
   if(await page.locator(".event").count())violations.push("Agenda: eventos persistidos");
 }
 if(filename==="tramitação-taf.html"){
   await page.locator("#workflow").selectOption("acao-administrativa");
   await page.locator("#phase").selectOption("citacao");
   await page.locator("#detailGuide").evaluate(node=>node.open=true);
   const href=await page.locator("#draftLink").getAttribute("href");
   if(!href||/[?&](?:processo|nome|parte|morada|numero)=/i.test(href))violations.push("TAF: URL contém dados de processos");
 }
 if(network.length)violations.push(filename+": fez "+network.length+" pedidos de rede: "+network.slice(0,3).join(", "));
 await page.close();
}
await browser.close();
if(violations.length){console.error(violations.join("\n"));process.exit(1)}
console.log("Verificação de privacidade: minutas, Tramitação TAF e agenda sem transmissão nem persistência de dados de teste.");
