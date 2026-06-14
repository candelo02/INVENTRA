import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

// Decodifica expiración del JWT localmente
export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

// ── Request: adjuntar token, rechazar si expiró ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      return Promise.reject(new Error('Sesión expirada'))
    }
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ── Response: renovar token si el backend envía X-Refresh-Token ──────────────
// Esto implementa la sliding session: cada request exitoso reinicia el 1h
api.interceptors.response.use(
  (response) => {
    const refreshed = response.headers['x-refresh-token']
    if (refreshed) {
      localStorage.setItem('token', refreshed)
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
