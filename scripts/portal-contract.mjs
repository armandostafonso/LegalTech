import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const errors=[];
const exists=p=>fs.existsSync(path.resolve(p));
const window={};
const js=fs.readFileSync("assets/portal-data.js","utf8");
try{vm.runInNewContext(js,{window},{filename:"assets/portal-data.js",timeout:1000});}catch(e){errors.push("Catálogo não executável: "+e.message)}
const data=window.LegalTechPortalCatalog;
if(!data||!Array.isArray(data.items))errors.push("Catálogo inexistente ou inválido");
else{
 const categories=new Set(Object.keys(data.categories||{}));
 const ids=new Set();
 if(data.items.length<24)errors.push("Catálogo demasiado reduzido");
 for(const item of data.items){
  if(!categories.has(item.category))errors.push("Categoria desconhecida: "+item.id);
  if(!/^[a-z0-9-]+$/.test(item.id)||ids.has(item.id))errors.push("Identificador inválido/duplicado: "+item.id);
  ids.add(item.id);
  if(!item.title||!item.description||!item.source||!item.keywords)errors.push("Entrada incompleta: "+item.id);
  if(item.url.startsWith("https://")){
   try{const u=new URL(item.url);if(u.protocol!=="https:"||u.username||u.password||u.hash)errors.push("Ligação insegura: "+item.id)}catch(_){errors.push("URL inválido: "+item.id)}
  }else if(!/^[\p{L}\p{N}-]+\.html$/u.test(item.url)||!exists(item.url))errors.push("Ligação interna inexistente: "+item.id);
 }
 if(!categories.has("tribunais")||!categories.has("jurisprudencia")||!categories.has("ferramentas"))errors.push("Categorias essenciais em falta");
}
const page=fs.readFileSync("portal.html","utf8");
for(const id of ["portal-search","portal-filters","portal-only","portal-count","portal-grid","portal-clear"]){
 if(!page.includes('id="'+id+'"'))errors.push("Controlo da interface em falta: "+id);
}
for(const asset of ["assets/portal-data.js","assets/portal.js","assets/portal.css"]){
 if(!page.includes('"'+asset+'"'))errors.push("Recurso não incluído em portal.html: "+asset);
 if(!exists(asset))errors.push("Recurso em falta: "+asset);
}
for(const path of ["index.html","assets/suite-nav.js","privacidade.html","README.md"]){
 const content=fs.readFileSync(path,"utf8");
 if(!content.includes("portal.html")&&path!=="privacidade.html")errors.push("Integração com Portal em falta: "+path);
 if(path==="privacidade.html"&&!content.includes("legaltech_portal_favorites_v1"))errors.push("Aviso de privacidade dos favoritos em falta");
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log("Portal validado:",data.items.length,"recursos, categorias:",Object.keys(data.categories).length,", IDs únicos, URLs e integração.");
