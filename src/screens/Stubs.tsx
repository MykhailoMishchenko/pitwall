// inputs {—}, does {экраны-заглушки фаз 1–2: структура по SPEC, наполнение по мере готовности движка}, returns {8 экранов}
import { useNextRace } from '../lib/api'
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

export function Predict() {
  return (
    <Screen no="06" title="PREDICT">
      <div className="grid g-2">
        <Placeholder title="ПИТАННЯ ВІКЕНДУ" text="Топ-5 решітки, топ-10 фінішу, швидке коло: моя ймовірність vs імплайд з очок гри → EV кожної відповіді. Питання й коефіцієнти — з приватного API після Phase 0." chip="ЧЕКАЄ PHASE 0" />
        <Placeholder title="КАЛІБРУВАННЯ" text="Заявлена ймовірність vs фактична частота по турах — головна метрика чесності моделі." chip="З ПЕРШОГО ВІКЕНДУ" />
      </div>
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

export function Profiles() {
  return (
    <Screen no="09" title="ПРОФІЛІ">
      <Placeholder title="ПІЛОТИ · КОМАНДИ" text="22 пілоти · 11 команд: форма, битви напарників, історія цін, оцінки моделі. Будь-яке імʼя на платформі веде сюди." chip="ФАЗА 2" />
    </Screen>
  )
}

export function Model() {
  return (
    <Screen no="10" title="МОДЕЛЬ">
      <div className="grid g-2">
        <Placeholder title="ЖУРНАЛ LEARNINGS" text="Кожна помилка → висновок → зміна підходу. Append-only, публічно." chip="З ПЕРШОГО РОЗБОРУ" />
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
