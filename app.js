/* ═══════════════════════════════════════════════════════════════════
   NuCel Pro Tracker — app.js v3.0
   JavaScript puro, sem frameworks
   ═══════════════════════════════════════════════════════════════════ */

/* ── DADOS ESTÁTICOS ─────────────────────────────────────────────── */

const LIDERES = [
  { nome:"Ana Claudia Oliveira", nivel:"M2" },
  { nome:"Bianca Holanda",       nivel:"M2" },
  { nome:"Daniel Pereira",       nivel:"M2" },
  { nome:"Mariana Foffa",        nivel:"M2" },
  { nome:"Amanda Garcia",        nivel:"M1" },
  { nome:"Bruna Freitas",        nivel:"M1" },
  { nome:"Bruno Ziurkelis",      nivel:"M1" },
  { nome:"Evandro Silva",        nivel:"M1" },
  { nome:"Giancarlo Mendonça",   nivel:"M1" },
  { nome:"Marilena Levy",        nivel:"M1" },
  { nome:"Nathalia Alcantara",   nivel:"M1" },
  { nome:"Rogério Lobato",       nivel:"M1" },
  { nome:"Felipe Eiji",          nivel:"IC5" },
  { nome:"Marilia Pinto",        nivel:"IC5" },
  { nome:"Rodrigo Gallo",        nivel:"IC5" },
];

// Métricas com Databricks vs manuais
const METRICAS_DATABRICKS = new Set(["tNPS","Produtividade","SLA","OTD 24h","Handover N1/N2","Skip","Aderência"]);

// Mapeamento métrica → tabela padrão
const METRICA_TABELA = {
  "tNPS":          "usr.cx_golden_layer.tnps_resolutivity",
  "Produtividade": "usr.cx_golden_layer.jobs_done",
  "SLA":           "usr.cx_golden_layer.sla_wt",
  "OTD 24h":       "usr.cx_golden_layer.ofrt_otd",
  "Handover N1/N2":"usr.cx_golden_layer.interaction_statuses",
  "Skip":          "usr.cx_golden_layer.interaction_statuses",
  "Aderência":     "usr.cx_golden_layer.jobs_done",
};

const MEMBROS = [
  "Adriana Santos","Agatha Ferreira","Alexandre Lima","Aline Costa",
  "Amanda Garcia","Amanda Souza","Ana Claudia Oliveira","Ana Lima",
  "Ana Paula Rodrigues","Anderson Martins","Andressa Gomes","Beatriz Alves",
  "Bianca Holanda","Bruna Freitas","Bruno Ziurkelis","Camila Fernandes",
  "Carla Pereira","Carolina Mendes","Claudia Araújo","Daniel Pereira",
  "Daniela Costa","Eduardo Barbosa","Evandro Silva","Fabio Nascimento",
  "Fernanda Lima","Felipe Eiji","Gabriel Oliveira","Gabriela Silva",
  "Giancarlo Mendonça","Giulia Rossi","Gustavo Almeida","Henrique Costa",
  "Igor Santos","Isabela Martins","Jéssica Ferreira","João Paulo Lima",
  "João Victor Alves","Julia Carvalho","Juliana Oliveira","Karina Sousa",
  "Larissa Pereira","Laura Mendes","Leonardo Costa","Leticia Santos",
  "Luana Ferreira","Lucas Almeida","Luiza Rodrigues","Marcela Gomes",
  "Marcelo Barbosa","Mariana Foffa","Marilena Levy","Marilia Pinto",
  "Marina Silva","Mateus Costa","Matheus Oliveira","Milena Ferreira",
  "Nathalia Alcantara","Natalia Costa","Nicole Pereira","Pamela Santos",
  "Patricia Lima","Paulo Henrique","Pedro Alves","Pedro Costa",
  "Priscila Mendes","Rafael Ferreira","Rafael Oliveira","Rafaela Silva",
  "Raissa Costa","Renata Barbosa","Ricardo Santos","Roberta Lima",
  "Rodrigo Gallo","Rogério Lobato","Sabrina Ferreira","Sara Costa",
  "Stephanie Mendes","Taina Oliveira","Thaís Lima","Thiago Alves",
  "Thiago Santos","Vanessa Costa","Vinicius Ferreira","Vitoria Pereira",
  "Wagner Lima","Wesley Santos","Yasmin Rodrigues","Yuri Alves",
];

