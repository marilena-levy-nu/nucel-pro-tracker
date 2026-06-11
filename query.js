// api/databricks/query.js — NuCel Pro Tracker
// POST /api/databricks/query — executa query nas tabelas cx_golden_layer
// Se sem Databricks configurado → retorna mock data

const DATABRICKS_HOST  = process.env.DATABRICKS_HOST;
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN;

const VALID_TABLES = new Set([
  "usr.cx_golden_layer.sla_wt",
  "usr.cx_golden_layer.interaction_statuses",
  "usr.cx_golden_layer.tnps_resolutivity",
  "usr.cx_golden_layer.jobs_done",
  "usr.cx_golden_layer.jobs_created",
  "usr.cx_golden_layer.ofrt_otd",
]);

const VALID_CHANNELS = new Set(["backoffice", "chat", "telefone"]);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sanitize(str) {
  // Remove qualquer caractere que não seja alfanumérico, underscore, ponto, hífen, vírgula ou espaço
  return String(str || "").replace(/[^a-zA-Z0-9_.@\-,\s]/g, "").trim();
}

function mockData(table, weeks) {
  const len = weeks || 6;
  const base = { sla_wt: 48, tnps_resolutivity: 42, jobs_done: 85, ofrt_otd: 70, interaction_statuses: 30, jobs_created: 1200 };
  const key  = Object.keys(base).find(k => table.includes(k)) || "sla_wt";
  const start = base[key];
  return {
    mock: true,
    weeks: Array.from({ length: len }, (_, i) => `W${i+1}`),
    values: Array.from({ length: len }, (_, i) => +(start + (i * (Math.random() * 3 - 0.5))).toFixed(1)),
  };
}

async function databricksQuery(sql) {
  const statementUrl = `${DATABRICKS_HOST}/api/2.0/sql/statements`;

  // Inicia a query
  const initRes = await fetch(statementUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DATABRICKS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statement: sql,
      warehouse_id: process.env.DATABRICKS_WAREHOUSE_ID || "",
      wait_timeout: "10s",
    }),
  });

  if (!initRes.ok) throw new Error(`Databricks HTTP ${initRes.status}`);
  const result = await initRes.json();

  if (result.status && result.status.state === "FAILED") {
    throw new Error(result.status.error.message || "Query falhou");
  }

  const rows   = result.result?.data_array || [];
  const schema = result.manifest?.schema?.columns || [];

  return { rows, schema };
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { table, queue, channels = ["backoffice", "chat", "telefone"], weeks = 6 } = req.body || {};

  // Validação da tabela
  if (!table || !VALID_TABLES.has(table)) {
    return res.status(400).json({ error: "Tabela inválida ou não informada" });
  }

  // Validação dos canais
  const safeChannels = (Array.isArray(channels) ? channels : []).filter(c => VALID_CHANNELS.has(c));
  if (!safeChannels.length) return res.status(400).json({ error: "Nenhum canal válido" });

  // Se Databricks não configurado → mock
  if (!DATABRICKS_HOST || !DATABRICKS_TOKEN) {
    return res.status(200).json(mockData(table, weeks));
  }

  try {
    const channelList  = safeChannels.map(c => `'${c}'`).join(",");
    const safeQueue    = sanitize(queue || "");
    const queueFilter  = safeQueue ? `AND queue_name = '${safeQueue}'` : "";
    const safeWeeks    = Math.min(52, Math.max(1, parseInt(weeks) || 6));

    const sql = `
      SELECT
        year_week,
        AVG(metric_value) AS avg_value,
        COUNT(*) AS sample_size
      FROM ${table}
      WHERE spoke = 'nucel'
        AND channel IN (${channelList})
        AND customer_tier NOT IN ('UV', 'HIGH_INCOME')
        ${queueFilter}
        AND year_week >= YEAR(CURRENT_DATE()) * 100 + WEEK(DATE_SUB(CURRENT_DATE(), ${safeWeeks * 7}))
      GROUP BY year_week
      ORDER BY year_week ASC
      LIMIT ${safeWeeks}
    `.trim();

    const { rows, schema } = await databricksQuery(sql);

    if (!rows.length) {
      return res.status(200).json(mockData(table, weeks));
    }

    const weekIdx  = schema.findIndex(c => c.name === "year_week");
    const valueIdx = schema.findIndex(c => c.name === "avg_value");

    return res.status(200).json({
      mock: false,
      weeks:  rows.map(r => String(r[weekIdx] || "")),
      values: rows.map(r => +(parseFloat(r[valueIdx] || 0)).toFixed(2)),
    });

  } catch (err) {
    console.error("[databricks/query.js]", err);
    // Fallback para mock em caso de erro
    return res.status(200).json({ ...mockData(table, weeks), error: err.message });
  }
};
