import { Edit2, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api/products'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useApi } from '../hooks/useApi'

const EMPTY = { name: '', description: '', quantity: '', price: '' }

export default function ProductsPage() {
  const { data: products, loading, setData } = useApi(useCallback(() => getProducts(), []))

  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState({})

  const openCreate = () => { setEditing(null); setForm(EMPTY); setErrors({}); setModal(true) }
  const openEdit   = (p) => {
    setEditing(p)
    setForm({ name: p.name, description: p.description || '', quantity: p.quantity, price: p.price })
    setErrors({})
    setModal(true)
  }

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name)           errs.name     = 'Nombre requerido'
    if (form.quantity === '')  errs.quantity = 'Cantidad requerida'
    if (form.price === '')     errs.price    = 'Precio requerido'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const payload = {
        name:        form.name,
        description: form.description,
        quantity:    Number(form.quantity),
        price:       Number(form.price),
      }
      if (editing) {
        const { data } = await updateProduct(editing._id, payload)
        setData((prev) => prev.map((p) => (p._id === editing._id ? data.data : p)))
        toast.success('Producto actualizado')
      } else {
        const { data } = await createProduct(payload)
        setData((prev) => [data.data, ...(prev || [])])
        toast.success('Producto creado')
      }
      setModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await deleteProduct(id)
      setData((prev) => prev.filter((p) => p._id !== id))
      toast.success('Producto eliminado')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  if (loading) return <div className="center-screen"><Spinner size={36} /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Productos</h2>
        <Button onClick={openCreate}><Plus size={16} /> Nuevo producto</Button>
      </div>

      {!products?.length ? (
        <div className="empty-state">
          <p>No hay productos aún.</p>
          <Button onClick={openCreate}><Plus size={16} /> Crear producto</Button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Stock</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className={p.quantity <= 5 ? 'row--warning' : ''}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.description || '—'}</td>
                  <td><span className={`stock ${p.quantity <= 5 ? 'stock--low' : ''}`}>{p.quantity}</span></td>
                  <td>${p.price?.toLocaleString('es-CO')}</td>
                  <td className="table__actions">
                    <button className="icon-btn icon-btn--edit"   onClick={() => openEdit(p)}        title="Editar"><Edit2  size={15} /></button>
                    <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(p._id)} title="Eliminar"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal} title={editing ? 'Editar producto' : 'Nuevo producto'} onClose={() => setModal(false)}>
        <form onSubmit={handleSubmit} noValidate>
          <Input id="name"        label="Nombre"      name="name"        value={form.name}        onChange={handleChange} error={errors.name}     placeholder="Ej: Camiseta" />
          <Input id="description" label="Descripción" name="description" value={form.description} onChange={handleChange}                          placeholder="Opcional" />
          <Input id="quantity"    label="Stock"       name="quantity"    value={form.quantity}    onChange={handleChange} error={errors.quantity} type="number" min="0" placeholder="0" />
          <Input id="price"       label="Precio"      name="price"       value={form.price}       onChange={handleChange} error={errors.price}    type="number" min="0" placeholder="0" />
          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>{editing ? 'Guardar cambios' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
