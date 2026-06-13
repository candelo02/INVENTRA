import api from './client'

export const getMovements   = ()     => api.get('/movements')
export const getMovement    = (id)   => api.get(`/movements/${id}`)
export const createMovement = (data) => api.post('/movements', data)
