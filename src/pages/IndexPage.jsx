import Icon from '../components/Icon'

export default function IndexPage({ endpointGroups, expandedGroups, setExpandedGroups, activeEndpoint, selectEndpoint, sidebarOpen, setSidebarOpen, theme, setTheme, children }) {
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
      <header className="catalog-topbar"><button className="sidebar-menu-button catalog-menu-button" aria-label="Open endpoint menu" onClick={() => setSidebarOpen(true)}><span/><span/><span/></button><span>API Endpoints</span><div className="topbar-actions"><button className="theme-toggle" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} width="17" height="17"/><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button><a className="sign-in-link" href="https://voice.botnoi.ai" target="_blank" rel="noopener noreferrer" aria-label="Sign in to your account"><span className="sign-in-link-label">Sign in to your account</span><span aria-hidden="true">→</span></a></div></header>
      {children}
    </div>
  </>
}
