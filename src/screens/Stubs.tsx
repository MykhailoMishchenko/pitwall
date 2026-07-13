// inputs {—}, does {экраны-заглушки фаз 1–2: структура по SPEC, наполнение по мере готовности движка}, returns {8 экранов}
import { useModel } from '../lib/api'
import { Lbl, Panel, Placeholder } from '../components/ui'

function Screen({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section className="screen">
      <div className="shead"><span className="rno">{no} / {title}</span></div>
      {children}
    </section>
  )
}

export function Live() {
  return (
    <Screen no="03" title="LIVE · REPLAY">
      <Placeholder title="REPLAY-ЦЕНТР" text="Карта траси з точками пілотів (OpenF1 location), таймінг, race control, радіо, погода. Фаза 2: інжест OpenF1 у снапшоти + клієнтський курсор часу. Live — фаза 3 (платний тариф OpenF1)." chip="ФАЗА 2" />
    </Screen>
  )
}

export function Strategy() {
  return (
    <Screen no="04" title="СТРАТЕГІЧНА ДОШКА">
      <Placeholder title="СТІНТИ · ВІКНА ПІТ-СТОПІВ · UNDERCUT" text="Таймлайни стінтів усіх машин (OpenF1 stints/pit), undercut-калькулятор, модель вікон піт-стопів. Живе разом із Replay-центром." chip="ФАЗА 2" />
    </Screen>
  )
}

export function Model() {
  const { data } = useModel()
  return (
    <Screen no="10" title="МОДЕЛЬ">
      <div className="grid g-2">
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel>
            <Lbl right={<span className="chip p">{data?.promptVersion ?? '—'}</span>}>ЖУРНАЛ LEARNINGS · APPEND-ONLY</Lbl>
            {!data?.learnings.length && <p className="sub" style={{ fontSize: 12.5 }}>Порожньо — перший запис зʼявиться після першого розбору чи фідбеку.</p>}
            {data?.learnings.map((l) => (
              <div key={l.id} style={{ borderLeft: '2px solid var(--purple)', padding: '2px 0 2px 12px', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
                  <span className="num" style={{ fontSize: 11, color: 'var(--faint)' }}>#{l.id} · {l.date}</span>
                  <b style={{ fontSize: 13.5 }}>{l.title}</b>
                </div>
                <p className="sub" style={{ fontSize: 12.5, marginTop: 4 }}>{l.text}</p>
                <p style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>→ {l.applied}</p>
              </div>
            ))}
          </Panel>
        </div>
        <Panel>
          <Lbl>ЧЕСНІСТЬ</Lbl>
          <p className="sub" style={{ fontSize: 12.5 }}>
            Піки поточного ГП приховані до дедлайну навіть тут. Усе інше — прогнози,
            помилки, метрики — публічне завжди. Пропущений дедлайн фіксується як
            пропуск: бекдейтів не існує.
          </p>
        </Panel>
      </div>
    </Screen>
  )
}

export function Favorites() {
  return (
    <Screen no="11" title="ФАВОРИТИ">
      <div className="grid g-2">
        <Panel hot>
          <Lbl>УЛЮБЛЕНИЙ ГОНЩИК CLAUDE</Lbl>
          <h1 style={{ fontSize: 34, color: 'var(--faint)' }}>ЩЕ НЕ ОБРАНИЙ</h1>
          <p className="sub">Вибір буде зроблено чесно — після повного занурення в сезон на превʼю. З обґрунтуванням.</p>
        </Panel>
        <Panel>
          <Lbl>УЛЮБЛЕНА КОМАНДА CLAUDE</Lbl>
          <h1 style={{ fontSize: 34, color: 'var(--faint)' }}>ЩЕ НЕ ОБРАНА</h1>
          <p className="sub">Симпатія ≠ прогноз: фаворит не отримує бонусів у моделі.</p>
        </Panel>
      </div>
      <div style={{ marginTop: 14 }}>
        <Placeholder title="ЖУРНАЛ СИМПАТІЙ" text="Кожен перегляд вибору логується: дата, гонка-тригер, причина. Сталість теж вимірна." />
      </div>
    </Screen>
  )
}
