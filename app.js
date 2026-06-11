/* ═══════════════════════════════════════════════════════════════
   NuCel Pro Tracker — app.js v3.0
   JavaScript puro, sem frameworks
   ═══════════════════════════════════════════════════════════════ */

/* ── CONSTANTES ────────────────────────────────────────────────────── */

const LIDERES = [
  { nome: "Ana Claudia Oliveira", nivel: "M2" },
  { nome: "Bianca Holanda",       nivel: "M2" },
  { nome: "Daniel Pereira",       nivel: "M2" },
  { nome: "Mariana Foffa",        nivel: "M2" },
  { nome: "Amanda Garcia",        nivel: "M1" },
  { nome: "Bruna Freitas",        nivel: "M1" },
  { nome: "Bruno Ziurkelis",      nivel: "M1" },
  { nome: "Evandro Silva",        nivel: "M1" },
  { nome: "Giancarlo Mendonça",   nivel: "M1" },
  { nome: "Marilena Levy",        nivel: "M1" },
  { nome: "Nathalia Alcantara",   nivel: "M1" },
  { nome: "Rogério Lobato",       nivel: "M1" },
  { nome: "Felipe Eiji",          nivel: "IC5" },
  { nome: "Marilia Pinto",        nivel: "IC5" },
  { nome: "Rodrigo Gallo",        nivel: "IC5" },
];

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
  "Zé Carlos","Zélia Santos","Zilda Ferreira","Zoé Lima",
];

const MOCK_PROJETOS = [
  {
    id:"P001", titulo:"Redução de SLA no Canal Chat", lider:"Marilena Levy", nivel:"M1",
    status:"Iniciado", saude:"No prazo", metrica:"SLA", baseline:48, target:24, real:31,
    semana:"2025-W20", cluster:"OPS N2", impacto:"Sim", volume:"80000",
    integrantes:["Bianca Holanda","Amanda Garcia","Felipe Eiji"],
    drive:"", tarefas:"Mapear queues prioritárias\nAjustar SLA rules\nTestar em produção",
    tabela:"usr.cx_golden_layer.sla_wt", queues:"nucel-chat-sla",
    evolucao:[48,44,40,36,31]
  },
  {
    id:"P002", titulo:"Aumento de tNPS Backoffice", lider:"Ana Claudia Oliveira", nivel:"M2",
    status:"Finalizado", saude:"No prazo", metrica:"tNPS", baseline:42, target:55, real:58,
    semana:"2025-W18", cluster:"N2 variantes", impacto:"Sim", volume:"120000",
    integrantes:["Bruna Freitas","Rodrigo Gallo"],
    drive:"", tarefas:"Análise de drivers\nTreinamento dos atendentes",
    tabela:"usr.cx_golden_layer.tnps_resolutivity", queues:"",
    evolucao:[42,46,50,55,58]
  },
  {
    id:"P003", titulo:"Melhoria de Produtividade N1", lider:"Bruna Freitas", nivel:"M1",
    status:"Em Risco", saude:"Em risco", metrica:"Produtividade", baseline:85, target:100, real:88,
    semana:"2025-W22", cluster:"OPS N1", impacto:"Não", volume:"",
    integrantes:["Evandro Silva","Nathalia Alcantara","Marilia Pinto"],
    drive:"", tarefas:"Revisão de processos\nAutomação de tarefas repetitivas",
    tabela:"usr.cx_golden_layer.jobs_done", queues:"",
    evolucao:[85,86,87,88,88]
  },
  {
    id:"P004", titulo:"OTD 24h — Varejo", lider:"Daniel Pereira", nivel:"M2",
    status:"Iniciado", saude:"No prazo", metrica:"OTD 24h", baseline:70, target:85, real:78,
    semana:"2025-W24", cluster:"OPS", impacto:"Sim", volume:"45000",
    integrantes:["Bruno Ziurkelis","Giancarlo Mendonça"],
    drive:"", tarefas:"Mapeamento de gargalos\nImplementação de alertas",
    tabela:"usr.cx_golden_layer.ofrt_otd", queues:"nucel-backoffice-otd",
    evolucao:[70,73,75,78,78]
  },
  {
    id:"P005", titulo:"Handover N1/N2 — Qualidade", lider:"Amanda Garcia", nivel:"M1",
    status:"Cancelado", saude:"Bloqueado", metrica:"Handover N1/N2", baseline:30, target:20, real:null,
    semana:"2025-W16", cluster:"Q&T", impacto:"Não", volume:"",
    integrantes:["Rogério Lobato"],
    drive:"", tarefas:"Escopo cancelado por mudança de prioridade",
    tabela:"usr.cx_golden_layer.interaction_statuses", queues:"",
    evolucao:[30,30,30]
  },
  {
    id:"P006", titulo:"Aderência BPO — Piloto", lider:"Bianca Holanda", nivel:"M2",
    status:"Prorrogado", saude:"Em risco", metrica:"Aderência", baseline:78, target:90, real:82,
    semana:"2025-W25", cluster:"BPO", impacto:"Sim", volume:"15000",
    integrantes:["Felipe Eiji","Marilia Pinto","Marilena Levy"],
    drive:"", tarefas:"Contratação de BPO parceiro\nDefinição de SLA contratual",
    tabela:"", queues:"",
    evolucao:[78,79,80,82]
  },
];

