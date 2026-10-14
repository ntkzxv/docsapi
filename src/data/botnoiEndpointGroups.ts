import { endpoints, sidebarGroups } from './botnoiEndpoints'

export const botnoiEndpointGroups = sidebarGroups.map(group => ({
  name: group.label,
  items: group.items.map(item => {
    const endpoint = endpoints[item.id]
    return {
      id: item.id,
      botnoiId: item.id,
      name: item.label,
      method: item.method ?? endpoint.method,
      path: endpoint.path,
      kind: 'botnoi',
    }
  }),
}))
