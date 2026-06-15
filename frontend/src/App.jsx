/**
 * App.jsx — Root router with nested layout routes.
 */
import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation, Link } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, GuestRoute, PageLoader, ErrorBoundary } from './components/ui/Guards'
import Navbar  from './components/layout/Navbar'
import Footer  from './components/layout/Footer'
import DashboardLayout from './components/layout/DashboardLayout'

/* ── Lazy-load helper for named exports ─────────────────────────────── */
const lazyNamed = (loader, name) => lazy(() => loader().then(m => ({ default: m[name] })))

/* ── Public pages ───────────────────────────────────────────────────── */
const Home      = lazy(() => import('./pages/public/Home'))
const About     = lazyNamed(() => import('./pages/public/PublicPages'), 'About')
const Signs     = lazyNamed(() => import('./pages/public/PublicPages'), 'Signs')
const Resources = lazyNamed(() => import('./pages/public/PublicPages'), 'Resources')
const FAQ       = lazyNamed(() => import('./pages/public/PublicPages'), 'FAQ')
const Contact   = lazyNamed(() => import('./pages/public/PublicPages'), 'Contact')
const Privacy   = lazyNamed(() => import('./pages/public/PublicPages'), 'Privacy')
const Terms     = lazyNamed(() => import('./pages/public/PublicPages'), 'Terms')
const ForgotPwd = lazyNamed(() => import('./pages/public/PublicPages'), 'ForgotPassword')

/* ── Auth pages ─────────────────────────────────────────────────────── */
const Login    = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

/* ── App pages ──────────────────────────────────────────────────────── */
const Dashboard     = lazy(() => import('./pages/app/Dashboard'))
const Profile       = lazy(() => import('./pages/app/Profile'))
const Predict       = lazy(() => import('./pages/app/Predict'))
const Settings      = lazyNamed(() => import('./pages/app/AppPages'), 'Settings')
const History       = lazyNamed(() => import('./pages/app/AppPages'), 'History')
const Saved         = lazyNamed(() => import('./pages/app/AppPages'), 'Saved')
const Notifications = lazyNamed(() => import('./pages/app/AppPages'), 'Notifications')
const Help          = lazyNamed(() => import('./pages/app/AppPages'), 'Help')

/* ── Scroll to top on navigate ──────────────────────────────────────── */
function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

/* ── Layout wrappers (use Outlet so the shell stays mounted) ─────────── */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
      <Footer />
    </>
  )
}

function AuthLayout() {
  return (
    <GuestRoute>
      <Suspense fallback={<PageLoader />}><Outlet /></Suspense>
    </GuestRoute>
  )
}

function AppLayout() {
  return (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  )
}

/* ── 404 ────────────────────────────────────────────────────────────── */
function NotFound() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'70vh', gap:'1.5rem', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontFamily:'var(--font-heading)', fontSize:'7rem', fontWeight:700, color:'var(--surface-3)', lineHeight:1, letterSpacing:'-0.05em' }}>404</div>
      <h1>Page not found</h1>
      <p style={{ color:'var(--text-muted)', maxWidth:380, lineHeight:1.7 }}>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary btn-lg">← Back to Home</Link>
    </div>
  )
}

/* ── Routes ─────────────────────────────────────────────────────────── */
function AppRoutes() {
  return (
    <>
      <ScrollTop />
      <Routes>
        {/* Public — Navbar + Footer stay mounted across all public pages */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<Home />} />
          <Route path="/about"     element={<About />} />
          <Route path="/signs"     element={<Signs />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/faq"       element={<FAQ />} />
          <Route path="/contact"   element={<Contact />} />
          <Route path="/privacy"   element={<Privacy />} />
          <Route path="/terms"     element={<Terms />} />
          <Route path="*"          element={<NotFound />} />
        </Route>

        {/* Auth — no shared shell needed */}
        <Route element={<AuthLayout />}>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Standalone (no nav/footer) */}
        <Route path="/forgot-password" element={<ForgotPwd />} />

        {/* Protected app — sidebar stays mounted across all app pages */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/predict"       element={<Predict />} />
          <Route path="/history"       element={<History />} />
          <Route path="/saved"         element={<Saved />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/settings"      element={<Settings />} />
          <Route path="/help"          element={<Help />} />
        </Route>
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
