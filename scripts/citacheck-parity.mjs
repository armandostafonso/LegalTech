/* LegalTech · paridade de contratos Web/Desktop.
 * Comparação remota autenticada só quando há token autorizado.
 * Sem token, valida apenas o contrato local e assinala REMOTA NÃO VERIFICADA.
 * Não certifica equivalência dos motores de cálculo ou resultados jurídicos. */
import fs from "node:fs";
import { createHash } from "node:crypto";
const files=["rules/calendario.json","rules/municipais.json","tests/shared-cases.json","tests/parity-extended.json"];
const remoteRepo="armandostafonso/Cita-Check-Desktop";
const token=process.env.DESKTOP_REPO_TOKEN?.trim();
const opts=new Set(process.argv.slice(2));
const offline=opts.has("--offline");
const failures=[];
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
const gitBlobSha=buf=>createHash("sha1").update("blob "+buf.length+"\0").update(buf).digest("hex");
const manifest=JSON.parse(fs.readFileSync("rules/parity-manifest.json","utf8"));
if(manifest.version!==2||Object.keys(manifest.hashes).length!==files.length)throw Error("Manifesto de paridade inválido");
const local={};
for(const path of files){
 const bytes=fs.readFileSync(path);
 const obj=JSON.parse(bytes.toString("utf8"));
 if(!obj||typeof obj!=="object")throw Error("Contrato local inválido: "+path);
 const hash=gitBlobSha(bytes);
 if(hash!==manifest.hashes[path])failures.push("Contrato local diverge do manifesto Web/Desktop: "+path);
 local[path]=obj;
}
if(failures.length){console.error(failures.join("\n"));process.exit(1)}
console.log("Quatro contratos locais iguais às versões fixadas no manifesto de paridade.");
async function writeSummary(content){
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,content+"\n");
}
if(offline){
 console.log("Paridade remota NÃO verificada em modo offline.");
 await writeSummary("### Cita-Check: contratos locais verificados; repositório remoto não consultado");
 process.exit(0);
}
if(!token){
 console.log("::warning::Cita-Check Desktop é privado; sem DESKTOP_REPO_TOKEN só é possível verificar contratos locais. A paridade remota NÃO foi verificada.");
 await writeSummary("### Cita-Check: comparação remota não efetuada\nO repositório Desktop é privado. Os quatro contratos locais passaram; para comparar os dois repositórios é necessário um token de leitura configurado como DESKTOP_REPO_TOKEN. Não se afirma paridade remota.");
 process.exit(0);
}
for(const path of files){
 try{
  const target="https://api.github.com/repos/"+remoteRepo+"/contents/"+path+"?ref=main";
  const result=await fetch(target,{signal:AbortSignal.timeout(18000),headers:{
   "Authorization":"Bearer "+token,
   "Accept":"application/vnd.github+json",
   "X-GitHub-Api-Version":"2022-11-28",
   "User-Agent":"LegalTech-Parity-Check/1.1"
  }});
  if(!result.ok)throw Error("HTTP "+result.status);
  const payload=await result.json();
  if(typeof payload.content!=="string"||payload.encoding!=="base64")throw Error("Representação inesperada");
  const bytes=Buffer.from(payload.content.replace(/\s/g,""),"base64");
  const parsed=JSON.parse(bytes.toString("utf8"));
  const remoteHash=gitBlobSha(bytes);
  if(remoteHash!==manifest.hashes[path])failures.push("Contrato privado diferente: "+path);
  else console.log("Paridade confirmada via GitHub autenticado: "+path);
 }catch(e){failures.push(path+": impossível confirmar o repositório Desktop ("+e.message+")")}
}
if(failures.length){
 console.error(failures.join("\n"));
 await writeSummary("### Cita-Check: comparação remota falhou\n"+failures.map(x=>"- "+x).join("\n"));
 process.exit(1);
}
console.log("Quatro contratos Web/Desktop iguais, comparação remota autenticada concluída.");
await writeSummary("### Cita-Check: quatro contratos remotos confirmados\nEsta verificação não prova igualdade dos algoritmos de contagem.");
