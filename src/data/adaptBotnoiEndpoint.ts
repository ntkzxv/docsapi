import type { BotnoiEndpoint, DocsApiEndpointView } from '../types/botnoiEndpoint'

/**
 * Converts the endpoint contract from botnoi-api-docs into the view model
 * currently used by docsapi. Keep this boundary when the docs source is moved.
 */
export function adaptBotnoiEndpoint(endpoint: BotnoiEndpoint): DocsApiEndpointView {
  return {
    id: endpoint.id,
    title: endpoint.title,
    method: endpoint.method,
    path: endpoint.path,
    description: endpoint.description,
    auth: endpoint.auth,
    parameters: endpoint.parameters.map(parameter => [
      parameter.name,
      parameter.in,
      parameter.required ? 'Yes' : 'No',
      parameter.type,
      parameter.description,
    ]),
    body: endpoint.requestBody
      ? {
          required: endpoint.requestBody.required ? 'Yes' : 'No',
          contentType: endpoint.requestBody.contentType,
          shape: endpoint.requestBody.shape,
          fields: (endpoint.requestBody.fields ?? []).map(field => [
            field.name,
            field.type,
            field.required ? 'Yes' : 'No',
            field.description,
          ]),
        }
      : null,
    responses: endpoint.responses.map(response => [
      String(response.status),
      response.description,
      response.shape,
    ]),
    examples: endpoint.responses
      .filter(response => response.example !== undefined)
      .map(response => ({ status: response.status, value: response.example ?? '' })),
  }
}
