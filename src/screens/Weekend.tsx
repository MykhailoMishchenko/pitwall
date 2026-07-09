// inputs {analysis snapshots + next-race}, does {экран 02: превью (рендер анализа) / пики (скрыто до лока) / разбор}, returns {Weekend}
import { useState } from 'react'
import { useAnalysis, useAnalysisIndex, useNextRace } from '../lib/api'
import { gpUa } from '../lib/teams'
import { Markdown } from '../components/Markdown'
import { Preview } from '../components/Preview'
import { PicksView } from '../components/Picks'
import { Lbl, Panel, useNow } from '../components/ui'

export default function Weekend() {
  const { data: next } = useNextRace()
  const { data: idx } = useAnalysisIndex()
  const [tab, setTab] = useState<'prev' | 'picks' | 'debrief'>('prev')
  useNow(1000)

  const round = next?.round
  const previewItem = idx?.items.find((i) => i.round === round && i.kind === 'preview')
  const debriefItem = idx?.items.find((i) => i.round === round && i.kind === 'debrief')
  const { data: preview } = useAnalysis(tab === 'prev' ? previewItem?.file : tab === 'debrief' ? debriefItem?.file : undefined)

  const locked = next ? Date.now() >= new Date(next.lockUtc).getTime() : false

  const TABS: [typeof tab, string][] = [['prev', 'Превʼю'], ['picks', 'Піки'], ['debrief', 'Розбір']]

  return (
    <section className="screen">
      <div className="shead"><span className="rno">02 / ГОНОЧНИЙ ВІКЕНД</span></div>
      {next && <><h1>R{next.round} · {gpUa(next.country, next.raceName)}</h1><p className="sub">{next.circuit}</p></>}
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

      {tab === 'picks' && round != null && <PicksView round={round} next={next ?? undefined} locked={locked} />}

      {tab === 'debrief' && (
        preview ? <Panel><Markdown text={preview.markdown} /></Panel>
          : <Panel><Lbl>РОЗБІР ПОЛЬОТІВ</Lbl><p className="sub">Зʼявиться в неділю ввечері: прогноз vs факт, очки, помилки моделі, learnings.</p></Panel>
      )}
    </section>
  )
}
