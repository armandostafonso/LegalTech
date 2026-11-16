import { chromium } from "playwright";
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

/**
 * Ensaio de integração com PDF totalmente fictício.
 * Precisa de acesso aos CDN de pdf.js e pdf-lib; não envia qualquer PDF real.
 */
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({acceptDownloads:true});
const messages=[];
page.on("dialog",async dialog=>{
  messages.push(dialog.message());
  // O modelo de IA é intencionalmente bloqueado: testar apenas a deteção
  // do termo inserido manualmente, sem descarregar modelos.
  await dialog.accept();
});
await page.route("**/*",async route=>{
  const u=route.request().url();
  if(u.includes("@xenova/transformers")||u.includes("huggingface.co")||u.includes("hf.co/")){
    await route.abort();return;
  }
  await route.continue();
});
try {
  await page.goto(pathToFileURL(resolve("anonimizador.html")).href,{waitUntil:"domcontentloaded",timeout:30000});
  await page.waitForFunction(()=>typeof PDFLib!=="undefined"&&typeof pdfjsLib!=="undefined",{timeout:15000});
  if(!await page.locator("#raster").isChecked())throw Error("Rasterização deve estar ligada por predefinição");
  const bytes=await page.evaluate(async()=>{
    const pdf=await PDFLib.PDFDocument.create();
    const p=pdf.addPage([595,842]);
    const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    p.drawText("FULANO DEMONSTRATIVO",{x:90,y:700,size:16,font});
    p.drawText("DOCUMENTO DE TESTE SEM DADOS REAIS",{x:90,y:660,size:12,font});
    return Array.from(await pdf.save());
  });
  await page.locator("#file").setInputFiles({name:"ficheiro-ficticio.pdf",mimeType:"application/pdf",buffer:Buffer.from(bytes)});
  await page.locator("#hideTerms").evaluate(el => el.closest("details").open = true);
  await page.locator("#hideTerms").fill("PESSOA: FULANO DEMONSTRATIVO");
  const downloadPromise=page.waitForEvent("download",{timeout:90000});
  await page.locator("#go").click();
  const download=await downloadPromise;
  const path=await download.path();
  if(!path)throw Error("Não se obteve um PDF para verificar");
  const out=[...fs.readFileSync(path)];
  const result=await page.evaluate(async bytes=>{
    const doc=await pdfjsLib.getDocument({data:new Uint8Array(bytes),isEvalSupported:false}).promise;
    let text="";
    for(let i=1;i<=doc.numPages;i++){
      const pg=await doc.getPage(i);
      const c=await pg.getTextContent();
      text+=c.items.map(it=>it.str||"").join(" ");
    }
    const n=doc.numPages;
    await doc.destroy();
    return {pages:n,text};
  },out);
  if(result.pages!==1)throw Error("Foi alterado o número de páginas");
  if(result.text.trim())throw Error("O PDF anonimizado contém texto extraível");
  const summary=await page.locator("#summary").innerText();
  if(!summary.includes("ocorrências expurgadas"))throw Error("A interface não confirmou ocorrências");
  console.log("PASSOU: PDF inteiramente fictício; rasterização, saída descarregada, 1 página, sem texto extraível.");
}finally{
  await browser.close();
}
