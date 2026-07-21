import { Link, useParams } from 'react-router-dom'
import { getAccount, getVisits } from '../data'

function AccountDetailPage() {
  const { id } = useParams()
  const account = id ? getAccount(id) : undefined

  if (!account) {
    return (
      <div>
        <h1>Account not found</h1>
        <Link to="/accounts">Back to accounts</Link>
      </div>
    )
  }

  const visits = getVisits()
    .filter((v) => v.accountId === account.id)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      <h1>{account.name}</h1>
      <p className="muted">
        <span className={`badge badge-${account.segment}`}>
          {account.segment}
        </span>{' '}
        · {account.region} · {account.address}
      </p>

      <h2>Visit history</h2>
      {visits.length === 0 ? (
        <p className="muted">No visits recorded.</p>
      ) : (
        <ul className="visit-list">
          {visits.map((visit) => (
            <li className="card" key={visit.id}>
              <div className="visit-head">
                <strong>{visit.date}</strong>
                <span className="muted">shelf score {visit.shelfScore}/5</span>
              </div>
              <p>{visit.notes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AccountDetailPage
