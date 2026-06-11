// api/databricks/query.js — NuCel Pro Tracker v3.0
// Queries oficiais NuCel por tabela · filtros: spoke=nucel, sem UV, sem High Income
// NUNCA usar crypto.subtle — Node.js nativo

const DATABRICKS_HOST  = process.env.DATABRICKS_HOST;
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN;
const WAREHOUSE_ID     = process.env.DATABRICKS_WAREHOUSE_ID || "";

// Tabelas válidas
const VALID_TABLES = new Set([
  "usr.cx_golden_layer.sla_wt",
  "usr.cx_golden_layer.interaction_statuses",
  "usr.cx_golden_layer.tnps_resolutivity",
  "usr.cx_golden_layer.jobs_done",
  "usr.cx_golden_layer.jobs_created",
  "usr.cx_golden_layer.ofrt_otd",
]);
const VALID_CHANNELS = new Set(["backoffice", "chat", "telefone"]);

// Filtros fixos NuCel obrigatórios
const NUCEL_FILTERS = `
  AND spoke = 'nucel'
  AND customer_tier NOT IN ('UV', 'HIGH_INCOME')
`;

// Query oficial por tabela — alinhada com cx_golden_layer
function buildQuery(table, channelList, queueFilter, weeks) {
  switch (table) {

    case "usr.cx_golden_layer.sla_wt":
      // SLA médio ponderado por semana
      return `
        SELECT
          year_week,
          ROUND(SUM(sla_weighted_sum) / NULLIF(SUM(job_count), 0), 2) AS metric_value,
          SUM(job_count) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    case "usr.cx_golden_layer.tnps_resolutivity":
      // tNPS: score médio semanal
      return `
        SELECT
          year_week,
          ROUND(AVG(tnps_score), 2) AS metric_value,
          COUNT(*) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    case "usr.cx_golden_layer.jobs_done":
      // Produtividade / Aderência: jobs concluídos por semana
      return `
        SELECT
          year_week,
          ROUND(COUNT(*) / NULLIF(COUNT(DISTINCT agent_id), 0), 2) AS metric_value,
          COUNT(*) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    case "usr.cx_golden_layer.jobs_created":
      // Volume: total de jobs criados por semana
      return `
        SELECT
          year_week,
          COUNT(*) AS metric_value,
          COUNT(DISTINCT queue_name) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    case "usr.cx_golden_layer.interaction_statuses":
      // Handover N1→N2 / Skip: taxa de handover
      return `
        SELECT
          year_week,
          ROUND(
            100.0 * SUM(CASE WHEN interaction_status IN ('TRANSFERRED','ESCALATED') THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0)
          , 2) AS metric_value,
          COUNT(*) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    case "usr.cx_golden_layer.ofrt_otd":
      // OTD 24h: taxa de resolução dentro de 24h
      return `
        SELECT
          year_week,
          ROUND(
            100.0 * SUM(CASE WHEN resolution_time_hours <= 24 THEN 1 ELSE 0 END)
            / NULLIF(COUNT(*), 0)
          , 2) AS metric_value,
          COUNT(*) AS sample_size
        FROM ${table}
        WHERE 1=1
          ${NUCEL_FILTERS}
          AND channel IN (${channelList})
          ${queueFilter}
          AND year_week >= CAST(DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL ${weeks * 7} DAY), '%Y%u') AS INT)
        GROUP BY year_week
        ORDER BY year_week ASC
        LIMIT ${weeks}`;

    default:
      throw new Error("Tabela sem query mapeada: " + table);
  }
}

function mockData(table, weeks) {
  const bases = {
    "sla_wt": { start:48, step:-2 },
    "tnps_resolutivity": { start:42, step:1.5 },
    "jobs_done": { start:85, step:1 },
    "jobs_created": { start:1200, step:20 },
    "interaction_statuses": { start:30, step:-1.5 },
    "ofrt_otd": { start:70, step:2 },
  };
  const key = Object.keys(bases).find(k => table.includes(k)) || "tnps_resolutivity";
  const b = bases[key];
  const n = Math.min(52, Math.max(1, parseInt(weeks)||6));
  const vals = Array.from({ length: n }, (_, i) =>
    +(b.start + b.step * i + (Math.random() * 1 - 0.5)).toFixed(2)
  );
  return { mock: true, weeks: vals.map((_,i) => "W"+(i+1)), values: vals };
}

async function runDatabricksQuery(sql) {
  const url = `${DATABRICKS_HOST}/api/2.0/sql/statements`;
  const init = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DATABRICKS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      statement: sql.trim(),
      warehouse_id: WAREHOUSE_ID,
      wait_timeout: "15s",
      on_wait_timeout: "CANCEL",
    }),
  });
  if (!init.ok) throw new Error(`Databricks HTTP ${init.status}: ${await init.text()}`);
  const result = await init.json();
  if (result.status?.state === "FAILED") throw new Error(result.status.error?.message || "Query failed");
  return {
    rows:   result.result?.data_array || [],
    schema: result.manifest?.schema?.columns || [],
  };
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { table, queue, channels = ["backoffice","chat","telefone"], weeks = 8 } = req.body || {};

  if (!table || !VALID_TABLES.has(table))
    return res.status(400).json({ error: "Tabela inválida: " + table });

  const safeChannels = (Array.isArray(channels) ? channels : []).filter(c => VALID_CHANNELS.has(c));
  if (!safeChannels.length)
    return res.status(400).json({ error: "Nenhum canal válido" });

  const safeWeeks = Math.min(52, Math.max(1, parseInt(weeks)||8));

  // Sem Databricks configurado → mock
  if (!DATABRICKS_HOST || !DATABRICKS_TOKEN)
    return res.status(200).json(mockData(table, safeWeeks));

  try {
    // Sanitização: queue só aceita letras, números, hífen e underscore
    const safeQueue = (queue || "").replace(/[^a-zA-Z0-9\-_]/g, "");
    const channelList  = safeChannels.map(c => `'${c}'`).join(",");
    const queueFilter  = safeQueue ? `AND queue_name = '${safeQueue}'` : "";

    const sql = buildQuery(table, channelList, queueFilter, safeWeeks);
    const { rows, schema } = await runDatabricksQuery(sql);

    if (!rows.length) return res.status(200).json(mockData(table, safeWeeks));

    const wIdx = schema.findIndex(c => c.name === "year_week");
    const vIdx = schema.findIndex(c => c.name === "metric_value");

    return res.status(200).json({
      mock:   false,
      weeks:  rows.map(r => String(r[wIdx] || "")),
      values: rows.map(r => +(parseFloat(r[vIdx] || 0)).toFixed(2)),
    });

  } catch (err) {
    console.error("[databricks/query.js]", err.message);
    // Fallback para mock em erros de query
    return res.status(200).json({ ...mockData(table, safeWeeks), error: err.message });
  }
};
