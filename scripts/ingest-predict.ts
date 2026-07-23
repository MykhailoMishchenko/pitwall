// inputs {открытый фид вопросов Predict}, does {тянет доступные раунды вопросов в public/data/predict}, returns {лог}
import { mkdirSync, writeFileSync } from 'node:fs'

const OUT = 'public/data/predict'
// 25 = сезонный бонус-раунд (всегда доступен); гоночные раунды открываются перед этапом
const ROUNDS = [10, 11, 25]

async function pull(round: number): Promise<any | null> {
  const url = `https://f1predict.formula1.com/feeds/questions/questions_${round}_en.json?buster=${Date.now()}`
  const res = await fetch(url)
  if (!res.ok) return null
  return res.json()
}

async function main() {
  mkdirSync(OUT, { recursive: true })
  const available: number[] = []
  for (const r of ROUNDS) {
    const j = await pull(r)
    const questions = j?.Data?.Value?.Questions
    if (Array.isArray(questions) && questions.length) {
      writeFileSync(`${OUT}/round-${r}.json`, JSON.stringify({ round: r, fetchedAt: new Date().toISOString(), questions }, null, 1))
      available.push(r)
    }
  }
  writeFileSync(`${OUT}/index.json`, JSON.stringify({ fetchedAt: new Date().toISOString(), rounds: available }, null, 1))
  console.log(`predict: доступные раунды вопросов — ${available.join(', ') || 'нет (гоночный раунд ещё не открыт)'}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