/* ── ESTADO GLOBAL ──────────────────────────────────────────────────── */
let PROJETOS = [];
let CURRENT_PROJECT = null;
let EXEC_FILTER = "todos";
let modalChart = null;
let selectedIntegrantes = new Set();

/* ── UTILITÁRIOS ────────────────────────────────────────────────────── */

function $(id) { return document.getElementById(id); }

function toast(msg, tipo = "info") {
  const el = document.createElement("div");
  el.className = "toast " + tipo;
  el.innerHTML = (tipo === "success" ? "✅" : tipo === "error" ? "❌" : "ℹ️") + " " + msg;
  $("toast-container").appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function initials(nome) {
  if (!nome) return "?";
  const parts = nome.trim().split(" ");
  return (parts[0][0] + (parts[parts.length-1][0] || "")).toUpperCase();
}

function saudeEmoji(saude) {
  if (!saude) return "";
  if (saude.includes("prazo")) return "🟢";
  if (saude.includes("risco")) return "🟡";
  if (saude.includes("Bloq")) return "🔴";
  return "⚪";
}

function saudeBadgeClass(saude) {
  if (!saude) return "badge-gray";
  if (saude.includes("prazo")) return "badge-green";
  if (saude.includes("risco")) return "badge-yellow";
  if (saude.includes("Bloq")) return "badge-red";
  return "badge-gray";
}

function statusBadgeClass(status) {
  const map = {
    "Iniciado": "badge-blue",
    "Finalizado": "badge-green",
    "Prorrogado": "badge-yellow",
    "Cancelado": "badge-red",
    "Em Risco": "badge-yellow",
  };
  return map[status] || "badge-gray";
}

function resultadoBadge(p) {
  if (p.real === null || p.real === undefined || p.real === "") return '<span class="badge badge-gray">Sem dado</span>';
  const atingiu = Number(p.real) >= Number(p.target);
  return atingiu
    ? '<span class="badge badge-green">✓ Meta atingida</span>'
    : '<span class="badge badge-yellow">⚠ Abaixo do target</span>';
}

/* ── INICIALIZAÇÃO ──────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", () => {
  populateLiderSelect();
  populateWelcomeSelect();
  renderIntegrantesSearch("");
  loadUser();
  fetchProjetos();
});

function loadUser() {
  const nome = localStorage.getItem("nucel_user");
  if (!nome) {
    setTimeout(openWelcome, 600);
  } else {
    setUser(nome);
  }
}

function setUser(nome) {
  $("sidebarName").textContent = nome || "Identificar-me";
  $("sidebarInitials").textContent = initials(nome);
}

function openWelcome() {
  $("welcomeModal").classList.add("open");
}

function saveUser() {
  const sel = $("welcomeSelect");
  if (!sel.value) { toast("Selecione seu nome para continuar.", "error"); return; }
  localStorage.setItem("nucel_user", sel.value);
  setUser(sel.value);
  $("welcomeModal").classList.remove("open");
  toast("Bem-vindo(a), " + sel.value.split(" ")[0] + "! 👋", "success");
}

function populateWelcomeSelect() {
  const sel = $("welcomeSelect");
  const saved = localStorage.getItem("nucel_user") || "";
  MEMBROS.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = m;
    if (m === saved) opt.selected = true;
    sel.appendChild(opt);
  });
}

function populateLiderSelect() {
  const sel = $("fLider");
  LIDERES.forEach(l => {
    const opt = document.createElement("option");
    opt.value = l.nome;
    opt.textContent = l.nome + " (" + l.nivel + ")";
    sel.appendChild(opt);
  });
}

/* ── NAVEGAÇÃO ──────────────────────────────────────────────────────── */

const PAGE_TITLES = {
  exec: "Visão Executiva",
  projetos: "Todos os Projetos",
  lider: "Por Líder",
  novo: "Novo Projeto",
  dados: "Dados & Histórico",
  organograma: "Organograma",
};

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

  const pageEl = $("page-" + page);
  if (pageEl) pageEl.classList.add("active");

  const navItems = document.querySelectorAll(".nav-item");
  const idx = Object.keys(PAGE_TITLES).indexOf(page);
  if (navItems[idx]) navItems[idx].classList.add("active");

  $("topbarTitle").textContent = PAGE_TITLES[page] || page;

  if (page === "projetos") renderProjetosTable();
  if (page === "lider") renderLiderView();
}

