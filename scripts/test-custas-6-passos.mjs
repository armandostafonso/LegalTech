import assert from "node:assert/strict";
import fs from "node:fs";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const core=require("../assets/custas-6-core.js");
let passed=0;
const check=(name,fn)=>{fn();passed++;console.log("✓ "+name)};
const make=(changes={})=>({year:2025,dispensa:"no",agreement:true,parties:[
 {id:1,label:"Autor",aid:"none",exemption:"no"},
 {id:2,label:"Entidade demandada",aid:"none",exemption:"no"}],
 charges:[],expenses:[],sanctions:[],movements:[],...changes});
check("UC histórica de 2010 a 2026: 102 €",()=>{
 for(let year=2010;year<=2026;year++)assert.equal(core.ucForYear(year),102);
});
check("2009 e anos futuros: não inventar UC",()=>{
 assert.equal(core.ucForYear(2009),null);
 assert.equal(core.ucForYear(2027),null);
});
check("Valores em euros aceitam separador decimal português",()=>{
 assert.equal(core.parseCents("102,50"),10250);
 assert.equal(core.parseCents("102.50"),10250);
 assert.equal(core.parseCents("1 234,56"),123456);
});
check("Montantes negativos ou mais de duas casas são rejeitados",()=>{
 for(const raw of ["-2","1,234","","abc"])assert.equal(core.parseCents(raw),null);
});
check("Tabela I-A: valor 30.000 euros, UC 102, equivale a 5 UC",()=>{
 assert.deepEqual(core.suggestIA(3000000,10200),{units:5,cents:51000});
});
check("Tabela I-A: bloqueia valor superior a 275.000 euros",()=>{
 assert.equal(core.suggestIA(27500001,10200),null);
});
check("Saldos por parte: excesso do autor não compensa a diferença do réu",()=>{
 const d=make({charges:[
  {personId:1,cents:25500,verified:true},{personId:2,cents:25500,verified:true}
 ],movements:[{personId:1,kind:"payment",cents:50000,status:"confirmed"}]});
 const r=core.summary(d);
 assert.equal(r.accounts[0].excess,24500);
 assert.equal(r.accounts[1].positive,25500);
 assert.equal(r.sums.positive,25500);
 assert.equal(r.sums.excess,24500);
});
check("Guias emitidas ou anuladas não representam pagamento",()=>{
 const r=core.summary(make({charges:[{personId:1,cents:10200,verified:true}],
  movements:[{personId:1,kind:"guide",cents:10200,status:"confirmed"},
    {personId:1,kind:"cancel",cents:10200,status:"confirmed"}]}));
 assert.equal(r.accounts[0].payments,0);
 assert.equal(r.accounts[0].positive,10200);
});
check("Pagamentos pendentes são excluídos dos saldos",()=>{
 const r=core.summary(make({movements:[{personId:1,kind:"payment",cents:12000,status:"pending"}]}));
 assert.equal(r.accounts[0].payments,0);
 assert.ok(r.warnings.some(x=>x.includes("pendentes")));
});
check("Restituição comprovada reduz pagamento líquido",()=>{
 const r=core.summary(make({movements:[
  {personId:1,kind:"payment",cents:20000,status:"confirmed"},
  {personId:1,kind:"refund",cents:5000,status:"confirmed"}]}));
 assert.equal(r.accounts[0].netPayments,15000);
});
check("Encargos e multas são rubricas distintas das taxas",()=>{
 const r=core.summary(make({charges:[{personId:1,cents:10200,verified:true}],
  expenses:[{personId:1,cents:3300,verified:true}],
  sanctions:[{personId:1,cents:1500,verified:true,kind:"processual"}]}));
 assert.deepEqual([r.sums.charges,r.sums.expenses,r.sums.sanctions],[10200,3300,1500]);
});
check("Itens sem conferência documental mantêm advertência",()=>{
 const r=core.summary(make({expenses:[{personId:1,cents:1000,verified:false}]}));
 assert.ok(r.warnings.some(x=>x.includes("sem confirmação documental")));
});
check("Apoio judiciário sinaliza não exigibilidade presumida",()=>{
 const d=make();d.parties[0].aid="full";
 assert.ok(core.summary(d).warnings.some(x=>x.includes("apoio judiciário")));
});
check("Coima e multa penal geram aviso de regime próprio",()=>{
 const r=core.summary(make({sanctions:[{personId:1,kind:"coima",cents:12000,verified:true}]}));
 assert.ok(r.warnings.some(x=>x.includes("formulários próprios")));
});
check("Dispensa de conta alerta para termo a documentar",()=>{
 const r=core.summary(make({dispensa:"yes"}));
 assert.equal(r.accountRequired,false);
 assert.ok(r.warnings.some(x=>x.includes("documentar os pressupostos")));
});
check("Ano 2012 obriga a confirmação da data exacta para regime histórico",()=>{
 assert.ok(core.summary(make({year:2012})).warnings.some(x=>x.includes("2012")));
});
check("Ano 2026 obriga a confirmar alterações legais intra-anuais",()=>{
 assert.ok(core.summary(make({year:2026})).warnings.some(x=>x.includes("2026")));
});
check("Interface contém seis painéis, com ligação ao motor de cálculo",()=>{
 const html=fs.readFileSync("custas-6-passos.html","utf8");
 const tabs=[...html.matchAll(/data-step-tab="\d"/g)];
 const panels=[...html.matchAll(/<section data-step-panel="\d"/g)];
 assert.equal(tabs.length,6);assert.equal(panels.length,6);
 assert.ok(html.includes('src="assets/custas-6-core.js"'));
 assert.ok(html.includes('href="custas-tecnico.html"'));
});
check("Não existem IDs duplicados no HTML do assistente",()=>{
 const markup=fs.readFileSync("custas-6-passos.html","utf8").replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,"");
 const ids=[...markup.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 assert.equal(new Set(ids).size,ids.length);
});
console.log(passed+" testes do assistente de 6 passos concluídos.");
