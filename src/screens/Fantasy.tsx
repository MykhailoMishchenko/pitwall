// inputs {fantasy feed snapshot}, does {экран 05: рынок цен пилотов/конструкторов, движение цен}, returns {Fantasy}
import { useFantasy, type FantasyPlayer } from '../lib/api'
import { teamColor } from '../lib/teams'
import { Lbl, Panel } from '../components/ui'

function Market({ title, players }: { title: string; players: FantasyPlayer[] }) {
  return (
    <Panel>
      <Lbl>{title}</Lbl>
      <div className="tw"><table>
        <thead><tr><th /><th>ІМʼЯ</th><th className="tr">ЦІНА</th><th className="tr">Δ</th><th className="tr">ОЧКИ</th><th className="tr">ВИБІР %</th></tr></thead>
        <tbody>
          {players.map((p, i) => {
            const delta = Math.round((p.Value - p.OldPlayerValue) * 10) / 10
            return (
              <tr key={p.PlayerId}>
                <td className="pos">{i + 1}</td>
                <td><span className="tbar" style={{ background: teamColor(p.TeamName) }} />{p.DisplayName}</td>
                <td className="num tr">${p.Value.toFixed(1)}M</td>
                <td className={`num tr ${delta > 0 ? 'up' : delta < 0 ? 'dn' : ''}`}>{delta > 0 ? '+' : ''}{delta ? delta.toFixed(1) : '·'}</td>
                <td className="num tr">{p.OverallPpints}</td>
                <td className="num tr" style={{ color: 'var(--dim)' }}>{p.SelectedPercentage}%</td>
              </tr>
            )
          })}
        </tbody>
      </table></div>
    </Panel>
  )
}

export default function Fantasy() {
  const { data } = useFantasy()
  const drivers = (data?.players ?? []).filter((p) => p.PositionName === 'DRIVER').sort((a, b) => b.Value - a.Value)
  const constructors = (data?.players ?? []).filter((p) => p.PositionName === 'CONSTRUCTOR').sort((a, b) => b.Value - a.Value)
  return (
    <section className="screen">
      <div className="shead">
        <span className="rno">05 / ФЕНТЕЗІ</span>
        {data && <span className="chip n">ФІД ВІД {new Date(data.fetchedAt).toLocaleString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>}
      </div>
      <div className="grid g-2">
        <Market title={`РИНОК · ПІЛОТИ (${drivers.length})`} players={drivers} />
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Market title={`РИНОК · КОНСТРУКТОРИ (${constructors.length})`} players={constructors} />
          <Panel hot>
            <Lbl>СКЛАД · R10</Lbl>
            <p className="sub" style={{ fontSize: 13 }}>
              Чернетка складу зʼявиться після першої рутини превʼю. Оптимізатор:
              прогнози очок × ціни ринку → рюкзак під бюджет $100M + EV капітана.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="chip n">ТРАНСФЕРИ 2/2</span><span className="chip n">ЧІПИ 6/6</span>
              <span className="chip y">CONVICTION-СЛОТ: ВІДКРИТИЙ</span>
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}
