/* LegalTech PA PDF — leitura textual sem OCR e sem transmissão programada do PDF.
 * O carregamento da biblioteca PDF.js é iniciado explicitamente no pa.html.
 * Não representa extração probatória, certificação ou índice completo. */
(function(root){
"use strict";
const MAX_BYTES=12*1024*1024;
const MAX_PAGES=120;
const MAX_CHARS=60000;
class PaPdfError extends Error{constructor(message,code){super(message);this.name="PaPdfError";this.code=code}}
function collectLines(items){
 const text=items.filter(item=>typeof item.str==="string"&&item.str.trim()).map((item,index)=>{
   const tr=Array.isArray(item.transform)?item.transform:[0,0,0,0,index*10,0];
   return {str:item.str.trim(),x:Number(tr[4])||0,y:Number(tr[5])||0,index}
 });
 const rows=[];
 for(const token of text){
   let row=rows.find(r=>Math.abs(r.y-token.y)<=2.8);
   if(!row){row={y:token.y,items:[]};rows.push(row)}
   row.items.push(token);
 }
 rows.sort((a,b)=>b.y-a.y);
 const lines=[];
 for(const row of rows){
   row.items.sort((a,b)=>a.x-b.x||a.index-b.index);
   const line=row.items.map(t=>t.str).join(" ").replace(/\s+/g," ").trim();
   if(line)lines.push(line);
 }
 return lines;
}
async function extract(file,pdfjsLib,onProgress=()=>{}){
 if(!file||typeof file.arrayBuffer!=="function")throw new PaPdfError("Seleciona um ficheiro PDF válido.","FILE");
 if(!/\.pdf$/i.test(file.name||""))throw new PaPdfError("Este modo aceita exclusivamente PDF.","TYPE");
 if(file.size===0||file.size>MAX_BYTES)throw new PaPdfError("O PDF deve ter entre 1 byte e 12 MB.","SIZE");
 if(!pdfjsLib||typeof pdfjsLib.getDocument!=="function")throw new PaPdfError("Biblioteca PDF.js não disponível.","LIB");
 const bytes=new Uint8Array(await file.arrayBuffer());
 if(bytes.length<5||String.fromCharCode(...bytes.subarray(0,5))!=="%PDF-")throw new PaPdfError("O ficheiro não apresenta assinatura PDF válida.","SIGNATURE");
 let loading=null,doc=null;
 try{
   loading=pdfjsLib.getDocument({
     data:bytes,isEvalSupported:false,disableAutoFetch:true,disableStream:true,
     disableFontFace:true,useSystemFonts:false
   });
   doc=await loading.promise;
   if(!Number.isInteger(doc.numPages)||doc.numPages<1)throw new PaPdfError("PDF sem páginas legíveis.","PAGES");
   if(doc.numPages>MAX_PAGES)throw new PaPdfError("PDF excede 120 páginas. Divide-o em volumes menores.","LIMIT");
   const parts=[],blank=[];
   let total=0;
   for(let number=1;number<=doc.numPages;number++){
     onProgress(number-1,doc.numPages);
     const page=await doc.getPage(number);
     let rows;
     try{
       const content=await page.getTextContent({includeMarkedContent:false});
       rows=collectLines(content.items||[]);
     }finally{page.cleanup?.()}
     if(!rows.length){blank.push(number);continue}
     for(const line of rows){
       const formatted="[p. "+number+"] "+line;
       total+=formatted.length+1;
       if(total>MAX_CHARS)throw new PaPdfError("O texto extraído ultrapassa 60 000 caracteres. Divide o PDF em partes.","TEXT_LIMIT");
       parts.push(formatted)
     }
     onProgress(number,doc.numPages)
   }
   if(blank.length)throw new PaPdfError(
     "Indexação bloqueada: "+blank.length+" página(s) sem camada de texto selecionável ("+
     blank.slice(0,12).join(", ")+(blank.length>12?", …":"")+
     "). Não foi gerado índice parcial. É necessário OCR autorizado e revisão humana.",
     "SCANNED"
   );
   if(!parts.length)throw new PaPdfError("Nenhum texto selecionável encontrado no PDF.","EMPTY");
   return {text:parts.join("\n"),pages:doc.numPages,characters:total};
 }catch(e){
   if(e instanceof PaPdfError)throw e;
   const message=String(e?.message||e);
   if(/password/i.test(message))throw new PaPdfError("PDF protegido por palavra-passe. Retira a proteção apenas se estiveres autorizado.","PROTECTED");
   throw new PaPdfError("Não foi possível extrair o PDF. O documento pode estar danificado ou usar estrutura não suportada.","PARSE");
 }finally{
   try{await doc?.destroy()}catch(e){}
   try{await loading?.destroy()}catch(e){}
 }
}
root.LegalPaPdf=Object.freeze({extract,collectLines,MAX_BYTES,MAX_PAGES,MAX_CHARS});
})(window);
