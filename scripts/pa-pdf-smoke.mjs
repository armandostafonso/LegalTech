import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({acceptDownloads:true});
const errors=[];
page.on("pageerror",e=>errors.push("Page error: "+e.message));
let unexpectedUploads=[];
page.on("request",req=>{
 if(req.method()!=="GET"&&req.method()!=="HEAD")unexpectedUploads.push(req.method()+" "+req.url());
});
try{
 await page.goto(pathToFileURL(resolve("anonimizador.html")).href,{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>typeof PDFLib!=="undefined",{timeout:30000});
 const files=await page.evaluate(async()=>{
   const make=async mixed=>{
     const pdf=await PDFLib.PDFDocument.create();
     const font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
     const one=pdf.addPage([595,842]);
     one.drawText("05/01/2026 - Pedido ficticio", {x:60,y:730,size:14,font});
     one.drawText("10/01/2026 - Oficio ficticio", {x:60,y:700,size:14,font});
     const second=pdf.addPage([595,842]);
     if(mixed)second.drawRectangle({x:50,y:450,width:420,height:250,color:PDFLib.rgb(.6,.7,.8)});
     else second.drawText("15/02/2026 - Decisao ficticia", {x:60,y:730,size:14,font});
     return Array.from(await pdf.save())
   };
   return {textual:await make(false),mixed:await make(true)}
 });
 await page.goto(pathToFileURL(resolve("pa.html")).href,{waitUntil:"domcontentloaded"});
 if(await page.locator("script[src^='https://']").count())throw Error("O PDF.js foi carregado sem ação do utilizador");
 await page.locator("#pdf").setInputFiles({name:"pa-ficticio.pdf",mimeType:"application/pdf",buffer:Buffer.from(files.textual)});
 await page.locator("#readPdf").click();
 await page.waitForFunction(()=>{
   const s=document.getElementById("status").textContent;
   return s.includes("Extração local concluída")||s.includes("Não foi possível")||s.includes("Indexação bloqueada")
 },{timeout:45000});
 const status=await page.locator("#status").innerText();
 if(!status.includes("Extração local concluída"))throw Error("PDF textual não importado: "+status);
 const rows=await page.locator("#rows tr").count();
 if(rows!==3)throw Error("Esperadas três datas fictícias extraídas, obtidas "+rows);
 const content=await page.locator("#rows").innerText();
 if(!content.includes("[p. 1]")||!content.includes("[p. 2]"))throw Error("Faltam as páginas de origem");
 if(await page.locator("#csv").isDisabled())throw Error("Índice não exportável");
 console.log("PASSOU: PDF textual de duas páginas e três datas com origem por página.");
 await page.locator("#pdf").setInputFiles({name:"pa-misto-ficticio.pdf",mimeType:"application/pdf",buffer:Buffer.from(files.mixed)});
 await page.locator("#readPdf").click();
 await page.waitForFunction(()=>document.getElementById("status").textContent.includes("Indexação bloqueada"),{timeout:45000});
 if(await page.locator("#rows tr").count())throw Error("Uma extração parcial foi apresentada como índice");
 if(await page.locator("#csv").isEnabled())throw Error("Exportação de PDF incompleto não bloqueada");
 console.log("PASSOU: PDF misto com página sem texto bloqueado.");
 await page.locator("#clear").click();
 if(await page.locator("#pdf").inputValue()||await page.locator("#source").inputValue())throw Error("O PDF ou texto permaneceu selecionado após limpeza");
 if(unexpectedUploads.length)throw Error("Pedidos não autorizados: "+unexpectedUploads.join(", "));
 if(errors.length)throw Error(errors.join("; "));
 console.log("PASSOU: limpeza e ausência de uploads programáticos.");
}finally{await browser.close()}
