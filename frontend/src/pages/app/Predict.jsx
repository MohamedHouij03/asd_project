/**
 * pages/app/Predict.jsx — ASD Screening Form
 */
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { runAssessment } from '../../api/index'

const STEPS = ['About the Child', 'Medical History', 'AQ-10 Questionnaire', 'Clinical Scores']

const AQ = [
  [1,  "Notices small sounds that others don't notice"],
  [2,  'Prefers focusing on the whole picture rather than small details'],
  [3,  'Can easily do more than one thing at a time'],
  [4,  'Can switch easily between activities after an interruption'],
  [5,  'Can easily "read between the lines" when talking with someone'],
  [6,  'Knows how to tell if someone listening is getting bored'],
  [7,  'Reading fiction seems like a waste of time'],
  [8,  'Has difficulty imagining what characters in a story look like'],
  [9,  'Is fascinated by dates (birthdays, historical events)'],
  [10, 'Can easily work out what someone is thinking from their facial expression'],
]

const MEDICAL = [
  ['speech_delay',               'Speech or language development differences'],
  ['learning_disorder',          'Learning differences or difficulties'],
  ['genetic_disorders',          'Known genetic conditions'],
  ['depression',                 'Depression or persistent low mood'],
  ['global_developmental_delay', 'Global developmental or intellectual delay'],
  ['social_behavioural_issues',  'Social or behavioural differences'],
  ['anxiety_disorder',           'Anxiety disorder or excessive worry'],
]

const INIT = {
  age: '', sex: 'm', ethnicity: 'White European', jaundice: 0, family_mem_with_asd: 0,
  speech_delay: 0, learning_disorder: 0, genetic_disorders: 0, depression: 0,
  global_developmental_delay: 0, social_behavioural_issues: 0, anxiety_disorder: 0,
  a1_score: 0, a2_score: 0, a3_score: 0, a4_score: 0, a5_score: 0,
  a6_score: 0, a7_score: 0, a8_score: 0, a9_score: 0, a10_score: 0,
  childhood_autism_rating_scale: 15, social_responsiveness_scale: '', notes: '',
}

function Toggle({ value, onChange, labels = ['Often / Always', 'Rarely / Never'], colors = ['var(--warning)', 'var(--primary)'] }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {[1, 0].map((v, i) => (
        <button key={v} type="button" onClick={() => onChange(v)}
          style={{
            flex: 1, padding: '0.4rem 0.75rem', borderRadius: 'var(--r-md)',
            border: `2px solid ${value === v ? colors[i] : 'var(--border)'}`,
            background: value === v ? `${colors[i]}18` : 'var(--surface)',
            color: value === v ? colors[i] : 'var(--text-muted)',
            fontWeight: 600, fontSize: 'var(--text-xs)', cursor: 'pointer', transition: 'all 0.15s',
          }}>
          {labels[i]}
        </button>
      ))}
    </div>
  )
}

