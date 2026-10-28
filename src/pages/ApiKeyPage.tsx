import { useState } from 'react'
import { useBotnoiAuth } from '../components/BotnoiAuthButton'
import { useLanguage } from '../functions/LanguageProvider'
import Icon from '../components/Icon'

export default function ApiKeyPage() {
  const { signedIn, apiKey, profileLoading, resetApiKey, openLoginPopup } = useBotnoiAuth()
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [refreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)
  const [keyVisible, setKeyVisible] = useState(false)
  const resetConfirmTimer = { current: 0 }

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true)
      window.clearTimeout(resetConfirmTimer.current)
      resetConfirmTimer.current = window.setTimeout(() => setResetConfirm(false), 4000)
      return
    }
    window.clearTimeout(resetConfirmTimer.current)
    setResetConfirm(false)
    setResetting(true)
    setRefreshMsg('')
    await resetApiKey()
    setResetting(false)
    setRefreshMsg(t('Reset API Key สำเร็จ! Key ใหม่พร้อมใช้งานแล้ว'))
    window.setTimeout(() => setRefreshMsg(''), 4000)
  }

  const copyKey = async () => {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <main className="apikey-page">
      <div className="apikey-container">
        <h1 className="apikey-title">{t('Your API Keys')}</h1>
        <p className="apikey-desc">{t('สามารถนำ API keys ไปใช้งานเพื่อสร้างเสียงตามที่ต้องการได้ทันที')}</p>

        <div className="apikey-notice">
          <div className="apikey-notice-body">
            <div className="apikey-notice-heading">
              <span className="apikey-notice-icon" aria-hidden="true"><svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v4M10 6.5h.01"/></svg></span>
              <p className="apikey-notice-title">{t('วิธีใช้งาน API Key')}</p>
            </div>
            <p className="apikey-notice-text">{t('นำ API Key ไปใส่ใน HTTP header ทุกครั้งที่เรียกใช้งาน API:')}</p>
            <div className="apikey-usage-code">
              <code>botnoi-token: <span className="apikey-code-placeholder">YOUR_API_KEY</span></code>
            </div>
            <p className="apikey-notice-text">{t('สามารถ copy API Key ได้จากด้านล่าง แล้วนำไปแทนที่')} <code className="apikey-code-inline">YOUR_API_KEY</code></p>
          </div>
        </div>

        {!signedIn ? (
          <div className="apikey-card">
            <div className="apikey-signin-wrap">
              <p className="apikey-noauth">{t('Sign in to view your API key.')}</p>
              <button className="primary-button apikey-signin-btn" type="button" onClick={openLoginPopup}>
                {t('Sign in')}
              </button>
            </div>
          </div>
        ) : (
          <div className="apikey-card">
            <div className="apikey-card-header">
              <span className="apikey-card-label">{t('API Key')}</span>
              <div className="apikey-card-actions">
                <button
                  className="apikey-icon-btn"
                  type="button"
                  onClick={() => setKeyVisible(v => !v)}
                  title={keyVisible ? t('Hide API Key') : t('Show API Key')}
                  aria-label={keyVisible ? t('Hide API Key') : t('Show API Key')}
                >
                  {keyVisible
                    ? <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="10" cy="10" r="2.5"/></svg>
                    : <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0 0 12 12.5m-4.7.8C5.9 12.4 4 10.8 2 10c1.8-.8 3.8-2.5 6-3.5m3.5-.3C13 6.9 15 7.5 18 10c-1.5 1.2-3 2.3-5 3"/></svg>}
                </button>
                <button
                  className={`apikey-icon-btn${copied ? ' is-copied' : ''}`}
                  type="button"
                  onClick={copyKey}
                  disabled={!apiKey}
                  title={copied ? t('Copied!') : t('Copy API Key')}
                  aria-label={copied ? t('Copied!') : t('Copy API Key')}
                >
                  <Icon name="copy" width="16" height="16" />
                </button>
              </div>
            </div>
            <div className="apikey-card-divider" />
            <div className="apikey-card-value">
              {profileLoading || refreshing
                ? <span className="apikey-loading">{t('Loading…')}</span>
                : keyVisible
                  ? <code>{apiKey ?? '—'}</code>
                  : <code>{apiKey ? `${apiKey.slice(0, 6)}${'•'.repeat(Math.max(apiKey.length - 6, 8))}` : '—'}</code>}
            </div>
            {refreshMsg && (
              <div className="apikey-reset-msg">{refreshMsg}</div>
            )}
            <div className="apikey-card-divider" />
            <div className="apikey-reset-section">
              <p className="apikey-reset-hint">
                {resetConfirm
                  ? t('⚠️ API Key เดิมจะใช้ไม่ได้ทันที กดยืนยันอีกครั้งเพื่อ Reset')
                  : t('Reset จะสร้าง API Key ใหม่และยกเลิก Key เดิมทันที')}
              </p>
              <div className="apikey-reset-actions">
                <button
                  className={`apikey-reset-btn${resetConfirm ? ' is-confirm' : ''}`}
                  type="button"
                  onClick={() => void handleReset()}
                  disabled={resetting || refreshing || profileLoading}
                >
                  {resetting
                    ? <><svg className="apikey-spin" viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a6 6 0 1 0 1.5-4M4 6v4h4"/></svg>{t('กำลัง Reset…')}</>
                    : resetConfirm
                      ? t('⚠️ ยืนยัน Reset API Key')
                      : <><svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10a6 6 0 1 0 1.5-4M4 6v4h4"/></svg>{t('Reset API Key')}</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}