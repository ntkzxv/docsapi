import { useEffect, useRef, useState } from 'react'
import type { Dispatch, FormEvent, InvalidEvent, ReactNode, SetStateAction } from 'react'
import Icon from '../../components/Icon'
import { useNotification } from '../../components/NotificationProvider'
import type { EndpointDoc, RequestPreview } from '../../types/app'
import type { Seedance20Request } from '../../services/seedance20'
import { useLanguage } from '../../functions/LanguageProvider'
import PromptFooter from '../../components/PromptFooter'

export function Choice({ label, value, options, onChange }: { label: string; value: string; options: [string, ReactNode, boolean?][]; onChange: (value: string) => void }) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const current = options.find(([key]) => key === value)

  useEffect(() => {
    if (!open) return undefined
    const closeOutside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    const closeEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeEscape)
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape) }
  }, [open])

  return <div className="choice-field" ref={root}>
    <span className="choice-label">{t(label)}</span>
    <button type="button" className={`custom-select-trigger ${open ? 'is-open' : ''}`} aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(v => !v)}>
      <span>{current?.[1] ?? t('เลือกตัวเลือก')}</span><span className="select-chevron" aria-hidden="true"/>
    </button>
    {open && <div className="custom-select-menu" role="listbox" aria-label={t(label)}>{options.map(([key, text, disabled]) => <button key={key || 'default'} type="button" role="option" aria-selected={value === key} aria-disabled={disabled} disabled={disabled} className={`${value === key ? 'is-selected' : ''} ${disabled ? 'is-disabled' : ''}`} onClick={() => { onChange(key); setOpen(false) }}>{typeof text === 'string' ? t(text) : text}{value === key && <span className="option-check" aria-hidden="true">✓</span>}</button>)}</div>}
  </div>
}
export function WaveSpeedModelForm({ doc, onPreview }: { doc: EndpointDoc & { formFields: NonNullable<EndpointDoc['formFields']> }; onPreview: (data: RequestPreview) => void }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const defaults = Object.fromEntries(doc.formFields.map(field => [field.name, field.defaultValue ?? ''])) as Record<string, string | boolean>
  const [values, setValues] = useState<Record<string, string | boolean>>(defaults)
  const [error, setError] = useState('')
  const invalidNotificationPending = useRef(false)
  const updateValue = (name: string, value: string | boolean) => {
    setValues(current => ({ ...current, [name]: value }))
    setError('')
  }
  const handleInvalid = (event: InvalidEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (invalidNotificationPending.current) return
    invalidNotificationPending.current = true
    const target = event.target
    const fieldName = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.labels?.[0]?.textContent?.replace('*', '').trim()
      : undefined
    const message = fieldName
      ? `กรุณากรอก ${fieldName} ให้ครบหรือแก้ค่าให้ถูกต้องก่อน Preview Request`
      : 'กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อน Preview Request'
    setError(message)
    window.setTimeout(() => { invalidNotificationPending.current = false }, 0)
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body: RequestPreview = {}
    let parsingFieldLabel = ''
    try {
      for (const field of doc.formFields) {
        const value = values[field.name]
        if (field.required && !String(value ?? '').trim()) throw new Error(`กรุณากรอก ${field.label}`)
        if (field.kind === 'boolean') body[field.name] = value
        else if (String(value).trim()) {
          if (field.kind === 'number' || field.valueType === 'number') {
            const numberValue = Number(value)
            if (!Number.isFinite(numberValue)) throw new Error(`${field.label} ต้องเป็นตัวเลข`)
            body[field.name] = numberValue
          } else if (field.kind === 'json') {
            parsingFieldLabel = field.label
            body[field.name] = JSON.parse(String(value))
            parsingFieldLabel = ''
          } else body[field.name] = String(value).trim()
        }
      }
      if (doc.title.startsWith('Kling')) {
        if (body['shot_type'] === 'intelligence' && !body['prompt']) throw new Error('โหมด intelligence ต้องมี Prompt')
        if (body['multi_prompt'] && !Array.isArray(body['multi_prompt'])) throw new Error('Multi-prompt ต้องเป็น JSON array')
        if (body['shot_type'] === 'intelligence' && body['multi_prompt']) throw new Error('โหมด intelligence ไม่ใช้ Multi-prompt')
      }
      setError('')
      onPreview(body)
    } catch (failure) {
      const message = failure instanceof SyntaxError && parsingFieldLabel
        ? `${parsingFieldLabel} ต้องเป็น JSON ที่ถูกต้อง`
        : failure instanceof Error ? failure.message : 'สร้าง Request ไม่สำเร็จ'
      setError(message)
      notify('failure', message)
    }
  }
  return <form className="avatar-form wavespeed-form" onSubmit={submit} onInvalidCapture={handleInvalid}>
    {doc.formFields.map(field => {
      const klingPromptRequired = doc.title.startsWith('Kling') && field.name === 'prompt'
        && (values['shot_type'] === 'intelligence' || !String(values['multi_prompt'] ?? '').trim())
      const required = Boolean(field.required || klingPromptRequired)
      return <div key={field.name}>
        {field.kind === 'select' ? <Choice label={field.label} value={String(values[field.name] ?? '')} options={(field.options ?? []).map((option): [string, string] => [option, option || t('Auto from image')])} onChange={value => updateValue(field.name, value)}/>
          : field.kind === 'boolean' ? <div className="audio-row"><div><label htmlFor={`model-${field.name}`}>{t(field.label)}</label></div><input id={`model-${field.name}`} className="switch" type="checkbox" checked={Boolean(values[field.name])} onChange={event => updateValue(field.name, event.target.checked)}/></div>
            : <><label className="prompt-label" htmlFor={`model-${field.name}`}>{t(field.label)} {required && <span className="required">*</span>}{field.optional && <span className="optional-tag">{t('Optional')}</span>}</label><div className="prompt-input">{field.kind === 'textarea' || field.kind === 'json'
              ? <><textarea id={`model-${field.name}`} required={required} value={String(values[field.name] ?? '')} onChange={event => updateValue(field.name, event.target.value)} placeholder={t(field.placeholder || '')} rows={field.kind === 'json' ? 3 : 4}/>{field.name === 'prompt' && <PromptFooter value={String(values[field.name] ?? '')} model={doc.title} onChange={prompt => updateValue(field.name, prompt)}/>}</>
              : <input id={`model-${field.name}`} type={field.kind === 'number' ? 'number' : 'text'} required={required} min={field.min} max={field.max} step={field.step || (field.kind === 'number' ? '1' : undefined)} value={String(values[field.name] ?? '')} onChange={event => updateValue(field.name, event.target.value)} placeholder={t(field.placeholder || '')}/>}</div></>}
      </div>
    })}
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit">{t('Preview Request')}</button></div>
  </form>
}
export function InfiniteTalkForm({ onGenerate, generationStatus }: { onGenerate: (data: Record<string, unknown>) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [resolution, setResolution] = useState('480p')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image || !audio) { const message = 'กรุณาเลือกไฟล์ภาพและไฟล์เสียงให้ครบ'; setError(message); notify('failure', message); return }
    setError('')
    onGenerate({ image_file: image, audio_file: audio, resolution, ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileField = (field: string, file: File | null, setFile: Dispatch<SetStateAction<File | null>>, accept: string, title: string, hint: string) => <div className="avatar-file-field">
    <label className="prompt-label" htmlFor={field}>{t(title)} <span className="required">*</span></label>
    <label className={`avatar-dropzone ${file ? 'has-file' : ''}`} htmlFor={field}>
      <span className="avatar-upload-icon"><Icon name="upload"/></span>
      <strong>{file ? file.name : t('เลือกไฟล์ หรือวางไฟล์ที่นี่')}</strong>
      <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : t(hint)}</span>
      <input id={field} type="file" accept={accept} required onChange={event => setFile(event.target.files?.[0] ?? null)}/>
    </label>
  </div>
  return <form className="avatar-form" onSubmit={submit}>
    <div className="avatar-files">{fileField('image_file', image, setImage, 'image/jpeg,image/png,.jpg,.jpeg,.png', 'Avatar image', 'JPG or PNG')} {fileField('audio_file', audio, setAudio, 'audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav', 'Speech audio', 'MP3 or WAV')}</div>
    <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ]]} onChange={setResolution}/>
    <label className="prompt-label avatar-prompt-label" htmlFor="avatar-prompt">{t('Prompt')} <span className="optional-tag">{t('Optional')}</span></label>
    <div className="prompt-input"><textarea id="avatar-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('เพิ่มรายละเอียดลักษณะ Avatar หรือการเคลื่อนไหว…')} rows={4}/><PromptFooter value={prompt} model="InfiniteTalk avatar" onChange={setPrompt} disabled={generationStatus === 'submitting' || generationStatus === 'processing'}/></div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating video')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate video')}</button></div>
  </form>
}
export function SeeDreamForm({ onGenerate, generationStatus }: { onGenerate: (data: Record<string, unknown>) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState('seedream-4-5-251128')
  const [resolution, setResolution] = useState('720p')
  const [watermark, setWatermark] = useState('false')
  const [image, setImage] = useState<File | null>(null)
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) { const message = 'กรุณากรอก Prompt ก่อนสร้างคำขอ'; setError(message); notify('failure', message); return }
    setError('')
    const parameters = JSON.stringify({ sequential_image_generation: 'disabled', watermark: watermark === 'true' })
    onGenerate({ prompt: prompt.trim(), ...(model.trim() && { model: model.trim() }), resolution, parameters, ...(image && { image1: image }) })
  }
  return <form className="avatar-form seedream-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedream-prompt">{t('Prompt')} <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedream-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('อธิบายภาพที่ต้องการสร้าง…')} rows={4}/><PromptFooter value={prompt} model="SeeDream image" onChange={setPrompt} disabled={generationStatus === 'submitting' || generationStatus === 'processing'}/></div>
    </div>
    <Choice label="Model" value={model} options={[[ 'seedream-4-5-251128', 'SeeDream 4.5' ]]} onChange={setModel}/>
    <div className="settings-row seedream-settings-row">
      <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ]]} onChange={setResolution}/>
      <Choice label="Watermark" value={watermark} options={[[ 'false', 'Off' ], [ 'true', 'On' ]]} onChange={setWatermark}/>
    </div>
    <div className="seedream-image-field">
      <div className="prompt-label">{t('Starting image')} <span className="optional-tag">{t('Optional')}</span></div>
      <label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedream-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : t('เลือกภาพตั้งต้น')}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : t('ใช้สร้างภาพต่อจากรูปที่มี')}</span><input id="seedream-image" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label>
    </div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating image')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate image')}</button></div>
  </form>
}
export function Seedance20Form({ onGenerate, generationStatus }: { onGenerate: (request: Seedance20Request) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text-to-video')
  const [model, setModel] = useState('dreamina-seedance-2-0-260128')
  const [image, setImage] = useState<File | null>(null)
  const [duration, setDuration] = useState('5')
  const [ratio, setRatio] = useState('16:9')
  const [resolution, setResolution] = useState('720p')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) { const message = 'กรุณากรอก Prompt ก่อนสร้างคำขอ'; setError(message); notify('failure', message); return }
    setError('')
    onGenerate({ prompt: prompt.trim(), mode, ...(model && { model }), ...(mode === 'image-to-video' && image && { image_file: image }), duration, ratio, resolution })
  }
  return <form className="avatar-form seedance20-form" onSubmit={submit}>
    <div>
      <label className="prompt-label" htmlFor="seedance20-prompt">{t('Prompt')} <span className="required">*</span></label>
      <div className="prompt-input"><textarea id="seedance20-prompt" required value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('อธิบายวิดีโอและการเคลื่อนไหวที่ต้องการ…')} rows={4}/><PromptFooter value={prompt} model="Seedance video" onChange={setPrompt} disabled={generationStatus === 'submitting' || generationStatus === 'processing'}/></div>
    </div>
    <Choice label="Mode" value={mode} options={[[ 'text-to-video', 'Text-to-Video' ], [ 'image-to-video', 'Image-to-Video' ]]} onChange={value => { setMode(value); setError('') }}/>
    <Choice label="Model" value={model} options={[[ 'dreamina-seedance-2-0-260128', 'Seedance 2.0' ], [ 'dreamina-seedance-2-0-mini-260615', <>{t('Seedance 2.0 Mini')} <span className="optional-tag">{t('Disabled')}</span></>, true]]} onChange={setModel}/>
    {mode === 'image-to-video' && <div className="seedream-image-field"><div className="prompt-label">{t('Starting image')} <span className="optional-tag">{t('Optional')}</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="seedance20-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : t('เลือกภาพตั้งต้น')}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : t('ภาพที่ใช้เป็นเฟรมเริ่มต้นของวิดีโอ')}</span><input id="seedance20-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>}
    <div className="settings-row"><Choice label="Duration" value={duration} options={[[ '5', '5 seconds' ], [ '10', '10 seconds' ]]} onChange={setDuration}/><Choice label="Ratio" value={ratio} options={[[ '16:9', '16:9' ], [ '9:16', '9:16' ]]} onChange={setRatio}/></div>
    <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={setResolution}/>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating video')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate video')}</button></div>
  </form>
}
export function MotionControlForm({ onGenerate, generationStatus }: { onGenerate: (data: Record<string, unknown>) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [image, setImage] = useState<File | null>(null)
  const [video, setVideo] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoSource, setVideoSource] = useState('file')
  const [mode, setMode] = useState('standard')
  const [orientation, setOrientation] = useState('video')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image) { const message = 'กรุณาอัปโหลดภาพตัวละคร'; setError(message); notify('failure', message); return }
    if (videoSource === 'file' && !video) { const message = 'กรุณาอัปโหลดคลิปท่าทาง'; setError(message); notify('failure', message); return }
    if (videoSource === 'url' && !videoUrl.trim()) { const message = 'กรุณากรอก URL ของ Template video'; setError(message); notify('failure', message); return }
    setError('')
    onGenerate({ image, video: videoSource === 'file' ? video! : videoUrl.trim(), mode, character_orientation: orientation })
  }
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      <div className="seedream-image-field motion-character-field"><div className="prompt-label">{t('Character image')} <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}`} htmlFor="motion-image"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{image ? image.name : t('อัปโหลดภาพตัวละคร')}</strong><span>{image ? `${(image.size / (1024 * 1024)).toFixed(2)} MB` : t('ภาพต้นฉบับของตัวละคร')}</span><input id="motion-image" type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}/></label></div>
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">{t('Template video')} <span className="required">*</span></span><div className="source-toggle"><button type="button" className={videoSource === 'file' ? 'selected' : ''} onClick={() => { setVideoSource('file'); setError('') }}>{t('File')}</button><button type="button" className={videoSource === 'url' ? 'selected' : ''} onClick={() => { setVideoSource('url'); setError('') }}>URL</button></div></div>{videoSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${video ? 'has-file' : ''}`} htmlFor="motion-video"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{video ? video.name : t('อัปโหลดคลิปท่าทาง')}</strong><span>{video ? `${(video.size / (1024 * 1024)).toFixed(2)} MB` : t('วิดีโอต้นแบบการเคลื่อนไหว')}</span><input id="motion-video" type="file" accept="video/*" onChange={event => setVideo(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label={t('Template video URL')} type="url" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} placeholder="https://example.com/template.mp4"/></div>}</div>
    </div>
    <div className="settings-row"><Choice label="Mode" value={mode} options={[[ 'standard', 'Standard' ], [ 'pro', 'Pro' ]]} onChange={setMode}/><Choice label="Character orientation" value={orientation} options={[[ 'image', 'Image' ], [ 'video', 'Video' ]]} onChange={setOrientation}/></div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating video')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate video')}</button></div>
  </form>
}
export function OmniHumanForm({ onGenerate, generationStatus }: { onGenerate: (data: Record<string, unknown>) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [audioSource, setAudioSource] = useState('file')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image) { const message = 'กรุณาอัปโหลดภาพ Avatar'; setError(message); notify('failure', message); return }
    if (audioSource === 'file' && !audio) { const message = 'กรุณาอัปโหลดไฟล์เสียงพูด'; setError(message); notify('failure', message); return }
    if (audioSource === 'url' && !audioUrl.trim()) { const message = 'กรุณากรอก URL ของไฟล์เสียง'; setError(message); notify('failure', message); return }
    setError('')
    onGenerate({ image_file: image, audio_file: audioSource === 'file' ? audio! : audioUrl.trim(), ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileDrop = (id: string, file: File | null, setFile: Dispatch<SetStateAction<File | null>>, accept: string, title: string, note: string) => <div className="seedream-image-field"><div className="prompt-label">{t(title)} <span className="required">*</span></div><label className={`avatar-dropzone seedream-dropzone ${file ? 'has-file' : ''}`} htmlFor={id}><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{file ? file.name : t(`อัปโหลด${title}`)}</strong><span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : t(note)}</span><input id={id} type="file" accept={accept} onChange={event => setFile(event.target.files?.[0] ?? null)}/></label></div>
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">
      {fileDrop('omnihuman-image', image, setImage, 'image/*', 'Avatar image', 'ภาพต้นฉบับของ Avatar')}
      <div className="motion-video-field"><div className="motion-video-heading"><span className="prompt-label">{t('Speech audio')} <span className="required">*</span></span><div className="source-toggle"><button type="button" className={audioSource === 'file' ? 'selected' : ''} onClick={() => { setAudioSource('file'); setError('') }}>{t('File')}</button><button type="button" className={audioSource === 'url' ? 'selected' : ''} onClick={() => { setAudioSource('url'); setError('') }}>URL</button></div></div>{audioSource === 'file' ? <label className={`avatar-dropzone seedream-dropzone ${audio ? 'has-file' : ''}`} htmlFor="omnihuman-audio"><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{audio ? audio.name : t('อัปโหลดไฟล์เสียง')}</strong><span>{audio ? `${(audio.size / (1024 * 1024)).toFixed(2)} MB` : t('MP3 หรือ WAV')}</span><input id="omnihuman-audio" type="file" accept="audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav" onChange={event => setAudio(event.target.files?.[0] ?? null)}/></label> : <div className="prompt-input url-input"><input aria-label={t('Audio URL')} type="url" value={audioUrl} onChange={event => setAudioUrl(event.target.value)} placeholder="https://example.com/speech.mp3"/></div>}</div>
    </div>
    <div><label className="prompt-label" htmlFor="omnihuman-prompt">{t('Prompt')} <span className="optional-tag">{t('Optional')}</span></label><div className="prompt-input"><textarea id="omnihuman-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('อธิบายสไตล์หรือสีหน้าที่ต้องการ…')} rows={4}/><PromptFooter value={prompt} model="OmniHuman avatar" onChange={setPrompt} disabled={generationStatus === 'submitting' || generationStatus === 'processing'}/></div></div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating video')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate video')}</button></div>
  </form>
}

export function DreamActorForm({ onGenerate, generationStatus }: { onGenerate: (data: Record<string, unknown>) => void; generationStatus: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const [image, setImage] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!image || !audio) {
      const message = 'กรุณาเลือกภาพและไฟล์เสียงให้ครบ'
      setError(message)
      notify('failure', message)
      return
    }
    setError('')
    onGenerate({ image_file: image, audio_file: audio, ...(prompt.trim() && { prompt: prompt.trim() }) })
  }
  const fileInput = (id: string, file: File | null, setFile: (value: File | null) => void, accept: string, label: string, hint: string) => <div className="seedream-image-field">
    <div className="prompt-label">{t(label)} <span className="required">*</span></div>
    <label className={`avatar-dropzone seedream-dropzone ${file ? 'has-file' : ''}`} htmlFor={id}><span className="avatar-upload-icon"><Icon name="upload"/></span><strong>{file ? file.name : t(`อัปโหลด${label}`)}</strong><span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : t(hint)}</span><input id={id} type="file" accept={accept} required onChange={event => setFile(event.target.files?.[0] ?? null)}/></label>
  </div>
  return <form className="avatar-form motion-form" onSubmit={submit}>
    <div className="motion-upload-grid">{fileInput('dreamactor-image', image, setImage, 'image/*', 'Presenter image', 'ภาพต้นฉบับของ Presenter')}{fileInput('dreamactor-audio', audio, setAudio, 'audio/mpeg,audio/wav,audio/x-wav,.mp3,.wav', 'Speech audio', 'ไฟล์เสียงพากย์ MP3 หรือ WAV')}</div>
    <div><label className="prompt-label" htmlFor="dreamactor-prompt">{t('Prompt')} <span className="optional-tag">{t('Optional')}</span></label><div className="prompt-input"><textarea id="dreamactor-prompt" value={prompt} onChange={event => setPrompt(event.target.value)} placeholder={t('อธิบายสไตล์ของ Presenter…')} rows={4}/><PromptFooter value={prompt} model="DreamActor avatar" onChange={setPrompt} disabled={generationStatus === 'submitting' || generationStatus === 'processing'}/></div></div>
    {error && <p className="error" role="alert">{t(error)}</p>}
    <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating video')}<span className="loading-dots" aria-hidden="true" /></> : t('Generate video')}</button></div>
  </form>
}
