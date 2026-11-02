import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
  const token = (req.headers["botnoi-token"] ?? "") as string
  if (!token) return res.status(401).json({ error: "missing botnoi-token" })
  try {
    const upstream = await fetch("https://api-voice.botnoi.ai/openapi/v1/get_speaker_data_v2", {
      headers: { "botnoi-token": token.trim(), "accept": "application/json" }
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err: any) {
    res.status(502).json({ error: "proxy_error", message: err.message })
  }
}
