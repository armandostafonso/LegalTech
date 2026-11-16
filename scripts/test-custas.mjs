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
 assert.match(read("obA"),/255,00/);
 els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("autoResult"),/já registada/);assert.match(read("obA"),/255,00/);
});
check("Taxa-base: alteração do impulso exige novo cálculo",()=>{
 put("autoRef","AUTO-REC-001");put("autoType","recurso");
 click("autoInsert");assert.match(read("autoResult"),/Calcula novamente/);
});
check("Taxa-base: transferência é substitutiva",()=>{
 els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("obA"),/510,00/);
 click("obApply");assert.equal(els.get("a").value,"510.00");click("obApply");assert.equal(els.get("a").value,"510.00");
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

check("Prestações: primeira I-A é metade dos 5 UC",()=>{
 put("autoValue","30000");put("autoDate","2026-11-16");put("autoParty","a");put("autoType","peticao");put("autoRef","PREST-001");put("autoUC","102");
 put("pa_entity","person");put("pa_exemption","none");put("pa_aid","none");els.get("autoVerified").checked=true;
 click("autoPreview");assert.match(read("autoResult"),/1.ª prestação: 255,00/);assert.match(read("autoResult"),/2.ª prestação potencial: 255,00/);
 click("autoInsert");assert.match(read("obA"),/255,00/);
});
check("Prestações: não se cria segunda sem exclusão de causas de dispensa",()=>{
 put("secondSource","1");click("secondPreview");assert.match(read("secondCalcResult"),/Ainda não foi excluída/);
});
check("Prestações: segunda é bloqueada se não há audiência final",()=>{
 put("secondOther","no");put("hearing","no");put("endbefore","no");put("opp","no");put("priority","no");els.get("secondVerified").checked=true;
 click("secondPreview");assert.match(read("secondCalcResult"),/causa de não pagamento/);
});
check("Prestações: criar segunda 255 € após validação",()=>{
 put("hearing","yes");click("secondPreview");assert.match(read("secondCalcResult"),/255,00/);click("secondCreate");assert.match(read("secondCalcResult"),/lançada/);
 assert.match(read("obA"),/510,00/);
});
check("Prestações: impede duplicar a mesma segunda prestação",()=>{
 els.get("secondVerified").checked=true;click("secondPreview");assert.match(read("secondCalcResult"),/já está registada/);
});
check("Remanescente: recusar valor com instrução não concluída",()=>{
 put("remvalue","400000");put("uc","102");put("remtable","A");put("remTarget","a");put("remRef","REM-A01");put("remPayPct","100");put("remdisp","no");put("instruction","unknown");put("remcost","loser");put("remDecision","verified");els.get("remVerified").checked=true;
 click("remObPreview");assert.match(read("remObResult"),/instrução está por verificar/);
});
check("Remanescente: recusar dispensa integral",()=>{
 put("instruction","no");put("remdisp","yes");click("remObPreview");assert.match(read("remObResult"),/Dispensa integral/);
});
check("Remanescente: sem dispensa exige 100 %",()=>{
 put("remdisp","no");put("remPayPct","50");click("remObPreview");assert.match(read("remObResult"),/tem de ser 100/);
});
check("Remanescente: dispensa parcial com 50 % de 1530 €",()=>{
 put("remdisp","partial");click("remObPreview");assert.match(read("remObResult"),/765,00/);click("remObCreate");assert.match(read("remObResult"),/registado/);assert.match(read("obA"),/1.?275,00/);
});
check("Remanescente: impedir dupla criação com a mesma referência",()=>{
 els.get("remVerified").checked=true;click("remObPreview");assert.match(read("remObResult"),/Já existe obrigação/);
});
check("Prestações e remanescente: transferir sem duplicar",()=>{
 click("obApply");assert.equal(els.get("a").value,"1275.00");click("obApply");assert.equal(els.get("a").value,"1275.00");
});
check("Prestações: impede retirar primeira com segunda dependente",()=>{
 els.get("obRows").listeners.click({target:{closest:()=>({dataset:{removeOb:"1"}})}});
 assert.match(read("obMessage"),/segunda prestação vinculada/);
});
check("Prestações: reposição limpa o cálculo e as decisões",()=>{
 click("reset");
 assert.equal(els.get("remRef").value,"");
 assert.equal(els.get("remPayPct").value,"100");
 assert.equal(els.get("secondVerified").checked,false);
 assert.equal(els.get("remVerified").checked,false);
});

check("Benefícios: primeira I-A em acção de dezembro de 2026",()=>{
 put("autoParty","a");put("autoType","peticao");put("autoDate","2026-12-15");put("autoValue","30000");put("autoUC","102");put("autoRef","BEN-PI-01");
 put("pa_entity","person");put("pa_exemption","none");put("pa_aid","none");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("obA"),/255,00/);
});
check("Benefícios: redução a 90% exige todos os pressupostos",()=>{
 put("benefitSource","1");put("benefitRule","electronic90");els.get("benefitVerified").checked=true;click("benefitPreview");
 assert.match(read("benefitResult"),/exige parte não representada/);
});
check("Benefícios: 90% = 10% de desconto na taxa, não 90%",()=>{
 put("benefitNoCounsel","yes");put("benefitOptional","yes");put("benefitAllElectronic","yes");click("benefitPreview");
 assert.match(read("benefitResult"),/459,00/);assert.match(read("benefitResult"),/229,50/);
 click("benefitApply");assert.match(read("obA"),/229,50/);
});
check("Benefícios: não reduzir duas vezes",()=>{
 els.get("benefitVerified").checked=true;click("benefitPreview");assert.match(read("benefitResult"),/já foi aplicada/);
});
check("Benefícios: segunda prestação vinculada à taxa reduzida",()=>{
 put("secondSource","1");put("secondOther","no");put("hearing","yes");put("endbefore","no");put("opp","no");put("priority","no");els.get("secondVerified").checked=true;
 click("secondPreview");assert.match(read("secondCalcResult"),/229,50/);click("secondCreate");assert.match(read("obA"),/459,00/);
});
check("Benefícios: restaurar a taxa total preservando a soma das prestações",()=>{
 put("benefitSource","1");put("benefitRule","restore");els.get("benefitVerified").checked=true;click("benefitPreview");
 assert.match(read("benefitResult"),/Repor os montantes/);click("benefitApply");assert.match(read("obA"),/510,00/);
});
check("Benefícios: redução pós-2026 bloqueada para acção de novembro de 2026",()=>{
 put("autoRef","BEN-OLD-01");put("autoDate","2026-11-15");put("autoValue","30000");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 assert.match(read("obA"),/765,00/);
 put("benefitSource","3");put("benefitRule","electronic90");els.get("benefitVerified").checked=true;click("benefitPreview");
 assert.match(read("benefitResult"),/apenas para acções propostas/);
});
check("Benefícios: isenção e apoio judiciário não geram taxa zero",()=>{
 put("benefitSource","1");put("benefitRule","review");put("pa_exemption","mp");click("benefitPreview");
 assert.match(read("benefitResult"),/isenção invocada/);click("benefitApply");assert.match(read("benefitResult"),/sem efeito financeiro/);
 assert.match(read("obA"),/765,00/);put("pa_exemption","none");
});
check("Benefícios: pagamento prévio diferido não altera obrigação",()=>{
 put("obParty","b");put("obType","peticao");put("obRef","BEN-EST-01");put("obAmount","510.00");put("obBasis","RCP 15.º/1/a), valor manual sujeito a conferência");els.get("obChecked").checked=true;click("obAdd");
 assert.match(read("obB"),/510,00/);
 put("pb_entity","state");put("pb_exemption","none");put("pb_aid","none");put("pb_excluded","no");put("actdate","2026-12-20");
 put("benefitSource","4");put("benefitRule","prepay");els.get("benefitVerified").checked=true;click("benefitPreview");
 assert.match(read("benefitResult"),/não corresponde a taxa zero/);click("benefitApply");assert.match(read("obB"),/510,00/);
});
check("Benefícios: dispensa prévia mantém a conferência jurídica incompleta",()=>{
 for(const id of ["a","ap","b","bp","extra","extrap"])put(id,"0");
 put("a","765");put("b","510");click("calc");
 assert.match(read("notes"),/não são dívidas imediatamente exigíveis/);
});
check("Benefícios: remover registo de dispensa prévia",()=>{
 put("benefitSource","4");put("benefitRule","restore");els.get("benefitVerified").checked=true;click("benefitPreview");click("benefitApply");
 assert.match(read("obB"),/510,00/);
});
check("Benefícios: não alterar taxas depois de movimentos imputados",()=>{
 put("ledgerParty","a");put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerObligation","1");put("ledgerRef","BEN-PAG-01");put("ledgerDate","2026-12-18");put("ledgerAmount","100.00");click("ledgerAdd");
 put("benefitSource","1");put("benefitRule","electronic90");els.get("benefitVerified").checked=true;click("benefitPreview");
 assert.match(read("benefitResult"),/Existem movimentos associados/);
});
check("Benefícios: reset limpa os novos campos e movimentos",()=>{
 click("reset");assert.equal(els.get("benefitVerified").checked,false);assert.match(read("obA"),/0,00/);assert.match(read("ledgerA"),/0,00/);
});

