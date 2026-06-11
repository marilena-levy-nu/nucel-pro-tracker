/* ═══════════════════════════════════════════════════════════
   NuCel Pro Tracker — app.js  v3.0
   Gestor de projetos operacionais · Time NuCel · Nubank
   1. DADOS  2. ESTADO  3. HELPERS  4. NAVEGAÇÃO  5. EXECUTIVA
   6. PROJETOS  7. POR LÍDER  8. DETALHE  9. NOVO PROJETO
   10. NOTIFICAR  11. SLACK  12. SHEETS  13. TEMA  14. USUÁRIO  15. INIT
   ═══════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────
// 1. DADOS
// ─────────────────────────────────────────────────────────────
const LIDERES = [
  { nome:"Ana Claudia Oliveira", email:"anaclaudia.oliveira@nubank.com.br", step:"M2", cluster:"N2" },
  { nome:"Bianca Holanda",       email:"bianca.holanda@nubank.com.br",       step:"M2", cluster:"BPO" },
  { nome:"Daniel Pereira",       email:"daniel.pereira@nubank.com.br",       step:"M2", cluster:"N2" },
  { nome:"Mariana Foffa",        email:"mariana.foffa@nubank.com.br",        step:"M2", cluster:"Melhoria Contínua" },
  { nome:"Amanda Garcia",        email:"amanda.garcia@nubank.com.br",        step:"M1", cluster:"Q&T" },
  { nome:"Bruna Freitas",        email:"bruna.freitas@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Bruno Ziurkelis",      email:"bruno.ziurkelis@nubank.com.br",      step:"M1", cluster:"N2" },
  { nome:"Evandro Silva",        email:"evandro.silva@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Giancarlo Mendonca",   email:"giancarlo.mendonca@nubank.com.br",   step:"M1", cluster:"Q&T" },
  { nome:"Marilena Levy",        email:"marilena.levy@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Nathalia Alcantara",   email:"nathalia.alcantara@nubank.com.br",   step:"M1", cluster:"N2" },
  { nome:"Rogerio Lobato",       email:"rogerio.lobato@nubank.com.br",       step:"M1", cluster:"N2" },
  { nome:"Felipe Eiji",          email:"felipe.eiji@nubank.com.br",          step:"IC5", cluster:"Melhoria Contínua" },
  { nome:"Marilia Pinto",        email:"marilia.pinto@nubank.com.br",        step:"IC5", cluster:"Melhoria Contínua" },
  { nome:"Rodrigo Gallo",        email:"rodrigo.gallo@nubank.com.br",        step:"IC5", cluster:"BPO" },
];

const METRICAS = ["tNPS","Produtividade","Aderência","OTD 24h","Skip","Qualidade","SLA","Handover N1/N2","WoW","Engajamento","Customizada"];
const DB_TABLES = [
  { value:"sla_wt",               label:"SLA — sla_wt" },
  { value:"interaction_statuses", label:"Handover / Status — interaction_statuses" },
  { value:"tnps_resolutivity",    label:"tNPS / Resolução — tnps_resolutivity" },
  { value:"jobs_done",            label:"Produtividade (feitos) — jobs_done" },
  { value:"jobs_created",         label:"Volume (criados) — jobs_created" },
  { value:"ofrt_otd",             label:"OTD 24h / OFRT — ofrt_otd" },
  { value:"manual",               label:"Manual (WoW, Engajamento, outros)" },
];
const IMPACTOS = ["N2 — Todos","N2 — Rede e Conectividade","N2 — Gerenciamento de Chip","N2 — Gerenciamento de Plano","N2 — Portabilidade","N2 — RPI","OPS N2","OPS N1","OPS","Q&T","BPO","Melhoria Contínua","Outros"];
const QUEUES   = ["nucel-bug","nucel-calls-issues","nucel-no-signal","nucel-internet-issues","nucel-sms-issues","nucel-esim","nucel-psim","nucel-portability","nucel-status","nucel-reembolso","nucel-turbo-box","nucel-transferencia","nucel-bonus-issues","nucel-recovery","nucel-pin-puk","nucel-imei-block","nucel-imei-unblock","nucel-immediate-cancellation","nucel-usage","nucel-psim-delivery","nucel-delivery-problems","nucel-delivery-apology","rpi-nucel","rpi-nucel-transfer","nucel-waitlist","nucel-protocols"];
const MEMBROS_NUCEL = [
  {nome:"Adriane Santerio",email:"adriane.santerio@nubank.com.br"},{nome:"Adriano Sousa",email:"adriano.sousa@nubank.com.br"},{nome:"Amanda Cardoso",email:"amanda.cardoso@nubank.com.br"},{nome:"Amanda Garcia",email:"amanda.garcia@nubank.com.br"},{nome:"Ana Claudia Oliveira",email:"anaclaudia.oliveira@nubank.com.br"},{nome:"Anderson Trindade",email:"anderson.trindade@nubank.com.br"},{nome:"Bianca Feliciano",email:"bianca.feliciano@nubank.com.br"},{nome:"Bianca Holanda",email:"bianca.holanda@nubank.com.br"},{nome:"Brenda Arcanjo",email:"brenda.arcanjo@nubank.com.br"},{nome:"Bruna Cacau",email:"bruna.cacau@nubank.com.br"},{nome:"Bruna Freitas",email:"bruna.freitas@nubank.com.br"},{nome:"Bruno Calazans",email:"bruno.calazans@nubank.com.br"},{nome:"Bruno Ziurkelis",email:"bruno.ziurkelis@nubank.com.br"},{nome:"Camila Souza",email:"camila.souza@nubank.com.br"},{nome:"Carla Almeida",email:"carla.almeida@nubank.com.br"},{nome:"Carla Ignes",email:"carla.ignes@nubank.com.br"},{nome:"Christopher Souza",email:"christopher.souza@nubank.com.br"},{nome:"Clarisse Barbosa",email:"clarisse.barbosa@nubank.com.br"},{nome:"Daniel Marques",email:"daniel.marques2@nubank.com.br"},{nome:"Daniel Pereira",email:"daniel.pereira@nubank.com.br"},{nome:"Danielle Mayer",email:"danielle.mayer@nubank.com.br"},{nome:"David Manriquez",email:"david.manriquez@nubank.com.br"},{nome:"Debora Fontoura",email:"debora.fontoura@nubank.com.br"},{nome:"Debora Silva",email:"debora.silva@nubank.com.br"},{nome:"Dennys Carvalho",email:"dennys.carvalho@nubank.com.br"},{nome:"Diego Maia",email:"diego.maia@nubank.com.br"},{nome:"Diego Rodrigues",email:"diego.rodrigues@nubank.com.br"},{nome:"Eduardo Fernando",email:"eduardo.fernando@nubank.com.br"},{nome:"Elisangela Valentim",email:"elisangela.valentim@nubank.com.br"},{nome:"Erika Nascimento",email:"erika.nascimento@nubank.com.br"},{nome:"Estefany Jonas",email:"estefany.jonas@nubank.com.br"},{nome:"Evandro Silva",email:"evandro.silva@nubank.com.br"},{nome:"Fabiola Farias",email:"fabiola.farias@nubank.com.br"},{nome:"Felipe Barbosa",email:"felipe.barbosasilva@nubank.com.br"},{nome:"Felipe Eiji",email:"felipe.eiji@nubank.com.br"},{nome:"Felipe Mauricio",email:"felipe.mauricio@nubank.com.br"},{nome:"Fernanda Costa",email:"fernanda.costa@nubank.com.br"},{nome:"Gabriela Souza",email:"gabriela.souza@nubank.com.br"},{nome:"Giancarlo Mendonca",email:"giancarlo.mendonca@nubank.com.br"},{nome:"Glaucia Lorenconi",email:"glaucia.lorenconi@nubank.com.br"},{nome:"Guilherme Braga",email:"guilherme.braga@nubank.com.br"},{nome:"Guilherme Sousa",email:"guilherme.sousa@nubank.com.br"},{nome:"Huan Lemos",email:"huan.lemos@nubank.com.br"},{nome:"Jair Linhares",email:"jair.linhares@nubank.com.br"},{nome:"Jefferson Silva",email:"jefferson.silva@nubank.com.br"},{nome:"Jeniffer Drielly",email:"jeniffer.drielly@nubank.com.br"},{nome:"Jennifer Assuncao",email:"jennifer.assuncao@nubank.com.br"},{nome:"Joao Morali",email:"joao.morali@nubank.com.br"},{nome:"Jose Barbosa",email:"jose.barbosa2@nubank.com.br"},{nome:"Juliana Pereira",email:"juliana.pereira@nubank.com.br"},{nome:"Karol Helena",email:"karol.helena@nubank.com.br"},{nome:"Kelvin Calisto",email:"kelvin.calisto@nubank.com.br"},{nome:"Kodara Bertolini",email:"kodara.bertolini@nubank.com.br"},{nome:"Lidiane Ayang",email:"lidiane.ayang@nubank.com.br"},{nome:"Livia Bezerra",email:"livia.bezerra@nubank.com.br"},{nome:"Luana Costa",email:"luana.costa@nubank.com.br"},{nome:"Marcel Botelho",email:"marcel.botelho@nubank.com.br"},{nome:"Marcella Ruggi",email:"marcella.ruggi@nubank.com.br"},{nome:"Maria Renata",email:"maria.renata@nubank.com.br"},{nome:"Mariana Foffa",email:"mariana.foffa@nubank.com.br"},{nome:"Marilena Levy",email:"marilena.levy@nubank.com.br"},{nome:"Marilia Cury",email:"marilia.cury@nubank.com.br"},{nome:"Marilia Pinto",email:"marilia.pinto@nubank.com.br"},{nome:"Marion Castro",email:"marion.castro@nubank.com.br"},{nome:"Marta Binza",email:"marta.binza@nubank.com.br"},{nome:"Mayara Passos",email:"mayara.passos@nubank.com.br"},{nome:"Micaele Costa",email:"micaele.costa@nubank.com.br"},{nome:"Natalia Dasan",email:"natalia.dasan@nubank.com.br"},{nome:"Nathalia Alcantara",email:"nathalia.alcantara@nubank.com.br"},{nome:"Patricia Sobral",email:"patricia.sobral@nubank.com.br"},{nome:"Priscila Benetti",email:"priscila.benetti@nubank.com.br"},{nome:"Raphael Fassizoli",email:"raphael.fassizoli@nubank.com.br"},{nome:"Raul Gomes",email:"raul.gomes@nubank.com.br"},{nome:"Roberta Almeida",email:"roberta.almeida@nubank.com.br"},{nome:"Roberta Monteiro",email:"roberta.monteiro@nubank.com.br"},{nome:"Rodrigo Gallo",email:"rodrigo.gallo@nubank.com.br"},{nome:"Rogerio Lobato",email:"rogerio.lobato@nubank.com.br"},{nome:"Romario Melo",email:"romario.melo@nubank.com.br"},{nome:"Rute Miranda",email:"rute.miranda@nubank.com.br"},{nome:"Tamiris Cazumba",email:"tamiris.cazumba@nubank.com.br"},{nome:"Tatiane Barros",email:"tatiane.barros@nubank.com.br"},{nome:"Thaina Sousa",email:"thaina.sousa@nubank.com.br"},{nome:"Thais Souza",email:"thais.souza@nubank.com.br"},{nome:"Thatiane Santos",email:"thatiane.santos@nubank.com.br"},{nome:"Thays Auzier",email:"thays.auzier@nubank.com.br"},{nome:"Thiago Valentim",email:"thiago.valentim@nubank.com.br"},{nome:"Val Tubero",email:"val.tubero@nubank.com.br"},{nome:"Valquiria Macedo",email:"valquiria.macedo@nubank.com.br"},{nome:"Verena Hereda",email:"verena.hereda@nubank.com.br"},{nome:"Vinicius Fidelis",email:"vinicius.fidelis@nubank.com.br"},{nome:"Vinicius Mitev",email:"vinicius.mitev@nubank.com.br"},{nome:"Viviane Villas",email:"viviane.villas@nubank.com.br"},
];

// ─────────────────────────────────────────────────────────────
// 2. ESTADO
// ─────────────────────────────────────────────────────────────
let PROJETOS     = [];
let filterStatus = "todos";
let execFilter   = "todos";
let activePageId = "exec";

// ─────────────────────────────────────────────────────────────
// 3. HELPERS
// ─────────────────────────────────────────────────────────────
const $    = id => document.getElementById(id);
const ini  = n  => n.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
const rclr = r  => r>=70?"var(--gr)":r>=40?"var(--am)":"var(--rd)";
const fmt  = v  => (v===undefined||v===null||v===""||v==="—")?"—":v;

function nextId() {
  const ids=new Set(PROJETOS.map(p=>p.id));
  let n=PROJETOS.length+1, id="PROJ-"+String(n).padStart(3,"0");
  while(ids.has(id)){n++;id="PROJ-"+String(n).padStart(3,"0");}
  return id;
}
function sbadge(s){const m={Iniciado:"bi",Prorrogado:"bp",Finalizado:"bf",Cancelado:"bc"};return `<span class="BDG ${m[s]||"ba"}">${s||"—"}</span>`;}
function rbadge(r){if(r==="success")return`<span class="RB rs"><i class="ti ti-circle-check"></i> Sucesso</span>`;if(r==="fail")return`<span class="RB rf"><i class="ti ti-circle-x"></i> Não atingido</span>`;return`<span class="RB rp"><i class="ti ti-clock"></i> Em apuração</span>`;}
function saudeBadge(s){const m={no_prazo:`<span style="color:var(--gr);font-size:11px;font-weight:500">🟢 No prazo</span>`,em_risco:`<span style="color:var(--am);font-size:11px;font-weight:500">🟡 Em risco</span>`,bloqueado:`<span style="color:var(--rd);font-size:11px;font-weight:500">🔴 Bloqueado</span>`};return m[s]||m.no_prazo;}
function emptyState(msg){return`<div style="text-align:center;padding:40px 20px;color:var(--i3)"><div style="font-size:32px;margin-bottom:12px">📋</div><div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:6px">${msg}</div><div style="font-size:12px">Clique em <strong>Novo Projeto</strong> para começar</div></div>`;}
function showToast(msg,t=3000){const el=document.createElement("div");el.textContent=msg;el.style.cssText="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1a1a2e;color:#fff;padding:10px 20px;border-radius:100px;font-size:12px;font-weight:500;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3);pointer-events:none";document.body.appendChild(el);setTimeout(()=>el.remove(),t);}

// ─────────────────────────────────────────────────────────────
// 4. NAVEGAÇÃO
// ─────────────────────────────────────────────────────────────
const PAGE_TITLES={exec:"Visão Executiva",proj:"Todos os projetos",lider:"Visão por Líder",novo:"Novo Projeto",dados:"Dados & Histórico",org:"Organograma NuCel"};
function clearNav(){document.querySelectorAll(".NI").forEach(n=>n.classList.remove("on"));document.querySelectorAll(".SNI").forEach(n=>n.classList.remove("on"));}
function showPage(id){document.querySelectorAll(".PG").forEach(p=>p.classList.remove("on"));const el=$("pg-"+id);if(el)el.classList.add("on");activePageId=id;}
function pg(id,el){clearNav();if(el)el.classList.add("on");showPage(id);$("ptitle").textContent=PAGE_TITLES[id]||id;if(id==="exec")renderExec();if(id==="proj")renderProjetos();if(id==="novo")populateNovoForm();}
function goLider(nome,sniEl){clearNav();if(sniEl)sniEl.classList.add("on");$("subnav-lider").classList.add("open");$("ni-lider-toggle").classList.add("exp");showPage("lider");$("ptitle").textContent=nome;renderLider(nome);}
function toggleLiderMenu(el){$("subnav-lider").classList.toggle("open");el.classList.toggle("exp");}
function buildLiderSubmenu(){$("subnav-lider").innerHTML=LIDERES.map((l,i)=>`<div class="SNI" onclick="goLider('${l.nome}',this)" id="sni-${i}"><div class="SMAV">${ini(l.nome)}</div><span style="flex:1">${l.nome}</span><span style="font-size:9px;color:var(--i3);flex-shrink:0">${l.step}</span></div>`).join("");}

// ─────────────────────────────────────────────────────────────
// 5. EXECUTIVA
// ─────────────────────────────────────────────────────────────
function updateKPIs(){const total=PROJETOS.length,wip=PROJETOS.filter(p=>["Iniciado","Prorrogado"].includes(p.status)).length,succ=PROJETOS.filter(p=>p.result==="success").length,fin=PROJETOS.filter(p=>p.result!=="pending").length,pct=fin>0?Math.round(succ/fin*100):0;if($("kt"))$("kt").textContent=total||"—";if($("cnt"))$("cnt").textContent=total;if($("ks-pct"))$("ks-pct").textContent=fin>0?pct+"%":"—";if($("ks-wip"))$("ks-wip").textContent=wip||"—";if($("ks-lid"))$("ks-lid").textContent=LIDERES.filter(l=>l.step==="M1").length;if($("ks-total"))$("ks-total").textContent=total>0?`${total} projetos`:"Nenhum projeto";if($("ks-sub"))$("ks-sub").textContent=fin>0?`${succ} de ${fin} metas`:"Aguardando";if($("ks-wip-sub"))$("ks-wip-sub").textContent=wip>0?`${wip} ativos`:"Nenhum ativo";if($("exec-sub"))$("exec-sub").textContent="NuCel Pro Tracker · "+new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});}

function renderExec(f){
  if(f)execFilter=f;updateKPIs();
  const eg=$("eg");if(!eg)return;
  if(PROJETOS.length===0){eg.innerHTML=`<div style="grid-column:1/-1">${emptyState("Nenhum projeto cadastrado ainda")}</div>`;return;}
  const lm={};
  PROJETOS.forEach(p=>{if(execFilter!=="todos"&&p.status!==execFilter)return;if(!lm[p.lider])lm[p.lider]={p:[],s:0,t:0};lm[p.lider].p.push(p);lm[p.lider].t++;if(p.result==="success")lm[p.lider].s++;});
  if(!Object.keys(lm).length){eg.innerHTML=`<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--i3);font-size:12px">Nenhum projeto com este status</div>`;return;}
  eg.innerHTML=Object.entries(lm).map(([nome,d])=>{const r=d.t>0?Math.round(d.s/d.t*100):0,c=rclr(r),ldr=LIDERES.find(l=>l.nome===nome);
    return `<div class="EC"><div style="display:flex;align-items:center;gap:8px;margin-bottom:7px"><div class="MAV" style="width:32px;height:32px;font-size:11px;margin:0;font-weight:700">${ini(nome)}</div><div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--ink)">${nome}</div><div style="font-size:10px;color:var(--i6)">${ldr?ldr.step+" · "+ldr.cluster:"—"}</div></div><div style="text-align:right"><div style="font-size:15px;font-weight:700;color:${c}">${r}%</div><div style="font-size:9px;color:var(--i3)">SUCESSO</div></div></div><div class="LB"><div class="LBF" style="width:${r}%;background:${c}"></div></div><div style="font-size:10px;color:var(--i3);margin:5px 0 9px">${d.t} projeto${d.t!==1?"s":""} · ${d.s} atingido${d.s!==1?"s":""}</div><div style="border-top:1px solid var(--s3);padding-top:7px">${d.p.map(p=>`<div class="MP" onclick="openDetalhe('${p.id}')" style="cursor:pointer"><div style="flex:1;min-width:0"><div class="MTL">${p.title}</div><div class="MMT">${p.meta} · target ${fmt(p.target)}${p.impacto_cliente==="Sim"?" · 👥 Clientes":""}</div></div><div style="display:flex;align-items:center;gap:3px;flex-shrink:0">${sbadge(p.status)}${rbadge(p.result)}</div></div>`).join("")}</div></div>`;
  }).join("");
}
function fe(f,btn){document.querySelectorAll(".SH .FB").forEach(x=>x.classList.remove("on"));if(btn)btn.classList.add("on");renderExec(f);}

// ─────────────────────────────────────────────────────────────
// 6. PROJETOS
// ─────────────────────────────────────────────────────────────
function renderProjetos(){
  const ptb=$("ptb");if(!ptb)return;
  const d=filterStatus==="todos"?PROJETOS:PROJETOS.filter(p=>p.status===filterStatus);
  if(d.length===0){ptb.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--i3)">${PROJETOS.length===0?"Nenhum projeto — clique em Novo Projeto":"Nenhum projeto com este status"}</td></tr>`;return;}
  ptb.innerHTML=d.map(p=>`<tr onclick="openDetalhe('${p.id}')" style="cursor:pointer"><td><div class="PT">${p.title}</div><div class="PM">${p.cluster||"—"} · ${p.queue||"—"}</div></td><td><div style="display:flex;align-items:center;gap:4px"><div class="MAV">${ini(p.lider)}</div><span style="color:var(--i6)">${(p.lider||"").split(" ")[0]}</span></div></td><td>${sbadge(p.status)}</td><td>${saudeBadge(p.saude)}</td><td style="font-size:11px;color:var(--ink)">${p.meta||"—"}</td><td style="font-weight:500;color:var(--ink)">${fmt(p.baseline)}</td><td style="font-weight:500;color:var(--ink)">${fmt(p.target)}</td><td style="font-weight:600;color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"}">${fmt(p.real)}</td><td>${rbadge(p.result)}</td></tr>`).join("");
}
function fp(f,btn){document.querySelectorAll("#sf .FB").forEach(x=>x.classList.remove("on"));if(btn)btn.classList.add("on");filterStatus=f;renderProjetos();}

// ─────────────────────────────────────────────────────────────
// 7. POR LÍDER
// ─────────────────────────────────────────────────────────────
function renderLider(filtro){
  const lc=$("lc");if(!lc)return;
  const lm={};PROJETOS.forEach(p=>{if(filtro&&filtro!=="todos"&&p.lider!==filtro)return;if(!lm[p.lider])lm[p.lider]=[];lm[p.lider].push(p);});
  if($("lider-title"))$("lider-title").textContent=filtro&&filtro!=="todos"?filtro:"Todos os líderes";
  if($("lider-sub"))$("lider-sub").textContent=filtro&&filtro!=="todos"?`${PROJETOS.filter(p=>p.lider===filtro).length} projetos de ${filtro}`:"Clique no nome do líder para expandir";
  const source=Object.keys(lm).length>0?Object.entries(lm):LIDERES.filter(l=>!filtro||filtro==="todos"||l.nome===filtro).map(l=>[l.nome,[]]);
  lc.innerHTML=source.map(([nome,ps],i)=>{
    const s=ps.filter(p=>p.result==="success").length,r=ps.length>0?Math.round(s/ps.length*100):0,c=ps.length>0?rclr(r):"var(--i3)",ldr=LIDERES.find(l=>l.nome===nome),id="acc"+i,auto=filtro&&filtro!=="todos"?"open":"";
    const body=ps.length===0?`<div style="text-align:center;padding:16px;color:var(--i3);font-size:12px">Nenhum projeto cadastrado</div>`:`<table><thead><tr><th>Projeto</th><th>Status</th><th>Saúde</th><th>Baseline</th><th>Target</th><th>Real</th><th>Resultado</th></tr></thead><tbody>${ps.map(p=>`<tr onclick="openDetalhe('${p.id}')" style="cursor:pointer"><td><div class="PT">${p.title}</div><div class="PM">${p.meta}</div></td><td>${sbadge(p.status)}</td><td>${saudeBadge(p.saude)}</td><td style="color:var(--i6)">${fmt(p.baseline)}</td><td style="font-weight:500;color:var(--ink)">${fmt(p.target)}</td><td style="font-weight:600;color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"}">${fmt(p.real)}</td><td>${rbadge(p.result)}</td></tr>`).join("")}</tbody></table>`;
    return `<div class="ACC ${auto}" id="${id}"><div class="ACCH" onclick="togAcc('${id}')"><div style="display:flex;align-items:center;gap:9px"><div class="MAV" style="width:32px;height:32px;font-size:12px;margin:0;font-weight:700;flex-shrink:0">${ini(nome)}</div><div><div style="font-size:13px;font-weight:600;color:var(--ink)">${nome}</div><div style="font-size:11px;color:var(--i6);margin-top:1px">${ldr?ldr.step+" · "+ldr.cluster+" · ":""}${ps.length} projeto${ps.length!==1?"s":""}</div></div></div><div style="display:flex;align-items:center;gap:10px">${ps.length>0?`<div style="text-align:right"><div style="font-size:16px;font-weight:700;color:${c}">${r}%</div><div style="font-size:9px;color:var(--i3);text-transform:uppercase">sucesso</div></div>`:""}<i class="ti ti-chevron-down ACHV"></i></div></div><div class="ACCB">${body}</div></div>`;
  }).join("");
}
function togAcc(id){const el=$(id);if(el)el.classList.toggle("open");}

// ─────────────────────────────────────────────────────────────
// 8. DETALHE DO PROJETO
// ─────────────────────────────────────────────────────────────
let chartInstance=null;
function openDetalhe(id){
  const p=PROJETOS.find(x=>x.id===id);if(!p)return;
  const ldr=LIDERES.find(l=>l.nome===p.lider);
  const integrantes=p.integrantes?p.integrantes.split(",").map(e=>e.trim()).filter(Boolean):[];
  const dc=$("detalhe-content");if(!dc)return;
  dc.innerHTML=`
    <div class="DT-HEADER">
      <div style="flex:1">
        <div class="DT-TITLE">${p.title}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
          ${sbadge(p.status)} ${saudeBadge(p.saude)} ${rbadge(p.result)}
          ${p.impacto_cliente==="Sim"?`<span class="BDG" style="background:#FFF3E0;color:#8A4500">👥 ${p.volume_cliente||"?"} clientes</span>`:""}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;flex-wrap:wrap">
        ${p.drive?`<a href="${p.drive}" target="_blank" class="BG" style="font-size:11px;padding:5px 10px;text-decoration:none"><i class="ti ti-external-link"></i> Drive</a>`:""}
        <button class="BG" style="font-size:11px;padding:5px 10px" onclick="printDetalhe()"><i class="ti ti-printer"></i> Imprimir</button>
        <button class="BP" style="font-size:11px;padding:5px 12px" onclick="openNotifyModal(this.dataset.id)" data-id="${p.id}"><i class="ti ti-brand-slack"></i> Notificar time</button>
      </div>
    </div>
    <div class="DT-GRID">
      <div class="DT-CARD"><div class="DT-LABEL">Líder</div><div class="DT-VALUE" style="display:flex;align-items:center;gap:7px"><div class="MAV" style="width:26px;height:26px;font-size:9px;margin:0;font-weight:700">${ini(p.lider)}</div>${p.lider}</div><div style="font-size:10px;color:var(--i6);margin-top:2px">${ldr?ldr.step+" · "+ldr.cluster:""}</div></div>
      <div class="DT-CARD"><div class="DT-LABEL">Impacto</div><div class="DT-VALUE">${p.cluster||"—"}</div></div>
      <div class="DT-CARD"><div class="DT-LABEL">Semana de entrega</div><div class="DT-VALUE">${p.semana||"—"}</div></div>
      <div class="DT-CARD"><div class="DT-LABEL">Queue(s)</div><div class="DT-VALUE" style="font-size:11px">${p.queues||p.queue||"Todas"}</div></div>
    </div>
    <div class="DT-METRICS">
      <div class="DT-MET-CARD"><div class="DT-LABEL">Métrica</div><div class="DT-VALUE">${p.meta||"—"}</div></div>
      <div class="DT-MET-CARD"><div class="DT-LABEL">Baseline</div><div class="DT-VALUE" style="color:var(--i6)">${fmt(p.baseline)}</div></div>
      <div class="DT-MET-CARD"><div class="DT-LABEL">Target</div><div class="DT-VALUE" style="color:var(--nu);font-weight:700">${fmt(p.target)}</div></div>
      <div class="DT-MET-CARD"><div class="DT-LABEL">Real atual</div><div class="DT-VALUE" style="color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"};font-weight:700">${fmt(p.real)}</div></div>
    </div>
    ${integrantes.length>0?`<div style="margin:16px 0 6px;font-size:11px;font-weight:600;color:var(--i3);text-transform:uppercase;letter-spacing:.06em">Integrantes</div><div style="display:flex;flex-wrap:wrap;gap:6px">${integrantes.map(e=>`<span style="background:var(--nubg);color:var(--nu);font-size:11px;padding:3px 10px;border-radius:100px">${e.split("@")[0]}</span>`).join("")}</div>`:""}
    <div style="margin:16px 0 8px;font-size:11px;font-weight:600;color:var(--i3);text-transform:uppercase;letter-spacing:.06em">Evolução semanal da métrica</div>
    <div style="background:var(--s2);border-radius:12px;padding:16px;position:relative">
      ${p.db_table&&p.db_table!=="manual"?`<div id="chart-loading" style="text-align:center;padding:20px;color:var(--i3);font-size:12px"><i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Carregando Databricks...</div>`:""}
      <canvas id="metricChart" height="200"></canvas>
      ${p.db_table&&p.db_table!=="manual"?`<button class="BG" style="font-size:10px;padding:4px 9px;margin-top:8px" onclick="refreshChart('${p.id}')"><i class="ti ti-refresh"></i> Atualizar</button>`:""}
    </div>`;
  $("modal-detalhe").classList.add("open");
  setTimeout(()=>{p.db_table&&p.db_table!=="manual"?loadChartData(p):renderChart(p.id,mockChartData());},100);
}
function mockChartData(){return Array.from({length:8},(_,i)=>{const d=new Date();d.setDate(d.getDate()-(7-i)*7);return{semana:d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),valor:parseFloat((Math.random()*20+60).toFixed(1))};});}
async function loadChartData(p){try{const r=await fetch("/api/databricks/query",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({table:p.db_table,queue:p.queue,channels:p.channels||[],weeks:8})});const data=await r.json();const rows=data.mock?mockChartData():(data.rows||[]).map(row=>({semana:new Date(row.semana).toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit"}),valor:parseFloat(row.valor)}));const cl=$("chart-loading");if(cl)cl.style.display="none";renderChart(p.id,rows.length?rows:mockChartData());}catch{const cl=$("chart-loading");if(cl)cl.style.display="none";renderChart(p.id,mockChartData());}}
function renderChart(projId,data){const canvas=$("metricChart");if(!canvas)return;const p=PROJETOS.find(x=>x.id===projId),target=p?parseFloat(p.target)||null:null;if(chartInstance){chartInstance.destroy();chartInstance=null;}const dark=$("R").getAttribute("data-theme")==="dark",tc=dark?"#C9A8E0":"#5E4675",gc=dark?"#3D1A5C":"#E4D9EF";chartInstance=new Chart(canvas,{type:"line",data:{labels:data.map(d=>d.semana),datasets:[{label:p?.meta||"Métrica",data:data.map(d=>d.valor),borderColor:"#8A05BE",backgroundColor:"rgba(138,5,190,0.08)",borderWidth:2,pointBackgroundColor:"#8A05BE",pointRadius:4,tension:0.3,fill:true},...(target?[{label:"Target",data:data.map(()=>target),borderColor:"#00B894",borderWidth:1.5,borderDash:[6,4],pointRadius:0,fill:false}]:[])]},options:{responsive:true,plugins:{legend:{labels:{color:tc,font:{family:"DM Sans",size:11}}},tooltip:{callbacks:{label:ctx=>` ${ctx.dataset.label}: ${ctx.parsed.y}`}}},scales:{x:{ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{ticks:{color:tc,font:{size:10}},grid:{color:gc}}}}});}
function refreshChart(projId){const p=PROJETOS.find(x=>x.id===projId);if(p)loadChartData(p);}
function closeDetalhe(){$("modal-detalhe").classList.remove("open");if(chartInstance){chartInstance.destroy();chartInstance=null;}}
function printDetalhe(){window.print();}

// ─────────────────────────────────────────────────────────────
// 9. NOVO PROJETO
// ─────────────────────────────────────────────────────────────
function populateNovoForm(){
  const nL=$("nL");if(nL)nL.innerHTML=`<option value="">Selecionar...</option>`+LIDERES.map(l=>`<option value="${l.nome}">${l.nome} · ${l.step} ${l.cluster}</option>`).join("");
  const nC=$("nC");if(nC)nC.innerHTML=`<option value="">Selecionar...</option>`+IMPACTOS.map(c=>`<option value="${c}">${c}</option>`).join("");
  const nM=$("nM");if(nM)nM.innerHTML=`<option value="">Selecionar...</option>`+METRICAS.map(m=>`<option value="${m}">${m}</option>`).join("");
  const nDB=$("nDB");if(nDB)nDB.innerHTML=`<option value="">Não mensurado via Databricks</option>`+DB_TABLES.map(t=>`<option value="${t.value}">${t.label}</option>`).join("");
  const qc=$("qc");if(qc)qc.innerHTML=`<span class="CH CH-ALL" onclick="tcAll(this)" style="font-weight:600">Todas as queues</span>`+QUEUES.map(q=>`<span class="CH" onclick="tc(this)">${q}</span>`).join("");
  renderIntegrantesSearch("");
}
function tc(el){el.classList.toggle("on");const a=document.querySelector(".CH-ALL");if(a)a.classList.remove("on");}
function tcAll(el){const on=el.classList.toggle("on");if(on)document.querySelectorAll("#qc .CH:not(.CH-ALL)").forEach(c=>c.classList.remove("on"));}
function toggleImpacto(val){const el=$("volume-row");if(el)el.style.display=val==="Sim"?"block":"none";}

function sv(e){
  if(e)e.preventDefault();
  const title=$("nT")?$("nT").value.trim():"",lider=$("nL")?$("nL").value:"";
  if(!title||!lider){alert("Preencha título e líder.");return;}
  const channels=Array.from(document.querySelectorAll(".CH-CANAL input:checked")).map(i=>i.value);
  const allQ=document.querySelector("#qc .CH-ALL.on");
  const qs=allQ?[]:Array.from(document.querySelectorAll("#qc .CH.on:not(.CH-ALL)")).map(x=>x.textContent.trim());
  const impRadio=document.querySelector('input[name="impacto"]:checked');
  const impacto=impRadio?impRadio.value:"Não";
  const newProj={
    id:nextId(),title,
    meta:$("nM")?$("nM").value||"A definir":"A definir",
    lider,
    cluster:$("nC")?$("nC").value||"—":"—",
    queue:qs[0]||(allQ?"Todas":"—"),
    queues:qs.join(", ")||(allQ?"Todas":"—"),
    job:"—",
    status:$("nSt")?$("nSt").value||"Iniciado":"Iniciado",
    saude:$("nSaude")?$("nSaude").value||"no_prazo":"no_prazo",
    target:$("nTg")?$("nTg").value||"—":"—",
    baseline:$("nBL")?$("nBL").value||"—":"—",
    real:"—",result:"pending",
    semana:$("nW")?$("nW").value||"—":"—",
    impacto_cliente:impacto,
    volume_cliente:$("nVC")?$("nVC").value||"":"",
    db_table:$("nDB")?$("nDB").value||"":"",
    channels,
    integrantes:getSelectedIntegrantes(),
    drive:$("nD")?$("nD").value||"":"",
    historico:"",
  };
  try{
    PROJETOS.push(newProj);buildLiderSubmenu();updateKPIs();renderExec();
    saveToSheets(newProj);notifySlack("novo_projeto",newProj);
    const moEl=$("mo");if(!moEl)throw new Error("Modal #mo não encontrado");
    const mdet=$("mdet");if(mdet)mdet.innerHTML=`<b>Projeto:</b> ${newProj.title}<br><b>Líder:</b> ${newProj.lider}<br><b>Métrica:</b> ${newProj.meta} · Target: ${newProj.target}<br><b>Impacto clientes:</b> ${newProj.impacto_cliente==="Sim"?`Sim · ${newProj.volume_cliente||"—"}`:"Não"}<br><b>Queues:</b> ${newProj.queues||"Todas"}`;
    moEl.classList.add("open");
    const form=$("formNovo");if(form)form.reset();
    document.querySelectorAll("#qc .CH.on").forEach(x=>x.classList.remove("on"));
    const vr=$("volume-row");if(vr)vr.style.display="none";
    renderIntegrantesSearch("");
  }catch(err){PROJETOS.pop();console.error("Erro ao salvar:",err);alert("Erro ao salvar: "+err.message);}
}
function closeMo(){$("mo").classList.remove("open");pg("proj",null);renderProjetos();}

function renderIntegrantesSearch(q){
  const container=$("integrantes-list");if(!container)return;
  const filtered=q?MEMBROS_NUCEL.filter(m=>m.nome.toLowerCase().includes(q.toLowerCase())):MEMBROS_NUCEL;
  const checked=new Set(Array.from(document.querySelectorAll("#integrantes-list input:checked")).map(i=>i.value));
  container.innerHTML=filtered.map(m=>`<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;${checked.has(m.email)?"background:var(--nubg)":""}"><input type="checkbox" value="${m.email}" data-nome="${m.nome}" ${checked.has(m.email)?"checked":""} style="width:15px;height:15px;accent-color:var(--nu);flex-shrink:0;cursor:pointer"><span style="font-size:12px;font-weight:500;color:var(--ink);flex:1">${m.nome}</span><span style="font-size:10px;color:var(--i3);flex-shrink:0">${m.email.split("@")[0]}</span></label>`).join("");
  container.querySelectorAll("label").forEach(lbl=>{const inp=lbl.querySelector("input");lbl.addEventListener("mouseenter",()=>{if(!inp.checked)lbl.style.background="var(--s2)";});lbl.addEventListener("mouseleave",()=>{if(!inp.checked)lbl.style.background="";});inp.addEventListener("change",()=>{lbl.style.background=inp.checked?"var(--nubg)":"";});});
}
function getSelectedIntegrantes(){return Array.from(document.querySelectorAll("#integrantes-list input:checked")).map(i=>i.value).join(",");}

// ─────────────────────────────────────────────────────────────
// 10. NOTIFICAR TIME (Slack manual)
// ─────────────────────────────────────────────────────────────
function openNotifyModal(projId){
  const p=PROJETOS.find(x=>x.id===projId);if(!p)return;
  const nt=$("notify-proj-title");if(nt)nt.textContent=p.title;
  const nn=$("notify-nota");if(nn)nn.value="";
  const ni=$("notify-proj-id");if(ni)ni.value=projId;
  $("modal-notify").classList.add("open");
}
function closeNotifyModal(){$("modal-notify").classList.remove("open");}
async function sendNotifySlack(){
  const projId=$("notify-proj-id")?$("notify-proj-id").value:"",nota=$("notify-nota")?$("notify-nota").value.trim():"";
  const p=PROJETOS.find(x=>x.id===projId);if(!p)return;
  const btn=$("btn-notify-send");if(btn){btn.disabled=true;btn.textContent="Enviando...";}
  try{const r=await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"update_projeto",projeto:{...p,nota}})});const d=await r.json();if(d.ok||d.skipped){closeNotifyModal();showToast("✅ Notificação enviada para #nucel-pro-tracker-app");}}
  catch(err){console.error("Slack error:",err);}
  finally{if(btn){btn.disabled=false;btn.textContent="Enviar notificação";}}
}

// ─────────────────────────────────────────────────────────────
// 11. SLACK (automático)
// ─────────────────────────────────────────────────────────────
async function notifySlack(type,projeto){try{await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,projeto})});}catch{}}

// ─────────────────────────────────────────────────────────────
// 12. GOOGLE SHEETS
// ─────────────────────────────────────────────────────────────
async function loadProjetos(){
  try{
    const r=await fetch("/api/projetos");
    if(!r.ok)return;
    const data=await r.json();
    if(Array.isArray(data)&&data.length>0){
      PROJETOS=data;
      buildLiderSubmenu();
      renderExec();
      renderProjetos();
      updateKPIs();
      console.log("✅ "+data.length+" projetos carregados da planilha");
    }
  }catch{console.log("Sheets offline — dados locais");}
}
async function saveToSheets(p){
  try{
    const r=await fetch("/api/projetos",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
    if(r.ok) showToast("✅ Projeto salvo na planilha");
    else console.warn("Sheets save failed:",r.status);
  }catch(e){console.log("Sheets offline:",e.message);}
}

// ─────────────────────────────────────────────────────────────
// 13. TEMA
// ─────────────────────────────────────────────────────────────
function thm(){const R=$("R"),dark=R.getAttribute("data-theme")==="dark";R.setAttribute("data-theme",dark?"light":"dark");const tth=$("tth");if(tth)tth.textContent=dark?"☀️":"🌙";try{localStorage.setItem("nucel-theme",dark?"light":"dark");}catch{}}

// ─────────────────────────────────────────────────────────────
// 14. USUÁRIO
// ─────────────────────────────────────────────────────────────
function getUserData(){try{const d=localStorage.getItem("nucel_user");return d?JSON.parse(d):null;}catch{return null;}}
function setUserData(nome,email){try{localStorage.setItem("nucel_user",JSON.stringify({nome,email}));}catch{}}
function renderUserFooter(nome){const ne=$("uf-name"),ae=$("uf-avatar");if(!ne)return;const p=nome.trim().split(" "),in2=(p[0][0]+(p[p.length-1][0]||"")).toUpperCase();ne.textContent=nome;if(ae)ae.textContent=in2;}
function populateWelcomeDropdown(){const sel=$("welcome-select");if(!sel)return;sel.innerHTML=`<option value="">Selecionar meu nome...</option>`+MEMBROS_NUCEL.map(m=>`<option value="${m.email}" data-nome="${m.nome}">${m.nome}</option>`).join("");}
function confirmWelcome(){
  const sel=$("welcome-select");
  if(!sel||!sel.value){
    if(sel){sel.style.borderColor="#ff4d6d";setTimeout(()=>sel.style.borderColor="",1500);}
    return;
  }
  const opt=sel.options[sel.selectedIndex];
  const nome=opt.getAttribute("data-nome");
  const email=opt.value;
  if(!nome){return;}
  setUserData(nome,email);
  renderUserFooter(nome);
  const ws=$("welcome-screen");
  if(ws){ws.style.display="none";}
  showToast("👋 Olá, "+nome.split(" ")[0]+"!");
}
function showChangeUser(){populateWelcomeDropdown();const user=getUserData(),sel=$("welcome-select");if(user&&sel)sel.value=user.email;const ws=$("welcome-screen");if(ws){ws.style.display="flex";ws.style.alignItems="center";ws.style.justifyContent="center";}}
function initUser(){const user=getUserData(),ws=$("welcome-screen");if(!user){populateWelcomeDropdown();if(ws){ws.style.display="flex";ws.style.alignItems="center";ws.style.justifyContent="center";}}else{if(ws)ws.style.display="none";renderUserFooter(user.nome);}}

// ─────────────────────────────────────────────────────────────
// 15. INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded",()=>{
  try{if(localStorage.getItem("nucel-theme")==="dark"){$("R").setAttribute("data-theme","dark");const tth=$("tth");if(tth)tth.textContent="🌙";}}catch{}
  initUser();
  buildLiderSubmenu();
  renderExec();
  renderProjetos();
  updateKPIs();
  loadProjetos();
  const form=$("formNovo");if(form)form.addEventListener("submit",sv);
});
