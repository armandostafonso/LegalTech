/* Generated contract from rules/calendario.json, version 2026-11-16.
   Shared judicial calendar configuration. Not a complete procedural deadline engine. */
(function(root){
 "use strict";
 const RULES=Object.freeze({
   version:"2026-11-16",
   vacations:{winter:{begin:"12-22",end:"01-03"},summer:{begin:"07-16",end:"08-31"},easter:{before_days:7,after_days:1}},
   fixed_holidays:["01-01","04-25","05-01","06-10","08-15","10-05","11-01","12-01","12-08","12-25"],
   mobile_holidays:[{name:"Sexta-Feira Santa",relative_to_easter:-2},{name:"Páscoa",relative_to_easter:0},{name:"Corpo de Deus",relative_to_easter:60}]
 });
 const MUNICIPALITIES=Object.freeze([
   {id:"porto",name:"Porto",day:"06-24",label:"São João"},
   {id:"lisboa",name:"Lisboa",day:"06-13",label:"Santo António"},
   {id:"braga",name:"Braga",day:"06-24",label:"São João"},
   {id:"penafiel",name:"Penafiel",day:"11-11",label:"São Martinho"}
 ]);
 function municipalHoliday(date,municipality){
   const code=String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
   const entry=MUNICIPALITIES.find(x=>x.id===municipality&&x.day===code);
   return entry?entry.label+" ("+entry.name+")":null;
 }
 function easter(year){
   const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,
     f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,
     i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
   return new Date(year,Math.floor((h+l-7*m+114)/31)-1,((h+l-7*m+114)%31)+1);
 }
 function addDays(day,n){const result=new Date(day.getFullYear(),day.getMonth(),day.getDate());result.setDate(result.getDate()+n);return result}
 function within(d,start,end){const day=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();return day>=start.getTime()&&day<=end.getTime()}
 function vacations(d){
  const y=d.getFullYear(), summer=RULES.vacations.summer, winter=RULES.vacations.winter, passover=RULES.vacations.easter;
  const s=summer.begin.split("-").map(Number),se=summer.end.split("-").map(Number),
    w=winter.begin.split("-").map(Number),we=winter.end.split("-").map(Number);
  if(within(d,new Date(y,s[0]-1,s[1]),new Date(y,se[0]-1,se[1])))return true;
  if(within(d,new Date(y,w[0]-1,w[1]),new Date(y,11,31)))return true;
  if(within(d,new Date(y,0,1),new Date(y,we[0]-1,we[1])))return true;
  const p=easter(y);
  return within(d,addDays(p,-passover.before_days),addDays(p,passover.after_days));
 }
 root.LegalTechCalendario=Object.freeze({rules:RULES,municipalities:MUNICIPALITIES,municipalHoliday,easter,isVacation:vacations});
})(window);
