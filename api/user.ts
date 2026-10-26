import type { VercelRequest, VercelResponse } from "@vercel/node"

const BOTNOI_API = "https://api-voice.botnoi.ai/api"

async function getProfile(token: string) {
  for (const headers of [
    { "Authorization": `Bearer ${token}` },
    { "botnoi-token": token },
    { "Authorization": `Bearer ${token}`, "botnoi-token": token },
  ]) {
    try {
      const r = await fetch(`${BOTNOI_API}/dashboard/get_profile`, { headers })
      if (!r.ok) continue
      const d = await r.json() as any
      const p = d?.data ?? d
      return { ok: true, p }
    } catch { continue }
  }
  return { ok: false, p: null }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  const jwt = (req.headers["botnoi-token"] ?? "") as string
  if (!jwt) return res.status(401).json({ error: "missing botnoi-token" })
  const token = jwt.trim()

  // GET /api/user?action=point
  // GET /api/user (default = apikey/profile)
  // POST /api/user?action=reset
  const action = req.query.action as string | undefined

  if (req.method === "POST" && action === "reset") {
    for (const headers of [
      { "Authorization": `Bearer ${token}` },
      { "botnoi-token": token },
    ]) {
      try {
        const r = await fetch(`${BOTNOI_API}/dashboard/refresh_token`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({}),
        })
        if (!r.ok) continue
        const d = await r.json() as any
        const p = d?.data ?? d
        const newKey = p?.token ?? p?.api_key ?? p?.new_token ?? null
        if (newKey) return res.json({ api_key: newKey })
      } catch { continue }
    }
    return res.status(502).json({ error: "reset_failed" })
  }

  const { ok, p } = await getProfile(token)
  if (!ok || !p) return res.status(401).json({ error: "unauthorized" })

  if (action === "point") {
    return res.json({ point: p?.credits ?? p?.monthly_point ?? p?.point ?? null })
  }

  return res.json({
    api_key: p?.token ?? null,
    jwt: p?.jwt ?? null,
    point: p?.credits ?? p?.monthly_point ?? p?.point ?? null,
    name: p?.username ?? p?.name ?? p?.display_name ?? "",
    picture: p?.image ?? p?.picture ?? "",
    uid: p?.user_id ?? p?.uid ?? "",
    email: p?.email ?? "",
  })
}
