import { useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import BotnoiAuthButton from '../components/BotnoiAuthButton'
import type { EndpointGroup, EndpointItem } from '../types/app'

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
  children: ReactNode
}

type ModelSearchItem = EndpointItem & { groupName: string }

export default function IndexPage({ endpointGroups, expandedGroups, setExpandedGroups, activeEndpoint, selectEndpoint, sidebarOpen, setSidebarOpen, theme, setTheme, children }: IndexPageProps) {
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeSearchIndex, setActiveSearchIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const modelResults = useMemo<ModelSearchItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []
    return endpointGroups.flatMap(group => group.items
      .filter(item => item.kind === 'model')
      .filter(item => `${item.name} ${item.path ?? ''}`.toLowerCase().includes(normalizedQuery))
      .map(item => ({ ...item, groupName: group.name })))
  }, [endpointGroups, query])

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const chooseModel = (item: ModelSearchItem) => {
    setExpandedGroups(current => ({ ...current, [item.groupName]: true }))
    selectEndpoint(item)
    setQuery('')
    setSearchOpen(false)
  }

  return <>
    {sidebarOpen && <button className="sidebar-scrim" aria-label="Close endpoint menu" onClick={() => setSidebarOpen(false)}/>}
    <aside className={`endpoint-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <a className="sidebar-brand" href="#/"><span>API Integration v1.0</span><strong>Botnoi AI Gateway</strong></a>
      <nav aria-label="API endpoints">{endpointGroups.map(group => <section className="sidebar-group" key={group.name}>
        <button className="sidebar-group-title" aria-expanded={expandedGroups[group.name]} onClick={() => setExpandedGroups(current => ({ ...current, [group.name]: !current[group.name] }))}><span>{group.name}</span><span className={`group-chevron ${expandedGroups[group.name] ? '' : 'collapsed'}`}>⌄</span></button>
        {expandedGroups[group.name] && <div>{group.items.map(item => <button key={item.name} className={`endpoint-tab ${activeEndpoint.name === item.name ? 'active' : ''}`} onClick={() => selectEndpoint(item)}><span className={`sidebar-method ${item.kind === 'model' ? 'model' : item.method.toLowerCase()}`}>{item.kind === 'model' ? 'WAIT' : item.method}</span><span className="sidebar-endpoint-name">{item.name}</span></button>)}</div>}
      </section>)}</nav>
    </aside>
    <div className="catalog-main">
      <header className="catalog-topbar"><button className="sidebar-menu-button catalog-menu-button" aria-label="Open endpoint menu" onClick={() => setSidebarOpen(true)}><span/><span/><span/></button><span>API Endpoints</span>
        <div className="topbar-actions catalog-topbar-actions">
        <div className="model-search" ref={searchRef}>
          <div className="model-search-field">
            <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5"/><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            <input type="search" value={query} placeholder="Search models..." aria-label="Search models" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())} aria-controls="model-search-results" aria-activedescendant={searchOpen && modelResults.length ? `model-search-option-${activeSearchIndex}` : undefined} onFocus={() => { if (query.trim()) setSearchOpen(true) }} onChange={event => { setQuery(event.target.value); setActiveSearchIndex(0); setSearchOpen(Boolean(event.target.value.trim())) }} onKeyDown={event => {
              if (event.key === 'Escape') setSearchOpen(false)
              if (!searchOpen || !query.trim() || !modelResults.length) return
              if (event.key === 'ArrowDown') { event.preventDefault(); setActiveSearchIndex(index => Math.min(index + 1, modelResults.length - 1)) }
              if (event.key === 'ArrowUp') { event.preventDefault(); setActiveSearchIndex(index => Math.max(index - 1, 0)) }
              if (event.key === 'Enter') { event.preventDefault(); chooseModel(modelResults[activeSearchIndex] ?? modelResults[0]) }
            }} />
            {query && <button type="button" className="model-search-clear" aria-label="Clear search" onClick={() => { setQuery(''); setSearchOpen(false) }}>×</button>}
          </div>
          {searchOpen && query.trim() && <div className="model-search-results" id="model-search-results" role="listbox" aria-label="Model search results">
            {modelResults.length ? modelResults.map((item, index) => <button type="button" id={`model-search-option-${index}`} className={`model-search-result ${activeSearchIndex === index ? 'is-highlighted' : ''}`} role="option" aria-selected={activeSearchIndex === index} key={`${item.groupName}-${item.name}`} onMouseEnter={() => setActiveSearchIndex(index)} onClick={() => chooseModel(item)}>
              <span className="model-search-result-copy"><strong>{item.name}</strong><small>{item.groupName}</small></span>
              {item.path && <code>{item.path}</code>}
            </button>) : <p className="model-search-empty">No models found</p>}
          </div>}
        </div>
        <BotnoiAuthButton theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} />
        </div>
      </header>
      {children}
    </div>
  </>
}
