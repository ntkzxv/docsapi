import type { VercelRequest, VercelResponse } from "@vercel/node"

const BOTNOI_API = "https://api-voice.botnoi.ai/api"
const BOTNOI_DB = "https://api-voice.botnoi.ai/db"

async function getProfile(token: string) {
  for (const headers of [
    { "Authorization": `Bearer ${token}` },
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
  const authHeader = (req.headers["authorization"] ?? "") as string
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader
  if (!jwt) return res.status(401).json({ error: "missing authorization" })
  const token = jwt.trim()

  // GET /api/user?action=point
  // GET /api/user (default = apikey/profile)
  // POST /api/user?action=reset
  const action = req.query.action as string | undefined

  if (req.method === "POST" && action === "reset") {
    // get profile first to obtain user_id and jwt
    const { ok: pOk, p: prof } = await getProfile(token)
    const profApiKey = (prof as any)?.token ?? null
    const profUid = (prof as any)?.user_id ?? (prof as any)?.uid ?? null

    if (!profUid) {
      if (pOk && profApiKey) return res.json({ api_key: profApiKey, refreshed: false })
      return res.status(502).json({ error: "reset_failed" })
    }

    const resetUrl = `${BOTNOI_DB}/dashboard/reset_token?user_id=${encodeURIComponent(profUid)}`
    const authHeaders: Record<string, string>[] = [
      { "Authorization": `Bearer ${token}` },
    ]

    for (const headers of authHeaders) {
      try {
        const r = await fetch(resetUrl, { method: "GET", headers })
        console.log("[reset] status:", r.status)
        if (!r.ok) continue
        const d = await r.json() as any
        const p = d?.data ?? d
        const newKey = p?.token ?? p?.api_key ?? p?.new_token ?? null
        if (newKey) return res.json({ api_key: newKey })
      } catch { continue }
    }

    if (pOk && profApiKey) return res.json({ api_key: profApiKey, refreshed: false })
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