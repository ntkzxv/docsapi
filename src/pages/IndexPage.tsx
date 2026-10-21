import type { Dispatch, ReactNode, SetStateAction } from 'react'
import BotnoiAuthButton from '../components/BotnoiAuthButton'
import EndpointSearch from '../components/EndpointSearch'
import botnoiLogo from '../assets/botnoi_logo.png'
import type { EndpointGroup, EndpointItem } from '../types/app'
import { useLanguage } from '../functions/LanguageProvider'

interface IndexPageProps {
  endpointGroups: EndpointGroup[]
  expandedGroups: Record<string, boolean>
  setExpandedGroups: Dispatch<SetStateAction<Record<string, boolean>>>
  activeEndpoint: EndpointItem
  selectEndpoint: (item: EndpointItem) => void
  sidebarOpen: boolean
  setSidebarOpen: Dispatch<SetStateAction<boolean>>
  theme: 'dark' | 'light'
  setTheme: Dispatch<SetStateAction<'dark' | 'light'>>
  isHome: boolean
  isApiKeyPage?: boolean
  onOpenApiKeyPage?: () => void
  children: ReactNode
}

export default function IndexPage({ endpointGroups, expandedGroups, setExpandedGroups, activeEndpoint, selectEndpoint, sidebarOpen, setSidebarOpen, theme, setTheme, isHome, isApiKeyPage, onOpenApiKeyPage, children }: IndexPageProps) {
  const { t } = useLanguage()

  return <>
    {sidebarOpen && <button className="sidebar-scrim" aria-label={t('Close endpoint menu')} onClick={() => setSidebarOpen(false)}/>}
    <aside className={`endpoint-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <a className="sidebar-brand" href="#/" aria-label={t('Go to home')}><img src={botnoiLogo} alt="BOTNOI"/><span className="sidebar-brand-copy"><span>API Integration v1.0</span><strong>Botnoi AI Gateway</strong></span></a>
      <nav aria-label={t('API endpoint navigation')}>
        <button
          className={`sidebar-apikey-btn${isApiKeyPage ? ' active' : ''}`}
          type="button"
          onClick={onOpenApiKeyPage}
          aria-label={t('API Key')}
        >
          <svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7.5" cy="13" r="3.5"/><path d="M11 13h6M14 13v-2.5M16.5 13v-2"/></svg>
          <span>{t('API Key')}</span>
        </button>
        {endpointGroups.map(group => <section className="sidebar-group" key={group.name}>
        <button className="sidebar-group-title" aria-expanded={expandedGroups[group.name]} onClick={() => setExpandedGroups(current => ({ ...current, [group.name]: !current[group.name] }))}><span>{t(group.name)}</span><span className={`group-chevron ${expandedGroups[group.name] ? '' : 'collapsed'}`}>⌄</span></button>
        {expandedGroups[group.name] && <div>{group.items.map(item => <button key={item.name} className={`endpoint-tab ${!isHome && activeEndpoint.name === item.name ? 'active' : ''}`} disabled={item.kind === 'model'} onClick={() => { if (item.kind !== 'model') selectEndpoint(item) }}><span className={`sidebar-method ${item.kind === 'model' ? 'model' : item.method.toLowerCase()}`}>{item.kind === 'model' ? 'WAIT' : item.method}</span><span className="sidebar-endpoint-name">{t(item.name)}</span></button>)}</div>}
      </section>)}
      </nav>
    </aside>
    <div className="catalog-main">
      <header className="catalog-topbar"><button className="sidebar-menu-button catalog-menu-button" aria-label={t('Open endpoint menu')} onClick={() => setSidebarOpen(true)}><span/><span/><span/></button><span>{t('API Endpoints')}</span>
        <div className="topbar-actions catalog-topbar-actions">
        <EndpointSearch endpointGroups={endpointGroups} onSelectEndpoint={selectEndpoint}/>
        <BotnoiAuthButton theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        </div>
      </header>
      {children}
    </div>
  </>
}
