// inputs {analyses/*.json (структурные) + *.md (нарратив-разборы)}, does {в public/data/analyses/*.json + index}, returns {лог}
import { mkdirSync, writeFileSync, readdirSync, readFileSync, existsSync } from 'node:fs'

const SRC = 'analyses'
const OUT = 'public/data/analyses'

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/)
    if (kv) meta[kv[1]] = kv[2].trim()
  }
  return { meta, body: m[2].trim() }
}

function main() {
  if (!existsSync(SRC)) { console.log('analyses: папки нет'); return }
  mkdirSync(OUT, { recursive: true })
  const files = readdirSync(SRC).filter((f) => f.endsWith('.json') || f.endsWith('.md'))
  const index: { round: number; kind: string; stage?: string; format: 'structured' | 'markdown'; file: string }[] = []
  const seen = new Set<string>()
  for (const f of files) {
    const raw = readFileSync(`${SRC}/${f}`, 'utf8')
    let round: number, kind: string, stage: string | undefined, format: 'structured' | 'markdown', payload: unknown
    if (f.endsWith('.json')) {
      const data = JSON.parse(raw)
      round = Number(data.meta?.round); kind = data.meta?.kind ?? (f.includes('debrief') ? 'debrief' : 'preview')
      stage = data.meta?.stage; format = 'structured'; payload = data
    } else {
      const { meta, body } = parseFrontmatter(raw)
      round = Number(meta.round); kind = f.includes('debrief') ? 'debrief' : 'preview'
      stage = meta.stage; format = 'markdown'; payload = { meta, markdown: body }
    }
    const key = `round-${round}-${kind}`
    if (seen.has(key)) continue // структурный JSON приоритетнее одноимённого .md
    seen.add(key)
    writeFileSync(`${OUT}/${key}.json`, JSON.stringify(payload, null, 1))
    index.push({ round, kind, stage, format, file: key })
  }
  writeFileSync(`${OUT}/index.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), items: index }, null, 1))
  console.log(`analyses: ${index.length} → ${index.map((i) => `${i.file}(${i.format})`).join(', ')}`)
}

main()
