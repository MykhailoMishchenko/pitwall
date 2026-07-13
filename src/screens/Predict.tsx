// inputs {фид вопросов Predict + i18n + наш анализ}, does {экран 06: вопросы, имплайд, P(модель), наш пик + EV, boost-панель}, returns {Predict}
import { useMemo, useState } from 'react'
import { usePredictAnalysis, usePredictI18n, usePredictIndex, usePredictRound, type PredictAnalysis, type PredictI18n, type PredictQAnalysis, type PredictQuestion } from '../lib/api'
import { Lbl, Panel, Placeholder } from '../components/ui'

const norm = (s: string) => s.trim().replace(/\s+/g, ' ')
const convChip: Record<string, string> = { high: 'g', med: 'y', low: 'n' }
const convUa: Record<string, string> = { high: 'ВИСОКА', med: 'СЕРЕДНЯ', low: 'НИЗЬКА' }

// Points обратно пропорциональны вероятности → имплайд ∝ 1/Points, нормируем внутри вопроса
function withImplied(q: PredictQuestion) {
  const inv = q.Options.map((o) => ({ o, w: 1 / Math.max(0.5, Number(o.Points) || 1) }))
  const sum = inv.reduce((s, x) => s + x.w, 0) * (q.Config.ChoiceLimit || 1)
  return q.Options
    .map((o) => ({ ...o, implied: Math.round((1 / Math.max(0.5, Number(o.Points) || 1) / sum) * 1000) / 10 }))
    .sort((a, b) => b.implied - a.implied)
}

function Question({ q, i18n, qa }: { q: PredictQuestion; i18n?: PredictI18n; qa?: PredictQAnalysis }) {
  const opts = useMemo(() => withImplied(q), [q])
  const textUa = i18n?.questions[norm(q.Text)] ?? q.Text
  const subUa = q.SubText ? (i18n?.subtexts[norm(q.SubText)] ?? q.SubText) : ''
  const optUa = (v: string) => i18n?.options[norm(v)] ?? v
  const picks = new Set(qa?.pickIds ?? [])
  // ставим наши пики наверх, дальше по имплайду
  const ordered = qa ? [...opts].sort((a, b) => (picks.has(b.Id) ? 1 : 0) - (picks.has(a.Id) ? 1 : 0) || b.implied - a.implied) : opts
  const pickEv = qa?.pickIds
    .map((id) => { const o = q.Options.find((x) => x.Id === id); const p = qa.probs[String(id)]; return o && p != null ? p * Number(o.Points) : null })
    .filter((x): x is number => x != null)
  const evText = pickEv && pickEv.length ? pickEv.map((e) => e.toFixed(1)).join(' + ') : null

  return (
    <Panel>
      <Lbl right={<span className="chip n">{q.Config.ChoiceLimit > 1 ? `ВИБІР ${q.Config.ChoiceLimit}` : 'ОДИН ВИБІР'}</span>}>Q{q.No} · {textUa.toUpperCase()}</Lbl>
      {subUa && <p className="sub" style={{ fontSize: 12, marginBottom: 12 }}>{subUa}</p>}
      <div className="tw"><table>
        <thead><tr><th>ВАРІАНТ</th><th className="tr">ОЧКИ ГРИ</th><th className="tr">ІМПЛАЙД</th><th className="tr">P(МОДЕЛЬ)</th></tr></thead>
        <tbody>
          {ordered.slice(0, 8).map((o) => {
            const isPick = picks.has(o.Id)
            const my = qa?.probs[String(o.Id)]
            const myPct = my != null ? Math.round(my * 100) : null
            const edge = myPct != null ? myPct - o.implied : null
            return (
              <tr key={o.Id} style={isPick ? { background: 'linear-gradient(90deg,rgba(46,230,168,.10),transparent)' } : undefined}>
                <td>{optUa(o.Value)}{isPick && <span className="chip g" style={{ marginLeft: 8 }}>НАШ ПІК</span>}</td>
                <td className="num tr">{o.Points}</td>
                <td className="num tr" style={{ color: 'var(--dim)' }}>{o.implied}%</td>
                <td className="num tr" style={{ color: myPct == null ? 'var(--faint)' : edge && edge > 0 ? 'var(--green)' : 'var(--text)' }}>{myPct == null ? '—' : `${myPct}%`}</td>
              </tr>
            )
          })}
        </tbody>
      </table></div>
      {qa && (
        <div style={{ marginTop: 12, borderLeft: '2px solid var(--purple)', paddingLeft: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
            <span className={`chip ${convChip[qa.conviction] ?? 'n'}`}>ВПЕВНЕНІСТЬ {convUa[qa.conviction] ?? qa.conviction}</span>
            {evText && <span className="chip p">EV {evText}</span>}
          </div>
          <p className="sub" style={{ fontSize: 12.5 }}>{qa.note}</p>
        </div>
      )}
    </Panel>
  )
}

export default function Predict() {
  const { data: idx } = usePredictIndex()
  const { data: i18n } = usePredictI18n()
  const rounds = idx?.rounds ?? []
  const [sel, setSel] = useState<number | undefined>(undefined)
  const round = sel ?? rounds[0]
  const { data } = usePredictRound(round)
  const { data: analysis } = usePredictAnalysis(round)

  const qaFor = (id: number): PredictQAnalysis | undefined => analysis?.questions[String(id)]

  return (
    <section className="screen">
      <div className="shead">
        <span className="rno">06 / PREDICT</span>
        <span className="chip n">BOOST 3/3</span>
        {rounds.length > 1 && (
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            {rounds.map((r) => (
              <button key={r} onClick={() => setSel(r)} className={`chip ${r === round ? 'p' : 'n'}`} style={{ cursor: 'pointer', border: 0 }}>
                {r === 25 ? 'СЕЗОН' : `R${r}`}
              </button>
            ))}
          </span>
        )}
      </div>
      <p className="sub" style={{ marginBottom: 14 }}>
        Очки гри обернено пропорційні ймовірності → імплайд рахується з фіда. EV = P(модель) × очки; наш пік зелений, коли P(модель) вище імплайду.
      </p>
      {analysis?.boost && (
        <Panel hot style={{ marginBottom: 14 }}>
          <Lbl right={<span className={`chip ${analysis.boost.recommendation === 'hold' ? 'n' : 'p'}`}>{analysis.boost.recommendation === 'hold' ? 'ТРИМАТИ 3/3' : 'ПАЛИТИ'}</span>}>BOOST · РЕКОМЕНДАЦІЯ</Lbl>
          <p className="sub" style={{ fontSize: 12.5 }}>{analysis.boost.note}</p>
        </Panel>
      )}
      {!round && <Placeholder title="ПИТАННЯ ВІКЕНДУ" text="Гоночний раунд ще не відкрито на f1predict." chip="ЧЕКАЄМО ВІДКРИТТЯ" />}
      {round && data && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {data.questions.map((q) => <Question key={q.Id} q={q} i18n={i18n} qa={qaFor(q.Id)} />)}
        </div>
      )}
    </section>
  )
}
