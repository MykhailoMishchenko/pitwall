// inputs {analysis snapshots + next-race}, does {экран 02: навигация по раундам + превью (рендер анализа) / пики (скрыто до лока) / разбор}, returns {Weekend}
import { useEffect, useState } from 'react'
import { useAnalysis, useAnalysisIndex, useCalendar, useNextRace, raceTiming } from '../lib/api'
import { gpUa } from '../lib/teams'
import { Markdown } from '../components/Markdown'
import { Preview } from '../components/Preview'
import { PicksView } from '../components/Picks'
import { Lbl, Panel, useNow } from '../components/ui'

export default function Weekend() {
  const { data: next } = useNextRace()
  const { data: cal } = useCalendar()
  const { data: idx } = useAnalysisIndex()
  const [tab, setTab] = useState<'prev' | 'picks' | 'debrief'>('prev')
  const [round, setRound] = useState<number | undefined>(undefined)
  useNow(1000)

  // за умовчанням показуємо найближчий етап; після сезону — останній
  useEffect(() => {
    if (round != null || !cal) return
    setRound(next?.round ?? Number(cal.races[cal.races.length - 1]?.round))
  }, [cal, next, round])

  const races = cal?.races ?? []
  const minRound = races.length ? Number(races[0].round) : undefined
  const maxRound = next?.round ?? (races.length ? Number(races[races.length - 1].round) : undefined)
  const race = round != null ? races.find((r) => Number(r.round) === round) : undefined
  const timing = race ? raceTiming(race) : undefined

  const previewItem = idx?.items.find((i) => i.round === round && i.kind === 'preview')
  const debriefItem = idx?.items.find((i) => i.round === round && i.kind === 'debrief')
  const { data: preview } = useAnalysis(tab === 'prev' ? previewItem?.file : tab === 'debrief' ? debriefItem?.file : undefined)

  const locked = timing ? Date.now() >= new Date(timing.lockUtc).getTime() : false

  const TABS: [typeof tab, string][] = [['prev', 'Превʼю'], ['picks', 'Піки'], ['debrief', 'Розбір']]

  return (
    <section className="screen">
      <div className="shead"><span className="rno">02 / ГОНОЧНИЙ ВІКЕНД</span></div>
      {race && round != null && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
          <button
            onClick={() => setRound(round - 1)} disabled={minRound == null || round <= minRound}
            aria-label="Попередній етап"
            style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 3, color: round <= (minRound ?? round) ? 'var(--dim)' : 'var(--text)', width: 28, height: 28, cursor: round <= (minRound ?? round) ? 'default' : 'pointer', fontFamily: 'var(--disp)', fontSize: 16, marginBottom: 4 }}>
            ‹
          </button>
          <div>
            <h1>R{round} · {gpUa(race.Circuit?.Location?.country, race.raceName)}</h1>
            <p className="sub">{race.Circuit?.circuitName}</p>
          </div>
          <button
            onClick={() => setRound(round + 1)} disabled={maxRound == null || round >= maxRound}
            aria-label="Наступний етап"
            style={{ background: 'none', border: '1px solid var(--line)', borderRadius: 3, color: maxRound != null && round >= maxRound ? 'var(--dim)' : 'var(--text)', width: 28, height: 28, cursor: maxRound != null && round >= maxRound ? 'default' : 'pointer', fontFamily: 'var(--disp)', fontSize: 16, marginBottom: 4 }}>
            ›
          </button>
        </div>
      )}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--line)', margin: '18px 0' }}>
        {TABS.map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ background: 'none', border: 0, color: tab === t ? 'var(--text)' : 'var(--dim)', fontFamily: 'var(--disp)', fontSize: 15, letterSpacing: '.08em', textTransform: 'uppercase', padding: '9px 16px', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? 'var(--purple)' : 'transparent'}`, marginBottom: -1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'prev' && (
        preview ? (
          <>
            {previewItem?.stage && previewItem.stage !== 'final' && (
              <div style={{ marginBottom: 14 }}><span className="chip y">{previewItem.stage === 'preliminary' ? 'ПОПЕРЕДНЄ · ДО ПРАКТИК' : previewItem.stage.toUpperCase()}</span></div>
            )}
            {previewItem?.format === 'structured' ? <Preview data={preview} /> : <Panel><Markdown text={preview.markdown} /></Panel>}
          </>
        ) : (
          <Panel><Lbl>ПРЕВʼЮ</Lbl><p className="sub">Аналіз зʼявиться після рутини превʼю (Вт–Ср). Профіль траси, форма, ціни, погода → чернетка піків.</p></Panel>
        )
      )}

      {tab === 'picks' && round != null && <PicksView round={round} next={round === next?.round ? next : undefined} locked={locked} />}

      {tab === 'debrief' && (
        preview ? <Panel><Markdown text={preview.markdown} /></Panel>
          : <Panel><Lbl>РОЗБІР ПОЛЬОТІВ</Lbl><p className="sub">Зʼявиться в неділю ввечері: прогноз vs факт, очки, помилки моделі, learnings.</p></Panel>
      )}
    </section>
  )
}
