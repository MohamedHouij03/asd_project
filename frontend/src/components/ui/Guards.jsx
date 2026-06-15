/**
 * components/ui/Guards.jsx
 * Auth guard, page loader, error boundary.
 */
import React from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ── Route guards ─────────────────────────────────────────────────── */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

/* ── Loading screens ──────────────────────────────────────────────── */
export function PageLoader() {
  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', gap: '1.5rem', zIndex: 9999,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="#2563EB"/>
          <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="14" cy="14" r="2.5" fill="#93C5FD"/>
        </svg>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--text)' }}>Mindello</span>
      </div>
      <span className="spinner" style={{ color: 'var(--primary)' }}/>
    </div>
  )
}

export function InlineLoader({ label = 'Loading…' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '4rem', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
      <span className="spinner"/>{label}
    </div>
  )
}

/* ── Error boundary ───────────────────────────────────────────────── */
export class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }
  static getDerivedStateFromError(error) { return { hasError: true, error } }
  componentDidCatch(error, info) { console.error('[ErrorBoundary]', error, info) }
  render() {
    if (!this.state.hasError) return this.props.children
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1.5rem', textAlign:'center', padding:'2rem' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <h2 style={{ marginBottom:'0.5rem' }}>Something went wrong</h2>
          <p style={{ color:'var(--text-muted)', maxWidth:380, lineHeight:1.7 }}>An unexpected error occurred. Reload the page or go home.</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
          <Link to="/" className="btn btn-secondary">Go Home</Link>
        </div>
        {import.meta.env.DEV && (
          <pre style={{ fontSize:'0.75rem', color:'var(--danger)', background:'var(--danger-pale)', borderRadius:'var(--r-md)', padding:'1rem', maxWidth:600, overflowX:'auto', textAlign:'left' }}>
            {this.state.error?.message}
          </pre>
        )}
      </div>
    )
  }
}
