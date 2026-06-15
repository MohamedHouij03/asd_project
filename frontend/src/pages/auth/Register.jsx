/**
 * pages/auth/Register.jsx
 */
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const INIT = { first_name:'', last_name:'', email:'', username:'', password:'', password2:'', role:'parent', organization:'' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState(INIT)
  const [errors, setErrors] = useState({})
  const [serverErr, setServerErr] = useState('')
  const [loading, setLoading]     = useState(false)

  const change = e => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    setErrors(p => ({ ...p, [name]: '' }))
    setServerErr('')
  }

  const validate = () => {
    const e = {}
    if (!form.first_name.trim())  e.first_name  = 'Required'
    if (!form.last_name.trim())   e.last_name   = 'Required'
    if (!form.email.trim())       e.email       = 'Required'
    if (!form.username.trim())    e.username    = 'Required'
    if (form.password.length < 8) e.password    = 'Min 8 characters'
    if (form.password !== form.password2) e.password2 = 'Passwords don\'t match'
    return e
  }

  const submit = async e => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerErr(err.userMessage || err.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const F = ({ id, label, type='text', placeholder, hint }) => (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      <input id={id} name={id} type={type} className={`input${errors[id]?' error':''}`}
        placeholder={placeholder} value={form[id]} onChange={change} disabled={loading}/>
      {hint && !errors[id] && <span className="form-hint">{hint}</span>}
      {errors[id] && <span className="form-error">⚠ {errors[id]}</span>}
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', padding:'calc(var(--nav-h) + 2rem) 1rem 3rem', background:'linear-gradient(160deg,var(--primary-pale) 0%,var(--bg) 60%)', display:'flex', justifyContent:'center', alignItems:'flex-start' }}>
      <div className="card" style={{ width:'100%', maxWidth:580, padding:'2.5rem' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'var(--font-heading)', fontWeight:700, color:'var(--text)', fontSize:'1.1rem', marginBottom:'2rem' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#2563EB"/>
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="#93C5FD"/>
          </svg>
          Mindello
        </Link>
        <h1 style={{ fontSize:'var(--text-2xl)', marginBottom:'0.375rem' }}>Create your account</h1>
        <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'2rem' }}>Free forever. No credit card required.</p>

        {serverErr && <div className="alert alert-danger" style={{ marginBottom:'1.25rem' }}><span>⚠</span><span>{serverErr}</span></div>}

        <form onSubmit={submit} noValidate>
          {/* Role selector */}
          <div className="form-group" style={{ marginBottom:'1.5rem' }}>
            <label className="form-label">I am a…</label>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem', marginTop:'0.5rem' }}>
              {[{v:'parent',label:'👨‍👩‍👧 Parent / Guardian'},{v:'doctor',label:'🩺 Medical Professional'}].map(r => (
                <label key={r.v} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.875rem 1rem', border:`2px solid ${form.role===r.v?'var(--primary)':'var(--border)'}`, borderRadius:'var(--r-lg)', cursor:'pointer', background: form.role===r.v?'var(--primary-pale)':'var(--surface)', transition:'all 0.15s' }}>
                  <input type="radio" name="role" value={r.v} checked={form.role===r.v} onChange={change} style={{ display:'none' }}/>
                  <span style={{ fontSize:'var(--text-sm)', fontWeight:600, color: form.role===r.v?'var(--primary)':'var(--text-2)' }}>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <F id="first_name" label="First Name *" placeholder="Jane"/>
            <F id="last_name"  label="Last Name *"  placeholder="Smith"/>
          </div>
          <div style={{ marginBottom:'1rem' }}><F id="email" label="Email Address *" type="email" placeholder="jane@example.com"/></div>
          <div style={{ marginBottom:'1rem' }}><F id="username" label="Username *" placeholder="jane_smith" hint="Used to sign in. Letters, numbers and underscores."/></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'1rem' }}>
            <F id="password"  label="Password *"         type="password" placeholder="Min. 8 characters"/>
            <F id="password2" label="Confirm Password *" type="password" placeholder="Repeat password"/>
          </div>
          {form.role === 'doctor' && (
            <div style={{ marginBottom:'1rem' }}><F id="organization" label="Organization / Clinic" placeholder="City Children's Hospital"/></div>
          )}

          <button type="submit" className="btn btn-primary btn-full" style={{ padding:'0.75rem', marginTop:'0.5rem' }} disabled={loading}>
            {loading ? <><span className="spinner"/>Creating account…</> : 'Create Free Account →'}
          </button>
          <p style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', textAlign:'center', marginTop:'1rem', lineHeight:1.6 }}>
            By creating an account you agree that Mindello is for informational use only and not a medical diagnostic service.
          </p>
        </form>

        <p style={{ textAlign:'center', fontSize:'var(--text-sm)', color:'var(--text-muted)', marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--border)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
