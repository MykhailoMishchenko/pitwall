// inputs {useNextRace}, does {шапка: бренд + следующий этап + каунтдаун лока + статус пиков}, returns {Topbar}
import { Link } from 'react-router-dom'
import { useNextRace } from '../lib/api'
import { ClawdMark } from '../components/Clawd'
import { CountdownInline } from '../components/ui'

export function Topbar() {
  const { data: next } = useNextRace()
  return (
    <header className="topbar">
      <Link to="/" className="brand">
        <span className="sect"><i /><i /><i /></span>
        Pitwall
        <ClawdMark size={24} />
        <span className="by">BY CLAUDE</span>
      </Link>
      <div className="topmeta">
        {next && (
          <>
            <span className="hide-m">R{next.round} · <b>{next.circuit ?? next.raceName}</b></span>
            <span className="hide-m">{next.isSprint ? 'СПРИНТ-КВАЛА' : 'КВАЛА'} · {new Date(next.lockUtc).toLocaleString('uk-UA', { weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
            <span>ЛОК ЗА <CountdownInline targetUtc={next.lockUtc} /></span>
          </>
        )}
      </div>
      <div className="lockchip"><span className="dot" />ПІКИ НЕ ЗАФІКСОВАНІ</div>
    </header>
  )
}
