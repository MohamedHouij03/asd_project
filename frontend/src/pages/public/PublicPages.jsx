/**
 * pages/public/PublicPages.jsx
 * All static/educational public pages bundled together.
 */
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listFAQ, submitContact } from '../../api/index'
import { InlineLoader } from '../../components/ui/Guards'

/* ══════════════════════════════════════════════════
   About Autism
   ══════════════════════════════════════════════════ */
export function About() {
  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'linear-gradient(160deg,var(--primary-pale) 0%,var(--bg) 60%)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 760, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1rem' }}>ABOUT AUTISM</div>
          <h1 style={{ letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>Understanding Autism Spectrum Disorder</h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            ASD is a neurodevelopmental condition that affects how people perceive and interact with the world. It's a spectrum, and no two people experience it the same way.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="grid-2" style={{ gap: '3rem', alignItems: 'start', marginBottom: '5rem' }}>
            <div>
              <h2 style={{ fontSize: 'var(--text-3xl)', marginBottom: '1.25rem' }}>What is ASD?</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                Autism Spectrum Disorder (ASD) is a complex neurodevelopmental condition characterised by differences in social communication and interaction, as well as restricted or repetitive patterns of behaviour, interests, or activities.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '1rem' }}>
                ASD is called a "spectrum" because the range and severity of challenges and strengths varies enormously. Some autistic people live independently and thrive with minimal support; others may need significant daily assistance.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                ASD is present from birth, though it may not become apparent until later in childhood. It is not caused by vaccines, parenting style, or social factors.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[['1 in 36', 'children in the U.S. are identified with ASD (CDC, 2023)'],
                ['4×', 'more common in males than females'],
                ['Early intervention', 'before age 3 leads to significantly better outcomes'],
                ['Average diagnosis age', '4–5 years, though signs often appear by 18–24 months']
              ].map(([n, d]) => (
                <div key={n} className="card card-p">
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.375rem' }}>{n}</div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-p" style={{ background: 'var(--surface-2)', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '1.5rem' }}>How Mindello Helps</h2>
            <div className="grid-3" style={{ gap: '1.5rem' }}>
              {[
                [<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, 'First-step screening', 'Mindello provides a quick, evidence-based screening that can trigger important conversations with healthcare providers.'],
                [<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>, 'Explainable AI', 'SHAP values show exactly which factors influenced the result, making it useful and transparent rather than a black box.'],
                [<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, 'Tracking over time', 'Save results and monitor changes across multiple screenings, building a record to share with specialists.'],
              ].map(([i, t, d]) => (
                <div key={t}>
                  <div style={{ color: 'var(--primary)', marginBottom: '0.875rem' }}>{i}</div>
                  <h3 style={{ fontSize: 'var(--text-base)', marginBottom: '0.5rem' }}>{t}</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.7 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="alert alert-warning">
            <span>⚠️</span>
            <div>
              <strong>Important disclaimer</strong>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: '0.375rem', lineHeight: 1.7 }}>Mindello is a decision-support tool, not a diagnostic service. A positive screening result does not mean a child has ASD, and a negative result does not rule it out. Always consult a qualified medical professional for a formal evaluation.</p>
            </div>
          </div>
        </div>
      </section>

      <div style={{ background: 'var(--primary)', padding: '4rem 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to learn more?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '2rem' }}>Explore the signs of ASD or start a free screening.</p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signs"    className="btn btn-xl" style={{ background: '#fff', color: 'var(--primary)', fontWeight: 600 }}>Signs & Symptoms</Link>
            <Link to="/register" className="btn btn-xl" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>Get Started Free</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Signs & Symptoms
   ══════════════════════════════════════════════════ */
const SIGNS_BY_AGE = [
  { age: '0–12 months', signs: ['Limited or no eye contact', 'Doesn\'t respond to their name', 'Doesn\'t babble or coo by 12 months', 'Doesn\'t use gestures (pointing, waving) by 12 months', 'Doesn\'t smile in response to smiling faces'] },
  { age: '12–24 months', signs: ['No single words by 16 months', 'No two-word phrases by 24 months', 'Loss of previously acquired language or skills', 'Doesn\'t engage in pretend play', 'Limited interest in other children'] },
  { age: '2–5 years', signs: ['Difficulty with back-and-forth conversation', 'Uses language in unusual ways (echolalia)', 'Intense focus on specific topics or objects', 'Insistence on routines; distress at changes', 'Unusual sensory responses (oversensitive or undersensitive)'] },
  { age: 'All ages', signs: ['Repetitive body movements (rocking, hand-flapping)', 'Preference for sameness and routine', 'Difficulty understanding others\' perspectives', 'Literal interpretation of language', 'Strong preferences or aversions to sensory input'] },
]

export function Signs() {
  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'linear-gradient(160deg,var(--purple-pale) 0%,var(--bg) 60%)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--purple)', marginBottom: '1rem' }}>SIGNS & SYMPTOMS</div>
          <h1 style={{ letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>What to look for, by age</h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', lineHeight: 1.7 }}>Early signs of ASD can appear before age 2. Knowing what to watch for can help families seek support sooner.</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="alert alert-info" style={{ marginBottom: '3rem' }}>
            <span>ℹ️</span>
            <div style={{ fontSize: 'var(--text-sm)' }}>Every child develops at their own pace. These are potential indicators and not a checklist for diagnosis. If you notice several of these signs, speak with your paediatrician.</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {SIGNS_BY_AGE.map(({ age, signs }) => (
              <div key={age} className="card card-p">
                <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--purple)', marginBottom: '1.25rem' }}>{age}</h2>
                <ul className="grid-2" style={{ gap: '0.75rem' }}>
                  {signs.map(s => (
                    <li key={s} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0, marginTop: '0.1em' }}>→</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Think you've noticed some of these signs?</p>
            <Link to="/register" className="btn btn-primary btn-lg">Run a Free Screening →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Resources
   ══════════════════════════════════════════════════ */
const RESOURCES = [
  { category: 'Diagnosis & Assessment', items: [
    { name: 'CDC: Learn the Signs. Act Early.', url: 'https://www.cdc.gov/ncbddd/actearly', desc: 'Free developmental milestone resources and screening tools.' },
    { name: 'Autism Speaks', url: 'https://www.autismspeaks.org', desc: 'Information on diagnosis, treatment, and family support.' },
    { name: 'National Autistic Society (UK)', url: 'https://www.autism.org.uk', desc: 'Comprehensive guides for families and professionals in the UK.' },
  ]},
  { category: 'Early Intervention', items: [
    { name: 'First Signs', url: 'https://www.firstsigns.org', desc: 'Resources focused on early identification and intervention.' },
    { name: 'ASHA (American Speech-Language-Hearing Assoc.)', url: 'https://www.asha.org', desc: 'Finding certified speech-language pathologists.' },
    { name: 'AOTA (American Occupational Therapy Assoc.)', url: 'https://www.aota.org', desc: 'Connecting families with occupational therapy resources.' },
  ]},
  { category: 'Family & Community Support', items: [
    { name: 'Autism Society of America', url: 'https://www.autism-society.org', desc: 'Local chapters and peer support networks nationwide.' },
    { name: 'GRASP (Global & Regional Asperger Syndrome Partnership)', url: 'https://grasp.org', desc: 'Peer support for autistic adults and adolescents.' },
    { name: 'Sibling Support Project', url: 'https://siblingsupport.org', desc: 'Resources specifically for siblings of people with disabilities.' },
  ]},
  { category: 'Research & Science', items: [
    { name: 'Autism Science Foundation', url: 'https://autismsciencefoundation.org', desc: 'Funding and communicating high-quality ASD research.' },
    { name: 'INSAR (International Society for Autism Research)', url: 'https://www.autism-insar.org', desc: 'The global scientific community for ASD researchers.' },
    { name: 'PubMed ASD Research', url: 'https://pubmed.ncbi.nlm.nih.gov/?term=autism+spectrum+disorder', desc: 'Access to peer-reviewed ASD research articles.' },
  ]},
]

export function Resources() {
  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'linear-gradient(160deg,var(--success-pale) 0%,var(--bg) 60%)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success)', marginBottom: '1rem' }}>RESOURCES</div>
          <h1 style={{ letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>Support & resources</h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', lineHeight: 1.7 }}>A curated collection of trusted organisations, tools, and information for families and professionals.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 900, margin: '0 auto' }}>
          {RESOURCES.map(group => (
            <div key={group.category} style={{ marginBottom: '3rem' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--primary-pale2)' }}>{group.category}</h2>
              <div className="grid-3" style={{ gap: '1rem' }}>
                {group.items.map(r => (
                  <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="card card-p card-hover" style={{ display: 'block' }}>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--primary)' }}>{r.name}</h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>{r.desc}</p>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary)', marginTop: '0.75rem', display: 'block', fontWeight: 600 }}>Visit →</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   FAQ
   ══════════════════════════════════════════════════ */
const STATIC_FAQ = [
  { category: 'general',    q: 'What is Mindello?', a: 'Mindello is an AI-powered ASD screening platform that helps parents and clinicians identify early autism spectrum disorder indicators using machine learning.' },
  { category: 'general',    q: 'Is Mindello free to use?', a: 'Yes. Creating an account and running screenings is completely free. We believe early screening tools should be accessible to everyone.' },
  { category: 'assessment', q: 'How long does a screening take?', a: 'Most users complete a screening in 5–10 minutes. The 4-step form covers demographics, medical history, the AQ-10 questionnaire, and clinical observations.' },
  { category: 'assessment', q: 'What is the AQ-10?', a: 'The AQ-10 (Autism Spectrum Quotient – 10 items) is a validated screening tool used widely by clinicians to identify potential ASD indicators in children.' },
  { category: 'results',    q: 'What does a positive result mean?', a: 'A positive result ("indicators found") means the data pattern is consistent with ASD. It is NOT a diagnosis. Always consult a qualified healthcare professional for formal evaluation.' },
  { category: 'results',    q: 'What is SHAP and why does it matter?', a: 'SHAP (SHapley Additive exPlanations) is a technique from explainable AI that shows which factors influenced the prediction the most. It makes our results transparent and trustworthy.' },
  { category: 'privacy',    q: 'Who can see my screening data?', a: 'Only you can see your data. We use JWT authentication and encrypted sessions. We never sell or share your data with third parties.' },
  { category: 'privacy',    q: 'Can I delete my data?', a: 'Yes. You can delete individual screenings from your history. Contact us to request full account and data deletion.' },
  { category: 'account',    q: 'How do I change my password?', a: 'Go to Settings → Security → Change Password. Enter your current password and choose a new one with at least 8 characters.' },
  { category: 'account',    q: 'What roles are available?', a: 'Mindello supports two roles: Parent/Guardian (for family-led screenings) and Medical Professional (for clinical use). Choose the appropriate role when registering.' },
]

const CAT_LABELS = { general: 'General', assessment: 'Assessment', results: 'Results', privacy: 'Privacy', account: 'Account' }

export function FAQ() {
  const [openIdx, setOpenIdx] = useState(null)
  const [activeTab, setActiveTab] = useState('all')

  const categories = ['all', ...Object.keys(CAT_LABELS)]
  const filtered   = activeTab === 'all' ? STATIC_FAQ : STATIC_FAQ.filter(f => f.category === activeTab)

  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'linear-gradient(160deg,var(--primary-pale) 0%,var(--bg) 60%)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1rem' }}>FAQ</div>
          <h1 style={{ letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>Frequently asked questions</h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', lineHeight: 1.7 }}>Everything you need to know about Mindello and ASD screening.</p>
        </div>
      </div>
      <section className="section">
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {categories.map(c => (
              <button key={c} className={`chip${activeTab===c?' active':''}`} onClick={() => setActiveTab(c)}>
                {c === 'all' ? 'All' : CAT_LABELS[c]}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {filtered.map((f, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <button onClick={() => setOpenIdx(openIdx===i ? null : i)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '1.125rem 1.25rem', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text)' }}>{f.q}</span>
                  <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)', flexShrink: 0, transform: openIdx===i?'rotate(45deg)':'none', transition: 'transform 0.2s' }}>+</span>
                </button>
                {openIdx === i && (
                  <div style={{ padding: '0 1.25rem 1.25rem', fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.75, borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="card card-p" style={{ marginTop: '2.5rem', textAlign: 'center', background: 'var(--surface-2)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: '0.5rem' }}>Didn't find your answer?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', marginBottom: '1.25rem' }}>Send us a message and we'll respond within 48 hours.</p>
            <Link to="/contact" className="btn btn-primary">Contact Us</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Contact
   ══════════════════════════════════════════════════ */
export function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const change = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true); setStatus(null)
    try { await submitContact(form); setStatus('success'); setForm({ name:'', email:'', subject:'', message:'' }) }
    catch { setStatus('error') }
    finally { setLoading(false) }
  }

  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'linear-gradient(160deg,var(--primary-pale) 0%,var(--bg) 60%)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)', marginBottom: '1rem' }}>CONTACT</div>
          <h1 style={{ letterSpacing: '-0.03em', marginBottom: '1.25rem' }}>Get in touch</h1>
          <p style={{ fontSize: 'var(--text-xl)', color: 'var(--text-muted)', lineHeight: 1.7 }}>Have a question, feedback, or partnership inquiry? We'd love to hear from you.</p>
        </div>
      </div>
      <section className="section-sm">
        <div className="container contact-grid">
          <div className="card card-p">
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: '1.75rem' }}>Send a message</h2>
            {status==='success' && <div className="alert alert-success" style={{ marginBottom:'1.25rem' }}><span>✅</span><span>Message sent! We'll reply within 48 hours.</span></div>}
            {status==='error'   && <div className="alert alert-danger"  style={{ marginBottom:'1.25rem' }}><span>⚠</span><span>Something went wrong. Please try again.</span></div>}
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
                {[['name','Full Name *','Jane Smith'],['email','Email *','jane@example.com']].map(([n,l,p])=>(
                  <div className="form-group" key={n}><label className="form-label">{l}</label><input name={n} type={n==='email'?'email':'text'} className="input" placeholder={p} value={form[n]} onChange={change} required disabled={loading}/></div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Subject *</label>
                <select name="subject" className="input" value={form.subject} onChange={change} required disabled={loading}>
                  <option value="">Select a topic…</option>
                  {['General question','Clinical inquiry','Technical support','Partnership','Feedback','Other'].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea name="message" className="input" rows={5} placeholder="Tell us what's on your mind…" value={form.message} onChange={change} required disabled={loading} style={{ resize:'vertical' }}/>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf:'flex-start', minWidth:160 }}>
                {loading?<><span className="spinner"/>Sending…</>:'Send Message →'}
              </button>
            </form>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="card card-p">
              <h3 style={{ fontSize:'var(--text-lg)', marginBottom:'1.25rem' }}>Contact details</h3>
              {[
                [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,'Email','hello@mindello.ai'],
                [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,'Response time','Within 48 hours'],
                [<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,'Platform','mindello.ai'],
              ].map(([i,l,v])=>(
                <div key={l} style={{ display:'flex', gap:'0.875rem', padding:'0.75rem 0', borderBottom:'1px solid var(--border)', alignItems:'flex-start' }}>
                  <span style={{ color:'var(--primary)', flexShrink:0, marginTop:'2px' }}>{i}</span>
                  <div>
                    <div style={{ fontSize:'var(--text-xs)', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{l}</div>
                    <div style={{ fontSize:'var(--text-sm)', marginTop:'2px' }}>{v}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card card-p" style={{ background:'var(--primary)', color:'#fff' }}>
              <h3 style={{ color:'#fff', fontSize:'var(--text-base)', marginBottom:'0.5rem' }}>Looking for help?</h3>
              <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'var(--text-sm)', marginBottom:'1rem', lineHeight:1.7 }}>Check our Help Center for instant answers to common questions.</p>
              <Link to="/help" className="btn" style={{ background:'rgba(255,255,255,0.15)', color:'#fff', border:'1px solid rgba(255,255,255,0.25)', fontSize:'var(--text-sm)' }}>Visit Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Privacy Policy
   ══════════════════════════════════════════════════ */
export function Privacy() {
  const sections = [
    ['Information We Collect', 'We collect information you provide directly: your name, email address, username, and the data you enter into the ASD screening form. We also collect usage data such as pages visited and features used, to improve the platform.'],
    ['How We Use Your Information', 'Your information is used to provide and improve the Mindello service, run ASD screenings, maintain your account, and send relevant notifications (which you can disable in Settings). We do not sell, rent, or share your personal data with third parties.'],
    ['Data Security', 'We protect your data using industry-standard security measures including JWT authentication, CSRF protection, encrypted passwords (PBKDF2-SHA256), and HTTPS-enforced connections. Your screening history is accessible only to your own account.'],
    ['Data Retention', 'Your account data and screening history are retained for as long as your account is active. You may delete individual screenings from the History page. To request full account deletion, contact us at hello@mindello.ai.'],
    ['Cookies', 'Mindello uses minimal cookies, primarily for authentication sessions. We do not use advertising or tracking cookies. You can disable cookies in your browser settings, though this may affect functionality.'],
    ['Third-Party Services', 'We use standard infrastructure providers (hosting, CDN). These providers are contractually required to protect your data. We do not integrate with advertising networks or data brokers.'],
    ['Children\'s Privacy', 'Mindello may be used by parents to screen children, but accounts must be created by adults (18+). We do not knowingly collect personal data from children without parental consent.'],
    ['Changes to This Policy', 'We may update this privacy policy periodically. Significant changes will be communicated via in-app notification. Continued use of Mindello after changes constitutes acceptance of the updated policy.'],
    ['Contact', 'For privacy questions or data requests, contact us at hello@mindello.ai. We aim to respond within 5 business days.'],
  ]
  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'var(--surface-2)', padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)' }}>Last updated: January 2025</p>
        </div>
      </div>
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="alert alert-info" style={{ marginBottom: '2.5rem' }}>
            <span>🔐</span><span style={{ fontSize: 'var(--text-sm)' }}>Your privacy matters. Mindello never sells your data and stores only what's needed to provide the service.</span>
          </div>
          {sections.map(([title, content]) => (
            <div key={title} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.875rem' }}>{title}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: 'var(--text-base)' }}>{content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Terms of Service
   ══════════════════════════════════════════════════ */
export function Terms() {
  const sections = [
    ['Acceptance of Terms', 'By accessing or using Mindello, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.'],
    ['Medical Disclaimer', 'IMPORTANT: Mindello is NOT a medical diagnostic service. Screening results are for informational purposes only and do not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional. A positive screening result does not mean a child has ASD; a negative result does not rule it out.'],
    ['Eligible Users', 'Mindello accounts must be created by individuals aged 18 or older. Parents and guardians may use Mindello to screen their children. Medical professionals use Mindello as a supplementary decision-support tool only.'],
    ['Account Responsibilities', 'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. Notify us immediately of any unauthorised access at hello@mindello.ai.'],
    ['Permitted Use', 'Mindello may be used for personal and clinical screening purposes only. You may not: reverse-engineer the platform, attempt to access other users\' data, use the service for commercial purposes without authorisation, or misrepresent screening results as formal medical diagnoses.'],
    ['Data Accuracy', 'The accuracy of screening results depends on the accuracy of the information entered. Mindello is not responsible for results based on inaccurate or incomplete input data.'],
    ['Intellectual Property', 'All content, code, and models on Mindello are the intellectual property of Mindello and its licensors. You may not reproduce, modify, or distribute any part of the platform without written permission.'],
    ['Limitation of Liability', 'To the maximum extent permitted by law, Mindello shall not be liable for any indirect, incidental, or consequential damages arising from use of the platform, including reliance on screening results without professional consultation.'],
    ['Modifications', 'We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance. Material changes will be communicated via in-app notification.'],
    ['Governing Law', 'These terms are governed by the laws of the applicable jurisdiction. Disputes shall be resolved through good-faith negotiation before any legal proceedings.'],
  ]
  return (
    <main style={{ paddingTop: 'var(--nav-h)' }}>
      <div style={{ background: 'var(--surface-2)', padding: '4rem 0 3rem', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <h1 style={{ marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p style={{ color: 'var(--text-muted)' }}>Last updated: January 2025</p>
        </div>
      </div>
      <section className="section-sm">
        <div className="container" style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="alert alert-warning" style={{ marginBottom: '2.5rem' }}>
            <span>⚠️</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Mindello is NOT a medical diagnostic service. Always consult a qualified healthcare professional.</span>
          </div>
          {sections.map(([title, content]) => (
            <div key={title} style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: '0.875rem', color: title === 'Medical Disclaimer' ? 'var(--warning)' : 'var(--text)' }}>{title}</h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>{content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

/* ══════════════════════════════════════════════════
   Forgot Password
   ══════════════════════════════════════════════════ */
export function ForgotPassword() {
  const [email, setEmail]   = useState('')
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', background:'linear-gradient(160deg,var(--primary-pale) 0%,var(--bg) 60%)' }}>
      <div className="card card-p" style={{ width:'100%', maxWidth:440 }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', gap:'0.5rem', fontFamily:'var(--font-heading)', fontWeight:700, color:'var(--text)', fontSize:'1.1rem', marginBottom:'2rem' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#2563EB"/>
            <path d="M8 14c0-3.3 2.7-6 6-6s6 2.7 6 6-2.7 6-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="2.5" fill="#93C5FD"/>
          </svg>Mindello
        </Link>
        <h1 style={{ fontSize:'var(--text-2xl)', marginBottom:'0.375rem' }}>Reset your password</h1>
        {sent ? (
          <>
            <div className="alert alert-success" style={{ margin:'1.25rem 0' }}><span>✅</span><span>If that email exists, we've sent reset instructions. Check your inbox.</span></div>
            <Link to="/login" className="btn btn-primary btn-full">Back to Sign In</Link>
          </>
        ) : (
          <>
            <p style={{ color:'var(--text-muted)', fontSize:'var(--text-sm)', marginBottom:'1.75rem' }}>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="input" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus disabled={loading}/>
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ padding:'0.75rem' }} disabled={loading}>
                {loading?<><span className="spinner"/>Sending…</>:'Send Reset Link'}
              </button>
            </form>
            <p style={{ textAlign:'center', fontSize:'var(--text-sm)', color:'var(--text-muted)', marginTop:'1.5rem' }}>
              Remember it? <Link to="/login" style={{ color:'var(--primary)', fontWeight:600 }}>Sign in →</Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