const MOCK_PROJETOS = [
  {
    id:"P001", titulo:"Redução de SLA no Canal Chat",
    lider:"Marilena Levy", nivel:"M1",
    status:"Iniciado", saude:"No prazo",
    metrica:"SLA", metricaSource:"databricks",
    baseline:48, target:24, real:31, direcao:"menor",
    semana:"2025-W24", inicio:"2025-04-14",
    cluster:"OPS N2", impacto:"Sim", volume:"80000",
    descricao:"Reduzir o tempo de SLA médio do canal Chat de 48h para 24h através de repriorização de queues e ajuste de automações.",
    integrantes:["Bianca Holanda","Amanda Garcia","Felipe Eiji"],
    tabela:"usr.cx_golden_layer.sla_wt",
    queues:"nucel-chat-sla",
    drive:"",
    tarefas:"[ ] Mapear queues prioritárias\n[ ] Ajustar SLA rules\n[x] Identificar gargalos\n[ ] Validar em produção",
    riscos:"Dependência do time de automação para ajuste das regras.",
    evolucao:[48,44,40,36,31],
    updates:[
      { semana:"2025-W20", valor:44, obs:"Primeira semana de acompanhamento", autor:"Marilena Levy", ts:"2025-05-12" },
      { semana:"2025-W22", valor:36, obs:"Ajustes nas regras de priorização implementados", autor:"Felipe Eiji", ts:"2025-05-26" },
    ]
  },
  {
    id:"P002", titulo:"Aumento de tNPS Backoffice",
    lider:"Ana Claudia Oliveira", nivel:"M2",
    status:"Finalizado", saude:"No prazo",
    metrica:"tNPS", metricaSource:"databricks",
    baseline:42, target:55, real:58, direcao:"maior",
    semana:"2025-W18", inicio:"2025-03-03",
    cluster:"N2 variantes", impacto:"Sim", volume:"120000",
    descricao:"Aumentar tNPS do Backoffice via treinamento de atendentes e melhoria nos scripts de resolução.",
    integrantes:["Bruna Freitas","Rodrigo Gallo"],
    tabela:"usr.cx_golden_layer.tnps_resolutivity",
    queues:"",
    drive:"",
    tarefas:"[x] Análise de drivers de insatisfação\n[x] Treinamento dos atendentes\n[x] A/B test de scripts\n[x] Validação resultado",
    riscos:"",
    evolucao:[42,46,50,55,58],
    updates:[]
  },
  {
    id:"P003", titulo:"Melhoria de Produtividade N1",
    lider:"Bruna Freitas", nivel:"M1",
    status:"Prorrogado", saude:"Em risco",
    metrica:"Produtividade", metricaSource:"databricks",
    baseline:85, target:100, real:88, direcao:"maior",
    semana:"2025-W26", inicio:"2025-04-28",
    cluster:"OPS N1", impacto:"Não", volume:"",
    descricao:"Aumentar a produtividade do time N1 via redução de retrabalho e automação de tarefas repetitivas.",
    integrantes:["Evandro Silva","Nathalia Alcantara","Marilia Pinto"],
    tabela:"usr.cx_golden_layer.jobs_done",
    queues:"",
    drive:"",
    tarefas:"[ ] Revisão de processos manuais\n[ ] Automação de tarefas\n[x] Mapeamento de retrabalho",
    riscos:"Equipe reduzida no mês de junho, pode impactar entrega.",
    evolucao:[85,86,87,88,88],
    updates:[
      { semana:"2025-W22", valor:87, obs:"Evolução lenta, equipe parcialmente alocada em outro projeto", autor:"Bruna Freitas", ts:"2025-05-26" },
    ]
  },
  {
    id:"P004", titulo:"OTD 24h — Varejo Digital",
    lider:"Daniel Pereira", nivel:"M2",
    status:"Iniciado", saude:"No prazo",
    metrica:"OTD 24h", metricaSource:"databricks",
    baseline:70, target:85, real:78, direcao:"maior",
    semana:"2025-W25", inicio:"2025-05-05",
    cluster:"OPS", impacto:"Sim", volume:"45000",
    descricao:"Elevar o OTD 24h do cluster Varejo Digital implementando alertas automáticos de SLA e redistribuição de carga.",
    integrantes:["Bruno Ziurkelis","Giancarlo Mendonça"],
    tabela:"usr.cx_golden_layer.ofrt_otd",
    queues:"nucel-backoffice-otd",
    drive:"",
    tarefas:"[x] Mapeamento de gargalos\n[ ] Implementação de alertas\n[ ] Redistribuição de filas",
    riscos:"",
    evolucao:[70,73,75,78,78],
    updates:[]
  },
  {
    id:"P005", titulo:"Engajamento de Especialistas BPO",
    lider:"Bianca Holanda", nivel:"M2",
    status:"Iniciado", saude:"Em risco",
    metrica:"Engajamento", metricaSource:"manual",
    baseline:60, target:80, real:65, direcao:"maior",
    semana:"2025-W26", inicio:"2025-05-12",
    cluster:"BPO", impacto:"Sim", volume:"15000",
    descricao:"Aumentar engajamento dos especialistas BPO parceiro via programa de reconhecimento e feedbacks estruturados.",
    integrantes:["Felipe Eiji","Marilia Pinto","Marilena Levy"],
    tabela:"",
    queues:"",
    drive:"",
    tarefas:"[ ] Contratação BPO parceiro\n[ ] Definição KPIs de engajamento\n[ ] Pesquisa pulso quinzenal",
    riscos:"Métrica subjetiva, pode ter variação alta entre medições.",
    evolucao:[60,62,65],
    updates:[
      { semana:"2025-W20", valor:62, obs:"Pesquisa pulso inicial aplicada — 42 respondentes", autor:"Bianca Holanda", ts:"2025-05-12" },
      { semana:"2025-W22", valor:65, obs:"Melhora após reunião de alinhamento com liderança BPO", autor:"Bianca Holanda", ts:"2025-05-26" },
    ]
  },
  {
    id:"P006", titulo:"WoW: Redução de Handover N1→N2",
    lider:"Amanda Garcia", nivel:"M1",
    status:"Iniciado", saude:"No prazo",
    metrica:"WoW", metricaSource:"manual",
    baseline:35, target:20, real:28, direcao:"menor",
    semana:"2025-W24", inicio:"2025-05-19",
    cluster:"Q&T", impacto:"Sim", volume:"60000",
    descricao:"Reduzir taxa de handover N1→N2 semana a semana através de capacitação do time N1 e melhoria dos playbooks.",
    integrantes:["Rogério Lobato","Nathalia Alcantara"],
    tabela:"",
    queues:"",
    drive:"",
    tarefas:"[ ] Atualizar playbooks N1\n[ ] Treinamento técnico N1\n[x] Mapeamento dos principais motivos de escalonamento",
    riscos:"",
    evolucao:[35,32,28],
    updates:[
      { semana:"2025-W21", valor:32, obs:"Primeiros playbooks revisados e publicados", autor:"Rogério Lobato", ts:"2025-05-19" },
      { semana:"2025-W23", valor:28, obs:"Turma de treinamento concluída", autor:"Amanda Garcia", ts:"2025-06-02" },
    ]
  },
  {
    id:"P007", titulo:"Aderência ao Processo de Qualidade",
    lider:"Nathalia Alcantara", nivel:"M1",
    status:"Iniciado", saude:"Bloqueado",
    metrica:"Aderência", metricaSource:"databricks",
    baseline:72, target:90, real:null, direcao:"maior",
    semana:"2025-W27", inicio:"2025-06-02",
    cluster:"Q&T", impacto:"Não", volume:"",
    descricao:"Elevar aderência ao processo de monitoramento de qualidade. Projeto bloqueado aguardando definição do novo framework de QA.",
    integrantes:["Marilia Pinto","Rodrigo Gallo"],
    tabela:"usr.cx_golden_layer.jobs_done",
    queues:"",
    drive:"",
    tarefas:"[ ] Aguardando framework QA\n[ ] Definir critérios de monitoramento\n[ ] Implementar checklist",
    riscos:"Dependência do time de Qualidade para publicar o novo framework.",
    evolucao:[72],
    updates:[]
  },
];

