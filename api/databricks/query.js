// ── NuCel Pro Tracker — Databricks Metrics API ───────────────
// Filtros sempre aplicados:
//   spoke = 'nucel'
//   customer_tier NOT IN ('UV', 'HIGH_INCOME')
// Filtro selecionável por projeto:
//   channel IN ('backoffice', 'chat', 'telefone')

const DATABRICKS_HOST  = process.env.DATABRICKS_HOST;
const DATABRICKS_TOKEN = process.env.DATABRICKS_TOKEN;

// Filtros base sempre fixos para NuCel
function baseFilters(queue, channels) {
  const queueFilter    = queue && queue !== "todos"
    ? `AND queue_name = '${queue}'` : "";
  const channelList    = (channels && channels.length > 0)
    ? channels.map(c => `'${c}'`).join(",")
    : "'backoffice','chat','telefone'";
  return `
    AND spoke = 'nucel'
    AND channel IN (${channelList})
    AND customer_tier NOT IN ('UV', 'HIGH_INCOME')
    ${queueFilter}
  `;
}

const TABLE_QUERIES = {
  sla_wt: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', created_at)                                        AS semana,
      ROUND(AVG(CASE WHEN resolved_within_sla THEN 1.0 ELSE 0.0 END)*100,1) AS valor,
      COUNT(*)                                                               AS volume
    FROM usr.cx_golden_layer.sla_wt
    WHERE created_at >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `,
  interaction_statuses: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', created_at)                                              AS semana,
      ROUND(AVG(CASE WHEN final_status = 'resolved' THEN 1.0 ELSE 0.0 END)*100,1) AS valor,
      COUNT(*)                                                                     AS volume
    FROM usr.cx_golden_layer.interaction_statuses
    WHERE created_at >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `,
  tnps_resolutivity: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', survey_date) AS semana,
      ROUND(AVG(nps_score), 1)        AS valor,
      COUNT(*)                        AS volume
    FROM usr.cx_golden_layer.tnps_resolutivity
    WHERE survey_date >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `,
  jobs_done: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', completed_at) AS semana,
      COUNT(*)                         AS valor,
      COUNT(*)                         AS volume
    FROM usr.cx_golden_layer.jobs_done
    WHERE completed_at >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `,
  jobs_created: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', created_at) AS semana,
      COUNT(*)                       AS valor,
      COUNT(*)                       AS volume
    FROM usr.cx_golden_layer.jobs_created
    WHERE created_at >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `,
  ofrt_otd: ({ queue, channels, weeks }) => `
    SELECT
      DATE_TRUNC('week', created_at)                                               AS semana,
      ROUND(AVG(CASE WHEN resolved_within_24h THEN 1.0 ELSE 0.0 END)*100,1)       AS valor,
      COUNT(*)                                                                     AS volume
    FROM usr.cx_golden_layer.ofrt_otd
    WHERE created_at >= DATE_SUB(CURRENT_DATE, ${weeks * 7})
    ${baseFilters(queue, channels)}
    GROUP BY 1 ORDER BY 1
  `
};

async function runQuery(sql) {
  const host = DATABRICKS_HOST.replace(/\/$/, "");
  const r = await fetch(`${host}/api/2.0/sql/statements`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DATABRICKS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      statement: sql,
      warehouse_id: process.env.DATABRICKS_WAREHOUSE_ID || "auto",
      wait_timeout: "30s",
      on_wait_timeout: "CANCEL"
    })
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message || "Query failed");

  if (["RUNNING","PENDING"].includes(data.status?.state)) {
    let result = data;
    for (let i = 0; i < 10; i++) {
      await new Promise(res => setTimeout(res, 2000));
      const pr = await fetch(`${host}/api/2.0/sql/statements/${data.statement_id}`, {
        headers: { Authorization: `Bearer ${DATABRICKS_TOKEN}` }
      });
      result = await pr.json();
      if (result.status?.state === "SUCCEEDED") return result;
      if (result.status?.state === "FAILED") throw new Error(result.status.error?.message);
    }
    return result;
  }
  return data;
}

function mockData({ table, weeks = 8 }) {
  const base = table === "tnps_resolutivity" ? 7.2 : table === "jobs_done" ? 115 : 76;
  return Array.from({ length: weeks + 1 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - i) * 7);
    return {
      semana: d.toISOString().slice(0, 10),
      valor:  parseFloat((base + (Math.random() * 10 - 5)).toFixed(1)),
      volume: Math.floor(80 + Math.random() * 40)
    };
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")   return res.status(405).end();

  const { table, queue, channels = [], weeks = 8 } = req.body;

  // Sem Databricks configurado → retorna mock
  if (!DATABRICKS_HOST || !DATABRICKS_TOKEN) {
    return res.status(200).json({ rows: mockData({ table, weeks }), mock: true });
  }

  const queryFn = TABLE_QUERIES[table];
  if (!queryFn) return res.status(400).json({ error: `Unknown table: ${table}` });

  try {
    const sql    = queryFn({ queue, channels, weeks });
    const result = await runQuery(sql);
    const cols   = result.manifest?.schema?.columns?.map(c => c.name) || [];
    const rows   = (result.result?.data_array || []).map(row =>
      Object.fromEntries(cols.map((c, i) => [c, row[i]]))
    );
    res.status(200).json({ rows, table, queue, channels });
  } catch(err) {
    console.error("Databricks:", err.message);
    res.status(200).json({ rows: mockData({ table, weeks }), mock: true, error: err.message });
  }
}
