import { Filter, Plus, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { createMovement, getMovements } from '../api/movements'
import { getProducts } from '../api/products'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useApi } from '../hooks/useApi'

const EMPTY = { productId: '', type: 'entrada', quantity: '', note: '' }

const today = () => new Date().toISOString().split('T')[0]

export default function MovementsPage() {
  const { data: movements, loading: loadM, setData } = useApi(useCallback(() => getMovements(), []))
  const { data: products,  loading: loadP }          = useApi(useCallback(() => getProducts(), []))

  // ── Modal nuevo movimiento ─────────────────────────────────────────────────
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // ── Filtros ────────────────────────────────────────────────────────────────
  const [filterType,      setFilterType]      = useState('all')   // all | entrada | salida
  const [filterProduct,   setFilterProduct]   = useState('')
  const [filterDateFrom,  setFilterDateFrom]  = useState('')
  const [filterDateTo,    setFilterDateTo]    = useState('')
  const [filterPreset,    setFilterPreset]    = useState('all')   // all | today | week | month

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  // ── Aplicar filtros ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!movements) return []
    let list = [...movements]

    // Filtro por tipo
    if (filterType !== 'all') {
      list = list.filter((m) => m.type === filterType)
    }

    // Filtro por producto
    if (filterProduct) {
      list = list.filter((m) =>
        m.product?.name?.toLowerCase().includes(filterProduct.toLowerCase())
      )
    }

    // Filtro por preset de fecha
    const now = new Date()
    if (filterPreset === 'today') {
      list = list.filter((m) => {
        const d = new Date(m.createdAt)
        return d.toDateString() === now.toDateString()
      })
    } else if (filterPreset === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      list = list.filter((m) => new Date(m.createdAt) >= weekAgo)
    } else if (filterPreset === 'month') {
      list = list.filter((m) => {
        const d = new Date(m.createdAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
    }

    // Filtro por rango de fechas manual
    if (filterDateFrom) {
      list = list.filter((m) => new Date(m.createdAt) >= new Date(filterDateFrom))
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo)
      to.setHours(23, 59, 59)
      list = list.filter((m) => new Date(m.createdAt) <= to)
    }

    return list
  }, [movements, filterType, filterProduct, filterPreset, filterDateFrom, filterDateTo])

  // Totales del filtro activo
  const totalEntradas = filtered.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.quantity, 0)
  const totalSalidas  = filtered.filter((m) => m.type === 'salida').reduce((s, m) => s + m.quantity, 0)

  const clearFilters = () => {
    setFilterType('all')
    setFilterProduct('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterPreset('all')
  }

  const hasFilters = filterType !== 'all' || filterProduct || filterDateFrom || filterDateTo || filterPreset !== 'all'

  // ── Submit nuevo movimiento ────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!form.productId) errs.productId = 'Selecciona un producto'
    if (!form.quantity)  errs.quantity  = 'Cantidad requerida'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { data } = await createMovement({
        productId: form.productId,
        type:      form.type,
        quantity:  Number(form.quantity),
        note:      form.note,
      })
      setData((prev) => [data.data, ...(prev || [])])
      toast.success(`Movimiento de ${form.type} registrado`)
      setModal(false)
      setForm(EMPTY)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar')
    } finally {
      setSaving(false)
    }
  }

  if (loadM || loadP) return <div className="center-screen"><Spinner size={36} /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Movimientos</h2>
        <Button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true) }}>
          <Plus size={16} /> Registrar movimiento
        </Button>
      </div>

      {/* ── Panel de filtros ─────────────────────────────────────────────── */}
      <div className="filter-panel">
        <div className="filter-panel__header">
          <span className="filter-panel__title"><Filter size={15} /> Filtros</span>
          {hasFilters && (
            <button className="filter-clear" onClick={clearFilters}>
              <X size={13} /> Limpiar
            </button>
          )}
        </div>

        <div className="filter-panel__body">
          {/* Presets rápidos */}
          <div className="filter-presets">
            {[
              { value: 'all',   label: 'Todo' },
              { value: 'today', label: 'Hoy' },
              { value: 'week',  label: 'Última semana' },
              { value: 'month', label: 'Este mes' },
            ].map((p) => (
              <button
                key={p.value}
                className={`preset-btn ${filterPreset === p.value ? 'preset-btn--active' : ''}`}
                onClick={() => { setFilterPreset(p.value); setFilterDateFrom(''); setFilterDateTo('') }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="filter-row">
            {/* Tipo */}
            <div className="field" style={{ minWidth: 140 }}>
              <label className="field__label">Tipo</label>
              <select className="field__input" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">Todos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
              </select>
            </div>

            {/* Producto */}
            <div className="field" style={{ flex: 1 }}>
              <label className="field__label">Producto</label>
              <input
                className="field__input"
                placeholder="Buscar por nombre..."
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
              />
            </div>

            {/* Fecha desde */}
            <div className="field">
              <label className="field__label">Desde</label>
              <input
                className="field__input"
                type="date"
                value={filterDateFrom}
                max={filterDateTo || today()}
                onChange={(e) => { setFilterDateFrom(e.target.value); setFilterPreset('all') }}
              />
            </div>

            {/* Fecha hasta */}
            <div className="field">
              <label className="field__label">Hasta</label>
              <input
                className="field__input"
                type="date"
                value={filterDateTo}
                min={filterDateFrom}
                max={today()}
                onChange={(e) => { setFilterDateTo(e.target.value); setFilterPreset('all') }}
              />
            </div>
          </div>
        </div>

        {/* Resumen del filtro */}
        <div className="filter-summary">
          <span>{filtered.length} resultado(s)</span>
          <span className="filter-summary__item filter-summary__item--green">
            ↑ Entradas: {totalEntradas} uds
          </span>
          <span className="filter-summary__item filter-summary__item--red">
            ↓ Salidas: {totalSalidas} uds
          </span>
        </div>
      </div>

      {/* ── Tabla ─────────────────────────────────────────────────────────── */}
      {!filtered.length ? (
        <p className="empty-msg">
          {hasFilters ? 'Sin resultados para los filtros aplicados.' : 'Sin movimientos aún.'}
        </p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Nota</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m._id}>
                  <td>{m.product?.name ?? '—'}</td>
                  <td><Badge type={m.type} /></td>
                  <td>{m.quantity}</td>
                  <td>{m.note || '—'}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString('es-CO', {
                    day: '2-digit', month: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modal registrar ───────────────────────────────────────────────── */}
      <Modal open={modal} title="Registrar movimiento" onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label className="field__label" htmlFor="productId">Producto</label>
            <select
              id="productId"
              name="productId"
              className={`field__input ${errors.productId ? 'field__input--error' : ''}`}
              value={form.productId}
              onChange={handleChange}
            >
              <option value="">-- Seleccionar --</option>
              {products?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (stock: {p.quantity})
                </option>
              ))}
            </select>
            {errors.productId && <span className="field__error">{errors.productId}</span>}
          </div>

          <div className="field">
            <label className="field__label">Tipo</label>
            <div className="radio-group">
              {['entrada', 'salida'].map((t) => (
                <label key={t} className="radio-label">
                  <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </label>
              ))}
            </div>
          </div>

          <Input id="quantity" label="Cantidad" name="quantity" type="number" min="1"
            value={form.quantity} onChange={handleChange} error={errors.quantity} placeholder="0" />
          <Input id="note" label="Nota (opcional)" name="note"
            value={form.note} onChange={handleChange} placeholder="Ej: Proveedor X" />

          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