/* ── DADOS ──────────────────────────────────────────────────────────── */

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
}

/* ── VISÃO EXECUTIVA ────────────────────────────────────────────────── */

function filterExec(filtro, el) {
  EXEC_FILTER = filtro;
  document.querySelectorAll("#execFilters .filter-chip").forEach(c => c.classList.remove("active"));
  el.classList.add("active");
  renderLeaderCards();
}

function getFilteredProjetos() {
  if (EXEC_FILTER === "todos") return PROJETOS;
  return PROJETOS.filter(p =>
    p.status === EXEC_FILTER || p.saude === EXEC_FILTER ||
    (EXEC_FILTER === "Em Risco" && p.saude && p.saude.includes("risco")) ||
    (EXEC_FILTER === "Bloqueado" && p.saude && p.saude.includes("Bloq"))
  );
}

function renderExecKPIs() {
  const total = PROJETOS.length;
  const finalizados = PROJETOS.filter(p => p.status === "Finalizado").length;
  const ativos = PROJETOS.filter(p => p.status === "Iniciado" || p.status === "Prorrogado").length;
  const lideres = new Set(PROJETOS.map(p => p.lider)).size;
  const comReal = PROJETOS.filter(p => p.real !== null && p.real !== undefined && p.real !== "");
  const sucessos = comReal.filter(p => Number(p.real) >= Number(p.target)).length;
  const taxa = comReal.length ? Math.round((sucessos / comReal.length) * 100) + "%" : "—";

  $("kpiTotal").textContent = total;
  $("kpiSucesso").textContent = taxa;
  $("kpiWip").textContent = ativos;
  $("kpiLideres").textContent = lideres;
}

function renderLeaderCards() {
  const projFiltrados = getFilteredProjetos();
  const container = $("leaderCards");

  if (!projFiltrados.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">Nenhum projeto neste filtro</div></div>';
    return;
  }

  const porLider = {};
  projFiltrados.forEach(p => {
    if (!porLider[p.lider]) porLider[p.lider] = { nivel: p.nivel || getNivel(p.lider), projetos: [] };
    porLider[p.lider].projetos.push(p);
  });

  container.innerHTML = Object.entries(porLider).map(([nome, dados]) => {
    const total = dados.projetos.length;
    const comReal = dados.projetos.filter(p => p.real !== null && p.real !== undefined && p.real !== "");
    const suc = comReal.filter(p => Number(p.real) >= Number(p.target)).length;
    const taxa = comReal.length ? Math.round((suc / comReal.length) * 100) : null;
    const statusSummary = dados.projetos.map(p =>
      `<span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>`
    ).join(" ");

    return `
      <div class="leader-card" onclick="filterByLider('${nome}')">
        <div class="leader-card-top">
          <div class="leader-avatar">${initials(nome)}</div>
          <div>
            <div class="leader-name">${nome}</div>
            <div class="leader-role">${dados.nivel} · ${total} projeto${total !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div class="leader-meta">${statusSummary}</div>
        ${taxa !== null ? `
          <div class="progress-bar" title="${taxa}% de sucesso">
            <div class="progress-fill" style="width:${taxa}%"></div>
          </div>
          <div style="font-size:11px;color:var(--text-3);margin-top:6px;">${taxa}% de sucesso (${suc}/${comReal.length})</div>
        ` : `<div style="font-size:11px;color:var(--text-3);margin-top:10px;">Sem métricas registradas</div>`}
      </div>`;
  }).join("");
}

