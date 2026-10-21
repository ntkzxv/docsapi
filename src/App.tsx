import { useEffect, useRef, useState } from 'react'
import './App.css'
import Icon from './components/Icon'
import EndpointRoute from './components/EndpointRoute'
import ProviderLogo, { type ApiProvider } from './components/ProviderLogo'
import PromptFooter from './components/PromptFooter'
import ApiDocsFooter from './components/ApiDocsFooter'
import IndexPage from './pages/IndexPage'
import ApiKeyPage from './pages/ApiKeyPage'
import HomePage from './pages/HomePage'
import CategoryPage from './pages/CategoryPage'
import TryItPage from './pages/TryItPage'
import { Choice, InfiniteTalkForm, MotionControlForm, OmniHumanForm, SeeDreamForm, Seedance20Form, WaveSpeedModelForm } from './features/try-it/TryItForms'
import GPTImagePage from './pages/gptimagepage'
import BotnoiEndpointPage from './pages/BotnoiEndpointPage'
import BotnoiRequestForm from './features/try-it/BotnoiRequestForm'
import { BotnoiAuthProvider, useBotnoiAuth } from './components/BotnoiAuthButton'
import NotificationProvider, { useNotification } from './components/NotificationProvider'
import { LanguageProvider, useLanguage } from './functions/LanguageProvider'
import { endpointDocs, endpointGroups as catalogGroups, endpointMarkdown, initialForm, seedance25Markdown, seedance25ResultMarkdown, wavespeedModels } from './data/endpointCatalog'
import { BOTNOI_API_BASE_URL, endpoints as botnoiEndpoints } from './data/botnoiEndpoints'
import { botnoiEndpointGroups } from './data/botnoiEndpointGroups'
import { adaptBotnoiEndpoint } from './data/adaptBotnoiEndpoint'
import { generateSeedance20 } from './services/seedance20'
import { generateSeedance25 } from './services/seedance25'
import { generateBotnoiMedia, uploadBotnoiImage } from './services/botnoiGeneration'
import type { FormEvent, InvalidEvent, MouseEvent } from 'react'
import type { EndpointDoc, EndpointGroup, EndpointItem, InitialVideoForm, RequestPreview, UploadedMedia } from './types/app'
import type { Seedance20Request } from './services/seedance20'
import type { VideoGeneration, Seedance25Request } from './services/seedance25'
import type { ModelCategory } from './data/modelCatalog'

const endpointGroups: EndpointGroup[] = [...botnoiEndpointGroups, ...catalogGroups.filter(group => group.name === 'Feature Model')]
const integratedEndpoints = endpointGroups.flatMap(group => group.items)
const botnoiSchemaFormIds = new Set(['gptimg-text2img', 'gptimg-upload', 'gptimg-edit'])
const botnoiCustomFormIds = new Set(['seedance25-submit', 'seedance20-submit', 'motion-control-submit', 'infinitetalk-submit', 'omnihuman-submit', 'seedream-submit'])
const botnoiGenerationPairs: Record<string, { statusEndpointId: string; mediaKind: 'image' | 'video' }> = {
  'seedance25-submit': { statusEndpointId: 'seedance25-status', mediaKind: 'video' },
  'seedance20-submit': { statusEndpointId: 'seedance20-status', mediaKind: 'video' },
  'motion-control-submit': { statusEndpointId: 'motion-control-status', mediaKind: 'video' },
  'infinitetalk-submit': { statusEndpointId: 'infinitetalk-status', mediaKind: 'video' },
  'omnihuman-submit': { statusEndpointId: 'omnihuman-status', mediaKind: 'video' },
  'seedream-submit': { statusEndpointId: 'seedream-status', mediaKind: 'image' },
  'gptimg-text2img': { statusEndpointId: 'gptimg-status', mediaKind: 'image' },
  'gptimg-edit': { statusEndpointId: 'gptimg-status', mediaKind: 'image' },
}
type GenerationState = Omit<VideoGeneration, 'status'> & { status: 'idle' | VideoGeneration['status'] }
const supportsTryIt = (item: EndpointItem | undefined) => item?.kind === 'model' || (item?.kind === 'botnoi' && Boolean(item.botnoiId) && (botnoiSchemaFormIds.has(item.botnoiId!) || botnoiCustomFormIds.has(item.botnoiId!))) || ['Create GPT Image', 'Create Seedance 2.5 video', 'Create SeeDance 2.0 video', 'Create Motion Control video', 'Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image'].includes(item?.name ?? '')

