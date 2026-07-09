// inputs {открытый фид F1 Fantasy}, does {фетчит 33 игроков (22 пилота + 11 конструкторов), пишет data/fantasy/players.json}, returns {лог сводки}
import { mkdirSync, writeFileSync } from 'node:fs'

const FEED = 'https://fantasy.formula1.com/feeds/drivers/1_en.json'
const OUT = 'data/fantasy'

async function main() {
  mkdirSync(OUT, { recursive: true })
  const res = await fetch(FEED, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`fantasy feed: HTTP ${res.status}`)
  const body = await res.json()
  const players = body?.Data?.Value
  if (!Array.isArray(players) || players.length === 0) throw new Error('fantasy feed: пустой Data.Value')

  writeFileSync(`${OUT}/players.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), players }, null, 1))

  const drivers = players.filter((p: any) => p.PositionName === 'DRIVER')
  const constructors = players.filter((p: any) => p.PositionName === 'CONSTRUCTOR')
  const top = [...players].sort((a: any, b: any) => b.Value - a.Value)[0]
  console.log(`fantasy: пилотов ${drivers.length}, конструкторов ${constructors.length}; максимум цены — ${top.DisplayName} $${top.Value}M`)
}

main().catch((e) => { console.error(e); process.exit(1) })
