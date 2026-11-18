/* LegalTech Portal · pesquisa e favoritos locais. Sem pedidos de rede. */
(function(){
"use strict";
const catalog=window.LegalTechPortalCatalog;
if(!catalog||!Array.isArray(catalog.items))return;
const key="legaltech_portal_favorites_v1";
const ids=new Set(catalog.items.map(item=>item.id));
const input=document.getElementById("portal-search"),grid=document.getElementById("portal-grid");
const filters=document.getElementById("portal-filters"),only=document.getElementById("portal-only");
const count=document.getElementById("portal-count"),empty=document.getElementById("portal-empty");
const normal=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-PT");
let selected="all",favoritesOnly=false,favorites=new Set();
try{const saved=JSON.parse(localStorage.getItem(key)||"[]");if(Array.isArray(saved))favorites=new Set(saved.filter(x=>typeof x==="string"&&ids.has(x)));}catch(_){}
const el=(tag,css,text)=>{const node=document.createElement(tag);if(css)node.className=css;if(text!==undefined)node.textContent=text;return node};
const validUrl=url=>/^(https:\/\/|[a-z0-9-]+\.html$)/i.test(url);
function store(){try{localStorage.setItem(key,JSON.stringify([...favorites]));}catch(_){}}
function createCard(item){
 const card=el("article","portal-card");
 const meta=el("div","portal-card-meta");
 const source=el("span","portal-source",catalog.categories[item.category]+" · "+item.source);
 const star=el("button","portal-star",favorites.has(item.id)?"★":"☆");
 star.type="button";star.setAttribute("aria-pressed",String(favorites.has(item.id)));
 star.setAttribute("aria-label",(favorites.has(item.id)?"Remover dos favoritos: ":"Adicionar aos favoritos: ")+item.title);
 star.addEventListener("click",()=>{if(favorites.has(item.id))favorites.delete(item.id);else favorites.add(item.id);store();render();});
 meta.append(source,star);
 const a=el("a","portal-card-link");a.href=item.url;
 const external=item.url.startsWith("https://");
 if(external){a.target="_blank";a.rel="noopener noreferrer";}
 const title=el("h3","",item.title);
 a.append(title);
 const p=el("p","",item.description);
 const foot=el("span","portal-card-foot",external?"Abrir recurso externo ↗":"Abrir ferramenta →");
 card.append(meta,a,p,foot);
 return card;
}
function render(){
 const term=normal(input.value.trim());
 const list=catalog.items.filter(item=>validUrl(item.url)&&(selected==="all"||item.category===selected)&&(!favoritesOnly||favorites.has(item.id))&&normal([item.title,item.description,item.source,item.keywords,catalog.categories[item.category]].join(" ")).includes(term));
 grid.replaceChildren();
 for(const item of list)grid.append(createCard(item));
 count.textContent=list.length+" "+(list.length===1?"recurso":"recursos");
 empty.hidden=list.length!==0;
 for(const b of filters.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.category===selected));
 only.setAttribute("aria-pressed",String(favoritesOnly));
 only.textContent=favoritesOnly?"★ A mostrar favoritos":"☆ Só favoritos";
}
function chip(category,label){
 const b=el("button","",label);b.type="button";b.dataset.category=category;
 b.addEventListener("click",()=>{selected=category;render();});
 filters.append(b);
}
chip("all","Todos");
for(const [category,label] of Object.entries(catalog.categories))chip(category,label);
input.addEventListener("input",render);
only.addEventListener("click",()=>{favoritesOnly=!favoritesOnly;render();});
document.getElementById("portal-clear").addEventListener("click",()=>{input.value="";selected="all";favoritesOnly=false;render();input.focus();});
render();
})();