/* ── ESTADO GLOBAL ───────────────────────────────────────────────── */
let PROJETOS        = [];
let CURRENT_PROJECT = null;
let EXEC_FILTER     = "todos";
let modalChartObj   = null;
let selectedIntegrantes = new Set();

/* ── UTILS ───────────────────────────────────────────────────────── */
const $  = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

function toast(msg, tipo="info") {
  const el = document.createElement("div");
  el.className = "toast " + tipo;
  const icons = { success:"✅", error:"❌", info:"ℹ️", warning:"⚠️" };
  el.innerHTML = (icons[tipo]||"ℹ️") + " " + msg;
  $("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function initials(nome) {
  if (!nome) return "?";
  const p = nome.trim().split(" ");
  return (p[0][0] + (p.length > 1 ? p[p.length-1][0] : "")).toUpperCase();
}

function saudeEmoji(s) {
  if (!s) return "⚪";
  if (s.includes("prazo")) return "🟢";
  if (s.includes("risco")) return "🟡";
  if (s.includes("Bloq"))  return "🔴";
  return "⚪";
}
function saudeBadgeClass(s) {
  if (!s) return "badge-gray";
  if (s.includes("prazo")) return "badge-green";
  if (s.includes("risco")) return "badge-yellow";
  if (s.includes("Bloq"))  return "badge-red";
  return "badge-gray";
}
function statusBadgeClass(s) {
  return { "Iniciado":"badge-blue","Finalizado":"badge-green","Prorrogado":"badge-yellow","Cancelado":"badge-red" }[s] || "badge-gray";
}

function isSuccess(p) {
  if (p.real === null || p.real === undefined || p.real === "") return null;
  return p.direcao === "menor"
    ? Number(p.real) <= Number(p.target)
    : Number(p.real) >= Number(p.target);
}

function resultadoBadge(p) {
  const suc = isSuccess(p);
  if (suc === null) return '<span class="badge badge-gray">Sem dado</span>';
  return suc
    ? '<span class="badge badge-green">✓ Meta atingida</span>'
    : '<span class="badge badge-yellow">⚠ Abaixo do target</span>';
}

function progressoPct(p) {
  if (p.baseline === undefined || p.target === undefined) return 0;
  const real = (p.real !== null && p.real !== undefined && p.real !== "") ? Number(p.real) : Number(p.baseline);
  const total = Math.abs(Number(p.target) - Number(p.baseline));
  if (total === 0) return 100;
  const feito = Math.abs(real - Number(p.baseline));
  return Math.min(100, Math.max(0, Math.round((feito / total) * 100)));
}

function progressoBar(p) {
  const pct = progressoPct(p);
  const cor = pct >= 100 ? "var(--green)" : pct >= 50 ? "var(--nu-purple)" : "var(--yellow)";
  return `<div style="display:flex;align-items:center;gap:6px;min-width:80px;">
    <div class="progress-bar" style="flex:1;"><div class="progress-fill" style="width:${pct}%;background:${cor};"></div></div>
    <span style="font-size:11px;color:var(--text-3);white-space:nowrap;">${pct}%</span>
  </div>`;
}

function getNivel(nome) {
  const l = LIDERES.find(x => x.nome === nome);
  return l ? l.nivel : "";
}

function fmtNum(n) {
  if (n === null || n === undefined || n === "") return "—";
  return Number(n).toLocaleString("pt-BR");
}

/* ── INIT ────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  restoreTheme();
  populateLiderSelects();
  populateWelcomeSelect();
  renderIntegrantesSearch("");
  loadUser();
  fetchProjetos();
});

function loadUser() {
  const nome = localStorage.getItem("nucel_user");
  nome ? setUser(nome) : setTimeout(openWelcome, 700);
}
function setUser(nome) {
  $("sidebarName").textContent = nome || "Identificar-me";
  $("sidebarInitials").textContent = initials(nome);
}
function openWelcome() { $("welcomeModal").classList.add("open"); }
function saveUser() {
  const v = $("welcomeSelect").value;
  if (!v) { toast("Selecione seu nome para continuar.", "error"); return; }
  localStorage.setItem("nucel_user", v);
  setUser(v);
  $("welcomeModal").classList.remove("open");
  toast("Bem-vindo(a), " + v.split(" ")[0] + "! 👋", "success");
}

function populateWelcomeSelect() {
  const sel = $("welcomeSelect");
  const saved = localStorage.getItem("nucel_user") || "";
  sel.innerHTML = '<option value="">Selecione seu nome...</option>';
  MEMBROS.forEach(m => {
    const o = document.createElement("option");
    o.value = m; o.textContent = m;
    if (m === saved) o.selected = true;
    sel.appendChild(o);
  });
}

function populateLiderSelects() {
  const sels = [$("fLider"), $("liderFilter")].filter(Boolean);
  sels.forEach(sel => {
    if (sel.id === "fLider") {
      sel.innerHTML = '<option value="">Selecione o líder</option>';
    } else {
      sel.innerHTML = '<option value="">Todos os líderes</option>';
    }
    LIDERES.forEach(l => {
      const o = document.createElement("option");
      o.value = l.nome;
      o.textContent = l.nome + " (" + l.nivel + ")";
      sel.appendChild(o);
    });
  });
}

/* ── NAVEGAÇÃO ───────────────────────────────────────────────────── */
const PAGE_TITLES = {
  exec:"Visão Executiva", projetos:"Todos os Projetos",
  saude:"Mapa de Saúde", lider:"Por Líder",
  novo:"Novo Projeto", manual:"Atualizar Métrica",
  dados:"Dados & Histórico", organograma:"Organograma",
};

function navigate(page) {
  $$(".page").forEach(p => p.classList.remove("active"));
  $$(".nav-item").forEach(n => n.classList.remove("active"));
  const el = $("page-" + page);
  if (el) el.classList.add("active");
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add("active");
  $("topbarTitle").textContent = PAGE_TITLES[page] || page;
  if (page === "projetos")   renderProjetosTable();
  if (page === "lider")      renderLiderView();
  if (page === "saude")      renderHealthMap();
  if (page === "manual")     setupManualPage();
}

/* ── DADOS ───────────────────────────────────────────────────────── */
async function fetchProjetos() {
  try {
    const res = await fetch("/api/projetos");
    if (res.ok) {
      const data = await res.json();
      PROJETOS = Array.isArray(data) && data.length ? data : MOCK_PROJETOS;
    } else {
      PROJETOS = MOCK_PROJETOS;
    }
  } catch {
    PROJETOS = MOCK_PROJETOS;
  }
  renderAll();
}

function renderAll() {
  renderExecKPIs();
  renderLeaderCards();
  renderRiskBanner();
}

/* ── VISÃO EXECUTIVA ─────────────────────────────────────────────── */
function filterExec(filtro, el) {
  EXEC_FILTER = filtro;
  $$("#execFilters .filter-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  renderLeaderCards();
}

function getFilteredProjetos() {
  if (EXEC_FILTER === "todos") return PROJETOS;
  if (EXEC_FILTER === "risco")     return PROJETOS.filter(p => p.saude && p.saude.includes("risco"));
  if (EXEC_FILTER === "bloqueado") return PROJETOS.filter(p => p.saude && p.saude.includes("Bloq"));
  return PROJETOS.filter(p => p.status === EXEC_FILTER);
}

function renderRiskBanner() {
  const banner = $("riskBanner");
  const emRisco = PROJETOS.filter(p => p.saude && (p.saude.includes("risco") || p.saude.includes("Bloq")));
  if (emRisco.length) {
    banner.innerHTML = `<div class="risk-banner">⚠️ ${emRisco.length} projeto${emRisco.length>1?"s requerem":"requer"} atenção: ${emRisco.map(p=>`<strong>${p.titulo.split(" ").slice(0,3).join(" ")}…</strong>`).join(", ")}</div>`;
  } else {
    banner.innerHTML = "";
  }
}

function renderExecKPIs() {
  const total    = PROJETOS.length;
  const ativos   = PROJETOS.filter(p => p.status==="Iniciado"||p.status==="Prorrogado").length;
  const atencao  = PROJETOS.filter(p => p.saude && (p.saude.includes("risco")||p.saude.includes("Bloq"))).length;
  const comReal  = PROJETOS.filter(p => p.real !== null && p.real !== undefined && p.real !== "");
  const sucessos = comReal.filter(p => isSuccess(p)).length;
  const taxa     = comReal.length ? Math.round((sucessos/comReal.length)*100)+"%" : "—";
  const lidAtivos= new Set(PROJETOS.map(p => p.lider)).size;
  const clientes = PROJETOS.filter(p=>p.impacto==="Sim"&&p.volume).reduce((a,p)=>a+Number(p.volume||0), 0);

  $("kpiTotal").textContent   = total;
  $("kpiSucesso").textContent = taxa;
  $("kpiSucessoSub").textContent = `${sucessos} de ${comReal.length} projetos`;
  $("kpiWip").textContent     = ativos;
  $("kpiAtencao").textContent = atencao;
  $("kpiClientes").textContent= clientes ? clientes.toLocaleString("pt-BR") : "—";
  $("kpiLideres").textContent = lidAtivos;
}

function renderLeaderCards() {
  const container  = $("leaderCards");
  const filtrados  = getFilteredProjetos();
  if (!filtrados.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">Nenhum projeto neste filtro</div></div>';
    return;
  }
  const porLider = {};
  filtrados.forEach(p => {
    if (!porLider[p.lider]) porLider[p.lider] = { nivel: p.nivel||getNivel(p.lider), projs:[] };
    porLider[p.lider].projs.push(p);
  });
  container.innerHTML = Object.entries(porLider).map(([nome, d]) => {
    const total  = d.projs.length;
    const comR   = d.projs.filter(p => p.real !== null && p.real !== undefined && p.real !== "");
    const suc    = comR.filter(p => isSuccess(p)).length;
    const taxa   = comR.length ? Math.round((suc/comR.length)*100) : null;
    const stats  = d.projs.map(p => `<span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>`).join(" ");
    return `<div class="leader-card" onclick="filterByLider('${nome}')">
      <div class="leader-card-top">
        <div class="leader-avatar">${initials(nome)}</div>
        <div><div class="leader-name">${nome}</div><div class="leader-role">${d.nivel} · ${total} projeto${total!==1?"s":""}</div></div>
      </div>
      <div class="leader-stats">${stats}</div>
      ${taxa!==null ? `<div class="progress-wrap">
        <div class="progress-label"><span>Taxa de sucesso</span><span>${taxa}% (${suc}/${comR.length})</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${taxa}%"></div></div>
      </div>` : `<div style="font-size:11px;color:var(--text-3);margin-top:8px;">Sem métricas ainda</div>`}
    </div>`;
  }).join("");
}

function filterByLider(nome) {
  navigate("lider");
  setTimeout(() => {
    const acc = document.querySelector(`.accordion[data-lider="${nome}"]`);
    if (acc) { acc.classList.add("open"); acc.scrollIntoView({ behavior:"smooth", block:"start" }); }
  }, 80);
}

/* ── TABELA ──────────────────────────────────────────────────────── */
function renderProjetosTable() {
  const tbody = $("projetosBody");
  const q     = ($("searchInput")||{value:""}).value.toLowerCase();
  const sF    = ($("statusFilter")||{value:""}).value;
  const lF    = ($("liderFilter")||{value:""}).value;

  const filtrados = PROJETOS.filter(p =>
    (!q  || p.titulo.toLowerCase().includes(q) || (p.lider||"").toLowerCase().includes(q)) &&
    (!sF || p.status === sF) &&
    (!lF || p.lider === lF)
  );

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">Nenhum projeto encontrado</div></div></td></tr>';
    return;
  }
  tbody.innerHTML = filtrados.map(p => {
    const cls = p.saude&&p.saude.includes("prazo")?"row-success":p.saude&&p.saude.includes("risco")?"row-risk":p.saude&&p.saude.includes("Bloq")?"row-blocked":"";
    const real = (p.real!==null&&p.real!==undefined&&p.real!=="") ? p.real : "—";
    const srcTag = METRICAS_DATABRICKS.has(p.metrica)
      ? '<span class="metric-tag" title="Databricks">⚡</span>'
      : '<span class="metric-tag manual" title="Manual">✏️</span>';
    return `<tr class="${cls}" onclick="openProjeto('${p.id}')">
      <td><strong>${p.titulo}</strong></td>
      <td>${p.lider||"—"}</td>
      <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
      <td>${saudeEmoji(p.saude)} ${p.saude||"—"}</td>
      <td>${p.metrica||"—"} ${srcTag}</td>
      <td>${fmtNum(p.baseline)}</td>
      <td>${fmtNum(p.target)}</td>
      <td>${real!=="—"?fmtNum(real):"—"}</td>
      <td>${progressoBar(p)}</td>
      <td>${resultadoBadge(p)}</td>
    </tr>`;
  }).join("");
}

/* ── MAPA DE SAÚDE ───────────────────────────────────────────────── */
function renderHealthMap() {
  const cont = $("healthMap");
  if (!PROJETOS.length) { cont.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">Nenhum projeto</div></div>'; return; }
  const cor = s => {
    if (!s||s.includes("Finalizado")||s.includes("Cancelado")) return "var(--nu-gray-300)";
    if (s.includes("prazo")) return "var(--green)";
    if (s.includes("risco")) return "var(--yellow)";
    if (s.includes("Bloq"))  return "var(--red)";
    return "var(--nu-gray-300)";
  };
  cont.innerHTML = PROJETOS.map(p => `
    <div class="health-item" onclick="openProjeto('${p.id}')" title="${p.titulo}">
      <div>
        <div class="health-item-name">${p.titulo}</div>
        <div class="health-item-lider">${p.lider||"—"} · ${p.status}</div>
      </div>
      <div style="width:14px;height:14px;border-radius:50%;background:${cor(p.saude||p.status)};flex-shrink:0;"></div>
    </div>`).join("");
}

/* ── POR LÍDER ───────────────────────────────────────────────────── */
function renderLiderView() {
  const cont = $("liderAccordions");
  const nivelOrder = ["M2","M1","IC5"];
  const porNivel   = {"M2":{},"M1":{},"IC5":{}};
  PROJETOS.forEach(p => {
    const nivel = p.nivel || getNivel(p.lider) || "IC5";
    if (!porNivel[nivel]) porNivel[nivel] = {};
    if (!porNivel[nivel][p.lider]) porNivel[nivel][p.lider] = [];
    porNivel[nivel][p.lider].push(p);
  });
  cont.innerHTML = nivelOrder.map(nivel => {
    const lids = Object.entries(porNivel[nivel]||{});
    if (!lids.length) return "";
    return `<div style="margin-bottom:6px;">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-3);padding:12px 4px 6px;">${nivel}</div>
      ${lids.map(([nome,projs]) => accordionHtml(nome,projs)).join("")}
    </div>`;
  }).join("");
}

function accordionHtml(nome, projs) {
  const rows = projs.map(p => {
    const real = (p.real!==null&&p.real!==undefined&&p.real!=="") ? fmtNum(p.real) : "—";
    return `<tr onclick="openProjeto('${p.id}')" style="cursor:pointer;">
      <td><strong>${p.titulo}</strong></td>
      <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
      <td>${saudeEmoji(p.saude)} ${p.saude||"—"}</td>
      <td>${p.metrica||"—"}</td>
      <td>${fmtNum(p.target)}</td>
      <td>${real}</td>
      <td>${progressoBar(p)}</td>
      <td>${resultadoBadge(p)}</td>
    </tr>`;
  }).join("");
  return `<div class="accordion" data-lider="${nome}">
    <div class="accordion-header" onclick="toggleAcc(this.parentElement)">
      <div class="accordion-title">
        <div class="user-avatar" style="width:28px;height:28px;font-size:11px;">${initials(nome)}</div>
        ${nome} <span class="badge badge-purple">${projs.length}</span>
      </div>
      <span class="accordion-chevron">▼</span>
    </div>
    <div class="accordion-body">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Projeto</th><th>Status</th><th>Saúde</th><th>Métrica</th><th>Target</th><th>Real</th><th>Progresso</th><th>Resultado</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function toggleAcc(el) { el.classList.toggle("open"); }

/* ── ONE-PAGER MODAL ─────────────────────────────────────────────── */
function openProjeto(id) {
  const p = PROJETOS.find(x => x.id === id);
  if (!p) return;
  CURRENT_PROJECT = p;

  $("modalTitulo").textContent = p.titulo;
  $("modalSub").textContent   = `${p.lider||"—"} · ${p.cluster||"—"} · Semana ${p.semana||"—"}`;

  const manual = !METRICAS_DATABRICKS.has(p.metrica);
  $("modalBadges").innerHTML = [
    `<span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>`,
    `<span class="badge ${saudeBadgeClass(p.saude)}">${saudeEmoji(p.saude)} ${p.saude||"—"}</span>`,
    resultadoBadge(p),
    p.impacto==="Sim" ? `<span class="badge badge-purple">👥 ${p.volume?Number(p.volume).toLocaleString("pt-BR")+" clientes":"Clientes impactados"}</span>` : "",
    manual ? '<span class="badge badge-teal">✏️ Métrica manual</span>' : '<span class="badge badge-purple">⚡ Databricks</span>',
  ].filter(Boolean).join("");

  // Tab 0: Visão Geral
  $("modalGrid").innerHTML = [
    ["Líder", p.lider||"—"],
    ["Nível", getNivel(p.lider)||"—"],
    ["Cluster / Impacto", p.cluster||"—"],
    ["Semana de entrega", p.semana||"—"],
    ["Data de início", p.inicio||"—"],
    ["Queues", p.queues||"Todas (NuCel)"],
  ].map(([l,v]) => `<div class="modal-field"><div class="modal-field-label">${l}</div><div class="modal-field-value">${v}</div></div>`).join("");

  $("modalIntegrantes").innerHTML = (p.integrantes||[]).length ? `
    <div style="margin:12px 0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:8px;">Integrantes</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${(p.integrantes||[]).map(i=>`<span class="chip">👤 ${i.split(" ")[0]}@</span>`).join("")}
      </div>
    </div>` : "";

  $("modalTarefas").innerHTML = p.tarefas ? `
    <div style="margin:12px 0;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:6px;">Tarefas</div>
      <pre style="font-family:inherit;font-size:12px;color:var(--text-2);white-space:pre-wrap;background:var(--bg);padding:10px;border-radius:8px;">${p.tarefas}</pre>
    </div>` : "";

  $("modalRiscos").innerHTML = p.riscos ? `
    <div class="risk-banner" style="margin:10px 0;">⚠️ <strong>Risco:</strong> ${p.riscos}</div>` : "";

  // Tab 1: Métricas
  const real = (p.real!==null&&p.real!==undefined&&p.real!=="") ? p.real : null;
  const realColor = real!==null ? (isSuccess(p) ? "var(--green)" : "var(--yellow)") : "var(--text-3)";
  const pct = progressoPct(p);
  const barColor = pct>=100?"var(--green)":pct>=50?"var(--nu-purple)":"var(--yellow)";

  $("modalMetrica").innerHTML = `
    <div class="metric-display">
      <div class="metric-step">
        <div class="metric-step-label">Métrica</div>
        <div class="metric-step-value" style="font-size:15px;color:var(--nu-purple);">${p.metrica||"—"}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Baseline</div>
        <div class="metric-step-value">${fmtNum(p.baseline)}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Target</div>
        <div class="metric-step-value" style="color:var(--blue);">${fmtNum(p.target)}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Real atual</div>
        <div class="metric-step-value" style="color:${realColor};">${real!==null?fmtNum(real):"—"}</div>
      </div>
    </div>
    <div class="target-bar-wrap">
      <div class="target-bar-label">
        <span>Progresso em direção ao target (${p.direcao==="menor"?"↓ menor melhor":"↑ maior melhor"})</span>
        <span style="font-weight:700;">${pct}%</span>
      </div>
      <div class="target-bar"><div class="target-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
    </div>`;

  // Input manual se métrica manual
  if (manual) {
    $("modalManualInput").innerHTML = `
      <div class="manual-metric-form" style="margin-top:14px;">
        <h4>Registrar valor desta semana</h4>
        <div class="manual-row">
          <div class="form-group"><label>Semana</label><input type="week" id="inlineSemana"/></div>
          <div class="form-group"><label>Valor real</label><input type="number" id="inlineValor" placeholder="Ex: 75" step="any"/></div>
          <div class="form-group"><label>Obs.</label><input type="text" id="inlineObs" placeholder="Opcional"/></div>
        </div>
        <div style="margin-top:10px;">
          <button class="btn btn-primary btn-sm" onclick="saveInlineMetrica()">Salvar</button>
        </div>
      </div>`;
  } else {
    $("modalManualInput").innerHTML = "";
  }

  // Tab 2: Histórico
  renderModalUpdates(p);

  // Ações
  $("modalActions").innerHTML = [
    p.drive ? `<a href="${p.drive}" target="_blank" class="btn btn-secondary btn-sm">↗ Drive</a>` : "",
    `<button class="btn btn-ghost btn-sm" onclick="window.print()">🖨 Imprimir</button>`,
    `<button class="btn btn-primary btn-sm" onclick="notifySlack()">💬 Notificar time</button>`,
  ].filter(Boolean).join("");

  // Tab ativo = 0
  switchTab(0, document.querySelectorAll(".modal-tab")[0]);
  renderModalChart(p);
  $("projetoModal").classList.add("open");
}

function renderModalUpdates(p) {
  const upds = p.updates || [];
  $("modalUpdates").innerHTML = upds.length
    ? `<div class="update-list">${upds.slice().reverse().map(u => `
        <div class="update-item">
          <div>
            <div class="update-meta">${u.semana||""} · ${u.ts||""} · ${u.autor||""}</div>
            <div class="update-text">Valor: <strong>${fmtNum(u.valor)}</strong>${u.obs?" — "+u.obs:""}</div>
          </div>
        </div>`).join("")}
      </div>`
    : `<div class="empty-state" style="padding:30px;"><div class="empty-state-icon">📭</div><div class="empty-state-title">Nenhum update registrado</div><div class="empty-state-sub">Use "Atualizar Métrica" para registrar a evolução semanal</div></div>`;
}

function switchTab(idx, el) {
  $$(".modal-tab").forEach(t => t.classList.remove("active"));
  $$(".modal-tab-panel").forEach(t => t.classList.remove("active"));
  if (el) el.classList.add("active");
  const panel = $("tabPanel" + idx);
  if (panel) panel.classList.add("active");
  if (idx === 1 && CURRENT_PROJECT) renderModalChart(CURRENT_PROJECT);
}

function renderModalChart(p) {
  if (modalChartObj) { modalChartObj.destroy(); modalChartObj = null; }
  const canvas = $("modalChart");
  if (!canvas) return;
  const evo    = p.evolucao || [p.baseline];
  const labels = evo.map((_,i) => "W"+(i+1));
  const dark   = document.documentElement.getAttribute("data-theme") === "dark";
  const grid   = dark ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.05)";
  const txt    = dark ? "#7B6B8D" : "#7B6B8D";

  modalChartObj = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: p.metrica || "Métrica",
          data: evo,
          borderColor: "#820AD1",
          backgroundColor: "rgba(130,10,209,.08)",
          tension: .4, fill: true,
          pointRadius: 4, pointBackgroundColor: "#820AD1",
        },
        {
          label: "Target",
          data: evo.map(() => p.target),
          borderColor: "#3B82F6", borderDash:[6,3],
          tension: 0, fill: false, pointRadius: 0,
        },
        {
          label: "Baseline",
          data: evo.map(() => p.baseline),
          borderColor: "#7B6B8D", borderDash:[3,3],
          tension: 0, fill: false, pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: txt, font:{ size:11 } } } },
      scales: {
        x: { grid:{color:grid}, ticks:{color:txt} },
        y: { grid:{color:grid}, ticks:{color:txt} },
      },
    },
  });
}

function closeModalOutside(e) { if (e.target === $("projetoModal")) closeModalDirect(); }
function closeModalDirect() {
  $("projetoModal").classList.remove("open");
  if (modalChartObj) { modalChartObj.destroy(); modalChartObj = null; }
  CURRENT_PROJECT = null;
}

/* ── INLINE MÉTRICA MANUAL ───────────────────────────────────────── */
function saveInlineMetrica() {
  const p = CURRENT_PROJECT;
  if (!p) return;
  const semana = $("inlineSemana") ? $("inlineSemana").value : "";
  const valor  = $("inlineValor")  ? Number($("inlineValor").value)  : null;
  const obs    = $("inlineObs")    ? $("inlineObs").value : "";
  if (!valor && valor !== 0) { toast("Informe o valor real.", "error"); return; }
  if (!p.updates) p.updates = [];
  const user = localStorage.getItem("nucel_user") || "?";
  p.updates.push({ semana, valor, obs, autor: user, ts: new Date().toISOString().slice(0,10) });
  p.real = valor;
  if (!p.evolucao) p.evolucao = [p.baseline];
  p.evolucao.push(valor);
  renderModalUpdates(p);
  renderModalChart(p);
  renderAll();
  toast("Métrica salva!", "success");
  saveToSheets(p);
}

/* ── ATUALIZAR MÉTRICA (PAGE) ────────────────────────────────────── */
function setupManualPage() {
  const sel = $("manualProjeto");
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione um projeto...</option>';
  PROJETOS.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id;
    o.textContent = p.titulo + " (" + (p.lider||"") + ")";
    sel.appendChild(o);
  });
}

function onManualProjetoChange() {
  const id = $("manualProjeto").value;
  const p  = PROJETOS.find(x => x.id === id);
  const info = $("manualProjetoInfo");
  if (!p) { info.style.display = "none"; return; }
  info.style.display = "block";
  $("manualMetricaLabel").textContent = `Métrica: ${p.metrica||"—"} (${METRICAS_DATABRICKS.has(p.metrica)?"⚡ Databricks":"✏️ Manual"})`;
  renderManualHistorico(p);
}

function renderManualHistorico(p) {
  const upds = p.updates || [];
  $("manualHistorico").innerHTML = upds.length
    ? `<div style="margin-top:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:8px;">Histórico de registros</div>
        <div class="update-list">
          ${upds.slice().reverse().map(u => `<div class="update-item">
            <div>
              <div class="update-meta">${u.semana||""} · ${u.ts||""} · ${u.autor||""}</div>
              <div class="update-text">Valor: <strong>${fmtNum(u.valor)}</strong>${u.obs?" — "+u.obs:""}</div>
            </div>
          </div>`).join("")}
        </div>
      </div>`
    : `<div style="font-size:12px;color:var(--text-3);margin-top:14px;">Nenhum registro ainda para este projeto.</div>`;
}

function saveManualMetrica() {
  const id     = $("manualProjeto").value;
  const p      = PROJETOS.find(x => x.id === id);
  if (!p) { toast("Selecione um projeto.", "error"); return; }
  const semana = $("manualSemana").value;
  const valor  = Number($("manualValor").value);
  const obs    = $("manualObs").value;
  if (!valor && valor !== 0) { toast("Informe o valor real.", "error"); return; }
  const user = localStorage.getItem("nucel_user") || "?";
  if (!p.updates) p.updates = [];
  p.updates.push({ semana, valor, obs, autor: user, ts: new Date().toISOString().slice(0,10) });
  p.real = valor;
  if (!p.evolucao) p.evolucao = [p.baseline];
  p.evolucao.push(valor);
  renderManualHistorico(p);
  renderAll();
  toast("Registro salvo com sucesso!", "success");
  $("manualValor").value = "";
  $("manualObs").value   = "";
  saveToSheets(p);
}

/* ── INTEGRANTES ─────────────────────────────────────────────────── */
function renderIntegrantesSearch(query) {
  const grid = $("intGrid");
  if (!grid) return;
  const q = query.toLowerCase();
  const filtrados = MEMBROS.filter(m => !q || m.toLowerCase().includes(q));
  grid.innerHTML = filtrados.map(m => `
    <label class="integrante-item" onclick="toggleIntegrante('${m}',event)">
      <input type="checkbox" ${selectedIntegrantes.has(m)?"checked":""}/> ${m}
    </label>`).join("");
}

function toggleIntegrante(nome, e) {
  e.preventDefault();
  selectedIntegrantes.has(nome) ? selectedIntegrantes.delete(nome) : selectedIntegrantes.add(nome);
  renderIntegrantesSearch($("intSearch")?$("intSearch").value:"");
  renderSelectedChips();
}
function removeIntegrante(nome) {
  selectedIntegrantes.delete(nome);
  renderIntegrantesSearch($("intSearch")?$("intSearch").value:"");
  renderSelectedChips();
}
function renderSelectedChips() {
  $("selectedChips").innerHTML = [...selectedIntegrantes].map(m =>
    `<span class="chip">${m} <button onclick="removeIntegrante('${m}')">×</button></span>`).join("");
}

/* ── FORM HELPERS ────────────────────────────────────────────────── */
function updateRadio(input) {
  const group = input.closest(".radio-group");
  if (!group) return;
  group.querySelectorAll(".radio-btn").forEach(b => b.classList.remove("selected"));
  input.closest(".radio-btn").classList.add("selected");
}
function toggleChip(label) {
  label.classList.toggle("selected");
  const cb = label.querySelector("input[type=checkbox]");
  if (cb) cb.checked = label.classList.contains("selected");
}

function onMetricaChange() {
  const sel = $("fMetrica");
  if (!sel) return;
  const opt = sel.options[sel.selectedIndex];
  const src = opt ? opt.dataset.source : "";
  const tag = $("metricaTag");
  const alert = $("databricksManualAlert");
  if (src === "manual") {
    tag.innerHTML = '<span class="metric-tag manual" style="margin-top:4px;">✏️ Métrica manual — sem Databricks</span>';
    alert.style.display = "flex";
    // Auto-limpar tabela
    if ($("fTabela")) $("fTabela").value = "";
  } else if (src === "databricks") {
    tag.innerHTML = '<span class="metric-tag" style="margin-top:4px;">⚡ Dados via Databricks</span>';
    alert.style.display = "none";
    // Sugerir tabela
    const metrica = sel.value;
    if (METRICA_TABELA[metrica] && $("fTabela")) $("fTabela").value = METRICA_TABELA[metrica];
  } else {
    tag.innerHTML = "";
    alert.style.display = "none";
  }
}

/* ── SUBMIT ──────────────────────────────────────────────────────── */
function nextId() {
  const existing = new Set(PROJETOS.map(p => p.id));
  let n = PROJETOS.length + 1;
  let id = "P" + String(n).padStart(3,"0");
  while (existing.has(id)) { n++; id = "P" + String(n).padStart(3,"0"); }
  return id;
}

async function submitNovoProjeto(e) {
  e.preventDefault();
  const saudeInput   = document.querySelector('input[name="saude"]:checked');
  const impactoInput = document.querySelector('input[name="impacto"]:checked');
  const direcaoInput = document.querySelector('input[name="direcao"]:checked');
  const canais = [...document.querySelectorAll('input[name="canal"]:checked')].map(c => c.value);
  const metrica = $("fMetrica") ? $("fMetrica").value : "";

  const p = {
    id:             nextId(),
    titulo:         ($("fTitulo")||{value:""}).value,
    lider:          ($("fLider")||{value:""}).value,
    nivel:          getNivel(($("fLider")||{value:""}).value),
    status:         ($("fStatus")||{value:"Iniciado"}).value,
    saude:          saudeInput ? saudeInput.value : "No prazo",
    semana:         ($("fSemana")||{value:""}).value,
    inicio:         ($("fInicio")||{value:""}).value,
    cluster:        ($("fCluster")||{value:""}).value,
    impacto:        impactoInput ? impactoInput.value : "Não",
    volume:         ($("fVolume")||{value:""}).value,
    descricao:      ($("fDescricao")||{value:""}).value,
    integrantes:    [...selectedIntegrantes],
    metrica,
    metricaSource:  METRICAS_DATABRICKS.has(metrica) ? "databricks" : "manual",
    baseline:       Number(($("fBaseline")||{value:0}).value) || 0,
    target:         Number(($("fTarget")||{value:0}).value) || 0,
    direcao:        direcaoInput ? direcaoInput.value : "maior",
    real:           null,
    tabela:         ($("fTabela")||{value:""}).value,
    canais,
    queues:         ($("fQueues")||{value:""}).value,
    drive:          ($("fDrive")||{value:""}).value,
    tarefas:        ($("fTarefas")||{value:""}).value,
    riscos:         ($("fRiscos")||{value:""}).value,
    evolucao:       [Number(($("fBaseline")||{value:0}).value)||0],
    updates:        [],
  };

  const btn = $("submitBtn"); const txt = $("submitText");
  btn.disabled = true; txt.textContent = "⏳ Salvando...";

  PROJETOS.push(p);
  renderAll();
  saveToSheets(p);       // fire-and-forget
  notifySlackNew(p);     // fire-and-forget
  toast("Projeto " + p.id + " salvo com sucesso! 🎉", "success");
  resetForm();
  navigate("projetos");
  btn.disabled = false; txt.textContent = "✓ Salvar Projeto";
}

function resetForm() {
  if ($("novoForm")) $("novoForm").reset();
  selectedIntegrantes.clear();
  renderIntegrantesSearch("");
  renderSelectedChips();
  $$(".radio-btn").forEach(b => b.classList.remove("selected"));
  $$('.radio-btn input[type="radio"]:checked').forEach(r => r.closest(".radio-btn").classList.add("selected"));
  $$(".checkbox-chip").forEach(c => {
    c.classList.add("selected");
    const cb = c.querySelector("input"); if (cb) cb.checked = true;
  });
  if ($("metricaTag")) $("metricaTag").innerHTML = "";
  if ($("databricksManualAlert")) $("databricksManualAlert").style.display = "none";
}

/* ── API FIRE-AND-FORGET ─────────────────────────────────────────── */
async function saveToSheets(p) {
  try { await fetch("/api/projetos",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(p) }); }
  catch(e) { console.warn("[Sheets]", e); }
}
async function notifySlackNew(p) {
  try { await fetch("/api/notify",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tipo:"novo_projeto", projeto:p }) }); }
  catch(e) { console.warn("[Slack]", e); }
}
async function notifySlack() {
  if (!CURRENT_PROJECT) return;
  try {
    await fetch("/api/notify",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ tipo:"update_projeto", projeto:CURRENT_PROJECT }) });
    toast("Time notificado no Slack! 💬", "success");
  } catch { toast("Erro ao notificar Slack.", "error"); }
}

/* ── TEMA ────────────────────────────────────────────────────────── */
function toggleTheme() {
  const root = document.documentElement;
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  $("themeBtn").textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("nucel_theme", next);
  if (CURRENT_PROJECT) renderModalChart(CURRENT_PROJECT);
}
function restoreTheme() {
  const t = localStorage.getItem("nucel_theme");
  if (t) {
    document.documentElement.setAttribute("data-theme", t);
    const btn = $("themeBtn"); if (btn) btn.textContent = t==="dark"?"☀️":"🌙";
  }
}
