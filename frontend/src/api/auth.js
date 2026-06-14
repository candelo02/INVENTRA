import api from './client'

export const loginRequest   = (data) => api.post('/auth/login', data)
export const profileRequest = ()     => api.get('/auth/profile')
