/* ═══════════════════════════════════════════════════════════════
   NuCel Pro Tracker — app.js
   Gestor de projetos operacionais do time NuCel · Nubank
   ─────────────────────────────────────────────────────────────
   Módulos:
   1. DADOS          — Líderes, métricas, tabelas Databricks
   2. ESTADO         — Projetos em memória + cache
   3. HELPERS        — Funções utilitárias puras
   4. NAVEGAÇÃO      — Roteamento entre páginas
   5. EXECUTIVA      — KPIs + cards por líder
   6. PROJETOS       — Tabela com filtros
   7. POR LÍDER      — Accordion por líder
   8. DETALHE        — One-pager de projeto + gráfico
   9. NOVO PROJETO   — Formulário completo
   10. CALENDAR      — OAuth + Freebusy + Create event
   11. DADOS & HIST  — Links planilhas
   12. SLACK         — Notificações
   13. SHEETS        — Leitura e escrita Google Sheets
   14. TEMA          — Dark/light mode
   15. INIT          — Bootstrap
   ═══════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════════════════════════════
// 1. DADOS
// ══════════════════════════════════════════════════════════════

const LIDERES = [
  // M2
  { nome:"Ana Claudia Oliveira", email:"anaclaudia.oliveira@nubank.com.br", step:"M2", cluster:"N2" },
  { nome:"Bianca Holanda",       email:"bianca.holanda@nubank.com.br",       step:"M2", cluster:"BPO" },
  { nome:"Daniel Pereira",       email:"daniel.pereira@nubank.com.br",       step:"M2", cluster:"N2" },
  { nome:"Mariana Foffa",        email:"mariana.foffa@nubank.com.br",        step:"M2", cluster:"Melhoria Contínua" },
  // M1
  { nome:"Amanda Garcia",        email:"amanda.garcia@nubank.com.br",        step:"M1", cluster:"Q&T" },
  { nome:"Bruna Freitas",        email:"bruna.freitas@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Bruno Ziurkelis",      email:"bruno.ziurkelis@nubank.com.br",      step:"M1", cluster:"N2" },
  { nome:"Evandro Silva",        email:"evandro.silva@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Giancarlo Mendonça",   email:"giancarlo.mendonca@nubank.com.br",   step:"M1", cluster:"Q&T" },
  { nome:"Marilena Levy",        email:"marilena.levy@nubank.com.br",        step:"M1", cluster:"N2" },
  { nome:"Nathalia Alcantara",   email:"nathalia.alcantara@nubank.com.br",   step:"M1", cluster:"N2" },
  { nome:"Rogério Lobato",       email:"rogerio.lobato@nubank.com.br",       step:"M1", cluster:"N2" },
  // IC5
  { nome:"Felipe Eiji",          email:"felipe.eiji@nubank.com.br",          step:"IC5", cluster:"Melhoria Contínua" },
  { nome:"Marilia Pinto",        email:"marilia.pinto@nubank.com.br",        step:"IC5", cluster:"Melhoria Contínua" },
  { nome:"Rodrigo Gallo",        email:"rodrigo.gallo@nubank.com.br",        step:"IC5", cluster:"BPO" },
];

const METRICAS = ["tNPS","Produtividade","Aderência","OTD 24h","Skip","Qualidade","SLA","Handover N1/N2","WoW","Engajamento","Customizada"];

const DB_TABLES = [
  { value:"sla_wt",              label:"SLA — sla_wt",                        metrica:"SLA" },
  { value:"interaction_statuses",label:"Handover / Status — interaction_statuses", metrica:"Handover N1/N2" },
  { value:"tnps_resolutivity",   label:"tNPS / Resolução — tnps_resolutivity", metrica:"tNPS" },
  { value:"jobs_done",           label:"Produtividade (feitos) — jobs_done",   metrica:"Produtividade" },
  { value:"jobs_created",        label:"Volume (criados) — jobs_created",      metrica:"Produtividade" },
  { value:"ofrt_otd",            label:"OTD 24h / OFRT — ofrt_otd",           metrica:"OTD 24h" },
  { value:"manual",              label:"Manual (WoW, Engajamento, outros)",    metrica:"" },
];

const IMPACTOS = [
  "N2 — Todos","N2 — Rede e Conectividade","N2 — Gerenciamento de Chip",
  "N2 — Gerenciamento de Plano","N2 — Portabilidade","N2 — RPI",
  "OPS N2","OPS N1","OPS","Q&T","BPO","Melhoria Contínua","Outros"
];

const QUEUES = [
  "nucel-bug","nucel-calls-issues","nucel-no-signal","nucel-internet-issues",
  "nucel-sms-issues","nucel-esim","nucel-psim","nucel-portability","nucel-status",
  "nucel-reembolso","nucel-turbo-box","nucel-transferencia","nucel-bonus-issues",
  "nucel-recovery","nucel-pin-puk","nucel-imei-block","nucel-imei-unblock",
  "nucel-immediate-cancellation","nucel-usage","nucel-psim-delivery",
  "nucel-delivery-problems","nucel-delivery-apology","rpi-nucel","rpi-nucel-transfer",
  "nucel-waitlist","nucel-protocols",
];

const MEMBROS_NUCEL = [
  { nome: "Adriane Santerio", email: "adriane.santerio@nubank.com.br" },
  { nome: "Adriano Sousa", email: "adriano.sousa@nubank.com.br" },
  { nome: "Amanda Cardoso", email: "amanda.cardoso@nubank.com.br" },
  { nome: "Amanda Garcia", email: "amanda.garcia@nubank.com.br" },
  { nome: "Ana Claudia Oliveira", email: "anaclaudia.oliveira@nubank.com.br" },
  { nome: "Anderson Trindade", email: "anderson.trindade@nubank.com.br" },
  { nome: "Bianca Feliciano", email: "bianca.feliciano@nubank.com.br" },
  { nome: "Bianca Holanda", email: "bianca.holanda@nubank.com.br" },
  { nome: "Brenda Arcanjo", email: "brenda.arcanjo@nubank.com.br" },
  { nome: "Bruna Cacau", email: "bruna.cacau@nubank.com.br" },
  { nome: "Bruna Freitas", email: "bruna.freitas@nubank.com.br" },
  { nome: "Bruno Calazans", email: "bruno.calazans@nubank.com.br" },
  { nome: "Bruno Ziurkelis", email: "bruno.ziurkelis@nubank.com.br" },
  { nome: "Camila Souza", email: "camila.souza@nubank.com.br" },
  { nome: "Carla Almeida", email: "carla.almeida@nubank.com.br" },
  { nome: "Carla Ignes", email: "carla.ignes@nubank.com.br" },
  { nome: "Christopher Souza", email: "christopher.souza@nubank.com.br" },
  { nome: "Clarisse Barbosa", email: "clarisse.barbosa@nubank.com.br" },
  { nome: "Daniel Marques", email: "daniel.marques2@nubank.com.br" },
  { nome: "Daniel Pereira", email: "daniel.pereira@nubank.com.br" },
  { nome: "Danielle Mayer", email: "danielle.mayer@nubank.com.br" },
  { nome: "David Manriquez", email: "david.manriquez@nubank.com.br" },
  { nome: "Debora Fontoura", email: "debora.fontoura@nubank.com.br" },
  { nome: "Debora Silva", email: "debora.silva@nubank.com.br" },
  { nome: "Dennys Carvalho", email: "dennys.carvalho@nubank.com.br" },
  { nome: "Diego Maia", email: "diego.maia@nubank.com.br" },
  { nome: "Diego Rodrigues", email: "diego.rodrigues@nubank.com.br" },
  { nome: "Eduardo Fernando", email: "eduardo.fernando@nubank.com.br" },
  { nome: "Elisangela Valentim", email: "elisangela.valentim@nubank.com.br" },
  { nome: "Erika Nascimento", email: "erika.nascimento@nubank.com.br" },
  { nome: "Estefany Jonas", email: "estefany.jonas@nubank.com.br" },
  { nome: "Evandro Silva", email: "evandro.silva@nubank.com.br" },
  { nome: "Fabiola Farias", email: "fabiola.farias@nubank.com.br" },
  { nome: "Felipe Barbosa", email: "felipe.barbosasilva@nubank.com.br" },
  { nome: "Felipe Eiji", email: "felipe.eiji@nubank.com.br" },
  { nome: "Felipe Mauricio", email: "felipe.mauricio@nubank.com.br" },
  { nome: "Fernanda Costa", email: "fernanda.costa@nubank.com.br" },
  { nome: "Gabriela Souza", email: "gabriela.souza@nubank.com.br" },
  { nome: "Giancarlo Mendonça", email: "giancarlo.mendonca@nubank.com.br" },
  { nome: "Glaucia Lorenconi", email: "glaucia.lorenconi@nubank.com.br" },
  { nome: "Guilherme Braga", email: "guilherme.braga@nubank.com.br" },
  { nome: "Guilherme Sousa", email: "guilherme.sousa@nubank.com.br" },
  { nome: "Huan Lemos", email: "huan.lemos@nubank.com.br" },
  { nome: "Jair Linhares", email: "jair.linhares@nubank.com.br" },
  { nome: "Jefferson Silva", email: "jefferson.silva@nubank.com.br" },
  { nome: "Jeniffer Drielly", email: "jeniffer.drielly@nubank.com.br" },
  { nome: "Jennifer Assuncao", email: "jennifer.assuncao@nubank.com.br" },
  { nome: "Joao Morali", email: "joao.morali@nubank.com.br" },
  { nome: "Jose Barbosa", email: "jose.barbosa2@nubank.com.br" },
  { nome: "Juliana Pereira", email: "juliana.pereira@nubank.com.br" },
  { nome: "Karol Helena", email: "karol.helena@nubank.com.br" },
  { nome: "Kelvin Calisto", email: "kelvin.calisto@nubank.com.br" },
  { nome: "Kodara Bertolini", email: "kodara.bertolini@nubank.com.br" },
  { nome: "Lidiane Ayang", email: "lidiane.ayang@nubank.com.br" },
  { nome: "Livia Bezerra", email: "livia.bezerra@nubank.com.br" },
  { nome: "Luana Costa", email: "luana.costa@nubank.com.br" },
  { nome: "Marcel Botelho", email: "marcel.botelho@nubank.com.br" },
  { nome: "Marcella Ruggi", email: "marcella.ruggi@nubank.com.br" },
  { nome: "Maria Renata", email: "maria.renata@nubank.com.br" },
  { nome: "Mariana Foffa", email: "mariana.foffa@nubank.com.br" },
  { nome: "Marilena Levy", email: "marilena.levy@nubank.com.br" },
  { nome: "Marilia Cury", email: "marilia.cury@nubank.com.br" },
  { nome: "Marilia Pinto", email: "marilia.pinto@nubank.com.br" },
  { nome: "Marion Castro", email: "marion.castro@nubank.com.br" },
  { nome: "Marta Binza", email: "marta.binza@nubank.com.br" },
  { nome: "Mayara Passos", email: "mayara.passos@nubank.com.br" },
  { nome: "Micaele Costa", email: "micaele.costa@nubank.com.br" },
  { nome: "Natalia Dasan", email: "natalia.dasan@nubank.com.br" },
  { nome: "Nathalia Alcantara", email: "nathalia.alcantara@nubank.com.br" },
  { nome: "Patricia Sobral", email: "patricia.sobral@nubank.com.br" },
  { nome: "Priscila Benetti", email: "priscila.benetti@nubank.com.br" },
  { nome: "Raphael Fassizoli", email: "raphael.fassizoli@nubank.com.br" },
  { nome: "Raul Gomes", email: "raul.gomes@nubank.com.br" },
  { nome: "Roberta Almeida", email: "roberta.almeida@nubank.com.br" },
  { nome: "Roberta Monteiro", email: "roberta.monteiro@nubank.com.br" },
  { nome: "Rodrigo Gallo", email: "rodrigo.gallo@nubank.com.br" },
  { nome: "Rogério Lobato", email: "rogerio.lobato@nubank.com.br" },
  { nome: "Romario Melo", email: "romario.melo@nubank.com.br" },
  { nome: "Rute Miranda", email: "rute.miranda@nubank.com.br" },
  { nome: "Tamiris Cazumba", email: "tamiris.cazumba@nubank.com.br" },
  { nome: "Tatiane Barros", email: "tatiane.barros@nubank.com.br" },
  { nome: "Thaina Sousa", email: "thaina.sousa@nubank.com.br" },
  { nome: "Thais Souza", email: "thais.souza@nubank.com.br" },
  { nome: "Thatiane Santos", email: "thatiane.santos@nubank.com.br" },
  { nome: "Thays Auzier", email: "thays.auzier@nubank.com.br" },
  { nome: "Thiago Valentim", email: "thiago.valentim@nubank.com.br" },
  { nome: "Val Tubero", email: "val.tubero@nubank.com.br" },
  { nome: "Valquiria Macedo", email: "valquiria.macedo@nubank.com.br" },
  { nome: "Verena Hereda", email: "verena.hereda@nubank.com.br" },
  { nome: "Vinicius Fidelis", email: "vinicius.fidelis@nubank.com.br" },
  { nome: "Vinicius Mitev", email: "vinicius.mitev@nubank.com.br" },
  { nome: "Viviane Villas", email: "viviane.villas@nubank.com.br" },
];

// ══════════════════════════════════════════════════════════════
// 2. ESTADO
// ══════════════════════════════════════════════════════════════

let PROJETOS       = [];
let filterStatus   = "todos";
let activePageId   = "exec";

// ══════════════════════════════════════════════════════════════
// 3. HELPERS
// ══════════════════════════════════════════════════════════════

const ini   = n  => n.split(" ").map(x => x[0]).join("").slice(0, 2);
const rclr  = r  => r >= 70 ? "var(--gr)" : r >= 40 ? "var(--am)" : "var(--rd)";
const $     = id => document.getElementById(id);
const fmt   = v  => v === undefined || v === null || v === "" ? "—" : v;

function sbadge(s) {
  const m = { Iniciado:"bi", Prorrogado:"bp", Finalizado:"bf", Cancelado:"bc" };
  return `<span class="BDG ${m[s]||"ba"}">${s}</span>`;
}

function rbadge(r) {
  if (r === "success") return `<span class="RB rs"><i class="ti ti-circle-check"></i> Sucesso</span>`;
  if (r === "fail")    return `<span class="RB rf"><i class="ti ti-circle-x"></i> Não atingido</span>`;
  return `<span class="RB rp"><i class="ti ti-clock"></i> Em apuração</span>`;
}

function saudeBadge(s) {
  const m = {
    no_prazo: '<span style="color:var(--gr);font-size:11px;font-weight:500">🟢 No prazo</span>',
    em_risco: '<span style="color:var(--am);font-size:11px;font-weight:500">🟡 Em risco</span>',
    bloqueado:'<span style="color:var(--rd);font-size:11px;font-weight:500">🔴 Bloqueado</span>',
  };
  return m[s] || m.no_prazo;
}

function nextId() {
  const n = PROJETOS.length + 1;
  return "PROJ-" + String(n).padStart(3, "0");
}

function emptyState(msg) {
  return `<div style="text-align:center;padding:40px 20px;color:var(--i3)">
    <div style="font-size:32px;margin-bottom:12px">📋</div>
    <div style="font-size:14px;font-weight:500;color:var(--ink);margin-bottom:6px">${msg}</div>
    <div style="font-size:12px">Clique em <strong>Novo Projeto</strong> para começar</div>
  </div>`;
}

// ══════════════════════════════════════════════════════════════
// 4. NAVEGAÇÃO
// ══════════════════════════════════════════════════════════════

const PAGE_TITLES = {
  exec:"Visão Executiva", proj:"Todos os projetos",
  lider:"Visão por Líder", novo:"Novo Projeto",
  cal:"Agendar Reunião", dados:"Dados & Histórico", org:"Organograma NuCel"
};

function clearNav() {
  document.querySelectorAll(".NI").forEach(n => n.classList.remove("on"));
  document.querySelectorAll(".SNI").forEach(n => n.classList.remove("on"));
}

function showPage(id) {
  document.querySelectorAll(".PG").forEach(p => p.classList.remove("on"));
  const el = $("pg-" + id);
  if (el) el.classList.add("on");
  activePageId = id;
}

function pg(id, el) {
  clearNav();
  if (el) el.classList.add("on");
  showPage(id);
  $("ptitle").textContent = PAGE_TITLES[id] || id;
  if (id === "proj")  renderProjetos();
  if (id === "exec")  renderExec();
  if (id === "cal")   { populateCalProjetos(); updateCalUI(); }
  if (id === "novo")  populateNovoForm();
}

function goLider(nome, sniEl) {
  clearNav();
  if (sniEl) sniEl.classList.add("on");
  $("subnav-lider").classList.add("open");
  $("ni-lider-toggle").classList.add("exp");
  showPage("lider");
  $("ptitle").textContent = nome;
  renderLider(nome);
}

function toggleLiderMenu(el) {
  $("subnav-lider").classList.toggle("open");
  el.classList.toggle("exp");
}

function buildLiderSubmenu() {
  $("subnav-lider").innerHTML = LIDERES.map((l, i) =>
    `<div class="SNI" onclick="goLider('${l.nome}',this)" id="sni-${i}">
       <div class="SMAV">${ini(l.nome)}</div>
       <span style="flex:1">${l.nome}</span>
       <span style="font-size:9px;color:var(--i3);flex-shrink:0">${l.cluster}</span>
     </div>`
  ).join("");
}

// ══════════════════════════════════════════════════════════════
// 5. EXECUTIVA
// ══════════════════════════════════════════════════════════════

let execFilter = "todos";

function updateKPIs() {
  const total   = PROJETOS.length;
  const wip     = PROJETOS.filter(p => ["Iniciado","Prorrogado"].includes(p.status)).length;
  const succ    = PROJETOS.filter(p => p.result === "success").length;
  const fin     = PROJETOS.filter(p => p.result !== "pending").length;
  const pct     = fin > 0 ? Math.round(succ / fin * 100) : 0;

  $("kt").textContent        = total || "—";
  $("cnt").textContent       = total;
  $("ks-pct").textContent    = fin > 0 ? pct + "%" : "—";
  $("ks-wip").textContent    = wip || "—";
  $("ks-lid").textContent    = LIDERES.filter(l => l.step === "M1").length;
  $("ks-total").textContent  = total > 0 ? `${total} projetos cadastrados` : "Nenhum projeto ainda";
  $("ks-sub").textContent    = fin > 0 ? `${succ} de ${fin} metas atingidas` : "Aguardando projetos";
  $("ks-wip-sub").textContent = wip > 0 ? `${wip} projetos ativos` : "Nenhum ativo";
  $("exec-sub").textContent  = "NuCel Pro Tracker · " +
    new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

function renderExec(f) {
  if (f) execFilter = f;
  updateKPIs();

  if (PROJETOS.length === 0) {
    $("eg").innerHTML = `<div style="grid-column:1/-1">${emptyState("Nenhum projeto cadastrado ainda")}</div>`;
    return;
  }

  const lm = {};
  PROJETOS.forEach(p => {
    if (execFilter !== "todos" && p.status !== execFilter) return;
    if (!lm[p.lider]) lm[p.lider] = { p:[], s:0, t:0 };
    lm[p.lider].p.push(p);
    lm[p.lider].t++;
    if (p.result === "success") lm[p.lider].s++;
  });

  if (!Object.keys(lm).length) {
    $("eg").innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--i3);font-size:12px">Nenhum projeto com este status</div>`;
    return;
  }

  $("eg").innerHTML = Object.entries(lm).map(([nome, d]) => {
    const r   = d.t > 0 ? Math.round(d.s / d.t * 100) : 0;
    const c   = rclr(r);
    const ldr = LIDERES.find(l => l.nome === nome);
    const rows = d.p.map(p =>
      `<div class="MP" onclick="openDetalhe('${p.id}')" style="cursor:pointer">
         <div style="flex:1;min-width:0">
           <div class="MTL">${p.title}</div>
           <div class="MMT">${p.meta} · target ${p.target}${p.impacto_cliente === "Sim" ? " · 👥 Clientes" : ""}</div>
         </div>
         <div style="display:flex;align-items:center;gap:3px;flex-shrink:0">
           ${sbadge(p.status)}${rbadge(p.result)}
         </div>
       </div>`
    ).join("");

    return `<div class="EC">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
        <div class="MAV" style="width:32px;height:32px;font-size:11px;margin:0;font-weight:700">${ini(nome)}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:600;color:var(--ink)">${nome}</div>
          <div style="font-size:10px;color:var(--i6)">${ldr ? ldr.step+" · "+ldr.cluster : "M1"}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:15px;font-weight:700;color:${c}">${r}%</div>
          <div style="font-size:9px;color:var(--i3)">SUCESSO</div>
        </div>
      </div>
      <div class="LB"><div class="LBF" style="width:${r}%;background:${c}"></div></div>
      <div style="font-size:10px;color:var(--i3);margin:5px 0 9px">${d.t} projeto${d.t!==1?"s":""} · ${d.s} atingido${d.s!==1?"s":""}</div>
      <div style="border-top:1px solid var(--s3);padding-top:7px">${rows}</div>
    </div>`;
  }).join("");
}

function fe(f, btn) {
  document.querySelectorAll(".SH .FB").forEach(x => x.classList.remove("on"));
  btn.classList.add("on");
  renderExec(f);
}

// ══════════════════════════════════════════════════════════════
// 6. PROJETOS
// ══════════════════════════════════════════════════════════════

function renderProjetos() {
  const d = filterStatus === "todos" ? PROJETOS : PROJETOS.filter(p => p.status === filterStatus);

  if (d.length === 0) {
    $("ptb").innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--i3)">
      ${PROJETOS.length === 0 ? "Nenhum projeto — clique em Novo Projeto" : "Nenhum projeto com este status"}
    </td></tr>`;
    return;
  }

  $("ptb").innerHTML = d.map(p => `<tr onclick="openDetalhe('${p.id}')" style="cursor:pointer">
    <td>
      <div class="PT">${p.title}</div>
      <div class="PM">${p.cluster} · ${p.queue || "—"}</div>
    </td>
    <td><div style="display:flex;align-items:center;gap:4px">
      <div class="MAV">${ini(p.lider)}</div>
      <span style="color:var(--i6)">${p.lider.split(" ")[0]}</span>
    </div></td>
    <td>${sbadge(p.status)}</td>
    <td>${saudeBadge(p.saude)}</td>
    <td><div style="font-size:11px;color:var(--ink)">${p.meta}</div></td>
    <td style="font-weight:500;color:var(--ink)">${fmt(p.baseline)}</td>
    <td style="font-weight:500;color:var(--ink)">${fmt(p.target)}</td>
    <td style="font-weight:600;color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"}">${fmt(p.real)}</td>
    <td>${rbadge(p.result)}</td>
  </tr>`).join("");
}

function fp(f, btn) {
  document.querySelectorAll("#sf .FB").forEach(x => x.classList.remove("on"));
  btn.classList.add("on");
  filterStatus = f;
  renderProjetos();
}

// ══════════════════════════════════════════════════════════════
// 7. POR LÍDER
// ══════════════════════════════════════════════════════════════

function renderLider(filtro) {
  const lm = {};
  PROJETOS.forEach(p => {
    if (filtro && filtro !== "todos" && p.lider !== filtro) return;
    if (!lm[p.lider]) lm[p.lider] = [];
    lm[p.lider].push(p);
  });

  $("lider-title").textContent = filtro && filtro !== "todos" ? filtro : "Todos os líderes";
  $("lider-sub").textContent   = filtro && filtro !== "todos"
    ? `${PROJETOS.filter(p => p.lider === filtro).length} projetos de ${filtro}`
    : "Clique no nome do líder para expandir";

  const source = Object.keys(lm).length > 0
    ? Object.entries(lm)
    : LIDERES.filter(l => !filtro || filtro === "todos" || l.nome === filtro).map(l => [l.nome, []]);

  $("lc").innerHTML = source.map(([nome, ps], i) => {
    const s   = ps.filter(p => p.result === "success").length;
    const r   = ps.length > 0 ? Math.round(s / ps.length * 100) : 0;
    const c   = ps.length > 0 ? rclr(r) : "var(--i3)";
    const ldr = LIDERES.find(l => l.nome === nome);
    const auto = filtro && filtro !== "todos" ? "open" : "";
    const id  = "acc" + i;

    const rows = ps.length === 0
      ? `<div style="text-align:center;padding:16px;color:var(--i3);font-size:12px">Nenhum projeto cadastrado</div>`
      : `<table><thead><tr><th>Projeto</th><th>Status</th><th>Saúde</th><th>Baseline</th><th>Target</th><th>Real</th><th>Resultado</th></tr></thead><tbody>
          ${ps.map(p => `<tr onclick="openDetalhe('${p.id}')" style="cursor:pointer">
            <td><div class="PT">${p.title}</div><div class="PM">${p.meta}</div></td>
            <td>${sbadge(p.status)}</td>
            <td>${saudeBadge(p.saude)}</td>
            <td style="color:var(--i6)">${fmt(p.baseline)}</td>
            <td style="font-weight:500;color:var(--ink)">${fmt(p.target)}</td>
            <td style="font-weight:600;color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"}">${fmt(p.real)}</td>
            <td>${rbadge(p.result)}</td>
          </tr>`).join("")}
         </tbody></table>`;

    return `<div class="ACC ${auto}" id="${id}">
      <div class="ACCH" onclick="togAcc('${id}')">
        <div style="display:flex;align-items:center;gap:9px">
          <div class="MAV" style="width:32px;height:32px;font-size:12px;margin:0;font-weight:700;flex-shrink:0">${ini(nome)}</div>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--ink)">${nome}</div>
            <div style="font-size:11px;color:var(--i6);margin-top:1px">${ldr ? ldr.step+" · "+ldr.cluster+" · " : ""}${ps.length} projeto${ps.length!==1?"s":""}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:10px">
          ${ps.length > 0 ? `<div style="text-align:right">
            <div style="font-size:16px;font-weight:700;color:${c}">${r}%</div>
            <div style="font-size:9px;color:var(--i3);text-transform:uppercase">sucesso</div>
          </div>` : ""}
          <i class="ti ti-chevron-down ACHV"></i>
        </div>
      </div>
      <div class="ACCB">${rows}</div>
    </div>`;
  }).join("");
}

function togAcc(id) { $(id).classList.toggle("open"); }

// ══════════════════════════════════════════════════════════════
// 8. DETALHE DO PROJETO (One-pager)
// ══════════════════════════════════════════════════════════════

let chartInstance = null;

function openDetalhe(id) {
  const p = PROJETOS.find(x => x.id === id);
  if (!p) return;

  const ldr = LIDERES.find(l => l.nome === p.lider);
  const integrantes = p.integrantes ? p.integrantes.split(",").map(e => e.trim()) : [];

  $("detalhe-content").innerHTML = `
    <div class="DT-HEADER">
      <div style="flex:1">
        <div class="DT-TITLE">${p.title}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap">
          ${sbadge(p.status)} ${saudeBadge(p.saude)} ${rbadge(p.result)}
          ${p.impacto_cliente === "Sim" ? `<span class="BDG" style="background:#FFF3E0;color:#8A4500">👥 ${p.volume_cliente || "?"} clientes</span>` : ""}
        </div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        ${p.drive ? `<a href="${p.drive}" target="_blank" class="BG" style="font-size:11px;padding:5px 10px;text-decoration:none"><i class="ti ti-external-link"></i> Drive</a>` : ""}
        <button class="BG" style="font-size:11px;padding:5px 10px" onclick="printDetalhe()"><i class="ti ti-printer"></i> Imprimir</button>
      </div>
    </div>

    <div class="DT-GRID">
      <div class="DT-CARD">
        <div class="DT-LABEL">Líder</div>
        <div class="DT-VALUE" style="display:flex;align-items:center;gap:7px">
          <div class="MAV" style="width:26px;height:26px;font-size:9px;margin:0;font-weight:700">${ini(p.lider)}</div>
          ${p.lider}
        </div>
        <div style="font-size:10px;color:var(--i6);margin-top:2px">${ldr ? ldr.step+" · "+ldr.cluster : ""}</div>
      </div>
      <div class="DT-CARD">
        <div class="DT-LABEL">Cluster</div>
        <div class="DT-VALUE">${p.cluster}</div>
      </div>
      <div class="DT-CARD">
        <div class="DT-LABEL">Semana de entrega</div>
        <div class="DT-VALUE">${p.semana || "—"}</div>
      </div>
      <div class="DT-CARD">
        <div class="DT-LABEL">Queue(s)</div>
        <div class="DT-VALUE" style="font-size:11px">${p.queues || p.queue || "—"}</div>
      </div>
    </div>

    <div class="DT-METRICS">
      <div class="DT-MET-CARD">
        <div class="DT-LABEL">Métrica</div>
        <div class="DT-VALUE">${p.meta}</div>
      </div>
      <div class="DT-MET-CARD">
        <div class="DT-LABEL">Baseline</div>
        <div class="DT-VALUE" style="color:var(--i6)">${fmt(p.baseline)}</div>
      </div>
      <div class="DT-MET-CARD">
        <div class="DT-LABEL">Target</div>
        <div class="DT-VALUE" style="color:var(--nu);font-weight:700">${fmt(p.target)}</div>
      </div>
      <div class="DT-MET-CARD">
        <div class="DT-LABEL">Real atual</div>
        <div class="DT-VALUE" style="color:${p.real==="—"?"var(--i3)":p.result==="success"?"var(--gr)":"var(--rd)"};font-weight:700">${fmt(p.real)}</div>
      </div>
    </div>

    ${integrantes.length > 0 ? `
    <div style="margin:16px 0 6px;font-size:11px;font-weight:600;color:var(--i3);text-transform:uppercase;letter-spacing:.06em">Integrantes</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${integrantes.map(e => `<span style="background:var(--nubg);color:var(--nu);font-size:11px;padding:3px 10px;border-radius:100px">${e.split("@")[0]}</span>`).join("")}
    </div>` : ""}

    <div style="margin:16px 0 8px;font-size:11px;font-weight:600;color:var(--i3);text-transform:uppercase;letter-spacing:.06em">Evolução semanal da métrica</div>
    <div style="background:var(--s2);border-radius:12px;padding:16px;position:relative">
      ${p.db_table && p.db_table !== "manual"
        ? `<div id="chart-loading" style="text-align:center;padding:20px;color:var(--i3);font-size:12px">
             <i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Carregando dados do Databricks...
           </div>`
        : ""}
      <canvas id="metricChart" height="200"></canvas>
      ${p.db_table && p.db_table !== "manual"
        ? `<button class="BG" style="font-size:10px;padding:4px 9px;margin-top:8px" onclick="refreshChart('${p.id}')">
             <i class="ti ti-refresh"></i> Atualizar
           </button>`
        : ""}
    </div>
  `;

  $("modal-detalhe").classList.add("open");

  // Renderiza gráfico
  setTimeout(() => {
    if (p.db_table && p.db_table !== "manual") {
      loadChartData(p);
    } else {
      renderChart(p.id, getMockChartData(p));
    }
  }, 100);
}

function getMockChartData(p) {
  const semanas = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    semanas.push({
      semana: d.toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit" }),
      valor:  parseFloat((Math.random() * 20 + 60).toFixed(1)),
      volume: Math.floor(80 + Math.random() * 40)
    });
  }
  return semanas;
}

async function loadChartData(p) {
  try {
    const r = await fetch("/api/databricks/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ table: p.db_table, queue: p.queue, channels: p.channels || [], weeks: 8 })
    });
    const data = await r.json();
    const rows = data.mock ? getMockChartData(p) : (data.rows || []);  // BUG 6 FIX
    $("chart-loading") && ($("chart-loading").style.display = "none");
    renderChart(p.id, rows.map(row => ({
      semana: new Date(row.semana).toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit" }),
      valor:  parseFloat(row.valor),
      volume: parseInt(row.volume)
    })));
  } catch(e) {
    $("chart-loading") && ($("chart-loading").style.display = "none");
    renderChart(p.id, getMockChartData(p));
  }
}

function renderChart(projId, data) {
  const canvas = $("metricChart");
  if (!canvas) return;

  const p      = PROJETOS.find(x => x.id === projId);
  const target = parseFloat(p?.target) || null;

  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  const isDark  = document.getElementById("R").getAttribute("data-theme") === "dark";
  const textClr = isDark ? "#C9A8E0" : "#5E4675";
  const gridClr = isDark ? "#3D1A5C" : "#E4D9EF";

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels: data.map(d => d.semana),
      datasets: [
        {
          label: p?.meta || "Métrica",
          data: data.map(d => d.valor),
          borderColor: "#8A05BE",
          backgroundColor: "rgba(138,5,190,0.08)",
          borderWidth: 2,
          pointBackgroundColor: "#8A05BE",
          pointRadius: 4,
          tension: 0.3,
          fill: true
        },
        ...(target ? [{
          label: "Target",
          data: data.map(() => target),
          borderColor: "#00B894",
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }] : [])
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: textClr, font: { family:"DM Sans", size:11 } } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}` } }
      },
      scales: {
        x: { ticks: { color: textClr, font: { size:10 } }, grid: { color: gridClr } },
        y: { ticks: { color: textClr, font: { size:10 } }, grid: { color: gridClr } }
      }
    }
  });
}

async function refreshChart(projId) {
  const p = PROJETOS.find(x => x.id === projId);
  if (p) await loadChartData(p);
}

function closeDetalhe() {
  $("modal-detalhe").classList.remove("open");
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
}

function printDetalhe() {
  window.print();
}

// ══════════════════════════════════════════════════════════════
// 9. NOVO PROJETO
// ══════════════════════════════════════════════════════════════

function populateNovoForm() {
  // Líderes
  $("nL").innerHTML = `<option value="">Selecionar...</option>` +
    LIDERES.map(l => `<option value="${l.nome}">${l.nome} · ${l.step} ${l.cluster}</option>`).join("");

  // Impactos (ex-Clusters)
  $("nC").innerHTML = `<option value="">Selecionar...</option>` +
    IMPACTOS.map(c => `<option value="${c}">${c}</option>`).join("");

  // Métricas
  $("nM").innerHTML = `<option value="">Selecionar...</option>` +
    METRICAS.map(m => `<option value="${m}">${m}</option>`).join("");

  // Tabelas Databricks
  $("nDB").innerHTML = `<option value="">Não mensurado via Databricks</option>` +
    DB_TABLES.map(t => `<option value="${t.value}">${t.label}</option>`).join("");

  // Queues chips
  $("qc").innerHTML = QUEUES.map(q =>
    `<span class="CH" onclick="tc(this)">${q}</span>`
  ).join("");

  // Integrantes — searchable checkboxes
  renderIntegrantesSearch("");
}

function tc(el) { el.classList.toggle("on"); }

function toggleImpacto(val) {
  $("volume-row").style.display = val === "Sim" ? "block" : "none";
}

function sv(e) {
  if (e) e.preventDefault();
  const t = $("nT").value.trim();
  const l = $("nL").value;
  if (!t || !l) { alert("Preencha título e líder."); return; }

  const qs = Array.from(document.querySelectorAll("#qc .CH.on")).map(x => x.textContent.trim());
  const intArray = Array.from($("nINT").selectedOptions).map(o => o.value);

  const newProj = {
    id:             nextId(),
    title:          t,
    meta:           $("nM").value || "A definir",
    lider:          l,
    cluster:        $("nC").value || "—",
    queue:          qs[0] || "—",
    queues:         qs.join(", "),
    job:            $("nJ").value || "—",
    status:         $("nSt").value,
    saude:          "no_prazo",
    target:         $("nTg").value || "—",
    baseline:       $("nBL").value || "—",
    real:           "—",
    result:         "pending",
    semana:         $("nW").value || "—",
    impacto_cliente:$("nIC").value,
    volume_cliente: $("nVC").value || "",
    db_table:       $("nDB").value || "",
    integrantes:    intArray.join(","),
    drive:          $("nD").value || "",
    historico:      ""
  };

  try {
    PROJETOS.push(newProj);
    buildLiderSubmenu();
    updateKPIs();
    renderExec();
    saveToSheets(newProj);
    notifySlack("novo_projeto", newProj);

    const moEl = $("mo");
    if (!moEl) throw new Error("Modal #mo não encontrado no HTML");

    $("mdet").innerHTML =
      `<b style="color:var(--ink)">Projeto:</b> ${newProj.title}<br>
       <b style="color:var(--ink)">Líder:</b> ${newProj.lider}<br>
       <b style="color:var(--ink)">Métrica:</b> ${newProj.meta} · Target: ${newProj.target}<br>
       <b style="color:var(--ink)">Impacto clientes:</b> ${newProj.impacto_cliente === "Sim" ? `Sim · ${newProj.volume_cliente || "—"}` : "Não"}<br>
       <b style="color:var(--ink)">Queues:</b> ${newProj.queues || "—"}`;

    moEl.classList.add("open");
    $("formNovo").reset();
    document.querySelectorAll("#qc .CH.on").forEach(x => x.classList.remove("on"));
    const volRow = $("volume-row");
    if (volRow) volRow.style.display = "none";
    const driveSug = $("drive-suggestions");
    if (driveSug) driveSug.style.display = "none";
    const driveDocs = $("drive-docs");
    if (driveDocs) driveDocs.style.display = "none";
    renderIntegrantesSearch("");
  } catch(err) {
    console.error("Erro ao salvar projeto:", err);
    alert("Erro ao salvar: " + err.message + "\n\nAbra o console (F12) para mais detalhes.");
    // Remove projeto que foi adicionado antes do erro
    PROJETOS.pop();
  }
}

function closeMo() {
  $("mo").classList.remove("open");
  pg("proj", null);
  renderProjetos();
}


function renderIntegrantesSearch(q) {
  const filtered = q
    ? MEMBROS_NUCEL.filter(m => m.nome.toLowerCase().includes(q.toLowerCase()))
    : MEMBROS_NUCEL;
  const container = $("integrantes-list");
  if (!container) return;
  // Preserve current checked state
  const checked = new Set(
    Array.from(document.querySelectorAll("#integrantes-list input:checked")).map(i => i.value)
  );
  container.innerHTML = filtered.map(m =>
    `<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;transition:background .12s;${checked.has(m.email) ? 'background:var(--nubg)' : ''}">
       <input type="checkbox" value="${m.email}" data-nome="${m.nome}" ${checked.has(m.email) ? 'checked' : ''}
         style="width:15px;height:15px;accent-color:var(--nu);flex-shrink:0;cursor:pointer">
       <span style="font-size:12px;font-weight:500;color:var(--ink);flex:1">${m.nome}</span>
       <span style="font-size:10px;color:var(--i3);flex-shrink:0">${m.email.split("@")[0]}</span>
     </label>`
  ).join("");
  // Add hover effect via event delegation
  container.querySelectorAll("label").forEach(l => {
    l.addEventListener("mouseenter", () => { if (!l.querySelector("input").checked) l.style.background = "var(--s2)"; });
    l.addEventListener("mouseleave", () => { if (!l.querySelector("input").checked) l.style.background = ""; });
    l.querySelector("input").addEventListener("change", e => {
      l.style.background = e.target.checked ? "var(--nubg)" : "";
    });
  });
}

function getSelectedIntegrantes() {
  return Array.from(document.querySelectorAll('#integrantes-list input:checked'))
    .map(i => i.value).join(",");
}

async function suggestFromDrive() {
  const url = $("nD").value.trim();
  if (!url) { alert("Cole o link do Drive primeiro!"); return; }

  const btn        = $("btn-suggest");
  const suggestBox = $("drive-suggestions");
  const listEl     = $("suggestions-list");

  btn.innerHTML = '<i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Lendo documento...';
  btn.disabled  = true;
  suggestBox.style.display = "none";

  try {
    const r    = await fetch("/api/drive-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "suggest_tasks", url })
    });
    const data = await r.json();

    suggestBox.style.display = "block";

    // Erro do servidor (doc não compartilhado, URL inválida etc)
    if (data.error) {
      listEl.innerHTML = `
        <div style="padding:10px;background:var(--w);border-radius:8px;border:1px solid var(--bd)">
          <div style="font-size:12px;font-weight:500;color:var(--rd);margin-bottom:6px">⚠️ ${data.error}</div>
          <div style="font-size:11px;color:var(--i6)">Para corrigir, compartilhe o documento com:</div>
          <div style="font-size:11px;font-weight:500;color:var(--nu);margin-top:4px;word-break:break-all">
            nucel-tracker@nucel-pro-tracker.iam.gserviceaccount.com
          </div>
          <div style="font-size:10px;color:var(--i3);margin-top:4px">
            Drive → Compartilhar → colar o e-mail acima → Leitor → Pronto
          </div>
        </div>`;
      return;
    }

    // Sucesso
    if (data.tarefas?.length > 0) {
      listEl.innerHTML =
        `<div style="font-size:10px;font-weight:600;color:var(--nu);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">
           ✨ Tarefas de: <em style="font-weight:400;text-transform:none">${data.title || "documento"}</em>
         </div>` +
        data.tarefas.map(t =>
          `<label style="display:flex;align-items:flex-start;gap:8px;padding:6px 8px;border-radius:7px;cursor:pointer;font-size:12px;color:var(--i6)">
             <input type="checkbox" value="${t.replace(/"/g,'&quot;')}" onchange="addTaskFromSuggestion(this)"
               style="width:14px;height:14px;accent-color:var(--nu);flex-shrink:0;margin-top:1px">
             <span style="flex:1">${t}</span>
           </label>`
        ).join("");
    } else {
      listEl.innerHTML = `<div style="font-size:12px;color:var(--i3);padding:8px">Nenhuma tarefa sugerida — tente com um documento mais detalhado.</div>`;
    }

  } catch(e) {
    suggestBox.style.display = "block";
    listEl.innerHTML = `<div style="font-size:12px;color:var(--rd);padding:8px">Erro de conexão: ${e.message}</div>`;
  } finally {
    btn.innerHTML = '<i class="ti ti-sparkles"></i> Sugerir tarefas com IA';
    btn.disabled  = false;
  }
}

async function searchDriveDocs() {
  const titulo = $("nT").value.trim();
  const query  = titulo || "nucel";
  const btn    = $("btn-search-drive");
  btn.innerHTML = '<i class="ti ti-loader" style="animation:spin 1s linear infinite"></i>';
  btn.disabled  = true;
  try {
    const r = await fetch("/api/drive-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "search_docs", query })
    });
    const data = await r.json();
    if (data.docs?.length > 0) {
      $("drive-docs-list").innerHTML = data.docs.map(d =>
        `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--s3)">
           <i class="ti ti-file-text" style="color:var(--nu);font-size:14px"></i>
           <span style="flex:1;font-size:12px;color:var(--ink)">${d.name}</span>
           <button class="BG" style="font-size:10px;padding:3px 8px" onclick="$('nD').value='${d.webViewLink}';$('drive-docs').style.display='none'">Usar</button>
         </div>`
      ).join("");
      $("drive-docs").style.display = "block";
    } else {
      alert("Nenhum documento encontrado no Drive para: " + query);
    }
  } catch(e) { console.error(e); }
  finally { btn.innerHTML = '<i class="ti ti-search"></i>'; btn.disabled = false; }
}

function addTaskFromSuggestion(el) {
  if (!el.checked) return;
  const current = $("nTk") ? $("nTk").value : "";
  if ($("nTk")) $("nTk").value = (current ? current + "\n" : "") + "- " + el.value;
  el.parentElement.style.opacity = "0.5";
  el.disabled = true;
}


// ══════════════════════════════════════════════════════════════
// 11. PERFIL DO USUÁRIO
// ══════════════════════════════════════════════════════════════

function updateUserProfile(name, email) {
  const nameEl   = $("user-name");
  const emailEl  = $("user-email");
  const avatarEl = $("user-avatar");
  if (!nameEl) return;

  // Salva localmente
  try {
    localStorage.setItem("user_name",  name);
    localStorage.setItem("user_email", email);
  } catch(e) {}

  // Exibe nome e iniciais
  const parts    = name.split(" ");
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length-1][0]
    : name.slice(0,2);

  nameEl.textContent  = name;
  emailEl.textContent = email;
  if (avatarEl) avatarEl.textContent = initials.toUpperCase();
}

async function fetchUserProfile(accessToken) {
  try {
    const r = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!r.ok) return;
    const d = await r.json();
    if (d.name && d.email) updateUserProfile(d.name, d.email);
  } catch(e) { /* silently skip */ }
}

