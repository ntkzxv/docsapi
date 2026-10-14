import BotnoiAuthButton from '../components/BotnoiAuthButton'

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
      <header className="catalog-topbar"><button className="sidebar-menu-button catalog-menu-button" aria-label="Open endpoint menu" onClick={() => setSidebarOpen(true)}><span/><span/><span/></button><span>API Endpoints</span><div className="topbar-actions"><BotnoiAuthButton theme={theme} onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')} /></div></header>
      {children}
    </div>
  </>
}
