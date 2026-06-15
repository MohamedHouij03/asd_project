/**
 * components/layout/Footer.jsx
 */
import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: 'rgba(255,255,255,0.6)', padding: '4rem 0 2rem' }}>
      <div className="container">
        <div className="footer-grid" style={{ paddingBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="7" fill="#3B82F6"/>
                <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="2.5" fill="#BFDBFE"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>Mindello</span>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.75, maxWidth: 280, marginBottom: '1rem' }}>
              AI-powered early ASD screening platform, helping families and clinicians gain clarity faster.
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', lineHeight: 1.6 }}>
              ⚠ For informational use only. Not a medical diagnosis. Always consult a qualified healthcare professional.
            </p>
          </div>
          {[
            { heading: 'Learn', links: [['About Autism','/about'],['Signs & Symptoms','/signs'],['Resources','/resources'],['FAQ','/faq']] },
            { heading: 'Platform', links: [['Dashboard','/dashboard'],['New Screening','/predict'],['History','/history'],['Help Center','/help']] },
            { heading: 'Company', links: [['Contact','/contact'],['Privacy Policy','/privacy'],['Terms of Service','/terms'],['Sign Up','/register']] },
          ].map(col => (
            <div key={col.heading}>
              <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.3)', marginBottom: '1rem' }}>{col.heading}</p>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map(([label, to]) => (
                  <li key={to}><Link to={to} style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.55)', transition: 'color 0.15s' }} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.55)'}>{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontSize: 'var(--text-xs)' }}>© {new Date().getFullYear()} Mindello. Built with care for families and clinicians.</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)' }}>Python · Django · Random Forest · React</p>
        </div>
      </div>
    </footer>
  )
}
