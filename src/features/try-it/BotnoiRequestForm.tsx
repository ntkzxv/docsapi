import { useState } from 'react'
import { Choice } from './TryItForms'
import { useNotification } from '../../components/NotificationProvider'
import type { BotnoiEndpoint, BotnoiRequestBodyField } from '../../types/botnoiEndpoint'
import type { RequestPreview } from '../../types/app'
import type { FormEvent } from 'react'
import { useLanguage } from '../../functions/LanguageProvider'
import ProviderLogo, { type ApiProvider } from '../../components/ProviderLogo'

type RequestFieldValue = string | boolean | File

function dropdownOptions(endpoint: BotnoiEndpoint, field: BotnoiRequestBodyField): [string, string][] | null {
  if (endpoint.id === 'gptimg-text2img') {
    const options: Record<string, string[]> = {
      resolution: ['1k', '2k'],
      quality: ['low', 'medium', 'high'],
      aspect_ratio: ['', '1:1', '16:9', '9:16', '4:3'],
      output_format: ['png', 'jpeg', 'webp'],
    }
    return options[field.name]?.map((value): [string, string] => [value, value || 'Default']) ?? null
  }

  if (['gptimg-edit'].includes(endpoint.id) && field.name === 'output_format') {
    return ['png', 'jpeg', 'webp'].map(value => [value, value])
  }

  return null
}

function initialValues(endpoint: BotnoiEndpoint): Record<string, RequestFieldValue> {
  return Object.fromEntries((endpoint.requestBody?.fields ?? []).map(field => [
    field.name,
    field.type === 'boolean' ? false : endpoint.id === 'gptimg-text2img' && field.name === 'resolution' ? '1k' : '',
  ]))
}

function normalizeValue(field: BotnoiRequestBodyField, value: RequestFieldValue | undefined): string | boolean | number | string[] | undefined {
  if (field.type === 'boolean') return Boolean(value)
  if (field.type === 'number' || field.type === 'integer') return value === '' || value == null ? undefined : Number(value)
  if (field.type.endsWith('[]')) return String(value ?? '').split('\n').map(item => item.trim()).filter(Boolean)
  return typeof value === 'string' ? value : undefined
}

export default function BotnoiRequestForm({ endpoint, onPreview, generationStatus = 'idle' }: { endpoint: BotnoiEndpoint; onPreview: (data: RequestPreview) => void; generationStatus?: 'idle' | 'submitting' | 'processing' | 'completed' | 'failed' }) {
  const notify = useNotification()
  const { t } = useLanguage()
  const fields = endpoint.requestBody?.fields ?? []
  const provider: ApiProvider | null = endpoint.path.includes('/byteplus/') ? 'byteplus' : endpoint.path.includes('/wavespeed/') ? 'wavespeed' : null
  const [values, setValues] = useState<Record<string, RequestFieldValue>>(() => initialValues(endpoint))
  const [error, setError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body: RequestPreview = {}
    for (const field of fields) {
      const value = values[field.name]
      if (field.required && (value == null || (typeof value === 'string' && !value.trim()))) {
        const message = `กรุณากรอก ${field.name}`
        setError(message)
        notify('failure', message)
        return
      }
      if (field.type === 'File') {
        if (value instanceof File) body[field.name] = value
      } else if (field.type === 'string[]') {
        const items = normalizeValue(field, value)
        if (Array.isArray(items) && items.length) body[field.name] = items
      } else if (value !== '' || field.type === 'boolean') {
        const normalized = normalizeValue(field, value)
        if (normalized !== undefined) body[field.name] = normalized
      }
    }
    setError('')
    onPreview(body)
  }

  return <>
    <div className="panel-heading"><div className="heading-with-icon">{provider ? <ProviderLogo provider={provider}/> : <span className="model-icon">✦</span>}<div><h2>{t('Request settings')}</h2><p>{t('กรอกข้อมูลตามฟิลด์ของ endpoint')}</p></div></div></div>
    <form onSubmit={submit} noValidate>
      {fields.map(field => {
        const id = `botnoi-${endpoint.id}-${field.name}`
        const isFile = field.type === 'File' || field.type.startsWith('File ')
        const isBoolean = field.type === 'boolean'
        const isLongText = field.type === 'string[]' || field.name === 'prompt' || field.type === 'object'
        const options = dropdownOptions(endpoint, field)
        return <div key={field.name} className="botnoi-schema-field">
          {isBoolean ? <div className="audio-row"><div><label htmlFor={id}>{t(field.name)}{field.required && <span className="required"> *</span>}</label><p>{t(field.description)}</p></div><input id={id} className="switch" type="checkbox" checked={Boolean(values[field.name])} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.checked }))}/></div> : <>
            {options ? <Choice label={`${field.name}${field.required ? ' *' : ''}`} value={String(values[field.name] ?? '')} options={options} onChange={value => setValues(current => ({ ...current, [field.name]: value }))}/> : <label className="prompt-label" htmlFor={id}>{t(field.name)} {field.required ? <span className="required">*</span> : <span className="optional-tag">{t('Optional')}</span>}</label>}
            {!options && <>
            <div className="prompt-input">
              {isFile ? <label className="botnoi-file-picker" htmlFor={id}><span className="botnoi-file-button">{t('Choose file')}</span><span className="botnoi-file-name">{values[field.name] instanceof File ? (values[field.name] as File).name : t('No file chosen')}</span><input id={id} className="botnoi-file-input" type="file" onChange={event => setValues(current => ({ ...current, [field.name]: event.target.files?.[0] ?? '' }))}/></label> : isLongText ? <textarea id={id} required={field.required} value={String(values[field.name] ?? '')} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} placeholder={t(field.description)} rows={field.name === 'prompt' ? 4 : 3}/> : <input id={id} required={field.required} type={field.type === 'number' || field.type === 'integer' ? 'number' : 'text'} value={String(values[field.name] ?? '')} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} placeholder={t(field.description)}/>}
            </div>
            </>}
          </>}
        </div>
      })}
      {error && <p className="error" role="alert">{t(error)}</p>}
      <div className="form-action"><button className="primary-button" type="submit" disabled={generationStatus === 'submitting' || generationStatus === 'processing'}>{generationStatus === 'submitting' ? t('Submitting…') : generationStatus === 'processing' ? <>{t('Generating')}<span className="loading-dots" aria-hidden="true" /></> : endpoint.id === 'gptimg-upload' ? t('Upload image') : endpoint.id === 'gptimg-edit' || endpoint.id === 'gptimg-text2img' ? t('Generate image') : t('Submit request')}</button></div>
    </form>
  </>
}
