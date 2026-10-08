import { useEffect, useRef, useState } from 'react'
import './App.css'

const initialForm = { prompt: '', duration: '5', resolution: '720p', aspect_ratio: '', generate_audio: false }
const endpointGroups = [
  { name: 'Video AI Models', items: [
    { method: 'POST', name: 'Create Seedance 2.5 video', path: '/api/genai/wavespeed/bytedance/seedance-2.5/text-to-video' },
    { method: 'GET', name: 'Get Seedance 2.5 result' },
    { method: 'POST', name: 'Create SeeDance 2.0 / Mini video', path: '/api/genai/byteplus/video-generation' },
    { method: 'GET', name: 'Get SeeDance 2.0 result' },
    { method: 'POST', name: 'Create Motion Control video', path: '/api/genai/motion-control' },
    { method: 'GET', name: 'Get Motion Control result' },
  ] },
  { name: 'Avatar Lip-sync', items: [
    { method: 'POST', name: 'Create InfiniteTalk avatar', path: '/api/genai/infinitetalk' },
    { method: 'GET', name: 'Get InfiniteTalk result' },
    { method: 'POST', name: 'Create OmniHuman avatar', path: '/api/genai/byteplus/avatar-video' },
    { method: 'GET', name: 'Get OmniHuman result' },
  ] },
  { name: 'Image Generation', items: [
    { method: 'POST', name: 'Create SeeDream 4.5 image' },
    { method: 'GET', name: 'Get SeeDream 4.5 result' },
  ] },
]
const allEndpoints = endpointGroups.flatMap(group => group.items)
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const endpointFromHash = () => allEndpoints.find(item => slug(item.name) === window.location.hash.match(/^#\/try-it-now\/(.+)$/)?.[1]) ?? allEndpoints[0]
function Icon({ name, ...props }) {
  const paths = {
    back: 'm14 6-6 6 6 6M8 12h12',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    video: 'M4 5h16v14H4zM9 5v14M15 5v14M4 9h5m-5 6h5m6-6h5m-5 6h5',
    upload: 'M12 16V4m-4 4 4-4 4 4M4 15v5h16v-5',
    code: 'm8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16',
    copy: 'M8 8h12v12H8zM16 8V4H4v12h4',
    reset: 'M4 10a8 8 0 1 1 1 7M4 4v6h6',
    close: 'm6 6 12 12M6 18 18 6',
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.video}/></svg>
}
function Choice({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const current = options.find(([key]) => key === value)

  useEffect(() => {
    if (!open) return undefined
    const closeOutside = event => { if (!root.current?.contains(event.target)) setOpen(false) }
    const closeEscape = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [open])

  return <div className="choice-field" ref={root}>
    <span className="choice-label">{label}</span>
    <button type="button" className={`custom-select-trigger ${open ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <span>{current?.[1] ?? 'Select an option'}</span><span className="select-chevron" aria-hidden="true"/>
    </button>
    {open && <div className="custom-select-menu" role="listbox" aria-label={label}>{options.map(([key, text]) => <button key={key || 'default'} type="button" role="option" aria-selected={value === key} className={value === key ? 'is-selected' : ''} onClick={() => { onChange(key); setOpen(false) }}>{text}{value === key && <span className="option-check" aria-hidden="true">✓</span>}</button>)}</div>}
  </div>
}
function InfiniteTalkForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [audio, setAudio] = useState(null)
  const [resolution, setResolution] = useState('480p')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image || !audio) { setError('กรุณาเลือกไฟล์ภาพและไฟล์เสียงให้ครบ'); return }
    setError('')
    onPreview({ image_file: { file_name: image.name, content_type: image.type || 'image/*' }, audio_file: { file_name: audio.name, content_type: audio.type || 'audio/*' }, resolution, ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileField = (field, file, setFile, accept, title, hint) => <div className="avatar-file-field">
    <label className="prompt-label" htmlFor={field}>{title} <span className="required">*</span></label>
    <label className={`avatar-dropzone ${file ? 'has-file' : ''}`} htmlFor={field}>
      <span className="avatar-upload-icon"><Icon name="upload"/></span>
      <strong>{file ? file.name : 'เลือกไฟล์ หรือวางไฟล์ที่นี่'}</strong>
      <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : hint}</span>
      <input id={field} type="file" accept={accept} required onChange={event => setFile(event.target.files?.[0] ?? null)}/>
    </label>
  </div>
  return <form className="avatar-form" onSubmit={submit}>
    <div className="avatar-files">{fileField('image_file', image, setImage, 'image/jpeg,image/png,.jpg,.jpeg,.png', 'Avatar image', 'JPG or PNG')} {fileField('audio_file', audio, setAudio, 'audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav', 'Speech audio', 'MP3 or WAV')}</div>
    <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ]]} onChange={setResolution}/>
    <label className="prompt-label avatar-prompt-label" htmlFor="avatar-prompt">Prompt <span className="optional-tag">Optional</span></label>
    <div className="prompt-input"><textarea id="avatar-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="เพิ่มรายละเอียดลักษณะ Avatar หรือการเคลื่อนไหว…" rows="4"/><div className="prompt-footer"><span>กำหนดลักษณะเพิ่มเติม</span><span>{prompt.length} characters</span></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function SeeDreamForm({ onPreview }) {
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('seedream-4-5-251128')
  const [parameters, setParameters] = useState('null')
  const [image, setImage] = useState(null)
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError('')
    onPreview({ prompt: prompt.trim(), ...(model.trim() && { model: model.trim() }), parameters: parameters === 'null' ? null : parameters, ...(image && { image1: { file_name: image.name, content_type: image.type || 'image/*' } }) })
  }
  return <form className="avatar-form seedream-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedream-prompt">Prompt <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedream-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายภาพที่ต้องการสร้าง…" rows="4"/><div className="prompt-footer"><span>ระบุสิ่งที่ต้องการให้อยู่ในภาพ</span><span>{prompt.length} characters</span></div></div>
    </div>
    <label className="seedream-model-field"><span className="prompt-label">Model <span className="optional-tag">Optional</span></span><input value={model} onChange={event => setModel(event.target.value)} placeholder="seedream-4-5-251128"/></label>
    <Choice label="Parameters" value={parameters} options={[[ 'null', 'null' ]]} onChange={setParameters}/>
    <div className="seedream-image-field">
      <div className="prompt-label">Starting image <span className="optional-tag">Optional</span></div>
      <label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedream-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'เลือกภาพตั้งต้น'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ใช้สร้างภาพต่อจากรูปที่มี'}</span><input id="seedream-image" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label>
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function Seedance20Form({ onPreview }) {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text-to-video')
  const [model, setModel] = useState('')
  const [image, setImage] = useState(null)
  const [duration, setDuration] = useState('5')
  const [ratio, setRatio] = useState('16:9')
  const [resolution, setResolution] = useState('720p')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!prompt.trim()) { setError('กรุณากรอก Prompt ก่อนสร้างคำขอ'); return }
    setError('')
    onPreview({ prompt: prompt.trim(), mode, ...(model && { model }), ...(mode === 'image-to-video' && image && { image_file: { file_name: image.name, content_type: image.type || 'image/*' } }), duration, ratio, resolution })
  }
  return <form className="avatar-form seedance20-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedance20-prompt">Prompt <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedance20-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายวิดีโอและการเคลื่อนไหวที่ต้องการ…" rows="4"/><div className="prompt-footer"><span>ระบุฉากและการเคลื่อนไหวในวิดีโอ</span><span>{prompt.length} characters</span></div></div>
    </div>
    <Choice label="Mode" value={mode} options={[[ 'text-to-video', 'Text-to-Video' ], [ 'image-to-video', 'Image-to-Video' ]]} onChange={value => { setMode(value); setError('') }}/>
    <Choice label="Model" value={model} options={[[ '', 'Default model' ], [ 'dreamina-seedance-2-0-260128', 'Seedance 2.0' ], [ 'dreamina-seedance-2-0-mini-260615', 'Seedance 2.0 Mini' ]]} onChange={setModel}/>
    {mode === 'image-to-video' && <div className="seedream-image-field"><div className="prompt-label">Starting image <span className="optional-tag">Optional</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedance20-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'เลือกภาพตั้งต้น'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ภาพที่ใช้เป็นเฟรมเริ่มต้นของวิดีโอ'}</span><input id="seedance20-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>}
    <div className="settings-row"><Choice label="Duration" value={duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={setDuration}/><Choice label="Ratio" value={ratio} options={[[ '16:9', '16:9' ], [ '9:16', '9:16' ]]} onChange={setRatio}/></div>
    <Choice label="Resolution" value={resolution} options={[[ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={setResolution}/>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function MotionControlForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [video, setVideo] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoSource, setVideoSource] = useState('file')
  const [mode, setMode] = useState('standard')
  const [orientation, setOrientation] = useState('video')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image) { setError('กรุณาอัปโหลดภาพตัวละคร'); return }
    if (videoSource === 'file' && !video) { setError('กรุณาอัปโหลดคลิปท่าทาง'); return }
    if (videoSource === 'url' && !videoUrl.trim()) { setError('กรุณากรอก URL ของ Template video'); return }
    setError('')
    onPreview({ image: { file_name: image.name, content_type: image.type || 'image/*' }, video: videoSource === 'file' ? { file_name: video.name, content_type: video.type || 'video/*' } : videoUrl.trim(), mode, character_orientation: orientation })
  }
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      <div className="seedream-image-field"><div className="prompt-label">Character image <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="motion-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : 'อัปโหลดภาพตัวละคร'}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : 'ภาพต้นฉบับของตัวละคร'}</span><input id="motion-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">Template video <span className="required">*</span></span><div className="source-toggle"><button type="button" className={videoSource === 'file' ? 'selected' : ''} onClick={() => { setVideoSource('file'); setError('') }}>File</button><button type="button" className={videoSource === 'url' ? 'selected' : ''} onClick={() => { setVideoSource('url'); setError('') }}>URL</button></div></div>{videoSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${video ? 'has-file' : ''}`} htmlFor="motion-video"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{video ? video.name : 'อัปโหลดคลิปท่าทาง'}</strong><span>{video ? `${(video.size / (1024 * 1024)).toFixed(2)} MB` : 'วิดีโอต้นแบบการเคลื่อนไหว'}</span><input id="motion-video" type="file" accept="video/*" onChange={event => setVideo(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label="Template video URL" type="url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://example.com/template.mp4"/></div>}</div>
    </div>
    <div className="settings-row"><Choice label="Mode" value={mode} options={[[ 'standard', 'Standard' ], [ 'pro', 'Pro' ]]} onChange={setMode}/><Choice label="Character orientation" value={orientation} options={[[ 'image', 'Image' ], [ 'video', 'Video' ]]} onChange={setOrientation}/></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function OmniHumanForm({ onPreview }) {
  const [image, setImage] = useState(null)
  const [audio, setAudio] = useState(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioSource, setAudioSource] = useState('file')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = event => {
    event.preventDefault()
    if (!image) { setError('กรุณาอัปโหลดภาพ Avatar'); return }
    if (audioSource === 'file' && !audio) { setError('กรุณาอัปโหลดไฟล์เสียงพูด'); return }
    if (audioSource === 'url' && !audioUrl.trim()) { setError('กรุณากรอก URL ของไฟล์เสียง'); return }
    setError('')
    onPreview({ image_file: { file_name: image.name, content_type: image.type || 'image/*' }, audio_file: audioSource === 'file' ? { file_name: audio.name, content_type: audio.type || 'audio/*' } : audioUrl.trim(), ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileDrop = (id, file, setFile, accept, title, note) => <div className="seedream-image-field"><div className="prompt-label">{title} <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${file ? 'has-file' : ''}`} htmlFor={id}><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{file ? file.name : `อัปโหลด${title}`}</strong><span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : note}</span><input id={id} type="file" accept={accept} onChange={event => setFile(event.target.files?.[0] ?? null)}/></label></div>
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      {fileDrop('omnihuman-image', image, setImage, 'image/*', 'Avatar image', 'ภาพต้นฉบับของ Avatar')}
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">Speech audio <span className="required">*</span></span><div className="source-toggle"><button type="button" className={audioSource === 'file' ? 'selected' : ''} onClick={() => { setAudioSource('file'); setError('') }}>File</button><button type="button" className={audioSource === 'url' ? 'selected' : ''} onClick={() => { setAudioSource('url'); setError('') }}>URL</button></div></div>{audioSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${audio ? 'has-file' : ''}`} htmlFor="omnihuman-audio"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{audio ? audio.name : 'อัปโหลดไฟล์เสียง'}</strong><span>{audio ? `${(audio.size / (1024 * 1024)).toFixed(2)} MB` : 'MP3 หรือ WAV'}</span><input id="omnihuman-audio" type="file" accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav" onChange={event => setAudio(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label="Audio URL" type="url" value={audioUrl} onChange={event => setAudioUrl(event.target.value)} placeholder="https://example.com/speech.mp3"/></div>}</div>
    </div>
    <div><label className="prompt-label" htmlFor="omnihuman-prompt">Prompt <span className="optional-tag">Optional</span></label><div className="prompt-input"><textarea id="omnihuman-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="อธิบายสไตล์หรือสีหน้าที่ต้องการ…" rows="4"/></div></div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
function App() {
  const [activeEndpoint, setActiveEndpoint] = useState(endpointFromHash)
  const [isTryPage, setIsTryPage] = useState(() => window.location.hash.startsWith('#/try-it-now/'))
  const [expandedGroups, setExpandedGroups] = useState(() => Object.fromEntries(endpointGroups.map(group => [group.name, true])))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    const syncEndpoint = () => {
      setActiveEndpoint(endpointFromHash())
      setIsTryPage(window.location.hash.startsWith('#/try-it-now/'))
    }
    window.addEventListener('popstate', syncEndpoint)
    window.addEventListener('hashchange', syncEndpoint)
    return () => { window.removeEventListener('popstate', syncEndpoint); window.removeEventListener('hashchange', syncEndpoint) }
  }, [])
  const selectEndpoint = item => {
    setActiveEndpoint(item)
    setPreview(null)
    window.history.pushState({}, '', `#/try-it-now/${slug(item.name)}`)
    setIsTryPage(true)
    setSidebarOpen(false)
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
    try { await navigator.clipboard.writeText(JSON.stringify(preview, null, 2)); setCopied(true) }
    catch { setError('คัดลอกไม่ได้ กรุณาเลือกข้อความจาก Preview แล้วคัดลอก') }
  }
  return <div className="app-shell">
    {!isTryPage && sidebarOpen && <button className="sidebar-scrim" aria-label="Close endpoint menu" onClick={() => setSidebarOpen(false)}/>}
    {!isTryPage && <aside className={`endpoint-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <a className="sidebar-brand" href="#/"><span>API Integration v1.0</span><strong>Botnoi AI Gateway</strong></a>
      <nav aria-label="API endpoints">{endpointGroups.map(group => <section className="sidebar-group" key={group.name}>
        <button className="sidebar-group-title" aria-expanded={expandedGroups[group.name]} onClick={() => setExpandedGroups(current => ({ ...current, [group.name]: !current[group.name] }))}><span>{group.name}</span><span className={`group-chevron ${expandedGroups[group.name] ? '' : 'collapsed'}`}>⌄</span></button>
        {expandedGroups[group.name] && <div>{group.items.map(item => <button key={item.name} disabled={item.method === 'GET'} aria-disabled={item.method === 'GET'} title={item.method === 'GET' ? 'ยังไม่พร้อมใช้งาน' : undefined} className={`endpoint-tab ${activeEndpoint.name === item.name ? 'active' : ''} ${item.method === 'GET' ? 'endpoint-unavailable' : ''}`} onClick={() => item.method === 'POST' && selectEndpoint(item)}><span className={`sidebar-method ${item.method.toLowerCase()}`}>{item.method}</span><span className="sidebar-endpoint-name">{item.name}</span></button>)}</div>}
      </section>)}</nav>
    </aside>}
    {isTryPage ? <div className="try-main">
    <header className="topbar">
      <button className="sidebar-menu-button" aria-label="Open endpoint menu" onClick={() => setSidebarOpen(true)}><span/><span/><span/></button>
      <button className="back-button" onClick={() => { window.history.pushState({}, '', '#/'); setIsTryPage(false) }}><Icon name="back"/>Back</button>
      <span className="header-divider"/>
      <div className="page-identity"><span className="method">{activeEndpoint.method}</span><h1>{activeEndpoint.name}</h1></div>
    </header>
    <main className="workspace">
      <section className="input-panel" aria-label={activeEndpoint.name === 'Create InfiniteTalk avatar' || activeEndpoint.name === 'Create OmniHuman avatar' ? 'Avatar settings' : activeEndpoint.name === 'Create SeeDream 4.5 image' ? 'Image settings' : activeEndpoint.name === 'Create Motion Control video' ? 'Motion Control settings' : 'Video settings'}>
        {activeEndpoint.name === 'Create InfiniteTalk avatar' ? <>
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
          <div className="settings-row"><Choice label="Duration" value={form.duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={v => update('duration', v)}/><Choice label="Resolution" value={form.resolution} options={[[ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={v => update('resolution', v)}/></div>
          <Choice label="Aspect ratio" value={form.aspect_ratio} options={[[ '', 'Default' ], [ '16:9', <><span className="ratio landscape"/>16:9</> ], [ '9:16', <><span className="ratio portrait"/>9:16</> ]]} onChange={v => update('aspect_ratio', v)}/>
          <div className="audio-row"><div><label htmlFor="audio">Generate audio</label><p>สร้างเสียงประกอบไปพร้อมกับวิดีโอ</p></div><input id="audio" className="switch" type="checkbox" checked={form.generate_audio} onChange={e => update('generate_audio', e.target.checked)}/></div>
          <div className="references"><div className="section-label">Reference media <span>Optional</span></div><p className="helper">เพิ่มภาพหรือวิดีโอเพื่อใช้เป็นแนวทางในการสร้าง</p><div className="upload-grid">{['images', 'videos'].map(kind => <div key={kind}><label className={`upload-zone ${reading ? 'disabled' : ''}`}><Icon name="upload"/><strong>{kind === 'images' ? 'Add images' : 'Add videos'}</strong><span>{kind === 'images' ? 'ภาพอ้างอิง' : 'วิดีโออ้างอิง'}</span><input type="file" accept={kind === 'images' ? 'image/*' : 'video/*'} multiple disabled={reading} onChange={e => { upload(kind, e.target.files); e.target.value = '' }}/></label>{media[kind].map((item, index) => <div className="file-row" key={`${index}-${item.name}`}><span title={item.name}>{item.name}</span><button type="button" aria-label={`Remove ${item.name}`} onClick={() => setMedia(current => ({ ...current, [kind]: current[kind].filter((_, i) => i !== index) }))}><Icon name="close" width="14" height="14"/></button></div>)}</div>)}</div></div>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="form-action"><button className="primary-button" type="submit" disabled={reading}><Icon name="code"/>{reading ? 'Reading files…' : 'Preview Request'}<Icon name="arrow"/></button></div>
        </form>
        </>}
      </section>
      <section className="preview-panel" aria-label="Request preview">
        <div className="preview-heading"><div className="preview-title"><Icon name="code"/><h2>Request preview</h2></div><span className="json-badge">{['Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video'].includes(activeEndpoint.name) ? 'MULTIPART' : 'JSON'}</span>{preview && <button className="copy-button" onClick={copy}><Icon name="copy" width="15" height="15"/>{copied ? 'Copied' : 'Copy'}</button>}</div>
        <div className="preview-body" aria-live="polite">{preview ? <div className="code-content"><div className="request-route"><span className="method">{activeEndpoint.method}</span><code>{activeEndpoint.path ?? 'Path not provided'}</code></div>{['Create InfiniteTalk avatar', 'Create OmniHuman avatar', 'Create SeeDream 4.5 image', 'Create SeeDance 2.0 / Mini video', 'Create Motion Control video'].includes(activeEndpoint.name) && <div className="content-type-note">Content-Type <code>multipart/form-data</code> · แสดงเฉพาะชื่อไฟล์และค่าในฟอร์ม</div>}<pre>{JSON.stringify(preview, null, 2)}</pre></div> : <div className="empty-state"><div className="preview-symbol"><Icon name="code" width="30" height="30"/></div><h3>เริ่มต้นจากไอเดียของคุณ</h3><p>กรอกรายละเอียดทางซ้าย แล้วกด Preview Request<br/>เพื่อดูข้อมูลคำขอที่นี่</p><div className="empty-flow"><span>Prompt</span><Icon name="arrow" width="16"/><span>Settings</span><Icon name="arrow" width="16"/><span>Request</span></div></div>}</div>
        <div className="preview-bottom"><span className={`status-dot ${preview ? 'ready' : ''}`}/><span>{preview ? 'Request preview ready' : 'Waiting for your input'}</span><span className="format-label">application/json</span></div>
      </section>
    </main>
    </div> : <main className="catalog-main">
      <header className="catalog-topbar"><button className="sidebar-menu-button catalog-menu-button" aria-label="Open endpoint menu" onClick={() => setSidebarOpen(true)}><span/><span/><span/></button><span>Botnoi AI Gateway</span><span className="catalog-version">API Integration v1.0</span></header>
      <section className="catalog-welcome"><span className="catalog-icon"><Icon name="code" width="26" height="26"/></span><h1>เลือก API ที่ต้องการทดลอง</h1><p className="catalog-copy">เลือกรายการ POST จากเมนูด้านซ้าย เพื่อเปิดฟอร์มและดูตัวอย่าง Request</p><div className="catalog-prompt"><span>เลือก endpoint จาก Sidebar เพื่อเริ่มต้น</span><Icon name="back" width="16" height="16"/></div></section>
    </main>}
  </div>
}
export default App
