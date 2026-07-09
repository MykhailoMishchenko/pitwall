// inputs {league snapshots}, does {экран 07: приватная Predict-лига (соперники + мы) + статус фэнтези-лиги}, returns {League}
import { useState } from 'react'
import { useFantasyLeague, usePredictLeague, type LeagueRow } from '../lib/api'
import { Lbl, Panel } from '../components/ui'

const trendMark = (t?: number) => (t === 2 || t === 3 ? { s: '▲', c: 'var(--green)' } : t === 1 ? { s: '▼', c: 'var(--red)' } : { s: '▬', c: 'var(--faint)' })

function Row({ r, highlight }: { r: LeagueRow; highlight?: 'me' | 'rival' }) {
  const tr = trendMark(r.trend)
  const bg = highlight === 'me' ? 'linear-gradient(90deg,rgba(180,124,255,.12),transparent)' : highlight === 'rival' ? 'linear-gradient(90deg,rgba(255,200,74,.10),transparent)' : undefined
  return (
    <tr style={{ background: bg }}>
      <td className="pos">{r.rank}</td>
      <td><b>{r.team}</b>{r.team !== r.user && <span style={{ color: 'var(--dim)', fontSize: 11.5 }}> · {r.user}</span>}
        {r.account && <span style={{ color: 'var(--faint)', fontSize: 10.5, fontFamily: 'var(--mono)' }}> (акаунт: {r.account})</span>}
        {highlight === 'me' && <span className="chip p" style={{ marginLeft: 8 }}>МИ</span>}
        {r.tag && <span className="chip y" style={{ marginLeft: 8 }}>{r.tag.toUpperCase()}</span>}
      </td>
      <td className="num tr">{r.season}</td>
      <td className="tr" style={{ color: tr.c, width: 24 }}>{tr.s}</td>
    </tr>
  )
}

export default function League() {
  const { data: predict } = usePredictLeague()
  const { data: fantasy } = useFantasyLeague()
  const [tab, setTab] = useState<'predict' | 'fantasy'>('predict')

  return (
    <section className="screen">
      <div className="shead"><span className="rno">07 / ЛІГА</span></div>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', marginBottom: 18 }}>
        {(['predict', 'fantasy'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 0, color: tab === t ? 'var(--text)' : 'var(--dim)', fontFamily: 'var(--disp)', fontSize: 15, letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 16px', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? 'var(--purple)' : 'transparent'}`, marginBottom: -1 }}>
            {t === 'predict' ? 'Predict' : 'Фентезі'}
          </button>
        ))}
      </div>

      {tab === 'predict' && predict && (
        <div className="grid" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
          <Panel>
            <Lbl right={<span className="chip p">{predict.leagueType} · {predict.members} уч.</span>}>{predict.leagueName} · ТАБЛИЦЯ</Lbl>
            <div className="tw"><table>
              <thead><tr><th></th><th>КОМАНДА</th><th className="tr">СЕЗОН</th><th></th></tr></thead>
              <tbody>
                {predict.standings.map((r) => <Row key={r.rank} r={r} />)}
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--faint)', fontFamily: 'var(--mono)', fontSize: 11, padding: '8px 0' }}>· · ·</td></tr>
                <Row r={predict.me} highlight="me" />
              </tbody>
            </table></div>
            {predict.sortNote && <p className="sub" style={{ fontSize: 11, marginTop: 8 }}>Сортування: {predict.sortNote}.</p>}
          </Panel>
          <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
            <Panel hot>
              <Lbl>ОРІЄНТИР · ОБІЙТИ</Lbl>
              <div className="tw"><table><tbody>
                {predict.rivals.map((r) => <Row key={r.rank} r={r} highlight="rival" />)}
              </tbody></table></div>
              <p className="sub" style={{ fontSize: 12.5, marginTop: 8 }}>
                Подзигун — ЛІДЕР ліги за сезон. Ми дебютуємо з R10 з нуля, тому відставання велике; ціль — набирати найбільше очок з кожного нашого туру й дертися вгору.
              </p>
            </Panel>
            <Panel>
              <Lbl>ПОРІВНЯННЯ ПІКІВ · ПІСЛЯ ЛОКА</Lbl>
              <p className="sub" style={{ fontSize: 12.5 }}>
                Після дедлайну сюди підтягнуться відповіді суперників: де вони розійшлися з моделлю і хто мав рацію → прямо в learnings.
              </p>
            </Panel>
          </div>
        </div>
      )}

      {tab === 'fantasy' && fantasy && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Panel>
            <Lbl>СИСТЕМНІ ЛІГИ · РАНГ</Lbl>
            <div className="tw"><table>
              <thead><tr><th>ЛІГА</th><th>ТИП</th><th className="tr">РАНГ</th><th className="tr">УЧАСНИКІВ</th></tr></thead>
              <tbody>
                {fantasy.systemLeagues.map((l) => (
                  <tr key={l.name}><td><b>{l.name}</b></td><td style={{ color: 'var(--dim)' }}>{l.type}</td>
                    <td className="num tr">{l.rank.toLocaleString('uk-UA')}</td><td className="num tr" style={{ color: 'var(--dim)' }}>{l.members.toLocaleString('uk-UA')}</td></tr>
                ))}
              </tbody>
            </table></div>
          </Panel>
          <Panel hot>
            <Lbl>ПРИВАТНА ЛІГА</Lbl>
            <p className="sub" style={{ fontSize: 13 }}>{fantasy.note}</p>
          </Panel>
        </div>
      )}
    </section>
  )
}
