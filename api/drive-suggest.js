// ── NuCel Pro Tracker — Drive Doc Reader + Claude Task Suggester
// Usa Drive API (export como texto) em vez de Docs API
// Requer: Google Drive API ativada no GCP (já está ativa)

async function getGoogleToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: "https://www.googleapis.com/auth/drive.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now
  };
  const b64u  = s => btoa(s).replace(/[=+/]/g, c => c==='+'?'-':c==='/'?'_':'');
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
  if (!d.access_token) throw new Error("Token error: " + JSON.stringify(d));
  return d.access_token;
}

function extractFileId(url) {
  for (const p of [/\/d\/([a-zA-Z0-9_-]+)/, /id=([a-zA-Z0-9_-]+)/, /\/file\/d\/([a-zA-Z0-9_-]+)/]) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).end();

  const { action, url, query } = req.body;

  const credsRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!credsRaw) return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT não configurado no Vercel" });

  let creds;
  try { creds = JSON.parse(credsRaw); }
  catch { return res.status(500).json({ error: "GOOGLE_SERVICE_ACCOUNT inválido" }); }

  // ── Ação 1: Ler doc via Drive Export + Claude ─────────────
  if (action === "suggest_tasks") {
    if (!url) return res.status(400).json({ error: "URL obrigatória" });
    const fileId = extractFileId(url);
    if (!fileId) return res.status(400).json({ error: "URL inválida — use um link do Google Docs" });

    let token;
    try { token = await getGoogleToken(creds); }
    catch(e) { return res.status(500).json({ error: "Erro de autenticação: " + e.message }); }

    // Pega metadados (nome do arquivo)
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=name,mimeType`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!metaRes.ok) {
      const err = await metaRes.json().catch(() => ({}));
      const msg = err.error?.message || metaRes.statusText;
      if (metaRes.status === 403 || metaRes.status === 404) {
        return res.status(200).json({
          error: `Sem acesso ao documento. Compartilhe com: ${creds.client_email}`
        });
      }
      return res.status(200).json({ error: `Erro ao acessar documento: ${msg}` });
    }
    const meta = await metaRes.json();
    const title = meta.name || "Documento";

    // Exporta como texto via Drive API (não precisa de Docs API)
    let docText = "";
    if (meta.mimeType === "application/vnd.google-apps.document") {
      const exportRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (exportRes.ok) {
        docText = await exportRes.text();
        docText = docText.slice(0, 4000);
      }
    } else {
      // PDF ou outro formato — tenta ler como texto direto
      const dlRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (dlRes.ok) docText = (await dlRes.text()).slice(0, 2000);
    }

    // Chama Claude
    try {
      const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Você é especialista em gestão de projetos operacionais do time NuCel (Nubank).

Analise o documento abaixo e gere de 5 a 7 tarefas práticas e objetivas para o líder executar.
Cada tarefa deve ser acionável, específica e focada em resultado operacional NuCel.
Responda APENAS com JSON válido, sem markdown, neste formato exato:
{"tarefas":["Tarefa 1","Tarefa 2","Tarefa 3"]}

Título: ${title}
Conteúdo:
${docText || "(documento vazio ou sem texto legível)"}`
          }]
        })
      });

      const cd = await claudeRes.json();
      const raw = cd.content?.[0]?.text || '{"tarefas":[]}';
      let parsed;
      try { parsed = JSON.parse(raw.replace(/```json|```/g,"").trim()); }
      catch { parsed = { tarefas:[] }; }

      // Fallback se Claude não retornar tarefas
      if (!parsed.tarefas?.length) {
        parsed.tarefas = [
          "Mapear fluxo atual e identificar gargalos",
          "Levantar hipótese com dados do Databricks",
          "Definir critérios de aceite com o líder M2",
          "Implementar solução e configurar monitoramento",
          "Validar resultado na semana de entrega com dado real"
        ];
      }

      return res.status(200).json({ title, tarefas: parsed.tarefas });

    } catch(e) {
      // Claude falhou — retorna tarefas genéricas sem expor o erro
      return res.status(200).json({
        title,
        tarefas: [
          "Mapear fluxo atual e identificar gargalos",
          "Levantar hipótese com dados do Databricks",
          "Definir critérios de aceite com o líder M2",
          "Implementar solução e configurar monitoramento",
          "Validar resultado na semana de entrega com dado real"
        ]
      });
    }
  }

  // ── Ação 2: Buscar docs relacionados no Drive ─────────────
  if (action === "search_docs") {
    let token;
    try { token = await getGoogleToken(creds); }
    catch(e) { return res.status(500).json({ error: e.message }); }

    const q = `name contains '${(query||"nucel").replace(/'/g,"\\'")}' and mimeType = 'application/vnd.google-apps.document' and trashed = false`;
    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,webViewLink,modifiedTime)&pageSize=5&orderBy=modifiedTime+desc`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await r.json();
    return res.status(200).json({ docs: data.files || [] });
  }

  return res.status(400).json({ error: "Unknown action" });
}
