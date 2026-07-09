// inputs {структурный превью JSON}, does {сканируемый аналитический рендер: карточки, форма-плитки, тезисы, ходы}, returns {Preview}
import { teamColor } from '../lib/teams'
import { Lbl, Panel } from './ui'

type Tone = 'good' | 'warn' | 'danger' | undefined
type StructuredPreview = {
  meta: { stage?: string; confidence?: string; note?: string }
  trackStats: { label: string; value: string; unit?: string; note?: string; tone?: Tone }[]
  weather: { summary: string; detail: string; risk?: string; rainPct?: number }
  form: { team: string; colorId: string; trend: 'up' | 'down' | 'flat'; headline: string; note: string }[]
  thesis: { text: string; tag?: string }[]
  pickMoves: { title: string; verdict: string; tone?: Tone; note: string }[]
  todo?: string[]
}

const toneClass: Record<string, string> = { good: 'up', warn: 'ye', danger: 'dn' }
const chipClass: Record<string, string> = { good: 'g', warn: 'y', danger: 'r' }
const trend = { up: { s: '▲', c: 'var(--green)' }, down: { s: '▼', c: 'var(--red)' }, flat: { s: '▬', c: 'var(--dim)' } }

export function Preview({ data }: { data: StructuredPreview }) {
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* карточки метрик трассы */}
      <div className="grid g-4">
        {data.trackStats.map((s) => (
          <Panel key={s.label}>
            <Lbl>{s.label}</Lbl>
            <span className={`big num ${s.tone ? toneClass[s.tone] : ''}`}>{s.value}{s.unit && <span style={{ fontSize: 15, marginLeft: 3 }}>{s.unit}</span>}</span>
            {s.note && <p className="sub" style={{ fontSize: 11.5, marginTop: 4 }}>{s.note}</p>}
          </Panel>
        ))}
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        {/* форма-плитки */}
        <Panel>
          <Lbl>ФОРМА · R8–R9</Lbl>
          <div style={{ display: 'grid', gap: 8 }}>
            {data.form.map((f) => (
              <div key={f.team} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', paddingBottom: 8, borderBottom: '1px solid rgba(34,42,53,.5)' }}>
                <span className="tbar" style={{ background: teamColor(f.colorId), height: 30, width: 4, marginTop: 2 }} />
                <span style={{ color: trend[f.trend].c, fontSize: 12, marginTop: 2 }}>{trend[f.trend].s}</span>
                <div style={{ minWidth: 0 }}>
                  <div><b>{f.team}</b> <span style={{ color: 'var(--dim)', fontSize: 12.5 }}>— {f.headline}</span></div>
                  <p className="sub" style={{ fontSize: 12, marginTop: 2 }}>{f.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          {/* погода */}
          <Panel hot>
            <Lbl right={data.weather.rainPct != null ? <span className={`chip ${data.weather.rainPct >= 50 ? 'p' : 'n'}`}>ДОЩ {data.weather.rainPct}%</span> : undefined}>ПОГОДА</Lbl>
            <div className="big" style={{ fontSize: 20 }}>{data.weather.summary}</div>
            <p className="sub" style={{ fontSize: 12.5, marginTop: 6 }}>{data.weather.detail}</p>
            {data.weather.risk && <p className="sub" style={{ fontSize: 12, marginTop: 8, color: 'var(--faint)' }}>{data.weather.risk}</p>}
          </Panel>
          {/* тезисы */}
          <Panel>
            <Lbl>ТЕЗИ</Lbl>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.thesis.map((t, i) => (
                <div key={i} style={{ borderLeft: '2px solid var(--purple)', paddingLeft: 12 }}>
                  {t.tag && <span className="chip n" style={{ marginBottom: 4, display: 'inline-block' }}>{t.tag.toUpperCase()}</span>}
                  <p style={{ color: 'var(--dim)', fontSize: 12.5 }}>{t.text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* ходы по составу */}
      <Panel>
        <Lbl>ХОДИ ПО СКЛАДУ · ЧЕРНЕТКА</Lbl>
        <div className="tw"><table>
          <thead><tr><th>ПІК</th><th>ВЕРДИКТ</th><th>ПРИЧИНА</th></tr></thead>
          <tbody>
            {data.pickMoves.map((m) => (
              <tr key={m.title}>
                <td><b>{m.title}</b></td>
                <td><span className={`chip ${m.tone ? chipClass[m.tone] : 'n'}`}>{m.verdict}</span></td>
                <td style={{ color: 'var(--dim)', fontSize: 12.5 }}>{m.note}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </Panel>

      {data.todo && data.todo.length > 0 && (
        <Panel>
          <Lbl>ЩЕ УТОЧНИТИ · ДО ФІНАЛУ</Lbl>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {data.todo.map((t, i) => <span key={i} className="chip n" style={{ fontSize: 11 }}>{t}</span>)}
          </div>
        </Panel>
      )}
    </div>
  )
}
