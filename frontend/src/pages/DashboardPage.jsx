import {
  AlertTriangle,
  BoxIcon,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovements } from '../api/movements'
import { getProducts } from '../api/products'
import { getUsers } from '../api/users'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'

const ADMIN_EMAIL = 'candeloj2002@gmail.com'

function StatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <div
      className={`stat-card ${onClick ? 'stat-card--clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
        {onClick && <p className="stat-card__hint">Ver más →</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const isAdmin    = user?.email === ADMIN_EMAIL

  const { data: products,  loading: loadP } = useApi(useCallback(() => getProducts(), []))
  const { data: movements, loading: loadM } = useApi(useCallback(() => getMovements(), []))
  const { data: users,     loading: loadU } = useApi(
    useCallback(() => (isAdmin ? getUsers() : Promise.resolve({ data: { data: [] } })), [isAdmin])
  )

  const totalProducts = products?.length ?? 0
  const totalStock    = products?.reduce((s, p) => s + p.quantity, 0) ?? 0
  const lowStock      = products?.filter((p) => p.quantity <= 5) ?? []
  const entradas      = movements?.filter((m) => m.type === 'entrada').length ?? 0
  const salidas       = movements?.filter((m) => m.type === 'salida').length ?? 0
  const totalUsuarios = users?.length ?? 0

  if (loadP || loadM || (isAdmin && loadU)) {
    return <div className="center-screen"><Spinner size={36} /></div>
  }

  return (
    <div className="page">
      <h2 className="page__title" style={{ marginBottom: '1.5rem' }}>
        Bienvenido, {user?.name} 👋
      </h2>

      <div className="stats-grid">
        <StatCard
          icon={BoxIcon}
          label="Productos"
          value={totalProducts}
          color="blue"
          onClick={() => navigate('/products')}
        />
        <StatCard
          icon={BoxIcon}
          label="Stock total"
          value={totalStock}
          color="purple"
          onClick={() => navigate('/products')}
        />
        <StatCard
          icon={TrendingUp}
          label="Entradas"
          value={entradas}
          color="green"
          onClick={() => navigate('/movements')}
        />
        <StatCard
          icon={TrendingDown}
          label="Salidas"
          value={salidas}
          color="red"
          onClick={() => navigate('/movements')}
        />
        {isAdmin && (
          <StatCard
            icon={Users}
            label="Usuarios"
            value={totalUsuarios}
            color="blue"
            onClick={() => navigate('/users')}
          />
        )}
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert--warning">
          <AlertTriangle size={18} />
          <strong>{lowStock.length} producto(s)</strong> con stock ≤ 5:&nbsp;
          {lowStock.map((p) => p.name).join(', ')}
        </div>
      )}

      <section className="section">
        <h3 className="section__title">Últimos movimientos</h3>
        {!movements?.length ? (
          <p className="empty-msg">Sin movimientos registrados aún.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.slice(0, 10).map((m) => (
                  <tr
                    key={m._id}
                    className="row--hover"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/movements')}
                  >
                    <td>{m.product?.name ?? '—'}</td>
                    <td><Badge type={m.type} /></td>
                    <td>{m.quantity}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: '.75rem 1rem', borderTop: '1px solid var(--border)' }}>
              <button
                className="btn btn--ghost"
                style={{ fontSize: '.85rem', padding: '.35rem .85rem' }}
                onClick={() => navigate('/movements')}
              >
                Ver todos los movimientos →
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
