import { useLanguage } from '../functions/LanguageProvider'

interface AuthTokenTableProps {
  provider: 'botnoi' | 'wavespeed'
  method: string
  usage?: string
}

export default function AuthTokenTable({ provider, method, usage }: AuthTokenTableProps) {
  const { t } = useLanguage()
  const botnoi = provider === 'botnoi'
  const tokenName = botnoi ? 'Botnoi access token (_bn_token)' : 'WaveSpeedAI API key'
  const source = botnoi ? 'Sign in with Botnoi to get a session token.' : 'Create an API key in your WaveSpeedAI account.'
  const header = botnoi ? 'Authorization: Bearer <BOTNOI_ACCESS_TOKEN>' : 'Authorization: Bearer <WAVESPEED_API_KEY>'
  const purpose = usage ?? (method === 'GET'
    ? botnoi ? 'Read this task status and its generated output.' : 'Read results from the WaveSpeedAI endpoint.'
    : botnoi ? 'Submit this request or start a generation task.' : 'Submit this request to the WaveSpeedAI endpoint.')

  return <div className="endpoint-table-wrap"><table>
    <thead><tr><th>{t('Token')}</th><th>{t('Where to get it')}</th><th>{t('Send it as')}</th><th>{t('What it is used for')}</th></tr></thead>
    <tbody><tr><td><code>{tokenName}</code></td><td>{t(source)}</td><td><code>{header}</code></td><td>{t(purpose)}</td></tr></tbody>
  </table></div>
}
