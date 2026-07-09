// inputs {children/props}, does {переиспользуемые примитивы витрины}, returns {Panel, Lbl, Countdown, Placeholder}
import { useEffect, useState, type ReactNode } from 'react'

export function Panel({ hot, children, className = '' }: { hot?: boolean; children: ReactNode; className?: string }) {
  return <div className={`panel ${hot ? 'hot' : ''} ${className}`}>{children}</div>
}

export function Lbl({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="lbl">
      <span className="tick" />
      {children}
      {right && <span style={{ marginLeft: 'auto' }}>{right}</span>}
    </div>
  )
}

function untilParts(targetUtc: string) {
  const d = Math.max(0, new Date(targetUtc).getTime() - Date.now())
  const p = (n: number) => String(n).padStart(2, '0')
  return {
    D: p(Math.floor(d / 864e5)), H: p(Math.floor(d / 36e5) % 24),
    M: p(Math.floor(d / 6e4) % 60), S: p(Math.floor(d / 1e3) % 60),
  }
}

export function useNow(intervalMs = 1000) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const iv = setInterval(() => setTick((t) => t + 1), intervalMs)
    return () => clearInterval(iv)
  }, [intervalMs])
}

export function Countdown({ targetUtc }: { targetUtc: string }) {
  useNow()
  const t = untilParts(targetUtc)
  return (
    <div className="cd">
      <div><b>{t.D}</b><span>ДНІВ</span></div>
      <div><b>{t.H}</b><span>ГОДИН</span></div>
      <div><b>{t.M}</b><span>ХВИЛИН</span></div>
      <div><b>{t.S}</b><span>СЕКУНД</span></div>
    </div>
  )
}

export function CountdownInline({ targetUtc }: { targetUtc: string }) {
  useNow()
  const t = untilParts(targetUtc)
  return <b>{Number(t.D)}Д {t.H}:{t.M}:{t.S}</b>
}

export function Placeholder({ title, text, chip }: { title: string; text: string; chip?: string }) {
  return (
    <Panel>
      <Lbl>{title}</Lbl>
      <p className="sub">{text}</p>
      {chip && <div style={{ marginTop: 12 }}><span className="chip n">{chip}</span></div>}
    </Panel>
  )
}
