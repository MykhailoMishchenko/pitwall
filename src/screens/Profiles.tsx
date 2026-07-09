// inputs {standings + fantasy feed}, does {экран 09: пилоты и команды со статой и ценой}, returns {Profiles}
import { useMemo, useState } from 'react'
import { useConstructorStandings, useDriverStandings, useFantasy } from '../lib/api'
import { driverUa, teamColor } from '../lib/teams'
import { Lbl, Panel } from '../components/ui'

export default function Profiles() {
  const { data: ds } = useDriverStandings()
  const { data: cs } = useConstructorStandings()
  const { data: fantasy } = useFantasy()
  const [tab, setTab] = useState<'drivers' | 'teams'>('drivers')

  const priceByLast = useMemo(() => {
    const m = new Map<string, number>()
    for (const p of fantasy?.players ?? []) {
      if (p.PositionName === 'DRIVER' && p.LastName) m.set(p.LastName.toLowerCase(), p.Value)
    }
    return m
  }, [fantasy])

  const driverPrice = (familyName: string) => priceByLast.get(familyName.toLowerCase()) ?? null

  return (
    <section className="screen">
      <div className="shead"><span className="rno">09 / ПРОФІЛІ</span></div>
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', marginBottom: 18 }}>
        {(['drivers', 'teams'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 0, color: tab === t ? 'var(--text)' : 'var(--dim)', fontFamily: 'var(--disp)', fontSize: 15, letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 16px', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? 'var(--purple)' : 'transparent'}`, marginBottom: -1 }}>
            {t === 'drivers' ? 'Пілоти' : 'Команди'}
          </button>
        ))}
      </div>
      {tab === 'drivers' ? (
        <Panel>
          <Lbl>ОСОБИСТИЙ ЗАЛІК · ФОРМА · ЦІНА ФЕНТЕЗІ</Lbl>
          <div className="tw"><table>
            <thead><tr><th /><th>ПІЛОТ</th><th>КОМАНДА</th><th className="tr">ОЧКИ</th><th className="tr">ПЕРЕМОГИ</th><th className="tr">ЦІНА</th></tr></thead>
            <tbody>
              {ds?.DriverStandings.map((s) => {
                const price = driverPrice(s.Driver.familyName)
                return (
                  <tr key={s.Driver.driverId}>
                    <td className="pos">{s.position}</td>
                    <td><span className="tbar" style={{ background: teamColor(s.Constructors[0]?.constructorId ?? '') }} />{driverUa(s.Driver.driverId, s.Driver.familyName)}</td>
                    <td style={{ color: 'var(--dim)' }}>{s.Constructors[0]?.name}</td>
                    <td className="num tr">{s.points}</td>
                    <td className={`num tr ${Number(s.wins) ? 'pu' : ''}`}>{Number(s.wins) || '—'}</td>
                    <td className="num tr">{price != null ? `$${price.toFixed(1)}M` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        </Panel>
      ) : (
        <Panel>
          <Lbl>КУБОК КОНСТРУКТОРІВ · ЦІНА ФЕНТЕЗІ</Lbl>
          <div className="tw"><table>
            <thead><tr><th /><th>КОМАНДА</th><th className="tr">ОЧКИ</th><th className="tr">ПЕРЕМОГИ</th><th className="tr">ЦІНА</th></tr></thead>
            <tbody>
              {cs?.ConstructorStandings.map((s) => {
                const fp = fantasy?.players.find((p) => p.PositionName === 'CONSTRUCTOR' && p.DisplayName.toLowerCase().includes(s.Constructor.name.split(' ')[0].toLowerCase()))
                return (
                  <tr key={s.Constructor.constructorId}>
                    <td className="pos">{s.position}</td>
                    <td><span className="tbar" style={{ background: teamColor(s.Constructor.constructorId) }} />{s.Constructor.name}</td>
                    <td className="num tr">{s.points}</td>
                    <td className={`num tr ${Number(s.wins) ? 'pu' : ''}`}>{Number(s.wins) || '—'}</td>
                    <td className="num tr">{fp ? `$${fp.Value.toFixed(1)}M` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table></div>
        </Panel>
      )}
    </section>
  )
}
