import { useState } from 'react'
import { Choice } from './TryItForms'

function dropdownOptions(endpoint, field) {
  if (endpoint.id === 'gptimg-text2img') {
    const options = {
      resolution: ['1k', '2k'],
      quality: ['low', 'medium', 'high'],
      aspect_ratio: ['', '1:1', '16:9', '9:16', '4:3'],
      output_format: ['png', 'jpeg', 'webp'],
    }
    return options[field.name]?.map(value => [value, value || 'Default']) ?? null
  }

  if (['gptimg-edit'].includes(endpoint.id) && field.name === 'output_format') {
    return ['png', 'jpeg', 'webp'].map(value => [value, value])
  }

  return null
}

function initialValues(endpoint) {
  return Object.fromEntries((endpoint.requestBody?.fields ?? []).map(field => [
    field.name,
    field.type === 'boolean' ? false : '',
  ]))
}

function normalizeValue(field, value) {
  if (field.type === 'boolean') return Boolean(value)
  if (field.type === 'number' || field.type === 'integer') return value === '' ? undefined : Number(value)
  if (field.type.endsWith('[]')) return String(value).split('\n').map(item => item.trim()).filter(Boolean)
  return value
}

export default function BotnoiRequestForm({ endpoint, onPreview }) {
  const fields = endpoint.requestBody?.fields ?? []
  const [values, setValues] = useState(() => initialValues(endpoint))
  const [error, setError] = useState('')

  const submit = event => {
    event.preventDefault()
    const body = {}
    for (const field of fields) {
      const value = values[field.name]
      if (field.required && (value === '' || value == null)) {
        setError(`กรุณากรอก ${field.name}`)
        return
      }
      if (field.type === 'File') {
        if (value) body[field.name] = value.name
      } else if (field.type === 'string[]') {
        const items = normalizeValue(field, value)
        if (items.length) body[field.name] = items
      } else if (value !== '' || field.type === 'boolean') {
        const normalized = normalizeValue(field, value)
        if (normalized !== undefined) body[field.name] = normalized
      }
    }
    setError('')
    onPreview(body)
  }

  return <>
    <div className="panel-heading"><div className="heading-with-icon"><span className="model-icon">✦</span><div><h2>Request settings</h2><p>กรอกข้อมูลตามฟิลด์ของ endpoint</p></div></div></div>
    <form onSubmit={submit}>
      {fields.map(field => {
        const id = `botnoi-${endpoint.id}-${field.name}`
        const isFile = field.type === 'File' || field.type.startsWith('File ')
        const isBoolean = field.type === 'boolean'
        const isLongText = field.type === 'string[]' || field.name === 'prompt' || field.type === 'object'
        const options = dropdownOptions(endpoint, field)
        return <div key={field.name} className="botnoi-schema-field">
          {isBoolean ? <div className="audio-row"><div><label htmlFor={id}>{field.name}{field.required && <span className="required"> *</span>}</label><p>{field.description}</p></div><input id={id} className="switch" type="checkbox" checked={Boolean(values[field.name])} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.checked }))}/></div> : <>
            {options ? <Choice label={`${field.name}${field.required ? ' *' : ''}`} value={values[field.name]} options={options} onChange={value => setValues(current => ({ ...current, [field.name]: value }))}/> : <label className="prompt-label" htmlFor={id}>{field.name} {field.required ? <span className="required">*</span> : <span className="optional-tag">Optional</span>}</label>}
            {!options && <>
            <div className="prompt-input">
              {isFile ? <label className="botnoi-file-picker" htmlFor={id}><span className="botnoi-file-button">Choose file</span><span className="botnoi-file-name">{values[field.name]?.name ?? 'No file chosen'}</span><input id={id} className="botnoi-file-input" type="file" onChange={event => setValues(current => ({ ...current, [field.name]: event.target.files?.[0] ?? '' }))}/></label> : isLongText ? <textarea id={id} required={field.required} value={values[field.name]} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} placeholder={field.description} rows={field.name === 'prompt' ? 4 : 3}/> : <input id={id} required={field.required} type={field.type === 'number' || field.type === 'integer' ? 'number' : 'text'} value={values[field.name]} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} placeholder={field.description}/>}
            </div>
            </>}
          </>}
        </div>
      })}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="form-action"><button className="primary-button" type="submit">Preview Request</button></div>
    </form>
  </>
}