function getNivel(nome) {
  const l = LIDERES.find(x => x.nome === nome);
  return l ? l.nivel : "";
}

function filterByLider(nome) {
  navigate("lider");
  setTimeout(() => {
    const acc = document.querySelector(`.accordion[data-lider="${nome}"]`);
    if (acc) { openAccordion(acc); acc.scrollIntoView({ behavior: "smooth", block: "start" }); }
  }, 100);
}

/* ── TABELA DE PROJETOS ─────────────────────────────────────────────── */

function renderProjetosTable() {
  const tbody = $("projetosBody");
  const query = ($("searchInput") ? $("searchInput").value : "").toLowerCase();
  const statusF = $("statusFilter") ? $("statusFilter").value : "";

  let filtrados = PROJETOS.filter(p => {
    const matchQ = !query || p.titulo.toLowerCase().includes(query) || (p.lider || "").toLowerCase().includes(query);
    const matchS = !statusF || p.status === statusF;
    return matchQ && matchS;
  });

  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="9"><div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">Nenhum projeto encontrado</div></div></td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(p => {
    const cls = p.saude && p.saude.includes("prazo") ? "row-success" :
                p.saude && p.saude.includes("risco") ? "row-risk" :
                p.saude && p.saude.includes("Bloq") ? "row-blocked" : "";
    const real = (p.real !== null && p.real !== undefined && p.real !== "") ? p.real : "—";
    return `
      <tr class="${cls}" onclick="openProjeto('${p.id}')">
        <td><strong>${p.titulo}</strong></td>
        <td>${p.lider || "—"}</td>
        <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
        <td>${saudeEmoji(p.saude)} ${p.saude || "—"}</td>
        <td>${p.metrica || "—"}</td>
        <td>${p.baseline !== undefined ? p.baseline : "—"}</td>
        <td>${p.target !== undefined ? p.target : "—"}</td>
        <td>${real}</td>
        <td>${resultadoBadge(p)}</td>
      </tr>`;
  }).join("");
}

/* ── POR LÍDER ──────────────────────────────────────────────────────── */

function renderLiderView() {
  const container = $("liderAccordions");
  const nivelOrder = ["M2", "M1", "IC5"];
  const porNivel = {};
  nivelOrder.forEach(n => porNivel[n] = {});

  PROJETOS.forEach(p => {
    const nivel = p.nivel || getNivel(p.lider) || "IC5";
    if (!porNivel[nivel]) porNivel[nivel] = {};
    if (!porNivel[nivel][p.lider]) porNivel[nivel][p.lider] = [];
    porNivel[nivel][p.lider].push(p);
  });

  container.innerHTML = nivelOrder.map(nivel => {
    const lideres = Object.entries(porNivel[nivel] || {});
    if (!lideres.length) return "";
    return `
      <div style="margin-bottom:8px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-3);margin-bottom:10px;padding-left:4px;">${nivel}</div>
        ${lideres.map(([nome, projs]) => accordionHtml(nome, projs)).join("")}
      </div>`;
  }).join("");
}

