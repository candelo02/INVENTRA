import { KeyRound, Plus, Trash2, Users } from 'lucide-react'
import { useCallback, useState } from 'react'
import toast from 'react-hot-toast'
import { createUser, deleteUser, getUsers, resetPassword } from '../api/users'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { useApi } from '../hooks/useApi'

const EMPTY_USER = { name: '', email: '', password: '' }
const EMPTY_PASS = { password: '' }

export default function UsersPage() {
  const { data: users, loading, setData } = useApi(useCallback(() => getUsers(), []))

  const [modalCreate, setModalCreate] = useState(false)
  const [modalReset, setModalReset]   = useState(null)
  const [form, setForm]               = useState(EMPTY_USER)
  const [passForm, setPassForm]       = useState(EMPTY_PASS)
  const [saving, setSaving]           = useState(false)
  const [errors, setErrors]           = useState({})

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name)               errs.name     = 'Nombre requerido'
    if (!form.email)              errs.email    = 'Email requerido'
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setSaving(true)
    try {
      const { data } = await createUser(form)
      setData((prev) => [data.data, ...(prev || [])])
      toast.success(`Usuario ${data.data.name} creado`)
      setModalCreate(false)
      setForm(EMPTY_USER)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al crear usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`¿Eliminar al usuario ${name}?`)) return
    try {
      await deleteUser(id)
      setData((prev) => prev.filter((u) => u._id !== id))
      toast.success('Usuario eliminado')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al eliminar')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passForm.password.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setSaving(true)
    try {
      await resetPassword(modalReset, { password: passForm.password })
      toast.success('Contraseña actualizada')
      setModalReset(null)
      setPassForm(EMPTY_PASS)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="center-screen"><Spinner size={36} /></div>

  return (
    <div className="page">
      <div className="page__header">
        <h2 className="page__title">Usuarios</h2>
        <Button onClick={() => { setForm(EMPTY_USER); setErrors({}); setModalCreate(true) }}>
          <Plus size={16} /> Nuevo usuario
        </Button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card__icon stat-card__icon--blue"><Users size={22} /></div>
          <div>
            <p className="stat-card__label">Total usuarios</p>
            <p className="stat-card__value">{users?.length ?? 0}</p>
          </div>
        </div>
      </div>

      {!users?.length ? (
        <p className="empty-msg">No hay usuarios registrados.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString('es-CO')}</td>
                  <td className="table__actions">
                    <button className="icon-btn icon-btn--edit" onClick={() => { setModalReset(u._id); setPassForm(EMPTY_PASS) }} title="Resetear contraseña">
                      <KeyRound size={15} />
                    </button>
                    <button className="icon-btn icon-btn--delete" onClick={() => handleDelete(u._id, u.name)} title="Eliminar">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalCreate} title="Nuevo usuario" onClose={() => setModalCreate(false)}>
        <form onSubmit={handleCreate} noValidate>
          <Input id="name"     label="Nombre completo" name="name"     value={form.name}     onChange={handleChange} error={errors.name}     placeholder="Juan Pérez" />
          <Input id="email"    label="Email"            name="email"    value={form.email}    onChange={handleChange} error={errors.email}    type="email" placeholder="usuario@email.com" />
          <Input id="password" label="Contraseña"       name="password" value={form.password} onChange={handleChange} error={errors.password} type="password" placeholder="Mínimo 6 caracteres" />
          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModalCreate(false)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Crear usuario</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!modalReset} title="Resetear contraseña" onClose={() => setModalReset(null)}>
        <form onSubmit={handleResetPassword} noValidate>
          <Input id="newpass" label="Nueva contraseña" name="password" type="password" value={passForm.password} onChange={(e) => setPassForm({ password: e.target.value })} placeholder="Mínimo 6 caracteres" />
          <div className="modal__footer">
            <Button type="button" variant="ghost" onClick={() => setModalReset(null)}>Cancelar</Button>
            <Button type="submit" loading={saving}>Actualizar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
