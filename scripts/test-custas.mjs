import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const html=fs.readFileSync("custas.html","utf8");
// Os scripts externos não têm corpo; os IDs são recolhidos apenas do HTML.
const inline=[...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
 .filter(m=>!/\bsrc\s*=/.test(m[1])&&m[2].trim()).map(m=>m[2]);
const markup=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,"");
const elements=[...markup.matchAll(/<([a-z][\w-]*)\b[^>]*\bid="([^"]+)"[^>]*>/gi)];
const ids=elements.map(m=>m[2]);
assert.equal(new Set(ids).size,ids.length,"IDs duplicados na página");
const els=new Map(elements.map(m=>[m[2],{
 value:"",checked:false,textContent:"",innerHTML:"",hidden:false,
 selectedIndex:0,tagName:m[1].toUpperCase(),type:(m[0].match(/\btype="([^"]+)"/)||[])[1]||"text",
 listeners:{},addEventListener(type,fn){this.listeners[type]=fn}
}]));
for(const m of markup.matchAll(/<select\b[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)){
 const first=m[2].match(/<option value="([^"]*)"/);
 if(first)els.get(m[1]).value=first[1];
}
const document={documentElement:{dataset:{theme:"light"}},getElementById:id=>{assert.ok(els.has(id),"ID inexistente: "+id);return els.get(id)}};
const ctx=vm.createContext({document,Intl,Number,Math,console});
new vm.Script(inline.at(-1),{filename:"custas.html"}).runInContext(ctx);
const put=(id,value)=>els.get(id).value=String(value),click=id=>{assert.ok(els.get(id).listeners.click,"sem evento click: "+id);return els.get(id).listeners.click()},read=id=>els.get(id).textContent;
let tests=0;
function check(name,fn){fn();tests++;console.log("✓ "+name)}
check("Escalão I-A exactamente 275.000 €",()=>{put("calcvalue",275000);put("uc",102);click("suggest");assert.match(read("suggestion"),/16 UC/)});
check("Escalão I-A bloqueia acima de 275.000 €",()=>{put("calcvalue",275000.01);click("suggest");assert.match(read("suggestion"),/bloqueado/)});
check("Remanescente: zero a 275.000 €",()=>{put("remvalue",275000);put("remtable","A");click("remcalc");assert.match(read("remresult"),/não há acréscimo/)});
check("Remanescente: primeira fracção de 25.000 €",()=>{put("remvalue",275000.01);put("remtable","A");click("remcalc");assert.match(read("remresult"),/3 UC/)});
check("Remanescente: 400.000 € em coluna A",()=>{put("remvalue",400000);click("remcalc");assert.match(read("remresult"),/15 UC/)});
check("Art. 6.º n.º 8: termo antes da instrução",()=>{put("instruction","yes");click("remcalc");assert.match(read("remresult"),/n.º 8/)});
check("Art. 14.º-A f): suspensão sem pedido de continuação",()=>{put("hearing","yes");put("endbefore","no");put("opp","no");put("priority","yes");put("authorcontinue","no");click("second");assert.match(read("secondresult"),/al. f/)});
check("Art. 14.º-A f): pedido de continuação afasta essa dispensa",()=>{put("authorcontinue","yes");click("second");assert.doesNotMatch(read("secondresult"),/Indício de não pagamento/)});
check("Datas futuras: aplicar ressalva art. 6.º a acções anteriores",()=>{put("entrydate","2026-11-15");put("actdate","2026-12-10");click("timecheck");assert.match(read("timeresult"),/não se aplica/)});
check("Conferência por parte não compensa dívida com excesso noutra parte",()=>{for(const id of ["a","ap","b","bp","extra","extrap"])put(id,0);put("a",100);put("ap",0);put("b",100);put("bp",200);click("calc");assert.match(read("debt"),/100,00/);assert.match(read("over"),/100,00/)});
check("Fichas: Estado sem condenação, acto posterior a 1 de dezembro de 2026",()=>{
  put("actdate","2026-12-22");
  for(const p of ["pa","pb"]){put(p+"_role",p==="pa"?"autor":"reu");put(p+"_entity",p==="pa"?"person":"state");put(p+"_exemption","none");put(p+"_aid","none");put(p+"_excluded","no");put(p+"_outcome",p==="pa"?"condemned":"notcondemned");put(p+"_decision","2026-12-20");els.get(p+"_evidence").checked=true}
  click("analyseparties");assert.match(read("pb_result"),/RCP 15.º\/3/);assert.match(read("partiesstatus"),/verificados/);
});
check("Fichas: excepção contratual ao pagamento prévio",()=>{put("pb_excluded","yes");click("analyseparties");assert.match(read("pb_result"),/matéria excluída/);assert.doesNotMatch(read("pb_result"),/possível dispensa de pagamento prévio/)});
check("Fichas: falta de comprovativo bloqueia revisão completa",()=>{els.get("pb_evidence").checked=false;click("analyseparties");assert.match(read("partiesstatus"),/incompleta/);assert.match(read("pb_result"),/POR CONFIRMAR/)});
check("Fichas: isenção do MP em sujeito incompatível gera alerta",()=>{put("pa_exemption","mp");click("analyseparties");assert.match(read("pa_result"),/potencialmente incompatíveis/)});
check("Livro: guia emitida não equivale a pagamento",()=>{
 put("ledgerParty","a");put("ledgerKind","guide");put("ledgerRef","GUIA-T-001");put("ledgerDate","2026-11-16");put("ledgerAmount","612");click("ledgerAdd");
 assert.match(read("ledgerA"),/0,00/);
});
check("Livro: pagamento confirmado contabilizado",()=>{
 put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerRef","DUC-T-001");put("ledgerAmount","612");click("ledgerAdd");
 assert.match(read("ledgerA"),/612,00/);
});
check("Livro: duplicação exacta bloqueada",()=>{
 put("ledgerRef","DUC-T-001");put("ledgerAmount","612");click("ledgerAdd");
 assert.match(read("ledgerMessage"),/duplicado/);assert.match(read("ledgerA"),/612,00/);
});
check("Livro: pagamento pendente não somado",()=>{
 put("ledgerRef","DUC-T-002");put("ledgerAmount","100");put("ledgerStatus","pending");click("ledgerAdd");
 assert.match(read("ledgerPending"),/^1$/);assert.match(read("ledgerA"),/612,00/);
});
check("Livro: anulação de guia não desconta pagamento",()=>{
 put("ledgerKind","cancel");put("ledgerRef","GUIA-T-001");put("ledgerAmount","612");click("ledgerAdd");
 assert.match(read("ledgerA"),/612,00/);
});
check("Livro: restituição superior ao pagamento é bloqueada",()=>{
 put("ledgerKind","refund");put("ledgerStatus","confirmed");put("ledgerRef","DUC-T-001");put("ledgerAmount","800");click("ledgerAdd");
 assert.match(read("ledgerMessage"),/superior/);assert.match(read("ledgerA"),/612,00/);
});
check("Livro: restituição confirmada deduzida ao pago",()=>{
 put("ledgerRef","DUC-T-001");put("ledgerAmount","100");click("ledgerAdd");
 assert.match(read("ledgerA"),/512,00/);
});
check("Livro: transferir apenas saldo líquido confirmado",()=>{
 click("ledgerApply");assert.equal(els.get("ap").value,"512.00");assert.equal(els.get("bp").value,"0.00");
});
check("Livro: referência maliciosa é escapada no HTML",()=>{
 put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerRef","<img src=x onerror=alert(1)>");put("ledgerAmount","1");click("ledgerAdd");
 assert.doesNotMatch(els.get("ledgerRows").innerHTML,/<img src=x/);
});
check("Livro: botão limpar repõe os saldos",()=>{
 click("reset");assert.match(read("ledgerA"),/0,00/);assert.equal(read("ledgerPending"),"0");
});
console.log(tests+" testes do módulo A01 concluídos.");
