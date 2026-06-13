import api from './client'

export const loginRequest    = (data) => api.post('/auth/login', data)
export const registerRequest = (data) => api.post('/auth/register', data)
export const profileRequest  = ()     => api.get('/auth/profile')
