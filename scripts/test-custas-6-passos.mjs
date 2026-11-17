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

function validProject(){
 return {format:"legaltech-custas-seis-passos",version:1,step:4,maxVisited:4,
  fields:{processRef:"TESTE-100",jurisdiction:"administrativo",filingYear:"2025",
   ucValue:"102",caseValue:"30000",caseDecision:"Sentença de teste",
   dispensa:"no",dispensaReason:"none",ruling:"Responsabilidade fixada no despacho de teste.",
   probableCosts:"0",advanceCharges:"0",reviewed:false},
  data:{parties:[
   {id:1,label:"Autor",role:"Autor",aid:"none",exemption:"no",share:50},
   {id:2,label:"Entidade demandada",role:"Demandado",aid:"none",exemption:"no",share:50}],
   charges:[{id:3,personId:1,origin:"Acção principal",impulse:"Petição inicial",table:"IA",
      year:2025,baseCents:3000000,cents:51000,basis:"RCP, Tabela I-A",ref:"PI",verified:true}],
   expenses:[],sanctions:[],
   movements:[{id:4,personId:1,kind:"payment",status:"confirmed",ref:"DUC-TESTE",date:"2025-04-03",cents:25500}]}}
}
check("Projecto JSON: validação e preservação de etapa/valores",()=>{
 const out=core.validateProject(validProject());
 assert.equal(out.step,4);assert.equal(out.maxVisited,4);
 assert.equal(out.data.charges[0].cents,51000);
 assert.equal(core.summary({...out.data,year:2025,dispensa:"no",agreement:true}).accounts[0].positive,25500);
});
check("Projecto JSON: formato e versão desconhecidos são rejeitados",()=>{
 const p=validProject();p.format="outro";
 assert.throws(()=>core.validateProject(p),/formato/);
 const v=validProject();v.version=2;
 assert.throws(()=>core.validateProject(v),/versão/);
});
check("Projecto JSON: não aceita movimentos de partes inexistentes",()=>{
 const p=validProject();p.data.movements[0].personId=999;
 assert.throws(()=>core.validateProject(p),/inexistente/);
});
check("Projecto JSON: não aceita pagamento sem estrutura consistente",()=>{
 const p=validProject();p.data.movements[0].cents=-3;
 assert.throws(()=>core.validateProject(p),/inválido/);
});
check("Projecto JSON: impede restituição confirmada superior ao pagamento",()=>{
 const p=validProject();p.data.movements.push({id:5,personId:1,kind:"refund",status:"confirmed",ref:"DUC-TESTE",date:"2025-04-04",cents:30000});
 assert.throws(()=>core.validateProject(p),/restituição/);
});
check("Projecto JSON: impede guia anulada sem guia emitida",()=>{
 const p=validProject();p.data.movements.push({id:5,personId:1,kind:"cancel",status:"pending",ref:"GUIA",date:"2025-04-04",cents:10200});
 assert.throws(()=>core.validateProject(p),/anulação/);
});
check("Projecto JSON: impede IDs duplicados",()=>{
 const p=validProject();p.data.expenses.push({id:3,personId:2,cents:1000,label:"Perícia",basis:"Despacho",kind:"igfej",verified:true});
 assert.throws(()=>core.validateProject(p),/repetido/);
});
check("Projecto JSON: rejeita percentagem fora de 0 a 100",()=>{
 const p=validProject();p.data.parties[1].share=101;
 assert.throws(()=>core.validateProject(p),/percentagem/);
});
check("Projecto JSON: impede etapas inválidas",()=>{
 const p=validProject();p.step=8;
 assert.throws(()=>core.validateProject(p),/posição/);
});
check("Projecto JSON: rejeita campos de texto excessivamente longos",()=>{
 const p=validProject();p.data.parties[0].label="X".repeat(2000);
 assert.throws(()=>core.validateProject(p),/texto/);
});
check("Projecto JSON: ignora campos executáveis não previstos",()=>{
 const p=validProject();p.fields.script="<script>alert(1)</script>";
 const out=core.validateProject(p);
 assert.equal(Object.hasOwn(out.fields,"script"),false);
});

