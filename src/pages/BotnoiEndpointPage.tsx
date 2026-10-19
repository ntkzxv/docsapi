import Icon from '../components/Icon'
import EndpointRoute from '../components/EndpointRoute'
import type { ReactNode } from 'react'
import { BOTNOI_API_BASE_URL } from '../data/botnoiEndpoints'
import type { BotnoiEndpoint } from '../types/botnoiEndpoint'
import { useLanguage } from '../functions/LanguageProvider'

function Table({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  const { t } = useLanguage()
  return <div className="endpoint-table-wrap"><table><thead><tr>{columns.map(column => <th key={column}>{t(column)}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}`}>
    {cellIndex === 0 && columns[0] === 'Status' ? <strong className={`response-status ${Number(cell) < 300 ? 'success' : Number(cell) < 500 ? 'unauthorized' : 'forbidden'}`}>{cell}</strong> : cellIndex === 0 && ['Name', 'Type', 'Shape'].includes(columns[cellIndex] ?? '') ? <code>{cell}</code> : typeof cell === 'string' ? t(cell) : cell}
  </td>)}</tr>)}</tbody></table></div>
}

interface BotnoiEndpointPageProps {
  endpoint: BotnoiEndpoint | undefined
  onTry: (() => void) | null
  markdownCopied: boolean
  onCopyMarkdown: () => void
}

export default function BotnoiEndpointPage({ endpoint, onTry, markdownCopied, onCopyMarkdown }: BotnoiEndpointPageProps) {
  const { t } = useLanguage()
  if (!endpoint) return null

  return <article className="endpoint-docs">
    <div className="endpoint-docs-title-row"><h1>{t(endpoint.title)}</h1><button className="markdown-copy-button" onClick={onCopyMarkdown}><Icon name="copy" width="15" height="15"/>{t(markdownCopied ? 'Copied!' : 'Copy as Markdown')}</button></div>
    {endpoint.description && <p className="endpoint-docs-description">{t(endpoint.description)}</p>}
    {endpoint.method === 'POST' && onTry && <aside className="endpoint-try-group"><div><h2>{t('ทดลองใช้ endpoint นี้')}</h2><p>{t('ส่งคำขอไปยัง Botnoi API จริง งานสร้างสื่ออาจหัก coin หรือ credit ตามเงื่อนไขของ API')}</p></div><button className="endpoint-launch-button" onClick={onTry}><span>Try it on <strong>Botnoi</strong></span><Icon name="arrow" width="17" height="17"/></button></aside>}
    <section className="endpoint-docs-section"><h2>{t('Endpoint')}</h2><EndpointRoute method={endpoint.method} url={`${BOTNOI_API_BASE_URL}${endpoint.path}`}/></section>
    <section className="endpoint-docs-section"><h2>{t('Auth')}</h2><p>{t(endpoint.auth ? 'Authentication required.' : 'No authentication required.')}</p></section>
    <section className="endpoint-docs-section"><h2>{t('Parameters')}</h2>{endpoint.parameters.length ? <Table columns={['Name', 'In', 'Required', 'Type', 'Description']} rows={endpoint.parameters.map(parameter => [parameter.name, parameter.in, parameter.required ? 'Yes' : 'No', parameter.type, parameter.description])}/> : <p>{t('No parameters.')}</p>}</section>
    <section className="endpoint-docs-section"><h2>{t('Request Body')}</h2>{endpoint.requestBody ? <>
      <Table columns={['Required', 'Content-Type', 'Shape']} rows={[[endpoint.requestBody.required ? 'Yes' : 'No', endpoint.requestBody.contentType, endpoint.requestBody.shape]]}/>
      {endpoint.requestBody.fields && endpoint.requestBody.fields.length > 0 && <Table columns={['Name', 'Type', 'Required', 'Description']} rows={endpoint.requestBody.fields.map(field => [field.name, field.type, field.required ? 'Yes' : 'No', field.description])}/>}
    </> : <p>{t('No request body.')}</p>}</section>
    <section className="endpoint-docs-section"><h2>{t('Responses')}</h2><Table columns={['Status', 'Description', 'Content-Type', 'Shape']} rows={endpoint.responses.map(response => [String(response.status), response.description, response.contentType, response.shape])}/>
      {endpoint.responses.filter(response => response.example).map(response => <div key={response.status}><h3 className="endpoint-example-title">{t('Example Response')} ({response.status})</h3><pre className="endpoint-example">{response.example}</pre></div>)}
    </section>
  </article>
}
