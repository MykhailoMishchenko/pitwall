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

// Бегун: случайно появляется, бежит по верхней грани карточек одного ряда
// (позиции карточек читаются живьём каждый кадр → устойчив к скроллу),
// перепрыгивает между ними, а в конце ряда приседает и прыгает за экран, раскидывая пыль.
const W = 28, H = 22
const easeOut = (p: number) => p * (2 - p)

function spawnDust(px: number, py: number) {
  for (let i = 0; i < 7; i++) {
    const d = document.createElement('div')
    d.style.cssText = `position:fixed;left:${px}px;top:${py}px;width:${4 + Math.random() * 3}px;height:${4 + Math.random() * 3}px;border-radius:50%;background:rgba(150,140,128,.55);z-index:89;pointer-events:none;transition:transform .5s ease-out,opacity .5s ease-out`
    document.body.appendChild(d)
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2 // веер вверх
    const dist = 14 + Math.random() * 26
    requestAnimationFrame(() => {
      d.style.transform = `translate(${Math.cos(ang) * dist}px,${Math.sin(ang) * dist * 0.6 + 8}px)`
      d.style.opacity = '0'
    })
    setTimeout(() => d.remove(), 520)
  }
}

export function useClawdRoamer() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    let raf = 0
    let el: HTMLDivElement | null = null
    const schedule = (ms: number) => { timer = setTimeout(spawn, ms) }
    const topY = (elm: HTMLElement) => elm.getBoundingClientRect().top - H + 2 // живая верхняя грань

    function spawn() {
      if (matchMedia('(prefers-reduced-motion:reduce)').matches) return schedule(30_000)
      const cards = [...document.querySelectorAll<HTMLElement>('.panel')].filter((c) => {
        const r = c.getBoundingClientRect()
        return r.top > 80 && r.top < innerHeight - 60 && r.width > 150
      })
      if (!cards.length) return schedule(20_000)
      const seedTop = cards[Math.floor(Math.random() * cards.length)].getBoundingClientRect().top
      const row = cards
        .filter((c) => Math.abs(c.getBoundingClientRect().top - seedTop) < 40)
        .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)

      el = document.createElement('div')
      el.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 100 80" shape-rendering="crispEdges"><use href="#clawd"/></svg>`
      el.style.cssText = 'position:fixed;top:0;left:0;z-index:90;pointer-events:none;opacity:0;transition:opacity .25s;transform-origin:50% 100%'
      document.body.appendChild(el)
      requestAnimationFrame(() => { if (el) el.style.opacity = '1' })

      // сегменты: x стабилен при вертикальном скролле, y берётся живьём из el карточки
      type Seg =
        | { kind: 'walk'; card: HTMLElement; x1: number; x2: number; d: number }
        | { kind: 'hop'; card: HTMLElement; next: HTMLElement; x1: number; x2: number; d: number }
        | { kind: 'crouch'; card: HTMLElement; x: number; d: number }
        | { kind: 'leap'; card: HTMLElement; x1: number; x2: number; d: number }
      const segs: Seg[] = []
      const V = 0.14, JT = 460
      let cx = row[0].getBoundingClientRect().left + 4
      row.forEach((card, i) => {
        const endX = card.getBoundingClientRect().right - W - 4
        segs.push({ kind: 'walk', card, x1: cx, x2: endX, d: Math.max(250, (endX - cx) / V) })
        cx = endX
        const next = row[i + 1]
        if (next) { segs.push({ kind: 'hop', card, next, x1: cx, x2: next.getBoundingClientRect().left + 4, d: JT }); cx = next.getBoundingClientRect().left + 4 }
      })
      const last = row[row.length - 1]
      segs.push({ kind: 'crouch', card: last, x: cx, d: 230 })         // присесть, накопить силу
      segs.push({ kind: 'leap', card: last, x1: cx, x2: cx + 160, d: 620 }) // прыжок дугой за экран

      let si = 0, st = performance.now(), dusted = false
      const step = (now: number) => {
        if (!el) return
        let s = segs[si], p = (now - st) / s.d
        if (p >= 1) {
          si++; st = now; dusted = false
          if (si >= segs.length) { el.remove(); el = null; schedule(15_000 + Math.random() * 30_000); return }
          s = segs[si]; p = 0
        }
        let x = 0, y = 0, sx = 1, sy = 1
        if (s.kind === 'walk') {
          x = s.x1 + (s.x2 - s.x1) * p; y = topY(s.card) - (Math.floor(now / 110) % 2) * 2
        } else if (s.kind === 'hop') {
          x = s.x1 + (s.x2 - s.x1) * p
          y = topY(s.card) + (topY(s.next) - topY(s.card)) * p - Math.sin(p * Math.PI) * 44
        } else if (s.kind === 'crouch') {
          x = s.x; y = topY(s.card)
          const e = p * p                       // ускоряется в присед
          sy = 1 - 0.38 * e; sx = 1 + 0.28 * e  // сжатие по вертикали, расширение по горизонтали
        } else { // leap
          if (!dusted) { dusted = true; spawnDust(s.x1 + W / 2, topY(s.card) + H) } // пыль в момент отталкивания
          const e = easeOut(p)
          x = s.x1 + (s.x2 - s.x1) * e
          y = topY(s.card) - (topY(s.card) + 140) * e   // взмывает вверх за верхний край
          sy = 0.62 + 0.6 * e; sx = 1.28 - 0.46 * e     // вытягивается в прыжке
        }
        el.style.transform = `translate(${x}px,${y}px) scale(${sx},${sy})`
        raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    schedule(6_000)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); el?.remove() }
  }, [])
}
