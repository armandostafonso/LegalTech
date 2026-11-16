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
const downloads=[];
class BlobMock{constructor(parts){this.text=parts.join("")}}
const URLMock={createObjectURL(blob){downloads.push(blob.text);return "blob:legaltech-test"},revokeObjectURL(){}};
const document={
 documentElement:{dataset:{theme:"light"}},
 getElementById:id=>{assert.ok(els.has(id),"ID inexistente: "+id);return els.get(id)},
 createElement:()=>({href:"",download:"",click(){},remove(){}}),
 body:{append(){}}
};
const ctx=vm.createContext({document,Intl,Number,Math,console,Blob:BlobMock,URL:URLMock});
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

check("Proposta: exportação CSV identifica estado e diferenças sem ser conta oficial",()=>{
 click("proposalExport");const csv=downloads.at(-1);
 assert.ok(csv&&csv.includes("Sujeito;Obrigações"),"CSV sem cabeçalho");
 assert.match(csv,/AVISO/);assert.match(csv,/Custas de parte excluídas/);
 assert.match(csv,/Prévia sem bloqueios técnicos/);
});
check("Proposta: alterar a identificação do processo invalida o CSV anterior",()=>{
 const before=downloads.length;put("process","EXEMPLO-ALTERADO");click("proposalExport");
 assert.equal(downloads.length,before);assert.match(read("proposalNote"),/desactualizada/);
});
check("Proposta: divergência entre valor devido e obrigações fica assinalada",()=>{
 put("a","999");click("proposalPreview");
 assert.match(read("proposalNote"),/diverge das obrigações/);
});
check("Proposta: reset invalida documento anterior",()=>{
 click("reset");click("proposalExport");assert.match(read("proposalNote"),/desactualizada/);
});

check("Conferência: rejeita valores monetários com mais de duas casas",()=>{
 put("a","100.001");put("ap","100");put("b","0");put("bp","0");put("extra","0");put("extrap","0");
 click("calc");assert.match(read("status"),/incompletos ou inválidos/);
});
check("Conferência: aceita exactamente dois decimais",()=>{
 put("a","100.01");click("calc");assert.match(read("due"),/100,01/);
});

