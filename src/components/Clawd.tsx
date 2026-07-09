// inputs {—}, does {пиксельный маскот Clawd: defs, лого-марка, бегун по бордерам карточек}, returns {компоненты + хук}
import { useEffect } from 'react'

export function ClawdDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <g id="clawd" fill="#F1573D">
          <rect x="20" y="8" width="60" height="42" />
          <rect x="2" y="26" width="18" height="16" /><rect x="80" y="26" width="18" height="16" />
          <rect x="32" y="16" width="11" height="11" fill="#131313" /><rect x="57" y="16" width="11" height="11" fill="#131313" />
          <rect x="22" y="50" width="10" height="26" /><rect x="38" y="50" width="10" height="26" />
          <rect x="52" y="50" width="10" height="26" /><rect x="68" y="50" width="10" height="26" />
        </g>
      </defs>
    </svg>
  )
}

export function ClawdMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.8)} viewBox="0 0 100 80" shapeRendering="crispEdges">
      <use href="#clawd" />
    </svg>
  )
}

// Бегун: случайно появляется, бежит по верхней грани карточек одного ряда,
// перепрыгивает между ними и убегает за правый край экрана.
export function useClawdRoamer() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let raf = 0
    let el: HTMLDivElement | null = null

    const schedule = (ms: number) => { timer = setTimeout(spawn, ms) }

    function spawn() {
      if (matchMedia('(prefers-reduced-motion:reduce)').matches) return schedule(30_000)
      const all = [...document.querySelectorAll<HTMLElement>('.panel')]
        .map((p) => p.getBoundingClientRect())
        .filter((r) => r.top > 80 && r.top < innerHeight - 60 && r.width > 150)
      if (!all.length) return schedule(20_000)
      const W = 28, H = 22, Y = (r: DOMRect) => r.top - H + 2
      const seed = all[Math.floor(Math.random() * all.length)]
      const row = all.filter((r) => Math.abs(r.top - seed.top) < 40).sort((a, b) => a.left - b.left)
      el = document.createElement('div')
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 100 80" shape-rendering="crispEdges"><use href="#clawd"/></svg>`
      el.style.cssText = 'position:fixed;top:0;left:0;z-index:90;pointer-events:none;opacity:0;transition:opacity .25s'
      document.body.appendChild(el)
      requestAnimationFrame(() => { if (el) el.style.opacity = '1' })

      type Seg = { x1: number; y1: number; x2: number; y2: number; d: number; walk?: boolean; arc?: boolean }
      const segs: Seg[] = []
      const V = 0.14, JT = 460
      let cx = row[0].left + 4
      row.forEach((r, i) => {
        const endX = r.right - W - 4
        segs.push({ x1: cx, y1: Y(r), x2: endX, y2: Y(r), d: Math.max(250, (endX - cx) / V), walk: true })
        cx = endX
        const nxt = row[i + 1]
        if (nxt) { segs.push({ x1: cx, y1: Y(r), x2: nxt.left + 4, y2: Y(nxt), d: JT, arc: true }); cx = nxt.left + 4 }
      })
      const lastY = Y(row[row.length - 1])
      segs.push({ x1: cx, y1: lastY, x2: innerWidth + 70, y2: lastY, d: (innerWidth + 70 - cx) / (V * 2.6), walk: true })

      let si = 0, st = performance.now()
      const step = (now: number) => {
        if (!el) return
        let s = segs[si], p = (now - st) / s.d
        if (p >= 1) {
          si++; st = now
          if (si >= segs.length) { el.remove(); el = null; schedule(15_000 + Math.random() * 30_000); return }
          s = segs[si]; p = 0
        }
        const x = s.x1 + (s.x2 - s.x1) * p
        let y = s.y1 + (s.y2 - s.y1) * p
        if (s.arc) y -= Math.sin(p * Math.PI) * 44
        const bob = s.walk ? (Math.floor(now / 110) % 2) * 2 : 0
        el.style.transform = `translate(${x}px,${y - bob}px)`
        raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    schedule(6_000)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); el?.remove() }
  }, [])
}
