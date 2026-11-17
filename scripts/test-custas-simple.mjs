import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const html=fs.readFileSync("custas.html","utf8");
const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
 .filter(m=>!/\bsrc\s*=/.test(m[1])&&m[2].includes('const rows=[[2000,1]')).map(m=>m[2]);
assert.equal(inline.length,1,"A página simples deve ter apenas um motor principal.");
const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"");
const tags=[...markup.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)];
const ids=tags.map(m=>m[2]);
assert.equal(new Set(ids).size,ids.length,"Existem IDs duplicados na página simples.");

function harness(){
 class Element {
  constructor(tag,source=""){
   this.tagName=tag.toUpperCase();this.value=(source.match(/\bvalue="([^"]*)"/)||[])[1]||"";
   this.checked=false;this.listeners={};this.children=[];this.className=(source.match(/\bclass="([^"]*)"/)||[])[1]||"";
   this.textContent="";this.hidden=false;this.disabled=false;
   this.classList={toggle:(name,force)=>{const tokens=new Set(this.className.split(/\s+/).filter(Boolean));
    if(force===undefined? !tokens.has(name):force)tokens.add(name);else tokens.delete(name);
    this.className=[...tokens].join(" ")}
   };
  }
  addEventListener(type,fn){this.listeners[type]=fn}
  appendChild(child){this.children.push(child);return child}
  replaceChildren(...children){this.children=[...children]}
  scrollIntoView(){}
 }
 const elements=new Map(tags.map(m=>[m[2],new Element(m[1],m[0])]));
 for(const m of markup.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)){
  const first=m[2].match(/<option value="([^"]*)"/);if(first)elements.get(m[1]).value=first[1];
 }
 const document={
  getElementById:id=>{assert.ok(elements.has(id),"ID em falta: "+id);return elements.get(id)},
  createElement:tag=>new Element(tag)
 };
 const copies=[],prints=[];
 const context=vm.createContext({document,Intl,Number,Math,console,
  navigator:{clipboard:{writeText:async text=>copies.push(text)}},window:{print(){prints.push(true)}}
 });
 new vm.Script(inline[0],{filename:"custas.html"}).runInContext(context);
 const el=id=>elements.get(id);
 return {
  el,prints,copies,
  set(id,value){el(id).value=String(value)},
  checked(id,bool=true){el(id).checked=bool},
  click(id){assert.ok(el(id).listeners.click,"Botão sem evento "+id);return el(id).listeners.click()},
  change(id){assert.ok(el(id).listeners.change);return el(id).listeners.change()},
  text(id){return el(id).textContent},
  rows(){return el("ccRows").children.map(row=>row.children.map(cell=>cell.textContent))},
  ready(value="30000",uc="102"){
   this.set("ccValue",value);this.set("ccUC",uc);this.set("ccDate","2026-11-16");
   this.set("ccSecond","waived");this.set("ccDecision","autor");this.checked("ccVerified");
  }
 };
}
let passed=0;
function check(name,fn){fn();passed++;console.log("✓ "+name)}
check("Contas rápidas: vista inicial sem contestação",()=>{
 const h=harness();assert.equal(h.el("ccContested").checked,false);
 assert.match(h.el("ccRespondedFields").className,/cc-hidden/);
 assert.ok(!h.el("ccNoContest").className.includes("cc-hidden"));
});
check("Conta simples: valor fixado de 30 000 euros gera 5 UC",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","255");h.click("ccCalculate");
 assert.equal(h.text("ccBaseTotal"),"510,00 €");
 assert.match(h.rows()[0][0],/Petição inicial/);
 assert.match(h.rows()[0][2],/255,00/);
 assert.match(h.rows()[0][3],/255,00/);
 assert.equal(h.rows()[1][6],"Não aplicável");
});
check("Não contestou: não há taxa de contestação",()=>{
 const h=harness();h.ready();h.click("ccCalculate");
 assert.equal(h.rows()[1][1],"—");
 assert.equal(h.rows()[1][6],"Não aplicável");
 assert.match(h.el("ccObservations").children[2].textContent,/Não se calcula taxa de justiça por esse impulso/);
});
check("Contestação apresentada: cria taxa própria do impulso",()=>{
 const h=harness();h.ready();h.checked("ccContested");h.change("ccContested");h.set("ccDefPrepay","normal");
 h.set("ccAuthorFirst","255");h.click("ccCalculate");
 assert.match(h.rows()[1][0],/Contestação/);
 assert.match(h.rows()[1][2],/255,00/);
 assert.match(h.rows()[1][6],/255,00/);
});
check("Contestação apresentada com primeira prestação paga",()=>{
 const h=harness();h.ready();h.checked("ccContested");h.change("ccContested");h.set("ccDefPrepay","normal");
 h.set("ccAuthorFirst","255");h.set("ccDefFirst","255");h.click("ccCalculate");
 assert.match(h.text("ccDifference"),/0,00/);
 assert.match(h.rows()[1][3],/255,00/);
});
check("Segunda prestação devida e não paga é diferença a conferir",()=>{
 const h=harness();h.ready();h.set("ccSecond","due");h.set("ccAuthorFirst","255");h.click("ccCalculate");
 assert.match(h.rows()[0][4],/255,00/);
 assert.match(h.rows()[0][6],/255,00/);
});
check("Segunda prestação dispensada não é adicionada",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","255");h.click("ccCalculate");
 assert.equal(h.rows()[0][4],"Dispensada");
 assert.equal(h.rows()[0][6],"0,00 €");
});
check("Segunda prestação por confirmar não gera dívida presumida",()=>{
 const h=harness();h.ready();h.set("ccSecond","unknown");h.click("ccCalculate");
 assert.equal(h.text("ccDifference"),"Por conferir");
 assert.equal(h.rows()[0][6],"Por conferir");
});
check("Autor paga apenas a segunda prestação: sinaliza primeira em falta",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","0");h.set("ccAuthorSecond","255");h.click("ccCalculate");
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/primeira prestação não está integralmente paga/);
});
check("Pagamento superior ao devido é excesso potencial, não restituição automática",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","400");h.click("ccCalculate");
 assert.match(h.rows()[0][6],/excesso/);
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/não constitui automaticamente direito à restituição/);
});
check("AT com contestação e dispensa prévia: não declarar dívida vencida",()=>{
 const h=harness();h.ready();h.checked("ccContested");h.change("ccContested");h.set("ccDefPrepay","deferred");h.click("ccCalculate");
 assert.match(h.el("ccObservations").children[2].textContent,/Dispensa prévia/);
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/não tratar a diferença como dívida vencida/);
});
check("AT com dispensa prévia: o quadro não apresenta dívida vencida",()=>{
 const h=harness();h.ready();h.checked("ccContested");h.change("ccContested");
 h.set("ccDefPrepay","deferred");h.click("ccCalculate");
 assert.equal(h.rows()[1][6],"Dispensa prévia · art. 15.º");
 assert.equal(h.text("ccDifference"),"Por conferir");
});
check("Pagamento de segunda prestação dispensada exige conferência do excesso",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","255");h.set("ccAuthorSecond","255");
 h.click("ccCalculate");
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/pagamento da segunda prestação apesar/);
});
check("AT sem contestação: pagamento declarado é sinalizado sem criar taxa",()=>{
 const h=harness();h.ready();h.set("ccDefFirst","100");h.click("ccCalculate");
 assert.equal(h.rows()[1][6],"Não aplicável");
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/sem contestação registada/);
});
check("Escalão máximo 275 mil: 16 UC por impulso",()=>{
 const h=harness();h.ready("275000");h.click("ccCalculate");
 assert.match(h.text("ccBaseTotal").replace(/\s/g,""),/1632,00/);
});
check("Acima de 275 mil: remanescente deve ser conferido",()=>{
 const h=harness();h.ready("400000");h.click("ccCalculate");
 assert.match(h.el("ccWarnings").children[1].children.map(x=>x.textContent).join(" "),/remanescente/);
});
check("Processo anterior a 2012: bloqueio por regime temporal",()=>{
 const h=harness();h.ready();h.set("ccDate","2011-12-31");h.click("ccCalculate");
 assert.match(h.text("ccStatus"),/anterior a 29-03-2012/);
});
check("Montantes negativos e mais de duas casas decimais são rejeitados",()=>{
 const h=harness();h.ready();h.set("ccAuthorFirst","0.001");h.click("ccCalculate");
 assert.match(h.text("ccStatus"),/pagamentos introduzidos/);
 h.set("ccAuthorFirst","-1");h.click("ccCalculate");
 assert.match(h.text("ccStatus"),/pagamentos introduzidos/);
});
check("Ao alterar valores, o quadro anterior fica oculto",()=>{
 const h=harness();h.ready();h.click("ccCalculate");
 assert.ok(!h.el("ccResult").className.includes("cc-hidden"));
 h.set("ccValue","2000");h.change("ccValue");
 assert.ok(h.el("ccResult").className.includes("cc-hidden"));
});
check("A página principal tem ligação às ferramentas técnicas",()=>{
 assert.match(html,/href="custas-tecnico\.html"/);
 assert.match(html,/artigo 14.º-A/);
 assert.match(html,/src="assets\/theme\.js"/);
});
console.log(passed+" testes do percurso simples A01 concluídos.");
