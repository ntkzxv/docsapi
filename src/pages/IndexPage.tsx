import { type Dispatch, type ReactNode, type SetStateAction } from 'react'
import botnoiLogo from '../assets/botnoi_logo.png'
import BotnoiAuthButton from '../components/BotnoiAuthButton'
import EndpointSearch from '../components/EndpointSearch'
import { useLanguage } from '../functions/LanguageProvider'
import { type EndpointGroup, type EndpointItem } from '../types/app'
import './IndexPage.css'

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
  isPricingPage?: boolean
  onGoHome: () => void
  onOpenApiKeyPage?: () => void
  onOpenPricingPage?: () => void
  children: ReactNode
}

export default function IndexPage({ endpointGroups, expandedGroups, setExpandedGroups, activeEndpoint, selectEndpoint, sidebarOpen, setSidebarOpen, theme, setTheme, isHome, isApiKeyPage, isPricingPage, onGoHome, onOpenApiKeyPage, onOpenPricingPage, children }: IndexPageProps) {
  const { t } = useLanguage()
  const accountEndpoint = endpointGroups.find(group => group.name === 'ACCOUNT & BALANCE')?.items[0]
  const isCurrentEndpoint = (item: EndpointItem) => !isHome && !isApiKeyPage && !isPricingPage && activeEndpoint.name === item.name
  return <>
    {sidebarOpen && <button className="sidebar-scrim" aria-label={t('Close endpoint menu')} onClick={() => setSidebarOpen(false)}/>}
    <aside className={`endpoint-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <a className="sidebar-brand" href="#/" aria-label={t('Go to home')} aria-current={isHome ? 'page' : undefined} onClick={event => { event.preventDefault(); onGoHome() }}><img src={botnoiLogo} alt="BOTNOI"/><span className="sidebar-brand-copy"><span>API Integration v1.0</span><strong>Botnoi AI Gateway</strong></span></a>
      <nav aria-label={t('API endpoint navigation')}>
        <section className="sidebar-group">
          <button className="sidebar-group-title" aria-expanded={expandedGroups['ACCOUNT API']} onClick={() => setExpandedGroups(current => ({ ...current, 'ACCOUNT API': !current['ACCOUNT API'] }))}><span>{t('ACCOUNT API')}</span><span className={`group-chevron ${expandedGroups['ACCOUNT API'] ? '' : 'collapsed'}`}>⌄</span></button>
          {expandedGroups['ACCOUNT API'] && <div>
            <button className={`endpoint-tab${isApiKeyPage ? ' active' : ''}`} type="button" aria-current={isApiKeyPage ? 'page' : undefined} onClick={onOpenApiKeyPage}><span className="sidebar-method sidebar-method-key">KEY</span><span className="sidebar-endpoint-name">{t('API Key')}</span></button>
            <button className={`endpoint-tab${isPricingPage ? ' active' : ''}`} type="button" aria-current={isPricingPage ? 'page' : undefined} onClick={onOpenPricingPage}><span className="sidebar-method" style={{ background: '#7c3aed', color: '#fff', fontSize: '0.6rem' }}>฿</span><span className="sidebar-endpoint-name">{t('แพ็คเกจราคา')}</span></button>
            {accountEndpoint && <button className={`endpoint-tab${!isHome && !isApiKeyPage && !isPricingPage && activeEndpoint.name === accountEndpoint.name ? ' active' : ''}`} type="button" aria-current={isCurrentEndpoint(accountEndpoint) ? 'page' : undefined} onClick={() => selectEndpoint(accountEndpoint)}><span className="sidebar-method get">GET</span><span className="sidebar-endpoint-name">{t('Token')}</span></button>}
          </div>}
        </section>
        {endpointGroups.filter(group => group.name !== 'ACCOUNT & BALANCE' && group.name !== 'Feature Model' && group.items.some(item => item.kind !== 'model')).map(group => <section className="sidebar-group" key={group.name}>
          <button className="sidebar-group-title" aria-expanded={expandedGroups[group.name]} onClick={() => setExpandedGroups(current => ({ ...current, [group.name]: !current[group.name] }))}><span>{t(group.name)}</span><span className={`group-chevron ${expandedGroups[group.name] ? '' : 'collapsed'}`}>⌄</span></button>
          {expandedGroups[group.name] && <div>{group.items.filter(item => item.kind !== 'model').map(item => <button key={item.name} className={`endpoint-tab ${!isHome && !isApiKeyPage && !isPricingPage && activeEndpoint.name === item.name ? 'active' : ''}`} aria-current={isCurrentEndpoint(item) ? 'page' : undefined} onClick={() => selectEndpoint(item)}><span className={`sidebar-method ${item.method.toLowerCase()}`}>{item.method}</span><span className="sidebar-endpoint-name">{t(item.name)}</span></button>)}</div>}
        </section>)}
      </nav>
    </aside>
    <div className="catalog-main">
      <header className="catalog-topbar">
        <button className="sidebar-menu-button catalog-menu-button" aria-label={t('Open endpoint menu')} onClick={() => setSidebarOpen(true)}><span/><span/><span/></button>
        <span>{t('API Endpoints')}</span>
        <div className="topbar-actions catalog-topbar-actions">
          <EndpointSearch endpointGroups={endpointGroups} onSelectEndpoint={selectEndpoint}/>
          <BotnoiAuthButton theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        </div>
      </header>
      {children}
    </div>
  </>
}