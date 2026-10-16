import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from './Icon'
import { useLanguage } from '../functions/LanguageProvider'

const BOTNOI_LOGIN_URL = 'https://voice.botnoi.ai/app-login'
const TOKEN_KEY = '_bn_token'
interface AuthProfile {
  email: string
  name: string
  uid: string | null
  avatarUrl: string | null
  points: number | null
  coinVoicebot: number | null
}

interface AuthContextValue {
  signedIn: boolean
  profile: AuthProfile | null
  profileLoading: boolean
  refreshProfile: () => Promise<void>
  openLoginPopup: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useBotnoiAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useBotnoiAuth must be used inside BotnoiAuthProvider')
  return context
}

async function fetchProfile(token: string): Promise<AuthProfile | null> {
  try {
    const base = import.meta.env.DEV ? '/api-voice/api' : 'https://api-voice.botnoi.ai/api'
    const response = await fetch(`${base}/dashboard/get_profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return null
    const json = await response.json()
    const data = json.data
    if (!data) return null
    const email = data.email ?? ''
    const name = data.username ?? data.username_id ?? email.split('@')[0] ?? ''
    const rawUid = data.uid ?? data.user_id ?? data.userId ?? data.user_uid ?? data.uuid ?? data.id ?? data.username_id
    const uid = typeof rawUid === 'string' || typeof rawUid === 'number' ? String(rawUid).trim() : ''
    const rawAvatarUrl = data.image ?? data.avatar_url ?? data.profile_image_url ?? data.profile_image ?? data.profile_pic ?? data.profile_photo ?? data.picture_url ?? data.picture ?? data.avatar ?? data.image_url
    const avatarUrl = typeof rawAvatarUrl === 'string' && rawAvatarUrl.trim() ? rawAvatarUrl.trim() : null
    const rawPoints = data.current_point ?? data.point ?? data.points ?? data.credits
    const points = typeof rawPoints === 'number' || (typeof rawPoints === 'string' && rawPoints.trim() !== '')
      ? Number(rawPoints)
      : null
    const rawCoinVoicebot = data.coin_voicebot
    const coinVoicebot = typeof rawCoinVoicebot === 'number' || (typeof rawCoinVoicebot === 'string' && rawCoinVoicebot.trim() !== '')
      ? Number(rawCoinVoicebot)
      : null
    return {
      email,
      name,
      uid: uid || null,
      avatarUrl,
      points: points !== null && Number.isFinite(points) ? points : null,
      coinVoicebot: coinVoicebot !== null && Number.isFinite(coinVoicebot) ? coinVoicebot : null,
    }
  } catch {
    return null
  }
}

export function BotnoiAuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const popupRef = useRef<Window | null>(null)

  const refreshProfile = async (): Promise<void> => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    setProfileLoading(true)
    try {
      const refreshedProfile = await fetchProfile(token)
      if (refreshedProfile) setProfile(refreshedProfile)
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) fetchProfile(savedToken).then(setProfile).finally(() => setProfileLoading(false))

    const onMessage = (event: MessageEvent<{ type?: string; token?: unknown }>) => {
      if (event.origin !== new URL(BOTNOI_LOGIN_URL).origin) return
      if (event.source !== popupRef.current) return
      if (event.data?.type !== 'BOTNOI_AUTH_SUCCESS' || typeof event.data.token !== 'string' || !event.data.token) return

      const token = event.data.token
      localStorage.setItem(TOKEN_KEY, token)
      setSignedIn(true)
      setProfileLoading(true)
      fetchProfile(token).then(setProfile).finally(() => setProfileLoading(false))
      popupRef.current?.close()
      popupRef.current = null
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const openLoginPopup = (): void => {
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.focus()
      return
    }
    const width = 480
    const height = 640
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2
    popupRef.current = window.open(
      BOTNOI_LOGIN_URL,
      'botnoi_login',
      `width=${width},height=${height},left=${left},top=${top},resizable=no,scrollbars=yes`,
    )
  }

  const signOut = (): void => {
    localStorage.removeItem(TOKEN_KEY)
    setSignedIn(false)
    setProfile(null)
    setProfileLoading(false)
  }

  return <AuthContext.Provider value={{ signedIn, profile, profileLoading, refreshProfile, openLoginPopup, signOut }}>{children}</AuthContext.Provider>
}

export default function BotnoiAuthButton({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const { signedIn, profile, profileLoading, refreshProfile, openLoginPopup, signOut } = useBotnoiAuth()
  const { language, setLanguage, t } = useLanguage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null)
  const [uidCopied, setUidCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | null>(null)

  const closeMenu = () => {
    setMenuOpen(false)
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => {
      setMenuMounted(false)
      closeTimer.current = null
    }, 160)
  }

  const toggleMenu = () => {
    if (menuOpen) {
      closeMenu()
      return
    }
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
    setMenuMounted(true)
    requestAnimationFrame(() => setMenuOpen(true))
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && menuOpen) closeMenu()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current)
  }, [])

  const handleSignOut = () => {
    signOut()
    closeMenu()
  }

  const copyUid = async () => {
    if (!profile?.uid) return
    try {
      await navigator.clipboard.writeText(profile.uid)
      setUidCopied(true)
      window.setTimeout(() => setUidCopied(false), 1500)
    } catch {
      setUidCopied(false)
    }
  }

  const displayName = profile?.name || 'Botnoi account'
  return <>
    <div className="auth-menu-wrap" ref={menuRef}>
      <button className="sign-in-link auth-trigger auth-account-trigger" type="button" onClick={() => signedIn ? toggleMenu() : openLoginPopup()} aria-haspopup={signedIn ? 'true' : undefined} aria-expanded={signedIn && menuOpen} aria-label={signedIn ? `${t('Account')}: ${displayName}` : t('Sign in')} title={signedIn ? displayName : t('Sign in')}>
        {signedIn && profile?.avatarUrl && failedAvatarUrl !== profile.avatarUrl
          ? <img className="auth-trigger-avatar" src={profile.avatarUrl} alt="" aria-hidden="true" onError={() => setFailedAvatarUrl(profile.avatarUrl)}/>
          : <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17" fill="none"><circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 16c.5-2.5 2.5-4 5.5-4s5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
        <span className="sign-in-link-label">{signedIn ? displayName : t('Sign in')}</span>{signedIn && <svg className="auth-chevron" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </button>
      {signedIn && menuMounted && <div className={`auth-menu${menuOpen ? ' is-open' : ''}`} aria-label={t('Account menu')} aria-hidden={!menuOpen}>
        <div className="auth-menu-account">
          <div className="auth-menu-profile">
            {profile?.avatarUrl && failedAvatarUrl !== profile.avatarUrl
              ? <img className="auth-menu-avatar" src={profile.avatarUrl} alt={`${displayName} profile`} onError={() => setFailedAvatarUrl(profile.avatarUrl)}/>
              : <span className="auth-menu-avatar auth-menu-avatar-fallback" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</span>}
            <div className="auth-menu-identity">
              <strong>{signedIn ? displayName : 'Botnoi account'}</strong>
              {signedIn && <div className="auth-menu-uid-row">
                <span className="auth-menu-uid" title={profile?.uid ? `UID: ${profile.uid}` : undefined}>UID: {profileLoading ? 'Loading…' : profile?.uid ?? 'Unavailable'}</span>
                {profile?.uid && <button className="auth-menu-copy-uid" type="button" onClick={copyUid} aria-label={t(uidCopied ? 'UID copied' : 'Copy UID')} title={t(uidCopied ? 'Copied' : 'Copy UID')}><Icon name="copy" width="14" height="14"/></button>}
              </div>}
            </div>
          </div>
          {signedIn ? <div className="auth-menu-balance-list" aria-label={t('Account balances')}>
            <div className="auth-menu-balance-heading">
              <span>{t('Account balances')}</span>
              <button className="auth-menu-refresh" type="button" onClick={() => void refreshProfile()} disabled={profileLoading} aria-label={t('Refresh account data')} title={t('Refresh account data')}>
                <Icon className={profileLoading ? 'is-refreshing' : undefined} name="refresh" width="15" height="15" />
              </button>
            </div>
            <div className="auth-menu-balance-row"><span>{t('Points')}</span><strong>{profileLoading ? t('Loading…') : profile?.points === null || profile?.points === undefined ? t('Unavailable') : profile.points.toLocaleString()}</strong></div>
            <div className="auth-menu-balance-row"><span>{t('Coins')}</span><strong>{profileLoading ? t('Loading…') : profile?.coinVoicebot === null || profile?.coinVoicebot === undefined ? t('Unavailable') : profile.coinVoicebot.toLocaleString()}</strong></div>
          </div> : <span className="auth-menu-balances">{t('Sign in or change your appearance')}</span>}
        </div>
        <div className="auth-menu-primary-actions">
          {!signedIn && <button className="auth-menu-back auth-menu-signin" type="button" onClick={() => { openLoginPopup(); closeMenu() }}>
              <span className="auth-menu-indicator" aria-hidden="true" />
              <span>{t('Sign in to your account')}</span>
            </button>}
          <div className="auth-menu-preferences">
            <button className="auth-menu-theme-switch" type="button" role="switch" aria-checked={theme === 'light'} aria-label={t(`Switch theme to ${theme === 'dark' ? 'light' : 'dark'}`)} onClick={onToggleTheme}>
              <span className={`auth-menu-switch-track${theme === 'light' ? ' is-on' : ''}`} aria-hidden="true">
                <span className={theme === 'dark' ? 'is-selected' : ''}>{t('Dark')}</span>
                <span className={theme === 'light' ? 'is-selected' : ''}>{t('Light')}</span>
                <span className="auth-menu-switch-thumb" />
              </span>
            </button>
            <button className="auth-menu-language-switch" type="button" role="switch" aria-checked={language === 'th'} aria-label={t(`Switch language to ${language === 'th' ? 'English' : 'Thai'}`)} onClick={() => setLanguage(current => current === 'en' ? 'th' : 'en')}>
              <span className={`auth-menu-switch-track${language === 'th' ? ' is-on' : ''}`} aria-hidden="true">
                <span className={language === 'en' ? 'is-selected' : ''}>EN</span>
                <span className={language === 'th' ? 'is-selected' : ''}>ไทย</span>
                <span className="auth-menu-switch-thumb" />
              </span>
            </button>
          </div>
          {signedIn && <div className="auth-menu-separator" aria-hidden="true" />}
          {signedIn && <a className="auth-menu-back" href="https://voice.botnoi.ai" target="_blank" rel="noopener noreferrer">
            <span className="auth-menu-indicator" aria-hidden="true" />
            <span>{t('Back to Botnoi Voice')}</span>
            <svg className="auth-menu-external-icon" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M9 3h4v4M13 3 7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>}
        </div>
        {signedIn && <button className="auth-menu-signout" type="button" onClick={handleSignOut}>
          <span className="auth-menu-indicator" aria-hidden="true" />
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none"><path d="M7 3.5H4.25A1.25 1.25 0 0 0 3 4.75v6.5a1.25 1.25 0 0 0 1.25 1.25H7M9 5l3 3-3 3M12 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="auth-menu-signout-label">{t('Sign out')}</span>
        </button>}
      </div>}
    </div>
  </>
}
