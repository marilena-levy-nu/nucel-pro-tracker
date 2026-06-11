// ── NuCel Pro Tracker — Drive Doc Reader + Claude Task Suggester

async function getGoogleToken(credentials, scope) {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope,
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now
  };
  const b64u  = s => btoa(s).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const header  = b64u(JSON.stringify({ alg:"RS256", typ:"JWT" }));
  const payload = b64u(JSON.stringify(claim));
  const toSign  = `${header}.${payload}`;
  const pemBody = credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,"");
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8", keyData.buffer,
    { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]
  );
  const sig    = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  const sigB64 = b64u(btoa(String.fromCharCode(...new Uint8Array(sig))));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST",
    headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${toSign}.${sigB64}`
  });
  const d = await r.json();
  if (!d.access_token) throw new Error("Failed to get Google token: " + JSON.stringify(d));
  return d.access_token;
}

function extractFileId(url) {
  for (const p of [/\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /\/file\/d\/([a-zA-Z0-9_-]+)/]) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractDocText(doc) {
  let text = "";
  const walk = elems => {
    for (const e of (elems || [])) {
      if (e.textRun?.content) text += e.textRun.content;
      if (e.paragraph?.elements) walk(e.paragraph.elements);
      if (e.table) e.table.tableRows?.forEach(r => r.tableCells?.forEach(c => walk(c.content)));
    }
  };
  walk(doc.body?.content);
  return text.slice(0, 4000);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).end();

  const { action, url, query } = req.body;

  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credsRaw) return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT not set" });
  const creds = JSON.parse(credsRaw);

  // ── Ação 1: Ler doc + sugerir tarefas com Claude ─────────
  if (action === "suggest_tasks") {
    if (!url) return res.status(400).json({ error: "URL obrigatória" });
    const fileId = extractFileId(url);
    if (!fileId) return res.status(400).json({ error: "URL inválida — use um link do Google Docs ou Drive" });

    let docTitle = "Documento", docText = "";
    try {
      const token = await getGoogleToken(creds,
        "https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/drive.readonly"
      );
      const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${fileId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!docRes.ok) {
        const err = await docRes.json();
        return res.status(400).json({
          error: `Não foi possível ler o documento (${docRes.status}). Verifique se o doc está compartilhado com: ${creds.client_email}`
        });
      }
      const doc = await docRes.json();
      docTitle = doc.title || "Documento";
      docText  = extractDocText(doc);
    } catch(e) {
      return res.status(500).json({ error: "Erro ao ler documento: " + e.message });
    }

    // Chama Claude para sugerir tarefas
    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Você é especialista em gestão de projetos operacionais do time NuCel (Nubank).

Analise o documento abaixo e gere de 5 a 8 tarefas práticas e objetivas para o líder executar.
Cada tarefa deve ser acionável, específica e focada em resultado operacional NuCel.
Responda APENAS com JSON válido, sem markdown, neste formato:
{"tarefas": ["Tarefa 1", "Tarefa 2", "Tarefa 3"]}

Título: ${docTitle}
Conteúdo:
${docText || "(documento sem texto legível)"}`
          }]
        })
      });

      const claudeData = await claudeRes.json();
      const raw = claudeData.content?.[0]?.text || '{"tarefas":[]}';

      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
      catch { parsed = { tarefas: ["Mapear fluxo atual","Validar hipótese no Databricks","Definir critérios de aceite","Implementar e monitorar","Apresentar resultado com dado real"] }; }

      return res.status(200).json({ title: docTitle, tarefas: parsed.tarefas || [] });
    } catch(e) {
      // Se Claude falhar, retorna tarefas genéricas
      return res.status(200).json({
        title: docTitle,
        tarefas: [
          "Mapear fluxo atual e identificar gargalos",
          "Levantar hipótese de melhoria com dados do Databricks",
          "Definir critérios de aceite com o líder M2",
          "Implementar solução e configurar monitoramento",
          "Validar resultado na semana de entrega com dado real"
        ],
        warning: "Sugestões genéricas (Claude indisponível)"
      });
    }
  }

  // ── Ação 2: Buscar docs no Drive ─────────────────────────
  if (action === "search_docs") {
    try {
      const token = await getGoogleToken(creds, "https://www.googleapis.com/auth/drive.readonly");
      const q = encodeURIComponent(
        `(name contains '${(query||"nucel").replace(/'/g,"\\'")}' or fullText contains '${(query||"nucel").replace(/'/g,"\\'")}') and mimeType = 'application/vnd.google-apps.document' and trashed = false`
      );
      const r = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=5&orderBy=modifiedTime desc`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await r.json();
      return res.status(200).json({ docs: data.files || [] });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
}
