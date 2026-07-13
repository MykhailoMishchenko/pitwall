// inputs {paddock snapshot}, does {экран 12: колонка Clawd'а + штрафы/апгрейды/радио/слухи/FIA — наполняется рутинами}, returns {Paddock}
import { usePaddock, useNextRace } from '../lib/api'
import { teamColor } from '../lib/teams'
import { ClawdMark } from '../components/Clawd'
import { Lbl, Panel } from '../components/ui'

const chipTone: Record<string, string> = { good: 'g', warn: 'y', danger: 'r' }

function Empty({ text }: { text: string }) {
  return <p className="sub" style={{ fontSize: 12.5 }}>{text} <span className="chip n" style={{ marginLeft: 4 }}>ЗАПОВНИТЬСЯ В ПʼЯТНИЦЮ</span></p>
}

export default function Paddock() {
  const { data: next } = useNextRace()
  const { data: p } = usePaddock(next?.round)

  return (
    <section className="screen">
      <div className="shead"><span className="rno">12 / ПАДДОК</span>
        <span className="chip n">КОЖЕН ПУНКТ АБО «→ У МОДЕЛІ», АБО «ШУМ/ФАН»</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel>
            <Lbl>ШТРАФНІ БАЛИ · ЛІЦЕНЗІЇ</Lbl>
            {p?.penalties.length
              ? <div className="tw"><table><tbody>
                  {p.penalties.map((x) => (
                    <tr key={x.driver}><td><span className="tbar" style={{ background: teamColor(x.colorId) }} />{x.driver}</td>
                      <td className="num tr">{x.points}/12</td>
                      <td style={{ textAlign: 'right' }}>{x.note && <span className={`chip ${x.tone ? chipTone[x.tone] : 'n'}`}>{x.note.toUpperCase()}</span>}</td></tr>
                  ))}
                </tbody></table></div>
              : <Empty text="Бали кожного пілота (12 = бан на гонку) як ризик-фактор фентезі-складу." />}
          </Panel>
          <Panel>
            <Lbl>АПГРЕЙДИ МАШИН · R{next?.round}</Lbl>
            {p?.upgrades.length
              ? <div className="tw"><table><tbody>
                  {p.upgrades.map((x, i) => (
                    <tr key={i}><td><span className="tbar" style={{ background: teamColor(x.colorId) }} />{x.team}</td>
                      <td style={{ color: 'var(--dim)' }}>{x.part}</td>
                      <td style={{ textAlign: 'right' }}>{x.verdict && <span className={`chip ${x.tone ? chipTone[x.tone] : 'n'}`}>{x.verdict}</span>}</td></tr>
                  ))}
                </tbody></table></div>
              : <Empty text="Хто що привіз на етап → коригування pace-пріорів." />}
          </Panel>
          <Panel>
            <Lbl>SILLY SEASON · ТРЕКЕР ЧУТОК</Lbl>
            {p?.rumors.length
              ? <div className="tw"><table><tbody>
                  {p.rumors.map((x, i) => (
                    <tr key={i}><td>{x.colorId && <span className="tbar" style={{ background: teamColor(x.colorId) }} />}{x.text}</td>
                      {x.prob != null && <td className="num tr">{x.prob}%</td>}
                      <td style={{ textAlign: 'right' }}>{x.impact && <span className="chip p">{x.impact}</span>}</td></tr>
                  ))}
                </tbody></table></div>
              : <p className="sub" style={{ fontSize: 12.5 }}>Переходи й чутки з імовірністю від моделі. <span className="chip n">З R11</span></p>}
          </Panel>
        </div>

        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel hot>
            <Lbl>КОЛОНКА CLAWD'А <span style={{ display: 'inline-flex', marginLeft: 4 }}><ClawdMark size={18} /></span></Lbl>
            {p?.clawdColumn
              ? <>
                  <div style={{ fontFamily: 'var(--disp)', fontSize: 19, fontWeight: 600, letterSpacing: '.02em' }}>{p.clawdColumn.title}</div>
                  <div className="num" style={{ fontSize: 10.5, color: 'var(--faint)', margin: '2px 0 8px' }}>{p.clawdColumn.date}</div>
                  <p className="sub" style={{ fontSize: 13, lineHeight: 1.6 }}>{p.clawdColumn.body}</p>
                </>
              : <Empty text="Хот-тейк тижня — думка без математики." />}
          </Panel>
          <Panel>
            <Lbl>РАДІО-ПЕРЛИ</Lbl>
            {p?.radio.length
              ? <ul className="feed" style={{ fontSize: 12.5 }}>
                  {p.radio.map((x, i) => (
                    <li key={i}><time>{x.lap}</time><span>{x.text} {x.tag && <span className={`chip ${x.tone ? chipTone[x.tone] : 'n'}`}>{x.tag}</span>}</span></li>
                  ))}
                </ul>
              : <p className="sub" style={{ fontSize: 12.5 }}>Топ team radio вікенду (OpenF1). <span className="chip n">З R11</span></p>}
          </Panel>
          <Panel>
            <Lbl>FIA · ДОКУМЕНТИ</Lbl>
            {p?.fiaDocs.length
              ? <ul className="feed" style={{ fontSize: 12.5 }}>
                  {p.fiaDocs.map((x, i) => <li key={i}><time>{x.date}</time><span>{x.text}</span></li>)}
                </ul>
              : <Empty text="Офіційні рішення, директиви, протести по етапу." />}
          </Panel>
        </div>
      </div>
    </section>
  )
}
