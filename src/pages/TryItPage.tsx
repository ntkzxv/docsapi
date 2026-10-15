import Icon from '../components/Icon'
import ApiDocsFooter from '../components/ApiDocsFooter'
import BotnoiAuthButton from '../components/BotnoiAuthButton'
import type { ReactNode } from 'react'
import type { EndpointItem } from '../types/app'
import { useLanguage } from '../functions/LanguageProvider'

interface TryItPageProps {
  activeEndpoint: EndpointItem
  theme: 'dark' | 'light'
  onBack: () => void
  onToggleTheme: () => void
  children: ReactNode
}

export default function TryItPage({ activeEndpoint, theme, onBack, onToggleTheme, children }: TryItPageProps) {
  const { t } = useLanguage()
  return <div className="try-main">
    <header className="topbar">
      <button className="back-button" onClick={onBack}><Icon name="back"/>{t('Back')}</button>
      <span className="header-divider"/>
      <div className="page-identity"><span className="method">{activeEndpoint.method}</span><h1>{t(activeEndpoint.name)}</h1></div>
      <div className="topbar-actions">
        <BotnoiAuthButton theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </header>
    {children}
    <ApiDocsFooter />
  </div>
}