check("Benefícios: actualizar a ficha da parte invalida redução anterior",()=>{
 put("autoDate","2026-12-20");put("autoValue","30000");put("autoUC","102");put("autoRef","AUDIT-PI-01");put("autoParty","a");put("autoType","peticao");
 put("pa_entity","person");put("pa_exemption","none");put("pa_aid","none");els.get("autoVerified").checked=true;click("autoPreview");click("autoInsert");
 put("benefitSource","1");put("benefitRule","electronic90");put("benefitNoCounsel","yes");put("benefitOptional","yes");put("benefitAllElectronic","yes");els.get("benefitVerified").checked=true;click("benefitPreview");click("benefitApply");
 assert.match(read("obA"),/229,50/);
 put("pa_exemption","mp");els.get("pa_exemption").listeners.change();click("obApply");
 assert.match(read("obMessage"),/sem verificação jurídica actualizada/);
});
check("Benefícios: reverter redução quando as premissas deixam de valer",()=>{
 put("benefitSource","1");put("benefitRule","restore");els.get("benefitVerified").checked=true;click("benefitPreview");click("benefitApply");
 assert.match(read("obA"),/255,00/);
});
check("Benefícios: benefício pode ser revalidado sem novo desconto",()=>{
 put("pa_exemption","none");put("benefitRule","electronic90");els.get("benefitVerified").checked=true;click("benefitPreview");click("benefitApply");
 assert.match(read("obA"),/229,50/);
 put("benefitAllElectronic","unknown");els.get("benefitAllElectronic").listeners.change();click("obApply");
 assert.match(read("obMessage"),/sem verificação jurídica actualizada/);
 put("benefitAllElectronic","yes");els.get("benefitVerified").checked=true;click("benefitPreview");click("benefitApply");
 assert.match(read("benefitResult"),/revalidado/);assert.match(read("obA"),/229,50/);
});
check("Benefícios: transferência após revalidação sem somas duplicadas",()=>{
 click("obApply");assert.equal(els.get("a").value,"229.50");click("obApply");assert.equal(els.get("a").value,"229.50");
});
check("Benefícios: limpeza final mantém o módulo disponível",()=>{
 click("reset");assert.match(read("obA"),/0,00/);assert.match(read("benefitResult"),/Selecciona uma obrigação/);
});

