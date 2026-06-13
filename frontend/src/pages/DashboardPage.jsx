import { AlertTriangle, BoxIcon, TrendingDown, TrendingUp } from 'lucide-react'
import { useCallback } from 'react'
import { getMovements } from '../api/movements'
import { getProducts } from '../api/products'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../context/AuthContext'
import { useApi } from '../hooks/useApi'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const { data: products, loading: loadP } = useApi(useCallback(() => getProducts(), []))
  const { data: movements, loading: loadM } = useApi(useCallback(() => getMovements(), []))

  const totalProducts  = products?.length ?? 0
  const totalStock     = products?.reduce((s, p) => s + p.quantity, 0) ?? 0
  const lowStock       = products?.filter((p) => p.quantity <= 5) ?? []
  const entradas       = movements?.filter((m) => m.type === 'entrada').length ?? 0
  const salidas        = movements?.filter((m) => m.type === 'salida').length ?? 0

  if (loadP || loadM) return <div className="center-screen"><Spinner size={36} /></div>

  return (
    <div className="page">
      <h2 className="page__title">Bienvenido, {user?.name} 👋</h2>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={BoxIcon}      label="Productos"    value={totalProducts} color="blue"   />
        <StatCard icon={BoxIcon}      label="Stock total"  value={totalStock}    color="purple" />
        <StatCard icon={TrendingUp}   label="Entradas"     value={entradas}      color="green"  />
        <StatCard icon={TrendingDown} label="Salidas"      value={salidas}       color="red"    />
      </div>

      {/* Alerta stock bajo */}
      {lowStock.length > 0 && (
        <div className="alert alert--warning">
          <AlertTriangle size={18} />
          <strong>{lowStock.length} producto(s)</strong> con stock ≤ 5 unidades:&nbsp;
          {lowStock.map((p) => p.name).join(', ')}
        </div>
      )}

      {/* Últimos movimientos */}
      <section className="section">
        <h3 className="section__title">Últimos movimientos</h3>
        {movements?.length === 0 ? (
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
                {movements?.slice(0, 8).map((m) => (
                  <tr key={m._id}>
                    <td>{m.product?.name ?? '—'}</td>
                    <td><Badge type={m.type} /></td>
                    <td>{m.quantity}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
