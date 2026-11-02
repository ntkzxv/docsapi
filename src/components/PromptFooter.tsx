import { useLanguage } from '../functions/LanguageProvider'
import { getPromptExample } from '../functions/promptExamples'
import './prompt-footer.css'

export default function PromptFooter({ value, model, onChange, disabled = false }: {
  value: string
  model: string
  onChange: (prompt: string) => void
  disabled?: boolean
}) {
  const { t } = useLanguage()

  return <div className="prompt-footer">
    <button className="prompt-generate-button" type="button" onClick={() => onChange(getPromptExample(model))} disabled={disabled}>generate</button>
    <span className="prompt-character-count">{value.length} {t('characters')}</span>
  </div>
}
