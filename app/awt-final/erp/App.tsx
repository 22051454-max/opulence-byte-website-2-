'use client'

import {
  Bell, BedDouble, Cctv, FileText, FlaskConical, LayoutDashboard, LogOut, Menu, Moon, Pill, Receipt, ScanLine, Scissors,
  Search, Settings, ShieldAlert, Siren, Stethoscope, Sun, UserPlus, Users, HeartPulse, Contact,
} from 'lucide-react'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HOSPITAL } from './core/master'
import { canOpen, ROLE_LABEL, type ModuleId } from './core/rbac'
import { needsSeed, rollSeedForward, seedAll } from './core/seed'
import { readKey, startCrossTabSync, useRows, writeKey } from './core/store'
import type { User } from './core/types'
import { ago, cx } from './core/util'
import './services/billing'
import { complaints } from './services/security'
import { diagOrders } from './services/diagnostics'
import { erCases } from './services/emergency'
import { notices, session, useSession } from './services/identity'
import { visits } from './services/opd'
import { rxOrders } from './services/pharmacy'
import { patients, searchPatients } from './services/patients'
import { AppCtx, type AppApi } from './ui/context'
import { Avatar, Badge, Layer, ToastProvider, useNow } from './ui/kit'
import { Logo } from './ui/Logo'
import { PatientDrawer, ReportIssueModal } from './ui/patient'
import { Intro } from './modules/Intro'
import { Login } from './modules/Login'
import './erp.css'

const Dashboard = lazy(() => import('./modules/Dashboard'))
const Reception = lazy(() => import('./modules/Reception'))
const Opd = lazy(() => import('./modules/Opd'))
const Emergency = lazy(() => import('./modules/Emergency'))
const Ipd = lazy(() => import('./modules/Ipd'))
const Ot = lazy(() => import('./modules/Ot'))
const Nursing = lazy(() => import('./modules/Nursing'))
const Diagnostics = lazy(() => import('./modules/Diagnostics'))
const Pharmacy = lazy(() => import('./modules/Pharmacy'))
const Billing = lazy(() => import('./modules/Billing'))
const Patients = lazy(() => import('./modules/Patients'))
const Doctors = lazy(() => import('./modules/Doctors'))
const Summaries = lazy(() => import('./modules/Summaries'))
const Security = lazy(() => import('./modules/Security'))
const Admin = lazy(() => import('./modules/Admin'))

type NavItem = { id: ModuleId; label: string; icon: ReactNode; group: string; doctorLabel?: string }
const NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, group: 'Overview' },
  { id: 'summaries', label: 'Summaries & Reports', icon: <FileText size={18} />, group: 'Overview' },
  { id: 'reception', label: 'Reception', icon: <UserPlus size={18} />, group: 'Front office' },
  { id: 'patients', label: 'Patients', icon: <Users size={18} />, group: 'Front office' },
  { id: 'doctors', label: 'Doctors', icon: <Contact size={18} />, group: 'Front office' },
  { id: 'emergency', label: 'Emergency', icon: <Siren size={18} />, group: 'Clinical' },
  { id: 'opd', label: 'OPD Consultations', doctorLabel: 'My OPD', icon: <Stethoscope size={18} />, group: 'Clinical' },
  { id: 'ipd', label: 'Wards & Beds', icon: <BedDouble size={18} />, group: 'Clinical' },
  { id: 'ot', label: 'Operation Theatres', icon: <Scissors size={18} />, group: 'Clinical' },
  { id: 'nursing', label: 'Nursing Station', icon: <HeartPulse size={18} />, group: 'Clinical' },
  { id: 'lab', label: 'Laboratory', icon: <FlaskConical size={18} />, group: 'Diagnostics' },
  { id: 'radiology', label: 'Radiology', icon: <ScanLine size={18} />, group: 'Diagnostics' },
  { id: 'pharmacy', label: 'Pharmacy', icon: <Pill size={18} />, group: 'Pharmacy & finance' },
  { id: 'billing', label: 'Billing & TPA', icon: <Receipt size={18} />, group: 'Pharmacy & finance' },
  { id: 'security', label: 'Security & CCTV', icon: <Cctv size={18} />, group: 'Control room' },
  { id: 'admin', label: 'Administration', icon: <Settings size={18} />, group: 'Control room' },
]

