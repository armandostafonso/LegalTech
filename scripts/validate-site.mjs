import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const pages=["index.html","anonimizador.html","citacheck.html","minutas.html","roteiros.html","tramitação-taf.html","regimes.html","agenda.html","privacidade.html","custas.html"];
const errors=[];
let scriptsChecked=0,linksChecked=0,idsChecked=0;
for(const file of pages){
 const html=fs.readFileSync(file,"utf8");
 if(!/<html[^>]*lang="pt-PT"/.test(html)) errors.push(file+": lang pt-PT em falta");
 // Contrato de identidade: todas as páginas têm a mesma folha, boot e controlador.
 if(!html.includes('href="assets/brand.css"')) errors.push(file+": identidade visual comum em falta");
 if(!html.includes('src="assets/theme.js"')) errors.push(file+": controlador de tema em falta");
 if(!html.includes('id="lt-theme-bootstrap"')) errors.push(file+": arranque do tema em falta");
 if(!html.includes('href="index.html"')) errors.push(file+": navegação para início em falta");
 const themeScriptPos=html.indexOf('src="assets/theme.js"');
 if(themeScriptPos!==-1 && themeScriptPos>html.indexOf("</body>")) errors.push(file+": script de tema após o body");
 const ids=new Set();
 for(const match of html.matchAll(/\bid="([^"]+)"/g)){
   idsChecked++;
   if(ids.has(match[1]))errors.push(file+": ID duplicado: "+match[1]);
   ids.add(match[1]);
 }
 for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){
   const ref=match[1];
   if(/^(https?:|data:|#|mailto:|javascript:)/i.test(ref)) continue;
   const local=ref.split(/[?#]/)[0];
   if(!local)continue;
   linksChecked++;
   if(!fs.existsSync(path.join(path.dirname(file),local)))errors.push(file+": recurso local em falta: "+ref);
 }
 let i=0;
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
   if(/\bsrc\s*=/.test(match[1])) continue;
   i++;
   try{new vm.Script(match[2],{filename:file+":script"+i});scriptsChecked++}
   catch(e){errors.push(file+": "+e.message)}
 }
 if(!html.includes("</html>"))errors.push(file+": HTML incompleto");
}
for(const asset of ["assets/brand.css","assets/ux.css","assets/theme.js","assets/legaltech-mark.svg","favicon.svg","site.webmanifest"]){
 if(!fs.existsSync(asset))errors.push("Recurso de identidade em falta: "+asset);
}
const manifest=JSON.parse(fs.readFileSync("site.webmanifest","utf8"));
if(manifest.start_url!=="./index.html"||manifest.scope!=="./")errors.push("Manifesto fora do âmbito LegalTech");
if(!manifest.icons?.length||!manifest.icons.every(icon=>fs.existsSync(icon.src.replace(/^\.\//,""))))errors.push("Ícone do manifesto inválido");
const themeCode=fs.readFileSync("assets/theme.js","utf8");
try { new vm.Script(themeCode,{filename:"assets/theme.js"}); scriptsChecked++ }
catch(e) { errors.push("assets/theme.js: "+e.message) }
for(const key of ["legaltech_theme","data-theme","aria-label","MutationObserver"]){
 if(!themeCode.includes(key))errors.push("Controlador de tema sem "+key);
}
const css=fs.readFileSync("assets/brand.css","utf8");
for(const key of [':root[data-theme="dark"]',"--lt-navy","--lt-gold",".lt-theme-control"]){
 if(!css.includes(key))errors.push("Identidade visual sem "+key);
}
if(errors.length){console.error("Problemas encontrados:\n"+errors.join("\n"));process.exit(1)}
console.log("Validação aprovada:",pages.length,"páginas,",scriptsChecked,"scripts,",linksChecked,"recursos locais e",idsChecked,"IDs.");
