'use client'

import { Activity, BedDouble, Cctv, KeyRound, Lock, Receipt, Scissors, Siren, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HOSPITAL } from '../core/master'
import { DEMO_PASSWORD, ROLE_LABEL } from '../core/rbac'
import { useRows } from '../core/store'
import type { Role, User } from '../core/types'
import { session, users } from '../services/identity'
import { Avatar, Field } from '../ui/kit'
import { Logo } from '../ui/Logo'

const ORDER: Role[] = ['superadmin', 'admin', 'doctor', 'nurse', 'reception', 'emergency', 'ot', 'billing', 'lab', 'radiology', 'pharmacy', 'security']

export function Login() {
  const all = useRows(users)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showAllDoctors, setShowAllDoctors] = useState(false)
  const demo = useMemo(() => {
    const list = all.filter((u) => u.active).sort((a, b) => ORDER.indexOf(a.role) - ORDER.indexOf(b.role))
    const doctors = list.filter((u) => u.role === 'doctor')
    return { staff: list.filter((u) => u.role !== 'doctor'), doctors }
  }, [all])

  const signIn = (u = username, p = password) => {
    const r = session.login(u, p)
    if (typeof r === 'string') setError(r)
  }
  const quick = (u: User) => { setUsername(u.username); setPassword(DEMO_PASSWORD); signIn(u.username, DEMO_PASSWORD) }

  return (
    <div className="smi-login">
      <section className="brand-side">
        <div className="row"><Logo size={52} /><div><b style={{ fontSize: 20, display: 'block' }}>{HOSPITAL.name}</b><span style={{ color: '#e3c77d', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase' }}>{HOSPITAL.tagline}</span></div></div>
        <div>
          <h2>One paperless system for <em>every department</em> of the hospital.</h2>
          <p style={{ color: '#b7c5dc', maxWidth: 520, marginTop: 14 }}>Registration to discharge, emergency to operation theatre, pharmacy to insurance claims. Every role sees only what it needs.</p>
          <div className="features">
            <div><Siren size={18} color="#fca5a5" />One-tap emergency triage</div>
            <div><Scissors size={18} color="#fcd34d" />4 OTs with live status</div>
            <div><BedDouble size={18} color="#93c5fd" />{HOSPITAL.beds} beds, live bed board</div>
            <div><Receipt size={18} color="#86efac" />Billing & TPA in one place</div>
            <div><Activity size={18} color="#5eead4" />Nurse notes linked everywhere</div>
            <div><Cctv size={18} color="#c4b5fd" />Security desk with CCTV</div>
          </div>
        </div>
        <div className="small" style={{ color: '#7f93b5' }}>{HOSPITAL.address} · {HOSPITAL.nabh} · Emergency {HOSPITAL.emergency}</div>
      </section>

      <section className="form-side">
        <div className="form-wrap">
          <h2 style={{ fontSize: 26 }}>Sign in</h2>
          <p className="muted" style={{ marginTop: 6 }}>Use your staff account, or tap a demo login below.</p>
          <form className="col" style={{ gap: 12, marginTop: 20 }} onSubmit={(e) => { e.preventDefault(); signIn() }}>
            <Field label="Username"><div className="row" style={{ position: 'relative' }}><UserRound size={16} style={{ position: 'absolute', left: 12, color: 'var(--faint)' }} /><input className="input" style={{ paddingLeft: 36 }} value={username} onChange={(e) => { setUsername(e.target.value); setError('') }} autoComplete="username" placeholder="e.g. doctor1" /></div></Field>
            <Field label="Password"><div className="row" style={{ position: 'relative' }}><Lock size={16} style={{ position: 'absolute', left: 12, color: 'var(--faint)' }} /><input className="input" style={{ paddingLeft: 36 }} type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} autoComplete="current-password" /></div></Field>
            {error && <div className="notice tone-red">{error}</div>}
            <button className="sm-btn primary lg" type="submit"><KeyRound size={18} />Sign in</button>
          </form>

          <div className="sm-divider" style={{ margin: '24px 0 16px' }} />
          <div className="row between" style={{ marginBottom: 10 }}><b>Demo logins</b><span className="small muted">Password for all: <span className="mono strong">{DEMO_PASSWORD}</span></span></div>
          <div className="demo-grid">
            {demo.staff.map((u) => (
              <button key={u.id} className="demo" onClick={() => quick(u)}>
                <Avatar name={u.name} size="sm" gold={u.role === 'superadmin'} />
                <div style={{ minWidth: 0 }}><b className="ellipsis">{u.username}</b><span className="ellipsis">{ROLE_LABEL[u.role]} · {u.name}</span></div>
              </button>
            ))}
          </div>
          <div className="row between" style={{ margin: '16px 0 10px' }}><b>Doctors ({demo.doctors.length}, each with their own login)</b><button className="sm-btn ghost sm" onClick={() => setShowAllDoctors(!showAllDoctors)}>{showAllDoctors ? 'Show fewer' : 'Show all'}</button></div>
          <div className="demo-grid">
            {(showAllDoctors ? demo.doctors : demo.doctors.slice(0, 6)).map((u) => (
              <button key={u.id} className="demo" onClick={() => quick(u)}>
                <Avatar name={u.name} size="sm" />
                <div style={{ minWidth: 0 }}><b className="ellipsis">{u.username}</b><span className="ellipsis">{u.name} · {u.dept}</span></div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
