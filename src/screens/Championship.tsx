// inputs {standings, calendar, next-race}, does {экран 08: оба зачёта + календарная лента}, returns {Championship}
import { useCalendar, useConstructorStandings, useDriverStandings, useNextRace } from '../lib/api'
import { driverUa, teamColor } from '../lib/teams'
import { Lbl, Panel } from '../components/ui'

export default function Championship() {
  const { data: ds } = useDriverStandings()
  const { data: cs } = useConstructorStandings()
  const { data: cal } = useCalendar()
  const { data: next } = useNextRace()
  return (
    <section className="screen">
      <div className="shead">
        <span className="rno">08 / ЧЕМПІОНАТ</span>
        {ds && <span className="chip n">ПІСЛЯ R{ds.round}</span>}
      </div>
      <div className="grid g-2b">
        <Panel>
          <Lbl>ОСОБИСТИЙ ЗАЛІК</Lbl>
          <div className="tw"><table>
            <thead><tr><th /><th>ПІЛОТ</th><th className="tr">ОЧКИ</th><th className="tr">ПЕРЕМОГИ</th></tr></thead>
            <tbody>
              {ds?.DriverStandings.map((s) => (
                <tr key={s.Driver.driverId}>
                  <td className="pos">{s.position}</td>
                  <td>
                    <span className="tbar" style={{ background: teamColor(s.Constructors[0]?.constructorId ?? '') }} />
                    {driverUa(s.Driver.driverId, s.Driver.familyName)}
                  </td>
                  <td className="num tr">{s.points}</td>
                  <td className={`num tr ${Number(s.wins) ? 'pu' : ''}`}>{Number(s.wins) ? s.wins : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </Panel>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel>
            <Lbl>КУБОК КОНСТРУКТОРІВ</Lbl>
            <div className="tw"><table><tbody>
              {cs?.ConstructorStandings.map((s) => (
                <tr key={s.Constructor.constructorId}>
                  <td className="pos">{s.position}</td>
                  <td><span className="tbar" style={{ background: teamColor(s.Constructor.constructorId) }} />{s.Constructor.name}</td>
                  <td className="num tr">{s.points}</td>
                </tr>
              ))}
            </tbody></table></div>
          </Panel>
          <Panel>
            <Lbl>КАЛЕНДАР</Lbl>
            <div className="calstrip">
              {cal?.races.map((r) => {
                const round = Number(r.round)
                const cls = next && round === next.round ? 'next' : next && round < next.round ? 'done' : ''
                return <span key={r.round} className={cls} title={r.raceName}>R{r.round}</span>
              })}
            </div>
            {next && <p className="sub" style={{ fontSize: 11.5, marginTop: 8 }}>Фіолетовий — наступний етап (R{next.round}).</p>}
          </Panel>
        </div>
      </div>
    </section>
  )
}
