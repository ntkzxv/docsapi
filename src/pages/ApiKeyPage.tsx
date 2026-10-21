import { useState } from 'react'
import { useBotnoiAuth } from '../components/BotnoiAuthButton'
import { useLanguage } from '../functions/LanguageProvider'
import Icon from '../components/Icon'

const BOTNOI_DASHBOARD_URL = 'https://voice.botnoi.ai/developer/api'

export default function ApiKeyPage() {
  const { signedIn, apiKey, profileLoading, refreshProfile, openLoginPopup } = useBotnoiAuth()
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')

  const handleOpenDashboard = () => {
    window.open(BOTNOI_DASHBOARD_URL, '_blank', 'noopener,noreferrer')
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    setRefreshMsg('')
    await refreshProfile()
    setRefreshing(false)
    setRefreshMsg(t('โหลด API Key ใหม่แล้ว'))
    window.setTimeout(() => setRefreshMsg(''), 3000)
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
          <div className="apikey-notice-icon">💡</div>
          <div className="apikey-notice-body">
            <p className="apikey-notice-title">{t('วิธีใช้งาน API Key')}</p>
            <p className="apikey-notice-text">{t('นำ API Key ไปใส่ใน HTTP header ทุกครั้งที่เรียกใช้งาน API:')}</p>
            <div className="apikey-usage-code">
              <code>botnoi-token: <span className="apikey-code-placeholder">YOUR_API_KEY</span></code>
            </div>
            <p className="apikey-notice-text">{t('สามารถ copy API Key ได้จากด้านล่าง แล้วนำไปแทนที่')} <code className="apikey-code-inline">YOUR_API_KEY</code></p>
          </div>
        </div>

        {!signedIn ? (
          <div className="apikey-card">
            <p className="apikey-noauth">{t('กรุณาเข้าสู่ระบบเพื่อดู API Key')}</p>
            <button className="primary-button apikey-signin-btn" type="button" onClick={openLoginPopup}>
              {t('Sign in')}
            </button>
          </div>
        ) : (
          <div className="apikey-card">
            <div className="apikey-card-header">
              <span className="apikey-card-label">{t('API Key')}</span>
              <div className="apikey-card-actions">
                <button
                  className={`apikey-icon-btn${refreshing ? ' is-spinning' : ''}`}
                  type="button"
                  onClick={handleRefresh}
                  disabled={refreshing || profileLoading}
                  title={t('Refresh API Key')}
                  aria-label={t('Refresh API Key')}
                >
                  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10a6 6 0 1 0 1.5-4M4 6v4h4"/>
                  </svg>
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
                : <code>{apiKey ?? '—'}</code>}
            </div>
            {refreshMsg && (
              <div className="apikey-reset-msg">{refreshMsg}</div>
            )}
            <div className="apikey-card-divider" />
            <div className="apikey-reset-section">
              <p className="apikey-reset-hint">
                {t('หากต้องการ Reset API Key ให้ไปที่ Botnoi Dashboard แล้วกลับมากด Refresh')}
              </p>
              <button
                className="apikey-reset-link-btn"
                type="button"
                onClick={handleOpenDashboard}
              >
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h4v4M13 3 7 9"/><rect x="2" y="7" width="6" height="7" rx="1"/>
                </svg>
                {t('ไปที่ Botnoi Dashboard')}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
