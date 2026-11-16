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

check("Obrigações: inserir petição inicial para parte A",()=>{
 put("obParty","a");put("obType","peticao");put("obRef","PI-001");put("obAmount","612.00");put("obBasis","RCP art. 6 e tabela I-A, versão aplicável");els.get("obChecked").checked=true;click("obAdd");
 assert.match(read("obA"),/612,00/);assert.match(read("obMessage"),/adicionada/);
});
check("Obrigações: bloquear impulso duplicado",()=>{
 put("obRef","PI-001");put("obAmount","612.00");put("obBasis","Fundamento fictício conferido");els.get("obChecked").checked=true;click("obAdd");
 assert.match(read("obMessage"),/duplicado/);assert.match(read("obA"),/612,00/);
});
check("Obrigações: somar recursos sem duplicar petição",()=>{
 put("obType","recurso");put("obRef","REC-001");put("obAmount","306.00");put("obBasis","Tabela I-B ilustrativa a verificar");els.get("obChecked").checked=true;click("obAdd");
 assert.match(read("obA"),/918,00/);
});
check("Obrigações: acrescentar contestação de parte B",()=>{
 put("obParty","b");put("obType","contestacao");put("obRef","CON-001");put("obAmount","612.00");put("obBasis","Tabela I-A a verificar no processo");els.get("obChecked").checked=true;click("obAdd");
 assert.match(read("obB"),/612,00/);
});
check("Obrigações: transferir por substituição, sem duplicação",()=>{
 click("obApply");assert.equal(els.get("a").value,"918.00");assert.equal(els.get("b").value,"612.00");click("obApply");assert.equal(els.get("a").value,"918.00");
});
check("Obrigações: pagamento associado ao impulso correcto",()=>{
 put("ledgerParty","a");put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerObligation","1");put("ledgerRef","PAG-PI-001");put("ledgerDate","2026-11-16");put("ledgerAmount","612");click("ledgerAdd");
 assert.match(read("ledgerA"),/612,00/);assert.match(els.get("obRows").innerHTML,/PAG-PI-001|612,00/);
});
check("Obrigações: impedir afectação do pagamento a outra parte",()=>{
 put("ledgerParty","b");put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerObligation","1");put("ledgerRef","PAG-B-INVALIDO");put("ledgerAmount","15");click("ledgerAdd");
 assert.match(read("ledgerMessage"),/não pertence/);assert.match(read("ledgerB"),/0,00/);
});
check("Obrigações: restituição conserva o impulso de origem",()=>{
 put("ledgerParty","a");put("ledgerKind","refund");put("ledgerStatus","confirmed");put("ledgerObligation","");put("ledgerRef","PAG-PI-001");put("ledgerAmount","100");click("ledgerAdd");
 assert.match(read("ledgerMessage"),/manter o impulso/);
 put("ledgerObligation","1");put("ledgerAmount","100");click("ledgerAdd");assert.match(read("ledgerA"),/512,00/);
});
check("Obrigações: não retirar obrigação com movimentos imputados",()=>{
 els.get("obRows").listeners.click({target:{closest:()=>({dataset:{removeOb:"1"}})}});
 assert.match(read("obMessage"),/Retira primeiro/);assert.match(read("obA"),/918,00/);
});
check("Obrigações: reset final limpa os novos registos",()=>{
 click("reset");assert.match(read("obA"),/0,00/);assert.match(read("ledgerA"),/0,00/);
});

check("Taxa-base: I-A para valor 30.000 € = 5 UC",()=>{
 put("autoParty","a");put("autoType","peticao");put("autoDate","2026-11-16");put("autoValue","30000");put("autoUC","102");put("autoRef","AUTO-PI-001");
 click("autoPreview");assert.match(read("autoResult"),/510,00/);
});
check("Taxa-base: recurso I-B para valor 30.000 € = 2,5 UC",()=>{
 put("autoType","recurso");click("autoPreview");assert.match(read("autoResult"),/255,00/);
});
check("Taxa-base: valor superior a 275.000 € pára no escalão 16 UC",()=>{
 put("autoType","peticao");put("autoValue","400000");click("autoPreview");
 assert.match(read("autoResult"),/1\\.?632,00|1632,00/);assert.match(read("autoResult"),/remanescente não incluído/);
});
check("Taxa-base: data anterior a 29 de março de 2012 é bloqueada",()=>{
 put("autoDate","2011-01-01");click("autoPreview");assert.match(read("autoResult"),/bloqueado/);
});
check("Taxa-base: não cria obrigação sem confirmação das premissas",()=>{
 put("autoDate","2026-11-16");put("autoValue","30000");put("autoRef","AUTO-PI-001");
 click("autoPreview");click("autoInsert");assert.match(read("autoResult"),/não criada/);
});
check("Taxa-base: cria obrigação controlada e impede repetição",()=>{
 put("pa_exemption","none");put("pa_aid","none");put("pa_entity","person");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");assert.match(read("autoResult"),/criada/);
 assert.match(read("obA"),/510,00/);
 els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("autoResult"),/já registada/);assert.match(read("obA"),/510,00/);
});
check("Taxa-base: alteração do impulso exige novo cálculo",()=>{
 put("autoRef","AUTO-REC-001");put("autoType","recurso");
 click("autoInsert");assert.match(read("autoResult"),/Calcula novamente/);
});
check("Taxa-base: transferência é substitutiva",()=>{
 els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("obA"),/765,00/);
 click("obApply");assert.equal(els.get("a").value,"765.00");click("obApply");assert.equal(els.get("a").value,"765.00");
});

check("Taxa-base: bloqueia isenção ou apoio judiciário",()=>{
 put("autoType","peticao");put("autoRef","AUTO-BLOCK-001");put("pa_exemption","mp");put("pa_aid","none");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("autoResult"),/isenção e apoio judiciário/);
 put("pa_exemption","none");put("pa_aid","exempt");click("autoPreview");click("autoInsert");assert.match(read("autoResult"),/isenção e apoio judiciário/);
 put("pa_aid","none");
});
check("Taxa-base: bloqueia dispensa prévia de entidade pública",()=>{
 put("pa_entity","state");put("pa_excluded","no");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");assert.match(read("autoResult"),/dispensa de pagamento prévio/);
 put("pa_entity","person");
});
check("Taxa-base: montantes com mais de duas casas são rejeitados",()=>{
 put("autoValue","100.001");click("autoPreview");assert.match(read("autoResult"),/válidos/);
});
check("Taxa-base: limpar apaga estado da simulação",()=>{
 click("reset");assert.equal(els.get("autoValue").value,"");assert.match(read("autoResult"),/Indica os dados/);
});
console.log(tests+" testes do módulo A01 concluídos.");
