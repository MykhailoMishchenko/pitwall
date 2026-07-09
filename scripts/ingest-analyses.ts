// inputs {analyses/*.md}, does {парсит превью/разборы в public/data/analyses/*.json (meta+markdown)}, returns {лог}
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
  const files = readdirSync(SRC).filter((f) => f.endsWith('.md'))
  const index: { round: number; kind: string; stage?: string; file: string }[] = []
  for (const f of files) {
    const { meta, body } = parseFrontmatter(readFileSync(`${SRC}/${f}`, 'utf8'))
    const round = Number(meta.round)
    const kind = f.includes('debrief') ? 'debrief' : 'preview'
    const key = `round-${round}-${kind}`
    writeFileSync(`${OUT}/${key}.json`, JSON.stringify({ meta, markdown: body }, null, 1))
    index.push({ round, kind, stage: meta.stage, file: key })
  }
  writeFileSync(`${OUT}/index.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), items: index }, null, 1))
  console.log(`analyses: ${files.length} файлов → ${index.map((i) => i.file).join(', ')}`)
}

main()
