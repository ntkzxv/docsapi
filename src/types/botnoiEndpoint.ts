export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface BotnoiParameter {
  name: string
  in: 'path' | 'query' | 'header' | 'body'
  type: string
  required: boolean
  description: string
}

export interface BotnoiResponseRow {
  status: number
  description: string
  contentType: string
  shape: string
  example?: string
}

export interface BotnoiRequestBodyField {
  name: string
  type: string
  required: boolean
  description: string
}

export interface BotnoiRequestBody {
  required: boolean
  contentType: string
  shape: string
  fields?: BotnoiRequestBodyField[]
}

/** Schema used by botnoi-api-docs/src/data/endpoints.ts. */
export interface BotnoiEndpoint {
  id: string
  title: string
  method: HttpMethod
  path: string
  description: string
  auth: boolean
  parameters: BotnoiParameter[]
  requestBody: BotnoiRequestBody | null
  responses: BotnoiResponseRow[]
}

/** Normalized shape consumed by docsapi's existing endpoint detail renderer. */
export interface DocsApiEndpointView {
  id: string
  title: string
  method: HttpMethod
  path: string
  description: string
  auth: boolean
  parameters: [name: string, location: string, required: string, type: string, description: string][]
  body: null | {
    required: string
    contentType: string
    shape: string
    fields: [name: string, type: string, required: string, description: string][]
  }
  responses: [status: string, description: string, shape: string][]
  examples: { status: number; value: string }[]
}
