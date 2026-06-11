// ── NuCel Pro Tracker — Slack Notifications ──────────────────
module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return res.status(200).json({ ok: true, skipped: true });

  const { type, projeto: p } = req.body;

  const saude = { no_prazo:"🟢 No prazo", em_risco:"🟡 Em risco", bloqueado:"🔴 Bloqueado" };
  const result = { success:"✅ Sucesso", fail:"❌ Não atingido", pending:"⏳ Em apuração" };

  const messages = {
    // Notificação ao criar projeto
    novo_projeto: {
      blocks: [
        { type:"header", text:{ type:"plain_text", text:"🚀 Novo projeto — NuCel Pro Tracker", emoji:true } },
        { type:"section", fields:[
          { type:"mrkdwn", text:`*Projeto:*\n${p.title}` },
          { type:"mrkdwn", text:`*Líder:*\n${p.lider}` },
          { type:"mrkdwn", text:`*Cluster:*\n${p.cluster}` },
          { type:"mrkdwn", text:`*Métrica:*\n${p.meta} · Target: ${p.target}` },
          { type:"mrkdwn", text:`*Semana de entrega:*\n${p.semana || "—"}` },
          { type:"mrkdwn", text:`*Impacto clientes:*\n${p.impacto_cliente === "Sim" ? `✅ Sim · ${p.volume_cliente || "—"}` : "Não"}` }
        ]},
        { type:"actions", elements:[{ type:"button", text:{ type:"plain_text", text:"Ver no portal ↗" }, url:"https://nucel-pro-tracker.vercel.app", style:"primary" }] }
      ]
    },

    // Botão "Notificar time" — update manual do projeto
    update_projeto: {
      blocks: [
        { type:"header", text:{ type:"plain_text", text:`📊 Update: ${p.title}`, emoji:true } },
        { type:"section", fields:[
          { type:"mrkdwn", text:`*Líder:*\n${p.lider}` },
          { type:"mrkdwn", text:`*Status:*\n${p.status}` },
          { type:"mrkdwn", text:`*Saúde:*\n${saude[p.saude] || "🟢 No prazo"}` },
          { type:"mrkdwn", text:`*Resultado:*\n${result[p.result] || "⏳ Em apuração"}` },
          { type:"mrkdwn", text:`*Baseline → Target → Real:*\n${p.baseline || "—"} → ${p.target || "—"} → *${p.real || "—"}*` },
          { type:"mrkdwn", text:`*Semana de entrega:*\n${p.semana || "—"}` }
        ]},
        ...(p.integrantes ? [{
          type:"section",
          text:{ type:"mrkdwn", text:`*Integrantes:*\n${p.integrantes.split(",").map(e => e.split("@")[0].trim()).join(" · ")}` }
        }] : []),
        ...(p.nota ? [{
          type:"section",
          text:{ type:"mrkdwn", text:`*📝 Nota do líder:*\n${p.nota}` }
        }] : []),
        { type:"actions", elements:[{ type:"button", text:{ type:"plain_text", text:"Ver no portal ↗" }, url:"https://nucel-pro-tracker.vercel.app", style:"primary" }] }
      ]
    },

    // Meta atingida
    meta_atingida: {
      blocks: [
        { type:"header", text:{ type:"plain_text", text:"✅ Meta atingida! NuCel Pro Tracker", emoji:true } },
        { type:"section", text:{ type:"mrkdwn", text:`🎉 *${p.title}* (${p.lider}) atingiu a meta!\n*Target:* ${p.target} → *Real:* ${p.real}` } }
      ]
    },

    // Projeto em risco / bloqueado
    guardrail: {
      blocks: [
        { type:"header", text:{ type:"plain_text", text:"⚠️ Alerta — Projeto abaixo do target", emoji:true } },
        { type:"section", text:{ type:"mrkdwn", text:`*${p.title}* (${p.lider}) está abaixo do target.\n*Target:* ${p.target} | *Real:* ${p.real}\n\nAção recomendada: revisar com o líder.` } }
      ]
    }
  };

  const msg = messages[type];
  if (!msg) return res.status(400).json({ error: "Unknown type" });

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(msg)
  });

  res.status(r.ok ? 200 : 500).json({ ok: r.ok });
};
