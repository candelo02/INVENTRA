import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MovementsPage from './pages/MovementsPage'
import ProductsPage from './pages/ProductsPage'
import SalesPage from './pages/SalesPage'
import SetupPage from './pages/SetupPage'
import UsersPage from './pages/UsersPage'

function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/sales" replace />
  return children
}

function VendorRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()
  const defaultPath = user?.role === 'admin' ? '/dashboard' : '/sales'

  return (
    <Routes>
      {/* Setup inicial — crear primer admin */}
      <Route path="/setup" element={user ? <Navigate to={defaultPath} /> : <SetupPage />} />

      {/* Login */}
      <Route path="/login" element={user ? <Navigate to={defaultPath} /> : <LoginPage />} />

      {/* Privadas */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to={defaultPath} />} />

        <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="movements" element={<AdminRoute><MovementsPage /></AdminRoute>} />
        <Route path="users"     element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="products"  element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
        <Route path="sales"     element={<VendorRoute><SalesPage /></VendorRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={user ? defaultPath : '/login'} />} />
    </Routes>
  )
}