check("Reconciliação: regista duas obrigações sem imputação automática",()=>{
 put("obParty","a");put("obType","peticao");put("obRef","REC-A-100");put("obAmount","100");put("obBasis","Valor fictício com suporte documental");els.get("obChecked").checked=true;click("obAdd");
 put("obParty","b");put("obRef","REC-B-40");put("obAmount","40");put("obBasis","Valor fictício com suporte documental");els.get("obChecked").checked=true;click("obAdd");
 click("obApply");click("reconcile");
 assert.match(els.get("reconcileRows").innerHTML,/100,00/);assert.match(els.get("reconcileRows").innerHTML,/40,00/);
 assert.match(read("reconcileNote"),/Conferência aritmética sem alertas internos/);
});
check("Reconciliação: confirmado e imputado a uma obrigação",()=>{
 put("ledgerParty","a");put("ledgerKind","payment");put("ledgerStatus","confirmed");put("ledgerObligation","1");put("ledgerRef","REC-PA-25");put("ledgerDate","2026-11-16");put("ledgerAmount","25");click("ledgerAdd");
 click("reconcile");assert.match(els.get("reconcileRows").innerHTML,/75,00/);assert.match(els.get("reconcileRows").innerHTML,/25,00/);
});
check("Reconciliação: movimento pendente não abate dívida aritmética",()=>{
 put("ledgerRef","REC-PA-10-PEND");put("ledgerAmount","10");put("ledgerStatus","pending");click("ledgerAdd");
 click("reconcile");assert.equal(read("reconcilePending"),"1");assert.match(els.get("reconcileRows").innerHTML,/75,00/);
});
check("Reconciliação: não imputado não abate impulso por adivinhação",()=>{
 put("ledgerObligation","");put("ledgerStatus","confirmed");put("ledgerRef","REC-PA-8-SEM-IMP");put("ledgerAmount","8");click("ledgerAdd");
 click("reconcile");assert.match(read("reconcileUnassigned"),/8,00/);assert.match(els.get("reconcileRows").innerHTML,/75,00/);
});
check("Reconciliação: pagamento excessivo gera alerta sem restituição automática",()=>{
 put("ledgerParty","b");put("ledgerObligation","2");put("ledgerRef","REC-PB-60");put("ledgerAmount","60");click("ledgerAdd");
 click("reconcile");assert.equal(read("reconcileOver"),"1");assert.match(els.get("reconcileRows").innerHTML,/20,00/);
 assert.match(read("reconcileNote"),/excesso aritmético/);
});
check("Reconciliação: restituição confirmada abate ao mesmo impulso",()=>{
 put("ledgerParty","a");put("ledgerKind","refund");put("ledgerObligation","1");put("ledgerStatus","confirmed");put("ledgerRef","REC-PA-25");put("ledgerAmount","5");click("ledgerAdd");
 click("reconcile");assert.match(els.get("reconcileRows").innerHTML,/80,00/);
});
check("Reconciliação: proposta contém avisos por impulso e pagamentos sem imputação",()=>{
 click("ledgerApply");click("proposalPreview");
 assert.match(read("proposalText"),/RECONCILIAÇÃO POR IMPULSO/);
 assert.match(read("proposalNote"),/sem obrigação atribuída/);
});
check("Reconciliação: CSV inclui mapa de impulsos",()=>{
 click("proposalExport");const csv=downloads.at(-1);
 assert.match(csv,/Mapa por impulso;Obrigação/);assert.match(csv,/REC-A-100/);
 assert.match(csv,/Não imputados/);
});
check("Reconciliação: alterações ao livro invalidam cópia anterior",()=>{
 put("ledgerParty","b");put("ledgerKind","payment");put("ledgerObligation","2");put("ledgerRef","REC-PB-1");put("ledgerAmount","1");click("ledgerAdd");
 click("reconcileCopy");assert.match(read("reconcileNote"),/desactualizado/);
});
check("Reconciliação: limpar não reutiliza valores anteriores",()=>{
 click("reset");click("reconcile");
 assert.equal(read("reconcilePending"),"0");assert.match(els.get("reconcileRows").innerHTML,/Não existem obrigações/);
});

