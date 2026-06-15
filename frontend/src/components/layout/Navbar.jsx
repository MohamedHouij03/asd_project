/**
 * components/layout/Navbar.jsx
 * Clean public navigation — Stripe-inspired.
 */
import React, { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/about',     label: 'About Autism' },
  { to: '/signs',     label: 'Signs & Symptoms' },
  { to: '/resources', label: 'Resources' },
  { to: '/faq',       label: 'FAQ' },
]

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const handleLogout = async () => { await logout(); navigate('/') }

  return (
    <>
      <header className={`nav-root${scrolled ? ' nav-scrolled' : ''}`}>
        <div className="container nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2563EB"/>
              <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="14" r="2.5" fill="#93C5FD"/>
            </svg>
            <span className="nav-logo-text">Mindello</span>
          </Link>

          {/* Desktop links */}
          <nav className="nav-links" aria-label="Main">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to}
                className={({ isActive }) => `nav-link${isActive ? ' nav-link-active' : ''}`}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop auth */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>
                <Link to="/predict"   className="btn btn-primary  btn-sm">New Screening</Link>
              </>
            ) : (
              <>
                <Link to="/login"    className="btn btn-ghost   btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={`nav-ham${mobileOpen ? ' nav-ham-open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu" aria-expanded={mobileOpen}
          >
            <span/><span/><span/>
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-drawer" aria-label="Mobile menu">
          {NAV_LINKS.map(l => (
            <Link key={l.to} to={l.to} className="nav-drawer-link">{l.label}</Link>
          ))}
          <div className="nav-drawer-divider"/>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary btn-full">Dashboard</Link>
              <Link to="/predict"   className="btn btn-primary  btn-full" style={{marginTop:8}}>New Screening</Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-full" style={{marginTop:4}}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn btn-secondary btn-full">Sign In</Link>
              <Link to="/register" className="btn btn-primary   btn-full" style={{marginTop:8}}>Get Started</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-root {
          position: fixed; top:0; left:0; right:0; z-index:900;
          height: var(--nav-h);
          background: rgba(248,250,252,0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .nav-scrolled { border-bottom-color: var(--border); box-shadow: var(--shadow-sm); }
        .nav-inner {
          display: flex; align-items: center; height: 100%; gap: var(--sp-8);
        }
        .nav-logo {
          display: flex; align-items: center; gap: var(--sp-2);
          font-family: var(--font-heading); font-size: 1.125rem; font-weight: 700;
          color: var(--text); letter-spacing: -0.03em; flex-shrink: 0;
        }
        .nav-logo-text { color: var(--text); }
        .nav-links { display: flex; align-items: center; gap: var(--sp-1); flex: 1; }
        .nav-link {
          padding: 6px 10px; font-size: var(--text-sm); font-weight: 500;
          color: var(--text-muted); border-radius: var(--r-md);
          transition: color var(--t-fast), background var(--t-fast);
        }
        .nav-link:hover    { color: var(--text); background: var(--surface-2); }
        .nav-link-active   { color: var(--primary) !important; background: var(--primary-pale); }
        .nav-auth { display: flex; align-items: center; gap: var(--sp-2); flex-shrink: 0; }
        .nav-ham {
          display: none; flex-direction: column; gap: 5px;
          padding: 6px; border-radius: var(--r-sm); margin-left: auto;
          transition: background var(--t-fast);
        }
        .nav-ham:hover { background: var(--surface-2); }
        .nav-ham span { display: block; width: 20px; height: 2px; background: var(--text-2); border-radius: 2px; transition: transform 0.2s, opacity 0.2s; }
        .nav-ham-open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-ham-open span:nth-child(2) { opacity: 0; }
        .nav-ham-open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
        .nav-drawer {
          position: fixed; top: var(--nav-h); left:0; right:0; z-index:899;
          background: var(--surface); border-bottom: 1px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: var(--sp-5) var(--sp-4);
          display: flex; flex-direction: column; gap: var(--sp-1);
          animation: fadeIn 0.2s ease;
        }
        .nav-drawer-link {
          display: block; padding: var(--sp-3) var(--sp-3);
          font-size: var(--text-base); font-weight: 500; color: var(--text-2);
          border-radius: var(--r-md); transition: background var(--t-fast);
        }
        .nav-drawer-link:hover { background: var(--surface-2); color: var(--text); }
        .nav-drawer-divider { height:1px; background: var(--border); margin: var(--sp-3) 0; }
        @media (max-width: 768px) {
          .nav-links, .nav-auth { display: none; }
          .nav-ham { display: flex; }
        }
      `}</style>
    </>
  )
}
