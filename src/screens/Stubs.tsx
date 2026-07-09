// inputs {—}, does {экраны-заглушки фаз 1–2: структура по SPEC, наполнение по мере готовности движка}, returns {8 экранов}
import { useModel, useNextRace } from '../lib/api'
import { gpUa } from '../lib/teams'
import { Lbl, Panel, Placeholder } from '../components/ui'

function Screen({ no, title, children }: { no: string; title: string; children: React.ReactNode }) {
  return (
    <section className="screen">
      <div className="shead"><span className="rno">{no} / {title}</span></div>
      {children}
    </section>
  )
}

export function Weekend() {
  const { data: next } = useNextRace()
  return (
    <Screen no="02" title="ГОНОЧНИЙ ВІКЕНД">
      {next && <><h1>R{next.round} · {gpUa(next.country, next.raceName)}</h1><p className="sub">{next.circuit}</p></>}
      <div className="grid g-2" style={{ marginTop: 18 }}>
        <Placeholder title="ПРЕВʼЮ" text="Профіль траси (SC%, втрата на піті, обгони), форма, ціни, погода → чернетка піків v0. Зʼявиться після рутини превʼю (Вт–Ср)." chip="ЧЕКАЄ РУТИНИ" />
        <Placeholder title="ПІКИ" text="Фінальний склад фентезі + відповіді Predict з таймстемпами. Після лока — read-only назавжди." chip="ДО ЛОКА" />
      </div>
    </Screen>
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

export function League() {
  return (
    <Screen no="07" title="ЛІГА">
      <div className="grid g-2">
        <Placeholder title="ТАБЛИЦІ · FANTASY + PREDICT" text="PITWALL by Claude проти живих суперників. Дані ліги — з приватного API після Phase 0." chip="ЧЕКАЄ PHASE 0" />
        <Placeholder title="ПІКИ СУПЕРНИКІВ · ПІСЛЯ ЛОКА" text="Differential-піки, збіг із моделлю, позначки «людина обіграла модель» → прямо в learnings." chip="ПІСЛЯ ЛОКА" />
      </div>
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

export function Paddock() {
  return (
    <Screen no="12" title="ПАДДОК">
      <p className="sub" style={{ marginBottom: 18 }}>
        Людський шар чемпіонату. Залізне правило: кожен пункт або несе позначку
        «→ у моделі», або чесно помічений «шум/фан».
      </p>
      <div className="grid g-2">
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Placeholder title="SILLY SEASON · ТРЕКЕР ЧУТОК" text="Переходи, контракти, чутки — кожна з імовірністю від моделі та позначкою впливу на прогнози." chip="З R11" />
          <Placeholder title="АПГРЕЙДИ МАШИН" text="Хто що привіз на етап (преса + FIA-документи) → коригування pace-пріорів із позначкою «враховано в превʼю»." chip="MVP · СПА" />
          <Placeholder title="РАДІО-ПЕРЛИ" text="Топ team radio вікенду (OpenF1, безкоштовно після сесії) з коментарем: сигнал чи фан." chip="З R11" />
        </div>
        <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
          <Panel hot>
            <Lbl>КОЛОНКА CLAWD'А</Lbl>
            <p className="sub" style={{ fontSize: 13 }}>
              Хот-тейк тижня — думка без математики. Зʼявиться перед Спа; журнал
              чесно памʼятатиме і влучання, і промахи.
            </p>
          </Panel>
          <Placeholder title="ШТРАФНІ БАЛИ · ЛІЦЕНЗІЇ" text="Бали кожного пілота (12 = бан на гонку) і виданi штрафи → ризик-фактор фентезі-складу." chip="MVP · СПА" />
          <Placeholder title="FIA · ДОКУМЕНТИ" text="Офіційні рішення, директиви, протести по кожному етапу — автоматично з fia.com." chip="MVP · СПА" />
        </div>
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
