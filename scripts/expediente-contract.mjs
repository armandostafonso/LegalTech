import fs from "node:fs";
import vm from "node:vm";
const canonical=JSON.parse(fs.readFileSync("rules/expediente.json","utf8"));
const context={window:{}};
vm.runInNewContext(fs.readFileSync("assets/expediente.js","utf8"),context,{timeout:2000});
if(JSON.stringify(canonical)!==JSON.stringify(context.window.LegalTechExpediente))throw Error("Catálogo publicado de expediente difere da fonte JSON");
if(canonical.types.length!==6)throw Error("Esperados seis tipos de expediente");
const types=new Set(),allowed=new Set(["citacao","notificacao","oficio","conclusao","remessa","certidao"]);
for(const type of canonical.types){
 if(types.has(type.id)||!allowed.has(type.id))throw Error("Tipo repetido ou desconhecido: "+type.id);
 types.add(type.id);
 if(!type.name||!type.warning||type.checks.length<6)throw Error("Ficha de expediente incompleta: "+type.id);
 const checks=new Set();
 for(const [id,label] of type.checks){
  if(checks.has(id)||!id||!label||label.length<25)throw Error("Item de expediente inválido em "+type.id);
  checks.add(id);
 }
}
console.log("Contrato de expediente aprovado: seis atos, checklists distintas e modelos seguros.");