check("Responsabilidade: bloqueia encargos sem confirmação da decisão",()=>{
 put("respPhase","acao");put("respBasis","loss");put("respRef","ENC-001");put("respAmount","100.01");
 put("respShareA","30");put("respDecisionDate","2026-11-16");put("respDecisionRef","SENTENCA-TESTE-1");
 click("respPreview");assert.match(read("respResult"),/Confirma a decisão/);
});
check("Responsabilidade: reparte 100,01 € com acerto de cêntimos",()=>{
 els.get("respVerified").checked=true;click("respPreview");
 assert.match(read("respResult"),/30,00/);assert.match(read("respResult"),/70,01/);
 click("respAdd");assert.match(read("respTotalA"),/30,00/);assert.match(read("respTotalB"),/70,01/);
 assert.equal(read("respPending"),"1");assert.match(read("obA"),/0,00/);
});
check("Responsabilidade: lançar encargos uma só vez nas duas partes",()=>{
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"1",respAction:"post"}})}});
 assert.match(read("respResult"),/lançado uma única vez/);
 assert.match(read("obA"),/30,00/);assert.match(read("obB"),/70,01/);
 assert.equal(read("respPending"),"0");
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"1",respAction:"post"}})}});
 assert.match(read("respResult"),/já lançado/);assert.match(read("obA"),/30,00/);
});
check("Responsabilidade: impedir remover lançamento fora do mapa",()=>{
 els.get("obRows").listeners.click({target:{closest:()=>({dataset:{removeOb:"1"}})}});
 assert.match(read("obMessage"),/pertence ao mapa de responsabilidade/);
 click("obClear");assert.match(read("obMessage"),/retira primeiro/);
});
check("Responsabilidade: transferência não soma duas vezes",()=>{
 click("obApply");assert.equal(els.get("a").value,"30.00");assert.equal(els.get("b").value,"70.01");
 click("obApply");assert.equal(els.get("a").value,"30.00");assert.equal(els.get("b").value,"70.01");
});
check("Responsabilidade: não permite remover mapa lançado sem desfazer obrigações",()=>{
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"1",respAction:"remove"}})}});
 assert.match(read("respResult"),/Retira primeiro os lançamentos/);assert.equal(read("respCount"),"1");
});
check("Responsabilidade: não desfaz encargos com pagamentos imputados",()=>{
 put("ledgerParty","a");put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerObligation","1");put("ledgerRef","PAG-ENC-001");put("ledgerDate","2026-11-16");put("ledgerAmount","10");click("ledgerAdd");
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"1",respAction:"undo"}})}});
 assert.match(read("respResult"),/movimentos financeiros/);
});
check("Responsabilidade: retirar movimento permite desfazer lançamentos",()=>{
 els.get("ledgerRows").listeners.click({target:{closest:()=>({dataset:{record:"1",action:"remove"}})}});
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"1",respAction:"undo"}})}});
 assert.match(read("respResult"),/retiradas/);
 assert.match(read("obA"),/0,00/);assert.match(read("obB"),/0,00/);
});
check("Responsabilidade: repartição com uma parte responsável a 100%",()=>{
 put("respRef","ENC-002");put("respAmount","51");put("respShareA","0");els.get("respVerified").checked=true;
 click("respPreview");assert.match(read("respResult"),/51,00/);click("respAdd");
 els.get("respRows").listeners.click({target:{closest:()=>({dataset:{respId:"2",respAction:"post"}})}});
 assert.match(read("obA"),/0,00/);assert.match(read("obB"),/51,00/);
});
check("Responsabilidade: não duplica encargos de referência igual",()=>{
 put("respRef","ENC-002");put("respAmount","51");els.get("respVerified").checked=true;click("respPreview");
 assert.match(read("respResult"),/Já existe encargo/);
});
check("Responsabilidade: limpeza bloqueada enquanto houver obrigações",()=>{
 click("respClear");assert.match(read("respResult"),/Existem encargos lançados/);
});
check("Responsabilidade: reposição integral limpa mapa e obrigações",()=>{
 click("reset");assert.equal(read("respCount"),"0");assert.match(read("respTotalA"),/0,00/);assert.match(read("obB"),/0,00/);
});

