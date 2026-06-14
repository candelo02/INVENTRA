import { Navigate, Route, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute'
import { useAuth } from './context/AuthContext'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import MovementsPage from './pages/MovementsPage'
import ProductsPage from './pages/ProductsPage'
import SetupPage from './pages/SetupPage'
import UsersPage from './pages/UsersPage'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/setup" element={user ? <Navigate to="/dashboard" /> : <SetupPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />

      <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products"  element={<ProductsPage />} />
        <Route path="movements" element={<MovementsPage />} />
        <Route path="users"     element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  )
}
