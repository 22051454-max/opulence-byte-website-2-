'use client'

import { Boxes, Check, History, KeyRound, Network, RotateCcw, ShieldCheck, UserCog, UserPlus, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DOCTORS } from '../core/master'
import { can, MODULE_ACCESS, ROLE_LABEL, type ModuleId } from '../core/rbac'
import { seedAll } from '../core/seed'
import { allCollections, storageUsedKb, useRows, writeKey } from '../core/store'
import type { Role } from '../core/types'
import { dateTime } from '../core/util'
import { addUser, audit, resetPassword, session, setUserActive, users } from '../services/identity'
import { useApp } from '../ui/context'
import { Avatar, Badge, Empty, Field, Modal, PageHead, Tabs, useToast } from '../ui/kit'

const ROLES = Object.keys(ROLE_LABEL) as Role[]
const MOD_LABEL: Record<ModuleId, string> = { dashboard: 'Dashboard', summaries: 'Summaries', reception: 'Reception', patients: 'Patients', doctors: 'Doctors', emergency: 'Emergency', opd: 'OPD', ipd: 'Wards & beds', ot: 'Operation theatres', nursing: 'Nursing', lab: 'Laboratory', radiology: 'Radiology', pharmacy: 'Pharmacy', billing: 'Billing & TPA', security: 'Security & CCTV', admin: 'Administration' }

export default function Admin() {
  const [tab, setTab] = useState<'users' | 'roles' | 'audit' | 'system'>('users')
  return (
    <div>
      <PageHead title="Administration" sub="Staff accounts, who can see what, the audit trail and system health." />
      <Tabs value={tab} tabs={[['users', 'Staff & logins'], ['roles', 'Role access'], ['audit', 'Audit trail'], ['system', 'System & services']]} onChange={setTab} />
      {tab === 'users' && <Users />}
      {tab === 'roles' && <Roles />}
      {tab === 'audit' && <Audit />}
      {tab === 'system' && <System />}
    </div>
  )
}

function Users() {
  const { user } = useApp()
  const all = useRows(users)
  const toast = useToast()
  const [role, setRole] = useState<'all' | Role>('all')
  const [adding, setAdding] = useState(false)
  const list = all.filter((u) => role === 'all' || u.role === role)
  const protectedUser = (r: Role) => r === 'superadmin' || (r === 'admin' && user.role !== 'superadmin')
  return (
    <>
      <div className="row wrap between" style={{ marginBottom: 12 }}>
        <select className="select" style={{ width: 240 }} value={role} onChange={(e) => setRole(e.target.value as Role)}><option value="all">All roles ({all.length})</option>{ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]} ({all.filter((u) => u.role === r).length})</option>)}</select>
        {can(user.role, 'users.manage') && <button className="sm-btn primary" onClick={() => setAdding(true)}><UserPlus size={16} />Add staff login</button>}
      </div>
      <div className="sm-card table-wrap">
        <table className="t">
          <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Department</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.id}>
                <td><div className="row"><Avatar name={u.name} size="sm" gold={u.role === 'superadmin'} /><div><b className="small">{u.name}</b><div className="tiny muted">{u.title}</div></div></div></td>
                <td className="mono small">{u.username}</td>
                <td><Badge tone={u.role === 'superadmin' ? 'gold' : u.role === 'admin' ? 'violet' : u.role === 'doctor' ? 'blue' : u.role === 'security' ? 'red' : 'teal'}>{ROLE_LABEL[u.role]}</Badge></td>
                <td className="small">{u.dept ?? '—'}</td>
                <td>{u.active ? <Badge tone="green" dot>Active</Badge> : <Badge dot>Disabled</Badge>}</td>
                <td className="nowrap">
                  {!protectedUser(u.role) && u.id !== user.id && (
                    <div className="row" style={{ gap: 4 }}>
                      <button className="sm-btn sm" onClick={() => { setUserActive(u.id, !u.active); toast(u.active ? `${u.name} disabled` : `${u.name} enabled`) }}>{u.active ? 'Disable' : 'Enable'}</button>
                      <button className="sm-btn sm ghost" title="Reset password to sm@123" onClick={() => { resetPassword(u.id, 'sm@123'); toast(`Password reset for ${u.username}`) }}><KeyRound size={14} /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {adding && <AddUser onClose={() => setAdding(false)} />}
    </>
  )
}

