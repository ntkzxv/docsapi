import { endpoints, sidebarGroups } from './botnoiEndpoints'
import type { EndpointGroup } from '../types/app'

export const botnoiEndpointGroups: EndpointGroup[] = [...sidebarGroups.map(group => ({
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
})), {
  name: 'ACCOUNT & BALANCE',
  items: [{
    id: 'account-balances',
    botnoiId: 'account-balances',
    name: 'Get account token',
    method: endpoints['account-balances'].method,
    path: endpoints['account-balances'].path,
    kind: 'botnoi',
    searchKeywords: 'token point points coin coins account balance profile',
  }],
}]
