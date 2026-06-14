import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MovementsPage from './pages/MovementsPage'
import ProductsPage from './pages/ProductsPage'
import RegisterPage from './pages/RegisterPage'
import SalesPage from './pages/SalesPage'
import UsersPage from './pages/UsersPage'

// Ruta solo para admin
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/sales" replace />
  return children
}

// Ruta solo para vendedor
function VendorRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { user } = useAuth()

  // Redirección por defecto según rol
  const defaultPath = user?.role === 'admin' ? '/dashboard' : '/sales'

  return (
    <Routes>
      {/* Públicas */}
      <Route path="/login"    element={user ? <Navigate to={defaultPath} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={defaultPath} /> : <RegisterPage />} />

      {/* Privadas */}
      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to={defaultPath} />} />

        {/* Admin */}
        <Route path="dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="movements" element={<AdminRoute><MovementsPage /></AdminRoute>} />
        <Route path="users"     element={<AdminRoute><UsersPage /></AdminRoute>} />

        {/* Compartida — admin ve sus productos con CRUD, vendedor ve catálogo */}
        <Route path="products"  element={<PrivateRoute><ProductsPage /></PrivateRoute>} />

        {/* Vendedor */}
        <Route path="sales"     element={<VendorRoute><SalesPage /></VendorRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={defaultPath} />} />
    </Routes>
  )
}
