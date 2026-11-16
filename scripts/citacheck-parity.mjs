/* LegalTech · paridade dos contratos partilhados com Cita-Check Desktop.
 * Confere dados e casos de teste; NÃO certifica resultados jurídicos nem motor único. */
import fs from "node:fs";
const files=["rules/calendario.json","rules/municipais.json","tests/shared-cases.json"];
const desktop="https://raw.githubusercontent.com/armandostafonso/Cita-Check-Desktop/main/";
const fail=[];
function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(k=>[k,canonical(value[k])]));
 return value;
}
for(const path of files){
 const local=canonical(JSON.parse(fs.readFileSync(path,"utf8")));
 if(!local||typeof local!=="object")throw Error("Contrato local inválido: "+path);
 if(process.argv.includes("--offline")){
  console.log("Contrato local válido: "+path);continue;
 }
 try{
  const response=await fetch(desktop+path,{
   signal:AbortSignal.timeout(18000),headers:{"Accept":"application/json","User-Agent":"LegalTech-Parity-Check/1.0"}
  });
  if(!response.ok)throw Error("HTTP "+response.status);
  const remote=canonical(await response.json());
  if(JSON.stringify(remote)!==JSON.stringify(local))fail.push("Contrato divergente: "+path);
  else console.log("Paridade confirmada: "+path);
 }catch(e){fail.push(path+": não foi possível confirmar o repositório Desktop ("+e.message+")")}
}
if(fail.length){console.error(fail.join("\n"));process.exit(1)}
console.log(process.argv.includes("--offline")?"Contratos locais válidos.":"Três contratos Web/Desktop sem diferenças detetadas.");
