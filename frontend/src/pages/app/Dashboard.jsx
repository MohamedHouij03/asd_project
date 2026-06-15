/**
 * pages/app/Dashboard.jsx
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getStats } from '../../api/users'
import { useAuth } from '../../context/AuthContext'
import { InlineLoader } from '../../components/ui/Guards'

const Ic = ({ size = 18, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
)
const IconClipboard  = p => <Ic {...p}><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></Ic>
const IconAlertTri  = p => <Ic {...p}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>
const IconCheckCirc = p => <Ic {...p}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ic>
const IconTarget    = p => <Ic {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Ic>
const IconActivity  = p => <Ic {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></Ic>
const IconFolder    = p => <Ic {...p}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Ic>
const IconBookmark  = p => <Ic {...p}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></Ic>
const IconUser      = p => <Ic {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Ic>

function Stat({ label, value, sub, color = 'var(--primary)', icon }) {
  return (
    <div className="card card-p" style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
      <div className="stat-icon" style={{ background:`${color}12`, color }}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize:'var(--text-xs)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{label}</div>
        <div style={{ fontFamily:'var(--font-heading)', fontSize:'var(--text-3xl)', fontWeight:700, color, lineHeight:1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', marginTop:'0.25rem' }}>{sub}</div>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--text)', borderRadius:'var(--r-md)', padding:'0.625rem 0.875rem', fontSize:'var(--text-xs)' }}>
      <p style={{ color:'rgba(255,255,255,0.6)', marginBottom:'0.25rem' }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color, fontWeight:600 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

const RISK_COLORS = { high:'var(--danger)', moderate:'var(--warning)', low:'var(--success)' }
const PRED_COLORS = { YES:'var(--warning)', NO:'var(--success)' }

export default function Dashboard() {
  const { user }  = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    getStats()
      .then(setData)
      .catch(() => setError('Could not load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  const preds  = data?.recent_assessments || []
  const monthly = data?.monthly || []

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', flexWrap:'wrap', marginBottom:'2rem' }}>
        <div>
          <h1 style={{ fontSize:'var(--text-3xl)', marginBottom:'0.25rem' }}>
            Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}, {user?.first_name || user?.username}
          </h1>
          <p style={{ color:'var(--text-muted)' }}>Here's your screening activity overview.</p>
        </div>
        <Link to="/predict" className="btn btn-primary">+ New Screening</Link>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom:'1.5rem' }}><IconAlertTri size={16}/><span>{error}</span></div>}
      {loading ? <InlineLoader/> : (
        <>
          {/* Stats grid */}
          <div className="grid-4" style={{ gap:'1rem', marginBottom:'1.5rem' }}>
            <Stat label="Total Screenings"    value={data?.total_assessments}                         icon={<IconClipboard size={20}/>} color="var(--primary)"/>
            <Stat label="Positive Indicators" value={data?.positive_results}                          icon={<IconAlertTri size={20}/>} color="var(--warning)" sub="Seek professional guidance"/>
            <Stat label="No Concern"          value={data?.negative_results}                          icon={<IconCheckCirc size={20}/>} color="var(--success)"/>
            <Stat label="Avg. Confidence"     value={data?.avg_confidence ? `${data.avg_confidence}%` : '—'} icon={<IconTarget size={20}/>} color="var(--purple)"/>
          </div>

          <div className="dash-main-grid" style={{ marginBottom:'1.5rem' }}>
            {/* Monthly chart */}
            <div className="card card-p">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2 style={{ fontSize:'var(--text-xl)' }}>Monthly Screenings</h2>
                <span className="badge badge-blue">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthly} margin={{ top:4, right:0, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fontSize:11, fill:'var(--text-muted)' }} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="positive" name="Indicators"  fill="var(--warning)" radius={[3,3,0,0]}/>
                  <Bar dataKey="negative" name="No concern"  fill="var(--success)" radius={[3,3,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="card card-p">
              <h2 style={{ fontSize:'var(--text-xl)', marginBottom:'1.25rem' }}>Quick Actions</h2>
              {[
                { to:'/predict',  icon:<IconActivity size={18}/>, label:'Run New Screening',    desc:'Start ASD assessment' },
                { to:'/history',  icon:<IconFolder size={18}/>,   label:'View History',          desc:'All past screenings' },
                { to:'/saved',    icon:<IconBookmark size={18}/>,  label:'Saved Results',         desc:'Bookmarked assessments' },
                { to:'/profile',  icon:<IconUser size={18}/>,      label:'Edit Profile',          desc:'Update your information' },
              ].map(a => (
                <Link key={a.to} to={a.to} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.75rem', borderRadius:'var(--r-md)', transition:'background 0.15s', textDecoration:'none', marginBottom:'0.375rem' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--surface-2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{ flexShrink:0, color:'var(--primary)' }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight:600, fontSize:'var(--text-sm)', color:'var(--text)' }}>{a.label}</div>
                    <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent assessments */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
              <h2 style={{ fontSize:'var(--text-xl)' }}>Recent Screenings</h2>
              <Link to="/history" style={{ fontSize:'var(--text-sm)', color:'var(--primary)', fontWeight:600 }}>View all →</Link>
            </div>
            {preds.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon"><IconClipboard size={40}/></span>
                <h3>No screenings yet</h3>
                <p>Complete your first ASD screening to see results here.</p>
                <Link to="/predict" className="btn btn-primary btn-sm">Start First Screening</Link>
              </div>
            ) : (
              <div className="tbl-wrap" style={{ border:'none', borderRadius:0 }}>
                <table>
                  <thead><tr><th>ID</th><th>Date</th><th>Result</th><th>Risk</th><th>Confidence</th></tr></thead>
                  <tbody>
                    {preds.map(p => (
                      <tr key={p.id}>
                        <td><code style={{ fontSize:'var(--text-xs)', background:'var(--surface-2)', padding:'2px 6px', borderRadius:'var(--r-sm)', color:'var(--text-muted)' }}>{p.short_id}</code></td>
                        <td style={{ color:'var(--text-muted)' }}>{p.created_at?.slice(0,10)}</td>
                        <td>
                          {p.prediction
                            ? <span className={`badge ${p.prediction==='YES'?'badge-yellow':'badge-green'}`}>{p.prediction==='YES'?'Indicators found':'No concern'}</span>
                            : <span className="badge badge-gray">Pending</span>}
                        </td>
                        <td>
                          {p.risk_level && <span className="badge" style={{ background: `${RISK_COLORS[p.risk_level]}15`, color: RISK_COLORS[p.risk_level] }}>{p.risk_level}</span>}
                        </td>
                        <td>
                          {p.confidence != null ? (
                            <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                              <div className="progress-track" style={{ width:56 }}>
                                <div className="progress-fill" style={{ width:`${p.confidence}%`, background: p.confidence>=80?'var(--success)':p.confidence>=60?'var(--warning)':'var(--danger)' }}/>
                              </div>
                              <span style={{ fontSize:'var(--text-xs)', fontWeight:600 }}>{p.confidence}%</span>
                            </div>
                          ) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
