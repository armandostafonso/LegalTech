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
if(api.easter(2026).toISOString().slice(0,10)!=="2026-04-05"){
 throw Error("Páscoa 2026 incorreta");
}
console.log("Contrato JSON↔JavaScript e "+dates.length+" datas de férias judiciais: aprovado.");