check("Proposta: apresenta advertências sem obrigações",()=>{
 click("proposalPreview");assert.match(els.get("proposalStatus").value,/INCOMPLETA/);
 assert.match(read("proposalNote"),/Não existem obrigações/);
});
check("Proposta: contém só diferenças aritméticas por sujeito",()=>{
 put("obParty","a");put("obType","encargo");put("obRef","PRO-A1");put("obAmount","30");put("obBasis","Artigo 532 CPC, encargo confirmado");els.get("obChecked").checked=true;click("obAdd");
 put("obParty","b");put("obRef","PRO-B1");put("obAmount","70");put("obBasis","Decisão judicial, encargo B confirmado");els.get("obChecked").checked=true;click("obAdd");
 click("obApply");
 put("ap","15");put("bp","60");put("extrap","0");
 click("proposalPreview");
 assert.match(els.get("proposalRows").innerHTML,/30,00/);assert.match(els.get("proposalRows").innerHTML,/70,00/);
 assert.match(els.get("proposalRows").innerHTML,/15,00/);assert.match(els.get("proposalRows").innerHTML,/10,00/);
 assert.match(read("proposalText"),/Diferenças aritméticas não equivalem necessariamente a dívidas/);
});
check("Proposta: pagamento alterado torna a prévia inválida",()=>{
 put("bp","61");click("proposalExport");
 assert.match(read("proposalNote"),/desactualizada/);
});
check("Proposta: identificação de pendências separa responsabilidade e pagamento",()=>{
 put("proposalTransit","2026-11-16");els.get("proposalVerified").checked=true;
 click("proposalPreview");assert.match(read("proposalNote"),/Fichas dos intervenientes/);
});
check("Proposta: documento sem bloqueios técnicos exige verificação jurídica",()=>{
 for(const id of ["law","table","exempt","remainder","charges"])els.get(id).checked=true;
 for(const p of ["pa","pb"]){
  put(p+"_role",p==="pa"?"autor":"reu");put(p+"_entity","person");
  put(p+"_exemption","none");put(p+"_aid","none");put(p+"_excluded","no");
  put(p+"_outcome","condemned");put(p+"_decision","2026-11-12");
  els.get(p+"_evidence").checked=true;
 }
 click("analyseparties");assert.match(read("partiesstatus"),/verificados/);
 click("proposalPreview");assert.match(els.get("proposalStatus").value,/sem bloqueios técnicos/i);
 assert.match(read("proposalText"),/NÃO É CONTA OFICIAL/);
});
check("Proposta: diferenças registadas não incluem custas de parte",()=>{
 assert.match(read("proposalText"),/Custas de parte excluídas/);
});
check("Proposta: reset invalida documento anterior",()=>{
 click("reset");click("proposalExport");assert.match(read("proposalNote"),/desactualizada/);
});
console.log(tests+" testes do módulo A01 concluídos.");
