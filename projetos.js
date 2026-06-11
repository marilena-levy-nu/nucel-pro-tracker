// api/projetos.js — NuCel Pro Tracker
// GET /api/projetos → lista projetos
// POST /api/projetos → cria projeto + audit log
// PUT /api/projetos → atualiza projeto
// NUNCA usar crypto.subtle — usar require("crypto") Node.js nativo

const crypto = require("crypto");

const SHEET_ID      = process.env.SHEET_ID;
const SHEET_AUDIT   = process.env.SHEET_AUDIT_ID;
const SA_JSON       = process.env.GOOGLE_SERVICE_ACCOUNT;

function getServiceAccount() {
  try { return JSON.parse(SA_JSON); }
  catch { return null; }
}

function base64url(buf) {
  return buf.toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function getAccessToken() {
  const sa = getServiceAccount();
  if (!sa) throw new Error("GOOGLE_SERVICE_ACCOUNT não configurado");

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })));

  const sign = crypto.createSign("RSA-SHA256");
  sign.update(header + "." + payload);
  const sig = base64url(sign.sign(sa.private_key));

  const jwt = header + "." + payload + "." + sig;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Token inválido: " + JSON.stringify(data));
  return data.access_token;
}

async function sheetsGet(token, spreadsheetId, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: "Bearer " + token } });
  return res.json();
}

async function sheetsAppend(token, spreadsheetId, range, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
  return res.json();
}

async function sheetsUpdate(token, spreadsheetId, range, values) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ values }),
  });
  return res.json();
}

function rowToProject(row) {
  if (!row || !row[0]) return null;
  return {
    id:          row[0]  || "",
    titulo:      row[1]  || "",
    lider:       row[2]  || "",
    nivel:       row[3]  || "",
    status:      row[4]  || "",
    saude:       row[5]  || "",
    semana:      row[6]  || "",
    cluster:     row[7]  || "",
    metrica:     row[8]  || "",
    baseline:    row[9]  !== "" ? Number(row[9])  : undefined,
    target:      row[10] !== "" ? Number(row[10]) : undefined,
    real:        row[11] !== "" ? Number(row[11]) : null,
    impacto:     row[12] || "",
    volume:      row[13] || "",
    integrantes: row[14] ? row[14].split("|").filter(Boolean) : [],
    tabela:      row[15] || "",
    queues:      row[16] || "",
    drive:       row[17] || "",
    tarefas:     row[18] || "",
    evolucao:    row[19] ? row[19].split(",").map(Number) : [],
  };
}

function projectToRow(p) {
  return [
    p.id        || "",
    p.titulo    || "",
    p.lider     || "",
    p.nivel     || "",
    p.status    || "",
    p.saude     || "",
    p.semana    || "",
    p.cluster   || "",
    p.metrica   || "",
    p.baseline  !== undefined ? p.baseline  : "",
    p.target    !== undefined ? p.target    : "",
    p.real      !== null && p.real !== undefined ? p.real : "",
    p.impacto   || "",
    p.volume    || "",
    (p.integrantes || []).join("|"),
    p.tabela    || "",
    p.queues    || "",
    p.drive     || "",
    p.tarefas   || "",
    (p.evolucao || []).join(","),
  ];
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!SHEET_ID || !SA_JSON) {
    // Retorna mock se não configurado
    return res.status(200).json([]);
  }

  try {
    const token = await getAccessToken();

    // ── GET ────────────────────────────────────────────────────────────
    if (req.method === "GET") {
      const data = await sheetsGet(token, SHEET_ID, "Projetos!A2:T");
      const rows = data.values || [];
      const projetos = rows.map(rowToProject).filter(Boolean);
      return res.status(200).json(projetos);
    }

    // ── POST ───────────────────────────────────────────────────────────
    if (req.method === "POST") {
      const p = req.body;
      const row = projectToRow(p);

      // Salva no BD Projetos
      await sheetsAppend(token, SHEET_ID, "Projetos!A:T", [row]);

      // Salva no Audit Log
      if (SHEET_AUDIT) {
        const auditRow = [
          new Date().toISOString(),
          "CREATE",
          p.id || "",
          p.titulo || "",
          p.lider || "",
          (req.headers["x-forwarded-for"] || "").split(",")[0] || "",
        ];
        await sheetsAppend(token, SHEET_AUDIT, "Log!A:F", [auditRow]).catch(() => {});
      }

      return res.status(200).json({ ok: true, id: p.id });
    }

    // ── PUT ────────────────────────────────────────────────────────────
    if (req.method === "PUT") {
      const p = req.body;
      // Busca linha do projeto pelo ID
      const data = await sheetsGet(token, SHEET_ID, "Projetos!A:A");
      const ids = (data.values || []).map(r => r[0]);
      const rowIndex = ids.findIndex(id => id === p.id);
      if (rowIndex === -1) return res.status(404).json({ error: "Projeto não encontrado" });

      const range = `Projetos!A${rowIndex + 1}:T${rowIndex + 1}`;
      await sheetsUpdate(token, SHEET_ID, range, [projectToRow(p)]);

      // Audit
      if (SHEET_AUDIT) {
        const auditRow = [
          new Date().toISOString(),
          "UPDATE",
          p.id || "",
          p.titulo || "",
          p.lider || "",
          "",
        ];
        await sheetsAppend(token, SHEET_AUDIT, "Log!A:F", [auditRow]).catch(() => {});
      }

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    console.error("[projetos.js]", err);
    return res.status(500).json({ error: err.message });
  }
};