function TryItCallout({ onTry, live = true }: { onTry: () => void; live?: boolean }) {
  const { t } = useLanguage()
  return <aside className="endpoint-try-group">
    <div><h2>{t('ทดลองใช้ endpoint นี้')}</h2><p>{t(live ? 'ส่งคำขอไปยัง Botnoi API จริง งานสร้างสื่ออาจหัก coin หรือ credit ตามเงื่อนไขของ API' : 'กรอกข้อมูลและดูตัวอย่าง Request ได้ โดยยังไม่ส่งข้อมูลไปยัง API จริง')}</p></div>
    <button className="endpoint-launch-button" onClick={onTry}><span>Try it on <strong>Botnoi</strong></span><Icon name="arrow" width="17" height="17"/></button>
  </aside>
}
function EndpointDocsPage({ doc, markdownCopied, onCopyMarkdown, onTry }: { doc: EndpointDoc; markdownCopied: boolean; onCopyMarkdown: () => void; onTry: () => void }) {
  const { t } = useLanguage()
  return <article className="endpoint-docs">
    <div className="endpoint-docs-title-row"><h1>{t(doc.title)}</h1><button className="markdown-copy-button" onClick={onCopyMarkdown}><Icon name="copy" width="15" height="15"/>{t(markdownCopied ? 'Copied!' : 'Copy as Markdown')}</button></div>
    {doc.description && <p className="endpoint-docs-description">{t(doc.description)}</p>}
    {doc.path && <section className="endpoint-docs-section endpoint-route-section"><h2>{t('Endpoint')}</h2><EndpointRoute method={doc.method} url={`${doc.sourceUrl ? 'https://api.wavespeed.ai' : BOTNOI_API_BASE_URL}${doc.path}`}/></section>}
    {doc.scopeNote && !doc.hideAttribution && <p className="endpoint-scope-note">{t(doc.scopeNote)} · {t('Base URL')}: <code>https://api.wavespeed.ai</code></p>}
    {doc.sourceUrl && !doc.hideAttribution && <p className="endpoint-source">{t('อ้างอิง')} <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer">{t('เอกสาร WaveSpeedAI ↗')}</a></p>}
    {doc.method === 'POST' && onTry && <TryItCallout onTry={onTry} live={!doc.sourceUrl}/>}
    <section className="endpoint-docs-section"><h2>{t('Auth')}</h2><p>{doc.sourceUrl ? <>{t('WaveSpeedAI API key')}: <code>Authorization: Bearer &lt;WAVESPEED_API_KEY&gt;</code></> : t('Authentication required.')}</p></section>
    <section className="endpoint-docs-section"><h2>{t('Parameters')}</h2>{doc.parameters ? <div className="endpoint-table-wrap"><table><thead><tr><th>{t('Name')}</th><th>{t('In')}</th><th>{t('Required')}</th><th>{t('Type')}</th><th>{t('Description')}</th></tr></thead><tbody>{doc.parameters.map(([name, location, required, type, description]) => <tr key={name}><td><code>{name}</code></td><td>{t(location)}</td><td>{t(required)}</td><td>{t(type)}</td><td>{t(description)}</td></tr>)}</tbody></table></div> : <p>{t('No parameters.')}</p>}</section>
    <section className="endpoint-docs-section"><h2>{t('Request Body')}</h2>{doc.body ? <><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Required')}</th><th>{t('Content-Type')}</th><th>{t('Shape')}</th></tr></thead><tbody><tr><td>{t('Yes')}</td><td><code>{doc.body.contentType}</code></td><td><code>{doc.body.shape}</code></td></tr></tbody></table></div><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Name')}</th><th>{t('Type')}</th><th>{t('Required')}</th><th>{t('Description')}</th></tr></thead><tbody>{doc.body.fields.map(([name, type, required, description]) => <tr key={name}><td><code>{name}</code></td><td>{t(type)}</td><td>{t(required)}</td><td>{t(description)}</td></tr>)}</tbody></table></div></> : <p>{t('No request body.')}</p>}</section>
    <section className="endpoint-docs-section"><h2>{t('Responses')}</h2><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Status')}</th><th>{t('Description')}</th><th>{t('Content-Type')}</th><th>{t('Shape')}</th></tr></thead><tbody>{doc.responses?.map(([status, description, shape]) => <tr key={status}><td><strong className={`response-status ${status === '200' ? 'success' : status === '401' ? 'unauthorized' : 'forbidden'}`}>{status}</strong></td><td>{t(description)}</td><td><code>application/json</code></td><td><code>{shape}</code></td></tr>)}</tbody></table></div></section>
    <section className="endpoint-docs-section"><h2>{t('Example Response (200)')}</h2><pre className="endpoint-example">{JSON.stringify(doc.example, null, 2)}</pre>{doc.statusNote && <p className="endpoint-status-note">{t('Status')}: {doc.statusNote.split(' | ').map((status, index) => <span key={status}>{index > 0 && ' | '}<code>{status}</code></span>)}</p>}</section>
    {doc.resultPath && <section className="endpoint-docs-section"><h2>{t('Get result')}</h2><p>{t('ใช้ data.id จากผลการส่งงาน เพื่อตรวจสถานะด้วย GET เมื่อสถานะเป็น completed ผลลัพธ์อยู่ใน data.outputs').replace('GET', `GET ${doc.resultPath}`)}</p></section>}
  </article>
}
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const endpointFromHash = (): EndpointItem => {
  const routeSlug = window.location.hash.match(/^#\/(?:try-it-now|endpoint|model)\/(.+)$/)?.[1]
  const legacyModels: Record<string, string> = { 'kling-ai': 'kling-3-0-std', 'wan-alibaba': 'wan-3-0-alibaba', 'gpt-image': 'gpt-image-2-5' }
  const resolvedSlug = legacyModels[routeSlug ?? ''] ?? (routeSlug === 'kling-1-5' ? 'kling-3-0-std' : routeSlug)
  return integratedEndpoints.find(item => item.id === routeSlug || slug(item.name) === resolvedSlug) ?? integratedEndpoints.find(item => item.method === 'POST') ?? integratedEndpoints[0]!
}
const categoryFromHash = (): ModelCategory | null => {
  const category = window.location.hash.match(/^#\/category\/(video-generation|image-generation|talking-avatars)$/)?.[1]
  return category as ModelCategory | undefined ?? null
}
function AppContent() {
  const notify = useNotification()
  const { signedIn, openLoginPopup } = useBotnoiAuth()
  const { t } = useLanguage()
  const nativeInvalidNotified = useRef(false)
  const [activeEndpoint, setActiveEndpoint] = useState<EndpointItem>(endpointFromHash)
  const [isHome, setIsHome] = useState(() => !window.location.hash || window.location.hash === '#/')
  const [isApiKeyPage, setIsApiKeyPage] = useState(() => window.location.hash === '#/api-key')
  const [category, setCategory] = useState<ModelCategory | null>(categoryFromHash)
  const [isTryPage, setIsTryPage] = useState(() => window.location.hash.startsWith('#/try-it-now/') && supportsTryIt(endpointFromHash()))
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => Object.fromEntries(endpointGroups.map(group => [group.name, true])))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => localStorage.getItem('try-it-theme') === 'light' ? 'light' : 'dark')
  const [markdownCopied, setMarkdownCopied] = useState(false)
  const [generation, setGeneration] = useState<GenerationState>({ status: 'idle' })
  const generationAbortRef = useRef<AbortController | null>(null)
  const routeHashRef = useRef(window.location.hash)
  const hasGenerationResult = Boolean(generation.mediaUrl || generation.imageUrl || generation.videoUrl)
  const shouldProtectGeneration = generation.status === 'submitting'
    || generation.status === 'processing'
    || generation.status === 'completed'
    || hasGenerationResult
  const confirmGenerationExit = () => {
    if (!shouldProtectGeneration) return true
    return window.confirm('มีงานสร้างที่กำลังดำเนินการหรือมีผลลัพธ์แล้ว หากออกจากหน้านี้ ผลลัพธ์อาจหายไป ต้องการออกจากหน้าหรือไม่?')
  }
  const resetGeneration = () => {
    generationAbortRef.current?.abort()
    generationAbortRef.current = null
    setGeneration({ status: 'idle' })
  }
  useEffect(() => {
    const syncEndpoint = () => {
      const nextHash = window.location.hash
      if (!confirmGenerationExit()) {
        window.history.pushState({}, '', routeHashRef.current || '/')
        return
      }
      if (nextHash !== routeHashRef.current) resetGeneration()
      routeHashRef.current = nextHash
      const item = endpointFromHash()
      setActiveEndpoint(item)
      setIsHome(!window.location.hash || window.location.hash === '#/')
      setIsApiKeyPage(window.location.hash === '#/api-key')
      setCategory(categoryFromHash())
      setIsTryPage(window.location.hash.startsWith('#/try-it-now/') && supportsTryIt(item))
    }
    window.addEventListener('popstate', syncEndpoint)
    window.addEventListener('hashchange', syncEndpoint)
    return () => { window.removeEventListener('popstate', syncEndpoint); window.removeEventListener('hashchange', syncEndpoint) }
  }, [shouldProtectGeneration])
  useEffect(() => () => generationAbortRef.current?.abort(), [])
  useEffect(() => {
    if (!shouldProtectGeneration) return
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [shouldProtectGeneration])
  useEffect(() => { resetGeneration() }, [activeEndpoint.id])
  useEffect(() => { localStorage.setItem('try-it-theme', theme) }, [theme])
  const selectEndpoint = (item: EndpointItem) => {
    const nextHash = `#/${item.kind === 'model' ? 'model' : 'endpoint'}/${item.kind === 'botnoi' ? item.id : slug(item.name)}`
    if (!confirmGenerationExit()) return
    resetGeneration()
    setActiveEndpoint(item)
    setPreview(null)
    setMarkdownCopied(false)
    window.history.pushState({}, '', nextHash)
    routeHashRef.current = nextHash
    setIsHome(false)
    setIsApiKeyPage(false)
    setCategory(null)
    setIsTryPage(false)
    setSidebarOpen(false)
  }
  const openTryIt = () => {
    if (!supportsTryIt(activeEndpoint)) return
    const nextHash = `#/try-it-now/${activeEndpoint.kind === 'botnoi' ? activeEndpoint.id : slug(activeEndpoint.name)}`
    if (!confirmGenerationExit()) return
    resetGeneration()
    setPreview(null)
    window.history.pushState({}, '', nextHash)
    routeHashRef.current = nextHash
    setIsTryPage(true)
  }
  const openApiKeyPage = () => {
    if (!confirmGenerationExit()) return
    resetGeneration()
    const nextHash = '#/api-key'
    window.history.pushState({}, '', nextHash)
    routeHashRef.current = nextHash
    setIsHome(false)
    setIsApiKeyPage(true)
    setCategory(null)
    setIsTryPage(false)
    setSidebarOpen(false)
  }
  const openCategory = (nextCategory: ModelCategory) => {
    const nextHash = `#/category/${nextCategory}`
    if (!confirmGenerationExit()) return
    resetGeneration()
    setIsApiKeyPage(false)
    window.history.pushState({}, '', nextHash)
    routeHashRef.current = nextHash
    setIsHome(false)
    setCategory(nextCategory)
    setIsTryPage(false)
    setSidebarOpen(false)
  }
  const copyMarkdown = async () => {
    try {
      const botnoiEndpoint = activeEndpoint.botnoiId ? botnoiEndpoints[activeEndpoint.botnoiId] : null
      const botnoiView = botnoiEndpoint ? adaptBotnoiEndpoint(botnoiEndpoint) : null
      const primaryExample = botnoiView?.examples.find(example => example.status >= 200 && example.status < 300)
      const rawExample = primaryExample?.value
      let example = {}
      if (rawExample) {
        try { example = JSON.parse(rawExample) } catch { example = rawExample }
      }
      const markdown = botnoiEndpoint && botnoiView
        ? endpointMarkdown({ title: botnoiEndpoint.title, method: botnoiEndpoint.method, path: `${BOTNOI_API_BASE_URL}${botnoiEndpoint.path}`, description: botnoiEndpoint.description, parameters: botnoiView.parameters, body: botnoiView.body ?? undefined, responses: botnoiView.responses, example, exampleStatus: primaryExample?.status })
        : endpointDocs[activeEndpoint.name]
        ? endpointMarkdown({ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] })
        : wavespeedModels[activeEndpoint.name]
          ? endpointMarkdown(wavespeedModels[activeEndpoint.name])
        : activeEndpoint.name === 'Get Seedance 2.5 result' ? seedance25ResultMarkdown : seedance25Markdown
      await navigator.clipboard.writeText(markdown)
      setMarkdownCopied(true)
      notify('success', 'คัดลอก Markdown แล้ว')
      window.setTimeout(() => setMarkdownCopied(false), 1800)
    } catch {
      setError('คัดลอก Markdown ไม่สำเร็จ กรุณาลองอีกครั้ง')
      notify('failure', 'คัดลอก Markdown ไม่สำเร็จ กรุณาลองอีกครั้ง')
    }
  }
  const [form, setForm] = useState<InitialVideoForm>(initialForm)
  const [media, setMedia] = useState<{ images: UploadedMedia[]; videos: UploadedMedia[] }>({ images: [], videos: [] })
  const [preview, setPreview] = useState<RequestPreview | null>(null)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const [avatarResetKey, setAvatarResetKey] = useState(0)
  const [seedreamResetKey, setSeedreamResetKey] = useState(0)
  const [seedance20ResetKey, setSeedance20ResetKey] = useState(0)
  const [motionResetKey, setMotionResetKey] = useState(0)
  const [omniResetKey, setOmniResetKey] = useState(0)
  const [modelResetKey, setModelResetKey] = useState(0)
  const [gptImageResetKey, setGptImageResetKey] = useState(0)
  const isSeedance25 = activeEndpoint.botnoiId === 'seedance25-submit' || activeEndpoint.name === 'Create Seedance 2.5 video'
  const isGenerating = generation.status === 'submitting' || generation.status === 'processing'
  const update = (key: keyof InitialVideoForm, value: string | boolean) => setForm(current => ({ ...current, [key]: value }))
  const upload = async (kind: 'images' | 'videos', files: FileList | null) => {
    setError('')
    const selected = Array.from(files ?? [])
    if (selected.some(file => !file.type.startsWith(kind === 'images' ? 'image/' : 'video/'))) {
      const message = 'กรุณาเลือกไฟล์ให้ตรงกับประเภทภาพหรือวิดีโอ'
      setError(message)
      if (activeEndpoint.method === 'POST') notify('failure', message)
      return
    }
    setReading(true)
    try {
      const items = await Promise.all(selected.map(file => new Promise<UploadedMedia>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => typeof reader.result === 'string' ? resolve({ name: file.name, data: reader.result }) : reject(new Error('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'))
        reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'))
        reader.readAsDataURL(file)
      })))
      setMedia(current => ({ ...current, [kind]: [...current[kind], ...items] }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'
      setError(message)
      if (activeEndpoint.method === 'POST') notify('failure', message)
    }
    finally { setReading(false) }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.prompt.trim()) {
      const message = 'กรุณากรอก Prompt ก่อนสร้างคำขอ'
      setError(message)
      if (activeEndpoint.method === 'POST') notify('failure', message)
      return
    }
    setError('')
    const request: Seedance25Request = { prompt: form.prompt.trim(), duration: Number(form.duration), resolution: form.resolution,
      ...(form.aspect_ratio && { aspect_ratio: form.aspect_ratio }), generate_audio: form.generate_audio,
      ...(media.images.length && { reference_images: media.images.map(item => item.data) }),
      ...(media.videos.length && { reference_videos: media.videos.map(item => item.data) }),
    }
    setPreview({ ...request })
    if (!isSeedance25) {
      if (activeEndpoint.method === 'POST') notify('success', 'เตรียมข้อมูลคำขอแล้ว (ยังไม่ได้ส่ง API)')
      return
    }

    resetGeneration()
    const controller = new AbortController()
    generationAbortRef.current = controller
    setGeneration({ status: 'submitting' })
    void generateSeedance25(request, controller.signal, next => {
      if (!controller.signal.aborted) setGeneration(next)
    }).then(result => {
      if (generationAbortRef.current === controller && result.status === 'completed') notify('success', 'สร้างวิดีโอ Seedance 2.5 สำเร็จ')
    }).catch(failure => {
      if (controller.signal.aborted || (failure instanceof DOMException && failure.name === 'AbortError')) return
      const message = failure instanceof Error ? failure.message : 'สร้างวิดีโอไม่สำเร็จ กรุณาลองอีกครั้ง'
      setGeneration({ status: 'failed', error: message })
      notify('failure', message)
    }).finally(() => {
      if (generationAbortRef.current === controller) generationAbortRef.current = null
    })
  }
  const generateSeedance20Video = (request: Seedance20Request) => {
    resetGeneration()
    setPreview(null)
    const controller = new AbortController()
    generationAbortRef.current = controller
    setGeneration({ status: 'submitting' })
    void generateSeedance20(request, controller.signal, next => {
      if (!controller.signal.aborted) setGeneration(next)
    }).then(result => {
      if (generationAbortRef.current === controller && result.status === 'completed') notify('success', 'สร้างวิดีโอ SeeDance 2.0 สำเร็จ')
    }).catch(failure => {
      if (controller.signal.aborted || (failure instanceof DOMException && failure.name === 'AbortError')) return
      const message = failure instanceof Error ? failure.message : 'สร้างวิดีโอไม่สำเร็จ กรุณาลองอีกครั้ง'
      setGeneration({ status: 'failed', error: message })
      notify('failure', message)
    }).finally(() => {
      if (generationAbortRef.current === controller) generationAbortRef.current = null
    })
  }
  const presentablePayload = (payload: Record<string, unknown>): RequestPreview => Object.fromEntries(Object.entries(payload).map(([key, value]) => [
    key,
    value instanceof File ? { file_name: value.name, content_type: value.type || 'application/octet-stream', size: value.size } : value,
  ]))
  const generateBotnoiEndpoint = (submitEndpointId: string, payload: Record<string, unknown>) => {
    const pair = botnoiGenerationPairs[submitEndpointId]
    if (!pair) return
    setPreview(presentablePayload(payload))
    resetGeneration()
    const controller = new AbortController()
    generationAbortRef.current = controller
    setGeneration({ status: 'submitting', mediaType: pair.mediaKind })
    void generateBotnoiMedia({
      submitEndpointId,
      statusEndpointId: pair.statusEndpointId,
      payload,
      mediaKind: pair.mediaKind,
      signal: controller.signal,
      onStatus: next => { if (!controller.signal.aborted) setGeneration(next) },
    }).then(result => {
      if (generationAbortRef.current === controller && result.status === 'completed') notify('success', `สร้าง${pair.mediaKind === 'image' ? 'ภาพ' : 'วิดีโอ'}สำเร็จ`)
    }).catch(failure => {
      if (controller.signal.aborted || (failure instanceof DOMException && failure.name === 'AbortError')) return
      const message = failure instanceof Error ? failure.message : 'สร้างผลลัพธ์ไม่สำเร็จ กรุณาลองอีกครั้ง'
      setGeneration({ status: 'failed', mediaType: pair.mediaKind, error: message })
      notify('failure', message)
    }).finally(() => {
      if (generationAbortRef.current === controller) generationAbortRef.current = null
    })
  }
  const uploadBotnoiSourceImage = (payload: Record<string, unknown>) => {
    const file = payload.file
    if (!(file instanceof File)) {
      notify('failure', 'กรุณาเลือกไฟล์ภาพก่อนอัปโหลด')
      return
    }
    resetGeneration()
    const controller = new AbortController()
    generationAbortRef.current = controller
    setGeneration({ status: 'submitting', mediaType: 'image' })
    void uploadBotnoiImage(file, controller.signal).then(result => {
      if (generationAbortRef.current === controller) {
        setGeneration(result)
        notify('success', 'อัปโหลดภาพสำเร็จ')
      }
    }).catch(failure => {
      if (controller.signal.aborted || (failure instanceof DOMException && failure.name === 'AbortError')) return
      const message = failure instanceof Error ? failure.message : 'อัปโหลดภาพไม่สำเร็จ กรุณาลองอีกครั้ง'
      setGeneration({ status: 'failed', mediaType: 'image', error: message })
      notify('failure', message)
    }).finally(() => {
      if (generationAbortRef.current === controller) generationAbortRef.current = null
    })
  }
  const handleBotnoiRequest = (payload: RequestPreview) => {
    const endpointId = activeEndpoint.botnoiId
    if (!endpointId) return handlePreview(payload)
    setPreview(presentablePayload(payload))
    if (endpointId === 'gptimg-upload') {
      uploadBotnoiSourceImage(payload)
      return
    }
    if (botnoiGenerationPairs[endpointId]) {
      generateBotnoiEndpoint(endpointId, payload)
      return
    }
    if (activeEndpoint.method === 'POST') notify('success', 'เตรียมข้อมูลคำขอแล้ว (endpoint นี้ยังไม่มี flow สร้างผลลัพธ์อัตโนมัติ)')
  }
  const reset = () => { resetGeneration(); setForm(initialForm); setMedia({ images: [], videos: [] }); setPreview(null); setError('') }
  const handlePreview = (data: RequestPreview) => {
    setPreview(data)
    if (activeEndpoint.method === 'POST') notify('success', 'เตรียมข้อมูลคำขอแล้ว (ยังไม่ได้ส่ง API)')
  }
  const handleNativeInvalid = (event: InvalidEvent<HTMLDivElement>) => {
    if (activeEndpoint.method !== 'POST') return
    event.preventDefault()
    if (nativeInvalidNotified.current) return
    nativeInvalidNotified.current = true
    const target = event.target
    const fieldName = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement ? target.labels?.[0]?.textContent?.replace('*', '').trim() : undefined
    notify('failure', fieldName ? `กรุณากรอก ${fieldName} ให้ครบก่อน Preview Request` : 'กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อน Preview Request')
    window.setTimeout(() => { nativeInvalidNotified.current = false }, 100)
  }
  const requireSignInForPost = (event: MouseEvent<HTMLElement> | FormEvent<HTMLElement>) => {
    if (activeEndpoint.method !== 'POST' || signedIn) return
    if (event.type === 'click' && event.target instanceof Element && event.target.closest('form.wavespeed-form')) return
    if (event.type === 'click' && !(event.target instanceof Element && event.target.closest('button.primary-button[type="submit"]'))) return
    event.preventDefault()
    event.stopPropagation()
    notify('system', t('กรุณาเข้าสู่ระบบเพื่อใช้งาน'))
    openLoginPopup()
  }
  const goBack = () => {
    const nextHash = `#/${activeEndpoint.kind === 'model' ? 'model' : 'endpoint'}/${activeEndpoint.kind === 'botnoi' ? activeEndpoint.id : slug(activeEndpoint.name)}`
    if (!confirmGenerationExit()) return
    resetGeneration()
    window.history.pushState({}, '', nextHash)
    routeHashRef.current = nextHash
    setIsTryPage(false)
  }
  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  const mediaKind = activeEndpoint.botnoiId === 'gptimg-upload'
    ? 'image'
    : activeEndpoint.botnoiId ? botnoiGenerationPairs[activeEndpoint.botnoiId]?.mediaKind : undefined
  const isMediaGeneration = Boolean(mediaKind)
  const isImageUpload = activeEndpoint.botnoiId === 'gptimg-upload'
  const activeProvider: ApiProvider | null = activeEndpoint.kind === 'model'
    || ['Create GPT Image', 'Create Seedance 2.5 video', 'Create InfiniteTalk avatar', 'Create Motion Control video'].includes(activeEndpoint.name)
    ? 'wavespeed'
    : activeEndpoint.name === 'Create SeeDance 2.0 video' || activeEndpoint.name === 'Create SeeDream 4.5 image' || activeEndpoint.name === 'Create OmniHuman avatar'
      ? 'byteplus'
      : null
  const providerHeadingIcon = activeProvider ? <ProviderLogo provider={activeProvider}/> : <span className="model-icon"><Icon name="video"/></span>
  const outputUrl = generation.mediaUrl ?? generation.videoUrl ?? generation.imageUrl
  const resultType = mediaKind === 'image' || /image|img/i.test(activeEndpoint.name)
    ? 'IMAGE'
    : /audio|voice|speech|talk|tts/i.test(activeEndpoint.name)
      ? 'AUDIO / VIDEO'
      : 'VIDEO'
  const copyResultUrl = async () => {
    if (!outputUrl) return
    try {
      await navigator.clipboard.writeText(outputUrl)
      notify('success', t('คัดลอก URL ผลลัพธ์แล้ว'))
    } catch {
      notify('failure', t('คัดลอก URL ไม่สำเร็จ กรุณาเปิดลิงก์ผลลัพธ์แล้วคัดลอกจากแถบที่อยู่'))
    }
  }
  return <div className={`app-shell ${theme === 'light' ? 'light-mode' : ''}`}>
    {isTryPage ? <TryItPage activeEndpoint={activeEndpoint} theme={theme} onToggleTheme={toggleTheme} onBack={goBack}>
    <main className="workspace" onClickCapture={requireSignInForPost} onSubmitCapture={requireSignInForPost} onInvalidCapture={handleNativeInvalid}>
      <section className="input-panel" aria-label={t(activeEndpoint.botnoiId && botnoiSchemaFormIds.has(activeEndpoint.botnoiId) ? 'Request settings' : activeEndpoint.name === 'Create InfiniteTalk avatar' || activeEndpoint.name === 'Create OmniHuman avatar' ? 'Avatar settings' : activeEndpoint.name === 'Create SeeDream 4.5 image' || ['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : activeEndpoint.name === 'Create Motion Control video' ? 'Motion Control settings' : 'Video settings')}>
        {activeEndpoint.botnoiId && botnoiSchemaFormIds.has(activeEndpoint.botnoiId) ? <BotnoiRequestForm key={activeEndpoint.botnoiId} endpoint={botnoiEndpoints[activeEndpoint.botnoiId]} onPreview={handleBotnoiRequest} generationStatus={generation.status}/> : activeEndpoint.name === 'Create GPT Image' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('GPT Image settings')}</h2><p>{t('สร้างและแก้ไขรูปภาพด้วย GPT Image')}</p></div></div><button type="button" className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { setPreview(null); setGptImageResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <GPTImagePage resetSignal={gptImageResetKey} onPreview={handlePreview} onResetPreview={() => setPreview(null)}/>
        </> : activeEndpoint.kind === 'model' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t(['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : 'Video settings')}</h2><p>{t(wavespeedModels[activeEndpoint.name].title)}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { setPreview(null); setModelResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <WaveSpeedModelForm key={`${activeEndpoint.name}-${modelResetKey}`} doc={wavespeedModels[activeEndpoint.name]} onPreview={handlePreview}/>
        </> : activeEndpoint.name === 'Create InfiniteTalk avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('Avatar settings')}</h2><p>{t('อัปโหลดภาพใบหน้าและเสียงพูด')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { resetGeneration(); setPreview(null); setAvatarResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <InfiniteTalkForm key={avatarResetKey} onGenerate={payload => generateBotnoiEndpoint('infinitetalk-submit', payload)} generationStatus={generation.status}/>
        </> : activeEndpoint.name === 'Create SeeDream 4.5 image' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('Image settings')}</h2><p>{t('กำหนดรายละเอียดภาพที่ต้องการสร้าง')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { resetGeneration(); setPreview(null); setSeedreamResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <SeeDreamForm key={seedreamResetKey} onGenerate={payload => generateBotnoiEndpoint('seedream-submit', payload)} generationStatus={generation.status}/>
        </> : activeEndpoint.name === 'Create SeeDance 2.0 video' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('Video settings')}</h2><p>{t('ตั้งค่า Text-to-Video หรือ Image-to-Video')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { resetGeneration(); setPreview(null); setSeedance20ResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <Seedance20Form key={seedance20ResetKey} onGenerate={generateSeedance20Video} generationStatus={generation.status}/>
        </> : activeEndpoint.name === 'Create Motion Control video' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('Motion Control settings')}</h2><p>{t('จับคู่ภาพตัวละครกับคลิปท่าทาง')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { resetGeneration(); setPreview(null); setMotionResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <MotionControlForm key={motionResetKey} onGenerate={payload => generateBotnoiEndpoint('motion-control-submit', payload)} generationStatus={generation.status}/>
        </> : activeEndpoint.name === 'Create OmniHuman avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('OmniHuman settings')}</h2><p>{t('สร้าง Avatar ที่ซิงค์ภาพกับเสียงพูด')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={() => { resetGeneration(); setPreview(null); setOmniResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <OmniHumanForm key={omniResetKey} onGenerate={payload => generateBotnoiEndpoint('omnihuman-submit', payload)} generationStatus={generation.status}/>
        </> : <>
        <div className="panel-heading"><div className="heading-with-icon">{providerHeadingIcon}<div><h2>{t('Video settings')}</h2><p>{t('กำหนดรายละเอียดวิดีโอของคุณ')}</p></div></div><button className="icon-button" title={t('Reset form')} aria-label={t('Reset form')} onClick={reset} disabled={reading}><Icon name="reset"/></button></div>
        <form onSubmit={submit} noValidate={activeEndpoint.method === 'POST'}>
          <label className="prompt-label" htmlFor="prompt">{t('Prompt')} <span className="required">*</span></label>
          <div className="prompt-input"><textarea id="prompt" required={activeEndpoint.method !== 'POST'} value={form.prompt} onChange={e => update('prompt', e.target.value)} placeholder={t('อธิบายฉาก การเคลื่อนไหว แสง และบรรยากาศของวิดีโอที่คุณต้องการ…')}/><PromptFooter value={form.prompt} model={activeEndpoint.name} onChange={prompt => update('prompt', prompt)} disabled={reading || (isSeedance25 && isGenerating)}/></div>
          <div className="settings-row"><Choice label={t('Duration')} value={form.duration} options={[[ '5', t('5 seconds') ], [ '10', t('10 seconds') ]]} onChange={v => update('duration', v)}/><Choice label={t('Resolution')} value={form.resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={v => update('resolution', v)}/></div>
          <Choice label={t('Aspect ratio')} value={form.aspect_ratio} options={[[ '', t('Default') ], [ '16:9', <><span className="ratio landscape"/>16:9</> ], [ '9:16', <><span className="ratio portrait"/>9:16</> ]]} onChange={v => update('aspect_ratio', v)}/>
          <div className="audio-row"><div><label htmlFor="audio">{t('Generate audio')}</label><p>{t('สร้างเสียงประกอบไปพร้อมกับวิดีโอ')}</p></div><input id="audio" className="switch" type="checkbox" checked={form.generate_audio} onChange={e => update('generate_audio', e.target.checked)}/></div>
          <div className="references"><div className="section-label">{t('Reference media')} <span>{t('Optional')}</span></div><p className="helper">{t('เพิ่มภาพหรือวิดีโอเพื่อใช้เป็นแนวทางในการสร้าง')}</p><div className="upload-grid">{(['images', 'videos'] as const).map(kind => <div key={kind}><label className={`upload-zone ${reading ? 'disabled' : ''}`}><Icon name="upload"/><strong>{t(kind === 'images' ? 'Add images' : 'Add videos')}</strong><span>{t(kind === 'images' ? 'ภาพอ้างอิง' : 'วิดีโออ้างอิง')}</span><input type="file" accept={kind === 'images' ? 'image/*' : 'video/*'} multiple disabled={reading} onChange={e => { upload(kind, e.target.files); e.target.value = '' }}/></label>{media[kind].map((item, index) => <div className="file-row" key={`${index}-${item.name}`}><span title={item.name}>{item.name}</span><button type="button" aria-label={t(`Remove ${item.name}`)} onClick={() => setMedia(current => ({ ...current, [kind]: current[kind].filter((_, i) => i !== index) }))}><Icon name="close" width="14" height="14"/></button></div>)}</div>)}</div></div>
          {error && activeEndpoint.method !== 'POST' && <p className="error" role="alert">{t(error)}</p>}
          <div className="form-action"><button className="primary-button" type="submit" disabled={reading || (isSeedance25 && isGenerating)}>{reading ? t('Reading files…') : isSeedance25 ? generation.status === 'submitting' ? t('Submitting…') : generation.status === 'processing' ? t('Generating video…') : t('Generate video') : t('Preview Request')}</button></div>
        </form>
        </>}
      </section>
      <section className="preview-panel result-panel" aria-label={t('Generation result')}>
        <div className="preview-heading"><div className="preview-title"><Icon name={mediaKind === 'image' ? 'image' : 'video'}/><h2>{t('Generation result')}</h2></div><span className="json-badge">{resultType}</span></div>
        <div className="preview-body result-body" aria-live="polite">
          <div className="result-stage">
            {isMediaGeneration && generation.status === 'completed' && outputUrl
              ? mediaKind === 'image'
                ? <img className="generated-image" src={outputUrl} alt={`${t('Generated image from')} ${t(activeEndpoint.name)}`}/>
                : <video className="generated-video" controls playsInline src={outputUrl} aria-label={`${t('Generated video from')} ${t(activeEndpoint.name)}`}/>
              : <div className="result-placeholder"><Icon name={mediaKind === 'image' ? 'image' : 'video'} width="34" height="34"/><span>{resultType} {t('RESULT')}</span></div>}
            {isMediaGeneration && generation.status === 'completed' && outputUrl && <div className="result-actions"><a className="download-video-button" href={outputUrl} download={mediaKind === 'image' ? 'botnoi-generated-image.png' : 'botnoi-generated-video.mp4'} target="_blank" rel="noopener noreferrer">{t(mediaKind === 'image' ? 'Download image' : 'Download video')}</a><button className="download-video-button" type="button" onClick={() => void copyResultUrl()}>{t('Copy result URL')}</button></div>}
            <div className="result-message">
              {isMediaGeneration ? <>
                <h3>{t(generation.status === 'completed' ? isImageUpload ? 'อัปโหลดภาพสำเร็จ' : mediaKind === 'image' ? 'สร้างภาพสำเร็จ' : 'สร้างวิดีโอสำเร็จ' : generation.status === 'submitting' ? isImageUpload ? 'กำลังอัปโหลดภาพ' : 'กำลังส่งคำขอ' : generation.status === 'processing' ? mediaKind === 'image' ? 'กำลังสร้างภาพ' : 'กำลังสร้างวิดีโอ' : generation.status === 'failed' ? isImageUpload ? 'อัปโหลดภาพไม่สำเร็จ' : 'สร้างไม่สำเร็จ' : 'ผลลัพธ์จากการสร้างวิดีโอและภาพจะแสดงที่นี่')}{isGenerating && <span className="generation-spinner" aria-hidden="true" />}</h3>
                <p>{t(generation.status === 'completed' ? isImageUpload ? 'ภาพถูกอัปโหลดและพร้อมใช้งานแล้ว' : mediaKind === 'image' ? 'ภาพพร้อมแสดงแล้ว' : 'วิดีโอพร้อมแสดงแล้ว' : generation.status === 'submitting' ? isImageUpload ? 'กำลังส่งภาพไปยัง Botnoi' : 'กำลังส่งข้อมูลไปยัง Botnoi GenAI' : generation.status === 'processing' ? 'ระบบกำลังประมวลผล' : generation.status === 'failed' ? generation.error ?? 'Generation failed' : `กรอกรายละเอียดทางซ้าย แล้วกด ${mediaKind === 'image' ? 'Generate image' : 'Generate video'}`)}{generation.status === 'processing' && generation.taskId ? ` · Task ID: ${generation.taskId}` : ''}</p>
              </> : <>
                <h3>{t(preview ? 'เตรียมคำขอแล้ว' : 'ผลลัพธ์จากการสร้างวิดีโอและภาพจะแสดงที่นี่')}</h3>
                <p>{t(preview ? 'ฟอร์มสร้างข้อมูลคำขอเรียบร้อยแล้ว เมื่อเชื่อมต่อ API ระบบจะแสดงรูป เสียง หรือวิดีโอที่ได้จากการสร้างในพื้นที่นี้' : 'กรอกรายละเอียดทางซ้าย แล้วสร้างคำขอเพื่อเตรียมแสดงผลลัพธ์หลังเชื่อมต่อ API')}</p>
              </>}
            </div>
          </div>
        </div>
        <div className="preview-bottom"><span className={`status-dot ${generation.status === 'completed' ? 'ready' : ''}`}/><span>{t(isMediaGeneration ? generation.status === 'idle' ? 'Waiting for generation' : generation.status === 'submitting' ? isImageUpload ? 'Uploading image to Botnoi' : 'Submitting to Botnoi GenAI' : generation.status === 'processing' ? 'Generation in progress' : generation.status === 'completed' ? isImageUpload ? 'Image uploaded' : mediaKind === 'image' ? 'Image ready' : 'Video ready' : 'Generation failed' : preview ? 'Request ready · API not connected' : 'Waiting for generation')}</span>{isGenerating && <span className="generation-spinner" aria-hidden="true" />}<span className="format-label">{resultType.toLowerCase()}</span></div>
      </section>
    </main>
  </TryItPage> : <IndexPage endpointGroups={endpointGroups} expandedGroups={expandedGroups} setExpandedGroups={setExpandedGroups} activeEndpoint={activeEndpoint} selectEndpoint={selectEndpoint} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} setTheme={setTheme} isHome={isHome || Boolean(category)} isApiKeyPage={isApiKeyPage} onOpenApiKeyPage={openApiKeyPage}>
    {isHome ? <HomePage endpointGroups={endpointGroups} onSelectEndpoint={selectEndpoint} onOpenCategory={openCategory}/> : category ? <CategoryPage category={category} endpointGroups={endpointGroups} onSelectEndpoint={selectEndpoint}/> : isApiKeyPage ? <ApiKeyPage /> : (<>
    <main className={`catalog-content ${activeEndpoint.botnoiId || ['Create Seedance 2.5 video', 'Get Seedance 2.5 result'].includes(activeEndpoint.name) || endpointDocs[activeEndpoint.name] || wavespeedModels[activeEndpoint.name] ? 'has-endpoint-docs' : ''}`}>
      {activeEndpoint.botnoiId ? <BotnoiEndpointPage endpoint={botnoiEndpoints[activeEndpoint.botnoiId]} displayTitle={activeEndpoint.name} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={supportsTryIt(activeEndpoint) ? openTryIt : null}/> : activeEndpoint.name === 'Create Seedance 2.5 video' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>{t('Create Seedance 2.5 video')}</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{t(markdownCopied ? 'Copied!' : 'Copy as Markdown')}</button></div>
        <p className="endpoint-docs-description">{t('โมเดลสร้างวิดีโอคุณภาพสูง (Flagship) รองรับ Text-to-Video, Image-to-Video (First & Last frame) และ Reference Media')}</p>
        <section className="endpoint-docs-section endpoint-route-section"><h2>{t('Endpoint')}</h2><EndpointRoute method="POST" url={`${BOTNOI_API_BASE_URL}/api/genai/wavespeed/bytedance/seedance-2.5/text-to-video`}/></section>
        <TryItCallout onTry={openTryIt}/>
        <section className="endpoint-docs-section"><h2>{t('Auth')}</h2><p>{t('Authentication required.')}</p></section>
        <section className="endpoint-docs-section"><h2>{t('Parameters')}</h2><p>{t('No parameters.')}</p></section>
        <section className="endpoint-docs-section"><h2>{t('Request Body')}</h2>
          <div className="endpoint-table-wrap"><table><thead><tr><th>{t('Required')}</th><th>{t('Content-Type')}</th><th>{t('Shape')}</th></tr></thead><tbody><tr><td>{t('Yes')}</td><td><code>application/json</code></td><td><code>Seedance25Request</code></td></tr></tbody></table></div>
          <div className="endpoint-table-wrap"><table><thead><tr><th>{t('Name')}</th><th>{t('Type')}</th><th>{t('Required')}</th><th>{t('Description')}</th></tr></thead><tbody>
            <tr><td><code>prompt</code></td><td>string</td><td>{t('Yes')}</td><td>{t('ข้อความอธิบายวิดีโอที่ต้องการ')}</td></tr>
            <tr><td><code>duration</code></td><td>number</td><td>{t('Yes')}</td><td>{t('ความยาว เช่น 5 หรือ 10 วินาที')}</td></tr>
            <tr><td><code>resolution</code></td><td>string</td><td>{t('Yes')}</td><td>{t('"720p" หรือ "1080p"')}</td></tr>
            <tr><td><code>aspect_ratio</code></td><td>string</td><td>{t('No')}</td><td>{t('"16:9" หรือ "9:16"')}</td></tr>
            <tr><td><code>generate_audio</code></td><td>boolean</td><td>{t('No')}</td><td>{t('true หรือ false')}</td></tr>
            <tr><td><code>reference_images</code></td><td>string[]</td><td>{t('No')}</td><td>{t('Array ของรูปภาพแบบ Base64 Data URL')}</td></tr>
            <tr><td><code>reference_videos</code></td><td>string[]</td><td>{t('No')}</td><td>{t('Array ของวิดีโออ้างอิงแบบ Base64 Data URL')}</td></tr>
          </tbody></table></div>
        </section>
        <section className="endpoint-docs-section"><h2>{t('Responses')}</h2><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Status')}</th><th>{t('Description')}</th><th>{t('Content-Type')}</th><th>{t('Shape')}</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>{t('Task submitted')}</td><td><code>application/json</code></td><td><code>TaskResponse</code></td></tr>
          <tr><td><strong className="response-status unauthorized">401</strong></td><td>{t('Unauthorized')}</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">403</strong></td><td>{t('Insufficient credits')}</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>{t('Example Response (200)')}</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "task_seedance25_abc123",
    "status": "pending"
  }
}`}</pre></section>
      </article> : activeEndpoint.name === 'Get Seedance 2.5 result' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>{t('Get Seedance 2.5 result')}</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{t(markdownCopied ? 'Copied!' : 'Copy as Markdown')}</button></div>
        <p className="endpoint-docs-description">{t('ตรวจสอบสถานะและดึง url_video ของ Seedance 2.5 task — ใช้ path เดียวกับ InfiniteTalk และ Motion Control')}</p>
        <section className="endpoint-docs-section"><h2>{t('Auth')}</h2><p>{t('Authentication required.')}</p></section>
        <section className="endpoint-docs-section"><h2>{t('Parameters')}</h2><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Name')}</th><th>{t('In')}</th><th>{t('Required')}</th><th>{t('Type')}</th><th>{t('Description')}</th></tr></thead><tbody>
          <tr><td><code>id</code></td><td>{t('path')}</td><td>{t('Yes')}</td><td>string</td><td>{t('Task ID ที่ได้จาก POST (field: data.id)')}</td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>{t('Request Body')}</h2><p>{t('No request body.')}</p></section>
        <section className="endpoint-docs-section"><h2>{t('Responses')}</h2><div className="endpoint-table-wrap"><table><thead><tr><th>{t('Status')}</th><th>{t('Description')}</th><th>{t('Content-Type')}</th><th>{t('Shape')}</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>{t('Successful Response')}</td><td><code>application/json</code></td><td><code>WavespeedResultResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">404</strong></td><td>{t('Task not found')}</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>{t('Example Response (200)')}</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "&lt;task_id&gt;",
    "status": "completed",
    "url_video": "https://storage.botnoi.ai/.../output.mp4",
    "error": ""
  }
}`}</pre><p className="endpoint-status-note">{t('Status')}: <code>pending</code> | <code>processing</code> | <code>completed</code> | <code>failed</code></p></section>
      </article> : endpointDocs[activeEndpoint.name] ? <EndpointDocsPage doc={{ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] }} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : wavespeedModels[activeEndpoint.name]?.available === false ? <article className="endpoint-docs"><h1>{t(wavespeedModels[activeEndpoint.name].title)}</h1><p className="endpoint-unavailable-note">{t(wavespeedModels[activeEndpoint.name].description ?? '')}</p><p className="endpoint-docs-description">{t('สามารถตรวจสอบรายการโมเดลปัจจุบันได้ที่')} <a href="https://wavespeed.ai/models" target="_blank" rel="noopener noreferrer">WaveSpeedAI Models ↗</a></p></article> : wavespeedModels[activeEndpoint.name] ? <EndpointDocsPage doc={wavespeedModels[activeEndpoint.name]} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : activeEndpoint.method === 'POST' && <button className="endpoint-launch-button" onClick={openTryIt}><span>Try it on <strong>Botnoi</strong></span><Icon name="arrow" width="17" height="17"/></button>}
      <ApiDocsFooter />
    </main>
    </>)}
  </IndexPage>}
  </div>
}
function App() {
  return <LanguageProvider><BotnoiAuthProvider><NotificationProvider><AppContent /></NotificationProvider></BotnoiAuthProvider></LanguageProvider>
}

export default App
