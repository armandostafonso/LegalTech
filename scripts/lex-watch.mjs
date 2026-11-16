/* LegalTech Lex Watch — indicador de alteração de metadados, NÃO verificador jurídico da vigência. */
import fs from "node:fs";
import path from "node:path";

const base=JSON.parse(fs.readFileSync("rules/lex-baseline.json","utf8"));
function decode(s){
 return s.replace(/&(?:nbsp|amp|uacute|eacute|aacute|ccedil|atilde|ordm);/gi,m=>({
 "&nbsp;":" ","&amp;":"&","&uacute;":"ú","&eacute;":"é","&aacute;":"á","&ccedil;":"ç","&atilde;":"ã","&ordm;":"º"
 }[m.toLowerCase()]||" ")).replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
}
export function findChangeDate(html){
 const body=String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi," ")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ");
 const text=decode(body).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ");
 const match=text.match(/Data da ultima alteracao\s*:?\s*(\d{4}-\d{2}-\d{2})/i);
 const date=match?.[1]||null;
 return date&&/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null;
}
if(base.sources.length!==7||new Set(base.sources.map(x=>x.id)).size!==7)throw Error("Catálogo de fontes inválido");
for(const item of base.sources){
 if(!/^https:\/\/diariodarepublica\.pt\//.test(item.url)||!/^\d{4}-\d{2}-\d{2}$/.test(item.last_amendment))throw Error("Fonte ou data de base inválida: "+item.id)
}
if(process.argv.includes("--self-test")){
 const mock='<main><p>Data da última alteração:</p><span>2026-11-17</span></main>';
 if(findChangeDate(mock)!=="2026-11-17"||findChangeDate("<p>Sem metadados</p>")!==null)throw Error("Parser de metadados incorreto");
 console.log("Lex Watch: parser e sete fontes de base verificados sem acesso à Internet.");
 process.exit(0);
}
const today=new Date().toISOString().slice(0,10);
const results=await Promise.all(base.sources.map(async item=>{
 try{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),18000);
  let response;
  try{response=await fetch(item.url,{signal:ctrl.signal,headers:{"User-Agent":"LegalTech-LexWatch/1.0 (public legislative metadata check)","Accept":"text/html"}})}
  finally{clearTimeout(timer)}
  if(!response.ok)throw Error("HTTP "+response.status);
  const html=await response.text();
  if(html.length<400)throw Error("Resposta demasiado curta para confirmação");
  const date=findChangeDate(html);
  if(!date)return {...item,observed:null,state:"METADADOS NÃO LOCALIZADOS"};
  if(date>today)return {...item,observed:date,state:"DATA FUTURA INESPERADA — CONFERIR"};
  return {...item,observed:date,state:date>item.last_amendment?"REVISÃO NECESSÁRIA":date<item.last_amendment?"DIVERGÊNCIA DE METADADOS — CONFERIR":"SEM DATA POSTERIOR DETETADA"};
 }catch(e){return {...item,observed:null,state:"FONTE INDISPONÍVEL",error:String(e.message).slice(0,180)}}
}));
const lines=["# LegalTech Lex Watch — sinalização automática de metadados", "", "Execução UTC: "+new Date().toISOString(), "","> **Isto não comprova redações em vigor.** Apenas compara a data de última alteração que o Diário da República disponibiliza. Alterações já publicadas mas com entrada em vigor futura, normas transitórias, retificações ou alterações pontuais podem não ser detetadas. As fontes indisponíveis exigem verificação manual.","","| Diploma | Linha de base | Data observada | Estado |","|---|---|---|---|"];
for(const x of results)lines.push("| ["+x.id+"]("+x.url+") | "+x.last_amendment+" | "+(x.observed||"não confirmada")+" | "+x.state+" |");
lines.push("","**Não atualizar nenhuma regra de cálculo automaticamente a partir deste relatório.**");
fs.mkdirSync("reports",{recursive:true});
fs.writeFileSync("reports/lex-watch.md",lines.join("\n")+"\n");

const changed=results.filter(x=>x.state==="REVISÃO NECESSÁRIA");
if(changed.length&&process.env.GITHUB_TOKEN&&process.env.GITHUB_REPOSITORY){
 const [owner,repo]=process.env.GITHUB_REPOSITORY.split("/");
 const api="https://api.github.com/repos/"+owner+"/"+repo+"/issues";
 const headers={Authorization:"Bearer "+process.env.GITHUB_TOKEN,Accept:"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28","Content-Type":"application/json"};
 try{
 const r=await fetch(api+"?state=all&per_page=100",{headers});
 if(!r.ok)throw Error("Não foi possível listar issues: HTTP "+r.status);
 const all=await r.json();
 for(const item of changed){
  const title="[Lex Watch] Rever "+item.id+" — metadados posteriores a "+item.last_amendment;
  if(all.some(x=>x.title===title)){console.log(item.id+": aviso já existente");continue}
  const body="O Diário da República apresenta data de última alteração **"+item.observed+"**, posterior à linha de base **"+item.last_amendment+"**.\n\nFonte: "+item.url+"\n\n**Revisão humana obrigatória:** verificar o conteúdo alterado, a entrada em vigor, direito transitório e impacto nos roteiros/cálculos. Este alerta não altera automaticamente a LegalTech.";
  const response=await fetch(api,{method:"POST",headers,body:JSON.stringify({title,body})});
  if(!response.ok)console.error("Não foi possível criar alerta de "+item.id+": "+response.status);
  else console.log("Aberto pedido de revisão de "+item.id);
 }
 }catch(e){console.error("Alertas de issues indisponíveis:",e.message)}
}
console.log("Lex Watch: "+results.map(x=>x.id+"="+x.state).join("; "));