const Ic = ({ size = 24, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
)
const IcAlertTri  = ({ size }) => <Ic size={size}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></Ic>
const IcCheckCirc = ({ size }) => <Ic size={size}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Ic>

/* ── Result view ─────────────────────────────────────────────────────── */
function ResultView({ result, onReset }) {
  const positive = result.result?.prediction === 'YES'
  const conf     = result.result?.confidence
  const factors  = result.result?.top_factors || []
  const chart    = result.result?.contrib_chart
  const recs     = result.result?.recommendations || []

  const bgColor  = positive ? '#FFFBEB' : '#F0FDF4'
  const border   = positive ? '#FCD34D' : '#86EFAC'
  const accent   = positive ? 'var(--warning)' : 'var(--success)'
  const label    = positive ? 'Some indicators detected' : 'No strong indicators found'
  const icon     = positive ? <IcAlertTri size={48}/> : <IcCheckCirc size={48}/>
  const subtitle = positive
    ? 'Patterns consistent with ASD indicators were found. This is NOT a diagnosis. Please consult a qualified healthcare professional for formal evaluation.'
    : 'The screening did not detect strong ASD-related patterns. If concerns persist, speak with your paediatrician or a specialist.'

  return (
    <div className="result-appear">
      {/* ── Main result card ── */}
      <div style={{ padding: '2rem', borderRadius: 'var(--r-xl)', border: `2px solid ${border}`, background: bgColor, marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, color: accent }}>{icon}</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent, marginBottom: '0.375rem' }}>
              Screening Result
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', color: accent, marginBottom: '0.625rem', lineHeight: 1.2 }}>{label}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', lineHeight: 1.75 }}>{subtitle}</p>
          </div>
        </div>

        {/* Confidence meter */}
        {conf != null && (
          <div style={{ background: 'rgba(255,255,255,0.65)', borderRadius: 'var(--r-lg)', padding: '1.25rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.625rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-2)' }}>Model Confidence</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-3xl)', fontWeight: 700, color: accent, lineHeight: 1 }}>{conf}%</span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div
                className={`progress-fill confidence-fill ${positive ? 'warning' : 'success'}`}
                style={{ width: `${conf}%` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.375rem', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>Low confidence</span><span>High confidence</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Factors + Recommendations grid ── */}
      <div className="result-factors-grid" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Top factors */}
        {factors.length > 0 && (
          <div className="card card-p">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1.25rem' }}>Key Contributing Factors</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {factors.slice(0, 6).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'var(--text-sm)' }}>
                  <span style={{ minWidth: 130, color: 'var(--text-2)', fontWeight: 500, fontSize: 'var(--text-xs)' }}>
                    {f.feature?.replace(/_/g, ' ')}
                  </span>
                  <div className="progress-track" style={{ flex: 1 }}>
                    <div style={{
                      width: `${Math.min(Math.abs(f.contribution) * 200, 100)}%`,
                      height: '100%',
                      background: f.direction === 'increase' ? 'var(--warning)' : 'var(--success)',
                      borderRadius: 'var(--r-full)',
                      transition: 'width 0.8s ease',
                    }}/>
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    color: f.direction === 'increase' ? 'var(--warning)' : 'var(--success)',
                    minWidth: 50, textAlign: 'right',
                  }}>
                    {f.direction === 'increase' ? '↑ risk' : '↓ risk'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recs.length > 0 && (
          <div className="card card-p">
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '1.25rem' }}>Next Steps & Recommendations</h3>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recs.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.625rem', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0, marginTop: '0.1em' }}>→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SHAP chart */}
      {chart && (
        <div className="card card-p" style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.25rem' }}>Feature Contribution Chart (SHAP)</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}>Which inputs influenced this prediction and by how much.</p>
          <img src={`data:image/png;base64,${chart}`} alt="SHAP contribution chart" style={{ width: '100%', borderRadius: 'var(--r-md)' }}/>
        </div>
      )}

      {/* Disclaimer */}
      <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
        <IcAlertTri size={16}/>
        <span style={{ fontSize: 'var(--text-sm)' }}>
          <strong>Medical disclaimer:</strong> Mindello is for informational and decision-support purposes only. It is not a medical diagnostic tool. A positive screening result does not mean a child has ASD. Always consult a qualified healthcare professional for a formal evaluation.
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button onClick={onReset} className="btn btn-primary">Run Another Screening</button>
        <Link to="/history"   className="btn btn-secondary">View History</Link>
        <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function Predict() {
  const [step, setStep]       = useState(0)
  const [form, setForm]       = useState(INIT)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const change = (name, value) => { setForm(p => ({ ...p, [name]: value })); setError('') }
  const aqTotal = [1,2,3,4,5,6,7,8,9,10].reduce((s, n) => s + Number(form[`a${n}_score`]), 0)

  const validate = () => {
    if (step === 0 && (!form.age || isNaN(form.age) || form.age < 0 || form.age > 18))
      return 'Please enter a valid age (0–18).'
    if (step === 3) {
      const c = Number(form.childhood_autism_rating_scale)
      if (c < 15 || c > 60) return 'CARS score must be between 15 and 60.'
    }
    return ''
  }

  const next  = () => { const e = validate(); if (e) { setError(e); return }; setError(''); setStep(s => s + 1); window.scrollTo(0, 0) }
  const back  = () => { setError(''); setStep(s => s - 1); window.scrollTo(0, 0) }
  const reset = () => { setResult(null); setStep(0); setForm(INIT); setError('') }

  const submit = async () => {
    const e = validate(); if (e) { setError(e); return }
    setLoading(true); setError('')
    try {
      const srs = form.social_responsiveness_scale
      const payload = {
        ...form,
        age:                          Number(form.age),
        childhood_autism_rating_scale: Number(form.childhood_autism_rating_scale),
        social_responsiveness_scale:  srs === '' ? null : Number(srs),
        qchat_10_score:               Math.min(10, aqTotal),
      }
      const res = await runAssessment(payload)
      setResult(res)
      window.scrollTo(0, 0)
    } catch (err) { setError(err.userMessage || 'Submission failed. Please try again.') }
    finally { setLoading(false) }
  }

  if (result) return <ResultView result={result} onReset={reset}/>

  return (
    <div style={{ maxWidth: 700 }}>
      <div className="page-header">
        <h1>ASD Screening</h1>
        <p>Answer questions honestly for the most accurate result. About 5–10 minutes.</p>
      </div>

      {/* ── Step indicator ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--text-sm)',
                background: i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'var(--surface-3)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                border: `2px solid ${i < step ? 'var(--success)' : i === step ? 'var(--primary)' : 'var(--border)'}`,
                transition: 'all 0.2s',
                boxShadow: i === step ? '0 0 0 4px var(--primary-pale)' : 'none',
              }}>
                {i < step ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <span className="step-label" style={{
                fontWeight: i === step ? 700 : 500,
                color: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--text-muted)',
              }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2, background: i < step ? 'var(--success)' : 'var(--surface-3)', margin: '0 0.25rem', marginBottom: '1.25rem', transition: 'background 0.3s' }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: '1rem' }}><IcAlertTri size={16}/><span>{error}</span></div>}

      {/* ── Step content ── */}
      <div className="card card-p" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          Step {step + 1}: {STEPS[step]}
        </h2>

        {/* Step 0 — About the child */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Child's Age (years) *</label>
              <input type="number" className="input" placeholder="e.g. 4.5" min="0" max="18" step="0.5"
                value={form.age} onChange={e => change('age', e.target.value)} style={{ maxWidth: 200 }}/>
              <span className="form-hint">Age in years (0–18). Decimals accepted.</span>
            </div>
            <div className="form-group">
              <label className="form-label">Sex *</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {[['m', 'Male'], ['f', 'Female']].map(([v, l]) => (
                  <button key={v} type="button" onClick={() => change('sex', v)}
                    style={{ flex: 1, maxWidth: 160, padding: '0.625rem', border: `2px solid ${form.sex === v ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--r-md)', background: form.sex === v ? 'var(--primary-pale)' : 'var(--surface)', color: form.sex === v ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'all 0.15s' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ethnicity *</label>
              <select className="input" value={form.ethnicity} onChange={e => change('ethnicity', e.target.value)} style={{ maxWidth: 280 }}>
                {['White European','Asian','South Asian','Middle Eastern','Black','Latino','Hispanic','Others'].map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              {[['jaundice', 'Born with jaundice?'], ['family_mem_with_asd', 'Family member with ASD?']].map(([k, l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <Toggle value={form[k]} onChange={v => change(k, v)} labels={['Yes', 'No']} colors={['var(--primary)', 'var(--text-muted)']}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — Medical history */}
        {step === 1 && (
          <div>
            <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
              <span>ℹ️</span><span style={{ fontSize: 'var(--text-sm)' }}>Answer as accurately as possible. If unsure, select No.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {MEDICAL.map(([k, l]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-2)', flex: 1, minWidth: 200, lineHeight: 1.55 }}>{l}</span>
                  <div style={{ flexShrink: 0 }}>
                    <Toggle value={form[k]} onChange={v => change(k, v)} labels={['Yes', 'No']} colors={['var(--primary)', 'var(--text-muted)']}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — AQ-10 */}
        {step === 2 && (
          <div>
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
              <span>ℹ️</span>
              <div style={{ fontSize: 'var(--text-sm)' }}><strong>AQ-10 Questionnaire:</strong> Select how often each behaviour applies to the child.</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.875rem', background: 'var(--primary-pale)', borderRadius: 'var(--r-md)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--primary)' }}>Current AQ Score</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--primary)' }}>{aqTotal} / 10</span>
            </div>
            {AQ.map(([n, q]) => (
              <div key={n} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: 'var(--r-sm)', fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0 }}>A{n}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', color: 'var(--text-2)', lineHeight: 1.55, minWidth: 180 }}>{q}</span>
                <div style={{ flexShrink: 0, minWidth: 200 }}>
                  <Toggle value={form[`a${n}_score`]} onChange={v => change(`a${n}_score`, v)}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step 3 — Clinical scores */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Childhood Autism Rating Scale (CARS) *</label>
              <input type="number" className="input" placeholder="e.g. 28" min="15" max="60" step="0.5"
                value={form.childhood_autism_rating_scale} onChange={e => change('childhood_autism_rating_scale', e.target.value)} style={{ maxWidth: 200 }}/>
              <span className="form-hint">Scale 15 (no ASD) to 60 (severe ASD). Scores ≥ 30 suggest moderate–severe. Enter 15 if unknown.</span>
            </div>
            <div className="form-group">
              <label className="form-label">
                Social Interaction Observation Score (0–10)
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.375rem' }}>(optional)</span>
              </label>
              <input type="number" className="input" placeholder="0–10" min="0" max="10" step="0.5"
                value={form.social_responsiveness_scale} onChange={e => change('social_responsiveness_scale', e.target.value)} style={{ maxWidth: 200 }}/>
            </div>
            <div className="form-group">
              <label className="form-label">
                Additional Notes
                <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.375rem' }}>(optional)</span>
              </label>
              <textarea className="input" rows={3} placeholder="Any additional context…" value={form.notes} onChange={e => change('notes', e.target.value)} style={{ resize: 'vertical' }}/>
            </div>

            {/* Summary review */}
            <div className="card card-p" style={{ background: 'var(--primary)', color: '#fff' }}>
              <h3 style={{ color: '#fff', fontSize: 'var(--text-base)', marginBottom: '0.875rem' }}>Ready to Submit: Summary</h3>
              <div className="grid-2" style={{ gap: '0.5rem', fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>
                {[
                  ['Age', `${form.age}y`],
                  ['Sex', form.sex === 'm' ? 'Male' : 'Female'],
                  ['AQ-10 Score', `${aqTotal}/10`],
                  ['CARS', form.childhood_autism_rating_scale],
                ].map(([l, v]) => (
                  <div key={l}><span style={{ color: 'rgba(255,255,255,0.55)' }}>{l}:</span> <strong>{v}</strong></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {step > 0 && (
            <button onClick={back} className="btn btn-ghost btn-lg" disabled={loading}>← Back</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Step {step + 1} of {STEPS.length}</span>
          {step < STEPS.length - 1
            ? <button onClick={next} className="btn btn-primary btn-lg">Continue →</button>
            : <button onClick={submit} className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <><span className="spinner"/>Analysing…</> : 'Analyse Now →'}
              </button>
          }
        </div>
      </div>
    </div>
  )
}
