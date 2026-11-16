import { chromium } from "playwright";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
let checks=0;
const failures=[];
async function test(name, task){
 try {await task();console.log("✓",name);checks++;}
 catch(e){console.error("✗",name,String(e));failures.push(name+": "+String(e));}
}
await page.goto(pathToFileURL(resolve("citacheck.html")).href,{waitUntil:"domcontentloaded"});
async function setBase({start,quantity,unit="dias",urgent=false,type="cit_singular",option="si_proprio"}){
 await page.locator("#tipoAto").selectOption(type);
 if(type==="cit_singular")await page.locator("#subOpcao").selectOption(option);
 await page.locator("#dataBase").fill(start);
 await page.locator("#prazoDias").fill(String(quantity));
 await page.locator("#prazoUnidade").selectOption(unit);
 await page.locator("#dilacaoExtra").selectOption("0");
 await page.locator("#processoUrgente").selectOption(urgent?"sim":"nao");
 await page.locator("#feriadoMunicipal").selectOption("porto");
}
async function expectTerm(expected){
 const value=await page.locator("#resTermoPrazo").innerText();
 if(!value.includes(expected))throw new Error("Esperado "+expected+"; obtido "+value);
}
await test("10 dias urgentes, sem férias",async()=>{
 await setBase({start:"2026-11-16",quantity:10,urgent:true});
 await expectTerm("26/11/2026");
});
await test("Dois dias normais atravessando férias de verão",async()=>{
 await setBase({start:"2026-07-15",quantity:2});
 await expectTerm("02/09/2026");
});
await test("Dois dias urgentes não suspendem nas férias",async()=>{
 await setBase({start:"2026-07-15",quantity:2,urgent:true});
 await expectTerm("17/07/2026");
});
await test("Prazo mensal usa mês de calendário e transfere domingo",async()=>{
 await setBase({start:"2027-01-31",quantity:1,unit:"meses"});
 await expectTerm("01/03/2027");
});
await test("Prazo igual a 6 meses não suspende em férias judiciais",async()=>{
 await setBase({start:"2026-05-15",quantity:6,unit:"meses"});
 await expectTerm("16/11/2026");
});
await test("Seis meses comuns terminados durante as férias passam para setembro",async()=>{
 await setBase({start:"2026-02-01",quantity:6,unit:"meses"});
 await expectTerm("01/09/2026");
});
await test("Seis meses urgentes podem terminar durante as férias judiciais",async()=>{
 await setBase({start:"2026-02-01",quantity:6,unit:"meses",urgent:true});
 await expectTerm("03/08/2026");
});
await test("Prazo anual conta por calendário",async()=>{
 await setBase({start:"2026-11-16",quantity:1,unit:"anos"});
 await expectTerm("16/11/2027");
});
await test("Citação eletrónica singular não consultada não inicia prazo",async()=>{
 await setBase({start:"2026-11-16",quantity:30,type:"cit_singular_eletronica"});
 await page.locator("#dataConsulta").fill("");
 const value=await page.locator("#resDataPerfeicao").innerText();
 if(!value.includes("Não confirmada"))throw new Error("Citação presumida indevidamente: "+value);
});
await test("Citação eletrónica singular consultada tem data efetiva",async()=>{
 await setBase({start:"2026-11-16",quantity:30,type:"cit_singular_eletronica"});
 await page.locator("#dataConsulta").fill("2026-11-18");
 const value=await page.locator("#resDataPerfeicao").innerText();
 if(!value.includes("18/11/2026"))throw new Error("Perfeição diferente da consulta: "+value);
});
await test("Consulta eletrónica singular após 30 dias pede confirmação",async()=>{
 await setBase({start:"2026-11-16",quantity:30,type:"cit_singular_eletronica"});
 await page.locator("#dataConsulta").fill("2026-12-20");
 const value=await page.locator("#resDataPerfeicao").innerText();
 if(!value.includes("Não confirmada"))throw new Error("Consulta tardia tratada como citação sem confirmação: "+value);
});
await test("Data da consulta eletrónica singular não pode anteceder disponibilização",async()=>{
 await setBase({start:"2026-11-16",quantity:30,type:"cit_singular_eletronica"});
 await page.locator("#dataConsulta").fill("2026-11-15");
 const warning=await page.locator("#alertaJuridico").innerText();
 if(!warning.includes("não pode anteceder"))throw new Error("Validação de datas não aplicada: "+warning);
});
await test("Prazo zero é rejeitado",async()=>{
 await setBase({start:"2026-11-16",quantity:0,urgent:true});
 const warning=await page.locator("#alertaJuridico").innerText();
 if(!warning.includes("prazo válido"))throw new Error("Prazo inválido aceite: "+warning);
});
await browser.close();
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log(checks+" cenários de regressão aprovados; não substituem validação jurídico-processual.");
