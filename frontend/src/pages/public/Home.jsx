/**
 * pages/public/Home.jsx — Modernized landing page
 */
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Ic = ({ size = 22, color = 'var(--primary)', children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)
const IcCpu      = p => <Ic {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></Ic>
const IcBarChart = p => <Ic {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></Ic>
const IcClipbrd  = p => <Ic {...p}><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></Ic>
const IcClock    = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic>
const IcLock     = p => <Ic {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ic>
const IcMonitor  = p => <Ic {...p}><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></Ic>
const IcAlert    = p => <Ic {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>
const IcCheck    = p => <Ic {...p}><polyline points="20 6 9 17 4 12"/></Ic>

function useCount(target, dur = 1600) {
  const ref = useRef(null)
  useEffect(() => {
    let start = null
    const step = ts => {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      const e = 1 - (1 - p) ** 3
      if (ref.current) ref.current.textContent = (Number.isInteger(target)
        ? Math.round(e * target)
        : (e * target).toFixed(1))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, dur])
  return ref
}

function StatItem({ value, suffix, label }) {
  const ref = useCount(value)
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
        <span ref={ref}>{value}</span>{suffix}
      </div>
      <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.65)', marginTop: '0.375rem' }}>{label}</div>
    </div>
  )
}

const FEATURES = [
  {
    icon: <IcCpu/>,
    title: 'AI-Powered Analysis',
    desc: 'Random Forest model trained on real-world developmental data, with 97% accuracy across 5 evaluated models.',
  },
  {
    icon: <IcBarChart/>,
    title: 'Explainable Results',
    desc: 'SHAP values show exactly which factors influenced the outcome. Clear, transparent, and never a black box.',
  },
  {
    icon: <IcClipbrd/>,
    title: 'Evidence-Based Screening',
    desc: 'Built on AQ-10, Q-CHAT-10, and CARS: validated tools used by clinicians and researchers worldwide.',
  },
  {
    icon: <IcClock/>,
    title: 'Track Over Time',
    desc: 'Save every screening to your history. Monitor changes and share records with your healthcare provider.',
  },
  {
    icon: <IcLock/>,
    title: 'Secure & Private',
    desc: 'JWT authentication, encrypted sessions, and CSRF protection. Your data is visible only to you.',
  },
  {
    icon: <IcMonitor/>,
    title: 'Works Everywhere',
    desc: 'Fully responsive on phone, tablet, and desktop. Complete a screening anywhere, any time.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Answer Simple Questions',
    desc: 'Complete the AQ-10 questionnaire and provide clinical observations. Takes 5–10 minutes on any device.',
    tag: '5–10 min',
  },
  {
    n: '02',
    title: 'AI Analyses the Data',
    desc: 'Our Random Forest model processes 24 clinical and behavioral indicators across validated screening tools.',
    tag: 'Instant',
  },
  {
    n: '03',
    title: 'Receive a Clear Result',
    desc: 'Get an instant prediction with confidence score, SHAP chart, and plain-language next-step guidance.',
    tag: 'With explanations',
  },
]

const TRUST_ITEMS = [
  '97% model accuracy',
  'SHAP explainability',
  'No credit card needed',
  'Results in < 10 min',
]

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <main>
      {/* ── Hero ── */}
      <section style={{ position: 'relative', paddingTop: 'calc(var(--nav-h) + 5rem)', paddingBottom: '6rem', overflow: 'hidden', background: 'linear-gradient(165deg, #EFF6FF 0%, #F8FAFC 55%, #F5F3FF 100%)' }}>
        <div className="hero-bg"/>

        <div className="container" style={{ maxWidth: 920, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* Pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 1rem', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 'var(--r-full)', marginBottom: '2rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', animation: 'pulse 2s infinite' }}/>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--primary)' }}>AI-Powered · Evidence-Based · Free to Use</span>
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', marginBottom: '1.5rem', letterSpacing: '-0.04em', lineHeight: 1.08 }}>
            Early ASD screening,{' '}
            <span className="gradient-text">explained clearly</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem,2.5vw,1.25rem)', color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto 2.5rem', lineHeight: 1.75 }}>
            Mindello uses machine learning to help parents and professionals identify early ASD indicators. Results are instant, explainable, and free of medical jargon.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            {isAuthenticated
              ? <Link to="/predict" className="btn btn-primary btn-xl">Start Screening →</Link>
              : <>
                  <Link to="/register" className="btn btn-primary btn-xl">Get Started Free →</Link>
                  <Link to="/about"    className="btn btn-secondary btn-xl">Learn More</Link>
                </>
            }
          </div>

          {/* Trust row */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>
            {TRUST_ITEMS.map(t => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <IcCheck size={14} color="var(--success)"/>
                {t}
              </span>
            ))}
          </div>

          {/* Hero visual — floating cards */}
          <div style={{ position: 'relative', marginTop: '3.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Model Confidence', value: '94%', color: 'var(--success)', bg: 'var(--success-pale)' },
              { label: 'Screening result', value: 'No indicators', color: 'var(--success)', bg: '#fff' },
              { label: 'Top factor', value: 'CARS Score', color: 'var(--primary)', bg: 'var(--primary-pale)' },
            ].map(card => (
              <div key={card.label} className="card card-glass" style={{ padding: '1rem 1.5rem', minWidth: 150, textAlign: 'center', animation: 'fadeUp 0.6s ease forwards', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{card.label}</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', fontWeight: 700, color: card.color }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats band ── */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)', padding: '2.5rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="container">
          <div className="grid-4" style={{ gap: '1.5rem' }}>
            <StatItem value={1284} suffix="+" label="Screenings completed" />
            <StatItem value={97}   suffix="%" label="Model accuracy"       />
            <StatItem value={5}    suffix=""  label="ML models evaluated"  />
            <StatItem value={4.9}  suffix="★" label="Average satisfaction" />
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.75rem' }}>WHY MINDELLO</div>
            <h2 style={{ letterSpacing: '-0.03em', marginBottom: '1rem' }}>Built for real decisions</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Every feature exists to help families and clinicians get clarity faster, with evidence they can trust.
            </p>
          </div>
          <div className="grid-3" style={{ gap: '1.25rem' }}>
            {FEATURES.map(f => (
              <div key={f.title} className="card card-p feature-card">
                <div style={{ marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.75 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section-sm" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '0.75rem' }}>HOW IT WORKS</div>
            <h2 style={{ letterSpacing: '-0.03em' }}>Three steps to clarity</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', gap: '2rem', padding: '2rem 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 700, color: 'var(--primary-pale2)', lineHeight: 1, flexShrink: 0, width: 56 }}>{s.n}</div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 'var(--text-xl)', margin: 0 }}>{s.title}</h3>
                    <span className="badge badge-blue">{s.tag}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.75 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof / disclaimer ── */}
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="card card-p" style={{ background: 'var(--warning-pale)', border: '1px solid #FCD34D', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <IcAlert size={20} color="var(--warning)"/>
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.25rem', color: 'var(--warning)' }}>Important medical disclaimer</p>
              <p style={{ fontSize: 'var(--text-sm)', color: '#92400E', lineHeight: 1.7 }}>
                Mindello is a decision-support tool, not a medical diagnostic service. Results should inform conversations with qualified healthcare professionals and are not a substitute for formal evaluation. Always consult a licensed clinician for diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)', padding: '5rem 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <h2 style={{ color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Ready to get started?</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'var(--text-lg)' }}>Create a free account. Run your first screening in under 10 minutes.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-xl" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }}>Create Free Account</Link>
            <Link to="/about"    className="btn btn-xl" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}>Learn More</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