function loadSavedUserProfile() {
  try {
    const name  = localStorage.getItem("user_name");
    const email = localStorage.getItem("user_email");
    if (name && email) updateUserProfile(name, email);
  } catch(e) {}
}

// ══════════════════════════════════════════════════════════════
// 10. GOOGLE CALENDAR — OAuth + Freebusy + Create Event
// ══════════════════════════════════════════════════════════════

const CLIENT_ID    = "39612844400-vdn5ve2ajrlu7nd22cuoe9a34m0cun6t.apps.googleusercontent.com";
const REDIRECT_URI = window.location.origin + "/api/auth/callback";

const calStore = {
  getToken:    ()    => { try { return localStorage.getItem("cal_token"); } catch(e) { return null; } },
  setToken:    (t,e) => { try { localStorage.setItem("cal_token",t); localStorage.setItem("cal_exp",e); } catch(e2) {} },
  isAuthed:    ()    => { try { return !!localStorage.getItem("cal_token") && Date.now() < parseInt(localStorage.getItem("cal_exp")||0); } catch(e) { return false; } },
  getRefresh:  ()    => { try { return localStorage.getItem("cal_refresh"); } catch(e) { return null; } },
  setRefresh:  r     => { try { localStorage.setItem("cal_refresh",r); } catch(e) {} }
};

