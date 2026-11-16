import fs from "node:fs";
import vm from "node:vm";
const canonical=JSON.parse(fs.readFileSync("rules/roteiros-taf.json","utf8"));
const context={window:{}};
vm.runInNewContext(fs.readFileSync("assets/roteiros-taf.js","utf8"),context,{timeout:2000});
const published=context.window.LegalTechRoteirosTAF;
if(JSON.stringify(canonical)!==JSON.stringify(published))throw Error("Catálogo TAF diverge do ficheiro normativo");
const ids=new Set();
for(const w of canonical.workflows){
 if(ids.has(w.id))throw Error("Espécie repetida: "+w.id);ids.add(w.id);
 if(!w.name||!w.urgency||w.stages.length<2||!w.basis.length)throw Error("Roteiro incompleto: "+w.id);
 for(const b of w.basis){if(!b.url.startsWith("https://"))throw Error("Fonte inválida");}
 for(const stage of w.stages){if(!stage.id||!stage.name||stage.steps.length<3)throw Error("Fase incompleta: "+w.id);}
}
if(ids.size!==3)throw Error("Esperados três roteiros iniciais");
const info=canonical.workflows.find(x=>x.id==="intimacao-informacao");
if(!info.stages.find(x=>x.id==="citacao").steps.some(s=>s.includes("dez dias")))throw Error("Artigo 107 CPTA ausente");
const tax=canonical.workflows.find(x=>x.id==="intimacao-tributaria");
if(!tax.basis.some(x=>x.article.includes("146.º")))throw Error("Artigo 146 CPPT não documentado");
console.log("Contrato TAF aprovado: três roteiros, respetivas fases e fontes.");
