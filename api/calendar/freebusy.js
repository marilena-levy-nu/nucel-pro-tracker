module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "No token" });
  const { emails, timeMin, timeMax } = req.body;
  const r = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin, timeMax, timeZone: "America/Sao_Paulo", items: emails.map(e => ({ id: e })) })
  });
  const data = await r.json();
  if (!r.ok) return res.status(400).json({ error: data.error?.message });
  const slots = [];
  const start = new Date(timeMin), end = new Date(timeMax);
  for (let d = new Date(start); d < end && slots.length < 3; d.setDate(d.getDate() + 1)) {
    if ([0, 6].includes(d.getDay())) continue;
    for (let h = 8; h <= 16 && slots.length < 3; h++) {
      const s = new Date(d); s.setHours(h, 0, 0, 0);
      const e2 = new Date(s); e2.setHours(h + 1);
      const busy = Object.values(data.calendars).some(cal =>
        (cal.busy || []).some(b => s < new Date(b.end) && e2 > new Date(b.start))
      );
      if (!busy) slots.push({
        start: s.toISOString(), end: e2.toISOString(),
        label: s.toLocaleDateString("pt-BR", { weekday:"short", day:"numeric", month:"short" }) +
               " · " + s.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" }) +
               " – " + e2.toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" })
      });
    }
  }
  res.status(200).json({ slots });
}