function updateCalUI() {
  const authed = calStore.isAuthed();
  const authDiv = $("cal-auth");
  const formDiv = $("cal-form");
  if (authDiv) authDiv.style.display = authed ? "none" : "block";
  if (formDiv) { formDiv.style.opacity = authed ? "1" : "0.5"; formDiv.style.pointerEvents = authed ? "auto" : "none"; }
}

function startOAuth() {
  const url = "https://accounts.google.com/o/oauth2/v2/auth?" + new URLSearchParams({
    client_id: CLIENT_ID, redirect_uri: REDIRECT_URI,
    response_type: "code", scope: "https://www.googleapis.com/auth/calendar",
    access_type: "offline", prompt: "consent"
  });
  window.location.href = url;
}

async function handleOAuthCallback() {
  const code = new URLSearchParams(window.location.search).get("code");
  if (!code) return;
  try {
    const r = await fetch("/api/auth/token", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }) });
    const d = await r.json();
    if (d.access_token) {
      calStore.setToken(d.access_token, Date.now() + d.expires_in * 1000);
      if (d.refresh_token) calStore.setRefresh(d.refresh_token);
      await fetchUserProfile(d.access_token); // Busca nome do usuário
    }
  } catch(e) { console.error("OAuth callback:", e); }
  window.history.replaceState({}, "", "/");
  pg("cal", null);
}

