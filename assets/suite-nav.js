/* LegalTech Suite | Navegação comum e estados dos módulos.
   Não interfere com cálculos, formulários nem tratamento documental. */
(function(){
"use strict";
const entries=[
 ["index.html","Início"],
 ["flow.html","Flow"],
 ["workspace.html","Painel"],
 ["portal.html","Portal"],
 ["sobre.html","Sobre"],
 ["citacheck.html","CitaCheck"],
 ["anonimizador.html","PDF"],
 ["minutas.html","Docs"],
 ["tramitação-taf.html","Workflow"],
 ["roteiros.html","Roteiros"],
 ["regimes.html","Prazos"],
 ["agenda.html","Agenda"]
];
function init(){
 const current=decodeURIComponent(location.pathname.split("/").pop()||"index.html");
 let nav=document.querySelector("body > header .top nav.nav, body > nav.top-nav .nav-links, body > header nav > div");
 if(!nav && current==="custas.html"){
   const h=document.querySelector("body > main > header");
   if(h){nav=document.createElement("nav");nav.className="lt-nav";nav.setAttribute("aria-label","Ferramentas LegalTech Suite");h.insertBefore(nav,h.lastElementChild);}
 }
 if(!nav)return;
 nav.classList.add("lt-nav");
 nav.setAttribute("aria-label","Navegação da LegalTech Suite");
 const frag=document.createDocumentFragment();
 for(const [url,label] of entries){
   const a=document.createElement("a");
   a.href=url;a.textContent=label;
   if(current===url){a.setAttribute("aria-current","page");a.classList.add("lt-current");}
   frag.appendChild(a);
 }
 nav.replaceChildren(frag);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
