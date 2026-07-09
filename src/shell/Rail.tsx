// inputs {—}, does {навигация: 4 группы, 11 экранов}, returns {Rail}
import { NavLink } from 'react-router-dom'

const GROUPS: { title: string; items: [string, string, string][] }[] = [
  { title: 'ВІКЕНД', items: [['/', 'Дашборд', '01'], ['/weekend', 'Гоночний вікенд', '02'], ['/live', 'Live / Replay', '03'], ['/strategy', 'Стратегія', '04']] },
  { title: 'ІГРИ', items: [['/fantasy', 'Фентезі', '05'], ['/predict', 'Predict', '06'], ['/league', 'Ліга', '07']] },
  { title: 'СЕЗОН', items: [['/championship', 'Чемпіонат', '08'], ['/profiles', 'Профілі', '09'], ['/paddock', 'Паддок', '12']] },
  { title: 'РУШІЙ', items: [['/model', 'Модель', '10'], ['/favorites', 'Фаворити', '11']] },
]

export function Rail() {
  return (
    <nav className="rail">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <div className="grp">{g.title}</div>
          {g.items.map(([to, label, k]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'on' : '')} end={to === '/'}>
              {label}<span className="k">{k}</span>
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}
