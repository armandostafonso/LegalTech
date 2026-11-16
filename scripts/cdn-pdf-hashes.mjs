/* Verifica versões exatas de dependências PDF publicadas no CDN.
 * Modo --print apenas apresenta os hashes para fixação manual.
 * Sem acesso a documentos judiciais ou ficheiros do utilizador. */
import { createHash } from "node:crypto";
const sources=[
 {name:"pdf.js 3.11.174",url:"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"},
 {name:"pdf-lib 1.17.1",url:"https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"}
];
for(const item of sources){
 const timeout=AbortSignal.timeout(25000);
 const res=await fetch(item.url,{signal:timeout});
 if(!res.ok)throw Error(item.name+": CDN HTTP "+res.status);
 const bytes=Buffer.from(await res.arrayBuffer());
 if(bytes.length<100000)throw Error(item.name+": biblioteca inesperadamente curta");
 const hash="sha512-"+createHash("sha512").update(bytes).digest("base64");
 console.log(item.name+" | bytes "+bytes.length+" | "+hash);
}
