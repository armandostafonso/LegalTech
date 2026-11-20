/* LegalTech Workspace: catálogo local, sem persistência ou pedidos de rede. */
(function(){
"use strict";
const items=[
["citacheck.html","Cita-Check","Apoio à conferência de prazos.","Prazos","citação contagem"],
["tramitação-taf.html","Tramitação TAF","Roteiros por espécie e fase processual.","Tramitação","administrativo tributário"],
["minutas.html","LegalTech Docs","Preparar minutas e textos auxiliares.","Documentos","ofício notificação"],
["expediente.html","LegalTech Check","Conferir expediente de secretaria.","Expediente","atos"],
["notify.html","LegalTech Notify","Apoio à preparação de notificações.","Expediente","notificação"],
["anonimizador.html","Anonimização PDF","Preparar a anonimização de documentos.","Privacidade","pdf"],
["privacy-check.html","Privacy Check","Conferir exposição de dados.","Privacidade","proteção"],
["termos.html","Termos","Preparar termos auxiliares.","Documentos","certidão"],
["fontes.html","Fontes normativas","Referências de apoio e conferência.","Consulta","lei artigos"],
];
const input=document.getElementById("workspace-search");
const filters=document.getElementById("workspace-filters");
const results=document.getElementById("workspace-results");
const count=document.getElementById("workspace-count");
const empty=document.getElementById("workspace-empty");
const categories=["Todas",...new Set(items.map(x=>x[3]))];
let category="Todas";
const normalize=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-PT");
function render(){
 const q=normalize(input.value.trim());
 results.replaceChildren();
 const filtered=items.filter(x=>(category==="Todas"||x[3]===category)&&normalize(x.slice(1).join(" ")).includes(q));
 for(const [url,name,description,group] of filtered){
  const a=document.createElement("a");a.className="workspace-tool";a.href=url;
  const tag=document.createElement("small");tag.textContent=group;
  const title=document.createElement("strong");title.textContent=name;
  const p=document.createElement("p");p.textContent=description;
  a.append(tag,title,p);results.append(a);
 }
 count.textContent=filtered.length+" ferramentas";
 empty.hidden=filtered.length!==0;
 for(const b of filters.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.category===category));
}
for(const label of categories){
 const b=document.createElement("button");b.type="button";b.dataset.category=label;b.textContent=label;
 b.addEventListener("click",()=>{category=label;render()});filters.append(b);
}
input.addEventListener("input",render);
render();
})();