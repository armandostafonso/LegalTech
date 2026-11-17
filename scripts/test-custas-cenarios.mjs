import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html=fs.readFileSync("custas-tecnico.html","utf8");
const fixtures=JSON.parse(fs.readFileSync("scripts/fixtures/custas-a01-cenarios.json","utf8"));
const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter(m=>!/\bsrc\s*=/.test(m[1])&&m[2].trim())
  .map(m=>m[2]);
const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"");
const tags=[...markup.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)];
const ids=tags.map(m=>m[2]);
assert.equal(new Set(ids).size,ids.length,"IDs HTML duplicados");
let passed=0;

function harness(){
 const elements=new Map(tags.map(m=>[m[2],{
  value:"",checked:false,textContent:"",innerHTML:"",hidden:false,selectedIndex:0,
  tagName:m[1].toUpperCase(),type:(m[0].match(/\btype="([^"]+)"/)||[])[1]||"text",
  listeners:{},addEventListener(type,callback){this.listeners[type]=callback}
 }]));
 for(const m of markup.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)){
  const first=m[2].match(/<option value="([^"]*)"/);
  if(first)elements.get(m[1]).value=first[1];
 }
 const document={
  documentElement:{dataset:{theme:"light"}},
  getElementById(id){assert.ok(elements.has(id),"ID inexistente: "+id);return elements.get(id)},
  createElement(){return {href:"",download:"",click(){},remove(){}}},
  body:{append(){}}
 };
 const ctx=vm.createContext({document,Intl,Number,Math,console,URL:{
  createObjectURL(){return "blob:test"},
  revokeObjectURL(){}
 },Blob:class {constructor(parts){this.text=parts.join("")}}});
 new vm.Script(inline.at(-1),{filename:"custas.html"}).runInContext(ctx);
 return {
  elements,
  set(id,value){assert.ok(elements.has(id));elements.get(id).value=String(value)},
  checked(id,value=true){elements.get(id).checked=!!value},
  click(id){const fn=elements.get(id)?.listeners.click;assert.ok(fn,"Botão sem listener: "+id);fn()},
  change(id,attrs){const fn=elements.get(id)?.listeners.change;assert.ok(fn,"Control sem listener: "+id);fn({target:attrs})},
  message(id){return elements.get(id).textContent},
  inspect(expression){return JSON.parse(JSON.stringify(vm.runInContext(expression,ctx)))}
 };
}
function test(name,fn){fn();passed++;console.log("✓ "+name)}

for(const c of fixtures.cases){
 test(c.id+": repartição por decisão e controlo de soma",()=>{
  const h=harness();
  for(const p of c.people){
   h.set("multiName",p.name);h.set("multiRole",p.role);h.click("multiAdd");
  }
  c.people.forEach((p,index)=>{
   if(p.share!==undefined)h.change("multiPeopleRows",{
    dataset:{multiShare:String(index+1)},value:p.share
   });
  });
  h.set("multiRef",c.charge.ref);
  h.set("multiAmount",c.charge.amount);
  h.set("multiMode",c.charge.mode);
  h.set("multiDecision","DECISAO-FICTICIA-"+c.id);
  h.set("multiDate","2026-11-16");
  h.set("multiSolidarity",c.charge.solidarity);
  h.set("multiSettlement",c.charge.settlement);
  if(c.charge.allLost)h.checked("multiAllLost");
  h.checked("multiVerified");
  h.click("multiPreview");
  if(c.expectedError){
   assert.match(h.message("multiResult"),new RegExp(c.expectedError));
   assert.deepEqual(h.inspect("multiCharges.map(x=>x.ref)"),[]);
   return;
  }
  h.click("multiPost");
  const amounts=h.inspect("multiCharges[0].allocations.map(a=>a.cents)");
  assert.deepEqual(amounts,c.expectCents);
  assert.equal(amounts.reduce((a,b)=>a+b,0),Math.round(Number(c.charge.amount)*100));
  assert.deepEqual(h.inspect("obligations.length"),0);
  assert.deepEqual(h.inspect("ledgerEntries.length"),0);
  h.set("multiImportCharge","1");h.checked("multiImportVerified");h.click("multiImport");
  const imported=h.inspect("multiObligations.filter(o=>o.chargeId===1).map(o=>o.cents)");
  assert.deepEqual(imported,c.expectCents.filter(x=>x>0));
  h.click("multiAccountReconcile");
  const totals=h.inspect("multiAccountBuild().personTotals.map(x=>x.due)");
  assert.deepEqual(totals,c.expectCents);
  assert.equal(h.inspect("obligations.length"),0,"A conta A/B não deve mudar");
 });
}

