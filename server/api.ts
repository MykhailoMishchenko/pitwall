// inputs {data/*.json снапшоты}, does {read-only Hono API для витрины}, returns {JSON эндпоинты /api/*}
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { readFileSync, existsSync } from 'node:fs'

const app = new Hono()
const PORT = Number(process.env.PITWALL_API_PORT || 3101)

function snapshot(c: any, path: string) {
  if (!existsSync(path)) return c.json({ error: `нет снапшота ${path} — запусти pnpm ingest` }, 503)
  return c.json(JSON.parse(readFileSync(path, 'utf8')))
}

app.get('/api/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))
app.get('/api/calendar', (c) => snapshot(c, 'data/jolpica/calendar.json'))
app.get('/api/standings/drivers', (c) => snapshot(c, 'data/jolpica/driver-standings.json'))
app.get('/api/standings/constructors', (c) => snapshot(c, 'data/jolpica/constructor-standings.json'))
app.get('/api/fantasy', (c) => snapshot(c, 'data/fantasy/players.json'))

// следующий этап + момент лока пиков (спринт-уикенд → спринт-квала, иначе квала)
app.get('/api/next-race', (c) => {
  const path = 'data/jolpica/calendar.json'
  if (!existsSync(path)) return c.json({ error: 'нет календаря — запусти pnpm ingest' }, 503)
  const { races } = JSON.parse(readFileSync(path, 'utf8'))
  const now = Date.now()
  const withLock = races.map((r: any) => {
    const q = r.SprintQualifying ?? r.Qualifying
    const lockUtc = q ? `${q.date}T${q.time}` : `${r.date}T${r.time}`
    return { ...r, lockUtc, isSprint: Boolean(r.Sprint) }
  })
  const next = withLock.find((r: any) => new Date(`${r.date}T${r.time}`).getTime() + 3 * 3600e3 > now)
  if (!next) return c.json({ error: 'сезон завершён' }, 404)
  return c.json({
    round: Number(next.round),
    raceName: next.raceName,
    circuit: next.Circuit?.circuitName,
    country: next.Circuit?.Location?.country,
    isSprint: next.isSprint,
    lockUtc: next.lockUtc,
    raceUtc: `${next.date}T${next.time}`,
    total: races.length,
  })
})

serve({ fetch: app.fetch, port: PORT })
console.log(`pitwall api → http://localhost:${PORT}`)
