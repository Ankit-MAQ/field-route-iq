import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import DashboardPage from './pages/DashboardPage'
import RoutesPage from './pages/RoutesPage'
import RouteDetailPage from './pages/RouteDetailPage'
import AccountsPage from './pages/AccountsPage'
import AccountDetailPage from './pages/AccountDetailPage'
import PromotionsPage from './pages/PromotionsPage'
import VisitsPage from './pages/VisitsPage'
import OrderPage from './pages/OrderPage'

function App() {
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">Field Route IQ</span>
        <nav className="mainnav">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/routes">Routes</NavLink>
          <NavLink to="/accounts">Accounts</NavLink>
          <NavLink to="/promotions">Promotions</NavLink>
          <NavLink to="/visits">Visits</NavLink>
        </nav>
        <NavLink to="/orders/new" className="new-order-link">
          + New Order
        </NavLink>
      </header>
      <main className="content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/routes/:id" element={<RouteDetailPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/accounts/:id" element={<AccountDetailPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          <Route path="/visits" element={<VisitsPage />} />
          <Route path="/orders/new" element={<OrderPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
