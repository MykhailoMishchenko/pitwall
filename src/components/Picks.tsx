// inputs {picks data + locked-флаг}, does {показ пиков; до лока — парольный гейт}, returns {PicksView}
import { useState } from 'react'
import { usePicks, type NextRace } from '../lib/api'
import { teamColor } from '../lib/teams'
import { CountdownInline, Lbl, Panel } from './ui'

const PASSPHRASE = 'fernando alonso champion'

function Lineup({ round }: { round: number }) {
  const { data } = usePicks(round)
  if (!data) return <p className="sub">Склад ще не зафіксовано.</p>
  const f = data.fantasy
  return (
    <>
      <div className="grid g-2">
        <Panel>
          <Lbl right={<span className="chip n">{f.budgetUsed}M / {f.budgetCap}M</span>}>ФЕНТЕЗІ · {f.team}</Lbl>
          <div className="tw"><table><tbody>
            {f.drivers.map((d) => (
              <tr key={d.name}>
                <td><span className="tbar" style={{ background: teamColor(d.colorId) }} />{d.name}</td>
                <td className="num tr">${d.price.toFixed(1)}M</td>
                <td style={{ textAlign: 'right' }}>{d.note && <span className={`chip ${d.note.includes('заміну') ? 'r' : 'p'}`}>{d.note.toUpperCase()}</span>}</td>
              </tr>
            ))}
            {f.constructors.map((c) => (
              <tr key={c.name}>
                <td><span className="tbar" style={{ background: teamColor(c.colorId) }} />{c.name}</td>
                <td className="num tr">${c.price.toFixed(1)}M</td>
                <td style={{ textAlign: 'right' }}><span className="chip n">КОНСТРУКТОР</span></td>
              </tr>
            ))}
          </tbody></table></div>
        </Panel>
        <Panel>
          <Lbl>PREDICT · ВІДПОВІДІ</Lbl>
          {data.predict.length === 0
            ? <p className="sub" style={{ fontSize: 13 }}>Раунд Predict ще не відкрито — відповіді зʼявляться у фінальній рутині.</p>
            : <div className="tw"><table><tbody>{data.predict.map((p, i) => (
                <tr key={i}><td style={{ color: 'var(--dim)' }}>{p.question}</td><td className="tr"><b>{p.answer}</b></td></tr>
              ))}</tbody></table></div>}
        </Panel>
      </div>
      <p className="sub" style={{ fontSize: 11.5, marginTop: 10 }}>Статус: {data.status}. Чернетка редагується до лока; фінал фіксується субботньою рутиною з таймстемпом.</p>
    </>
  )
}

export function PicksView({ round, next, locked }: { round: number; next?: NextRace; locked: boolean }) {
  const [input, setInput] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const reveal = locked || unlocked

  if (reveal) {
    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <span className={`chip ${locked ? 'g' : 'p'}`}>{locked ? 'ЛОК · READ-ONLY' : 'РОЗБЛОКОВАНО ПАРОЛЕМ'}</span>
        </div>
        <Lineup round={round} />
      </>
    )
  }

  const tryUnlock = () => { if (input.trim().toLowerCase() === PASSPHRASE) setUnlocked(true) }
  const wrong = input.length > 0 && input.trim().toLowerCase() !== PASSPHRASE

  return (
    <Panel>
      <Lbl right={<span className="chip y">ПРИХОВАНО ДО ЛОКА</span>}>ПІКИ R{round}</Lbl>
      <p className="sub" style={{ fontSize: 13 }}>
        Фінальний склад фентезі й відповіді Predict приховані до лока квали, щоб суперники в лізі не бачили наш хід.
        Відкриються автоматично після дедлайну{next ? ' — ' : '.'}
        {next && <span className="num" style={{ color: 'var(--yellow)' }}>ЗА <CountdownInline targetUtc={next.lockUtc} /></span>}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 16, maxWidth: 420 }}>
        <input
          type="password" value={input} placeholder="пароль для перегляду"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          style={{ flex: 1, background: 'var(--panel2)', border: `1px solid ${wrong ? 'var(--red)' : 'var(--line)'}`, borderRadius: 3, color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 13, padding: '8px 12px', outline: 'none' }}
        />
        <button onClick={tryUnlock}
          style={{ background: 'var(--purple)', border: 0, borderRadius: 3, color: '#0A0C0F', fontFamily: 'var(--disp)', fontSize: 14, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 16px', cursor: 'pointer' }}>
          Відкрити
        </button>
      </div>
      {wrong && <p className="sub" style={{ fontSize: 11.5, color: 'var(--red)', marginTop: 6 }}>Невірний пароль.</p>}
    </Panel>
  )
}
