/* api/assessments.js */
import api from './client'

export const runAssessment   = (data)   => api.post('/api/v1/assessments/run/', data).then(r => r.data)
export const listAssessments = (params) => api.get('/api/v1/assessments/', { params }).then(r => r.data)
export const getAssessment   = (id)     => api.get(`/api/v1/assessments/${id}/`).then(r => r.data)
export const deleteAssessment= (id)     => api.delete(`/api/v1/assessments/${id}/`)
export const saveAssessment  = (id, notes='') => api.post(`/api/v1/assessments/${id}/save/`, { notes }).then(r => r.data)
export const unsaveAssessment= (id)     => api.delete(`/api/v1/assessments/${id}/save/`)

/* api/notifications.js */
export const listNotifications  = ()   => api.get('/api/v1/notifications/').then(r => r.data)
export const markRead           = (id) => api.patch(`/api/v1/notifications/${id}/read/`).then(r => r.data)
export const markAllRead        = ()   => api.post('/api/v1/notifications/mark-all-read/').then(r => r.data)
export const unreadCount        = ()   => api.get('/api/v1/notifications/unread-count/').then(r => r.data)

/* api/content.js */
export const listArticles    = (params) => api.get('/api/v1/articles/', { params }).then(r => r.data)
export const getArticle      = (slug)   => api.get(`/api/v1/articles/${slug}/`).then(r => r.data)
export const listCategories  = ()       => api.get('/api/v1/article-categories/').then(r => r.data)
export const listFAQ         = (params) => api.get('/api/v1/faq/', { params }).then(r => r.data)
export const submitContact   = (data)   => api.post('/api/v1/contact/', data).then(r => r.data)

/* api/saved.js */
export const listSaved  = ()   => api.get('/api/v1/saved/').then(r => r.data)
export const removeSaved= (id) => api.delete(`/api/v1/saved/${id}/`)
