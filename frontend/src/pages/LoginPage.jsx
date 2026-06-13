import { BoxIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login }     = useAuth()
  const navigate      = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.email)    errs.email    = 'El email es requerido'
    if (!form.password) errs.password = 'La contraseña es requerida'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      await login(form)
      toast.success('¡Bienvenido!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Credenciales inválidas'
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
        <p className="auth-card__sub">Inicia sesión en tu cuenta</p>

        <form onSubmit={handleSubmit} noValidate>
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
            placeholder="••••••"
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" loading={loading} className="btn--full">
            Iniciar sesión
          </Button>
        </form>

        <p className="auth-card__footer">
          ¿No tienes cuenta?{' '}
          <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  )
}
