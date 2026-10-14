import Icon from '../components/Icon'

function Table({ columns, rows }) {
  return <div className="endpoint-table-wrap"><table><thead><tr>{columns.map(column => <th key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${row[0]}-${index}`}>{row.map((cell, cellIndex) => <td key={`${cellIndex}`}>
    {cellIndex === 0 && columns[0] === 'Status' ? <strong className={`response-status ${cell < 300 ? 'success' : cell < 500 ? 'unauthorized' : 'forbidden'}`}>{cell}</strong> : cellIndex === 0 && ['Name', 'Type', 'Shape'].includes(columns[cellIndex]) ? <code>{cell}</code> : cell}
  </td>)}</tr>)}</tbody></table></div>
}

export default function BotnoiEndpointPage({ endpoint, onTry, markdownCopied, onCopyMarkdown }) {
  if (!endpoint) return null

  return <article className="endpoint-docs">
    <div className="endpoint-docs-title-row"><h1>{endpoint.title}</h1><button className="markdown-copy-button" onClick={onCopyMarkdown}><Icon name="copy" width="15" height="15"/>{markdownCopied ? 'Copied!' : 'Copy as Markdown'}</button></div>
    {endpoint.description && <p className="endpoint-docs-description">{endpoint.description}</p>}
    {endpoint.method === 'POST' && onTry && <aside className="endpoint-try-group"><div><h2>ทดลองใช้ endpoint นี้</h2><p>กรอกข้อมูลและดูตัวอย่าง Request ได้ โดยยังไม่ส่งข้อมูลไปยัง API จริง</p></div><button className="endpoint-launch-button" onClick={onTry}>Try it <Icon name="arrow" width="17" height="17"/></button></aside>}
    <section className="endpoint-docs-section"><h2>Auth</h2><p>{endpoint.auth ? 'Authentication required.' : 'No authentication required.'}</p></section>
    <section className="endpoint-docs-section"><h2>Parameters</h2>{endpoint.parameters.length ? <Table columns={['Name', 'In', 'Required', 'Type', 'Description']} rows={endpoint.parameters.map(parameter => [parameter.name, parameter.in, parameter.required ? 'Yes' : 'No', parameter.type, parameter.description])}/> : <p>No parameters.</p>}</section>
    <section className="endpoint-docs-section"><h2>Request Body</h2>{endpoint.requestBody ? <>
      <Table columns={['Required', 'Content-Type', 'Shape']} rows={[[endpoint.requestBody.required ? 'Yes' : 'No', endpoint.requestBody.contentType, endpoint.requestBody.shape]]}/>
      {endpoint.requestBody.fields?.length > 0 && <Table columns={['Name', 'Type', 'Required', 'Description']} rows={endpoint.requestBody.fields.map(field => [field.name, field.type, field.required ? 'Yes' : 'No', field.description])}/>}
    </> : <p>No request body.</p>}</section>
    <section className="endpoint-docs-section"><h2>Responses</h2><Table columns={['Status', 'Description', 'Content-Type', 'Shape']} rows={endpoint.responses.map(response => [String(response.status), response.description, response.contentType, response.shape])}/>
      {endpoint.responses.filter(response => response.example).map(response => <div key={response.status}><h3 className="endpoint-example-title">Example Response ({response.status})</h3><pre className="endpoint-example">{response.example}</pre></div>)}
    </section>
  </article>
}
