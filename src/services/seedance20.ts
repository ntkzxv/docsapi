import { BOTNOI_API_BASE_URL, endpoints } from '../data/botnoiEndpoints'
import type { VideoGeneration } from './seedance25'

const TOKEN_KEY = '_bn_token'
const POLL_INTERVAL_MS = 10_000
const MAX_POLL_ATTEMPTS = 120

export interface Seedance20Request {
  prompt: string
  mode: string
  model?: string
  image_file?: File
  duration: string
  ratio: string
  resolution: string
}

interface ApiResponse {
  id?: string
  task_id?: string
  status?: string
  video_url?: string
  url_video?: string
  data?: {
    id?: string
    task_id?: string
    status?: string
    video_url?: string
    url_video?: string
    error?: string
  }
  detail?: string
  message?: string
  error?: string
}

function getErrorMessage(body: ApiResponse | null, fallback: string): string {
  return body?.detail || body?.message || body?.data?.error || body?.error || fallback
}

async function readResponse(response: Response): Promise<ApiResponse | null> {
  try {
    return await response.json() as ApiResponse
  } catch {
    return null
  }
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

export async function generateSeedance20(
  request: Seedance20Request,
  signal: AbortSignal,
  onStatus: (generation: VideoGeneration) => void,
): Promise<VideoGeneration> {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) throw new Error('กรุณาเข้าสู่ระบบ Botnoi ก่อนสร้างวิดีโอ')

  const formData = new FormData()
  formData.append('prompt', request.prompt)
  formData.append('mode', request.mode)
  if (request.model) formData.append('model', request.model)
  if (request.image_file) formData.append('image_file', request.image_file)
  formData.append('duration', request.duration)
  formData.append('ratio', request.ratio)
  formData.append('resolution', request.resolution)

  const submitEndpoint = endpoints['seedance20-submit']
  const submitResponse = await fetch(`${BOTNOI_API_BASE_URL}${submitEndpoint.path}`, {
    method: submitEndpoint.method,
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal,
  })
  const submitBody = await readResponse(submitResponse)
  if (!submitResponse.ok) {
    throw new Error(getErrorMessage(submitBody, `ส่งคำขอไม่สำเร็จ (HTTP ${submitResponse.status})`))
  }

  const taskId = submitBody?.data?.task_id ?? submitBody?.data?.id ?? submitBody?.task_id ?? submitBody?.id
  if (!taskId) throw new Error('API ไม่ได้ส่ง task ID กลับมา')
  onStatus({ status: 'processing', taskId })

  const statusEndpoint = endpoints['seedance20-status']
  const statusPath = statusEndpoint.path.replace('{task_id}', encodeURIComponent(taskId))
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await waitForNextPoll(signal)
    const statusResponse = await fetch(`${BOTNOI_API_BASE_URL}${statusPath}`, {
      method: statusEndpoint.method,
      headers: { Authorization: `Bearer ${token}` },
      signal,
    })
    const statusBody = await readResponse(statusResponse)
    if (!statusResponse.ok) {
      throw new Error(getErrorMessage(statusBody, `ตรวจสถานะงานไม่สำเร็จ (HTTP ${statusResponse.status})`))
    }

    const status = (statusBody?.data?.status ?? statusBody?.status)?.toLowerCase()
    if (status === 'complete' || status === 'completed' || status === 'success') {
      const videoUrl = statusBody?.data?.video_url ?? statusBody?.video_url ?? statusBody?.data?.url_video ?? statusBody?.url_video
      if (!videoUrl) throw new Error('งานเสร็จแล้ว แต่ API ไม่ได้ส่ง URL วิดีโอกลับมา')
      const completed = { status: 'completed' as const, taskId, videoUrl }
      onStatus(completed)
      return completed
    }
    if (status === 'failed') {
      throw new Error(getErrorMessage(statusBody, 'สร้างวิดีโอไม่สำเร็จ'))
    }
    if (status !== 'pending' && status !== 'processing') {
      throw new Error(`สถานะงานไม่รู้จัก: ${status || 'ไม่มีสถานะ'}`)
    }
  }

  throw new Error('การสร้างวิดีโอใช้เวลานานกว่าที่รอได้ กรุณาลองตรวจสอบ task อีกครั้ง')
}
