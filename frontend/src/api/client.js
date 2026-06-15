/**
 * api/client.js — JWT-based Axios instance
 * Stores tokens in localStorage, auto-refreshes on 401.
 */
import axios from 'axios'

const KEYS = { access: 'mnd_access', refresh: 'mnd_refresh' }

export const tokenStore = {
  getAccess:  () => localStorage.getItem(KEYS.access),
  getRefresh: () => localStorage.getItem(KEYS.refresh),
  set:        (k, v) => localStorage.setItem(KEYS[k], v),
  clear:      () => { localStorage.removeItem(KEYS.access); localStorage.removeItem(KEYS.refresh) },
  setTokens:  ({ access, refresh }) => {
    localStorage.setItem(KEYS.access, access)
    if (refresh) localStorage.setItem(KEYS.refresh, refresh)
  },
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

// Attach Bearer token to every request
api.interceptors.request.use((cfg) => {
  const token = tokenStore.getAccess()
  if (token) cfg.headers['Authorization'] = `Bearer ${token}`
  return cfg
})

// Auto-refresh on 401
let isRefreshing = false
let failQueue = []

const processQueue = (err, token = null) => {
  failQueue.forEach(p => (err ? p.reject(err) : p.resolve(token)))
  failQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failQueue.push({ resolve, reject })
        }).then(token => {
          original.headers['Authorization'] = `Bearer ${token}`
          return api(original)
        })
      }
      original._retry = true
      isRefreshing = true
      const refresh = tokenStore.getRefresh()
      if (!refresh) {
        tokenStore.clear()
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(err)
      }
      try {
        const { data } = await axios.post('/api/v1/auth/token/refresh/', { refresh })
        tokenStore.setTokens(data)
        processQueue(null, data.access)
        original.headers['Authorization'] = `Bearer ${data.access}`
        return api(original)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        tokenStore.clear()
        window.dispatchEvent(new Event('auth:logout'))
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }
    err.userMessage =
      err.response?.data?.detail ||
      err.response?.data?.error  ||
      (typeof err.response?.data === 'string' ? err.response.data : null) ||
      err.message || 'Something went wrong.'
    return Promise.reject(err)
  },
)

export default api
