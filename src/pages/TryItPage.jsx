import Icon from '../components/Icon'
import ApiDocsFooter from '../components/ApiDocsFooter'
import BotnoiAuthButton from '../components/BotnoiAuthButton'

export default function TryItPage({ activeEndpoint, theme, onBack, onToggleTheme, children }) {
  return <div className="try-main">
    <header className="topbar">
      <button className="back-button" onClick={onBack}><Icon name="back"/>Back</button>
      <span className="header-divider"/>
      <div className="page-identity"><span className="method">{activeEndpoint.method}</span><h1>{activeEndpoint.name}</h1></div>
      <div className="topbar-actions">
        <BotnoiAuthButton theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </header>
    {children}
    <ApiDocsFooter />
  </div>
}
