/**
 * context/AuthContext.jsx
 * JWT-based global authentication state.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { tokenStore } from '../api/client'
import { loginAPI, registerAPI, logoutAPI } from '../api/auth'
import { getProfile } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount: if we have a token, fetch the profile to confirm it's valid
  useEffect(() => {
    const token = tokenStore.getAccess()
    if (!token) { setLoading(false); return }
    getProfile()
      .then(profile => setUser(profile))
      .catch(() => { tokenStore.clear(); setUser(null) })
      .finally(() => setLoading(false))
  }, [])

  // Listen for forced logout from the Axios interceptor
  useEffect(() => {
    const handle = () => { setUser(null); tokenStore.clear() }
    window.addEventListener('auth:logout', handle)
    return () => window.removeEventListener('auth:logout', handle)
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await loginAPI(username, password)
    // After JWT login, fetch the full profile (has avatar, bio, etc.)
    const profile = await getProfile()
    setUser(profile)
    return profile
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerAPI(payload)
    const profile = await getProfile()
    setUser(profile)
    return profile
  }, [])

  const logout = useCallback(async () => {
    await logoutAPI()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const profile = await getProfile()
    setUser(profile)
    return profile
  }, [])

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      login, register, logout, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
