import http from "node:http"
import https from "node:https"
import fs from "node:fs"
import path from "node:path"
import { URL } from "node:url"

const PORT = Number(process.env.PORT ?? 3001)
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173"
const BOTNOI_API = "https://api-voice.botnoi.ai/api"
const IS_PROD = process.env.NODE_ENV === "production"

// ─── helpers ──────────────────────────────────────────────────────────────────

function parseBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let raw = ""
    req.on("data", (chunk) => (raw += chunk))
    req.on("end", () => {
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
  })
}

function json(res: http.ServerResponse, status: number, data: unknown) {
  const body = Buffer.from(JSON.stringify(data), "utf-8")
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": body.byteLength,
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": FRONTEND_URL,
    "Access-Control-Allow-Headers": "content-type,botnoi-token,authorization",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  })
  res.end(body)
}

function html(res: http.ServerResponse, body: string) {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" })
  res.end(body)
}

async function upstream(
  url: string,
  method: string,
  headers: Record<string, string>,
  body?: string
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const opts: https.RequestOptions = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method,
      headers: { ...headers, "Content-Length": body ? Buffer.byteLength(body) : 0 },
    }
    const req = https.request(opts, (r) => {
      let raw = ""
      r.on("data", (c) => (raw += c))
      r.on("end", () => {
        try { resolve({ status: r.statusCode ?? 200, data: JSON.parse(raw) }) }
        catch { resolve({ status: r.statusCode ?? 200, data: raw }) }
      })
    })
    req.on("error", reject)
    if (body) req.write(body)
    req.end()
  })
}

// ─── /api/user ────────────────────────────────────────────────────────────────

async function getProfile(token: string) {
  for (const headers of [
    { Authorization: `Bearer ${token}` },
    { "botnoi-token": token },
    { Authorization: `Bearer ${token}`, "botnoi-token": token },
  ] as Record<string, string>[]) {
    try {
      const { status, data } = await upstream(
        `${BOTNOI_API}/dashboard/get_profile`, "GET", headers
      )
      if (status < 200 || status >= 300) continue
      const p = data?.data ?? data
      return { ok: true, p }
    } catch { continue }
  }
  return { ok: false, p: null }
}

async function handleUser(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  query: URLSearchParams
) {
  const botnoiToken = ((req.headers["botnoi-token"] ?? "") as string).trim()
  const authHeader = ((req.headers["authorization"] ?? "") as string).trim()
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""
  const token = botnoiToken || bearerToken
  if (!token) return json(res, 401, { error: "missing botnoi-token" })

  // POST /api/user?action=reset
  if (req.method === "POST" && query.get("action") === "reset") {
    await parseBody(req) // drain request body first

    // get profile first to have prof.jwt and prof.token (api_key)
    const { ok: pOk, p: prof } = await getProfile(token)
    const profJwt = (prof as any)?.jwt ?? null
    const profApiKey = prof?.token ?? null

    const ct = { "Content-Type": "application/json" }
    const attempts: { headers: Record<string, string>; body: string }[] = [
      // 1. cookie-based (how Botnoi web dashboard authenticates)
      { headers: { ...ct, Cookie: `_bn_token=${token}` }, body: "{}" },
      ...(profJwt ? [{ headers: { ...ct, Cookie: `_bn_token=${profJwt}` }, body: "{}" }] : []),
      // 2. botnoi-token header variants
      ...(profJwt ? [{ headers: { ...ct, "botnoi-token": profJwt }, body: "{}" }] : []),
      ...(profApiKey ? [{ headers: { ...ct, "botnoi-token": profApiKey }, body: "{}" }] : []),
      { headers: { ...ct, "botnoi-token": token }, body: "{}" },
      // 3. Bearer variants
      ...(profJwt ? [{ headers: { ...ct, Authorization: `Bearer ${profJwt}` }, body: "{}" }] : []),
      { headers: { ...ct, Authorization: `Bearer ${token}` }, body: "{}" },
    ]

    for (const attempt of attempts) {
      try {
        const { status, data } = await upstream(`${BOTNOI_API}/dashboard/refresh_token`, "POST", attempt.headers, attempt.body)
        const authKey = Object.keys(attempt.headers).filter(k => k !== "Content-Type").join(",")
        console.log(`[reset] status:${status} auth:${authKey} data:`, JSON.stringify(data).slice(0, 200))
        if (status < 200 || status >= 300) continue
        const p = data?.data ?? data
        const newKey = p?.token ?? p?.api_key ?? p?.new_token ?? null
        if (newKey) return json(res, 200, { api_key: newKey })
      } catch { continue }
    }

    // fallback: return current key since reset endpoint is unavailable
    if (pOk && profApiKey) return json(res, 200, { api_key: profApiKey, refreshed: false })
    return json(res, 502, { error: "reset_failed" })
  }

  const { ok, p } = await getProfile(token)
  if (!ok || !p) return json(res, 401, { error: "unauthorized" })

  if (query.get("action") === "point") {
    return json(res, 200, { point: p?.credits ?? p?.monthly_point ?? p?.point ?? null })
  }

  return json(res, 200, {
    api_key: p?.token ?? null,
    jwt: p?.jwt ?? null,
    point: p?.credits ?? p?.monthly_point ?? p?.point ?? null,
    coin_voicebot: p?.coin_voicebot ?? null,
    name: p?.username ?? p?.name ?? p?.display_name ?? "",
    picture: p?.image ?? p?.picture ?? "",
    uid: p?.user_id ?? p?.uid ?? "",
    email: p?.email ?? "",
  })
}

