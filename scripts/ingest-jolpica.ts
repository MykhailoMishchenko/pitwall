// inputs {Jolpica API}, does {фетчит календарь-2026 + оба зачёта, пишет data/jolpica/*.json}, returns {лог сводки}
import { mkdirSync, writeFileSync } from 'node:fs'

const BASE = 'https://api.jolpi.ca/ergast/f1/2026'
const OUT = 'data/jolpica'

async function pull(path: string): Promise<any> {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`jolpica ${path}: HTTP ${res.status}`)
  return res.json()
}

async function main() {
  mkdirSync(OUT, { recursive: true })

  const races = (await pull('races.json?limit=100')).MRData.RaceTable.Races
  writeFileSync(`${OUT}/calendar.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), races }, null, 1))

  const ds = (await pull('driverstandings.json')).MRData.StandingsTable.StandingsLists[0]
  writeFileSync(`${OUT}/driver-standings.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), ...ds }, null, 1))

  const cs = (await pull('constructorstandings.json')).MRData.StandingsTable.StandingsLists[0]
  writeFileSync(`${OUT}/constructor-standings.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), ...cs }, null, 1))

  const sprints = races.filter((r: any) => r.Sprint).map((r: any) => `R${r.round}`)
  console.log(`calendar: ${races.length} этапов, спринты: ${sprints.join(' ') || 'нет данных'}`)
  console.log(`standings: пилотов ${ds.DriverStandings.length} (после R${ds.round}), конструкторов ${cs.ConstructorStandings.length}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
