import { ShoppingCart } from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { createMovement, getMovements } from '../api/movements'
import { getProducts } from '../api/products'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useApi } from '../hooks/useApi'

const EMPTY = { productId: '', quantity: '', note: '' }

export default function SalesPage() {
  const { data: movements, loading: loadM, setData } = useApi(
    useCallback(() => getMovements(), [])
  )
  const { data: products, loading: loadP } = useApi(
    useCallback(() => getProducts(), [])
  )

  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  const selectedProduct = products?.find((p) => p._id === form.productId)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.productId) errs.productId = 'Selecciona un producto'
    if (!form.quantity || Number(form.quantity) < 1) errs.quantity = 'Cantidad mínima 1'
    if (selectedProduct && Number(form.quantity) > selectedProduct.quantity) {
      errs.quantity = `Stock disponible: ${selectedProduct.quantity}`
    }
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
        type:      'salida',
        quantity:  Number(form.quantity),
        note:      form.note || 'Venta',
      })
      setData((prev) => [data.data, ...(prev || [])])
      toast.success('Venta registrada correctamente')
      setModal(false)
      setForm(EMPTY)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al registrar venta')
    } finally {
      setSaving(false)
    }
  }

  // Total vendido hoy
  const today = new Date().toLocaleDateString('es-CO')
  const ventasHoy = movements?.filter(
    (m) => new Date(m.createdAt).toLocaleDateString('es-CO') === today
  ) || []
  const totalHoy = ventasHoy.reduce((sum, m) => sum + m.quantity, 0)

  if (loadM || loadP) return <div className="center-screen"><Spinner size={36} /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Registrar Venta</h2>
        <Button onClick={() => { setForm(EMPTY); setErrors({}); setModal(true) }}>
          <ShoppingCart size={16} /> Nueva venta
        </Button>
      </div>

      {/* Stats del día */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--green"><ShoppingCart size={22} /></div>
          <div>
            <p className="stat-card__label">Ventas hoy</p>
            <p className="stat-card__value">{ventasHoy.length}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--purple"><ShoppingCart size={22} /></div>
          <div>
            <p className="stat-card__label">Unidades vendidas hoy</p>
            <p className="stat-card__value">{totalHoy}</p>
          </div>
        </div>
      </div>

      {/* Historial de mis ventas */}
      <section className="section">
        <h3 className="section__title">Mis ventas</h3>
        {!movements?.length ? (
          <p className="empty-msg">Aún no has registrado ventas.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Nota</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {movements.map((m) => (
                  <tr key={m._id}>
                    <td>{m.product?.name ?? '—'}</td>
                    <td><Badge type="salida" />&nbsp;{m.quantity}</td>
                    <td>{m.note || '—'}</td>
                    <td>{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal venta */}
      <Modal open={modal} title="Registrar venta" onClose={() => setModal(false)}>
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
              <option value="">-- Seleccionar producto --</option>
              {products?.filter((p) => p.quantity > 0).map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — Stock: {p.quantity} — ${p.price?.toLocaleString('es-CO')}
                </option>
              ))}
            </select>
            {errors.productId && <span className="field__error">{errors.productId}</span>}
          </div>

          {selectedProduct && (
            <div className="product-preview">
              <span>Precio unitario: <strong>${selectedProduct.price?.toLocaleString('es-CO')}</strong></span>
              {form.quantity && (
                <span>Total: <strong>${(selectedProduct.price * Number(form.quantity)).toLocaleString('es-CO')}</strong></span>
              )}
            </div>
          )}

          <Input
            id="quantity"
            label="Cantidad"
            name="quantity"
            type="number"
            min="1"
            max={selectedProduct?.quantity || 9999}
            value={form.quantity}
            onChange={handleChange}
            error={errors.quantity}
            placeholder="0"
          />
          <Input
            id="note"
            label="Nota (opcional)"
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Ej: Cliente Juan"
          />

          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Confirmar venta</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
