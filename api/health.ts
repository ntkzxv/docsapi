import type { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ ok: true, botnoi_api: "https://api-voice.botnoi.ai/api" })
}
