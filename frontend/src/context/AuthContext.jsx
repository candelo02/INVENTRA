import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { loginRequest, profileRequest, registerRequest } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  // Verificar token al montar
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      profileRequest()
        .then(({ data }) => setUser(data.data))
        .catch(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const { data } = await loginRequest(credentials)
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data))
    setUser(data.data)
    return data.data
  }, [])

  const register = useCallback(async (credentials) => {
    const { data } = await registerRequest(credentials)
    localStorage.setItem('token', data.data.token)
    localStorage.setItem('user', JSON.stringify(data.data))
    setUser(data.data)
    return data.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
