import Icon from '../components/Icon'
import { getModelCatalog, type ModelCategory } from '../data/modelCatalog'
import type { EndpointGroup, EndpointItem } from '../types/app'
import { useLanguage } from '../functions/LanguageProvider'

interface CategoryPageProps {
  category: ModelCategory
  endpointGroups: EndpointGroup[]
  onSelectEndpoint: (item: EndpointItem) => void
}

const categoryCopy: Record<ModelCategory, { title: string; description: string; icon: 'video' | 'image' }> = {
  'video-generation': { title: 'Video generation', description: 'Compare video models and open the API that fits your workflow.', icon: 'video' },
  'image-generation': { title: 'Image generation', description: 'Explore image models for text-to-image and image editing.', icon: 'image' },
  'talking-avatars': { title: 'Talking avatars', description: 'Create expressive presenters with image and audio driven video models.', icon: 'video' },
}

export default function CategoryPage({ category, endpointGroups, onSelectEndpoint }: CategoryPageProps) {
  const { t } = useLanguage()
  const copy = categoryCopy[category]
  const models = getModelCatalog(endpointGroups).filter(model => model.category === category)

  return <main className="category-page">
    <section className="category-heading">
      <span className="category-heading-icon"><Icon name={copy.icon} width="23" height="23"/></span>
      <div><h1>{t(copy.title)}</h1><p>{t(copy.description)}</p></div>
      <span className="category-model-count">{models.length} {t('models')}</span>
    </section>
    <section className="category-models" aria-label={t('Models')}>
      {models.map(model => <button key={`${model.groupName}-${model.item.id ?? model.item.name}`} className="category-model-card" disabled={model.item.kind === 'model'} onClick={() => onSelectEndpoint(model.item)}>
        <span className="category-model-main"><strong>{model.title}</strong><span>{t(model.description)}</span></span>
        <span className={`category-model-action ${model.item.kind === 'model' ? 'is-waiting' : ''}`}>{model.item.kind === 'model' ? 'WAIT' : t('Open API')}{model.item.kind !== 'model' && <Icon name="arrow" width="15" height="15"/>}</span>
      </button>)}
    </section>
  </main>
}
