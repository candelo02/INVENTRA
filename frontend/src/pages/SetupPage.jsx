import { BoxIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export default function SetupPage() {
  const navigate              = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name)               errs.name     = 'Nombre requerido'
    if (!form.email)              errs.email    = 'Email requerido'
    if (form.password.length < 6) errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/setup', form)
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('user', JSON.stringify(data.data))
      toast.success('¡Sistema configurado! Bienvenido administrador.')
      window.location.href = '/dashboard'
    } catch (err) {
      if (err.response?.status === 403) {
        toast.error('El sistema ya tiene un administrador. Inicia sesión.')
        navigate('/login')
      } else {
        toast.error(err.response?.data?.message || 'Error al configurar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-card__brand">
          <BoxIcon size={32} />
          <h1>Inventra</h1>
        </div>
        <p className="auth-card__sub">Configuración inicial — Crear administrador</p>

        <div className="alert alert--warning" style={{ marginBottom: '1.25rem' }}>
          Este formulario solo está disponible la primera vez que se configura el sistema.
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input id="name"     label="Nombre completo" name="name"     value={form.name}     onChange={handleChange} error={errors.name}     placeholder="Nombre del administrador" />
          <Input id="email"    label="Email"            name="email"    value={form.email}    onChange={handleChange} error={errors.email}    type="email" placeholder="admin@empresa.com" />
          <Input id="password" label="Contraseña"       name="password" value={form.password} onChange={handleChange} error={errors.password} type="password" placeholder="Mínimo 6 caracteres" />
          <Button type="submit" loading={loading} className="btn--full">
            Crear administrador
          </Button>
        </form>
      </div>
    </div>
  )
}
