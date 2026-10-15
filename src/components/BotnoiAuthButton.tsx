import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import Icon from './Icon'

const BOTNOI_LOGIN_URL = 'https://voice.botnoi.ai/app-login'
const TOKEN_KEY = '_bn_token'
interface AuthProfile {
  email: string
  name: string
}

interface AuthContextValue {
  signedIn: boolean
  profile: AuthProfile | null
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
    return { email, name }
  } catch {
    return null
  }
}

export function BotnoiAuthProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(() => Boolean(localStorage.getItem(TOKEN_KEY)))
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const popupRef = useRef<Window | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (savedToken) fetchProfile(savedToken).then(setProfile)

    const onMessage = (event: MessageEvent<{ type?: string; token?: unknown }>) => {
      if (event.origin !== new URL(BOTNOI_LOGIN_URL).origin) return
      if (event.source !== popupRef.current) return
      if (event.data?.type !== 'BOTNOI_AUTH_SUCCESS' || typeof event.data.token !== 'string' || !event.data.token) return

      const token = event.data.token
      localStorage.setItem(TOKEN_KEY, token)
      setSignedIn(true)
      fetchProfile(token).then(setProfile)
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
  }

  return <AuthContext.Provider value={{ signedIn, profile, openLoginPopup, signOut }}>{children}</AuthContext.Provider>
}

export default function BotnoiAuthButton({ theme, onToggleTheme }: { theme: 'dark' | 'light'; onToggleTheme: () => void }) {
  const { signedIn, profile, openLoginPopup, signOut } = useBotnoiAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const handleSignOut = () => {
    signOut()
    setMenuOpen(false)
  }

  const displayName = profile?.name || 'Botnoi account'
  return <>
    <div className="auth-menu-wrap" ref={menuRef}>
      <button className="sign-in-link auth-trigger auth-account-trigger" type="button" onClick={() => setMenuOpen(open => !open)} aria-haspopup="true" aria-expanded={menuOpen} aria-label={signedIn ? `Account: ${displayName}` : 'Open account menu'} title={signedIn ? displayName : 'Account'}>
        <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17" fill="none"><circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M4.5 16c.5-2.5 2.5-4 5.5-4s5 1.5 5.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
        <span className="sign-in-link-label">{signedIn ? displayName : 'Sign in'}</span><svg className="auth-chevron" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {menuOpen && <div className="auth-menu" aria-label="Account menu">
        <div className="auth-menu-account">
          <strong>{signedIn ? displayName : 'Botnoi account'}</strong>
          {signedIn && profile?.email ? <span>{profile.email}</span> : !signedIn && <span>Sign in or change your appearance</span>}
        </div>
        <div className="auth-menu-primary-actions">
          {signedIn ? <a className="auth-menu-back" href="https://voice.botnoi.ai" target="_blank" rel="noopener noreferrer">
              <span className="auth-menu-indicator" aria-hidden="true" />
              <span>Back to Botnoi Voice</span>
              <svg className="auth-menu-external-icon" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none"><path d="M9 3h4v4M13 3 7 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a> : <button className="auth-menu-back auth-menu-signin" type="button" onClick={() => { openLoginPopup(); setMenuOpen(false) }}>
              <span className="auth-menu-indicator" aria-hidden="true" />
              <span>Sign in to your account</span>
            </button>}
          <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} trailingIcon />
        </div>
        {signedIn && <button className="auth-menu-signout" type="button" onClick={handleSignOut}>
          <span className="auth-menu-indicator" aria-hidden="true" />
          <svg aria-hidden="true" viewBox="0 0 16 16" width="16" height="16" fill="none"><path d="M7 3.5H4.25A1.25 1.25 0 0 0 3 4.75v6.5a1.25 1.25 0 0 0 1.25 1.25H7M9 5l3 3-3 3M12 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="auth-menu-signout-label">Sign out</span>
        </button>}
      </div>}
    </div>
  </>
}

function ThemeToggle({ theme, onToggleTheme, trailingIcon = false }: { theme: 'dark' | 'light'; onToggleTheme: () => void; trailingIcon?: boolean }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark'
  return <button className="theme-toggle" type="button" aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`} onClick={onToggleTheme}>
    {trailingIcon ? <>
      <span className="auth-menu-indicator" aria-hidden="true" />
      <span className="auth-menu-theme-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} width="16" height="16" />
    </> : <>
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} width="16" height="16" />
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </>}
  </button>
}
