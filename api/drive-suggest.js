// ── NuCel Pro Tracker — Drive Doc Reader + Task Suggester ────
// Lê um Google Doc e usa Claude API para sugerir tarefas
// Também busca docs relacionados no Drive do time

async function getGoogleToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: credentials.client_email, scope: "https://www.googleapis.com/auth/drive.readonly", aud: "https://oauth2.googleapis.com/token", exp: now + 3600, iat: now };
  const header  = btoa(JSON.stringify({ alg:"RS256", typ:"JWT" })).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const payload = btoa(JSON.stringify(claim)).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const toSign  = `${header}.${payload}`;
  const pemBody = credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g,"");
  const keyData = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", keyData.buffer, { name:"RSASSA-PKCS1-v1_5", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(toSign));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[=+/]/g, c => ({"+":"-","/":"_","=":""}[c]));
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:`grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${toSign}.${sigB64}`
  });
  return (await r.json()).access_token;
}

// Extrai file ID de URLs do Google Drive/Docs
function extractFileId(url) {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).end();

  const { action, url, query } = req.body;
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT || "{}");
  if (!creds.client_email) return res.status(500).json({ error: "No service account" });

  const token = await getGoogleToken(creds);

  // ── Ação 1: Ler doc e sugerir tarefas via Claude ─────────
  if (action === "suggest_tasks") {
    const fileId = extractFileId(url);
    if (!fileId) return res.status(400).json({ error: "URL inválida" });

    // Lê conteúdo do Google Doc como texto
    const docRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${fileId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!docRes.ok) return res.status(400).json({ error: "Não foi possível ler o documento. Verifique se está compartilhado com a Service Account." });

    const doc = await docRes.json();
    const title = doc.title || "Documento";

    // Extrai texto do documento
    let content = "";
    (doc.body?.content || []).forEach(elem => {
      (elem.paragraph?.elements || []).forEach(el => {
        if (el.textRun?.content) content += el.textRun.content;
      });
    });
    content = content.slice(0, 3000); // Limita para não estourar contexto

    // Chama Claude para sugerir tarefas
    const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Você é um especialista em gestão de projetos operacionais para o time NuCel da Nubank.

Analise o documento abaixo e sugira de 5 a 8 tarefas práticas e objetivas para o líder do projeto executar.
As tarefas devem ser acionáveis, específicas e focadas em resultado operacional.
Responda SOMENTE em JSON neste formato, sem markdown:
{"tarefas": ["Tarefa 1", "Tarefa 2", ...]}

Título do documento: ${title}
Conteúdo:
${content}`
        }]
      })
    });

    const claudeData = await claudeRes.json();
    const text = claudeData.content?.[0]?.text || '{"tarefas":[]}';
    try {
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim());
      return res.status(200).json({ title, tarefas: parsed.tarefas || [] });
    } catch {
      return res.status(200).json({ title, tarefas: [] });
    }
  }

  // ── Ação 2: Buscar docs relacionados no Drive ────────────
  if (action === "search_docs") {
    const q = encodeURIComponent(`name contains '${query}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`);
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await driveRes.json();
    return res.status(200).json({ docs: data.files || [] });
  }

  return res.status(400).json({ error: "Unknown action" });
}
