import type { VercelRequest, VercelResponse } from "@vercel/node"

const BOTNOI_LINE_CB = "https://api-voice.botnoi.ai/api/dashboard/line_callback"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error } = req.query as Record<string, string>

  const sendHTML = (token: string | null, errMsg?: string) => {
    const payload = token
      ? `{ type:'BOTNOI_AUTH_SUCCESS', token: ${JSON.stringify(token)} }`
      : `{ type:'BN_LINE_ERROR', error: ${JSON.stringify(errMsg ?? "no_token")} }`
    res.setHeader("Content-Type", "text/html")
    return res.send(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Botnoi Login</title></head>
<body>
<script>
  (function() {
    var msg = ${payload};
    if (window.opener) { window.opener.postMessage(msg, '*'); }
    else if (window.parent !== window) { window.parent.postMessage(msg, '*'); }
    setTimeout(function() { window.close(); }, 300);
  })();
</script>
<p style="font-family:sans-serif;text-align:center;padding-top:40px;color:#666">
  ${token ? "เข้าสู่ระบบสำเร็จ กำลังปิดหน้าต่าง..." : "เกิดข้อผิดพลาด: " + (errMsg ?? "no_token")}
</p>
</body></html>`)
  }

  if (error || !code) return sendHTML(null, error ?? "no_code")

  try {
    const botnoiRes = await fetch(
      `${BOTNOI_LINE_CB}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state ?? "noncanva")}`,
      { method: "GET", headers: { "User-Agent": "Mozilla/5.0 (compatible; BotnoiAPIDoc/1.0)" }, redirect: "manual" }
    )

    let token: string | null = null

    const rawHeaders = botnoiRes.headers as any
    const rawCookies: string[] = rawHeaders.raw?.()?.["set-cookie"] ?? []
    const m = rawCookies.join("; ").match(/_bn_token=([^;,\s]+)/)
    if (m) token = m[1]

    if (!token) {
      const loc = botnoiRes.headers.get("location") ?? ""
      if (loc) {
        try {
          const u = new URL(loc.startsWith("http") ? loc : `https://voice.botnoi.ai${loc}`)
          token = u.searchParams.get("token") ?? u.searchParams.get("bn_token") ?? null
          if (!token && u.hash) {
            const h = new URLSearchParams(u.hash.slice(1))
            token = h.get("token") ?? h.get("access_token") ?? null
          }
        } catch { /**/ }
      }
    }

    if (!token) {
      try {
        const text = await botnoiRes.text()
        const json = JSON.parse(text)
        token = json?.data?.token ?? json?.token ?? json?.access_token ?? null
      } catch { /**/ }
    }

    sendHTML(token, token ? undefined : "no_token_from_backend")
  } catch (err: any) {
    sendHTML(null, "server_error")
  }
}
