import type { VercelRequest, VercelResponse } from "@vercel/node"

const BOTNOI_FIREBASE_AUTH = "https://api-voice.botnoi.ai/api/dashboard/firebase_auth"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" })
  try {
    const upstream = await fetch(BOTNOI_FIREBASE_AUTH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    })
    const data = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err: any) {
    res.status(500).json({ error: "proxy_error", message: err.message })
  }
}