check("Multissujeito: três autores com identificadores diferentes",()=>{
 for(const name of ["AUTOR-A","AUTOR-B","AUTOR-C"]){
  put("multiName",name);put("multiRole","autor");click("multiAdd");
 }
 assert.equal(read("multiPeopleCount"),"3");
 assert.match(els.get("multiPeopleRows").innerHTML,/AUTOR-C/);
});
check("Multissujeito: não permite interveniente duplicado",()=>{
 put("multiName","autor-a");click("multiAdd");
 assert.match(read("multiMessage"),/já registado/);assert.equal(read("multiPeopleCount"),"3");
});
check("Multissujeito: divisão igual bloqueia solidariedade não verificada",()=>{
 put("multiMode","iguais");put("multiRef","ENC-MULTI-001");put("multiScope","acao");put("multiAmount","100.01");
 put("multiDecision","DEC-001");put("multiDate","2026-11-16");els.get("multiAllLost").checked=true;els.get("multiVerified").checked=true;
 click("multiPreview");assert.match(read("multiResult"),/Solidariedade não excluída/);
});
check("Multissujeito: litisconsórcio totalmente vencido em partes iguais",()=>{
 put("multiSolidarity","no");put("multiSettlement","no");click("multiPreview");
 assert.match(read("multiResult"),/33,34/);assert.match(read("multiResult"),/33,33/);
 click("multiPost");assert.equal(read("multiChargeCount"),"1");
 assert.match(els.get("multiChargesRows").innerHTML,/100,01/);
 assert.match(els.get("multiTotalsRows").innerHTML,/33,34/);
});
check("Multissujeito: não duplica a referência já repartida",()=>{
 put("multiRef","ENC-MULTI-001");put("multiAmount","100.01");els.get("multiVerified").checked=true;
 click("multiPreview");assert.match(read("multiResult"),/já registado/);
});
check("Multissujeito: bloqueia retirada de participante com encargo",()=>{
 els.get("multiPeopleRows").listeners.click({target:{closest:()=>({dataset:{multiRemove:"1"}})}});
 assert.match(read("multiMessage"),/Retira primeiro os registos correspondentes/);
});
check("Multissujeito: solidariedade e transacção não criam quotas",()=>{
 put("multiRef","ENC-MULTI-002");put("multiAmount","51");
 put("multiSolidarity","yes");click("multiPreview");assert.match(read("multiResult"),/Solidariedade não excluída/);
 put("multiSolidarity","no");put("multiSettlement","yes");click("multiPreview");assert.match(read("multiResult"),/Transacção não excluída/);
 put("multiSettlement","no");
});
check("Multissujeito: quotas expressas exigem soma de 100 por cento",()=>{
 put("multiMode","expressa");els.get("multiVerified").checked=true;
 for(const [id,value] of [[1,"50"],[2,"30"],[3,"10"]])
  els.get("multiPeopleRows").listeners.change({target:{dataset:{multiShare:String(id)},value}});
 click("multiPreview");assert.match(read("multiResult"),/perfazer exactamente 100/);
});
check("Multissujeito: quotas expressas conservam cêntimos e total",()=>{
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiShare:"3"},value:"20"}});
 put("multiAmount","101.01");click("multiPreview");
 assert.match(read("multiResult"),/50,51/);assert.match(read("multiResult"),/30,30/);assert.match(read("multiResult"),/20,20/);
 click("multiPost");assert.equal(read("multiChargeCount"),"2");
});
check("Multissujeito: quotas expressas podem pertencer a lados distintos",()=>{
 els.get("multiChargesRows").listeners.click({target:{closest:()=>({dataset:{multiChargeRemove:"2"}})}});
 put("multiName","REU-D");put("multiRole","reu");click("multiAdd");
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiActive:"1"},checked:false}});
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiActive:"2"},checked:false}});
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiShare:"3"},value:"20"}});
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiShare:"4"},value:"80"}});
 put("multiRef","ENC-MULTI-MISTO");put("multiMode","expressa");put("multiAmount","100");els.get("multiVerified").checked=true;
 click("multiPreview");assert.match(read("multiResult"),/REU-D/);
});
check("Multissujeito: partes iguais bloqueadas para posições opostas",()=>{
 put("multiMode","iguais");els.get("multiAllLost").checked=true;click("multiPreview");
 assert.match(read("multiResult"),/mesmo lado/);
});
check("Multissujeito: mapa não altera obrigações nem pagamentos A/B",()=>{
 assert.match(read("obA"),/0,00/);assert.match(read("obB"),/0,00/);
 assert.match(read("ledgerA"),/0,00/);assert.match(read("ledgerB"),/0,00/);
});
check("Multissujeito: a proposta A/B avisa que não inclui o mapa independente",()=>{
 click("proposalPreview");
 assert.match(read("proposalText"),/MULTISSUJEITO NÃO INCLUÍDO NA CONTA A\/B/);
 assert.match(read("proposalNote"),/contabilidade multissujeito autónoma/);
});
check("Multissujeito: CSV autónomo discrimina valores por sujeito",()=>{
 click("multiExport");
 const csv=downloads.at(-1);
 assert.match(csv,/Interveniente;Posição;Total atribuído/);
 assert.match(csv,/AUTOR-A/);assert.match(csv,/AUTOR-C/);
 assert.match(csv,/Não é conta oficial/);
});
check("Multissujeito: limpar mapa não altera A/B nem livro financeiro",()=>{
 click("multiClear");
 assert.equal(read("multiChargeCount"),"0");assert.equal(read("multiPeopleCount"),"0");
 assert.match(read("obA"),/0,00/);assert.match(read("ledgerA"),/0,00/);
});
check("Multissujeito: reposição integral limpa os intervenientes",()=>{
 put("multiName","PESSOA-X");click("multiAdd");click("reset");
 assert.equal(read("multiPeopleCount"),"0");assert.equal(read("multiChargeCount"),"0");
});

