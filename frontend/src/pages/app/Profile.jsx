/**
 * pages/app/Profile.jsx
 */
import React, { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { updateProfile, uploadAvatar } from '../../api/users'

const IcEdit    = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IcCheck   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IcAlert   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState({
    first_name: user?.first_name || '', last_name: user?.last_name || '',
    email: user?.email || '', bio: user?.bio || '',
    phone: user?.phone || '', location: user?.location || '',
    organization: user?.organization || '',
  })
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileRef = useRef(null)

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const save = async e => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess(false)
    try {
      await updateProfile(form)
      await refreshUser()
      setSuccess(true); setEditing(false)
    } catch (err) { setError(err.userMessage || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const handleAvatarChange = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarUploading(true)
    try { await uploadAvatar(file); await refreshUser() }
    catch (err) { setError('Avatar upload failed.') }
    finally { setAvatarUploading(false) }
  }

  const STATS = [
    { label: 'Screenings', value: user?.assessment_count ?? 0 },
    { label: 'Role',       value: user?.role_display || '—' },
    { label: 'Member since', value: user?.date_joined?.slice(0,7) || '—' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information and account details.</p>
      </div>

      {success && <div className="alert alert-success" style={{ marginBottom:'1.5rem' }}><IcCheck/><span>Profile updated successfully.</span></div>}
      {error   && <div className="alert alert-danger"  style={{ marginBottom:'1.5rem' }}><IcAlert/><span>{error}</span></div>}

      <div className="profile-grid">
        {/* Left — avatar + stats */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="card card-p" style={{ textAlign:'center' }}>
            {/* Avatar */}
            <div style={{ position:'relative', display:'inline-block', marginBottom:'1.25rem' }}>
              <div className="avatar avatar-2xl avatar-blue" style={{ margin:'0 auto' }}>
                {user?.avatar_url ? <img src={user.avatar_url} alt={user.full_name}/> : (user?.initials || '?')}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={avatarUploading}
                style={{ position:'absolute', bottom:0, right:0, width:28, height:28, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow-md)', fontSize:'0.75rem', cursor:'pointer', border:'2px solid #fff' }}
                title="Change photo"
              >
                {avatarUploading ? <span className="spinner" style={{ width:12, height:12, borderWidth:2 }}/> : <IcEdit/>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarChange}/>
            </div>
            <h2 style={{ fontSize:'var(--text-xl)', marginBottom:'0.25rem' }}>{user?.full_name || user?.username}</h2>
            <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginBottom:'0.5rem' }}>@{user?.username}</p>
            <span className="badge badge-blue">{user?.role_display || 'User'}</span>
            {user?.bio && <p style={{ marginTop:'1rem', fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.7 }}>{user.bio}</p>}
          </div>

          {/* Stats */}
          <div className="card card-p">
            <h3 style={{ fontSize:'var(--text-base)', marginBottom:'1rem' }}>Statistics</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
              {STATS.map(s => (
                <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'0.875rem', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>{s.label}</span>
                  <span style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>{s.value}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)' }}>Last login</span>
                <span style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>{user?.last_login?.slice(0,10) || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — edit form */}
        <div className="card card-p">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.75rem' }}>
            <h2 style={{ fontSize:'var(--text-xl)' }}>Personal Information</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm">Edit</button>
            )}
          </div>

          {editing ? (
            <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {[
                  ['first_name','First Name','Jane'],
                  ['last_name', 'Last Name', 'Smith'],
                ].map(([n,l,p]) => (
                  <div className="form-group" key={n}>
                    <label className="form-label">{l}</label>
                    <input name={n} className="input" placeholder={p} value={form[n]} onChange={change} disabled={saving}/>
                  </div>
                ))}
              </div>
              {[
                ['email','Email Address','jane@example.com','email'],
                ['phone','Phone Number','+1 555 0100','tel'],
                ['location','Location','New York, USA'],
                ['organization','Organization / Clinic','City Hospital'],
              ].map(([n,l,p,t='text']) => (
                <div className="form-group" key={n}>
                  <label className="form-label">{l}</label>
                  <input name={n} type={t} className="input" placeholder={p} value={form[n]} onChange={change} disabled={saving}/>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea name="bio" className="input" rows={3} placeholder="A brief description about yourself…" value={form.bio} onChange={change} disabled={saving} style={{ resize:'vertical' }}/>
                <span className="form-hint">{form.bio.length}/500 characters</span>
              </div>
              <div style={{ display:'flex', gap:'0.75rem' }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner"/>Saving…</> : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
              </div>
            </form>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {[
                ['Full Name',     `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || '—'],
                ['Email',         user?.email || '—'],
                ['Phone',         user?.phone || '—'],
                ['Location',      user?.location || '—'],
                ['Organization',  user?.organization || '—'],
                ['Bio',           user?.bio || '—'],
              ].map(([label, value]) => (
                <div key={label} style={{ display:'grid', gridTemplateColumns:'160px 1fr', gap:'1rem', padding:'1rem 0', borderBottom:'1px solid var(--border)', alignItems:'baseline' }}>
                  <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:'var(--text-sm)', color:'var(--text-2)' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