check("Minuta de dispensa: estrutura textual verificável sem automatizar decisão",()=>{
 const html=fs.readFileSync("custas-6-passos.html","utf8");
 assert.ok(html.includes('id="draftDispensa"'));
 assert.ok(html.includes('id="draftDispensaText"'));
 assert.ok(html.includes('id="copyDispensa"'));
 assert.ok(html.includes('Portaria n.º 419-A/2009'));
 assert.ok(html.includes('artigo 29.º'));
});


check("Tabela I-A: taxa total de 510 € em duas prestações de 255 €",()=>{
 const q=core.quoteTableI({table:"IA",baseCents:3000000,ucCents:10200,year:2025});
 assert.equal(q.totalCents,51000);assert.equal(q.firstCents,25500);assert.equal(q.secondCents,25500);
});
check("Tabela I-B: metade da I-A, sem divisão em prestações",()=>{
 const q=core.quoteTableI({table:"IB",baseCents:3000000,ucCents:10200,year:2025});
 assert.equal(q.totalCents,25500);assert.equal(q.firstCents,null);
});
check("Tabela II não gera valores inventados",()=>{
 assert.equal(core.quoteTableI({table:"IIA",baseCents:3000000,ucCents:10200,year:2025}).ok,false);
});
check("Tabela I não inventa remanescente acima de 275 mil euros",()=>{
 assert.equal(core.quoteTableI({table:"IA",baseCents:30000000,ucCents:10200,year:2025}).ok,false);
});
check("2012 exige data e distingue 28-03 de 29-03",()=>{
 const q=date=>core.quoteTableI({table:"IA",baseCents:3000000,ucCents:10200,year:2012,startDate:date});
 assert.equal(q("").ok,false);assert.equal(q("2012-03-28").ok,false);assert.equal(q("2012-03-29").ok,true);
});
check("Datas impossíveis não são válidas",()=>{
 assert.equal(core.validISODate("2025-02-29"),false);
 assert.equal(core.validISODate("2024-02-29"),true);
 assert.equal(core.validISODate("2026-13-01"),false);
});
check("DL 164/2026: artigo 6.º depende da propositura, restantes actos podem diferir",()=>{
 const r=core.regime2026(2026,"2026-11-30","2026-12-03");
 assert.equal(r.article6,"anterior");assert.equal(r.otherActs,"novo");
 assert.equal(core.regime2026(2026,"2026-12-01").article6,"novo");
 assert.equal(core.regime2026(2026).article6,"indeterminado");
});
check("Projectos antigos da versão 1 preservam compatibilidade",()=>{
 const p=core.validateProject(validProject());
 assert.equal(p.fields.filingDate,"");assert.equal(p.data.charges[0].startDate,"");
});
check("Validação de projecto rejeita data de propositura impossível",()=>{
 const p=validProject();p.fields.filingDate="2025-02-30";
 assert.throws(()=>core.validateProject(p),/data de propositura/);
});
check("Validação de projecto rejeita data de início de outro ano",()=>{
 const p=validProject();p.data.charges[0].startDate="2024-11-30";
 assert.throws(()=>core.validateProject(p),/data do processo autónomo/);
});
check("Dispensa assinalada com saldo positivo exige conferência",()=>{
 const r=core.summary(make({dispensa:"yes",charges:[{personId:1,cents:10000,verified:true}]}));
 assert.ok(r.warnings.some(x=>x.includes("diferenças positivas")));
});
check("HTML mantém seis passos e campos para datas e prestações",()=>{
 const h=fs.readFileSync("custas-6-passos.html","utf8");
 assert.equal([...h.matchAll(/<section data-step-panel=/g)].length,6);
 for(const id of ["filingDate","chargeStartDate","chargeSuggestionMode"])assert.ok(h.includes('id="'+id+'"'));
});
console.log(passed+" testes do assistente de 6 passos concluídos.");
