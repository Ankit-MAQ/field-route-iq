import { Link } from 'react-router-dom'
import { getRoutes } from '../data'

function RoutesPage() {
  return (
    <div>
      <h1>Routes</h1>
      <div className="card-grid">
        {getRoutes().map((route) => (
          <div className="card" key={route.id}>
            <div className="card-title">
              <Link to={`/routes/${route.id}`}>{route.name}</Link>
            </div>
            <p className="muted">
              {route.day} · {route.stops.length} stops
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoutesPage
