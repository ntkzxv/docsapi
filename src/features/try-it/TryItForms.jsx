import { useEffect, useRef, useState } from 'react'
import Icon from '../../components/Icon'

export function Choice({ label, value, options, onChange }) {
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
export function WaveSpeedModelForm({ doc, onPreview }) {
  const defaults = Object.fromEntries(doc.formFields.map(field => [field.name, field.defaultValue ?? '']))
  const [values, setValues] = useState(defaults)
  const [error, setError] = useState('')
  const updateValue = (name, value) => setValues(current => ({ ...current, [name]: value }))
  const submit = event => {
    event.preventDefault()
    const body = {}
    try {
      for (const field of doc.formFields) {
        const value = values[field.name]
        if (field.kind === 'boolean') body[field.name] = value
        else if (String(value).trim()) body[field.name] = field.kind === 'number' || field.valueType === 'number' ? Number(value) : field.kind === 'json' ? JSON.parse(value) : String(value).trim()
      }
      if (doc.title.startsWith('Kling')) {
        if (body.shot_type === 'intelligence' && !body.prompt) throw new Error('โหมด intelligence ต้องมี Prompt')
        if (body.multi_prompt && !Array.isArray(body.multi_prompt)) throw new Error('Multi-prompt ต้องเป็น JSON array')
        if (body.shot_type === 'intelligence' && body.multi_prompt) throw new Error('โหมด intelligence ไม่ใช้ Multi-prompt')
      }
      setError('')
      onPreview(body)
    } catch (failure) { setError(failure instanceof SyntaxError ? 'Multi-prompt ต้องเป็น JSON ที่ถูกต้อง' : failure.message) }
  }
  return <form className="avatar-form wavespeed-form" onSubmit={submit}>
    {doc.formFields.map(field => <div key={field.name}>
      {field.kind === 'select' ? <Choice label={field.label} value={values[field.name]} options={field.options.map(option => [option, option || 'Auto from image'])} onChange={value => updateValue(field.name, value)}/>
        : field.kind === 'boolean' ? <div className="audio-row"><div><label htmlFor={`model-${field.name}`}>{field.label}</label></div><input id={`model-${field.name}`} className="switch" type="checkbox" checked={values[field.name]} onChange={event => updateValue(field.name, event.target.checked)}/></div>
          : <><label className="prompt-label" htmlFor={`model-${field.name}`}>{field.label} {field.required && <span className="required">*</span>}{field.optional && <span className="optional-tag">Optional</span>}</label><div className="prompt-input">{field.kind === 'textarea' || field.kind === 'json'
            ? <textarea id={`model-${field.name}`} required={field.required} value={values[field.name]} onChange={event => updateValue(field.name, event.target.value)} placeholder={field.placeholder || ''} rows={field.kind === 'json' ? 3 : 4}/>
            : <input id={`model-${field.name}`} type={field.kind === 'number' ? 'number' : 'text'} required={field.required} min={field.min} max={field.max} step={field.step || (field.kind === 'number' ? '1' : undefined)} value={values[field.name]} onChange={event => updateValue(field.name, event.target.value)} placeholder={field.placeholder || ''}/>}</div></>}
    </div>)}
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
export function InfiniteTalkForm({ onPreview }) {
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
export function SeeDreamForm({ onPreview }) {
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
export function Seedance20Form({ onPreview }) {
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
    <Choice label="Resolution" value={resolution} options={[[ '480p', '480p' ], [ '720p', '720p' ], [ '1080p', '1080p' ]]} onChange={setResolution}/>
    {error && <p className="error" role="alert">{error}</p>}
    <div className="form-action"><button className="primary-button" type="submit"><Icon name="code"/>Preview Request<Icon name="arrow"/></button></div>
  </form>
}
export function MotionControlForm({ onPreview }) {
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
export function OmniHumanForm({ onPreview }) {
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
