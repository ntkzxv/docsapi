import { BOTNOI_API_BASE_URL, endpoints } from '../data/botnoiEndpoints'
import type { VideoGeneration } from './seedance25'

const TOKEN_KEY = '_bn_token'
const POLL_INTERVAL_MS = 10_000
const MAX_POLL_ATTEMPTS = 120

export type GeneratedMediaKind = 'image' | 'video'
export type GenerationPayload = Record<string, unknown>

export interface BotnoiGenerationOptions {
  submitEndpointId: string
  statusEndpointId: string
  payload: GenerationPayload
  mediaKind: GeneratedMediaKind
  signal: AbortSignal
  onStatus: (generation: VideoGeneration) => void
}

type JsonObject = Record<string, unknown>

function asObject(value: unknown): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonObject : null
}

function nestedObjects(root: unknown): JsonObject[] {
  const found: JsonObject[] = []
  const queue: unknown[] = [root]
  const visited = new Set<unknown>()
  while (queue.length) {
    const value = queue.shift()
    if (value == null || visited.has(value)) continue
    visited.add(value)
    const object = asObject(value)
    if (object) {
      found.push(object)
      queue.push(...Object.values(object))
      continue
    }
    if (Array.isArray(value)) {
      queue.push(...value)
      continue
    }
    if (typeof value === 'string' && /^[\[{]/.test(value.trim())) {
      try { queue.push(JSON.parse(value)) } catch { /* Non-JSON strings are not nested response objects. */ }
    }
  }
  return found
}

function findString(body: unknown, keys: string[]): string | undefined {
  for (const object of nestedObjects(body)) {
    for (const key of keys) {
      const value = object[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return undefined
}

function getTaskId(body: unknown): string | undefined {
  return findString(body, ['task_id', 'id', 'prediction_id'])
}

function getStatus(body: unknown): string | undefined {
  return findString(body, ['status', 'state', 'task_status'])?.toLowerCase()
}

function getApiError(body: unknown, fallback: string): string {
  const objects = nestedObjects(body)
  for (const key of ['error_reason', 'detail', 'error', 'message', 'reason']) {
    for (const object of objects) {
      const value = object[key]
      if (typeof value === 'string' && value.trim()) return value.trim()
    }
  }
  return fallback
}

function getMediaUrl(body: unknown, mediaKind: GeneratedMediaKind): string | undefined {
  const preferred = mediaKind === 'image'
    ? ['image_url', 'url_image', 'image', 'video_url', 'url_video', 'url', 'output_url']
    : ['video_url', 'url_video', 'url', 'output_url', 'image_url', 'url_image']
  for (const object of nestedObjects(body)) {
    for (const key of preferred) {
      const value = object[key]
      if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) return value.trim()
    }
    for (const key of ['outputs', 'images', 'videos', 'result']) {
      const value = object[key]
      if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) return value.trim()
      if (Array.isArray(value)) {
        const url = value.find(item => typeof item === 'string' && /^https?:\/\//i.test(item.trim()))
        if (typeof url === 'string') return url.trim()
      }
    }
  }
  return undefined
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) return null
  try { return JSON.parse(text) as unknown } catch { return { message: text } }
}

function waitForNextPoll(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Generation cancelled', 'AbortError'))
      return
    }
    let timeout: number
    const onAbort = () => {
      window.clearTimeout(timeout)
      signal.removeEventListener('abort', onAbort)
      reject(new DOMException('Generation cancelled', 'AbortError'))
    }
    timeout = window.setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, POLL_INTERVAL_MS)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

function toFormData(payload: GenerationPayload): FormData {
  const formData = new FormData()
  for (const [key, value] of Object.entries(payload)) {
    if (value == null || value === '') continue
    if (value instanceof Blob) formData.append(key, value)
    else if (typeof value === 'object') formData.append(key, JSON.stringify(value))
    else formData.append(key, String(value))
  }
  return formData
}

function completeGeneration(taskId: string | undefined, mediaUrl: string, mediaKind: GeneratedMediaKind): VideoGeneration {
  return {
    status: 'completed',
    ...(taskId && { taskId }),
    mediaType: mediaKind,
    mediaUrl,
    ...(mediaKind === 'image' ? { imageUrl: mediaUrl } : { videoUrl: mediaUrl }),
  }
}

export async function generateBotnoiMedia(options: BotnoiGenerationOptions): Promise<VideoGeneration> {
  const { submitEndpointId, statusEndpointId, payload, mediaKind, signal, onStatus } = options
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Botnoi ก่อนเริ่มสร้าง')

  const submitEndpoint = endpoints[submitEndpointId]
  const statusEndpoint = endpoints[statusEndpointId]
  if (!submitEndpoint || !statusEndpoint) throw new Error('ไม่พบ endpoint สำหรับสร้างหรือดึงผลลัพธ์ใน Botnoi catalog')

  const requestBody = submitEndpoint.requestBody?.contentType.includes('application/json')
    ? JSON.stringify(payload)
    : toFormData(payload)
  const submitResponse = await fetch(`${BOTNOI_API_BASE_URL}${submitEndpoint.path}`, {
    method: submitEndpoint.method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(submitEndpoint.requestBody?.contentType.includes('application/json') && { 'Content-Type': 'application/json' }),
    },
    body: requestBody,
    signal,
  })
  const submitBody = await readResponse(submitResponse)
  if (!submitResponse.ok) throw new Error(getApiError(submitBody, `ส่งคำขอไม่สำเร็จ (HTTP ${submitResponse.status})`))

  const taskId = getTaskId(submitBody)
  const immediateMediaUrl = getMediaUrl(submitBody, mediaKind)
  if (immediateMediaUrl) {
    const completed = completeGeneration(taskId, immediateMediaUrl, mediaKind)
    onStatus(completed)
    return completed
  }
  if (!taskId) throw new Error('API รับคำขอแล้วแต่ไม่ได้ส่ง task ID กลับมา')

  onStatus({ status: 'processing', taskId, mediaType: mediaKind })
  const pathParameter = statusEndpoint.parameters.find(parameter => parameter.in === 'path')
  let statusPath = statusEndpoint.path
  if (statusPath.includes('{')) {
    if (!pathParameter) throw new Error('ไม่พบ path parameter ของ GET result endpoint')
    statusPath = statusPath.replace(`{${pathParameter.name}}`, encodeURIComponent(taskId))
  }
  const queryParameter = statusEndpoint.parameters.find(parameter => parameter.in === 'query')
  const statusUrl = new URL(`${BOTNOI_API_BASE_URL}${statusPath}`)
  if (queryParameter) statusUrl.searchParams.set(queryParameter.name, taskId)

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await waitForNextPoll(signal)
    const statusResponse = await fetch(statusUrl.toString(), {
      method: statusEndpoint.method,
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
    const statusBody = await readResponse(statusResponse)
    if (!statusResponse.ok) throw new Error(getApiError(statusBody, `ตรวจสถานะงานไม่สำเร็จ (HTTP ${statusResponse.status})`))

    const status = getStatus(statusBody)
    if (status && ['complete', 'completed', 'success', 'done'].includes(status)) {
      const mediaUrl = getMediaUrl(statusBody, mediaKind)
      if (!mediaUrl) throw new Error('งานเสร็จแล้ว แต่ API ไม่ได้ส่ง URL ผลลัพธ์กลับมา')
      const completed = completeGeneration(taskId, mediaUrl, mediaKind)
      onStatus(completed)
      return completed
    }
    if (status && ['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
      throw new Error(getApiError(statusBody, 'งานสร้างไม่สำเร็จ'))
    }
    if (!status) throw new Error('API ตอบกลับโดยไม่มีสถานะงาน')
  }

  throw new Error('การสร้างใช้เวลานานกว่าที่รอได้ กรุณาตรวจสอบ task อีกครั้ง')
}

export async function uploadBotnoiImage(file: File, signal: AbortSignal): Promise<VideoGeneration> {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Botnoi ก่อนอัปโหลดภาพ')
  const endpoint = endpoints['gptimg-upload']
  const fieldName = endpoint.requestBody?.fields?.find(field => field.type.startsWith('File'))?.name ?? 'file'
  const formData = new FormData()
  formData.append(fieldName, file)
  const response = await fetch(`${BOTNOI_API_BASE_URL}${endpoint.path}`, {
    method: endpoint.method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal,
  })
  const body = await readResponse(response)
  if (!response.ok) throw new Error(getApiError(body, `อัปโหลดภาพไม่สำเร็จ (HTTP ${response.status})`))
  const imageUrl = findString(body, ['img_url', 'image_url', 'url_image', 'url'])
  if (!imageUrl) throw new Error('อัปโหลดสำเร็จ แต่ API ไม่ได้ส่ง URL ภาพกลับมา')
  return completeGeneration(undefined, imageUrl, 'image')
}