function AddUser({ onClose }: { onClose: () => void }) {
  const { user } = useApp()
  const toast = useToast()
  const roles = ROLES.filter((r) => r !== 'superadmin' && (user.role === 'superadmin' || r !== 'admin'))
  const [v, setV] = useState({ name: '', username: '', password: 'sm@123', role: 'nurse' as Role, title: '', dept: '', doctorId: '' })
  const [err, setErr] = useState('')
  return (
    <Modal title="Add staff login" icon={<UserCog size={18} />} onClose={onClose} width={620}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!v.name || !v.username} onClick={() => { const r = addUser({ ...v, title: v.title || ROLE_LABEL[v.role], dept: v.dept || undefined, doctorId: v.role === 'doctor' ? v.doctorId || undefined : undefined }); if (typeof r === 'string') return setErr(r); toast(`Login created for ${r.name}`); onClose() }}>Create login</button></>}>
      <div className="form-grid">
        <Field label="Full name" required><input className="input" autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="Username" required><input className="input" value={v.username} onChange={(e) => { setV({ ...v, username: e.target.value.replace(/\s/g, '').toLowerCase() }); setErr('') }} /></Field>
        <Field label="Role"><select className="select" value={v.role} onChange={(e) => setV({ ...v, role: e.target.value as Role })}>{roles.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}</select></Field>
        <Field label="Temporary password"><input className="input" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} /></Field>
        {v.role === 'doctor' && <Field label="Doctor profile" full><select className="select" value={v.doctorId} onChange={(e) => setV({ ...v, doctorId: e.target.value, dept: DOCTORS.find((d) => d.id === e.target.value)?.dept ?? '' })}><option value="">Choose</option>{DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>)}</select></Field>}
        <Field label="Job title"><input className="input" value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} /></Field>
        <Field label="Department"><input className="input" value={v.dept} onChange={(e) => setV({ ...v, dept: e.target.value })} /></Field>
        {err && <div className="full notice tone-red">{err}</div>}
      </div>
    </Modal>
  )
}

