/**
 * pages/auth/Login.jsx
 */
import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = location.state?.from?.pathname || '/dashboard'

  const [form, setForm]     = useState({ username: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const change = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('') }

  const submit = async e => {
    e.preventDefault()
    if (!form.username || !form.password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.userMessage || err.response?.data?.detail || 'Invalid credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#2563EB"/>
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="#93C5FD"/>
          </svg>
          <span>Mindello</span>
        </Link>

        <h1 style={{ fontSize:'var(--text-2xl)', marginBottom:'0.375rem' }}>Welcome back</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'2rem' }}>Sign in to your account to continue</p>

        {error && <div className="alert alert-danger" style={{ marginBottom:'1.25rem' }}><span>⚠</span><span>{error}</span></div>}

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }} noValidate>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input name="username" className="input" placeholder="you@example.com" value={form.username} onChange={change} autoFocus autoComplete="username" disabled={loading}/>
          </div>
          <div className="form-group">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize:'var(--text-xs)', color:'var(--primary)' }}>Forgot password?</Link>
            </div>
            <input name="password" type="password" className="input" placeholder="••••••••" value={form.password} onChange={change} autoComplete="current-password" disabled={loading}/>
          </div>
          <button type="submit" className="btn btn-primary btn-full" style={{ padding:'0.75rem', marginTop:'0.25rem' }} disabled={loading}>
            {loading ? <><span className="spinner"/>Signing in…</> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign:'center', fontSize:'var(--text-sm)', color:'var(--text-muted)', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--border)' }}>
          Don't have an account? <Link to="/register" style={{ color:'var(--primary)', fontWeight:600 }}>Create one free →</Link>
        </p>
      </div>

      {/* Decorative panel */}
      <div className="auth-panel">
        <blockquote style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-2xl)', fontWeight:400, color:'rgba(255,255,255,0.88)', lineHeight:1.5, marginBottom:'3rem', fontStyle:'italic' }}>
          "Early identification opens doors for the child, for the family, and for the future."
        </blockquote>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1.5rem', borderTop:'1px solid rgba(255,255,255,0.15)', paddingTop:'2rem' }}>
          {[['97%','Model accuracy'],['<10m','Time to complete'],['Free','No cost to start']].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-2xl)', fontWeight:700, color:'#93C5FD' }}>{v}</div>
              <div style={{ fontSize:'var(--text-xs)', color:'rgba(255,255,255,0.5)', marginTop:'0.25rem' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{AUTH_CSS}</style>
    </div>
  )
}

const AUTH_CSS = `
  .auth-page { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; background:var(--bg); }
  .auth-card { display:flex; flex-direction:column; justify-content:center; max-width:460px; width:100%; margin:0 auto; padding:3rem 2.5rem; box-shadow:none; border:none; border-radius:0; background:var(--surface); border-right:1px solid var(--border); }
  .auth-logo { display:flex; align-items:center; gap:0.5rem; font-family:var(--font-heading); font-size:1.125rem; font-weight:700; color:var(--text); letter-spacing:-0.02em; margin-bottom:2.5rem; }
  .auth-panel { background:linear-gradient(145deg,#1E3A5F 0%,#1D4ED8 100%); display:flex; flex-direction:column; justify-content:center; padding:4rem; }
  @media(max-width:768px) { .auth-page{grid-template-columns:1fr;} .auth-panel{display:none;} .auth-card{border-right:none;border-radius:var(--r-xl);box-shadow:var(--shadow-xl);margin:2rem 1rem;padding:2rem;max-width:100%;} }
`
