import type { VercelRequest, VercelResponse } from "@vercel/node"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store")
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" })
  const token = (req.headers["botnoi-token"] ?? "") as string
  if (!token) return res.status(401).json({ error: "missing botnoi-token" })
  try {
    const upstream = await fetch("https://api-voice.botnoi.ai/openapi/v1/generate_audio_v2", {
      method: "POST",
      headers: { "botnoi-token": token.trim(), "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err: any) {
    res.status(502).json({ error: "proxy_error", message: err.message })
  }
}
