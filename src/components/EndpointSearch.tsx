import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { endpoints as botnoiEndpoints } from '../data/botnoiEndpoints'
import { wavespeedModels } from '../data/endpointCatalog'
import { useLanguage } from '../functions/LanguageProvider'
import type { EndpointGroup, EndpointItem } from '../types/app'

interface EndpointSearchProps {
  endpointGroups: EndpointGroup[]
  onSelectEndpoint: (item: EndpointItem) => void
  variant?: 'topbar' | 'home'
}

type SearchItem = EndpointItem & { groupName: string }

function getSearchDescription(item: SearchItem) {
  const description = item.botnoiId
    ? botnoiEndpoints[item.botnoiId]?.description
    : wavespeedModels[item.name]?.description
  if (description) return description
  return item.method === 'GET' ? 'Check generation result' : 'Generate video'
}

function getSearchTitle(item: SearchItem) {
  if (item.kind === 'model') return item.name
  const title = item.name.replace(/^Create\s+/i, '').replace(/\s+(video|avatar|image)$/i, '')
  if (title === 'GPT Image (Text to Image)') return 'GPT Image'
  if (title.startsWith('SeeDance ')) return title.replace(/^SeeDance/, 'Seedance')
  return title
}

export default function EndpointSearch({ endpointGroups, onSelectEndpoint, variant = 'topbar' }: EndpointSearchProps) {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const results = useMemo<SearchItem[]>(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return []
    return endpointGroups.flatMap(group => group.items
      .filter(item => (item.method !== 'GET' || Boolean(item.searchKeywords)) && `${item.name} ${getSearchTitle({ ...item, groupName: group.name })} ${t(item.name)} ${group.name} ${t(group.name)} ${item.path ?? ''} ${item.method} ${item.searchKeywords ?? ''} ${t(getSearchDescription({ ...item, groupName: group.name }))}`.toLowerCase().includes(normalizedQuery))
      .map(item => ({ ...item, groupName: group.name })))
  }, [endpointGroups, query, t])

  const chooseEndpoint = (item: SearchItem) => {
    if (item.kind === 'model') return
    onSelectEndpoint(item)
    setQuery('')
    setSearchOpen(false)
  }

  const highlightMatch = (text: string): ReactNode => {
    const searchTerm = query.trim()
    if (!searchTerm) return text
    const lowerText = text.toLocaleLowerCase()
    const lowerTerm = searchTerm.toLocaleLowerCase()
    const fragments: ReactNode[] = []
    let cursor = 0
    let matchIndex = lowerText.indexOf(lowerTerm, cursor)
    while (matchIndex !== -1) {
      if (matchIndex > cursor) fragments.push(text.slice(cursor, matchIndex))
      fragments.push(<mark key={matchIndex}>{text.slice(matchIndex, matchIndex + searchTerm.length)}</mark>)
      cursor = matchIndex + searchTerm.length
      matchIndex = lowerText.indexOf(lowerTerm, cursor)
    }
    if (!fragments.length) return text
    if (cursor < text.length) fragments.push(text.slice(cursor))
    return fragments
  }

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  return <div className={`model-search ${variant === 'home' ? 'home-search' : ''}`} ref={searchRef}>
    <div className="model-search-field">
      <svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.5"/><path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      <input type="search" value={query} placeholder={t('Search endpoints...')} aria-label={t('Search endpoints')} aria-autocomplete="list" aria-expanded={searchOpen && Boolean(query.trim())} aria-controls={`endpoint-search-results-${variant}`} aria-activedescendant={searchOpen && results.length ? `endpoint-search-option-${variant}-${activeIndex}` : undefined} onFocus={() => { if (query.trim()) setSearchOpen(true) }} onChange={event => { setQuery(event.target.value); setActiveIndex(0); setSearchOpen(Boolean(event.target.value.trim())) }} onKeyDown={event => {
        if (event.key === 'Escape') setSearchOpen(false)
        if (!searchOpen || !query.trim() || !results.length) return
        if (event.key === 'ArrowDown') { event.preventDefault(); setActiveIndex(index => Math.min(index + 1, results.length - 1)) }
        if (event.key === 'ArrowUp') { event.preventDefault(); setActiveIndex(index => Math.max(index - 1, 0)) }
        if (event.key === 'Enter') { event.preventDefault(); chooseEndpoint(results[activeIndex] ?? results[0]) }
      }}/>
      {query && <button type="button" className="model-search-clear" aria-label={t('Clear search')} onClick={() => { setQuery(''); setSearchOpen(false) }}>×</button>}
    </div>
    {searchOpen && query.trim() && <div className="model-search-results" id={`endpoint-search-results-${variant}`} role="listbox" aria-label={t('Endpoint search results')}>
      {results.length ? results.map((item, index) => <button type="button" id={`endpoint-search-option-${variant}-${index}`} className={`model-search-result ${activeIndex === index ? 'is-highlighted' : ''}`} role="option" aria-selected={activeIndex === index} key={`${item.groupName}-${item.name}`} disabled={item.kind === 'model'} onMouseEnter={() => setActiveIndex(index)} onClick={() => chooseEndpoint(item)}>
        <span className="model-search-result-copy"><strong>{highlightMatch(t(getSearchTitle(item)))}</strong><span className="model-search-result-description"><span>{t(getSearchDescription(item))}</span>{item.kind === 'model' && <em>WAIT</em>}</span></span>
      </button>) : <p className="model-search-empty">{t('No endpoints found')}</p>}
    </div>}
  </div>
}
