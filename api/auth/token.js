export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  const { code, redirect_uri } = req.body;
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri, grant_type: "authorization_code" })
  });
  const data = await r.json();
  if (!r.ok) return res.status(400).json({ error: data.error_description });
  res.status(200).json({ access_token: data.access_token, refresh_token: data.refresh_token, expires_in: data.expires_in });
}
