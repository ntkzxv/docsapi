import type { VercelRequest, VercelResponse } from "@vercel/node"

const BOTNOI_API    = "https://api-voice.botnoi.ai/api"
const LINE_LOGIN_URL =
  "https://access.line.me/oauth2/v2.1/authorize" +
  "?response_type=code" +
  "&client_id=1656375389" +
  "&redirect_uri=https%3A%2F%2Fapi-voice.botnoi.ai%2Fapi%2Fdashboard%2Fline_callback" +
  "&scope=profile%20openid%20email"
const LIFF_ID = "1656375389-o0P1yrV6"

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ liff_id: LIFF_ID, line_login_url: LINE_LOGIN_URL, botnoi_api: BOTNOI_API })
}
