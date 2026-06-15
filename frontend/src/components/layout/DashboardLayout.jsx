/**
 * components/layout/DashboardLayout.jsx
 * Linear-inspired dark sidebar + top bar layout for authenticated pages.
 */
import React, { useState, Suspense } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { PageLoader } from '../ui/Guards'
import { useAuth } from '../../context/AuthContext'

const TITLES = {
  '/dashboard':     'Dashboard',
  '/predict':       'New Screening',
  '/history':       'History',
  '/saved':         'Saved Results',
  '/notifications': 'Notifications',
  '/profile':       'Profile',
  '/settings':      'Settings',
  '/help':          'Help Center',
}

/* ── Minimal icon components ── */
const I = ({ size=16, d, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d}/> : children}
  </svg>
)
const GridIcon    = (p) => <I {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></I>
const BrainIcon   = (p) => <I {...p} d="M12 2a6 6 0 0 1 6 6c0 1.5-.5 2.9-1.4 4L12 22 7.4 12A6 6 0 0 1 12 2z"/>
const ClockIcon   = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></I>
const BookmarkIcon= (p) => <I {...p} d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
const BellIcon    = (p) => <I {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></I>
const HelpIcon    = (p) => <I {...p}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></I>
const SettingIcon = (p) => <I {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>
const LogoutIcon  = (p) => <I {...p} d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
const MenuIcon    = (p) => <I {...p}><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></I>

const NAV = [
  { to: '/dashboard',      icon: GridIcon,     label: 'Dashboard' },
  { to: '/predict',        icon: BrainIcon,    label: 'New Screening' },
  { to: '/history',        icon: ClockIcon,    label: 'History' },
  { to: '/saved',          icon: BookmarkIcon, label: 'Saved' },
  { to: '/notifications',  icon: BellIcon,     label: 'Notifications' },
]
const NAV_BOTTOM = [
  { to: '/help',     icon: HelpIcon,    label: 'Help Center' },
  { to: '/settings', icon: SettingIcon, label: 'Settings' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const title = TITLES[pathname] || ''
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => { await logout(); navigate('/') }

  const SidebarContent = () => (
    <div className="sidebar-inner">
      {/* Logo */}
      <Link to="/dashboard" className="sidebar-logo">
        <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
          <rect width="28" height="28" rx="7" fill="#3B82F6"/>
          <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="14" cy="14" r="2.5" fill="#BFDBFE"/>
        </svg>
        <span className="sidebar-logo-text">Mindello</span>
      </Link>

      {/* Main nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">PLATFORM</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item${isActive ? ' sidebar-item-active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16}/> {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="sidebar-bottom">
        <div className="sidebar-section-label">ACCOUNT</div>
        {NAV_BOTTOM.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-item${isActive ? ' sidebar-item-active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={16}/> {label}
          </NavLink>
        ))}
        <div className="sidebar-divider"/>
        {/* User chip */}
        <Link to="/profile" className="sidebar-user" onClick={() => setSidebarOpen(false)}>
          <div className="avatar avatar-sm avatar-blue">
            {user?.avatar_url
              ? <img src={user.avatar_url} alt={user.full_name}/>
              : (user?.initials || '?')}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name || user?.username}</div>
            <div className="sidebar-user-role">{user?.role_display || 'User'}</div>
          </div>
        </Link>
        <button onClick={handleLogout} className="sidebar-logout">
          <LogoutIcon size={14}/> Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="dash-root">
      {/* Desktop sidebar */}
      <aside className="sidebar-desktop"><SidebarContent/></aside>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}/>
          <aside className="sidebar-mobile"><SidebarContent/></aside>
        </>
      )}

      {/* Main content area */}
      <div className="dash-content">
        {/* Top bar */}
        <header className="dash-topbar">
          <button className="dash-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
            <MenuIcon size={20}/>
          </button>
          {title && <span className="dash-topbar-title">{title}</span>}
          <div style={{flex:1}}/>
          <div className="dash-topbar-right">
            <Link to="/notifications" className="btn btn-icon btn-ghost" title="Notifications">
              <BellIcon size={18}/>
            </Link>
            <Link to="/predict" className="btn btn-primary btn-sm">
              + New Screening
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="dash-main">
          <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
        </main>
      </div>

      <style>{`
        .dash-root {
          display: flex; min-height: 100vh; background: var(--bg);
        }
        /* ── Sidebar ── */
        .sidebar-desktop {
          width: var(--sidebar-w); flex-shrink: 0;
          background: var(--sidebar-bg);
          position: fixed; top:0; left:0; bottom:0;
          border-right: 1px solid var(--sidebar-border);
          overflow-y: auto; overflow-x: hidden;
          display: flex; flex-direction: column;
        }
        .sidebar-inner {
          display: flex; flex-direction: column; height: 100%;
          padding: var(--sp-4) var(--sp-3);
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: var(--sp-2);
          padding: var(--sp-2) var(--sp-2); margin-bottom: var(--sp-6);
          font-family: var(--font-heading); font-weight: 700; font-size: 1rem;
          color: #fff; letter-spacing: -0.02em; border-radius: var(--r-md);
          transition: background var(--t-fast);
        }
        .sidebar-logo:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-section-label {
          font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
          color: rgba(255,255,255,0.25); padding: var(--sp-3) var(--sp-2) var(--sp-1);
          margin-top: var(--sp-2);
        }
        .sidebar-item {
          display: flex; align-items: center; gap: var(--sp-3);
          padding: 7px var(--sp-2); border-radius: var(--r-md);
          font-size: var(--text-sm); font-weight: 500;
          color: var(--sidebar-text);
          transition: background var(--t-fast), color var(--t-fast);
          cursor: pointer;
        }
        .sidebar-item:hover { background: rgba(255,255,255,0.06); color: var(--sidebar-text-hover); }
        .sidebar-item-active { background: var(--sidebar-active-bg) !important; color: var(--sidebar-active) !important; }
        .sidebar-bottom { padding-top: var(--sp-4); }
        .sidebar-divider { height: 1px; background: var(--sidebar-border); margin: var(--sp-3) 0; }
        .sidebar-user {
          display: flex; align-items: center; gap: var(--sp-2);
          padding: var(--sp-2); border-radius: var(--r-md);
          transition: background var(--t-fast); margin-bottom: var(--sp-1);
        }
        .sidebar-user:hover { background: rgba(255,255,255,0.06); }
        .sidebar-user-info { flex: 1; min-width: 0; }
        .sidebar-user-name { font-size: var(--text-sm); font-weight: 500; color: #e2e8f0; truncate:1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sidebar-user-role { font-size: 11px; color: var(--sidebar-text); }
        .sidebar-logout {
          display: flex; align-items: center; gap: var(--sp-2);
          padding: 6px var(--sp-2); width: 100%;
          font-size: var(--text-xs); color: rgba(255,255,255,0.35);
          border-radius: var(--r-sm); transition: color var(--t-fast), background var(--t-fast);
        }
        .sidebar-logout:hover { color: #ef4444; background: rgba(239,68,68,0.08); }

        /* ── Content ── */
        .dash-content { margin-left: var(--sidebar-w); flex: 1; min-width: 0; display: flex; flex-direction: column; min-height: 100vh; }
        .dash-topbar {
          position: sticky; top: 0; z-index: 50;
          height: var(--nav-h); background: rgba(248,250,252,0.9);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; gap: var(--sp-4);
          padding: 0 var(--sp-6);
        }
        .dash-topbar-title { font-family: var(--font-heading); font-size: var(--text-lg); font-weight: 600; color: var(--text); }
        .dash-topbar-right { display: flex; align-items: center; gap: var(--sp-2); }
        .dash-hamburger { display: none; color: var(--text-muted); padding: var(--sp-2); border-radius: var(--r-md); transition: background var(--t-fast); }
        .dash-hamburger:hover { background: var(--surface-2); color: var(--text); }
        .dash-main { flex: 1; padding: var(--sp-8) var(--sp-6); max-width: 1100px; width: 100%; }

        /* ── Mobile sidebar ── */
        .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; }
        .sidebar-mobile {
          position: fixed; top:0; left:0; bottom:0; width: var(--sidebar-w);
          background: var(--sidebar-bg); z-index: 201;
          border-right: 1px solid var(--sidebar-border);
          overflow-y: auto; animation: slideIn 0.2s ease;
        }

        @media (max-width: 900px) {
          .sidebar-desktop { display: none; }
          .dash-content { margin-left: 0; }
          .dash-hamburger { display: flex; }
          .dash-main { padding: var(--sp-5) var(--sp-4); }
        }
      `}</style>
    </div>
  )
}
