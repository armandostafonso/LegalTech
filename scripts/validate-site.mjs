import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const pages=["index.html","anonimizador.html","citacheck.html","minutas.html","roteiros.html"];
const errors=[];
let scriptsChecked=0,linksChecked=0,idsChecked=0;
for(const file of pages){
 const html=fs.readFileSync(file,"utf8");
 if(!/<html[^>]*lang="pt-PT"/.test(html)) errors.push(file+": lang pt-PT em falta");
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
if(errors.length){console.error("Problemas encontrados:\n"+errors.join("\n"));process.exit(1)}
console.log("Validação aprovada:",pages.length,"páginas,",scriptsChecked,"scripts,",linksChecked,"recursos locais e",idsChecked,"IDs.");
