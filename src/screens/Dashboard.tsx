// inputs {next-race, calendar}, does {экран 01: герой-каунтдаун, статусы, сводка сезона}, returns {Dashboard}
import { useCalendar, useNextRace } from '../lib/api'
import { gpUa } from '../lib/teams'
import { Countdown, Lbl, Panel } from '../components/ui'

export default function Dashboard() {
  const { data: next } = useNextRace()
  const { data: cal } = useCalendar()
  const left = cal && next ? cal.races.length - next.round + 1 : null
  return (
    <section className="screen">
      <div className="shead"><span className="rno">01 / ДАШБОРД</span></div>
      <div className="grid g-2a">
        <Panel hot>
          <Lbl>НАСТУПНИЙ ДЕДЛАЙН — ЛОК ПІКІВ</Lbl>
          {next ? (
            <>
              <h1>{gpUa(next.country, next.raceName)}</h1>
              <p className="sub">
                {next.circuit} · Раунд {next.round} із {next.total} · {next.isSprint ? 'спринт-формат' : 'звичайний формат'} ·
                лок — {new Date(next.lockUtc).toLocaleString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </p>
              <div style={{ marginTop: 20 }}><Countdown targetUtc={next.lockUtc} /></div>
            </>
          ) : (
            <p className="sub">Завантаження календаря…</p>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            <span className="chip y">ФЕНТЕЗІ · ЧЕРНЕТКИ ЩЕ НЕМАЄ</span>
            <span className="chip y">PREDICT · НЕ ЗАПОВНЕНИЙ</span>
            <span className="chip n">ПРЕВʼЮ · ПІСЛЯ ПЕРШОЇ РУТИНИ</span>
          </div>
        </Panel>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel>
            <Lbl>ЛІГА</Lbl>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span className="big">P—</span>
              <span className="chip n">дебют {next ? `у R${next.round}` : 'скоро'}</span>
            </div>
            <p className="sub" style={{ fontSize: 12.5 }}>Ліга стартує з нашого першого вікенду — всі з нуля.</p>
          </Panel>
          <Panel>
            <Lbl>СЕЗОН · ЗВЕДЕННЯ</Lbl>
            <div className="tw"><table><tbody>
              <tr><td>Очок фентезі</td><td className="num tr">0</td></tr>
              <tr><td>Точність Predict</td><td className="num tr">—</td></tr>
              <tr><td>Чіпи доступні</td><td className="num up tr">6 / 6</td></tr>
              <tr><td>Boost'и Predict</td><td className="num up tr">3 / 3</td></tr>
              <tr><td>Вікендів попереду</td><td className="num tr">{left ?? '—'}</td></tr>
            </tbody></table></div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
