// inputs {открытый фид вопросов Predict}, does {экран 06: вопросы раунда, имплайд-вероятность из Points, EV-панель}, returns {Predict}
import { useMemo, useState } from 'react'
import { usePredictI18n, usePredictIndex, usePredictRound, type PredictI18n, type PredictQuestion } from '../lib/api'
import { Lbl, Panel, Placeholder } from '../components/ui'

const norm = (s: string) => s.trim().replace(/\s+/g, ' ')

// Points обратно пропорциональны вероятности → имплайд ∝ 1/Points, нормируем внутри вопроса
function withImplied(q: PredictQuestion) {
  const inv = q.Options.map((o) => ({ o, w: 1 / Math.max(0.5, Number(o.Points) || 1) }))
  const sum = inv.reduce((s, x) => s + x.w, 0) * (q.Config.ChoiceLimit || 1)
  return q.Options
    .map((o) => ({ ...o, implied: Math.round((1 / Math.max(0.5, Number(o.Points) || 1) / sum) * 1000) / 10 }))
    .sort((a, b) => b.implied - a.implied)
}

function Question({ q, i18n }: { q: PredictQuestion; i18n?: PredictI18n }) {
  const opts = useMemo(() => withImplied(q), [q])
  const textUa = i18n?.questions[norm(q.Text)] ?? q.Text
  const subUa = q.SubText ? (i18n?.subtexts[norm(q.SubText)] ?? q.SubText) : ''
  const optUa = (v: string) => i18n?.options[norm(v)] ?? v
  return (
    <Panel>
      <Lbl right={<span className="chip n">{q.Config.ChoiceLimit > 1 ? `ВИБІР ${q.Config.ChoiceLimit}` : 'ОДИН ВИБІР'}</span>}>Q{q.No} · {textUa.toUpperCase()}</Lbl>
      {subUa && <p className="sub" style={{ fontSize: 12, marginBottom: 12 }}>{subUa}</p>}
      <div className="tw"><table>
        <thead><tr><th>ВАРІАНТ</th><th className="tr">ОЧКИ ГРИ</th><th className="tr">ІМПЛАЙД</th><th className="tr">P(МОДЕЛЬ)</th></tr></thead>
        <tbody>
          {opts.slice(0, 8).map((o) => (
            <tr key={o.Id}>
              <td>{optUa(o.Value)}</td>
              <td className="num tr">{o.Points}</td>
              <td className="num tr" style={{ color: 'var(--dim)' }}>{o.implied}%</td>
              <td className="num tr" style={{ color: 'var(--faint)' }}>—</td>
            </tr>
          ))}
        </tbody>
      </table></div>
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
      <p className="sub" style={{ marginBottom: 18 }}>
        Очки гри обернено пропорційні ймовірності → імплайд-ймовірність рахується прямо з фіда.
        EV = P(модель) × очки; порівняння з імплайдом дає перевагу. Колонка P(модель) заповнюється рутиною превʼю.
      </p>
      {!round && <Placeholder title="ПИТАННЯ ВІКЕНДУ" text="Гоночний раунд ще не відкрито на f1predict. Рутина превʼю поллить questions_10 і підхопить питання щойно вони зʼявляться." chip="ЧЕКАЄМО ВІДКРИТТЯ R10" />}
      {round && data && (
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {data.questions.map((q) => <Question key={q.Id} q={q} i18n={i18n} />)}
        </div>
      )}
    </section>
  )
}
