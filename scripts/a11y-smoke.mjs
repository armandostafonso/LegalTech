import { chromium } from "playwright";
import axe from "axe-core";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser=await chromium.launch({headless:true});
const pages=["index.html","minutas.html","roteiros.html","tramitação-taf.html","regimes.html","agenda.html","expediente.html"];
const problems=[];
for(const filename of pages){
 for(const width of [390,820]){
  const page=await browser.newPage({viewport:{width,height:860}});
  try{
   await page.goto(pathToFileURL(resolve(filename)).href,{waitUntil:"domcontentloaded",timeout:30000});
   await page.addScriptTag({content:axe.source});
   const result=await page.evaluate(async()=>await window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa"]}}));
   const significant=result.violations.filter(v=>["critical","serious"].includes(v.impact));
   for(const item of significant)problems.push(filename+" "+width+"px: "+item.id+" ("+item.impact+") → "+item.nodes.map(n=>n.target.join(",")).slice(0,3).join(" | "));
   const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,window:innerWidth}));
   if(dims.scroll>dims.window+3)problems.push(filename+" "+width+"px: horizontal scroll "+dims.scroll+"px");
   const button=page.locator(".lt-theme-control");
   if(await button.count()!==1){problems.push(filename+": comando Claro-Escuro ausente/duplicado")}
   else{
    await button.click();
    if(await page.locator("html").getAttribute("data-theme")!=="dark")problems.push(filename+": alteração de tema não aplicada");
   }
  }finally{await page.close()}
 }
}
await browser.close();
if(problems.length){console.error(problems.join("\n"));process.exit(1)}
console.log("Verificação de acessibilidade: "+pages.length+" páginas × 2 larguras, WCAG A/AA e modo escuro.");