function Roles() {
  const mods = Object.keys(MODULE_ACCESS) as ModuleId[]
  return (
    <div className="sm-card table-wrap">
      <table className="t">
        <thead><tr><th>Module</th>{ROLES.map((r) => <th key={r} style={{ textAlign: 'center' }}>{ROLE_LABEL[r]}</th>)}</tr></thead>
        <tbody>
          {mods.map((m) => (
            <tr key={m}>
              <td><b className="small">{MOD_LABEL[m]}</b>{m === 'security' && <div className="tiny" style={{ color: 'var(--red)' }}>Super Admin and Security Head only</div>}</td>
              {ROLES.map((r) => <td key={r} style={{ textAlign: 'center' }}>{MODULE_ACCESS[m].includes(r) ? <Check size={16} color="var(--green)" /> : <X size={14} color="var(--faint)" />}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="card-body small muted">Doctors see only their own OPD queue. Reception sees demographics, not clinical notes. Every staff member can report an issue to Security, but only the Super Admin and the Security Head can read issues or watch CCTV.</div>
    </div>
  )
}

function Audit() {
  const log = useRows(audit)
  const [q, setQ] = useState('')
  const rows = useMemo(() => log.filter((a) => !q || `${a.user} ${a.action} ${a.detail}`.toLowerCase().includes(q.toLowerCase())).slice(0, 200), [log, q])
  return (
    <>
      <input className="input" style={{ maxWidth: 320, marginBottom: 12 }} placeholder="Filter the audit trail" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="sm-card table-wrap">
        <table className="t"><thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead>
          <tbody>{rows.map((a) => <tr key={a.id}><td className="small nowrap">{dateTime(a.at)}</td><td className="small"><b>{a.user}</b><div className="tiny muted">{ROLE_LABEL[a.role]}</div></td><td><Badge tone="blue">{a.action}</Badge></td><td className="small">{a.detail}</td></tr>)}</tbody>
        </table>
        {!rows.length && <Empty icon={<History size={28} />} text="Every action anyone takes is recorded here." />}
      </div>
    </>
  )
}

const SERVICES: [string, string, string[]][] = [
  ['Identity & access', 'Logins, sessions, roles, audit trail, notifications', ['users', 'audit', 'notices']],
  ['Patient index', 'UHID, ABHA, demographics, duplicate check', ['patients']],
  ['OPD', 'Tokens, queues, consultations, e-prescriptions', ['opd-visits']],
  ['Emergency', 'Triage, bays, disposition, hospital codes', ['er-cases']],
  ['IPD & beds', 'Bed board, admissions, transfers, discharge', ['beds', 'admissions']],
  ['Operation theatre', '4 OTs, scheduling, WHO checklist, live timers', ['ot-rooms', 'surgeries']],
  ['Nursing', 'Nurse notes linked to every episode', ['nurse-notes']],
  ['Diagnostics', 'Lab (LIS) and radiology (RIS) orders and reports', ['diag-orders']],
  ['Pharmacy', 'Dispensing, stock, expiry', ['pharmacy-stock', 'pharmacy-orders']],
  ['Billing & TPA', 'Episode bills, payments, insurance claims', ['bills']],
  ['Security', 'Complaints, disputes, incidents', ['complaints']],
]

function System() {
  const { user } = useApp()
  const toast = useToast()
  const [confirm, setConfirm] = useState<'all' | null>(null)
  const counts = new Map(allCollections().map((c) => [c.name, c.all().length]))
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="sm-card pad">
        <div className="row"><Network size={18} /><h3>Service architecture</h3></div>
        <p className="muted" style={{ margin: '8px 0 0' }}>Each module is its own service with its own data store. Services never write each other's data: they publish events (for example “charge” when a test is ordered) and the owning service reacts. In this demo every service runs and stores data in the browser; the storage adapter can point the same services at separate backend microservices without changing any screen.</p>
      </div>
      <div className="grid g3">
        {SERVICES.map(([name, what, cols]) => (
          <div key={name} className="sm-card pad col" style={{ gap: 6 }}>
            <div className="row"><Boxes size={16} className="muted" /><b>{name}</b><Badge tone="green" dot>Healthy</Badge></div>
            <div className="small muted">{what}</div>
            <div className="row wrap" style={{ gap: 6 }}>{cols.map((c) => <span key={c} className="pill mono" style={{ fontSize: 11 }}>{c}: {(counts.get(c) ?? 0).toLocaleString('en-IN')}</span>)}</div>
          </div>
        ))}
      </div>
      <div className="sm-card pad row wrap">
        <ShieldCheck size={18} />
        <div className="grow"><b>Data on this device</b><div className="small muted">{storageUsedKb().toLocaleString('en-IN')} KB stored in this browser. Everything entered is saved instantly and kept after refresh. Other open tabs update live.</div></div>
        {can(user.role, 'demo.reset') && <button className="sm-btn danger" onClick={() => setConfirm('all')}><RotateCcw size={16} />Reset demo data</button>}
      </div>
      {confirm && (
        <Modal title="Reset all demo data?" onClose={() => setConfirm(null)} width={480} footer={<><button className="sm-btn" onClick={() => setConfirm(null)}>Keep data</button><button className="sm-btn danger" onClick={() => { seedAll(); writeKey('session', user.id); session.restore(); toast('Fresh demo day generated', 'warning'); setConfirm(null) }}>Reset</button></>}>
          Everything entered on this browser is replaced with a fresh demo day. This cannot be undone.
        </Modal>
      )}
    </div>
  )
}
