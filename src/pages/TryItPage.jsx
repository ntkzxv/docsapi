import Icon from '../components/Icon'

export default function TryItPage({ activeEndpoint, theme, onBack, onToggleTheme, children }) {
  return <div className="try-main">
    <header className="topbar">
      <button className="back-button" onClick={onBack}><Icon name="back"/>Back</button>
      <span className="header-divider"/>
      <div className="page-identity"><span className="method">{activeEndpoint.method}</span><h1>{activeEndpoint.name}</h1></div>
      <div className="topbar-actions">
        <button className="theme-toggle" type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={onToggleTheme}><Icon name={theme === 'dark' ? 'sun' : 'moon'} width="17" height="17"/><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
        <a className="sign-in-link" href="https://voice.botnoi.ai" target="_blank" rel="noopener noreferrer" aria-label="Sign in to your account"><span className="sign-in-link-label">Sign in to your account</span><span aria-hidden="true">→</span></a>
      </div>
    </header>
    {children}
  </div>
}