async function refreshCalToken() {
  const rt = calStore.getRefresh();
  if (!rt) return false;
  try {
    const r = await fetch("/api/auth/refresh", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ refresh_token: rt }) });
    const d = await r.json();
    if (d.access_token) { calStore.setToken(d.access_token, Date.now() + d.expires_in * 1000); return true; }
  } catch(e) {}
  return false;
}

function populateCalProjetos() {
  $("calP").innerHTML = `<option value="">Selecionar projeto...</option>` +
    PROJETOS.map(p => `<option value="${p.id}">${p.title} · ${p.lider}</option>`).join("");
}

async function showSlots() {
  const val  = $("calP").value;
  const wrap = $("calSlots");
  if (!val) { wrap.style.display = "none"; return; }
  wrap.style.display = "block";

  const p   = PROJETOS.find(x => x.id === val);
  const ldr = LIDERES.find(l => l.nome === p?.lider);
  if ($("calMembers") && ldr) {
    $("calMembers").innerHTML = `<div class="MAV" style="margin-right:0">${ini(ldr.nome)}</div>
      <span style="margin-left:8px;color:var(--i6)"><strong style="color:var(--ink)">${p.title}</strong> · ${ldr.nome}</span>`;
  }

  if (!calStore.isAuthed()) {
    if (!(await refreshCalToken())) { updateCalUI(); return; }
  }

  $("calLoading").style.display    = "block";
  $("calSlotsResult").style.display = "none";
  $("calEmpty").style.display      = "none";

  try {
    const now   = new Date();
    const next5 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const emails = ldr ? [ldr.email] : [];

    const r = await fetch("/api/calendar/freebusy", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${calStore.getToken()}` },
      body: JSON.stringify({ emails, timeMin: now.toISOString(), timeMax: next5.toISOString() })
    });
    const data = await r.json();
    $("calLoading").style.display = "none";

    if (data.slots?.length > 0) {
      $("slotsList").innerHTML = data.slots.map(s =>
        `<div class="CAL-CARD" onclick="createEvent('${val}','${s.start}','${s.end}')">
          <div><div class="cdt">${s.label}</div><div class="cfree">✓ Disponível · clique para criar convite com Meet</div></div>
          <i class="ti ti-calendar-plus" style="color:var(--nu)"></i>
        </div>`
      ).join("");
      $("calSlotsResult").style.display = "block";
    } else {
      $("calEmpty").style.display = "block";
    }
  } catch(e) {
    $("calLoading").style.display = "none";
    console.error("Freebusy:", e);
  }
}

async function createEvent(projId, start, end) {
  if (!calStore.isAuthed()) return;
  const p   = PROJETOS.find(x => x.id === projId);
  const ldr = LIDERES.find(l => l.nome === p?.lider);
  if (!p || !ldr) return;
  try {
    const r = await fetch("/api/calendar/event", {
      method:"POST",
      headers:{ "Content-Type":"application/json", Authorization:`Bearer ${calStore.getToken()}` },
      body: JSON.stringify({
        title: p.title, start, end, emails: [ldr.email],
        description: `Projeto: ${p.title}\nLíder: ${p.lider}\nMétrica: ${p.meta} · Target: ${p.target}\n\nhttps://nucel-pro-tracker.vercel.app`
      })
    });
    const data = await r.json();
    if (data.ok) {
      $("cal-success-info").textContent = `Convite criado para ${ldr.email}`;
      const ml = $("cal-meet-link");
      if (data.meetLink) { ml.href = data.meetLink; ml.style.display = "inline-flex"; }
      else ml.style.display = "none";
      $("cal-success").style.display = "block";
    }
  } catch(e) { console.error("Create event:", e); }
}

