/* LegalTech Suite · Motor comum de prazo para cálculos de referência.
   Implementação JS do contrato descrito em docs/prazo-core.md.
   Replica a lógica de referência existente no motor Python, sem inferir a
   modalidade de citação, a duração legal do prazo ou a natureza urgente.
   Nenhum tratamento de dados na rede. NÃO constitui certificação jurídica. */
(function(root){
"use strict";
const DAY=86400000;
function nextDate(date,n=1){
 const result=new Date(date.getFullYear(),date.getMonth(),date.getDate());
 result.setDate(result.getDate()+n);
 return result;
}
function plusMonths(date,months){
 const year=date.getFullYear(),month=date.getMonth()+months;
 const last=new Date(year,month+1,0).getDate();
 return new Date(year,month,Math.min(date.getDate(),last));
}
function diffDays(start,end){
 return Math.round((Date.UTC(end.getFullYear(),end.getMonth(),end.getDate())-
  Date.UTC(start.getFullYear(),start.getMonth(),start.getDate()))/DAY);
}
function iso(date){
 return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");
}
function calculate(opts){
 const {start,amount,unit="dias",regime="cpc",urgent=false,delay=0,
  openDay,inVacation=()=>false,trace=false}=opts||{};
 if(!(start instanceof Date)||!Number.isFinite(start.getTime())||start.getFullYear()<1600)
  throw Error("Data inicial inválida ou fora do intervalo suportado.");
 if(!Number.isSafeInteger(amount)||amount<1||amount>3650)
  throw Error("O prazo deve ser um inteiro positivo até 3650.");
 if(!Number.isSafeInteger(delay)||delay<0||delay>3650)
  throw Error("Dilação inválida.");
 if(typeof openDay!=="function"||typeof inVacation!=="function")
  throw Error("Calendário de serviço indisponível.");
 if(!["cpc","cpa87","cppt20_1"].includes(regime))throw Error("Regime não suportado.");
 if(!["dias","meses","anos"].includes(unit))throw Error("Unidade inválida.");
 if(regime!=="cpc"&&(unit!=="dias"||delay!==0||urgent))
  throw Error("Regime CPA/CPPT apenas para dias sem dilação nem urgência.");
 if(unit==="meses"&&amount>1200||unit==="anos"&&amount>100)throw Error("Duração fora do intervalo suportado.");
 const longTerm=unit==="anos"||(unit==="meses"&&amount>=6);
 const nominal=unit==="dias"?null:plusMonths(start,amount*(unit==="anos"?12:1));
 const days=(nominal?diffDays(start,nominal):amount)+delay;
 let current=new Date(start.getFullYear(),start.getMonth(),start.getDate());
 let counted=0,suspended=0,safety=0;
 const steps=[],transfer=[];
 while(counted<days){
  if(++safety>days+1000)throw Error("Não foi possível completar a contagem.");
  current=nextDate(current);
  const eligible=regime==="cppt20_1"?true:
   regime==="cpa87"?Boolean(openDay(current,true)):
   (urgent||longTerm||!inVacation(current));
  if(eligible)counted++;else suspended++;
  if(trace)steps.push({date:iso(current),counted:eligible?counted:null,excluded:!eligible});
 }
 const raw=new Date(current);
 const canEnd=d=>Boolean(openDay(d,regime==="cpc"?urgent:true))&&
  (regime!=="cpc"||urgent||!inVacation(d));
 for(let i=0;!canEnd(current);i++){
  if(i>1000)throw Error("Não foi possível transferir o termo.");
  current=nextDate(current);
  if(trace)transfer.push(iso(current));
 }
 return Object.freeze({
  end:new Date(current),raw,suspended,longTerm,regime,
  ...(trace?{steps,transfer}:{}),
 });
}
root.LegalTechPrazoCore=Object.freeze({calculate,nextDate,plusMonths,diffDays,iso});
})(window);
