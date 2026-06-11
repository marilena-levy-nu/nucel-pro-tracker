export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  const { title, start, end, emails, description } = req.body;
  const event = {
    summary: `NuCel: ${title}`,
    description: description || `Reunião NuCel Pro Tracker\nhttps://nucel-pro-tracker.vercel.app`,
    start: { dateTime: start, timeZone: "America/Sao_Paulo" },
    end:   { dateTime: end,   timeZone: "America/Sao_Paulo" },
    attendees: emails.map(e => ({ email: e })),
    conferenceData: { createRequest: { requestId: `nucel-${Date.now()}`, conferenceSolutionKey: { type: "hangoutsMeet" } } },
    reminders: { useDefault: false, overrides: [{ method: "email", minutes: 1440 }, { method: "popup", minutes: 15 }] }
  };
  const r = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1&sendUpdates=all", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  const data = await r.json();
  if (!r.ok) return res.status(400).json({ error: data.error?.message });
  res.status(200).json({ ok: true, eventId: data.id, htmlLink: data.htmlLink, meetLink: data.conferenceData?.entryPoints?.[0]?.uri });
}
