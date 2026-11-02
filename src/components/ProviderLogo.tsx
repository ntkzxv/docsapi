import byteplusLogo from '../assets/byteplus-icon.svg'
import wavespeedLogo from '../assets/wavespeed-logo.svg'

export type ApiProvider = 'byteplus' | 'wavespeed'

export default function ProviderLogo({ provider }: { provider: ApiProvider }) {
  const isBytePlus = provider === 'byteplus'
  return <img
    className={`provider-logo provider-logo-${provider}`}
    src={isBytePlus ? byteplusLogo : wavespeedLogo}
    alt={`${isBytePlus ? 'BytePlus' : 'WaveSpeed'} logo`}
  />
}