check("Multissujeito: CSV neutraliza campos iniciados por fórmulas",()=>{
 put("multiName","=HYPERLINK(1)");put("multiRole","autor");click("multiAdd");
 click("multiExport");
 const csv=downloads.at(-1);
 assert.match(csv,/'=HYPERLINK\(1\)/);
 assert.doesNotMatch(csv,/"=HYPERLINK\(1\)"/);
});
check("Multissujeito: identificadores HTML são escapados contra injecção",()=>{
 put("multiName","<img src=x onerror=alert(1)>");click("multiAdd");
 const html=els.get("multiPeopleRows").innerHTML;
 assert.doesNotMatch(html,/<img src=x/);
 assert.match(html,/&lt;img/);
});
check("Multissujeito: quotas não aceitam mais de duas casas decimais",()=>{
 els.get("multiPeopleRows").listeners.change({target:{dataset:{multiShare:"1"},value:"50.001"}});
 assert.match(read("multiMessage"),/Quota inválida/);
});
check("Multissujeito: valores financeiros excessivos são bloqueados",()=>{
 put("multiRef","ERR-VALOR");put("multiDecision","DEC-ERR");
 put("multiDate","2026-11-16");put("multiAmount","100000000.01");
 put("multiSolidarity","no");put("multiSettlement","no");els.get("multiVerified").checked=true;
 click("multiPreview");assert.match(read("multiResult"),/Montante inválido/);
});
check("Multissujeito: reposição final após verificações de segurança",()=>{
 click("reset");assert.equal(read("multiPeopleCount"),"0");
});

check("Multissujeito financeiro: registar dois sujeitos fictícios",()=>{
 for(const [name,role] of [["AUTOR-X","autor"],["AUTOR-Y","autor"]]){put("multiName",name);put("multiRole",role);click("multiAdd")}
 assert.equal(read("multiPeopleCount"),"2");
 assert.match(els.get("multiObPerson").innerHTML,/AUTOR-X/);
});
check("Multissujeito financeiro: repartir encargo 101,01 por duas partes iguais",()=>{
 put("multiRef","ENC-GRUPO-1");put("multiAmount","101.01");put("multiDecision","DECISAO-TESTE-1");put("multiDate","2026-11-16");
 put("multiMode","iguais");put("multiSolidarity","no");put("multiSettlement","no");
 els.get("multiAllLost").checked=true;els.get("multiVerified").checked=true;
 click("multiPreview");assert.match(read("multiResult"),/50,51/);assert.match(read("multiResult"),/50,50/);
 click("multiPost");assert.equal(read("multiChargeCount"),"1");
});
check("Multissujeito financeiro: sem confirmação não importa obrigações",()=>{
 put("multiImportCharge","1");click("multiImport");
 assert.match(read("multiAccountMessage"),/Confirma a ausência de duplicação/);
 assert.match(els.get("multiObRows").innerHTML,/Sem obrigações/);
});
check("Multissujeito financeiro: importação cria duas obrigações apenas uma vez",()=>{
 els.get("multiImportVerified").checked=true;click("multiImport");
 assert.match(read("multiAccountMessage"),/Encargo importado/);
 assert.match(els.get("multiObRows").innerHTML,/50,51/);assert.match(els.get("multiObRows").innerHTML,/50,50/);
 put("multiImportCharge","1");els.get("multiImportVerified").checked=true;click("multiImport");
 assert.match(read("multiAccountMessage"),/já foi importado/);
});
check("Multissujeito financeiro: importação não altera a conferência A/B",()=>{
 assert.match(read("obA"),/0,00/);assert.match(read("obB"),/0,00/);
 assert.match(read("ledgerA"),/0,00/);assert.match(read("ledgerB"),/0,00/);
});
check("Multissujeito financeiro: obrigação manual de taxa não deduzida dos encargos",()=>{
 put("multiObPerson","1");put("multiObKind","taxa");put("multiObRef","TAXA-X-1");put("multiObAmount","255");
 put("multiObBasis","RCP e tabela aplicável, manualmente verificada");els.get("multiObVerified").checked=true;
 click("multiObAdd");assert.match(read("multiAccountMessage"),/Obrigação individual registada/);
 click("multiAccountReconcile");assert.match(els.get("multiBalanceRows").innerHTML,/305,51/);
});
check("Multissujeito financeiro: obrigação duplicada é bloqueada",()=>{
 put("multiObPerson","1");put("multiObRef","taxa-x-1");put("multiObAmount","255");
 put("multiObBasis","Fundamento confirmado manualmente");els.get("multiObVerified").checked=true;
 click("multiObAdd");assert.match(read("multiAccountMessage"),/duplicada/);
});
check("Multissujeito financeiro: emitir guia não constitui pagamento",()=>{
 put("multiMovePerson","1");put("multiMoveOb","3");put("multiMoveKind","guide");put("multiMoveRef","DUC-X-1");put("multiMoveDate","2026-11-16");
 put("multiMoveAmount","255");click("multiMoveAdd");
 click("multiAccountReconcile");assert.match(els.get("multiBalanceRows").innerHTML,/305,51/);
 assert.match(els.get("multiBalanceRows").innerHTML,/0,00/);
});
check("Multissujeito financeiro: pagamento pendente não é contabilizado",()=>{
 put("multiMoveKind","payment");put("multiMoveStatus","pending");put("multiMoveRef","DUC-X-1");put("multiMoveAmount","100");
 click("multiMoveAdd");click("multiAccountReconcile");
 assert.match(read("multiAccountNote"),/pendente/);assert.match(els.get("multiBalanceRows").innerHTML,/305,51/);
});
check("Multissujeito financeiro: confirmar pagamento actualiza saldo da mesma parte",()=>{
 els.get("multiMoveRows").listeners.click({target:{closest:()=>({dataset:{multiMoveConfirm:"2"}})}});
 click("multiAccountReconcile");
 assert.match(els.get("multiBalanceRows").innerHTML,/100,00/);assert.match(els.get("multiBalanceRows").innerHTML,/205,51/);
 assert.match(els.get("multiObRows").innerHTML,/100,00/);
});
check("Multissujeito financeiro: impedir restituição superior ao pagamento",()=>{
 put("multiMoveKind","refund");put("multiMoveStatus","confirmed");put("multiMoveRef","DUC-X-1");put("multiMoveAmount","150");
 click("multiMoveAdd");assert.match(read("multiAccountMessage"),/Restituição excede/);
});
check("Multissujeito financeiro: restituição válida reduz pagamento líquido",()=>{
 put("multiMoveAmount","20");click("multiMoveAdd");click("multiAccountReconcile");
 assert.match(els.get("multiBalanceRows").innerHTML,/80,00/);assert.match(els.get("multiBalanceRows").innerHTML,/225,51/);
});
check("Multissujeito financeiro: pagamento sem imputação fica separado por sujeito",()=>{
 put("multiMovePerson","2");put("multiMoveOb","");put("multiMoveKind","payment");put("multiMoveStatus","confirmed");
 put("multiMoveRef","PAG-Y-SEM-IMP");put("multiMoveAmount","10");click("multiMoveAdd");click("multiAccountReconcile");
 assert.match(read("multiAccountNote"),/sem imputação/);assert.match(els.get("multiBalanceRows").innerHTML,/10,00/);
 assert.match(els.get("multiObRows").innerHTML,/50,50/);
});
check("Multissujeito financeiro: não permite imputar a obrigação de outra parte",()=>{
 put("multiMovePerson","2");put("multiMoveOb","3");put("multiMoveRef","INVALIDO-OUTRA-PARTE");put("multiMoveAmount","2");
 click("multiMoveAdd");assert.match(read("multiAccountMessage"),/pertence a outro interveniente/);
});
check("Multissujeito financeiro: não permite eliminar obrigação com movimentos imputados",()=>{
 els.get("multiObRows").listeners.click({target:{closest:()=>({dataset:{multiObRemove:"3"}})}});
 assert.match(read("multiAccountMessage"),/Retira primeiro os movimentos/);
});
check("Multissujeito financeiro: impede apagar encargo importado no mapa",()=>{
 els.get("multiChargesRows").listeners.click({target:{closest:()=>({dataset:{multiChargeRemove:"1"}})}});
 assert.match(read("multiResult"),/obrigações individualizadas importadas/);
 click("multiClear");assert.match(read("multiMessage"),/obrigações ou pagamentos individualizados/);
});
check("Multissujeito financeiro: reconciliação e CSV com valores por sujeito",()=>{
 click("multiAccountReconcile");click("multiAccountExport");const csv=downloads.at(-1);
 assert.match(csv,/Interveniente;Obrigações/);assert.match(csv,/AUTOR-X/);
 assert.match(csv,/305,51/);assert.match(csv,/80,00/);assert.match(csv,/Sem imputação/);
 assert.match(csv,/Mapa independente/);
});
check("Multissujeito financeiro: alteração posterior invalida o CSV",()=>{
 const n=downloads.length;put("multiMoveRef","PAG-OUTRO");put("multiMoveOb","");put("multiMoveAmount","1");
 click("multiMoveAdd");click("multiAccountExport");
 assert.equal(downloads.length,n);assert.match(read("multiAccountNote"),/desactualizado/);
});
check("Multissujeito financeiro: proposta A/B avisa quando existem contas externas",()=>{
 click("proposalPreview");assert.match(read("proposalNote"),/contabilidade multissujeito autónoma/);
 assert.match(read("proposalText"),/MULTISSUJEITO NÃO INCLUÍDO/);
});
check("Multissujeito financeiro: reset limpa o livro sem tocar no resto da suite",()=>{
 click("reset");assert.equal(read("multiPeopleCount"),"0");
 assert.match(els.get("multiObRows").innerHTML,/Sem obrigações/);
 assert.match(els.get("multiMoveRows").innerHTML,/Sem movimentos/);
});

check("Multissujeito: identificar duas obrigações do mesmo sujeito",()=>{
 put("multiName","SUJ-TESTE");put("multiRole","autor");click("multiAdd");
 for(const [ref,amount] of [["OB-1","100"],["OB-2","40"]]){
  put("multiObPerson","1");put("multiObKind","taxa");put("multiObRef",ref);put("multiObAmount",amount);
  put("multiObBasis","Fundamento fictício validado no teste");els.get("multiObVerified").checked=true;click("multiObAdd");
 }
 assert.match(els.get("multiObRows").innerHTML,/OB-1/);assert.match(els.get("multiObRows").innerHTML,/OB-2/);
});
check("Multissujeito: guia emitida bloqueia referência duplicada",()=>{
 put("multiMovePerson","1");put("multiMoveOb","1");put("multiMoveKind","guide");
 put("multiMoveRef","DUC-COMUM");put("multiMoveDate","2026-11-16");put("multiMoveAmount","100");click("multiMoveAdd");
 put("multiMoveRef","DUC-COMUM");put("multiMoveAmount","100");click("multiMoveAdd");
 assert.match(read("multiAccountMessage"),/Já existe uma guia/);
});
check("Multissujeito: mesma referência não é imputada a outra obrigação",()=>{
 put("multiMoveOb","2");put("multiMoveKind","payment");put("multiMoveStatus","confirmed");
 put("multiMoveRef","DUC-COMUM");put("multiMoveAmount","40");click("multiMoveAdd");
 assert.match(read("multiAccountMessage"),/obrigações diferentes/);
});
check("Multissujeito: exportação CSV neutraliza nome iniciado por fórmula",()=>{
 put("multiName","=SOMA(1;2)");click("multiAdd");
 click("multiAccountReconcile");click("multiAccountExport");
 const csv=downloads.at(-1);
 assert.match(csv,/'=SOMA\(1;2\)/);
 assert.doesNotMatch(csv,/"=SOMA\(1;2\)"/);
});
check("Multissujeito: limpeza integral dos testes de segurança",()=>{
 click("reset");assert.equal(read("multiPeopleCount"),"0");assert.match(els.get("multiMoveRows").innerHTML,/Sem movimentos/);
});
console.log(tests+" testes do módulo A01 concluídos.");
