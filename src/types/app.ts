import type { ReactNode } from 'react'

export type EndpointMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type EndpointKind = 'botnoi' | 'model'

export interface EndpointItem {
  id?: string
  botnoiId?: string
  kind?: EndpointKind
  method: EndpointMethod
  name: string
  path?: string
  searchKeywords?: string
}

export interface EndpointGroup {
  name: string
  items: EndpointItem[]
}

export interface RequestPreview {
  [key: string]: unknown
}

export interface InitialVideoForm {
  prompt: string
  duration: string
  resolution: string
  aspect_ratio: string
  generate_audio: boolean
}

export interface UploadedMedia {
  name: string
  data: string
}

export interface ModelFormField {
  name: string
  label: string
  kind: 'textarea' | 'text' | 'number' | 'select' | 'boolean' | 'json'
  placeholder?: string
  required?: boolean
  optional?: boolean
  min?: number
  max?: number
  step?: string
  defaultValue?: string | boolean
  valueType?: 'string' | 'number'
  options?: string[]
}

export interface EndpointDoc {
  title: string
  method: EndpointMethod
  path?: string
  description?: string
  scopeNote?: string
  sourceUrl?: string
  hideAttribution?: boolean
  available?: boolean
  body?: {
    contentType: string
    shape: string
    fields: [name: string, type: string, required: string, description: string][]
  }
  formFields?: ModelFormField[]
  parameters?: [name: string, location: string, required: string, type: string, description: string][]
  responses?: [status: string, description: string, shape: string][]
  example?: unknown
  resultPath?: string
  statusNote?: string
}

export type ChoiceOption = [value: string, label: ReactNode]
