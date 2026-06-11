// api/notify.js — NuCel Pro Tracker
// POST /api/notify — envia mensagem no Slack
// Tipos: novo_projeto | update_projeto | meta_atingida | guardrail

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function buildBlocks(tipo, p) {
  const portal = "https://nucel-pro-tracker.vercel.app";
  const saude  = p.saude || "—";
  const status = p.status || "—";
  const metrica = p.metrica || "—";
  const real    = (p.real !== null && p.real !== undefined && p.real !== "") ? p.real : "Sem dado";
  const target  = p.target !== undefined ? p.target : "—";
  const lider   = p.lider || "—";
  const titulo  = p.titulo || "—";

  const emojiSaude = saude.includes("prazo") ? "🟢" : saude.includes("risco") ? "🟡" : "🔴";
  const emojiTipo  = {
    novo_projeto:    "🆕",
    update_projeto:  "🔄",
    meta_atingida:   "🏆",
    guardrail:       "⚠️",
  }[tipo] || "📢";

  const headerTexts = {
    novo_projeto:   `${emojiTipo} Novo projeto criado no NuCel Pro Tracker`,
    update_projeto: `${emojiTipo} Atualização de projeto`,
    meta_atingida:  `${emojiTipo} Meta atingida! Parabéns, ${lider.split(" ")[0]}!`,
    guardrail:      `${emojiTipo} Guardrail acionado — projeto abaixo do target`,
  };

  return [
    {
      type: "header",
      text: { type: "plain_text", text: headerTexts[tipo] || "📢 NuCel Pro Tracker", emoji: true },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Projeto*\n${titulo}` },
        { type: "mrkdwn", text: `*Líder*\n${lider}` },
        { type: "mrkdwn", text: `*Status*\n${status}` },
        { type: "mrkdwn", text: `*Saúde*\n${emojiSaude} ${saude}` },
      ],
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Métrica*\n${metrica}` },
        { type: "mrkdwn", text: `*Target*\n${target}` },
        { type: "mrkdwn", text: `*Real*\n${real}` },
        { type: "mrkdwn", text: `*Cluster*\n${p.cluster || "—"}` },
      ],
    },
    { type: "divider" },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: { type: "plain_text", text: "↗ Ver no Portal", emoji: true },
          url: portal,
          style: "primary",
        },
        ...(p.drive ? [{
          type: "button",
          text: { type: "plain_text", text: "📄 Ver Documento", emoji: true },
          url: p.drive,
        }] : []),
      ],
    },
    {
      type: "context",
      elements: [{
        type: "mrkdwn",
        text: `NuCel Pro Tracker · ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
      }],
    },
  ];
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!SLACK_WEBHOOK) {
    console.warn("[notify.js] SLACK_WEBHOOK_URL não configurado");
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    const { tipo, projeto } = req.body;
    if (!tipo || !projeto) return res.status(400).json({ error: "tipo e projeto são obrigatórios" });

    const blocks = buildBlocks(tipo, projeto);

    const slackRes = await fetch(SLACK_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks }),
    });

    const text = await slackRes.text();
    if (!slackRes.ok) {
      console.error("[notify.js] Slack error:", slackRes.status, text);
      return res.status(502).json({ error: "Slack retornou erro", detail: text });
    }

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("[notify.js]", err);
    return res.status(500).json({ error: err.message });
  }
};