export default function App() {
  const [phase, setPhase] = useState<'intro' | 'ready'>('intro')
  const [booted, setBooted] = useState(false)
  const user = useSession()
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Boot in the background while the intro plays.
    const t0 = performance.now()
    if (needsSeed()) seedAll()
    else rollSeedForward()
    session.restore()
    setMode(readKey<'light' | 'dark'>('mode', 'light'))
    setBooted(true)
    const stop = startCrossTabSync()
    console.info(`[SMI] services ready in ${Math.round(performance.now() - t0)} ms`)
    return stop
  }, [])

  useEffect(() => {
    const prev = document.title
    document.title = `${HOSPITAL.name} · ERP`
    return () => { document.title = prev }
  }, [])

  const toggleMode = () => { const m = mode === 'light' ? 'dark' : 'light'; setMode(m); writeKey('mode', m) }

  return (
    <div className="smi" data-mode={mode}>
      <ToastProvider>
        {booted && phase === 'ready' && (user ? <Shell key={user.id} user={user} mode={mode} toggleMode={toggleMode} /> : <Login />)}
        {phase === 'intro' && <Intro onDone={() => setPhase('ready')} />}
      </ToastProvider>
    </div>
  )
}

function Shell({ user, mode, toggleMode }: { user: User; mode: 'light' | 'dark'; toggleMode: () => void }) {
  const allowed = useMemo(() => NAV.filter((n) => canOpen(user.role, n.id)), [user.role])
  const readHash = useCallback((): ModuleId => {
    const h = (typeof window !== 'undefined' ? window.location.hash.replace('#/', '').replace('#', '') : '') as ModuleId
    return allowed.some((n) => n.id === h) ? h : 'dashboard'
  }, [allowed])
  const [module, setModule] = useState<ModuleId>(readHash)
  const [patientId, setPatientId] = useState<string | null>(null)
  const [palette, setPalette] = useState(false)
  const [issue, setIssue] = useState(false)
  const [bell, setBell] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)

  useEffect(() => {
    const onHash = () => setModule(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [readHash])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const go = useCallback((m: ModuleId) => {
    if (!canOpen(user.role, m)) return
    setMobile(false)
    if (window.location.hash !== `#/${m}`) history.replaceState(null, '', `#/${m}`)
    setModule(m)
  }, [user.role])

  const api: AppApi = useMemo(() => ({ user, go, openPatient: setPatientId, reportIssue: () => setIssue(true) }), [user, go])

  const counts = useNavCounts(user)
  const allNotices = useRows(notices)
  const myNotices = useMemo(() => allNotices.filter((n) => n.roles === 'all' || n.roles.includes(user.role)).slice(0, 30), [allNotices, user.role])
  const [seen, setSeen] = useState(() => readKey<string>(`seen:${user.id}`, ''))
  const unread = myNotices.filter((n) => n.at > seen).length

  let lastGroup = ''
  return (
    <AppCtx.Provider value={api}>
      <div className={cx('smi-app', collapsed && 'collapsed', mobile && 'mobile-open')}>
        <aside className="smi-side">
          <div className="brand">
            <Logo size={38} />
            <div><b>SM Imperial</b><span>Hospital ERP</span></div>
          </div>
          <nav>
            {allowed.map((n) => {
              const head = n.group !== lastGroup ? (lastGroup = n.group) : null
              const c = counts[n.id]
              return (
                <div key={n.id}>
                  {head && <div className="group">{head}</div>}
                  <button className={cx('sm-nav', module === n.id && 'active')} onClick={() => go(n.id)} title={n.label}>
                    {n.icon}<span className="label">{user.role === 'doctor' && n.doctorLabel ? n.doctorLabel : n.label}</span>
                    {c ? <span className={cx('count', c.red && 'red')}>{c.n}</span> : null}
                  </button>
                </div>
              )
            })}
          </nav>
          <div className="me">
            <Avatar name={user.name} gold={user.role === 'superadmin'} />
            <div className="grow" style={{ minWidth: 0 }}><b className="ellipsis">{user.name}</b><span className="ellipsis">{ROLE_LABEL[user.role]}{user.role === 'doctor' ? ` · ${user.dept}` : ''}</span></div>
            <button className="sm-btn ghost sm icon" style={{ color: '#c2cee3' }} title="Sign out" onClick={() => session.logout()}><LogOut size={16} /></button>
          </div>
        </aside>

        <main className="smi-main">
          <header className="smi-top">
            <button className="sm-btn ghost icon" onClick={() => (window.innerWidth < 900 ? setMobile(!mobile) : setCollapsed(!collapsed))} aria-label="Toggle menu"><Menu size={18} /></button>
            <button className="sm-search" onClick={() => setPalette(true)}><Search size={16} /><span className="grow" style={{ textAlign: 'left' }}>Search patients, UHID, phone…</span><span className="kbd hide-sm">Ctrl K</span></button>
            <span className="live hide-sm"><i />Live</span>
            <Clock />
            <div className="right row" style={{ gap: 6 }}>
              <button className="sm-btn ghost sm" onClick={() => setIssue(true)} title="Report an issue to Security"><ShieldAlert size={16} /><span className="hide-sm">Report issue</span></button>
              <button className="sm-btn ghost icon" onClick={toggleMode} aria-label="Toggle dark mode">{mode === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
              <div style={{ position: 'relative' }}>
                <button className="sm-btn ghost icon" onClick={() => { setBell(!bell); if (!bell) { const s = new Date().toISOString(); setSeen(s); writeKey(`seen:${user.id}`, s) } }} aria-label="Notifications">
                  <Bell size={18} />
                  {unread > 0 && <span style={{ position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16, borderRadius: 9, background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'grid', placeItems: 'center', padding: '0 4px' }}>{unread}</span>}
                </button>
                {bell && (
                  <div className="sm-card" style={{ position: 'absolute', right: 0, top: 46, width: 360, maxHeight: 440, overflowY: 'auto', boxShadow: 'var(--shadow-lg)', animation: 'smi-pop .2s var(--ease) both', zIndex: 20 }}>
                    <div className="card-head"><h3>Notifications</h3></div>
                    {myNotices.length === 0 ? <div className="sm-empty">All quiet.</div> : myNotices.map((n) => (
                      <div key={n.id} className={cx('list-item', n.module && 'click')} onClick={() => { if (n.module) go(n.module as ModuleId); setBell(false) }}>
                        <Badge tone={n.level === 'danger' ? 'red' : n.level === 'warning' ? 'amber' : n.level === 'success' ? 'green' : 'blue'} dot>{n.level}</Badge>
                        <div className="grow small">{n.text}<div className="tiny muted">{ago(n.at)}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="smi-content" onClick={() => bell && setBell(false)}>
            <Suspense fallback={<div className="row muted" style={{ padding: 20 }}><span className="spinner" />Loading…</div>}>
              <div key={module} className="view">
                {module === 'dashboard' && <Dashboard />}
                {module === 'reception' && <Reception />}
                {module === 'opd' && <Opd />}
                {module === 'emergency' && <Emergency />}
                {module === 'ipd' && <Ipd />}
                {module === 'ot' && <Ot />}
                {module === 'nursing' && <Nursing />}
                {module === 'lab' && <Diagnostics kind="Lab" />}
                {module === 'radiology' && <Diagnostics kind="Radiology" />}
                {module === 'pharmacy' && <Pharmacy />}
                {module === 'billing' && <Billing />}
                {module === 'patients' && <Patients />}
                {module === 'doctors' && <Doctors />}
                {module === 'summaries' && <Summaries />}
                {module === 'security' && <Security />}
                {module === 'admin' && <Admin />}
              </div>
            </Suspense>
          </div>
        </main>

        {patientId && <PatientDrawer patientId={patientId} onClose={() => setPatientId(null)} />}
        {palette && <Palette onClose={() => setPalette(false)} onPick={(id) => { setPalette(false); setPatientId(id) }} go={(m) => { setPalette(false); go(m) }} allowed={allowed} />}
        {issue && <ReportIssueModal onClose={() => setIssue(false)} />}
      </div>
    </AppCtx.Provider>
  )
}

function Clock() {
  const now = useNow()
  const d = new Date(now)
  return <span className="clock hide-sm">{d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })} · {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
}

function useNavCounts(user: User) {
  const er = useRows(erCases)
  const v = useRows(visits)
  const d = useRows(diagOrders)
  const rx = useRows(rxOrders)
  const c = useRows(complaints)
  return useMemo(() => {
    const out: Partial<Record<ModuleId, { n: number; red?: boolean }>> = {}
    const open = er.filter((x) => x.status !== 'closed')
    if (open.length) out.emergency = { n: open.length, red: open.some((x) => x.triage === 'red') }
    const waiting = v.filter((x) => x.status === 'waiting' && (user.role !== 'doctor' || x.doctorId === user.doctorId)).length
    if (waiting) out.opd = { n: waiting }
    const lab = d.filter((x) => x.kind === 'Lab' && x.status !== 'reported').length
    const rad = d.filter((x) => x.kind === 'Radiology' && x.status !== 'reported').length
    if (lab) out.lab = { n: lab }
    if (rad) out.radiology = { n: rad }
    const ph = rx.filter((x) => x.status === 'pending').length
    if (ph) out.pharmacy = { n: ph }
    const sec = c.filter((x) => x.status === 'Open' || x.status === 'Investigating').length
    if (sec) out.security = { n: sec, red: c.some((x) => x.status === 'Open' && (x.severity === 'Critical' || x.severity === 'High')) }
    return out
  }, [er, v, d, rx, c, user])
}

function Palette({ onClose, onPick, go, allowed }: { onClose: () => void; onPick: (id: string) => void; go: (m: ModuleId) => void; allowed: NavItem[] }) {
  const [q, setQ] = useState('')
  useRows(patients)
  const results = useMemo(() => (q.trim().length >= 2 ? searchPatients(q, 8) : []), [q])
  const mods = allowed.filter((n) => q && n.label.toLowerCase().includes(q.toLowerCase()))
  return (
    <Layer><div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal palette">
        <div className="row" style={{ padding: '4px 14px', borderBottom: '1px solid var(--border)' }}><Search size={18} className="muted" /><input className="input" autoFocus placeholder="Type a name, UHID, phone or a module…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div style={{ padding: 8, maxHeight: 420, overflowY: 'auto' }}>
          {mods.map((m) => <button key={m.id} className="result" onClick={() => go(m.id)}>{m.icon}<b>Open {m.label}</b></button>)}
          {results.map((p) => (
            <button key={p.id} className="result" onClick={() => onPick(p.id)}>
              <Avatar name={p.name} size="sm" /><div className="grow"><b>{p.name}</b><div className="tiny muted">{p.uhid} · {p.age}y {p.gender} · {p.phone}</div></div><Badge>{p.category}</Badge>
            </button>
          ))}
          {!q && <div className="small muted" style={{ padding: 12 }}>Search any of {patients.all().length.toLocaleString('en-IN')} patients. Press Esc to close.</div>}
          {q.length >= 2 && !results.length && !mods.length && <div className="small muted" style={{ padding: 12 }}>Nothing found.</div>}
        </div>
      </div>
    </div></Layer>
  )
}
