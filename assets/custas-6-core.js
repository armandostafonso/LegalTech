(function(root,factory){
  "use strict";
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.Custas6Core=api;
})(typeof window!=="undefined"?window:null,function(){
 "use strict";
 const yearMin=2009,yearMax=2099;
 const iaBrackets=[[2000,1],[8000,2],[16000,3],[24000,4],[30000,5],[40000,6],[60000,7],[80000,8],[100000,9],[150000,10],[200000,12],[250000,14],[275000,16]];
 function ucForYear(year){
  const y=Number(year);
  return Number.isInteger(y)&&y>=2010&&y<=2026?102:null;
 }
 function parseCents(value){
  const raw=String(value??"").trim().replace(/\s/g,"").replace(",",".");
  if(!raw||!/^(?:\d+)(?:\.\d{1,2})?$/.test(raw))return null;
  const n=Number(raw),c=Math.round(n*100);
  return Number.isSafeInteger(c)&&c>=0?c:null;
 }
 function suggestIA(baseCents,ucCents){
  if(!Number.isSafeInteger(baseCents)||baseCents<=0||baseCents>27500000||
     !Number.isSafeInteger(ucCents)||ucCents<=0)return null;
  const units=iaBrackets.find(([limit])=>baseCents<=limit*100)?.[1];
  return units?{units,cents:units*ucCents}:null;
 }
 function normalizeRows(input){
  return Array.isArray(input)?input:[];
 }
 function summary(data){
  const parties=normalizeRows(data.parties);
  const charges=normalizeRows(data.charges);
  const expenses=normalizeRows(data.expenses);
  const sanctions=normalizeRows(data.sanctions);
  const movements=normalizeRows(data.movements);
  const accounts=parties.map(p=>({id:p.id,label:p.label||"Interveniente sem identificação",role:p.role||"",
    charges:0,expenses:0,sanctions:0,payments:0,refunds:0,
    confirmedMovements:0,unverified:0,positive:0,excess:0,netPayments:0,due:0,
    exemption:p.exemption||"unknown",aid:p.aid||"unknown",share:p.share??null
  }));
  const byId=new Map(accounts.map(x=>[x.id,x]));
  const warnings=[];
  const sums={charges:0,expenses:0,sanctions:0,payments:0,refunds:0,positive:0,excess:0};
  for(const [list,key] of [[charges,"charges"],[expenses,"expenses"],[sanctions,"sanctions"]]){
   for(const item of list){
    const a=byId.get(item.personId);
    if(!a){warnings.push("Rubrica sem responsável válido: "+(item.label||item.ref||"sem referência"));continue}
    if(!Number.isSafeInteger(item.cents)||item.cents<0){warnings.push("Montante inválido: "+(item.label||"rubrica"));continue}
    a[key]+=item.cents;sums[key]+=item.cents;
    if(item.verified!==true)a.unverified++;
    if(key==="sanctions"&&["coima","penal"].includes(item.kind)){
     warnings.push("Coimas ou multas penais podem exigir liquidação e formulários próprios: "+(item.label||"sem designação"));
    }
   }
  }
  for(const ch of charges){
   if(ch.year===2009||ch.year===2012||ch.year===2026)
    warnings.push("Processo autónomo "+(ch.ref||ch.impulse||"sem referência")+": confirmar a data e o regime legal do ano "+ch.year+".");
   if(ch.year>2026)warnings.push("Processo autónomo "+(ch.ref||ch.impulse||"sem referência")+": UC futura por verificar.");
  }
  for(const movement of movements){
   const a=byId.get(movement.personId);
   if(!a){warnings.push("Movimento financeiro sem responsável válido.");continue}
   if(!Number.isSafeInteger(movement.cents)||movement.cents<=0){warnings.push("Movimento financeiro de valor inválido.");continue}
   if(movement.status!=="confirmed")continue;
   if(movement.kind==="payment"){a.payments+=movement.cents; a.confirmedMovements++;sums.payments+=movement.cents}
   else if(movement.kind==="refund"){a.refunds+=movement.cents;a.confirmedMovements++;sums.refunds+=movement.cents}
  }
  for(const a of accounts){
   a.due=a.charges+a.expenses+a.sanctions;
   a.netPayments=a.payments-a.refunds;
   a.positive=Math.max(0,a.due-a.netPayments);
   a.excess=Math.max(0,a.netPayments-a.due);
   sums.positive+=a.positive;sums.excess+=a.excess;
   if(a.unverified)warnings.push(a.label+": "+a.unverified+" rubrica(s) sem confirmação documental.");
   if(a.aid==="full"||a.exemption==="yes")
    warnings.push(a.label+": apoio judiciário ou isenção assinalados; não presumir exigibilidade.");
   if(a.aid==="unknown"||a.exemption==="unknown")warnings.push(a.label+": situação de isenção ou apoio judiciário por confirmar.");
   if(a.netPayments<0)warnings.push(a.label+": restituições superiores aos pagamentos confirmados.");
  }
  const allocated=accounts.filter(a=>a.share!==null&&a.share!==undefined);
  if(allocated.length===accounts.length&&allocated.length>0){
   const sum=allocated.reduce((n,a)=>n+Number(a.share),0);
   if(!Number.isFinite(sum)||Math.abs(sum-100)>0.0001)
    warnings.push("As percentagens de responsabilidade indicadas não totalizam 100 %.");
  }else if(allocated.length>0){
   warnings.push("A repartição da responsabilidade é incompleta. Conferir decisão judicial.");
  }
  if(!accounts.length)warnings.push("Ainda não foram identificados responsáveis.");
  if(!charges.length)warnings.push("Não existem taxas de justiça ou processos autónomos registados.");
  if(movements.some(m=>["payment","refund"].includes(m.kind)&&m.status!=="confirmed"))
   warnings.push("Existem pagamentos ou restituições pendentes não contabilizados.");
  if(sums.positive&&sums.excess)warnings.push("Excessos de uma parte não abatem automaticamente a diferenças positivas de outra.");
  const year=Number(data.year);
  if(year===2009)warnings.push("Em 2009 houve alteração do valor da UC durante o ano: confirmar a data exacta de início de cada processo autónomo.");
  if(year===2012)warnings.push("Em 2012 existem alterações legais intra-anuais: confirmar a data exacta para definir o regime.");
  if(year===2026)warnings.push("Em 2026 há alterações legais com efeitos em datas diferentes: confirmar o regime de cada impulso.");
  if(year>2026)warnings.push("Valor da UC e versão do RCP após 2026 exigem confirmação.");
  if(data.dispensa==="yes")warnings.push("Foi indicada dispensa de elaboração da conta: documentar os pressupostos nos autos (RCP 29.º e Portaria 419-A/2009, art. 7.º-A).");
  if(data.dispensa==="unknown")warnings.push("Falta verificar se existem pressupostos de dispensa da conta (RCP 29.º).");
  if(data.agreement!==true)warnings.push("Falta confirmar a conferência integral dos autos e dos comprovativos.");
  return {accounts,sums,warnings,accountRequired:data.dispensa!=="yes"};
 }

 // Importação de projectos: contrato de dados estrito, sem executar conteúdo externo.
 function validateProject(file){
  const fail=message=>{throw new Error("Ficheiro de projecto inválido: "+message)};
  if(!file||typeof file!=="object"||file.format!=="legaltech-custas-seis-passos"||file.version!==1)
   fail("versão ou formato não reconhecido.");
  if(!file.data||typeof file.data!=="object"||!file.fields||typeof file.fields!=="object")
   fail("dados incompletos.");
  const cleanString=(v,max=160,required=false)=>{
   if(typeof v!=="string"||v.length>max||(required&&!v.trim()))fail("campo de texto inválido.");
   return v;
  };
  const integer=(v,positive=false)=>{
   if(!Number.isSafeInteger(v)||v< (positive?1:0)||v>1e12)fail("montante ou identificador inválido.");
   return v;
  };
  const inSet=(v,allowed)=>{if(!allowed.includes(v))fail("opção desconhecida.");return v};
  const lists=["parties","charges","expenses","movements","sanctions"];
  for(const key of lists)if(!Array.isArray(file.data[key])||file.data[key].length>200)fail("lista "+key+" inválida ou demasiado extensa.");
  const ids=new Set();
  const entryId=v=>{const id=integer(v,true);if(ids.has(id))fail("identificador repetido.");ids.add(id);return id};
  const people=file.data.parties.map(p=>{
   if(!p||typeof p!=="object")fail("interveniente inválido.");
   const share=p.share===null?null:Number(p.share);
   if(share!==null&&(!Number.isFinite(share)||share<0||share>100||Math.round(share*100)!==share*100))fail("percentagem de responsabilidade inválida.");
   return {id:entryId(p.id),label:cleanString(p.label,70,true),
    role:inSet(p.role,["Autor","Demandado","Contrainteressado","Outro"]),
    aid:inSet(p.aid,["unknown","none","full","instalments","other"]),
    exemption:inSet(p.exemption,["unknown","no","yes"]),share};
  });
  const personIds=new Set(people.map(p=>p.id));
  const personId=v=>{if(!personIds.has(v))fail("referência a interveniente inexistente.");return v};
  const charges=file.data.charges.map(x=>({
    id:entryId(x.id),personId:personId(x.personId),
    origin:inSet(x.origin,["Acção principal","Recurso","Incidente","Procedimento cautelar","Outro processo autónomo"]),
    impulse:inSet(x.impulse,["Petição inicial","Contestação","Recurso","Incidente","Outro"]),
    table:inSet(x.table,["IA","IB","IC","IIA","IIB","other"]),
    year:(()=>{if(!Number.isInteger(x.year)||x.year<2009||x.year>2099)fail("ano do impulso inválido.");return x.year})(),
    baseCents:integer(x.baseCents,true),cents:integer(x.cents),
    basis:cleanString(x.basis,180,true),ref:cleanString(x.ref,75),
    verified:x.verified===true
  }));
  const expenses=file.data.expenses.map(x=>({
   id:entryId(x.id),personId:personId(x.personId),cents:integer(x.cents,true),
   label:cleanString(x.label,110,true),basis:cleanString(x.basis,160,true),
   kind:inSet(x.kind,["igfej","honorarios","entidade","outro"]),verified:x.verified===true
  }));
  const sanctions=file.data.sanctions.map(x=>({
   id:entryId(x.id),personId:personId(x.personId),cents:integer(x.cents,true),
   label:cleanString(x.label,120,true),basis:cleanString(x.basis,160,true),
   kind:inSet(x.kind,["processual","penalidade","coima","penal"]),verified:x.verified===true
  }));
  const movements=file.data.movements.map(x=>({
   id:entryId(x.id),personId:personId(x.personId),cents:integer(x.cents,true),
   kind:inSet(x.kind,["guide","cancel","payment","refund"]),
   status:inSet(x.status,["pending","confirmed"]),
   ref:cleanString(x.ref,80,true),
   date:cleanString(x.date,10)
  }));
  for(const m of movements){
   if(m.date&&!/^\d{4}-\d{2}-\d{2}$/.test(m.date))fail("data de movimento inválida.");
   const sameRef=movements.filter(x=>x.personId===m.personId&&x.ref===m.ref);
   if(sameRef.filter(x=>x.kind===m.kind&&x.cents===m.cents&&x.date===m.date).length>1)
    fail("movimento duplicado.");
   if(m.kind==="cancel"&&(!sameRef.some(x=>x.kind==="guide"&&x.cents===m.cents)||
       sameRef.filter(x=>x.kind==="cancel").length>1))fail("anulação sem guia correspondente.");
  }
  const groups=new Set(movements.map(m=>m.personId+"|"+m.ref));
  for(const group of groups){
   const groupMoves=movements.filter(m=>m.personId+"|"+m.ref===group&&m.status==="confirmed");
   const paid=groupMoves.filter(m=>m.kind==="payment").reduce((a,m)=>a+m.cents,0);
   const refunded=groupMoves.filter(m=>m.kind==="refund").reduce((a,m)=>a+m.cents,0);
   if(refunded>paid)fail("restituição confirmada superior aos pagamentos.");
  }
  const names=["processRef","jurisdiction","filingYear","ucValue","caseValue","caseDecision",
    "dispensa","dispensaReason","ruling","probableCosts","advanceCharges","reviewed"];
  const fields={};
  for(const key of names){
   const val=file.fields[key];
   if(key==="reviewed"){fields[key]=val===true;continue}
   fields[key]=cleanString(val,key==="ruling"?600:key==="caseDecision"?180:key==="processRef"?80:40);
  }
  inSet(fields.jurisdiction,["administrativo","tributario","civil","outro"]);
  inSet(fields.dispensa,["unknown","yes","no"]);
  inSet(fields.dispensaReason,["none","noDebt","aid","insolvency","execution"]);
  if(fields.filingYear&&(!/^\d{4}$/.test(fields.filingYear)||+fields.filingYear<2009||+fields.filingYear>2099))fail("ano da acção inválido.");
  for(const key of ["ucValue","caseValue","probableCosts","advanceCharges"])
   if(fields[key]!==""&&parseCents(fields[key])===null)fail("campo monetário inválido.");
  return {format:"legaltech-custas-seis-passos",version:1,
   data:{parties:people,charges,expenses,movements,sanctions},fields};
 }

 return Object.freeze({ucForYear,parseCents,suggestIA,summary,validateProject,iaBrackets,yearMin,yearMax});
});
