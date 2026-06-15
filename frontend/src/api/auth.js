/* api/auth.js */
import api, { tokenStore } from './client'

export async function loginAPI(username, password) {
  const { data } = await api.post('/api/v1/auth/login/', { username, password })
  tokenStore.setTokens(data)
  return data // { access, refresh, user }
}

export async function registerAPI(payload) {
  const { data } = await api.post('/api/v1/auth/register/', payload)
  tokenStore.setTokens(data)
  return data
}

export async function logoutAPI() {
  const refresh = tokenStore.getRefresh()
  try { if (refresh) await api.post('/api/v1/auth/logout/', { refresh }) } catch (_) {}
  tokenStore.clear()
}

export async function changePasswordAPI(payload) {
  const { data } = await api.post('/api/v1/auth/password/change/', payload)
  return data
}

export async function refreshTokenAPI() {
  const refresh = tokenStore.getRefresh()
  if (!refresh) return null
  const { data } = await api.post('/api/v1/auth/token/refresh/', { refresh })
  tokenStore.setTokens(data)
  return data
}
