import { BoxIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register }  = useAuth()
  const navigate      = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.name)                errs.name     = 'El nombre es requerido'
    if (!form.email)               errs.email    = 'El email es requerido'
    if (form.password.length < 6)  errs.password = 'Mínimo 6 caracteres'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await register(form)
      toast.success('Cuenta creada correctamente')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrarse'
      toast.error(msg)
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
        <p className="auth-card__sub">Crea tu cuenta</p>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            id="name"
            label="Nombre completo"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Tu nombre"
            error={errors.name}
          />
          <Input
            id="email"
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            error={errors.email}
            autoComplete="email"
          />
          <Input
            id="password"
            label="Contraseña"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Mínimo 6 caracteres"
            error={errors.password}
            autoComplete="new-password"
          />
          <Button type="submit" loading={loading} className="btn--full">
            Crear cuenta
          </Button>
        </form>

        <p className="auth-card__footer">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
