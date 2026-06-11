// ── NuCel Pro Tracker — Projetos API (Google Sheets) ─────────

async function getAccessToken(credentials) {
  const now  = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now
  };
  const header  = btoa(JSON.stringify({ alg:"RS256", typ:"JWT" })).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const payload = btoa(JSON.stringify(claim)).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const toSign  = `${header}.${payload}`;
  const pemBody = credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,"");
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyData.buffer, { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const jwt = `${toSign}.${sigB64}`;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  return (await r.json()).access_token;
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
    job:             row[7]  || "",
    status:          row[8]  || "",
    saude:           row[9]  || "no_prazo",
    target:          row[10] || "",
    baseline:        row[11] || "—",
    real:            row[12] || "—",
    result:          row[13] || "pending",
    semana:          row[14] || "",
    impacto_cliente: row[15] || "Não",
    volume_cliente:  row[16] || "",
    db_table:        row[17] || "",
    integrantes:     row[18] || "",
    drive:           row[19] || "",
    historico:       row[20] || ""
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
  const sheetId = process.env.SHEET_ID;
  if (!creds.client_email || !sheetId) {
    return res.status(200).json([]);
  }

  const token = await getAccessToken(creds);
  const base  = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}`;
  const auth  = { Authorization: `Bearer ${token}` };

  if (req.method === "GET") {
    const r = await fetch(`${base}/values/Projetos!A2:U`, { headers: auth });
    const d = await r.json();
    const projetos = (d.values || []).filter(row => row[0]).map(rowToProject);
    return res.status(200).json(projetos);
  }

  if (req.method === "POST") {
    const p = req.body;
    await fetch(`${base}/values/Projetos!A1:append?valueInputOption=USER_ENTERED`  // BUG 10 FIX, {
      method: "POST", headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[
        p.id, p.title, p.meta, p.lider, p.cluster,
        p.queue, p.queues, p.job, p.status, p.saude || "no_prazo",
        p.target, p.baseline || "—", p.real || "—", p.result || "pending",
        p.semana, p.impacto_cliente || "Não", p.volume_cliente || "",
        p.db_table || "", p.integrantes || "", p.drive || "", ""
      ]] })
    });
    if (process.env.SHEET_AUDIT_ID) {
      const auditBase = `https://sheets.googleapis.com/v4/spreadsheets/${process.env.SHEET_AUDIT_ID}`;
      await fetch(`${auditBase}/values/Log!A1:append?valueInputOption=USER_ENTERED`  // BUG 10 FIX, {
        method: "POST", headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [[new Date().toLocaleDateString("pt-BR"), "Portal", "CREATE", p.id, p.title, p.lider, p.status]] })
      });
    }
    return res.status(200).json({ ok: true, id: p.id });
  }

  if (req.method === "PUT") {
    const p = req.body;
    const getR = await fetch(`${base}/values/Projetos!A:A`, { headers: auth });
    const getData = await getR.json();
    const rows = getData.values || [];
    const rowIdx = rows.findIndex(r => r[0] === p.id);
    if (rowIdx < 0) return res.status(404).json({ error: "Project not found" });
    const sheetRow = rowIdx + 1;
    await fetch(`${base}/values/Projetos!A${sheetRow}:U${sheetRow}?valueInputOption=USER_ENTERED`, {
      method: "PUT", headers: { ...auth, "Content-Type": "application/json" },
      body: JSON.stringify({ values: [[
        p.id, p.title, p.meta, p.lider, p.cluster,
        p.queue, p.queues, p.job, p.status, p.saude || "no_prazo",
        p.target, p.baseline || "—", p.real || "—", p.result || "pending",
        p.semana, p.impacto_cliente || "Não", p.volume_cliente || "",
        p.db_table || "", p.integrantes || "", p.drive || "", p.historico || ""
      ]] })
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
