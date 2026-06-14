import { Plus } from 'lucide-react'
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

const EMPTY = { productId: '', type: 'entrada', quantity: '', note: '' }

export default function MovementsPage() {
  const { data: movements, loading: loadM, setData } = useApi(useCallback(() => getMovements(), []))
  const { data: products,  loading: loadP }          = useApi(useCallback(() => getProducts(), []))

  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

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

      {!movements?.length ? (
        <p className="empty-msg">Sin movimientos aún.</p>
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
              {movements.map((m) => (
                <tr key={m._id}>
                  <td>{m.product?.name ?? '—'}</td>
                  <td><Badge type={m.type} /></td>
                  <td>{m.quantity}</td>
                  <td>{m.note || '—'}</td>
                  <td>{new Date(m.createdAt).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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

          <Input id="quantity" label="Cantidad" name="quantity" type="number" min="1" value={form.quantity} onChange={handleChange} error={errors.quantity} placeholder="0" />
          <Input id="note"     label="Nota (opcional)" name="note" value={form.note} onChange={handleChange} placeholder="Ej: Proveedor X" />

          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Registrar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