test("M01: três sujeitos, taxa manual, pagamentos e restituição individual",()=>{
 const h=harness();
 for(const name of ["SUJ-A","SUJ-B","SUJ-C"]){
  h.set("multiName",name);h.click("multiAdd");
 }
 h.set("multiRef","ENC-TESTE-01");h.set("multiAmount","100.01");
 h.set("multiMode","iguais");h.set("multiDecision","DECISAO-TESTE");
 h.set("multiDate","2026-11-16");h.set("multiSolidarity","no");
 h.set("multiSettlement","no");h.checked("multiAllLost");h.checked("multiVerified");
 h.click("multiPreview");h.click("multiPost");
 h.set("multiImportCharge","1");h.checked("multiImportVerified");h.click("multiImport");
 h.set("multiObPerson","1");h.set("multiObKind","taxa");
 h.set("multiObRef","TAXA-FICTICIA-A");h.set("multiObAmount","255.00");
 h.set("multiObBasis","Valor previamente apurado e confirmado pelo utilizador");
 h.checked("multiObVerified");h.click("multiObAdd");
 const add=(person,ob,kind,status,ref,amount)=>{
  h.set("multiMovePerson",person);h.set("multiMoveOb",ob);
  h.set("multiMoveKind",kind);h.set("multiMoveStatus",status);
  h.set("multiMoveRef",ref);h.set("multiMoveDate","2026-11-16");
  h.set("multiMoveAmount",amount);h.click("multiMoveAdd");
  assert.doesNotMatch(h.message("multiAccountMessage"),/invalid|superior|excede|diferente/i);
 };
 add("1","4","guide","pending","DUC-A-01","255.00");
 add("1","4","payment","confirmed","DUC-A-01","150.00");
 add("1","4","refund","confirmed","DUC-A-01","20.00");
 add("1","4","payment","pending","DUC-A-PENDENTE","50.00");
 add("2","","payment","confirmed","PAG-B-SEM-IMP","10.00");
 h.click("multiAccountReconcile");
 const totals=h.inspect("multiAccountBuild().personTotals.map(x=>({due:x.due,paid:x.paid,positive:x.positive,unassigned:x.unassigned}))");
 assert.deepEqual(totals,[
  {due:28834,paid:13000,positive:15834,unassigned:0},
  {due:3334,paid:1000,positive:2334,unassigned:1000},
  {due:3333,paid:0,positive:3333,unassigned:0}
 ]);
 const details=h.inspect("multiAccountBuild().rows.map(x=>({ref:x.ref,paid:x.paid}))");
 assert.ok(details.some(x=>x.ref==="TAXA-FICTICIA-A"&&x.paid===13000));
 assert.ok(h.inspect("multiAccountBuild().warnings.some(x=>x.includes('pendente'))"));
 assert.ok(h.inspect("multiAccountBuild().warnings.some(x=>x.includes('sem imputação'))"));
 assert.equal(h.inspect("obligations.length"),0);
 assert.equal(h.inspect("ledgerEntries.length"),0);
});

console.log(passed+" cenários sintéticos A01 concluídos. Estes testes são aritméticos e de integridade, não validação jurídica independente.");
