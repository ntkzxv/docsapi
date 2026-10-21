import { endpoints as botnoiEndpoints } from './botnoiEndpoints'
import { wavespeedModels } from './endpointCatalog'
import type { EndpointGroup, EndpointItem } from '../types/app'

export type ModelCategory = 'video-generation' | 'image-generation' | 'talking-avatars'

export interface ModelEntry {
  item: EndpointItem
  groupName: string
  title: string
  description: string
  category: ModelCategory
}

function categoryFor(groupName: string, name: string): ModelCategory {
  if (groupName === 'Avatar Lip-sync' || /infinitetalk|omnihuman|dreamactor/i.test(name)) return 'talking-avatars'
  if (groupName === 'Image Generation' || groupName === 'GPT Image Studio' || /gpt image|dall-e|seedream/i.test(name)) return 'image-generation'
  return 'video-generation'
}

function titleFor(item: EndpointItem) {
  if (item.kind === 'model') return item.name
  if (item.name === 'GPT Edit image with prompt') return 'GPT Image Edit'
  let title = item.name.replace(/^Create\s+/i, '').replace(/\s+(video|avatar|image)$/i, '')
  if (title === 'GPT Image (Text to Image)') title = 'GPT Image'
  if (title.startsWith('SeeDance ')) title = title.replace(/^SeeDance/, 'Seedance')
  return title
}

export function getModelCatalog(endpointGroups: EndpointGroup[]): ModelEntry[] {
  return endpointGroups.flatMap(group => group.items
    .filter(item => item.method === 'POST')
    .map(item => ({
      item,
      groupName: group.name,
      title: titleFor(item),
      description: (item.botnoiId ? botnoiEndpoints[item.botnoiId]?.description : wavespeedModels[item.name]?.description) ?? 'Open this model API to view its request details.',
      category: categoryFor(group.name, item.name),
    })))
}
