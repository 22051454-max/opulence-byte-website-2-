'use client'

import { AlertTriangle, BedDouble, FileText, HeartPulse, NotebookPen, Plus, Printer, Receipt, Search, ShieldAlert, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { can } from '../core/rbac'
import { INSURERS } from '../core/master'
import { useRows } from '../core/store'
import type { NoteContext, NurseNote, Patient, Vitals } from '../core/types'
import { ago, billTotal, cx, date, dateTime, inr, time } from '../core/util'
import { bills, due } from '../services/billing'
import { diagOrders } from '../services/diagnostics'
import { doctorName } from '../services/doctors'
import { admissions, beds, ward } from '../services/ipd'
import { addNurseNote, nurseNotes } from '../services/nursing'
import { findDuplicates, patients, registerPatient, searchPatients, type NewPatient } from '../services/patients'
import { raiseComplaint } from '../services/security'
import { timelineFor } from '../services/timeline'
import { useApp } from './context'
import { Avatar, Badge, CodeMark, Drawer, Empty, Field, Modal, Seg, Tabs, VitalsForm, VitalsView, useToast, type Tone } from './kit'

export const catTone = (c: Patient['category']): Tone => (c === 'Self' ? 'gray' : c === 'PM-JAY' ? 'green' : c === 'CGHS' ? 'teal' : c === 'Corporate' ? 'violet' : 'blue')

export function PatientLine({ p, right }: { p?: Patient; right?: React.ReactNode }) {
  const { openPatient } = useApp()
  if (!p) return <span className="muted">Unknown patient</span>
  return (
    <div className="row" style={{ minWidth: 0 }}>
      <Avatar name={p.name} size="sm" />
      <div className="grow">
        <button className="strong ellipsis" style={{ display: 'block', maxWidth: '100%', textAlign: 'left' }} onClick={(e) => { e.stopPropagation(); openPatient(p.id) }}>{p.name}</button>
        <div className="tiny muted ellipsis">{p.uhid} · {p.age}y {p.gender[0]}{p.allergies ? ' · ⚠ ' + p.allergies : ''}</div>
      </div>
      {right}
    </div>
  )
}

/* ---------- Picker ---------- */
export function PatientPicker({ onPick, autoFocus }: { onPick: (p: Patient) => void; autoFocus?: boolean }) {
  const [q, setQ] = useState('')
  useRows(patients)
  const list = useMemo(() => (q.trim().length >= 2 ? searchPatients(q, 8) : []), [q])
  return (
    <div className="col" style={{ gap: 6 }}>
      <div className="row" style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--faint)' }} />
        <input className="input" style={{ paddingLeft: 36 }} autoFocus={autoFocus} placeholder="Search by name, UHID, phone or ABHA" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length > 0 && (
        <div className="sm-card" style={{ maxHeight: 260, overflowY: 'auto' }}>
          {list.map((p) => (
            <div key={p.id} className="list-item click" onClick={() => { onPick(p); setQ('') }}>
              <Avatar name={p.name} size="sm" />
              <div className="grow"><b>{p.name}</b><div className="tiny muted">{p.uhid} · {p.age}y {p.gender} · {p.phone || 'no phone'}</div></div>
              <Badge tone={catTone(p.category)}>{p.category}</Badge>
            </div>
          ))}
        </div>
      )}
      {q.trim().length >= 2 && list.length === 0 && <div className="small muted">No match. Register the patient first.</div>}
    </div>
  )
}

/* ---------- Registration form (reception + emergency) ---------- */
export const blankPatient = (): NewPatient => ({ name: '', age: 30, gender: 'Male', phone: '', address: 'Ranchi, Jharkhand', category: 'Self' })

