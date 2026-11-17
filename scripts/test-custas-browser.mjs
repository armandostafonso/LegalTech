import fs from "node:fs";
import assert from "node:assert/strict";
import {spawn,spawnSync} from "node:child_process";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import path from "node:path";
import net from "node:net";

const candidates=[process.env.CHROME_BIN,"/usr/bin/chromium","/usr/bin/google-chrome","/usr/bin/google-chrome-stable","chromium","google-chrome"].filter(Boolean);
const chromeExecutable=candidates.find(name=>name.includes("/")?fs.existsSync(name):spawnSync("which",[name],{encoding:"utf8"}).status===0);
if(!chromeExecutable)throw Error("Chromium/Chrome não encontrado.");
const freePort=()=>new Promise((resolve,reject)=>{const server=net.createServer();server.once("error",reject);server.listen(0,"127.0.0.1",()=>{const port=server.address().port;server.close(()=>resolve(port))})});
const port=await freePort(),profile=mkdtempSync(path.join(tmpdir(),"legaltech-a01-browser-"));
const chrome=spawn(chromeExecutable,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-extensions","--disable-background-networking","--no-first-run","--remote-debugging-port="+port,"--user-data-dir="+profile,"about:blank"],{stdio:"ignore"});
let ws;
try{
 let targets;
 for(let i=0;i<100;i++){
  if(chrome.exitCode!==null)throw Error("Chromium terminou inesperadamente.");
  try{const r=await fetch("http://127.0.0.1:"+port+"/json/list");if(r.ok){targets=await r.json();if(targets.some(x=>x.type==="page"))break}}catch{}
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 const target=targets?.find(x=>x.type==="page");
 if(!target)throw Error("Navegador não disponibilizou um alvo de teste.");
 ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true})});
 let next=0;const pending=new Map(),exceptions=[];
 ws.addEventListener("message",event=>{const message=JSON.parse(event.data);
  if(message.method==="Runtime.exceptionThrown")exceptions.push(message.params?.exceptionDetails?.text||"Excepção JavaScript");
  if(message.id&&pending.has(message.id)){pending.get(message.id)(message);pending.delete(message.id)}
 });
 const send=(method,params={})=>new Promise(resolve=>{const id=++next;pending.set(id,resolve);ws.send(JSON.stringify({id,method,params}))});
 const evaluate=async expression=>{const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(result.error||result.result?.exceptionDetails)throw Error("Falha JavaScript no navegador: "+JSON.stringify(result).slice(0,1000));
  return result.result?.result?.value;
 };
 await send("Runtime.enable");
 const source=fs.readFileSync("custas-tecnico.html","utf8");
 const html=source.replace(/<script\b[^>]*\bsrc=(["'])[^"']+\1[^>]*>\s*<\/script>/gi,"").replace(/<link\b[^>]*\bhref=(["'])https?:\/\/[^"']+\1[^>]*>/gi,"");
 await evaluate("document.open();document.write("+JSON.stringify(html)+");document.close();");
 const run=expression=>evaluate("(()=>{"+expression+"})()");
 for(let i=0;i<50;i++){if(await evaluate("!!document.getElementById('multiAdd')"))break;await new Promise(r=>setTimeout(r,40))}
 assert.equal(await evaluate("!!document.getElementById('multiAdd')"),true);
 assert.equal(await evaluate("document.documentElement.dataset.custasView"),"simples");
 await evaluate("document.getElementById('custasStep2').click()");
 assert.equal(await evaluate("document.documentElement.dataset.custasStep"),"2");
 await evaluate("document.getElementById('custasAdvanced').click()");
 assert.equal(await evaluate("document.documentElement.dataset.custasView"),"avancado");
 for(const [name,role] of [["BROWSER-A","autor"],["BROWSER-B","reu"]]){
  await run("document.getElementById('multiName').value="+JSON.stringify(name)+";document.getElementById('multiRole').value="+JSON.stringify(role)+";document.getElementById('multiAdd').click();");
 }
 assert.equal(await evaluate("document.getElementById('multiPeopleCount').textContent"),"2");
 for(const [id,share] of [[1,"40"],[2,"60"]]){
  await run("const x=document.querySelector('[data-multi-share="+JSON.stringify(String(id))+"]');x.value="+JSON.stringify(share)+";x.dispatchEvent(new Event('change',{bubbles:true}));");
 }
 await run([
  'const set=(id,v)=>document.getElementById(id).value=v;',
  'set("multiRef","ENC-BROWSER-01");set("multiScope","acao");set("multiAmount","99.99");',
  'set("multiMode","expressa");set("multiDecision","DECISAO-BROWSER");set("multiDate","2026-11-16");',
  'set("multiSolidarity","no");set("multiSettlement","no");',
  'document.getElementById("multiVerified").checked=true;document.getElementById("multiPreview").click();'
 ].join(""));
 const preview=await evaluate("document.getElementById('multiResult').textContent");
 assert.match(preview,/40,00/);assert.match(preview,/59,99/);
 await evaluate("document.getElementById('multiPost').click()");
 assert.equal(await evaluate("document.getElementById('multiChargeCount').textContent"),"1");
 await run('document.getElementById("multiImportCharge").value="1";document.getElementById("multiImportVerified").checked=true;document.getElementById("multiImport").click();');
 assert.match(await evaluate("document.getElementById('multiObRows').textContent"),/40,00/);
 assert.match(await evaluate("document.getElementById('multiObRows').textContent"),/59,99/);
 await run([
  'const set=(id,v)=>document.getElementById(id).value=v;',
  'set("multiMovePerson","1");document.getElementById("multiMovePerson").dispatchEvent(new Event("change",{bubbles:true}));',
  'set("multiMoveOb","1");set("multiMoveKind","payment");set("multiMoveStatus","confirmed");',
  'set("multiMoveRef","DUC-BROWSER-001");set("multiMoveDate","2026-11-16");set("multiMoveAmount","20.00");',
  'document.getElementById("multiMoveAdd").click();document.getElementById("multiAccountReconcile").click();'
 ].join(""));
 const balances=await evaluate("document.getElementById('multiBalanceRows').textContent");
 assert.match(balances,/40,00/);assert.match(balances,/20,00/);assert.match(balances,/59,99/);
 assert.match(await evaluate("document.getElementById('obA').textContent"),/0,00/);
 await evaluate("document.getElementById('proposalPreview').click()");
 assert.match(await evaluate("document.getElementById('proposalNote').textContent"),/contabilidade multissujeito autónoma/);
 assert.equal(exceptions.length,0,exceptions.join("; "));
 const simpleSource=fs.readFileSync("custas.html","utf8");
 const simpleHTML=simpleSource.replaceAll('<script src="assets/theme.js"></script>',"").replaceAll('<script src="assets/suite-nav.js"></script>',"");
 await evaluate("document.open();document.write("+JSON.stringify(simpleHTML)+");document.close();");
 assert.equal(await evaluate("!!document.getElementById('ccCalculate')"),true,"Conta simples não abriu");
 await run([
  'const set=(id,value)=>document.getElementById(id).value=value;',
  'set("ccProcess","BROWSER-TESTE");set("ccValue","30000");set("ccUC","102");',
  'set("ccYear","2025");document.getElementById("ccYear").dispatchEvent(new Event("input",{bubbles:true}));set("ccAuthorFirst","255");',
  'set("ccSecond","waived");set("ccDecision","autor");',
  'document.getElementById("ccVerified").checked=true;',
  'document.getElementById("ccCalculate").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('ccBaseTotal').textContent"),/510,00/);
 assert.match(await evaluate("document.getElementById('ccRows').textContent"),/sem contestação/);
 await run([
  'document.getElementById("ccContested").checked=true;',
  'document.getElementById("ccContested").dispatchEvent(new Event("change",{bubbles:true}));',
  'document.getElementById("ccDefFirst").value="255";',
  'document.getElementById("ccDefPrepay").value="normal";',
  'document.getElementById("ccCalculate").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('ccRows').textContent"),/Contestação/);
 assert.match(await evaluate("document.getElementById('ccRows').textContent"),/255,00/);

 // Testar o novo assistente de seis passos em navegador real com o núcleo carregado localmente.
 const wizardSource=fs.readFileSync("custas-6-passos.html","utf8");
 const wizardCore=fs.readFileSync("assets/custas-6-core.js","utf8");
 const wizardHTML=wizardSource
  .replace('<script src="assets/custas-6-core.js"></script>','<script>'+wizardCore+'</script>')
  .replaceAll('<script src="assets/theme.js"></script>',"")
  .replaceAll('<script src="assets/suite-nav.js"></script>',"");
 await evaluate("document.open();document.write("+JSON.stringify(wizardHTML)+");document.close();");
 assert.equal(await evaluate("document.querySelectorAll('[data-step-panel]').length"),6);
 assert.equal(await evaluate("document.getElementById('progress').getAttribute('aria-valuenow')"),"1");
 await run([
  'const year=document.getElementById("filingYear");year.value="2025";year.dispatchEvent(new Event("input",{bubbles:true}));',
  'document.getElementById("caseValue").value="30000";',
  'document.getElementById("next").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('stepLabel').textContent"),/Passo 2/);
 assert.equal(await evaluate("document.getElementById('ucValue').value"),"102");
 await evaluate("document.getElementById('next').click()");
 assert.match(await evaluate("document.getElementById('stepLabel').textContent"),/Passo 3/);
 await run([
  'const set=(id,v)=>document.getElementById(id).value=v;',
  'set("chargePerson","1");set("chargeYear","2025");set("chargeValue","30000");',
  'set("chargeTable","IA");document.getElementById("suggestIA").click();',
  'set("chargeRef","PI-TESTE");set("chargeBasis","Tabela I-A");',
  'document.getElementById("chargeVerified").checked=true;',
  'document.getElementById("chargeAdd").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('chargeList').textContent"),/510,00/);
 await evaluate("document.getElementById('next').click()");
 assert.match(await evaluate("document.getElementById('stepLabel').textContent"),/Passo 4/);
 await run([
  'const set=(id,v)=>document.getElementById(id).value=v;',
  'set("movePerson","1");set("moveKind","payment");set("moveStatus","confirmed");',
  'set("moveRef","DUC-WIZARD-TESTE");set("moveDate","2025-04-03");set("moveAmount","255");',
  'document.getElementById("moveAdd").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('moveList').textContent"),/255,00/);
 await evaluate("document.getElementById('next').click()");
 await evaluate("document.getElementById('next').click()");
 assert.match(await evaluate("document.getElementById('stepLabel').textContent"),/Passo 6/);
 await run('document.getElementById("ruling").value="Decisão de teste";document.getElementById("reviewed").checked=true;document.getElementById("finish").click()');
 assert.equal(await evaluate("document.getElementById('finalResult').hidden"),false);
 assert.match(await evaluate("document.getElementById('sumDiff').textContent"),/255,00/);
 assert.equal(await evaluate("document.getElementById('printReport').disabled"),false);
 await evaluate("document.querySelector('[data-step-tab=\"1\"]').click()");
 await run('document.querySelector("#partyList .record .danger").click()');
 assert.match(await evaluate("document.getElementById('message').textContent"),/tem taxas, encargos, movimentos/);
 assert.match(await evaluate("document.getElementById('partyList').textContent"),/Autor/);
 await run([
  'document.querySelector("#partyList .record .secondary").click();',
  'document.getElementById("partyExemption").value="yes";',
  'document.getElementById("partyAdd").click();'
 ].join(""));
 assert.match(await evaluate("document.getElementById('partyList').textContent"),/Isenção: assinalada/);
 assert.equal(exceptions.length,0,exceptions.join("; "));
 console.log("Browser A01 OK: motor técnico, conta simples e assistente de seis passos.");

}finally{
 if(ws?.readyState===WebSocket.OPEN)ws.close();
 chrome.kill("SIGKILL");
 await new Promise(resolve=>{if(chrome.exitCode!==null)return resolve();chrome.once("exit",resolve);setTimeout(resolve,1000).unref()});
 try{rmSync(profile,{recursive:true,force:true,maxRetries:2,retryDelay:100})}catch{}
}
