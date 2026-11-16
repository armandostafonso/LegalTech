/* LegalTech: tema partilhado em todas as ferramentas.
   Sem dependências, sem transmissão de dados. */
(function(){
 "use strict";
 const KEY="legaltech_theme", LEGACY="theme";
 const root=document.documentElement;
 function valid(v){return v==="light"||v==="dark";}
 function stored(){
  try{
   const a=localStorage.getItem(KEY),b=localStorage.getItem(LEGACY);
   return valid(a)?a:valid(b)?b:null;
  }catch(_){return null;}
 }
 function system(){try{return matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}catch(_){return "light";}}
 function sync(theme){
  if(!valid(theme))return;
  try{localStorage.setItem(KEY,theme);localStorage.setItem(LEGACY,theme);}catch(_){}
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute("content",theme==="dark"?"#091629":"#f4f6f9");
  document.querySelectorAll(".lt-theme-control").forEach(btn=>{
    btn.setAttribute("aria-label",theme==="dark"?"Ativar modo claro":"Ativar modo escuro");
    btn.setAttribute("title",theme==="dark"?"Mudar para modo claro":"Mudar para modo escuro");
    const icon=btn.querySelector(".lt-theme-symbol");
    if(icon)icon.textContent=theme==="dark"?"☀":"☾";
  });
 }
 function apply(theme){root.dataset.theme=theme;sync(theme);}
 function init(){
  apply(stored()||root.dataset.theme||system());
  const existing=document.querySelector("#themeToggle, #theme");
  if(existing){
   existing.classList.add("lt-theme-control");
   /* Os controlos antigos mantêm o listener original.
      O observador sincroniza o estado e as duas preferências. */
  }else{
   const header=document.querySelector(".top-nav, body > header nav, body > header .top");
   if(header){
    const button=document.createElement("button");
    button.type="button";
    button.className="lt-theme-control lt-theme-added";
    button.innerHTML='<span class="lt-theme-symbol" aria-hidden="true">☾</span><span class="lt-theme-label">Tema</span>';
    button.addEventListener("click",()=>apply(root.dataset.theme==="dark"?"light":"dark"));
    header.appendChild(button);
   }
  }
  sync(root.dataset.theme);
  const observer=new MutationObserver(records=>{
   if(records.some(r=>r.attributeName==="data-theme"))sync(root.dataset.theme);
  });
  observer.observe(root,{attributes:true,attributeFilter:["data-theme"]});
  window.addEventListener("storage",e=>{
   if((e.key===KEY||e.key===LEGACY)&&valid(e.newValue)&&e.newValue!==root.dataset.theme)apply(e.newValue);
  });
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});
 else init();
})();
