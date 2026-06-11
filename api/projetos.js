// ── NuCel Pro Tracker — Projetos API (Google Sheets) ─────────
const nodeCrypto = require("crypto");

async function getAccessToken(credentials) {
  const now   = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now
  };
  const b64u    = s => Buffer.from(s).toString("base64url");
  const header  = b64u(JSON.stringify({ alg:"RS256", typ:"JWT" }));
  const payload = b64u(JSON.stringify(claim));
  const toSign  = `${header}.${payload}`;
  const sign    = nodeCrypto.createSign("RSA-SHA256");
  sign.update(toSign);
  const sig = sign.sign(credentials.private_key, "base64")
    .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${toSign}.${sig}`
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("Token error: " + JSON.stringify(d));
  return d.access_token;
}

function rowToProject(row) {
  return {
    id:              row[0]  || "",
    title:           row[1]  || "",
    meta:            row[2]  || "",
    lider:           row[3]  || "",
    cluster:         row[4]  || "",
    queue:           row[5]  || "",
    queues:          row[6]  || "",
    job:             row[7]  || "—",
    status:          row[8]  || "Iniciado",
    saude:           row[9]  || "no_prazo",
    target:          row[10] || "—",
    baseline:        row[11] || "—",
    real:            row[12] || "—",
    result:          row[13] || "pending",
    semana:          row[14] || "",
    impacto_cliente: row[15] || "Não",
    volume_cliente:  row[16] || "",
    db_table:        row[17] || "",
    channels:        row[18] ? row[18].split(",") : [],
    integrantes:     row[19] || "",
    drive:           row[20] || "",
    historico:       row[21] || ""
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  const sheetId  = process.env.SHEET_ID;
  if (!credsRaw || !sheetId) return res.status(200).json([]);

  let creds;
  try { creds = JSON.parse(credsRaw); }
  catch { return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT inválido" }); }

  let token;
  try { token = await getAccessToken(creds); }
  catch(e) { return res.status(500).json({ error: e.message }); }

  const base = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const auth = { Authorization: `Bearer ${token}` };

  // ── GET ───────────────────────────────────────────────────
  if (req.method === "GET") {
    const r = await fetch(`${base}/values/Projetos!A2:V`, { headers: auth });
    const d = await r.json();
    const projetos = (d.values || []).filter(row => row[0]).map(rowToProject);
    return res.status(200).json(projetos);
  }

  // ── POST — criar projeto ──────────────────────────────────
  if (req.method === "POST") {
    const p = req.body;
    const channels = Array.isArray(p.channels) ? p.channels.join(",") : (p.channels || "");
    const row = [[
      p.id, p.title, p.meta, p.lider, p.cluster,
      p.queue, p.queues, p.job || "—", p.status, p.saude || "no_prazo",
      p.target, p.baseline || "—", p.real || "—", p.result || "pending",
      p.semana, p.impacto_cliente || "Não", p.volume_cliente || "",
      p.db_table || "", channels, p.integrantes || "", p.drive || "", ""
    ]];
    await fetch(`${base}/values/Projetos!A1:append?valueInputOption=USER_ENTERED`, {
      method:"POST", headers:{ ...auth, "Content-Type":"application/json" },
      body: JSON.stringify({ values: row })
    });

    // Audit Log
    if (process.env.SHEET_AUDIT_ID) {
      const ab = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_AUDIT_ID}`;
      const dt = new Date().toLocaleString("pt-BR");
      await fetch(`${ab}/values/Log!A1:append?valueInputOption=USER_ENTERED`, {
        method:"POST", headers:{ ...auth, "Content-Type":"application/json" },
        body: JSON.stringify({ values:[[dt, "Portal", "CREATE", p.id, p.title, p.lider, p.status]] })
      });
    }
    return res.status(200).json({ ok: true, id: p.id });
  }

  // ── PUT — atualizar projeto ───────────────────────────────
  if (req.method === "PUT") {
    const p = req.body;
    const getR = await fetch(`${base}/values/Projetos!A:A`, { headers: auth });
    const getData = await getR.json();
    const rows = getData.values || [];
    const rowIdx = rows.findIndex(r => r[0] === p.id);
    if (rowIdx < 0) return res.status(404).json({ error: "Projeto não encontrado" });
    const sheetRow = rowIdx + 1;
    const channels = Array.isArray(p.channels) ? p.channels.join(",") : (p.channels || "");
    await fetch(`${base}/values/Projetos!A${sheetRow}:V${sheetRow}?valueInputOption=USER_ENTERED`, {
      method:"PUT", headers:{ ...auth, "Content-Type":"application/json" },
      body: JSON.stringify({ values:[[
        p.id, p.title, p.meta, p.lider, p.cluster,
        p.queue, p.queues, p.job || "—", p.status, p.saude || "no_prazo",
        p.target, p.baseline || "—", p.real || "—", p.result || "pending",
        p.semana, p.impacto_cliente || "Não", p.volume_cliente || "",
        p.db_table || "", channels, p.integrantes || "", p.drive || "", p.historico || ""
      ]] })
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
};
