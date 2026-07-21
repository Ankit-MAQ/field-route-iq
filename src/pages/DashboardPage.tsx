import { Link } from 'react-router-dom'
import { getAccount, getPromotions, getRoutes, getVisits } from '../data'

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function DashboardPage() {
  const now = new Date()
  const today = isoDate(now)
  const dayName = WEEKDAYS[now.getDay()]

  const todaysRoute = getRoutes().find((r) => r.day === dayName)

  const activePromos = getPromotions().filter(
    (p) => p.validFrom <= today && today <= p.validTo,
  )

  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const recentVisits = getVisits().filter((v) => v.date >= isoDate(weekAgo))

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="muted">
        {dayName}, {today}
      </p>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-value">
            {todaysRoute ? todaysRoute.stops.length : 0}
          </span>
          <span className="stat-label">Accounts on today's route</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activePromos.length}</span>
          <span className="stat-label">Active promotions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{recentVisits.length}</span>
          <span className="stat-label">Visits this week</span>
        </div>
      </div>

      <h2>Today's route</h2>
      {todaysRoute ? (
        <div className="card">
          <div className="card-title">
            <Link to={`/routes/${todaysRoute.id}`}>{todaysRoute.name}</Link>
          </div>
          <ol className="stop-list">
            {todaysRoute.stops.map((stop) => {
              const account = getAccount(stop.accountId)
              return (
                <li key={stop.accountId}>
                  <span className="stop-time">{stop.plannedTime}</span>
                  <Link to={`/accounts/${stop.accountId}`}>
                    {account?.name ?? stop.accountId}
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      ) : (
        <p className="muted">No route scheduled for {dayName}.</p>
      )}
    </div>
  )
}

export default DashboardPage
