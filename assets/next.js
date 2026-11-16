/* LegalTech · utilitários locais: não fazem pedidos de rede nem guardam documentos. */
(function(root){
"use strict";
const byId=id=>document.getElementById(id);
const node=(tag,txt)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=String(txt);return n};
function status(message){const e=byId("status");if(e)e.textContent=message}
function save(content,name,type="text/plain;charset=utf-8"){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=node("a");
 a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
function csv(rows){const safe=v=>{let s=String(v??"");if(/^[=+@\-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'};return "\ufeff"+rows.map(r=>r.map(safe).join(";")).join("\r\n")}
async function copy(s){try{await navigator.clipboard.writeText(String(s));status("Copiado para a área de transferência.");return true}catch(e){status("Cópia indisponível. Seleciona o texto e copia manualmente.");return false}}
function validISO(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const [y,m,d]=s.split("-").map(Number),v=new Date(y,m-1,d);return v.getFullYear()===y&&v.getMonth()===m-1&&v.getDate()===d}
function nextDate(s){const [y,m,d]=s.split("-").map(Number);return new Date(Date.UTC(y,m-1,d+1)).toISOString().slice(0,10)}
function ics(date,title="Data a conferir"){if(!validISO(date))throw Error("Data inválida");const stamp=new Date().toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,""),d=s=>s.replaceAll("-","");return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//LegalTech Suite//PT","BEGIN:VEVENT","UID:lt-"+stamp+"@local","DTSTAMP:"+stamp,"DTSTART;VALUE=DATE:"+d(date),"DTEND;VALUE=DATE:"+d(nextDate(date)),"SUMMARY:"+title,"DESCRIPTION:Data indicativa. Conferir a legislação e os autos.","TRANSP:TRANSPARENT","END:VEVENT","END:VCALENDAR"].join("\r\n")+"\r\n"}
function rtf(text){let out="{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs24\\lang2070 ";for(const c of String(text)){const n=c.codePointAt(0);if(c==="\\")out+="\\\\";else if(c==="{")out+="\\{";else if(c==="}")out+="\\}";else if(c==="\n")out+="\\par\n";else if(c==="\r")continue;else if(n>=32&&n<=126)out+=c;else if(n<=65535)out+="\\u"+(n>32767?n-65536:n)+"?";else {const q=n-65536;for(const v of [0xD800+(q>>10),0xDC00+(q&1023)])out+="\\u"+(v>32767?v-65536:v)+"?"}}return out+"}"}
function textFile(file,max=1500000){if(!file)throw Error("Seleciona um ficheiro.");if(file.size>max)throw Error("Ficheiro demasiado grande. Limite: "+Math.round(max/1000)+" kB.");if(!/\.(txt|csv|md|json)$/i.test(file.name))throw Error("São aceites apenas TXT, CSV, MD ou JSON, não PDFs neste módulo.");return file.text()}
function checkList(where,items,onChange){const target=byId(where);target.replaceChildren();const state=[];items.forEach((txt,i)=>{const label=node("label");label.className="next-check";const box=node("input");box.type="checkbox";box.setAttribute("aria-label",txt);state.push(box);box.addEventListener("change",()=>onChange?.(state));label.append(box,node("span",txt));target.append(label)});return state}
root.LegalNext=Object.freeze({byId,node,status,save,csv,copy,validISO,ics,rtf,textFile,checkList});
})(window);
