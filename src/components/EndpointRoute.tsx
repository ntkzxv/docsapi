import type { EndpointMethod } from '../types/app'

export default function EndpointRoute({ method, url }: { method: EndpointMethod; url: string }) {
  return <div className="endpoint-route-box">
    <span className={`endpoint-method-badge endpoint-method-${method.toLowerCase()}`}>{method}</span>
    <code>{url}</code>
  </div>
}
