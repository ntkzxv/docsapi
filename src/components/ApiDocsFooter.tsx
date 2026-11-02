import { useLanguage } from '../functions/LanguageProvider'

export default function ApiDocsFooter() {
  const { t } = useLanguage()
  return <footer className="api-docs-footer">
    {t('Botnoi Voice API reference · machine index at')} <a href="/llms.txt">/llms.txt</a> · {t('OpenAPI spec at')} <a href="/openapi.json">/openapi.json</a>
  </footer>
}
