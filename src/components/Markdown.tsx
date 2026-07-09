// inputs {markdown строка контролируемого формата}, does {лёгкий рендер: заголовки, списки, таблицы, bold}, returns {JSX}
import type { ReactNode } from 'react'

function inline(text: string): ReactNode {
  // **bold** + `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**')) return <b key={i}>{p.slice(2, -2)}</b>
    if (p.startsWith('`')) return <code key={i} style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--purple)' }}>{p.slice(1, -1)}</code>
    return p
  })
}

// склеиваем мягкие переносы: строка с отступом-продолжением приклеивается к предыдущей логической
function unwrap(text: string): string[] {
  const out: string[] = []
  for (const raw of text.split('\n')) {
    if (/^\s{2,}\S/.test(raw) && out.length && out[out.length - 1].trim() !== '' && !raw.trim().startsWith('|')) {
      out[out.length - 1] += ' ' + raw.trim()
    } else {
      out.push(raw)
    }
  }
  return out
}

export function Markdown({ text }: { text: string }) {
  const lines = unwrap(text)
  const out: ReactNode[] = []
  let list: string[] = []
  let table: string[] = []
  const flushList = () => {
    if (!list.length) return
    out.push(<ul key={`ul${out.length}`} style={{ margin: '4px 0 12px', paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
      {list.map((li, i) => <li key={i} style={{ borderLeft: '2px solid var(--line)', paddingLeft: 12, color: 'var(--dim)', fontSize: 13 }}>{inline(li)}</li>)}
    </ul>)
    list = []
  }
  const flushTable = () => {
    if (!table.length) return
    const rows = table.filter((r) => !/^\|[\s:|-]+\|$/.test(r)).map((r) => r.split('|').slice(1, -1).map((c) => c.trim()))
    const [head, ...body] = rows
    out.push(<div key={`tb${out.length}`} className="tw" style={{ margin: '4px 0 14px' }}><table>
      <thead><tr>{head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
      <tbody>{body.map((r, ri) => <tr key={ri}>{r.map((c, ci) => <td key={ci}>{inline(c)}</td>)}</tr>)}</tbody>
    </table></div>)
    table = []
  }
  for (const raw of lines) {
    const l = raw.trimEnd()
    if (l.startsWith('|')) { flushList(); table.push(l); continue }
    flushTable()
    if (l.startsWith('### ')) { flushList(); out.push(<h3 key={out.length} style={{ fontFamily: 'var(--disp)', fontSize: 16, letterSpacing: '.04em', textTransform: 'uppercase', margin: '14px 0 6px' }}>{inline(l.slice(4))}</h3>) }
    else if (l.startsWith('## ')) { flushList(); out.push(<h2 key={out.length} className="lbl" style={{ fontSize: 11, marginTop: 20, marginBottom: 8 }}><span className="tick" />{l.slice(3).toUpperCase()}</h2>) }
    else if (l.startsWith('# ')) { flushList(); out.push(<h1 key={out.length} style={{ fontSize: 22, margin: '4px 0 10px' }}>{inline(l.slice(2))}</h1>) }
    else if (/^\d+\.\s/.test(l)) { list.push(l.replace(/^\d+\.\s/, '')) }
    else if (l.startsWith('- ')) { list.push(l.slice(2)) }
    else if (l === '') { flushList() }
    else { flushList(); out.push(<p key={out.length} style={{ color: 'var(--dim)', fontSize: 13, margin: '0 0 10px', maxWidth: '72ch' }}>{inline(l)}</p>) }
  }
  flushList(); flushTable()
  return <>{out}</>
}
