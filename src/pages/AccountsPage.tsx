import { Link } from 'react-router-dom'
import { getAccounts } from '../data'

function AccountsPage() {
  return (
    <div>
      <h1>Accounts</h1>
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Segment</th>
            <th>Region</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          {getAccounts().map((account) => (
            <tr key={account.id}>
              <td>
                <Link to={`/accounts/${account.id}`}>{account.name}</Link>
              </td>
              <td>
                <span className={`badge badge-${account.segment}`}>
                  {account.segment}
                </span>
              </td>
              <td>{account.region}</td>
              <td>{account.address}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AccountsPage