export function PatientForm({ value, onChange, compact }: { value: NewPatient; onChange: (v: NewPatient) => void; compact?: boolean }) {
  const set = <K extends keyof NewPatient>(k: K, v: NewPatient[K]) => onChange({ ...value, [k]: v })
  const dups = useMemo(() => (value.name.length > 3 || value.phone.length >= 10 ? findDuplicates(value.name, value.phone) : []), [value.name, value.phone])
  return (
    <div className="form-grid">
      <Field label="Full name" required full><input className="input" autoFocus value={value.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Sunita Munda" /></Field>
      <Field label="Age" required><input className="input" type="number" min={0} max={120} value={value.age} onChange={(e) => set('age', Number(e.target.value))} /></Field>
      <Field label="Gender" required><Seg value={value.gender} options={['Male', 'Female', 'Other'] as const} onChange={(v) => set('gender', v)} /></Field>
      <Field label="Mobile number"><input className="input" inputMode="tel" maxLength={10} value={value.phone} onChange={(e) => set('phone', e.target.value.replace(/\D/g, ''))} placeholder="10 digits" /></Field>
      {!compact && <Field label="ABHA number (Ayushman Bharat Health Account)"><input className="input" value={value.abha ?? ''} onChange={(e) => set('abha', e.target.value)} placeholder="14 digits, optional" /></Field>}
      {!compact && <Field label="Aadhaar (last 4 digits only)"><input className="input" maxLength={4} value={value.aadhaar4 ?? ''} onChange={(e) => set('aadhaar4', e.target.value.replace(/\D/g, ''))} /></Field>}
      {!compact && <Field label="Blood group"><select className="select" value={value.bloodGroup ?? ''} onChange={(e) => set('bloodGroup', e.target.value || undefined)}><option value="">Not known</option>{['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => <option key={b}>{b}</option>)}</select></Field>}
      {!compact && <Field label="Address" full><input className="input" value={value.address} onChange={(e) => set('address', e.target.value)} /></Field>}
      <Field label="Known allergies"><input className="input" value={value.allergies ?? ''} onChange={(e) => set('allergies', e.target.value || undefined)} placeholder="e.g. Penicillin" /></Field>
      <Field label="Payment type" required>
        <select className="select" value={value.category} onChange={(e) => set('category', e.target.value as Patient['category'])}>
          {(['Self', 'TPA / Insurance', 'PM-JAY', 'CGHS', 'Corporate'] as const).map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      {value.category === 'TPA / Insurance' && <Field label="Insurance company"><select className="select" value={value.insurer ?? ''} onChange={(e) => set('insurer', e.target.value)}><option value="">Choose</option>{INSURERS.map((i) => <option key={i}>{i}</option>)}</select></Field>}
      {value.category !== 'Self' && <Field label="Policy / sm-card number"><input className="input" value={value.policyNo ?? ''} onChange={(e) => set('policyNo', e.target.value)} /></Field>}
      {dups.length > 0 && (
        <div className="full notice tone-amber"><AlertTriangle size={16} /><div><b>Possible existing record:</b> {dups.map((d) => `${d.name} (${d.uhid})`).join(', ')}. Search before creating a duplicate.</div></div>
      )}
    </div>
  )
}

export function RegisterModal({ onClose, onDone, title = 'Register new patient' }: { onClose: () => void; onDone: (p: Patient) => void; title?: string }) {
  const [v, setV] = useState<NewPatient>(blankPatient())
  const toast = useToast()
  const ok = v.name.trim().length > 1 && v.age >= 0
  return (
    <Modal title={title} icon={<UserPlus size={18} />} onClose={onClose} width={720}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!ok} onClick={() => { const p = registerPatient({ ...v, insurer: v.category === 'PM-JAY' ? 'Ayushman Bharat PM-JAY' : v.category === 'CGHS' ? 'CGHS' : v.insurer }); toast(`Registered ${p.name} · ${p.uhid}`); onDone(p) }}>Register patient</button></>}>
      <PatientForm value={v} onChange={setV} />
    </Modal>
  )
}

/* ---------- e-Card ---------- */
export function ECard({ p }: { p: Patient }) {
  return (
    <div className="ecard">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="tiny" style={{ letterSpacing: '.16em', textTransform: 'uppercase', color: '#e3c77d' }}>SM Imperial Hospital · Digital health card</div>
          <h3 style={{ fontSize: 20, marginTop: 8 }}>{p.name}</h3>
          <div className="small" style={{ opacity: .85, marginTop: 4 }}>{p.age} yrs · {p.gender} · Blood {p.bloodGroup ?? 'NA'}</div>
          <div className="mono" style={{ fontSize: 18, marginTop: 14, letterSpacing: '.06em' }}>{p.uhid}</div>
          <div className="tiny" style={{ opacity: .75, marginTop: 4 }}>{p.abha ? `ABHA ${p.abha}` : 'ABHA not linked'} · {p.category}</div>
        </div>
        <CodeMark text={p.uhid} />
      </div>
    </div>
  )
}

/* ---------- Nurse notes (linked everywhere) ---------- */
export function NurseNotesPanel({ patientId, context, refId, compact }: { patientId: string; context: NoteContext; refId?: string; compact?: boolean }) {
  const { user } = useApp()
  const all = useRows(nurseNotes)
  const [scope, setScope] = useState<'this' | 'all'>(refId ? 'this' : 'all')
  const list = useMemo(() => all.filter((n) => n.patientId === patientId && (scope === 'all' || n.refId === refId)), [all, patientId, refId, scope])
  const [adding, setAdding] = useState(false)
  return (
    <div className="col" style={{ gap: 8 }}>
      <div className="row between">
        <div className="row"><NotebookPen size={16} className="muted" /><b>Nurse notes</b><Badge tone="teal">{list.length}</Badge></div>
        <div className="row">
          {refId && <Seg value={scope} options={[['this', `This ${context}`], ['all', 'All episodes']] as const} onChange={setScope} />}
          {can(user.role, 'nurse.note') && <button className="sm-btn sm primary" onClick={() => setAdding(true)}><Plus size={14} />Add note</button>}
        </div>
      </div>
      {list.length === 0 ? <div className="small muted" style={{ padding: '10px 0' }}>No nurse notes yet.</div> : (
        <div className="col" style={{ gap: 6, maxHeight: compact ? 260 : undefined, overflowY: compact ? 'auto' : undefined }}>
          {list.slice(0, 40).map((n) => <NoteRow key={n.id} n={n} />)}
        </div>
      )}
      {adding && <AddNoteModal patientId={patientId} context={context} refId={refId} onClose={() => setAdding(false)} />}
    </div>
  )
}

const noteTone = (k: NurseNote['kind']): Tone => (k === 'Alert' ? 'red' : k === 'Vitals' ? 'blue' : k === 'Medication given' ? 'violet' : k === 'Handover' ? 'gold' : 'teal')

export function NoteRow({ n, showPatient }: { n: NurseNote; showPatient?: boolean }) {
  return (
    <div className="sm-card" style={{ padding: '10px 12px', borderLeft: `3px solid var(--${noteTone(n.kind) === 'blue' ? 'primary' : noteTone(n.kind)})` }}>
      <div className="row wrap" style={{ gap: 6 }}>
        <Badge tone={noteTone(n.kind)}>{n.kind}</Badge><Badge>{n.context}</Badge>
        {showPatient && <b className="small">{patients.get(n.patientId)?.name}</b>}
        <span className="tiny muted right">{n.by} · {time(n.at)} · {ago(n.at)}</span>
      </div>
      <div style={{ marginTop: 6 }}>{n.text}</div>
      {n.vitals && <div style={{ marginTop: 8 }}><VitalsView v={n.vitals} /></div>}
    </div>
  )
}

export function AddNoteModal({ patientId, context, refId, onClose }: { patientId: string; context: NoteContext; refId?: string; onClose: () => void }) {
  const [kind, setKind] = useState<NurseNote['kind']>('Observation')
  const [text, setText] = useState('')
  const [vitals, setVitals] = useState<Vitals>({})
  const toast = useToast()
  const hasVitals = Object.values(vitals).some((x) => x !== undefined && x !== '')
  return (
    <Modal title={`Nurse note · ${patients.get(patientId)?.name}`} icon={<NotebookPen size={18} />} onClose={onClose} width={680}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!text.trim() && !hasVitals} onClick={() => { addNurseNote({ patientId, context, refId, kind, text: text.trim() || 'Vitals recorded', vitals: hasVitals ? vitals : undefined }); toast('Nurse note saved and shared with the care team'); onClose() }}>Save note</button></>}>
      <div className="col" style={{ gap: 14 }}>
        <Field label="Type of note"><Seg value={kind} options={['Observation', 'Vitals', 'Medication given', 'Intake / Output', 'Handover', 'Alert'] as const} onChange={setKind} /></Field>
        <Field label="Note"><textarea className="textarea" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder={kind === 'Alert' ? 'What needs urgent attention? Doctors are notified.' : 'What did you observe or do?'} /></Field>
        <div><div className="small strong muted" style={{ marginBottom: 6 }}>Vitals (optional)</div><VitalsForm value={vitals} onChange={setVitals} /></div>
        <div className="small muted">Linked to: {context}{refId ? ' episode' : ''}. Visible to doctors and nurses wherever this patient is opened.</div>
      </div>
    </Modal>
  )
}

/* ---------- Patient summary drawer ---------- */
export function PatientDrawer({ patientId, onClose }: { patientId: string; onClose: () => void }) {
  const { user } = useApp()
  useRows(patients); useRows(nurseNotes); useRows(admissions); useRows(diagOrders)
  const allBills = useRows(bills)
  const p = patients.get(patientId)
  const clinical = can(user.role, 'patient.clinical')
  const finance = can(user.role, 'billing.manage')
  const [tab, setTab] = useState<'summary' | 'timeline' | 'notes' | 'reports' | 'bills'>('summary')
  if (!p) return null
  const adm = admissions.all().find((a) => a.patientId === p.id && a.status === 'admitted')
  const bed = adm && beds.get(adm.bedId)
  const tl = timelineFor(p.id)
  const myBills = allBills.filter((b) => b.patientId === p.id)
  const reports = diagOrders.all().filter((o) => o.patientId === p.id)
  const lastVitals = nurseNotes.all().find((n) => n.patientId === p.id && n.vitals)?.vitals
  const tabs: ['summary' | 'timeline' | 'notes' | 'reports' | 'bills', string, number?][] = [['summary', 'Summary'], ['timeline', 'Journey', tl.length]]
  if (clinical) tabs.push(['notes', 'Nurse notes', nurseNotes.all().filter((n) => n.patientId === p.id).length], ['reports', 'Reports', reports.length])
  if (finance || user.role === 'reception') tabs.push(['bills', 'Bills', myBills.length])
  return (
    <Drawer title={p.name} sub={`${p.uhid} · ${p.age} yrs · ${p.gender} · ${p.phone || 'no phone'}`} onClose={onClose} width={760}
      actions={<button className="sm-btn sm no-print" onClick={() => window.print()}><Printer size={14} />Print</button>}>
      <Tabs value={tab} tabs={tabs} onChange={setTab} />
      {tab === 'summary' && (
        <div className="col view" style={{ gap: 14 }}>
          <div className="grid g2">
            <ECard p={p} />
            <div className="sm-card pad col" style={{ gap: 8 }}>
              <div className="row"><b>Current status</b></div>
              {adm ? <div className="row"><BedDouble size={16} /><span>Admitted in <b>{ward(bed?.ward ?? '')?.name} · {bed?.number}</b> since {date(adm.admittedAt)} under {doctorName(adm.doctorId)}</span></div> : <div className="muted">Not admitted</div>}
              <div className="row wrap"><Badge tone={catTone(p.category)}>{p.category}</Badge>{p.insurer && <Badge tone="blue">{p.insurer}</Badge>}{p.allergies && <Badge tone="red">Allergy: {p.allergies}</Badge>}{p.bloodGroup && <Badge tone="red">{p.bloodGroup}</Badge>}</div>
              <div className="small muted">{p.address}</div>
              <div className="small muted">Registered {dateTime(p.createdAt)}</div>
            </div>
          </div>
          {clinical && (
            <div className="sm-card pad">
              <div className="row" style={{ marginBottom: 10 }}><HeartPulse size={16} className="muted" /><b>Latest vitals</b></div>
              <VitalsView v={lastVitals} />
            </div>
          )}
          {clinical && adm && (
            <div className="sm-card pad"><NurseNotesPanel patientId={p.id} context="IPD" refId={adm.id} compact /></div>
          )}
          <div className="sm-card pad">
            <div className="row" style={{ marginBottom: 6 }}><FileText size={16} className="muted" /><b>At a glance</b></div>
            <div className="grid g4">
              <Mini label="Visits" value={tl.filter((t) => t.kind === 'OPD').length} />
              <Mini label="Admissions" value={tl.filter((t) => t.kind === 'Admission').length} />
              <Mini label="Surgeries" value={tl.filter((t) => t.kind === 'Surgery').length} />
              <Mini label="Reports" value={reports.length} />
            </div>
          </div>
        </div>
      )}
      {tab === 'timeline' && (
        <div className="timeline view">
          {tl.filter((t) => clinical || ['Registration', 'OPD', 'Admission', 'Discharge'].includes(t.kind)).map((t, i) => (
            <div key={i} className="tl" style={{ color: `var(--${t.tone === 'blue' ? 'primary' : t.tone === 'gray' ? 'faint' : t.tone})` }}>
              <span className="pin" />
              <div style={{ color: 'var(--text)' }}>
                <div className="row wrap" style={{ gap: 6 }}><Badge tone={t.tone === 'gray' ? 'gray' : (t.tone as Tone)}>{t.kind}</Badge><b>{t.title}</b><span className="tiny muted right">{dateTime(t.at)}</span></div>
                {t.detail && clinical && <div className="small muted" style={{ marginTop: 4 }}>{t.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
      {tab === 'notes' && <div className="view"><NurseNotesPanel patientId={p.id} context={adm ? 'IPD' : 'General'} refId={adm?.id} /></div>}
      {tab === 'reports' && (
        <div className="sm-card view">
          {reports.length === 0 ? <Empty text="No lab or imaging orders." /> : reports.map((o) => (
            <div key={o.id} className="list-item">
              <Badge tone={o.kind === 'Lab' ? 'teal' : 'violet'}>{o.kind}</Badge>
              <div className="grow"><b>{o.test}</b><div className="small muted">{o.result ?? 'Awaiting result'}</div></div>
              {o.critical && <Badge tone="red">Critical</Badge>}
              <Badge tone={o.status === 'reported' ? 'green' : 'amber'}>{o.status}</Badge>
            </div>
          ))}
        </div>
      )}
      {tab === 'bills' && (
        <div className="sm-card view">
          {myBills.length === 0 ? <Empty text="No bills." /> : myBills.map((b) => (
            <div key={b.id} className="list-item">
              <Receipt size={16} className="muted" />
              <div className="grow"><b className="mono">{b.billNo}</b><div className="small muted">{b.source} · {date(b.createdAt)}</div></div>
              <b>{inr(billTotal(b))}</b>
              <Badge tone={due(b) ? 'amber' : 'green'}>{due(b) ? `Due ${inr(due(b))}` : 'Paid'}</Badge>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}

function Mini({ label, value }: { label: string; value: number }) {
  return <div className="vital"><span>{label}</span><b>{value}</b></div>
}

/* ---------- Report an issue (everyone can raise; only Security sees the list) ---------- */
export function ReportIssueModal({ onClose }: { onClose: () => void }) {
  const toast = useToast()
  const [v, setV] = useState({ kind: 'Complaint' as const as 'Complaint' | 'Dispute' | 'Security incident' | 'Billing dispute' | 'Lost & found' | 'Staff conduct', title: '', detail: '', raisedBy: 'Patient attendant', location: '', severity: 'Medium' as 'Low' | 'Medium' | 'High' | 'Critical' })
  return (
    <Modal title="Report an issue to Security" icon={<ShieldAlert size={18} />} onClose={onClose} width={640}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn danger" disabled={!v.title.trim()} onClick={() => { const c = raiseComplaint(v); toast(`Reported as ${c.ref}. Security has been alerted.`); onClose() }}>Send to Security</button></>}>
      <div className="form-grid">
        <Field label="Type" full><Seg value={v.kind} options={['Complaint', 'Dispute', 'Billing dispute', 'Security incident', 'Staff conduct', 'Lost & found'] as const} onChange={(kind) => setV({ ...v, kind })} /></Field>
        <Field label="What happened?" required full><input className="input" autoFocus value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="One line" /></Field>
        <Field label="Details" full><textarea className="textarea" value={v.detail} onChange={(e) => setV({ ...v, detail: e.target.value })} /></Field>
        <Field label="Reported by"><select className="select" value={v.raisedBy} onChange={(e) => setV({ ...v, raisedBy: e.target.value })}>{['Patient', 'Patient attendant', 'Nursing staff', 'Doctor', 'Guard on duty', 'Visitor'].map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Where"><input className="input" value={v.location} onChange={(e) => setV({ ...v, location: e.target.value })} placeholder="e.g. Billing counter" /></Field>
        <Field label="How serious?" full><Seg value={v.severity} options={['Low', 'Medium', 'High', 'Critical'] as const} onChange={(severity) => setV({ ...v, severity })} /></Field>
        <div className="full small muted">Only the Super Admin and the Security Head can see reported issues.</div>
      </div>
    </Modal>
  )
}

export const statusTone = (s: string): Tone =>
  ({ waiting: 'amber', 'in-consult': 'blue', done: 'green', 'no-show': 'gray', treatment: 'blue', observation: 'violet', closed: 'gray', ordered: 'amber', collected: 'blue', processing: 'violet', reported: 'green', pending: 'amber', dispensed: 'green', scheduled: 'blue', 'pre-op': 'violet', 'in-progress': 'red', recovery: 'amber', completed: 'green', cancelled: 'gray', Open: 'red', Investigating: 'amber', Resolved: 'green', Closed: 'gray' } as Record<string, Tone>)[s] ?? 'gray'

export function StatusBadge({ s }: { s: string }) {
  return <Badge tone={statusTone(s)} dot live={s === 'in-progress' || s === 'in-consult'}>{s.replace('-', ' ')}</Badge>
}
export { cx }
