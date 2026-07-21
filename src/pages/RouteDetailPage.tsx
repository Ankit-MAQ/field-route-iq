import { Link, useParams } from 'react-router-dom'
import { getAccount, getRoutes } from '../data'

function RouteDetailPage() {
  const { id } = useParams()
  const route = getRoutes().find((r) => r.id === id)

  if (!route) {
    return (
      <div>
        <h1>Route not found</h1>
        <Link to="/routes">Back to routes</Link>
      </div>
    )
  }

  return (
    <div>
      <h1>{route.name}</h1>
      <p className="muted">{route.day}</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Time</th>
            <th>Account</th>
            <th>Segment</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {route.stops.map((stop, i) => {
            const account = getAccount(stop.accountId)
            return (
              <tr key={stop.accountId}>
                <td>{i + 1}</td>
                <td>{stop.plannedTime}</td>
                <td>
                  <Link to={`/accounts/${stop.accountId}`}>
                    {account?.name ?? stop.accountId}
                  </Link>
                </td>
                <td>{account?.segment ?? '—'}</td>
                <td>{account?.address ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default RouteDetailPage