// ─── /api/firebase-auth ───────────────────────────────────────────────────────

async function handleFirebaseAuth(req: http.IncomingMessage, res: http.ServerResponse) {
  if (req.method !== "POST") return json(res, 405, { error: "method_not_allowed" })
  const body = await parseBody(req)
  try {
    const { status, data } = await upstream(
      `${BOTNOI_API}/dashboard/firebase_auth`,
      "POST",
      { "Content-Type": "application/json" },
      JSON.stringify(body)
    )
    json(res, status, data)
  } catch (err: any) {
    json(res, 500, { error: "proxy_error", message: err.message })
  }
}

// ─── /api/health ──────────────────────────────────────────────────────────────

function handleHealth(_: http.IncomingMessage, res: http.ServerResponse) {
  json(res, 200, { ok: true, botnoi_api: BOTNOI_API })
}

// ─── /api/line-callback ───────────────────────────────────────────────────────

async function handleLineCallback(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  query: URLSearchParams
) {
  const code = query.get("code") ?? ""
  const state = query.get("state") ?? "noncanva"
  const error = query.get("error") ?? ""

  const sendHTML = (token: string | null, errMsg?: string) => {
    const payload = token
      ? `{ type:'BOTNOI_AUTH_SUCCESS', token: ${JSON.stringify(token)} }`
      : `{ type:'BN_LINE_ERROR', error: ${JSON.stringify(errMsg ?? "no_token")} }`
    html(res, `<!DOCTYPE html>
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

  if (error || !code) return sendHTML(null, error || "no_code")

  try {
    const cbUrl = `${BOTNOI_API}/dashboard/line_callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
    const u = new URL(cbUrl)
    const rawRes = await new Promise<{ headers: http.IncomingHttpHeaders; body: string; status: number }>(
      (resolve, reject) => {
        const r = https.request(
          { hostname: u.hostname, path: u.pathname + u.search, method: "GET",
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BotnoiAPIDoc/1.0)" } },
          (resp) => {
            let body = ""
            resp.on("data", (c) => (body += c))
            resp.on("end", () => resolve({ headers: resp.headers, body, status: resp.statusCode ?? 200 }))
          }
        )
        r.on("error", reject)
        r.end()
      }
    )

    let token: string | null = null

    // 1. cookie
    const setCookie = rawRes.headers["set-cookie"] ?? []
    const cm = setCookie.join("; ").match(/_bn_token=([^;,\s]+)/)
    if (cm) token = cm[1]

    // 2. location header
    if (!token) {
      const loc = rawRes.headers["location"] ?? ""
      if (loc) {
        try {
          const lu = new URL(loc.startsWith("http") ? loc : `https://voice.botnoi.ai${loc}`)
          token = lu.searchParams.get("token") ?? lu.searchParams.get("bn_token") ?? null
          if (!token && lu.hash) {
            const h = new URLSearchParams(lu.hash.slice(1))
            token = h.get("token") ?? h.get("access_token") ?? null
          }
        } catch { /**/ }
      }
    }

    // 3. json body
    if (!token) {
      try {
        const d = JSON.parse(rawRes.body)
        token = d?.data?.token ?? d?.token ?? d?.access_token ?? null
      } catch { /**/ }
    }

    sendHTML(token, token ? undefined : "no_token_from_backend")
  } catch {
    sendHTML(null, "server_error")
  }
}

// ─── /api/voice/* ─────────────────────────────────────────────────────────────

const VOICE_ROUTES: Record<string, string> = {
  "/api/voice/generate-v1": "https://api-voice.botnoi.ai/openapi/v1/generate_audio",
  "/api/voice/generate-v2": "https://api-voice.botnoi.ai/openapi/v1/generate_audio_v2",
  "/api/voice/speakers-v1": "https://api-voice.botnoi.ai/openapi/v1/get_speaker_data",
  "/api/voice/speakers-v2": "https://api-voice.botnoi.ai/openapi/v1/get_speaker_data_v2",
}

async function handleVoice(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  upstreamUrl: string,
  needsPost: boolean
) {
  if (needsPost && req.method !== "POST") return json(res, 405, { error: "method_not_allowed" })
  const token = ((req.headers["botnoi-token"] ?? "") as string).trim()
  if (!token) return json(res, 401, { error: "missing botnoi-token" })
  try {
    const body = needsPost ? JSON.stringify(await parseBody(req)) : undefined
    const { status, data } = await upstream(
      upstreamUrl,
      needsPost ? "POST" : "GET",
      { "botnoi-token": token, "Content-Type": "application/json", accept: "application/json" },
      body
    )
    json(res, status, data)
  } catch (err: any) {
    json(res, 502, { error: "proxy_error", message: err.message })
  }
}

// ─── static files (production) ────────────────────────────────────────────────

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse) {
  const distDir = path.join(path.dirname(new URL(import.meta.url).pathname), "dist")
  let filePath = path.join(distDir, req.url === "/" ? "index.html" : req.url ?? "index.html")
  if (!fs.existsSync(filePath)) filePath = path.join(distDir, "index.html")
  const ext = path.extname(filePath)
  const mime: Record<string, string> = {
    ".html": "text/html", ".js": "application/javascript", ".css": "text/css",
    ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon",
    ".json": "application/json", ".woff2": "font/woff2",
  }
  res.writeHead(200, { "Content-Type": mime[ext] ?? "application/octet-stream" })
  fs.createReadStream(filePath).pipe(res)
}

// ─── router ───────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": FRONTEND_URL,
      "Access-Control-Allow-Headers": "content-type,botnoi-token,authorization",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    })
    return res.end()
  }

  const u = new URL(req.url ?? "/", `http://localhost:${PORT}`)
  const pathname = u.pathname.replace(/\/$/, "") || "/"
  const query = u.searchParams

  if (pathname === "/api/user") return handleUser(req, res, query)
  if (pathname === "/api/firebase-auth") return handleFirebaseAuth(req, res)
  if (pathname === "/api/health") return handleHealth(req, res)
  if (pathname === "/api/line-callback") return handleLineCallback(req, res, query)

  for (const [route, upstreamUrl] of Object.entries(VOICE_ROUTES)) {
    if (pathname === route) {
      const needsPost = route.includes("generate")
      return handleVoice(req, res, upstreamUrl, needsPost)
    }
  }

  if (IS_PROD) return serveStatic(req, res)

  json(res, 404, { error: "not_found", path: pathname })
})

server.listen(PORT, () => {
  console.log(`✅ Botnoi API server running on http://localhost:${PORT}`)
  if (IS_PROD) console.log(`   Serving frontend from ./dist`)
})
