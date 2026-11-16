import { chromium } from "playwright";
import fs from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const matrix=JSON.parse(fs.readFileSync("tests/regimes-parity.json","utf8"));
if(matrix.cases.length!==96)throw Error("Matriz de regimes incompleta");
const browser=await chromium.launch({headless:true});
const page=await browser.newPage();
let failures=[],passed=0;
try{
 await page.goto(pathToFileURL(resolve("regimes.html")).href,{waitUntil:"domcontentloaded"});
 for(const caseRef of matrix.cases){
  await page.locator("#regime").selectOption(caseRef.regime);
  await page.locator("#start").fill(caseRef.start);
  await page.locator("#days").fill(String(caseRef.days));
  await page.locator("#municipality").selectOption(caseRef.municipality);
  await page.locator("#closures").fill("");
  await page.locator("#calculate").click();
  const status=await page.locator("#status").innerText();
  const expected=caseRef.expected.slice(8,10)+"/"+caseRef.expected.slice(5,7)+"/"+caseRef.expected.slice(0,4);
  const actual=await page.locator("#endDate").innerText();
  if(!status.includes("Simulação concluída")||!actual.includes(expected)){
   failures.push(caseRef.id+": esperado "+expected+", obtido "+actual+" ("+status+")");
  }else passed++;
 }
}finally{await browser.close()}
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("Regimes CPA/CPPT: "+passed+" de "+matrix.cases.length+" casos sintéticos de paridade aprovados na Web.");
