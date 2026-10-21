import Icon from '../components/Icon'
import EndpointSearch from '../components/EndpointSearch'
import botnoiLogo from '../assets/botnoi_logo.png'
import type { EndpointGroup, EndpointItem } from '../types/app'
import type { ModelCategory } from '../data/modelCatalog'
import { useLanguage } from '../functions/LanguageProvider'

interface HomePageProps {
  endpointGroups: EndpointGroup[]
  onSelectEndpoint: (item: EndpointItem) => void
  onOpenCategory: (category: ModelCategory) => void
}

const featured = [
  { category: 'video-generation' as const, label: 'Video generation', detail: 'Create videos with Seedance 2.5 or Seedance 2.0.', icon: 'video' as const },
  { category: 'image-generation' as const, label: 'Image generation', detail: 'Turn a prompt into an image with SeeDream or GPT Image.', icon: 'image' as const },
  { category: 'talking-avatars' as const, label: 'Talking avatars', detail: 'Create a presenter from an image and voice track.', icon: 'video' as const },
]

export default function HomePage({ endpointGroups, onSelectEndpoint, onOpenCategory }: HomePageProps) {
  const { t } = useLanguage()

  return <main className="home-page">
    <section className="home-hero">
      <div className="home-hero-copy">
        <h1>{t('One place for every AI workflow.')}</h1>
        <p>{t('Explore image, video, and avatar APIs. Choose a model to read its docs or open a ready-to-use request form.')}</p>
        <div className="home-hero-actions">
          <EndpointSearch endpointGroups={endpointGroups} onSelectEndpoint={onSelectEndpoint} variant="home"/>
        </div>
      </div>
      <div className="home-hero-art" aria-hidden="true">
        <div className="home-orbit home-orbit-one"/><div className="home-orbit home-orbit-two"/>
        <div className="home-core"><img src={botnoiLogo} alt=""/></div>
        <span className="home-node home-node-video"><Icon name="video" width="17" height="17"/></span>
        <span className="home-node home-node-image"><Icon name="image" width="17" height="17"/></span>
        <span className="home-node home-node-api"><Icon name="code" width="17" height="17"/></span>
        <span className="home-orbit-caption">BOTNOI / AI GATEWAY</span>
      </div>
    </section>

    <section className="home-capabilities" id="home-capabilities">
      <div className="home-section-heading"><div><h2>{t('Start with a capability')}</h2><p>{t('Choose what you want to make, then select an endpoint.')}</p></div><span>{t('Available APIs')}</span></div>
      <div className="home-capability-grid">
        {featured.map((item, index) => {
          return <button className={`home-capability-card home-capability-${index + 1}`} key={item.category} onClick={() => onOpenCategory(item.category)}>
            <span className="home-card-icon"><Icon name={item.icon} width="20" height="20"/></span>
            <span className="home-card-copy"><strong>{t(item.label)}</strong><span>{t(item.detail)}</span></span>
            <span className="home-card-link">{t('Open')} <Icon name="arrow" width="15" height="15"/></span>
          </button>
        })}
      </div>
    </section>

    <footer className="home-footer"><span>{t('Built for teams creating with AI.')}</span><span>BOTNOI <i/> AI GATEWAY</span></footer>
  </main>
}
