/* api/users.js */
import api from './client'

export const getProfile = () => api.get('/api/v1/users/profile/').then(r => r.data)

export const updateProfile = (data) => api.patch('/api/v1/users/profile/', data).then(r => r.data)

export const uploadAvatar = (file) => {
  const fd = new FormData()
  fd.append('avatar', file)
  return api.post('/api/v1/users/avatar/', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data)
}

export const getStats = () => api.get('/api/v1/users/stats/').then(r => r.data)
