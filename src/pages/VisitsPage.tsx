import { Link } from 'react-router-dom'
import { getAccount, getVisits } from '../data'
import { getOrders } from '../state/orders'

interface LogEntry {
  key: string
  date: string
  accountId: string
  kind: 'visit' | 'order'
  summary: string
  detail?: string
}

function VisitsPage() {
  const entries: LogEntry[] = [
    ...getVisits().map((v) => ({
      key: v.id,
      date: v.date,
      accountId: v.accountId,
      kind: 'visit' as const,
      summary: v.notes,
      detail: `shelf score ${v.shelfScore}/5`,
    })),
    ...getOrders().map((o, i) => ({
      key: `order-${i}`,
      date: o.date,
      accountId: o.accountId,
      kind: 'order' as const,
      summary: `Order placed — ${o.lines.length} line${o.lines.length === 1 ? '' : 's'}`,
      detail: `total ${o.total.toFixed(2)}`,
    })),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <h1>Visit log</h1>
      <ul className="visit-list">
        {entries.map((entry) => {
          const account = getAccount(entry.accountId)
          return (
            <li className="card" key={entry.key}>
              <div className="visit-head">
                <span>
                  <strong>{entry.date}</strong>{' '}
                  <Link to={`/accounts/${entry.accountId}`}>
                    {account?.name ?? entry.accountId}
                  </Link>
                </span>
                <span>
                  <span
                    className={`badge ${entry.kind === 'order' ? 'badge-type' : ''}`}
                  >
                    {entry.kind}
                  </span>{' '}
                  {entry.detail && (
                    <span className="muted">{entry.detail}</span>
                  )}
                </span>
              </div>
              <p>{entry.summary}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default VisitsPage
