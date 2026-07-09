// inputs {структура погоды превью}, does {визуальный виджет: темп + иконка условия + шкала интенсивности осадков}, returns {WeatherWidget}
import { Lbl, Panel } from './ui'

type W = {
  day?: string; tempC?: number; condition?: string; conditionLabel?: string
  windMs?: number; rainPct?: number; summary: string; detail: string; risk?: string
}

function Icon({ c }: { c?: string }) {
  const stroke = 'none'
  if (c === 'rain') return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" stroke={stroke}>
      <path d="M20 38a12 12 0 0 1 1-23 15 15 0 0 1 28 5 10 10 0 0 1-2 20H20z" fill="#8A939F" />
      <g stroke="#6692FF" strokeWidth="3" strokeLinecap="round"><line x1="24" y1="46" x2="21" y2="55" /><line x1="34" y1="46" x2="31" y2="55" /><line x1="44" y1="46" x2="41" y2="55" /></g>
    </svg>
  )
  if (c === 'cloud') return (
    <svg width="52" height="52" viewBox="0 0 64 64"><path d="M20 44a12 12 0 0 1 1-23 15 15 0 0 1 28 5 10 10 0 0 1-2 20H20z" fill="#8A939F" /></svg>
  )
  // cloud-sun / sun default
  return (
    <svg width="52" height="52" viewBox="0 0 64 64">
      <circle cx="24" cy="24" r="11" fill="#FFC84A" />
      <g stroke="#FFC84A" strokeWidth="3" strokeLinecap="round"><line x1="24" y1="4" x2="24" y2="10" /><line x1="24" y1="38" x2="24" y2="44" /><line x1="4" y1="24" x2="10" y2="24" /><line x1="8" y1="8" x2="12" y2="12" /><line x1="40" y1="8" x2="36" y2="12" /></g>
      {c !== 'sun' && <path d="M28 48a11 11 0 0 1 1-21 14 14 0 0 1 26 4 9 9 0 0 1-2 18H28z" fill="#B4BCC6" />}
    </svg>
  )
}

// вертикальная шкала интенсивности осадков (как на радаре погоды)
function RainScale({ pct = 0 }: { pct?: number }) {
  const levels = [
    { label: 'Екстрем.', c: '#F5F0FF' },
    { label: 'Сильні', c: '#FFC84A' },
    { label: 'Середні', c: '#B47CFF' },
    { label: 'Легкі', c: '#3671C6' },
  ]
  // маркер: где текущий уровень (0% снизу, 100% сверху)
  const markerBottom = Math.max(2, Math.min(98, pct))
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
      <div style={{ position: 'relative', width: 10, borderRadius: 3, background: 'linear-gradient(#F5F0FF, #FFC84A 33%, #B47CFF 66%, #3671C6)' }}>
        <span style={{ position: 'absolute', left: -4, right: -4, bottom: `${markerBottom}%`, height: 2, background: 'var(--text)', boxShadow: '0 0 4px rgba(0,0,0,.8)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--faint)', padding: '1px 0' }}>
        {levels.map((l) => <span key={l.label}>{l.label}</span>)}
      </div>
    </div>
  )
}

export function WeatherWidget({ w }: { w: W }) {
  return (
    <Panel hot>
      <Lbl right={w.day ? <span className="chip n">{w.day}</span> : undefined}>ПОГОДА</Lbl>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <Icon c={w.condition} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {w.tempC != null && <div style={{ fontFamily: 'var(--disp)', fontSize: 40, fontWeight: 600, lineHeight: 1 }} className="num">{w.tempC}°</div>}
          {w.conditionLabel && <div style={{ color: 'var(--dim)', fontSize: 13 }}>{w.conditionLabel}</div>}
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)', marginTop: 4 }}>
            {w.windMs != null && <span>вітер {w.windMs} м/с</span>}
            {w.rainPct != null && <span> · дощ {w.rainPct}%</span>}
          </div>
        </div>
        {w.rainPct != null && <RainScale pct={w.rainPct} />}
      </div>
      <div className="big" style={{ fontSize: 18, marginTop: 14 }}>{w.summary}</div>
      <p className="sub" style={{ fontSize: 12.5, marginTop: 6 }}>{w.detail}</p>
      {w.risk && <p className="sub" style={{ fontSize: 12, marginTop: 8, color: 'var(--faint)' }}>{w.risk}</p>}
    </Panel>
  )
}
