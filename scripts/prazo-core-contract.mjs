/* Contrato técnico autónomo para o núcleo de prazos, sem browser e sem rede.
 * CPC: 228 cenários sintéticos; CPA/CPPT: 96. Não certifica a lei.
 */
import fs from "node:fs";
import vm from "node:vm";

const sandbox={window:{},Date,Math,Number,Error,Set};
vm.runInNewContext(fs.readFileSync("assets/calendario.js","utf8"),sandbox,{timeout:2000});
vm.runInNewContext(fs.readFileSync("assets/prazo-core.js","utf8"),sandbox,{timeout:2000});
const core=sandbox.window.LegalTechPrazoCore;
const calendar=sandbox.window.LegalTechCalendario;
if(!core||typeof core.calculate!=="function"||!calendar)throw Error("Motor ou calendário não exposto.");

const toDate=s=>{const [y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)};
const iso=d=>core.iso(d);
const holidays=config=>d=>{
 const key=iso(d).slice(5),easter=calendar.easter(d.getFullYear());
 return config.fixed_holidays.includes(key)||config.mobile_holidays.some(x=>
   iso(core.nextDate(easter,x.relative_to_easter))===iso(d));
};
const nationalHoliday=holidays(calendar.rules);
const cases=[
 ...JSON.parse(fs.readFileSync("tests/shared-cases.json","utf8")).cases,
 ...JSON.parse(fs.readFileSync("tests/parity-extended.json","utf8")).cases
];
const regimes=JSON.parse(fs.readFileSync("tests/regimes-parity.json","utf8")).cases;
if(cases.length!==228||regimes.length!==96)throw Error("Matrizes de referência incompletas.");

function openDay(date,municipality,urgent){
 const w=date.getDay();
 return w!==0&&w!==6&&!nationalHoliday(date)&&
  !calendar.municipalHoliday(date,municipality)&&
  (urgent||!calendar.isVacation(date));
}
let passed=0;
for(const c of cases){
 const result=core.calculate({
  start:toDate(c.start),amount:c.quantity,unit:c.unit,urgent:c.urgent,
  regime:"cpc",delay:0,
  openDay:(d,urgent)=>openDay(d,c.municipality,urgent),
  inVacation:calendar.isVacation
 });
 if(iso(result.end)!==c.expected)throw Error(c.id+": esperado "+c.expected+", obtido "+iso(result.end));
 passed++;
}
for(const c of regimes){
 const result=core.calculate({
  start:toDate(c.start),amount:c.days,unit:"dias",regime:c.regime,
  openDay:d=>openDay(d,c.municipality,true),inVacation:calendar.isVacation
 });
 if(iso(result.end)!==c.expected)throw Error(c.id+": esperado "+c.expected+", obtido "+iso(result.end));
 passed++;
}
const trace=core.calculate({start:toDate("2026-07-15"),amount:2,unit:"dias",regime:"cpc",
 openDay:(d,urgent)=>openDay(d,"porto",urgent),inVacation:calendar.isVacation,trace:true});
if(iso(trace.end)!=="2026-09-02"||trace.suspended<1||!trace.steps.length)throw Error("Rasto de suspensão incompleto.");
for(const c of [
 {start:toDate("2026-11-16"),amount:0},
 {start:toDate("2026-11-16"),amount:1.5},
 {start:toDate("2026-11-16"),amount:1,regime:"cpa87",unit:"meses"},
 {start:toDate("2026-11-16"),amount:1,regime:"cppt20_1",delay:5}
]){
 let rejected=false;
 try{core.calculate({...c,openDay:()=>true,inVacation:()=>false})}catch(e){rejected=true}
 if(!rejected)throw Error("Entrada inválida aceite no núcleo.");
}
console.log("Núcleo JavaScript: "+passed+" casos técnicos e testes negativos aprovados sem navegador.");
