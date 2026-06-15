/* ═══════════════════════════════════════════════════
   pages/app/Settings.jsx
   ═══════════════════════════════════════════════════ */
import React, { useState } from 'react'

const Ic = ({ size = 18, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display:'inline-block', verticalAlign:'middle' }}>{children}</svg>
)
const IcMail      = p => <Ic {...p}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ic>
const IcClip      = p => <Ic {...p}><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></Ic>
const IcActivity  = p => <Ic {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Ic>
const IcInfo      = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></Ic>
const IcSearch    = p => <Ic {...p}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ic>
const IcLock      = p => <Ic {...p}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ic>
const IcFolder    = p => <Ic {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Ic>
const IcBookmark  = p => <Ic {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Ic>
const IcBell      = p => <Ic {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></Ic>
const IcUser      = p => <Ic {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ic>
const IcSettings  = p => <Ic {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Ic>
const IcAlert     = p => <Ic {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>
const IcCheck     = p => <Ic {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ic>
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../api/users'
import { changePasswordAPI } from '../../api/auth'

export function Settings() {
  const { user, refreshUser } = useAuth()
  const [tab, setTab] = useState('notifications')
  const [notifs, setNotifs] = useState({
    notif_assessment_complete: user?.notif_assessment_complete ?? true,
    notif_recommendations:     user?.notif_recommendations     ?? true,
    notif_account_updates:     user?.notif_account_updates     ?? true,
    notif_system:              user?.notif_system              ?? false,
  })
  const [pwd, setPwd]       = useState({ old_password:'', new_password:'', new_password2:'' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg]       = useState({ type:'', text:'' })

  const toggle = name => setNotifs(p => ({ ...p, [name]: !p[name] }))

  const saveNotifs = async () => {
    setSaving(true); setMsg({})
    try { await updateProfile(notifs); await refreshUser(); setMsg({ type:'success', text:'Notification preferences saved.' }) }
    catch { setMsg({ type:'danger', text:'Failed to save preferences.' }) }
    finally { setSaving(false) }
  }

  const changePwd = async e => {
    e.preventDefault()
    if (pwd.new_password !== pwd.new_password2) { setMsg({ type:'danger', text:"New passwords don't match." }); return }
    setSaving(true); setMsg({})
    try { await changePasswordAPI(pwd); setPwd({ old_password:'', new_password:'', new_password2:'' }); setMsg({ type:'success', text:'Password updated successfully.' }) }
    catch (err) { setMsg({ type:'danger', text: err.userMessage || 'Failed to change password.' }) }
    finally { setSaving(false) }
  }

  const Toggle = ({ name, label, desc }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 0', borderBottom:'1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight:500, fontSize:'var(--text-sm)' }}>{label}</div>
        {desc && <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginTop:'2px' }}>{desc}</div>}
      </div>
      <button onClick={() => toggle(name)} style={{ width:44, height:24, borderRadius:12, background: notifs[name]?'var(--primary)':'var(--surface-3)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
        <span style={{ position:'absolute', top:2, left: notifs[name]?20:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'var(--shadow-sm)' }}/>
      </button>
    </div>
  )

  return (
    <div>
      <div className="page-header"><h1>Settings</h1><p>Manage your account preferences and security.</p></div>
      <div className="tab-bar" style={{ marginBottom:'2rem' }}>
        {[['notifications','Notifications'],['security','Security'],['account','Account']].map(([v,l]) => (
          <button key={v} className={`tab${tab===v?' active':''}`} onClick={() => { setTab(v); setMsg({}) }}>{l}</button>
        ))}
      </div>
      {msg.text && <div className={`alert alert-${msg.type}`} style={{ marginBottom:'1.5rem' }}><span>{msg.type==='success'?<IcCheck size={16}/>:<IcAlert size={16}/>}</span><span>{msg.text}</span></div>}

      {tab === 'notifications' && (
        <div className="card card-p" style={{ maxWidth:600 }}>
          <h2 style={{ fontSize:'var(--text-xl)', marginBottom:'0.5rem' }}>Notification Preferences</h2>
          <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'1.5rem' }}>Choose what you want to be notified about.</p>
          <Toggle name="notif_assessment_complete" label="Assessment Completed" desc="When a screening finishes processing"/>
          <Toggle name="notif_recommendations"     label="New Recommendations"  desc="When new guidance is available"/>
          <Toggle name="notif_account_updates"     label="Account Updates"      desc="Profile changes and security alerts"/>
          <Toggle name="notif_system"              label="System Notifications" desc="Platform updates and announcements"/>
          <button className="btn btn-primary" style={{ marginTop:'1.5rem' }} onClick={saveNotifs} disabled={saving}>
            {saving ? <><span className="spinner"/>Saving…</> : 'Save Preferences'}
          </button>
        </div>
      )}

      {tab === 'security' && (
        <div className="card card-p" style={{ maxWidth:500 }}>
          <h2 style={{ fontSize:'var(--text-xl)', marginBottom:'1.5rem' }}>Change Password</h2>
          <form onSubmit={changePwd} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            {[['old_password','Current Password'],['new_password','New Password'],['new_password2','Confirm New Password']].map(([n,l]) => (
              <div className="form-group" key={n}>
                <label className="form-label">{l}</label>
                <input name={n} type="password" className="input" value={pwd[n]} onChange={e => setPwd(p => ({ ...p, [e.target.name]: e.target.value }))} disabled={saving}/>
              </div>
            ))}
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><span className="spinner"/>Updating…</> : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {tab === 'account' && (
        <div className="card card-p" style={{ maxWidth:500 }}>
          <h2 style={{ fontSize:'var(--text-xl)', marginBottom:'1rem' }}>Account Information</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {[['Username', user?.username],['Email', user?.email],['Role', user?.role_display],['Member since', user?.date_joined?.slice(0,10)]].map(([l,v]) => (
              <div key={l} style={{ display:'grid', gridTemplateColumns:'140px 1fr', gap:'1rem', padding:'0.875rem 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', fontWeight:500 }}>{l}</span>
                <span style={{ fontSize:'var(--text-sm)' }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   pages/app/History.jsx
   ═══════════════════════════════════════════════════ */
import { useEffect, useMemo } from 'react'
import { listAssessments, deleteAssessment } from '../../api/index'
import { InlineLoader } from '../../components/ui/Guards'
import { Link } from 'react-router-dom'

export function History() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')
  const [search, setSearch]   = useState('')
  const [deleting, setDeleting] = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    listAssessments()
      .then(d => setItems(d.results || d))
      .catch(() => setError('Failed to load history.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return items.filter(i => {
      const matchFilter = filter === 'all' || (filter === 'yes' && i.prediction === 'YES') || (filter === 'no' && i.prediction === 'NO')
      const matchSearch = !search || i.short_id?.toLowerCase().includes(search.toLowerCase()) || i.created_at?.includes(search)
      return matchFilter && matchSearch
    })
  }, [items, filter, search])

  const handleDelete = async id => {
    if (!confirm('Delete this screening? This cannot be undone.')) return
    setDeleting(id)
    try { await deleteAssessment(id); setItems(p => p.filter(i => i.id !== id)) }
    catch { setError('Failed to delete.') }
    finally { setDeleting(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem' }}>
        <div className="page-header" style={{ marginBottom:0 }}><h1>Screening History</h1><p>All your ASD screening records.</p></div>
        <Link to="/predict" className="btn btn-primary">+ New Screening</Link>
      </div>
      {error && <div className="alert alert-danger" style={{ marginBottom:'1rem' }}><span><IcAlert size={16}/></span><span>{error}</span></div>}
      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1.25rem' }}>
        <input className="input" placeholder="Search by ID or date…" value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth:260 }}/>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          {[['all','All'],['yes','Indicators'],['no','No Concern']].map(([v,l]) => (
            <button key={v} className={`chip${filter===v?' active':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>
      </div>
      {loading ? <InlineLoader/> : filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><span className="empty-icon"><IcClip size={40}/></span><h3>{items.length===0?'No screenings yet':'No results match your filter'}</h3><p>{items.length===0?'Complete your first ASD screening to see results here.':'Try adjusting your search or filter.'}</p>{items.length===0&&<Link to="/predict" className="btn btn-primary btn-sm">Start First Screening</Link>}</div></div>
      ) : (
        <div className="tbl-wrap card" style={{ padding:0 }}>
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>Result</th><th>Risk</th><th>Confidence</th><th>Saved</th><th></th></tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><code style={{ fontSize:'var(--text-xs)', background:'var(--surface-2)', padding:'2px 6px', borderRadius:'var(--r-sm)', color:'var(--text-muted)' }}>{p.short_id}</code></td>
                  <td style={{ color:'var(--text-muted)', whiteSpace:'nowrap' }}>{p.created_at?.slice(0,10)}</td>
                  <td>{p.prediction?<span className={`badge ${p.prediction==='YES'?'badge-yellow':'badge-green'}`}>{p.prediction==='YES'?'Indicators':'No concern'}</span>:<span className="badge badge-gray">{p.status}</span>}</td>
                  <td>{p.risk_level&&<span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{p.risk_level}</span>}</td>
                  <td>{p.confidence!=null?`${p.confidence}%`:'—'}</td>
                  <td>{p.is_saved?<span className="badge badge-blue">Saved</span>:'—'}</td>
                  <td>
                    <button onClick={() => handleDelete(p.id)} className="btn btn-ghost btn-sm" disabled={deleting===p.id} style={{ color:'var(--danger)' }}>
                      {deleting===p.id?<span className="spinner" style={{ width:12,height:12 }}/>:'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding:'0.75rem 1rem', borderTop:'1px solid var(--border)', fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>
            Showing {filtered.length} of {items.length} records
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   pages/app/Saved.jsx
   ═══════════════════════════════════════════════════ */
import { listSaved, removeSaved } from '../../api/index'

export function Saved() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  useEffect(() => {
    listSaved().then(d => setItems(d.results||d)).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  const remove = async id => {
    setRemoving(id)
    try { await removeSaved(id); setItems(p => p.filter(i => i.id !== id)) }
    catch {}
    finally { setRemoving(null) }
  }

  return (
    <div>
      <div className="page-header"><h1>Saved Results</h1><p>Your bookmarked screening records.</p></div>
      {loading ? <InlineLoader/> : items.length === 0 ? (
        <div className="card"><div className="empty-state"><span className="empty-icon"><IcBookmark size={40}/></span><h3>No saved results</h3><p>Bookmark assessments from your history to find them here.</p><Link to="/history" className="btn btn-primary btn-sm">Go to History</Link></div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {items.map(s => (
            <div key={s.id} className="card card-p" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                  <code style={{ fontSize:'var(--text-xs)', background:'var(--surface-2)', padding:'2px 6px', borderRadius:'var(--r-sm)', color:'var(--text-muted)' }}>{s.assessment?.short_id}</code>
                  {s.assessment?.prediction && <span className={`badge ${s.assessment.prediction==='YES'?'badge-yellow':'badge-green'}`}>{s.assessment.prediction==='YES'?'Indicators found':'No concern'}</span>}
                  {s.assessment?.confidence!=null && <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{s.assessment.confidence}% confidence</span>}
                </div>
                <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>Saved on {s.created_at?.slice(0,10)} · Screened on {s.assessment?.created_at?.slice(0,10)}</div>
                {s.notes && <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginTop:'0.375rem' }}>{s.notes}</p>}
              </div>
              <button onClick={() => remove(s.id)} className="btn btn-secondary btn-sm" disabled={removing===s.id} style={{ flexShrink:0 }}>
                {removing===s.id?<span className="spinner" style={{ width:12,height:12}}/>:'Remove'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   pages/app/Notifications.jsx
   ═══════════════════════════════════════════════════ */
import { listNotifications, markRead, markAllRead } from '../../api/index'

export function Notifications() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => listNotifications().then(d => setItems(d.results||d)).catch(()=>{}).finally(()=>setLoading(false))
  useEffect(() => { load() }, [])

  const handleRead = async id => {
    await markRead(id)
    setItems(p => p.map(i => i.id===id?{...i,is_read:true}:i))
  }
  const handleAllRead = async () => { await markAllRead(); setItems(p => p.map(i=>({...i,is_read:true}))) }

  const unread = items.filter(i => !i.is_read).length

  const TYPE_ICONS = {
    assessment_completed: <IcActivity size={18}/>,
    recommendation:       <IcInfo size={18}/>,
    account:              <IcUser size={18}/>,
    system:               <IcSettings size={18}/>,
    alert:                <IcAlert size={18}/>,
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem', marginBottom:'2rem' }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Notifications {unread>0&&<span className="badge badge-red" style={{ verticalAlign:'middle', marginLeft:'0.5rem' }}>{unread}</span>}</h1>
          <p>Your platform notifications and alerts.</p>
        </div>
        {unread>0&&<button className="btn btn-secondary btn-sm" onClick={handleAllRead}>Mark all read</button>}
      </div>
      {loading ? <InlineLoader/> : items.length===0 ? (
        <div className="card"><div className="empty-state"><span className="empty-icon"><IcBell size={40}/></span><h3>No notifications</h3><p>You're all caught up!</p></div></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
          {items.map(n => (
            <div key={n.id} onClick={() => !n.is_read && handleRead(n.id)}
              style={{ display:'flex', gap:'1rem', padding:'1rem 1.25rem', background: n.is_read?'transparent':'var(--primary-pale)', borderBottom:'1px solid var(--border)', cursor: n.is_read?'default':'pointer', transition:'background 0.15s' }}
            >
              <div style={{ flexShrink:0, marginTop:'0.125rem', color:'var(--primary)' }}>{TYPE_ICONS[n.notif_type]||<IcBell size={18}/>}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:'0.5rem', flexWrap:'wrap' }}>
                  <span style={{ fontWeight: n.is_read?500:700, fontSize:'var(--text-sm)', color:'var(--text)' }}>{n.title}</span>
                  <span style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', flexShrink:0 }}>{n.created_at?.slice(0,10)}</span>
                </div>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', marginTop:'0.25rem', lineHeight:1.6 }}>{n.message}</p>
              </div>
              {!n.is_read && <div style={{ width:8,height:8,borderRadius:'50%',background:'var(--primary)',flexShrink:0,marginTop:'0.375rem'}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════
   pages/app/Help.jsx
   ═══════════════════════════════════════════════════ */
export function Help() {
  const TOPICS = [
    { icon:<IcClip size={20}/>,     q:'How do I run a new screening?', a:'Click "New Screening" from the sidebar or dashboard. Follow the 4-step form covering demographics, medical history, AQ-10 questions, and clinical scores. Results appear instantly.' },
    { icon:<IcActivity size={20}/>, q:'How does the screening model work?', a:'Mindello uses a Random Forest classifier trained on validated clinical data. It evaluates 24 inputs derived from AQ-10, Q-CHAT-10, and CARS screening tools.' },
    { icon:<IcInfo size={20}/>,     q:'What does a "positive" result mean?', a:'A positive result (indicators found) means the data pattern matches those associated with ASD. It is NOT a diagnosis. Always consult a qualified professional.' },
    { icon:<IcSearch size={20}/>,   q:'What is SHAP explainability?', a:'SHAP (SHapley Additive exPlanations) shows which factors influenced the prediction the most, so you understand why the model reached its conclusion.' },
    { icon:<IcLock size={20}/>,     q:'Is my data private?', a:'Yes. Your data is stored securely, protected with JWT authentication, and never shared with third parties. Each account\'s data is visible only to that account.' },
    { icon:<IcFolder size={20}/>,   q:'Can I export my screening history?', a:'Screening history is visible in the History tab. Export features are on the roadmap. Contact us if you need a data export urgently.' },
  ]
  return (
    <div>
      <div className="page-header"><h1>Help Center</h1><p>Answers to common questions about the Mindello platform.</p></div>
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem', maxWidth:720 }}>
        {TOPICS.map(t => (
          <div key={t.q} className="card card-p">
            <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <span style={{ flexShrink:0, color:'var(--primary)', marginTop:'2px' }}>{t.icon}</span>
              <div>
                <h3 style={{ fontSize:'var(--text-base)', marginBottom:'0.5rem' }}>{t.q}</h3>
                <p style={{ fontSize:'var(--text-sm)', color:'var(--text-muted)', lineHeight:1.7 }}>{t.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="card card-p" style={{ marginTop:'1.5rem', maxWidth:720, background:'var(--primary)', color:'#fff' }}>
        <h3 style={{ color:'#fff', marginBottom:'0.5rem' }}>Still need help?</h3>
        <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'var(--text-sm)', marginBottom:'1rem' }}>Send us a message and we'll respond within 48 hours.</p>
        <Link to="/contact" className="btn" style={{ background:'#fff', color:'var(--primary)', fontWeight:600 }}>Contact Support</Link>
      </div>
    </div>
  )
}
