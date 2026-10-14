import { useEffect, useState } from 'react'
import './App.css'
import Icon from './components/Icon'
import IndexPage from './pages/IndexPage'
import TryItPage from './pages/TryItPage'
import { Choice, InfiniteTalkForm, MotionControlForm, OmniHumanForm, SeeDreamForm, Seedance20Form, WaveSpeedModelForm } from './features/try-it/TryItForms'
import GPTImagePage from './pages/gptimagepage'
import BotnoiEndpointPage from './pages/BotnoiEndpointPage'
import BotnoiRequestForm from './features/try-it/BotnoiRequestForm'
import { endpointDocs, endpointGroups as catalogGroups, endpointMarkdown, initialForm, seedance25Markdown, seedance25ResultMarkdown, wavespeedModels } from './data/endpointCatalog'
import { endpoints as botnoiEndpoints } from './data/botnoiEndpoints'
import { botnoiEndpointGroups } from './data/botnoiEndpointGroups'
import { adaptBotnoiEndpoint } from './data/adaptBotnoiEndpoint'

const endpointGroups = [...botnoiEndpointGroups, ...catalogGroups.filter(group => group.name === 'Feature Model')]
const integratedEndpoints = endpointGroups.flatMap(group => group.items)
const botnoiSchemaFormIds = new Set(['gptimg-text2img', 'gptimg-upload', 'gptimg-edit'])
const botnoiCustomFormIds = new Set(['seedance25-submit', 'seedance20-submit', 'motion-control-submit', 'infinitetalk-submit', 'omnihuman-submit', 'seedream-submit'])
const supportsTryIt = item => item?.kind === 'model' || (item?.kind === 'botnoi' && (botnoiSchemaFormIds.has(item.botnoiId) || botnoiCustomFormIds.has(item.botnoiId))) || ['Create GPT Image', 'Create Seedance 2.5 video', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video', 'Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image'].includes(item?.name)

function TryItCallout({ onTry }) {
  return <aside className="endpoint-try-group">
    <div><h2>ทดลองใช้ endpoint นี้</h2><p>กรอกข้อมูลและดูตัวอย่าง Request ได้ โดยยังไม่ส่งข้อมูลไปยัง API จริง</p></div>
    <button className="endpoint-launch-button" onClick={onTry}>Try it <Icon name="arrow" width="17" height="17"/></button>
  </aside>
}
function EndpointDocsPage({ doc, markdownCopied, onCopyMarkdown, onTry }) {
  return <article className="endpoint-docs">
    <div className="endpoint-docs-title-row"><h1>{doc.title}</h1><button className="markdown-copy-button" onClick={onCopyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
    {doc.description && <p className="endpoint-docs-description">{doc.description}</p>}
    {doc.scopeNote && !doc.hideAttribution && <p className="endpoint-scope-note">{doc.scopeNote} · Base URL: <code>https://api.wavespeed.ai</code></p>}
    {doc.sourceUrl && !doc.hideAttribution && <p className="endpoint-source">อ้างอิง <a href={doc.sourceUrl} target="_blank" rel="noopener noreferrer">เอกสาร WaveSpeedAI ↗</a></p>}
    {doc.method === 'POST' && onTry && <TryItCallout onTry={onTry}/>}
    <section className="endpoint-docs-section"><h2>Auth</h2><p>{doc.sourceUrl ? <>WaveSpeedAI API key: <code>Authorization: Bearer &lt;WAVESPEED_API_KEY&gt;</code></> : 'Authentication required.'}</p></section>
    <section className="endpoint-docs-section"><h2>Parameters</h2>{doc.parameters ? <div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>In</th><th>Required</th><th>Type</th><th>Description</th></tr></thead><tbody>{doc.parameters.map(([name, location, required, type, description]) => <tr key={name}><td><code>{name}</code></td><td>{location}</td><td>{required}</td><td>{type}</td><td>{description}</td></tr>)}</tbody></table></div> : <p>No parameters.</p>}</section>
    <section className="endpoint-docs-section"><h2>Request Body</h2>{doc.body ? <><div className="endpoint-table-wrap"><table><thead><tr><th>Required</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody><tr><td>Yes</td><td><code>{doc.body.contentType}</code></td><td><code>{doc.body.shape}</code></td></tr></tbody></table></div><div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>{doc.body.fields.map(([name, type, required, description]) => <tr key={name}><td><code>{name}</code></td><td>{type}</td><td>{required}</td><td>{description}</td></tr>)}</tbody></table></div></> : <p>No request body.</p>}</section>
    <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>{doc.responses.map(([status, description, shape]) => <tr key={status}><td><strong className={`response-status ${status === '200' ? 'success' : status === '401' ? 'unauthorized' : 'forbidden'}`}>{status}</strong></td><td>{description}</td><td><code>application/json</code></td><td><code>{shape}</code></td></tr>)}</tbody></table></div></section>
    <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{JSON.stringify(doc.example, null, 2)}</pre>{doc.statusNote && <p className="endpoint-status-note">Status: {doc.statusNote.split(' | ').map((status, index) => <span key={status}>{index > 0 && ' | '}<code>{status}</code></span>)}</p>}</section>
    {doc.resultPath && <section className="endpoint-docs-section"><h2>Get result</h2><p>ใช้ <code>data.id</code> จากผลการส่งงาน เพื่อตรวจสถานะด้วย <code>GET {doc.resultPath}</code> เมื่อสถานะเป็น <code>completed</code> ผลลัพธ์อยู่ใน <code>data.outputs</code></p></section>}
  </article>
}
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const endpointFromHash = () => {
  const routeSlug = window.location.hash.match(/^#\/(?:try-it-now|endpoint|model)\/(.+)$/)?.[1]
  const legacyModels = { 'kling-ai': 'kling-3-0-std', 'wan-alibaba': 'wan-3-0-alibaba', 'gpt-image': 'gpt-image-2-5' }
  const resolvedSlug = legacyModels[routeSlug] ?? (routeSlug === 'kling-1-5' ? 'kling-3-0-std' : routeSlug)
  return integratedEndpoints.find(item => item.id === routeSlug || slug(item.name) === resolvedSlug) ?? integratedEndpoints.find(item => item.method === 'POST')
}
function App() {
  const [activeEndpoint, setActiveEndpoint] = useState(endpointFromHash)
  const [isTryPage, setIsTryPage] = useState(() => window.location.hash.startsWith('#/try-it-now/') && supportsTryIt(endpointFromHash()))
  const [expandedGroups, setExpandedGroups] = useState(() => Object.fromEntries(endpointGroups.map(group => [group.name, true])))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('try-it-theme') === 'light' ? 'light' : 'dark')
  const [markdownCopied, setMarkdownCopied] = useState(false)
  useEffect(() => {
    const syncEndpoint = () => {
      const item = endpointFromHash()
      setActiveEndpoint(item)
      setIsTryPage(window.location.hash.startsWith('#/try-it-now/') && supportsTryIt(item))
    }
    window.addEventListener('popstate', syncEndpoint)
    window.addEventListener('hashchange', syncEndpoint)
    return () => { window.removeEventListener('popstate', syncEndpoint); window.removeEventListener('hashchange', syncEndpoint) }
  }, [])
  useEffect(() => { localStorage.setItem('try-it-theme', theme) }, [theme])
  const selectEndpoint = item => {
    setActiveEndpoint(item)
    setPreview(null)
    setMarkdownCopied(false)
    window.history.pushState({}, '', `#/${item.kind === 'model' ? 'model' : 'endpoint'}/${item.kind === 'botnoi' ? item.id : slug(item.name)}`)
    setIsTryPage(false)
    setSidebarOpen(false)
  }
  const openTryIt = () => {
    if (!supportsTryIt(activeEndpoint)) return
    setPreview(null)
    window.history.pushState({}, '', `#/try-it-now/${activeEndpoint.kind === 'botnoi' ? activeEndpoint.id : slug(activeEndpoint.name)}`)
    setIsTryPage(true)
  }
  const copyMarkdown = async () => {
    try {
      const botnoiEndpoint = activeEndpoint.botnoiId ? botnoiEndpoints[activeEndpoint.botnoiId] : null
      const botnoiView = botnoiEndpoint ? adaptBotnoiEndpoint(botnoiEndpoint) : null
      const rawExample = botnoiView?.examples.find(example => example.status === 200)?.value
      let example = {}
      if (rawExample) {
        try { example = JSON.parse(rawExample) } catch { example = rawExample }
      }
      const markdown = botnoiEndpoint
        ? endpointMarkdown({ title: botnoiEndpoint.title, method: botnoiEndpoint.method, path: botnoiEndpoint.path, description: botnoiEndpoint.description, parameters: botnoiView.parameters, body: botnoiView.body, responses: botnoiView.responses, example })
        : endpointDocs[activeEndpoint.name]
        ? endpointMarkdown({ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] })
        : wavespeedModels[activeEndpoint.name]
          ? endpointMarkdown(wavespeedModels[activeEndpoint.name])
        : activeEndpoint.name === 'Get Seedance 2.5 result' ? seedance25ResultMarkdown : seedance25Markdown
      await navigator.clipboard.writeText(markdown)
      setMarkdownCopied(true)
      window.setTimeout(() => setMarkdownCopied(false), 1800)
    } catch {
      setError('คัดลอก Markdown ไม่สำเร็จ กรุณาลองอีกครั้ง')
    }
  }
  const [form, setForm] = useState(initialForm)
  const [media, setMedia] = useState({ images: [], videos: [] })
  const [preview, setPreview] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [reading, setReading] = useState(false)
  const [avatarResetKey, setAvatarResetKey] = useState(0)
  const [seedreamResetKey, setSeedreamResetKey] = useState(0)
  const [seedance20ResetKey, setSeedance20ResetKey] = useState(0)
  const [motionResetKey, setMotionResetKey] = useState(0)
  const [omniResetKey, setOmniResetKey] = useState(0)
  const [modelResetKey, setModelResetKey] = useState(0)
  const [gptImageResetKey, setGptImageResetKey] = useState(0)
    useEffect(() => {
      if (!copied) return undefined

      const timer = setTimeout(() => setCopied(false), 2000)
      return () => clearTimeout(timer)
    }, [copied])
  const update = (key, value) => setForm(current => ({ ...current, [key]: value }))
  const upload = async (kind, files) => {
    setError('')
    const selected = Array.from(files)
    if (selected.some(file => !file.type.startsWith(kind === 'images' ? 'image/' : 'video/'))) {
      setError('กรุณาเลือกไฟล์ให้ตรงกับประเภทภาพหรือวิดีโอ'); return
    }
    setReading(true)
    try {
      const items = await Promise.all(selected.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve({ name: file.name, data: reader.result })
        reader.onerror = () => reject(new Error('อ่านไฟล์ไม่สำเร็จ กรุณาลองอีกครั้ง'))
        reader.readAsDataURL(file)
      })))
      setMedia(current => ({ ...current, [kind]: [...current[kind], ...items] }))
    } catch (err) { setError(err.message) }
    finally { setReading(false) }
  }
  const submit = event => {
    event.preventDefault()
    if (!form.prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError(''); setCopied(false)
    setPreview({ prompt: form.prompt.trim(), duration: Number(form.duration), resolution: form.resolution,
      ...(form.aspect_ratio && { aspect_ratio: form.aspect_ratio }), generate_audio: form.generate_audio,
      ...(media.images.length && { reference_images: media.images.map(item => item.data) }),
      ...(media.videos.length && { reference_videos: media.videos.map(item => item.data) }),
    })
  }
  const reset = () => { setForm(initialForm); setMedia({ images: [], videos: [] }); setPreview(null); setError(''); setCopied(false) }
  const copy = async () => {
    try {
    const dataToCopy =
      activeEndpoint.name === 'Create GPT Image'
        ? preview?.body
        : preview
    await navigator.clipboard.writeText(
      JSON.stringify(dataToCopy, null, 2)
    )
    setCopied(true)
    } catch {
      setError('คัดลอกไม่ได้ กรุณาเลือกข้อความจาก Preview แล้วคัดลอก')
    }
  }
  const goBack = () => { window.history.pushState({}, '', `#/${activeEndpoint.kind === 'model' ? 'model' : 'endpoint'}/${activeEndpoint.kind === 'botnoi' ? activeEndpoint.id : slug(activeEndpoint.name)}`); setIsTryPage(false) }
  const toggleTheme = () => setTheme(current => current === 'dark' ? 'light' : 'dark')
  const isMultipartPreview = activeEndpoint.botnoiId
    ? botnoiEndpoints[activeEndpoint.botnoiId]?.requestBody?.contentType === 'multipart/form-data'
    : ['Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video'].includes(activeEndpoint.name)
  return <div className={`app-shell ${theme === 'light' ? 'light-mode' : ''}`}>
    {isTryPage ? <TryItPage activeEndpoint={activeEndpoint} theme={theme} onToggleTheme={toggleTheme} onBack={goBack}>
    <main className="workspace">
      <section className="input-panel" aria-label={activeEndpoint.botnoiId && botnoiSchemaFormIds.has(activeEndpoint.botnoiId) ? 'Request settings' : activeEndpoint.name === 'Create InfiniteTalk avatar' || activeEndpoint.name === 'Create OmniHuman avatar' ? 'Avatar settings' : activeEndpoint.name === 'Create SeeDream 4.5 image' || ['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : activeEndpoint.name === 'Create Motion Control video' ? 'Motion Control settings' : 'Video settings'}>
        {activeEndpoint.botnoiId && botnoiSchemaFormIds.has(activeEndpoint.botnoiId) ? <BotnoiRequestForm key={activeEndpoint.botnoiId} endpoint={botnoiEndpoints[activeEndpoint.botnoiId]} onPreview={data => { setPreview(data); setCopied(false) }}/> : activeEndpoint.name === 'Create GPT Image' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon">✦</span><div><h2>GPT Image settings</h2><p>สร้างและแก้ไขรูปภาพด้วย GPT Image</p></div></div><button type="button" className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setCopied(false); setGptImageResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <GPTImagePage resetSignal={gptImageResetKey} onPreview={data => { setPreview(data); setCopied(false) }} onResetPreview={() => { setPreview(null); setCopied(false) }}/>
        </> : activeEndpoint.kind === 'model' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>{['GPT Image 2.5', 'DALL-E 3'].includes(activeEndpoint.name) ? 'Image settings' : 'Video settings'}</h2><p>{wavespeedModels[activeEndpoint.name].title}</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setModelResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <WaveSpeedModelForm key={`${activeEndpoint.name}-${modelResetKey}`} doc={wavespeedModels[activeEndpoint.name]} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create InfiniteTalk avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Avatar settings</h2><p>อัปโหลดภาพใบหน้าและเสียงพูด</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setAvatarResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <InfiniteTalkForm key={avatarResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create SeeDream 4.5 image' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Image settings</h2><p>กำหนดรายละเอียดภาพที่ต้องการสร้าง</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setSeedreamResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <SeeDreamForm key={seedreamResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create SeeDance 2.0 / Mini video' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Video settings</h2><p>ตั้งค่า Text-to-Video หรือ Image-to-Video</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setSeedance20ResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <Seedance20Form key={seedance20ResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create Motion Control video' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Motion Control settings</h2><p>จับคู่ภาพตัวละครกับคลิปท่าทาง</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setMotionResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <MotionControlForm key={motionResetKey} onPreview={setPreview}/>
        </> : activeEndpoint.name === 'Create OmniHuman avatar' ? <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>OmniHuman settings</h2><p>สร้าง Avatar ที่ซิงค์ภาพกับเสียงพูด</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={() => { setPreview(null); setOmniResetKey(key => key + 1) }}><Icon name="reset"/></button></div>
        <OmniHumanForm key={omniResetKey} onPreview={setPreview}/>
        </> : <>
        <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon"><Icon name="video"/></span><div><h2>Video settings</h2><p>กำหนดรายละเอียดวิดีโอของคุณ</p></div></div><button className="icon-button" title="Reset form" aria-label="Reset form" onClick={reset} disabled={reading}><Icon name="reset"/></button></div>
        <form onSubmit={submit}>
          <label className="prompt-label" htmlFor="prompt">Prompt <span className="required">*</span></label>
          <div className="prompt-input"><textarea id="prompt" required value={form.prompt} onChange={e => update('prompt', e.target.value)} placeholder="อธิบายฉาก การเคลื่อนไหว แสง และบรรยากาศของวิดีโอที่คุณต้องการ…"/><div className="prompt-footer"><span>รายละเอียดที่ชัดเจนช่วยให้ได้ผลลัพธ์ที่ตรงใจ</span><span>{form.prompt.length} characters</span></div></div>
          <div className="settings-row"><Choice label="Duration" value={form.duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={v => update('duration', v)}/><Choice label="Resolution" value={form.resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={v => update('resolution', v)}/></div>
          <Choice label="Aspect ratio" value={form.aspect_ratio} options={[[ '', 'Default' ], [ '16:9', <><span className="ratio landscape"/>16:9</> ], [ '9:16', <><span className="ratio portrait"/>9:16</> ]]} onChange={v => update('aspect_ratio', v)}/>
          <div className="audio-row"><div><label htmlFor="audio">Generate audio</label><p>สร้างเสียงประกอบไปพร้อมกับวิดีโอ</p></div><input id="audio" className="switch" type="checkbox" checked={form.generate_audio} onChange={e => update('generate_audio', e.target.checked)}/></div>
          <div className="references"><div className="section-label">Reference media <span>Optional</span></div><p className="helper">เพิ่มภาพหรือวิดีโอเพื่อใช้เป็นแนวทางในการสร้าง</p><div className="upload-grid">{['images', 'videos'].map(kind => <div key={kind}><label className={`upload-zone ${reading ? 'disabled' : ''}`}><Icon name="upload"/><strong>{kind === 'images' ? 'Add images' : 'Add videos'}</strong><span>{kind === 'images' ? 'ภาพอ้างอิง' : 'วิดีโออ้างอิง'}</span><input type="file" accept={kind === 'images' ? 'image/*' : 'video/*'} multiple disabled={reading} onChange={e => { upload(kind, e.target.files); e.target.value = '' }}/></label>{media[kind].map((item, index) => <div className="file-row" key={`${index}-${item.name}`}><span title={item.name}>{item.name}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setMedia(current => ({ ...current, [kind]: current[kind].filter((_, i) => i !== index) }))}><Icon name="close" width="14" height="14"/></button></div>)}</div>)}</div></div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="form-action"><button className="primary-button" type="submit" disabled={reading}><Icon name="code"/>{reading ? 'Reading files…' : 'Preview Request'}<Icon name="arrow"/></button></div>
        </form>
        </>}
      </section>
      <section className="preview-panel" aria-label="Request preview">
        <div className="preview-heading"><div className="preview-title"><Icon name="code"/><h2>Request preview</h2></div><span className="json-badge">{isMultipartPreview ? 'MULTIPART' : 'JSON'}</span>{preview && <button className="copy-button" onClick={copy}><Icon name="copy" width="15" height="15"/>{copied ? 'Copied' : 'Copy'}</button>}</div>
        <div className="preview-body" aria-live="polite">{preview ? <div className="code-content"><div className="request-route"><span className="method">{activeEndpoint.method}</span><code>{activeEndpoint.name === 'Create GPT Image'? (preview?.endpoint ?? activeEndpoint.path): (activeEndpoint.path ?? 'Path not provided')}</code></div>{isMultipartPreview && <div className="content-type-note">Content-Type <code>multipart/form-data</code> · แสดงเฉพาะชื่อไฟล์และค่าในฟอร์ม</div>}<pre>{JSON.stringify(preview, null, 2)}</pre></div> : <div className="empty-state"><div className="preview-symbol"><Icon name="code" width="30" height="30"/></div><h3>เริ่มต้นจากไอเดียของคุณ</h3><p>กรอกรายละเอียดทางซ้าย แล้วกด Preview Request<br/>เพื่อดูข้อมูลคำขอที่นี่</p><div className="empty-flow"><span>Prompt</span><Icon name="arrow" width="16"/><span>Settings</span><Icon name="arrow" width="16"/><span>Request</span></div></div>}</div>
        <div className="preview-bottom"><span className={`status-dot ${preview ? 'ready' : ''}`}/><span>{preview ? 'Request preview ready' : 'Waiting for your input'}</span><span className="format-label">application/json</span></div>
      </section>
    </main>
  </TryItPage> : <IndexPage endpointGroups={endpointGroups} expandedGroups={expandedGroups} setExpandedGroups={setExpandedGroups} activeEndpoint={activeEndpoint} selectEndpoint={selectEndpoint} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} setTheme={setTheme}>
    <main className={`catalog-content ${activeEndpoint.botnoiId || ['Create Seedance 2.5 video', 'Get Seedance 2.5 result'].includes(activeEndpoint.name) || endpointDocs[activeEndpoint.name] || wavespeedModels[activeEndpoint.name] ? 'has-endpoint-docs' : ''}`}>
      {activeEndpoint.botnoiId ? <BotnoiEndpointPage endpoint={botnoiEndpoints[activeEndpoint.botnoiId]} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={supportsTryIt(activeEndpoint) ? openTryIt : null}/> : activeEndpoint.name === 'Create Seedance 2.5 video' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>Create Seedance 2.5 video</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
        <p className="endpoint-docs-description">โมเดลสร้างวิดีโอคุณภาพสูง (Flagship) รองรับ Text-to-Video, Image-to-Video (First &amp; Last frame) และ Reference Media</p>
        <TryItCallout onTry={openTryIt}/>
        <section className="endpoint-docs-section"><h2>Auth</h2><p>Authentication required.</p></section>
        <section className="endpoint-docs-section"><h2>Parameters</h2><p>No parameters.</p></section>
        <section className="endpoint-docs-section"><h2>Request Body</h2>
          <div className="endpoint-table-wrap"><table><thead><tr><th>Required</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody><tr><td>Yes</td><td><code>application/json</code></td><td><code>Seedance25Request</code></td></tr></tbody></table></div>
          <div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>
            <tr><td><code>prompt</code></td><td>string</td><td>Yes</td><td>ข้อความอธิบายวิดีโอที่ต้องการ</td></tr>
            <tr><td><code>duration</code></td><td>number</td><td>Yes</td><td>ความยาว เช่น 5 หรือ 10 วินาที</td></tr>
            <tr><td><code>resolution</code></td><td>string</td><td>Yes</td><td>"720p" หรือ "1080p"</td></tr>
            <tr><td><code>aspect_ratio</code></td><td>string</td><td>No</td><td>"16:9" หรือ "9:16"</td></tr>
            <tr><td><code>generate_audio</code></td><td>boolean</td><td>No</td><td>true หรือ false</td></tr>
            <tr><td><code>reference_images</code></td><td>string[]</td><td>No</td><td>Array ของรูปภาพแบบ Base64 Data URL</td></tr>
            <tr><td><code>reference_videos</code></td><td>string[]</td><td>No</td><td>Array ของวิดีโออ้างอิงแบบ Base64 Data URL</td></tr>
          </tbody></table></div>
        </section>
        <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>Task submitted</td><td><code>application/json</code></td><td><code>TaskResponse</code></td></tr>
          <tr><td><strong className="response-status unauthorized">401</strong></td><td>Unauthorized</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">403</strong></td><td>Insufficient credits</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "task_seedance25_abc123",
    "status": "pending"
  }
}`}</pre></section>
      </article> : activeEndpoint.name === 'Get Seedance 2.5 result' ? <article className="endpoint-docs">
        <div className="endpoint-docs-title-row"><h1>Get Seedance 2.5 result</h1><button className="markdown-copy-button" onClick={copyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
        <p className="endpoint-docs-description">ตรวจสอบสถานะและดึง url_video ของ Seedance 2.5 task — ใช้ path เดียวกับ InfiniteTalk และ Motion Control</p>
        <section className="endpoint-docs-section"><h2>Auth</h2><p>Authentication required.</p></section>
        <section className="endpoint-docs-section"><h2>Parameters</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Name</th><th>In</th><th>Required</th><th>Type</th><th>Description</th></tr></thead><tbody>
          <tr><td><code>id</code></td><td>path</td><td>Yes</td><td>string</td><td>Task ID ที่ได้จาก POST (field: data.id)</td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Request Body</h2><p>No request body.</p></section>
        <section className="endpoint-docs-section"><h2>Responses</h2><div className="endpoint-table-wrap"><table><thead><tr><th>Status</th><th>Description</th><th>Content-Type</th><th>Shape</th></tr></thead><tbody>
          <tr><td><strong className="response-status success">200</strong></td><td>Successful Response</td><td><code>application/json</code></td><td><code>WavespeedResultResponse</code></td></tr>
          <tr><td><strong className="response-status forbidden">404</strong></td><td>Task not found</td><td><code>application/json</code></td><td><code>ErrorResponse</code></td></tr>
        </tbody></table></div></section>
        <section className="endpoint-docs-section"><h2>Example Response (200)</h2><pre className="endpoint-example">{`{
  "data": {
    "id": "&lt;task_id&gt;",
    "status": "completed",
    "url_video": "https://storage.botnoi.ai/.../output.mp4",
    "error": ""
  }
}`}</pre><p className="endpoint-status-note">Status: <code>pending</code> | <code>processing</code> | <code>completed</code> | <code>failed</code></p></section>
      </article> : endpointDocs[activeEndpoint.name] ? <EndpointDocsPage doc={{ title: activeEndpoint.name, ...endpointDocs[activeEndpoint.name] }} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : wavespeedModels[activeEndpoint.name]?.available === false ? <article className="endpoint-docs"><h1>{wavespeedModels[activeEndpoint.name].title}</h1><p className="endpoint-unavailable-note">{wavespeedModels[activeEndpoint.name].description}</p><p className="endpoint-docs-description">สามารถตรวจสอบรายการโมเดลปัจจุบันได้ที่ <a href="https://wavespeed.ai/models" target="_blank" rel="noopener noreferrer">WaveSpeedAI Models ↗</a></p></article> : wavespeedModels[activeEndpoint.name] ? <EndpointDocsPage doc={wavespeedModels[activeEndpoint.name]} markdownCopied={markdownCopied} onCopyMarkdown={copyMarkdown} onTry={openTryIt}/> : activeEndpoint.method === 'POST' && <button className="endpoint-launch-button" onClick={openTryIt}>Try it <Icon name="arrow" width="17" height="17"/></button>}
    </main>
  </IndexPage>}
  </div>
}
export default App
