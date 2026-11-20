import fs from "node:fs";
import vm from "node:vm";

const canonical=JSON.parse(fs.readFileSync("rules/calendario.json","utf8"));
const script=fs.readFileSync("assets/calendario.js","utf8");
const sandbox={window:{}};
vm.runInNewContext(script,sandbox,{timeout:2000,filename:"assets/calendario.js"});
const api=sandbox.window.LegalTechCalendario;
if(!api||typeof api.isVacation!=="function"||typeof api.easter!=="function"){
  throw Error("Calendário JavaScript não expõe a interface esperada");
}
const normalized=(v)=>JSON.stringify(v);
for(const field of ["version","vacations","fixed_holidays","mobile_holidays"]){
 if(normalized(canonical[field])!==normalized(api.rules[field])){
  throw Error("Regra diferente entre JSON normativo e JavaScript: "+field);
 }
}
const municipalConfig=JSON.parse(fs.readFileSync("rules/municipais.json","utf8"));
if(normalized(municipalConfig.municipalities)!==normalized(api.municipalities)){
 throw Error("Feriados municipais Web diferentes da matriz JSON");
}
for(const item of municipalConfig.municipalities){
 const [month,day]=item.day.split("-").map(Number);
 const value=api.municipalHoliday(new Date(2026,month-1,day),item.id);
 if(!value||!value.includes(item.label))throw Error("Feriado municipal ignorado: "+item.id);
}
const dates=[
 ["2026-07-15",false],["2026-07-16",true],["2026-08-31",true],["2026-09-01",false],
 ["2026-12-22",true],["2027-01-03",true],["2027-01-04",false],
 ["2026-03-29",true],["2026-04-06",true],["2026-04-07",false]
];
for(const [iso,expected] of dates){
 const [y,m,d]=iso.split("-").map(Number);
 const value=api.isVacation(new Date(y,m-1,d));
 if(value!==expected)throw Error("Férias judiciais incorretas em "+iso);
}
const easter = api.easter(2026);
if(easter.getFullYear() !== 2026 || easter.getMonth() !== 3 || easter.getDate() !== 5){
 throw Error("Páscoa 2026 incorreta");
}
console.log("Contrato JSON↔JavaScript e "+dates.length+" datas de férias judiciais: aprovado.");