// ══════════════════════════════════════════════════════════════
// 12. SLACK
// ══════════════════════════════════════════════════════════════

async function notifySlack(type, projeto) {
  try {
    await fetch("/api/notify", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ type, projeto })
    });
  } catch(e) { /* silently skip */ }
}

// ══════════════════════════════════════════════════════════════
// 13. GOOGLE SHEETS
// ══════════════════════════════════════════════════════════════

async function loadProjetos() {
  try {
    const r = await fetch("/api/projetos");
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        PROJETOS = data;
        buildLiderSubmenu();
        renderExec();
        renderProjetos();
        updateKPIs();
      }
    }
  } catch(e) { /* use local state */ }
}

async function saveToSheets(p) {
  try {
    await fetch("/api/projetos", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify(p)
    });
  } catch(e) { /* silently skip */ }
}

// ══════════════════════════════════════════════════════════════
// 14. TEMA
// ══════════════════════════════════════════════════════════════

function thm() {
  const R    = $("R");
  const dark = R.getAttribute("data-theme") === "dark";
  R.setAttribute("data-theme", dark ? "light" : "dark");
  $("tth").textContent = dark ? "☀️" : "🌙";
  try { localStorage.setItem("nucel-theme", dark ? "light" : "dark"); } catch(e) {}
}

// ══════════════════════════════════════════════════════════════
// 15. INIT
// ══════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  // Restaurar tema
  try {
    if (localStorage.getItem("nucel-theme") === "dark") {
      $("R").setAttribute("data-theme", "dark");
      $("tth").textContent = "🌙";
    }
  } catch(e) {}

  buildLiderSubmenu();
  renderExec();
  renderProjetos();
  updateKPIs();
  loadProjetos();

  loadSavedUserProfile(); // Restaura perfil salvo
  // Se já tem token válido, atualiza perfil
  if (calStore.isAuthed()) {
    fetchUserProfile(calStore.getToken()).catch(() => {});
  }
  // Handle OAuth callback
  if (window.location.search.includes("code=")) handleOAuthCallback();

  // Form submit
  const form = $("formNovo");
  if (form) form.addEventListener("submit", sv);
});
