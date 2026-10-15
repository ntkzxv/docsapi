
import { useState } from 'react'
import type { FormEvent } from 'react'
import GPTImageSelect from './gptimageselect'
import { useNotification } from '../NotificationProvider'
import type { RequestPreview } from '../../types/app'
import { useLanguage } from '../../functions/LanguageProvider'

const initialForm = {
    prompt: '',
    resolution: '1k',
    quality: 'low',
    aspect_ratio: '1:1',
    output_format: 'png',
}

interface GPTImageFormProps {
    onPreview: (data: RequestPreview) => void
    onResetPreview?: () => void
    resetSignal: number
}

export default function GPTImageForm({ onPreview, onResetPreview, resetSignal }: GPTImageFormProps) {
    const notify = useNotification()
    const { t } = useLanguage()
    const [mode, setMode] = useState('text-to-image')
    const [form, setForm] = useState(initialForm)
    const [image, setImage] = useState<File | null>(null)
    const [error, setError] = useState('')
    const [promptError, setPromptError] = useState(false)
    const [imageError, setImageError] = useState(false)
    
    const [previousResetSignal, setPreviousResetSignal] = useState(resetSignal)

    if (resetSignal !== previousResetSignal) {
        setPreviousResetSignal(resetSignal)
        setForm({ ...initialForm })
        setImage(null)
        setError('')
        setPromptError(false)
        setImageError(false)
    }

    const update = (key: keyof typeof initialForm, value: string) => {
        setForm(current => ({ ...current, [key]: value }))
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()


        const isPromptInvalid = !form.prompt.trim()
        const isImageInvalid = mode === 'image-edit' && !image

        setPromptError(isPromptInvalid)
        setImageError(isImageInvalid)

        if (isPromptInvalid || isImageInvalid) {
            setError('')
            notify('failure', t(isPromptInvalid ? 'กรุณากรอก Prompt ก่อนกด Preview Request' : 'กรุณาเลือกรูปภาพที่ต้องการแก้ไข'))
            return
        }


        setError('')

        if (mode === 'text-to-image') {
            onPreview({
                endpoint: '/api/genai/wavespeed/gpt-image/text-to-image',
                body: {
                    prompt: form.prompt.trim(),
                    resolution: form.resolution,
                    quality: form.quality,
                    aspect_ratio: form.aspect_ratio,
                    output_format: form.output_format,
                    enable_sync_mode: false,
                    enable_base64_output: false,
                },
            })
        } else {
            onPreview({
                endpoint: '/api/genai/wavespeed/gpt-image/edit',
                upload_required: true,
                upload_endpoint: '/api/genai/upload_image',
                selected_file: {
                    file_name: image!.name,
                    content_type: image!.type,
                },
                body: {
                    prompt: form.prompt.trim(),
                    images: ['<UPLOADED_IMAGE_URL>'],
                    output_format: form.output_format,
                    enable_sync_mode: false,
                    enable_base64_output: false,
                },
            })
        }
    }

    return (
        <form className="avatar-form" onSubmit={handleSubmit}>

            {/* Mode */}
            <GPTImageSelect
                label="Mode"
                value={mode}
                options={[
                    ['text-to-image', 'Text to Image'],
                    ['image-edit', 'Image Edit'],
                ]}
                onChange={value => {
                    if (value === mode) return

                    setMode(value)
                    setForm({ ...initialForm })
                    setImage(null)
                    setError('')
                    setPromptError(false)
                    onResetPreview?.()
                }}
            />

            {/* Upload Image - เฉพาะ Image Edit */}
            {mode === 'image-edit' && (
                <div className="seedream-image-field">
                    <label className="prompt-label" htmlFor="gpt-image-upload">
                        {t('Starting image')} <span className="required">*</span>
                    </label>

                    <label
                        className={`avatar-dropzone seedream-dropzone ${image ? 'has-file' : ''}${imageError ? 'gpt-image-error' : ''}`}
                        htmlFor="gpt-image-upload"
                    >
                        <span className="avatar-upload-icon">↑</span>
                        <strong>
                            {image ? image.name : t('เลือกภาพต้นฉบับ')}
                        </strong>
                        <span>
                            {image
                                ? `${(image.size / (1024 * 1024)).toFixed(2)} MB`
                                : t('PNG, JPG หรือ WEBP')}
                        </span>

                        <input
                            id="gpt-image-upload"
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={event => {
                                const selectedFile = event.target.files?.[0] ?? null
                                setImage(selectedFile)

                                if (selectedFile) {
                                    setImageError(false)
                                }
                            }}
                        />
                    </label>
                    {imageError && (
                        <p className="gpt-image-error-message" role="alert">
                            {t('กรุณาเลือกรูปภาพที่ต้องการแก้ไข')}
                        </p>
                    )}
                </div>
            )}

            {/* Prompt */}
            <div>
                <label className="prompt-label" htmlFor="gpt-image-prompt">
                    {t('Prompt')} <span className="required">*</span>
                </label>

                <div className={`prompt-input ${promptError ? 'gpt-prompt-error' : ''}`}>

                    <textarea
                        id="gpt-image-prompt"
                        value={form.prompt}
                        onChange={event => {
                            update('prompt', event.target.value)

                            if (event.target.value.trim()) {
                                setPromptError(false)
                            }
                        }}
                        aria-invalid={promptError}
                        aria-describedby={
                            promptError ? 'gpt-prompt-error-message' : undefined
                        }
                        placeholder={
                            mode === 'text-to-image'
                                ? t('อธิบายรูปภาพที่ต้องการสร้าง...')
                                : t('อธิบายสิ่งที่ต้องการแก้ไขในรูปภาพ...')
                        }
                        rows={4}
                    />


                    <div className="prompt-footer">
                        <span>
                            {t('อธิบายรายละเอียดเพื่อให้ได้ภาพตามที่ต้องการ')}
                        </span>
                        <span>{form.prompt.length} {t('characters')}</span>
                    </div>
                </div>
            </div>

            {promptError && (
                <p
                    id="gpt-prompt-error-message"
                    className="gpt-prompt-error-message"
                    role="alert"
                >
                    {t('กรุณากรอก Prompt ก่อนกด Preview Request')}
                </p>
            )}
            {/* Settings เฉพาะ Text to Image */}
            {mode === 'text-to-image' && (
                <>
                    <div className="settings-row">
                        <GPTImageSelect
                            label="Resolution"
                            value={form.resolution}
                            options={[
                                ['1k', '1K'],
                                ['2k', '2K'],
                            ]}
                            onChange={value => update('resolution', value)}
                        />

                        <GPTImageSelect
                            label="Quality"
                            value={form.quality}
                            options={[
                                ['low', 'Low'],
                                ['medium', 'Medium'],
                                ['high', 'High'],
                            ]}
                            onChange={value => update('quality', value)}
                        />
                    </div>

                    <GPTImageSelect
                        label="Aspect Ratio"
                        value={form.aspect_ratio}
                        options={[
                            ['', 'Default'],
                            ['1:1', '1:1'],
                            ['16:9', '16:9'],
                            ['9:16', '9:16'],
                            ['4:3', '4:3'],
                        ]}
                        onChange={value => update('aspect_ratio', value)}
                    />
                </>
            )}

            {/* Output Format - ทั้งสองโหมด */}
            <GPTImageSelect
                label="Output Format"
                value={form.output_format}
                options={[
                    ['png', 'PNG'],
                    ['jpeg', 'JPEG'],
                    ['webp', 'WEBP'],
                ]}
                onChange={value => update('output_format', value)}
            />

            {/* Error Message */}
            {error && (
                <p className="error" role="alert">
                    {t(error)}
                </p>
            )}

            {/* Preview Request */}
            <div className="form-action">
                <button className="primary-button" type="submit">
                    {t('Preview Request')}
                </button>
            </div>

        </form>
    )
}

