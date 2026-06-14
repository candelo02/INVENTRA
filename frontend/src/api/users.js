import api from './client'

export const getUsers    = ()         => api.get('/users')
export const createUser  = (data)     => api.post('/users', data)
export const deleteUser  = (id)       => api.delete(`/users/${id}`)
export const resetPassword = (id, data) => api.put(`/users/${id}/reset-password`, data)
