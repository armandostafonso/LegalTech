import fs from "node:fs";
import vm from "node:vm";
const canonical=JSON.parse(fs.readFileSync("rules/roteiros-taf.json","utf8"));
const context={window:{}};
vm.runInNewContext(fs.readFileSync("assets/roteiros-taf.js","utf8"),context,{timeout:2000});
const published=context.window.LegalTechRoteirosTAF;
if(JSON.stringify(canonical)!==JSON.stringify(published))throw Error("Catálogo TAF diverge do ficheiro normativo");
const fichaSource=JSON.parse(fs.readFileSync("rules/fichas-taf.json","utf8"));
const fichaContext={window:{}};
vm.runInNewContext(fs.readFileSync("assets/fichas-taf.js","utf8"),fichaContext,{timeout:2000});
if(JSON.stringify(fichaSource)!==JSON.stringify(fichaContext.window.LegalTechFichasTAF))throw Error("Fichas e código de navegação divergentes");
if(fichaSource.fichas.length!==canonical.workflows.length)throw Error("Cobertura de fichas incompleta");
const validDrafts=new Set(["cota","oficio","certidao","notificacao","remessa"]);
for(const wf of canonical.workflows){
 const ficha=fichaSource.fichas.find(x=>x.id===wf.id);
 if(!ficha||ficha.stages.length!==wf.stages.length)throw Error("Ficha incompleta: "+wf.id);
 for(const step of wf.stages){
  const fspec=ficha.stages.find(x=>x.id===step.id);
  if(!fspec||fspec.check_before.length<3||fspec.do_not_assume.length<2||!validDrafts.has(fspec.draft_kind))throw Error("Ficha ou minuta inválida: "+wf.id+"/"+step.id);
  const offices=step.steps.filter(x=>x.startsWith("Secretaria | ")).length;
  const judicial=step.steps.filter(x=>x.startsWith("Juiz / despacho | ")).length;
  if(fspec.secretaria!==offices||fspec.judicial!==judicial)throw Error("Números divergentes: "+wf.id+"/"+step.id);
 }
}
const ids=new Set();
for(const w of canonical.workflows){
 if(ids.has(w.id))throw Error("Espécie repetida: "+w.id);ids.add(w.id);
 if(!w.name||!w.urgency||w.stages.length<2||!w.basis.length)throw Error("Roteiro incompleto: "+w.id);
 for(const b of w.basis){if(!b.url.startsWith("https://"))throw Error("Fonte inválida");}
 for(const stage of w.stages){if(!stage.id||!stage.name||stage.steps.length<3)throw Error("Fase incompleta: "+w.id);}
}
if(ids.size!==7)throw Error("Esperados sete roteiros processuais");
const info=canonical.workflows.find(x=>x.id==="intimacao-informacao");
if(!info.stages.find(x=>x.id==="citacao").steps.some(s=>s.includes("dez dias")))throw Error("Artigo 107 CPTA ausente");
const tax=canonical.workflows.find(x=>x.id==="intimacao-tributaria");
if(!tax.basis.some(x=>x.article.includes("146.º")))throw Error("Artigo 146 CPPT não documentado");
const action=canonical.workflows.find(x=>x.id==="acao-administrativa");
if(!action.notes.includes("01-12-2026")||!action.basis.some(x=>x.article.includes("164/2026")))throw Error("Falta aviso da alteração legislativa");
const imp=canonical.workflows.find(x=>x.id==="impugnacao-judicial");
if(!imp.notes.includes("três meses")||!imp.basis.some(x=>x.article.includes("110.º")))throw Error("Falta contestação do art. 110 CPPT");
const caution=canonical.workflows.find(x=>x.id==="providencia-cautelar");
if(!caution.notes.includes("48 horas")||!caution.notes.includes("dez dias"))throw Error("Faltam artigos 116 e 117 CPTA");
const appeal=canonical.workflows.find(x=>x.id==="recurso");
if(!appeal.basis.some(x=>x.article.includes("279.º")))throw Error("Falta remissão CPPT recursos");
for(const w of [action,imp,caution,appeal]){
 if(!w.stages.some(stage=>stage.steps.some(text=>text.startsWith("Juiz / despacho | "))))throw Error("Roteiro sem decisões dependentes de despacho: "+w.id);
 if(!w.stages.some(stage=>stage.steps.some(text=>text.startsWith("Secretaria | "))))throw Error("Roteiro sem atos de secretaria: "+w.id);
}
console.log("Contrato TAF e fichas complementares: sete roteiros, 25 fases e minutas coerentes.");
