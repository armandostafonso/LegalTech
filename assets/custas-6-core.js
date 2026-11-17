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
   if(a.netPayments<0)warnings.push(a.label+": restituições superiores aos pagamentos confirmados.");
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
 return Object.freeze({ucForYear,parseCents,suggestIA,summary,iaBrackets,yearMin,yearMax});
});