function accordionHtml(nome, projs) {
  const rows = projs.map(p => `
    <tr onclick="openProjeto('${p.id}')" style="cursor:pointer;">
      <td><strong>${p.titulo}</strong></td>
      <td><span class="badge ${statusBadgeClass(p.status)}">${p.status}</span></td>
      <td>${saudeEmoji(p.saude)} ${p.saude || "—"}</td>
      <td>${p.metrica || "—"}</td>
      <td>${p.target !== undefined ? p.target : "—"}</td>
      <td>${(p.real !== null && p.real !== undefined && p.real !== "") ? p.real : "—"}</td>
      <td>${resultadoBadge(p)}</td>
    </tr>`).join("");

  return `
    <div class="accordion" data-lider="${nome}">
      <div class="accordion-header" onclick="toggleAccordion(this.parentElement)">
        <div class="accordion-title">
          <div class="user-avatar" style="width:30px;height:30px;font-size:12px;">${initials(nome)}</div>
          ${nome}
          <span class="badge badge-purple">${projs.length}</span>
        </div>
        <span class="accordion-chevron">▼</span>
      </div>
      <div class="accordion-body">
        <div class="table-wrap">
          <table>
            <thead><tr><th>Projeto</th><th>Status</th><th>Saúde</th><th>Métrica</th><th>Target</th><th>Real</th><th>Resultado</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function toggleAccordion(el) {
  el.classList.toggle("open");
}

function openAccordion(el) {
  el.classList.add("open");
}

/* ── ONE-PAGER MODAL ────────────────────────────────────────────────── */

function openProjeto(id) {
  const p = PROJETOS.find(x => x.id === id);
  if (!p) return;
  CURRENT_PROJECT = p;

  $("modalTitulo").textContent = p.titulo;

  $("modalBadges").innerHTML = `
    <span class="badge ${statusBadgeClass(p.status)}">${p.status}</span>
    <span class="badge ${saudeBadgeClass(p.saude)}">${saudeEmoji(p.saude)} ${p.saude || "—"}</span>
    ${resultadoBadge(p)}
    ${p.impacto === "Sim" ? `<span class="badge badge-purple">👥 Impacto direto cliente${p.volume ? " · " + Number(p.volume).toLocaleString("pt-BR") : ""}</span>` : ""}
  `;

  $("modalGrid").innerHTML = `
    <div class="modal-field"><div class="modal-field-label">Líder</div><div class="modal-field-value">${p.lider || "—"}</div></div>
    <div class="modal-field"><div class="modal-field-label">Impacto / Cluster</div><div class="modal-field-value">${p.cluster || "—"}</div></div>
    <div class="modal-field"><div class="modal-field-label">Semana de entrega</div><div class="modal-field-value">${p.semana || "—"}</div></div>
    <div class="modal-field"><div class="modal-field-label">Queues</div><div class="modal-field-value">${p.queues || "Todas (nucel)"}</div></div>
    ${p.tarefas ? `<div class="modal-field" style="grid-column:1/-1"><div class="modal-field-label">Tarefas</div><div class="modal-field-value" style="white-space:pre-line;font-weight:400;">${p.tarefas}</div></div>` : ""}
  `;

  const real = (p.real !== null && p.real !== undefined && p.real !== "") ? p.real : null;
  const realColor = real !== null
    ? (Number(real) >= Number(p.target) ? "var(--green)" : "var(--yellow)")
    : "var(--text-3)";

  $("modalMetrica").innerHTML = `
    <div class="metric-display">
      <div class="metric-step">
        <div class="metric-step-label">Métrica</div>
        <div class="metric-step-value" style="font-size:16px;color:var(--nu-purple);">${p.metrica || "—"}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Baseline</div>
        <div class="metric-step-value">${p.baseline !== undefined ? p.baseline : "—"}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Target</div>
        <div class="metric-step-value" style="color:var(--blue)">${p.target !== undefined ? p.target : "—"}</div>
      </div>
      <div class="metric-arrow">→</div>
      <div class="metric-step">
        <div class="metric-step-label">Real</div>
        <div class="metric-step-value" style="color:${realColor}">${real !== null ? real : "—"}</div>
      </div>
    </div>
  `;

  const ints = (p.integrantes || []);
  $("modalIntegrantes").innerHTML = ints.length ? `
    <div style="margin-bottom:12px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:var(--text-3);margin-bottom:8px;">Integrantes</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${ints.map(i => `<span class="chip">👤 ${i.split(" ")[0]}@</span>`).join("")}
      </div>
    </div>` : "";

  $("modalActions").innerHTML = `
    ${p.drive ? `<a href="${p.drive}" target="_blank" class="btn btn-secondary btn-sm">↗ Drive</a>` : ""}
    <button class="btn btn-ghost btn-sm" onclick="window.print()">🖨 Imprimir</button>
    <button class="btn btn-primary btn-sm" onclick="notifySlack()">💬 Notificar time</button>
  `;

  renderModalChart(p);
  $("projetoModal").classList.add("open");
}

function renderModalChart(p) {
  if (modalChart) { modalChart.destroy(); modalChart = null; }

  const canvas = $("modalChart");
  const evolucao = p.evolucao || [p.baseline];
  const labels = evolucao.map((_, i) => "W" + (i + 1));
  const theme = document.documentElement.getAttribute("data-theme");
  const gridColor = theme === "dark" ? "rgba(255,255,255,.06)" : "rgba(0,0,0,.06)";
  const textColor = theme === "dark" ? "#7B6B8D" : "#7B6B8D";

  modalChart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: p.metrica || "Métrica",
          data: evolucao,
          borderColor: "#820AD1",
          backgroundColor: "rgba(130,10,209,.1)",
          tension: .4,
          fill: true,
          pointRadius: 4,
          pointBackgroundColor: "#820AD1",
        },
        {
          label: "Target",
          data: evolucao.map(() => p.target),
          borderColor: "#3B82F6",
          borderDash: [6, 3],
          tension: 0,
          fill: false,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
      scales: {
        x: { grid: { color: gridColor }, ticks: { color: textColor } },
        y: { grid: { color: gridColor }, ticks: { color: textColor } },
      },
    },
  });
}

function closeModal(e) {
  if (e.target === $("projetoModal")) closeModalDirect();
}

function closeModalDirect() {
  $("projetoModal").classList.remove("open");
  if (modalChart) { modalChart.destroy(); modalChart = null; }
  CURRENT_PROJECT = null;
}

/* ── INTEGRANTES SEARCH ─────────────────────────────────────────────── */

function renderIntegrantesSearch(query) {
  const grid = $("intGrid");
  const q = query.toLowerCase();
  const filtrados = MEMBROS.filter(m => !q || m.toLowerCase().includes(q));

  grid.innerHTML = filtrados.map(m => `
    <label class="integrante-item" onclick="toggleIntegrante('${m}', event)">
      <input type="checkbox" ${selectedIntegrantes.has(m) ? "checked" : ""} />
      ${m}
    </label>`).join("");
}

function toggleIntegrante(nome, event) {
  event.preventDefault();
  if (selectedIntegrantes.has(nome)) {
    selectedIntegrantes.delete(nome);
  } else {
    selectedIntegrantes.add(nome);
  }
  renderIntegrantesSearch($("intSearch") ? $("intSearch").value : "");
  renderSelectedChips();
}

function renderSelectedChips() {
  const container = $("selectedChips");
  container.innerHTML = [...selectedIntegrantes].map(m => `
    <span class="chip">${m} <button onclick="removeIntegrante('${m}')">×</button></span>
  `).join("");
}

function removeIntegrante(nome) {
  selectedIntegrantes.delete(nome);
  renderIntegrantesSearch($("intSearch") ? $("intSearch").value : "");
  renderSelectedChips();
}

/* ── FORM HELPERS ───────────────────────────────────────────────────── */

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

/* ── SUBMIT NOVO PROJETO ────────────────────────────────────────────── */

function nextId() {
  const existing = new Set(PROJETOS.map(p => p.id));
  let n = PROJETOS.length + 1;
  let id = "P" + String(n).padStart(3, "0");
  while (existing.has(id)) { n++; id = "P" + String(n).padStart(3, "0"); }
  return id;
}

async function submitNovoProjeto(event) {
  event.preventDefault();

  const saudeInput = document.querySelector('input[name="saude"]:checked');
  const impactoInput = document.querySelector('input[name="impacto"]:checked');
  const canais = [...document.querySelectorAll('input[name="canal"]:checked')].map(c => c.value);

  const projeto = {
    id: nextId(),
    titulo: $("fTitulo") ? $("fTitulo").value : "",
    lider: $("fLider") ? $("fLider").value : "",
    nivel: getNivel($("fLider") ? $("fLider").value : ""),
    status: $("fStatus") ? $("fStatus").value : "Iniciado",
    semana: $("fSemana") ? $("fSemana").value : "",
    cluster: $("fCluster") ? $("fCluster").value : "",
    saude: saudeInput ? saudeInput.value : "No prazo",
    baseline: $("fBaseline") ? Number($("fBaseline").value) || 0 : 0,
    impacto: impactoInput ? impactoInput.value : "Não",
    volume: $("fVolume") ? $("fVolume").value : "",
    integrantes: [...selectedIntegrantes],
    metrica: $("fMetrica") ? $("fMetrica").value : "",
    target: $("fTarget") ? Number($("fTarget").value) || 0 : 0,
    tabela: $("fTabela") ? $("fTabela").value : "",
    canais,
    queues: $("fQueues") ? $("fQueues").value : "",
    drive: $("fDrive") ? $("fDrive").value : "",
    tarefas: $("fTarefas") ? $("fTarefas").value : "",
    real: null,
    evolucao: [$("fBaseline") ? Number($("fBaseline").value) || 0 : 0],
  };

  const btn = $("submitBtn");
  const txt = $("submitText");
  btn.disabled = true;
  txt.textContent = "⏳ Salvando...";

  // Adiciona localmente já
  PROJETOS.push(projeto);
  renderAll();

  // Fire-and-forget: salva no Sheets
  saveToSheets(projeto);
  // Fire-and-forget: notifica Slack
  notifySlackNew(projeto);

  toast("Projeto salvo com sucesso!", "success");
  resetForm();
  navigate("projetos");

  btn.disabled = false;
  txt.textContent = "✓ Salvar Projeto";
}

function resetForm() {
  if ($("novoForm")) $("novoForm").reset();
  selectedIntegrantes.clear();
  renderIntegrantesSearch("");
  renderSelectedChips();
  document.querySelectorAll(".radio-btn").forEach(b => b.classList.remove("selected"));
  document.querySelectorAll('.radio-btn input[type="radio"]:checked').forEach(r => {
    r.closest(".radio-btn").classList.add("selected");
  });
  document.querySelectorAll(".checkbox-chip").forEach(c => {
    c.classList.add("selected");
    const cb = c.querySelector("input"); if (cb) cb.checked = true;
  });
}

/* ── API CALLS ──────────────────────────────────────────────────────── */

async function saveToSheets(projeto) {
  try {
    await fetch("/api/projetos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projeto),
    });
  } catch (e) {
    console.warn("Sheets save failed:", e);
  }
}

async function notifySlackNew(projeto) {
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "novo_projeto", projeto }),
    });
  } catch (e) {
    console.warn("Slack notify failed:", e);
  }
}

async function notifySlack() {
  if (!CURRENT_PROJECT) return;
  try {
    await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo: "update_projeto", projeto: CURRENT_PROJECT }),
    });
    toast("Time notificado no Slack! 💬", "success");
  } catch {
    toast("Erro ao notificar Slack.", "error");
  }
}

/* ── TEMA ────────────────────────────────────────────────────────────── */

function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  $("themeToggle") && ($("themeToggle").textContent = next === "dark" ? "☀️" : "🌙");
  document.querySelector(".theme-toggle").textContent = next === "dark" ? "☀️" : "🌙";
  localStorage.setItem("nucel_theme", next);

  // Re-render chart if open with new colors
  if (CURRENT_PROJECT) renderModalChart(CURRENT_PROJECT);
}

// Restore theme
(function () {
  const t = localStorage.getItem("nucel_theme");
  if (t) {
    document.documentElement.setAttribute("data-theme", t);
    const btn = document.querySelector(".theme-toggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }
})();
