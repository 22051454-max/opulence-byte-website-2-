'use client'

import { Ambulance, BedDouble, Baby, Flame, HeartPulse, Home, Megaphone, Scissors, ShieldAlert, Siren, TriangleAlert, UserX, Users, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { COMPLAINTS_ER, DOCTORS, ER_BAYS, LAB_TESTS, RAD_TESTS } from '../core/master'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { ErCase, Vitals } from '../core/types'
import { cx, fmtMins, isToday, minsSince, time } from '../core/util'
import { orderTest } from '../services/diagnostics'
import { doctorName } from '../services/doctors'
import { erCases, erDispose, erRegister, erUpdate } from '../services/emergency'
import { notify } from '../services/identity'
import { patients, registerPatient } from '../services/patients'
import { useApp } from '../ui/context'
import { Badge, Drawer, Empty, Field, Layer, Modal, PageHead, Seg, Tabs, VitalsForm, VitalsView, useNow, useToast } from '../ui/kit'
import { NurseNotesPanel, PatientLine, PatientPicker } from '../ui/patient'
import { AdmitModal } from './Ipd'
import { ScheduleSurgeryModal } from './Ot'

type Tri = ErCase['triage']
const TRIAGE: Record<Tri, { label: string; text: string; target: number }> = {
  red: { label: 'RED · Critical', text: 'Life threatening. Treat immediately.', target: 0 },
  yellow: { label: 'YELLOW · Urgent', text: 'Serious but stable. See within 30 min.', target: 30 },
  green: { label: 'GREEN · Minor', text: 'Can walk and talk. See within 2 hours.', target: 120 },
}
const CODES: [string, string, React.ReactNode, string][] = [
  ['Code Blue', 'Cardiac arrest', <HeartPulse key="b" size={16} />, '#2563eb'],
  ['Code Red', 'Fire', <Flame key="r" size={16} />, '#dc2626'],
  ['Code Pink', 'Infant / child missing', <Baby key="p" size={16} />, '#db2777'],
  ['Code Yellow', 'Mass casualty', <Users key="y" size={16} />, '#d97706'],
  ['Code Violet', 'Violent person', <ShieldAlert key="v" size={16} />, '#7c3aed'],
  ['Code Black', 'Bomb threat', <Zap key="k" size={16} />, '#111827'],
]

export default function Emergency() {
  const { user } = useApp()
  const all = useRows(erCases)
  useRows(patients)
  const [quick, setQuick] = useState<Tri | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const [view, setView] = useState<'board' | 'closed'>('board')
  const toast = useToast()
  const active = useMemo(() => all.filter((c) => c.status !== 'closed').sort((a, b) => (a.triage === b.triage ? a.arrivedAt.localeCompare(b.arrivedAt) : a.triage === 'red' ? -1 : b.triage === 'red' ? 1 : a.triage === 'yellow' ? -1 : 1)), [all])
  const closed = useMemo(() => all.filter((c) => c.status === 'closed' && isToday(c.closedAt)), [all])
  const usedBays = new Set(active.map((c) => c.bay))
  const canRegister = can(user.role, 'er.register')

  const fire = (name: string, what: string) => {
    notify(`${name} (${what}) called from Emergency by ${user.name}. Response team to report.`, 'danger', 'all', 'emergency')
    setCode(name)
    toast(`${name} announced hospital-wide`, 'danger')
    setTimeout(() => setCode(null), 2600)
  }

  return (
    <div>
      <PageHead title="Emergency" sub="Three colours, one rule: red first. Every case shows how long the patient has waited.">
        <span className="pill"><Ambulance size={15} />{active.filter((c) => c.mode.includes('Ambulance')).length} came by ambulance</span>
        <span className="pill"><BedDouble size={15} />{ER_BAYS.length - usedBays.size} of {ER_BAYS.length} bays free</span>
      </PageHead>

      {canRegister && (
        <div className="er-hero stagger" style={{ marginBottom: 16 }}>
          {(['red', 'yellow', 'green'] as const).map((t, i) => (
            <button key={t} className={cx('tri-btn', `tri-${t}`)} style={{ ['--i' as string]: i }} onClick={() => setQuick(t)}>
              <Siren size={22} />
              <b>{TRIAGE[t].label}</b>
              <span>{TRIAGE[t].text}</span>
              <span style={{ marginTop: 6, fontWeight: 700 }}>+ Register patient</span>
            </button>
          ))}
          <div className="sm-card pad" style={{ ['--i' as string]: 3 }}>
            <div className="row" style={{ marginBottom: 8 }}><Megaphone size={16} /><b>Hospital codes</b><span className="small muted right">Tap to announce</span></div>
            <div className="codes">
              {CODES.map(([name, what, icon, color]) => (
                <button key={name} className="code-btn" style={{ color }} onClick={() => fire(name, what)} title={what}>{icon}<span>{name}<span className="tiny muted" style={{ display: 'block', fontWeight: 500 }}>{what}</span></span></button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Tabs value={view} tabs={[['board', 'Live board', active.length], ['closed', 'Completed today', closed.length]]} onChange={setView} />

      {view === 'board' ? (
        <div className="lanes">
          {([['waiting', 'Waiting for doctor', 'amber'], ['treatment', 'Under treatment', 'blue'], ['observation', 'Observation', 'violet']] as const).map(([st, label, tone]) => {
            const cards = active.filter((c) => c.status === st)
            return (
              <div key={st} className="lane">
                <div className="lane-head"><Badge tone={tone} dot>{label}</Badge><span className="muted small right">{cards.length}</span></div>
                {cards.map((c) => <ErCard key={c.id} c={c} onClick={() => setOpen(c.id)} />)}
                {!cards.length && <div className="small muted" style={{ padding: 10 }}>No one here.</div>}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="sm-card table-wrap">
          <table className="t">
            <thead><tr><th>Patient</th><th>Triage</th><th>Complaint</th><th>Arrived</th><th>Time in ER</th><th>Outcome</th></tr></thead>
            <tbody>
              {closed.map((c) => (
                <tr key={c.id}>
                  <td><PatientLine p={patients.get(c.patientId)} /></td>
                  <td><Badge tone={c.triage === 'red' ? 'red' : c.triage === 'yellow' ? 'amber' : 'green'}>{c.triage}</Badge></td>
                  <td className="small">{c.complaint}{c.mlc && <> <Badge tone="violet">MLC</Badge></>}</td>
                  <td className="small">{time(c.arrivedAt)}</td>
                  <td className="small">{fmtMins(Math.max(0, Math.round((new Date(c.closedAt!).getTime() - new Date(c.arrivedAt).getTime()) / 60000)))}</td>
                  <td><Badge tone={c.disposition === 'Admitted' || c.disposition === 'Sent to OT' ? 'blue' : c.disposition === 'Discharged' ? 'green' : 'amber'}>{c.disposition}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!closed.length && <Empty text="No completed cases yet today." />}
        </div>
      )}

      {quick && <QuickRegister triage={quick} onClose={() => setQuick(null)} onDone={(id) => { setQuick(null); setOpen(id) }} />}
      {open && <CaseDrawer id={open} onClose={() => setOpen(null)} />}
      {code && (
        <Layer><div className="overlay" style={{ background: 'rgba(127, 29, 29, .55)', pointerEvents: 'none' }}>
          <div className="modal" style={{ ['--w' as string]: '520px', textAlign: 'center', padding: 30, animation: 'smi-pop .25s var(--ease) both, smi-beat 1s .25s 2' }}>
            <Siren size={44} color="var(--red)" style={{ margin: '0 auto', display: 'block' }} />
            <h2 style={{ fontSize: 34, marginTop: 10 }}>{code}</h2>
            <p className="muted">Announced on all screens and the public address system.</p>
          </div>
        </div></Layer>
      )}
    </div>
  )
}

function ErCard({ c, onClick }: { c: ErCase; onClick: () => void }) {
  useNow()
  const p = patients.get(c.patientId)
  const waited = minsSince(c.arrivedAt)
  const over = c.status === 'waiting' && waited > TRIAGE[c.triage].target
  return (
    <div className={cx('er-card', c.triage)} onClick={onClick}>
      <div className="row">
        <b className="grow ellipsis">{p?.name}</b>
        <span className={cx('timer mono strong small', over && 'pulse-red')} style={{ color: over ? 'var(--red)' : undefined, padding: '0 4px' }}>{fmtMins(waited)}</span>
      </div>
      <div className="small muted ellipsis" style={{ marginTop: 2 }}>{p?.age}y {p?.gender[0]} · {c.complaint}</div>
      <div className="row wrap" style={{ gap: 5, marginTop: 8 }}>
        {c.bay && <Badge tone="blue">{c.bay}</Badge>}
        {c.mode !== 'Walk-in' && <Badge tone="gray">{c.mode}</Badge>}
        {c.mlc && <Badge tone="violet">MLC</Badge>}
        {c.vitals?.spo2 !== undefined && c.vitals.spo2 < 92 && <Badge tone="red">SpO₂ {c.vitals.spo2}</Badge>}
        {c.doctorId && <span className="tiny muted right">{doctorName(c.doctorId)}</span>}
      </div>
    </div>
  )
}

function QuickRegister({ triage, onClose, onDone }: { triage: Tri; onClose: () => void; onDone: (caseId: string) => void }) {
  const toast = useToast()
  const [tri, setTri] = useState<Tri>(triage)
  const [known, setKnown] = useState<'new' | 'existing'>('new')
  const [pid, setPid] = useState<string | null>(null)
  const [unknown, setUnknown] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState(35)
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [phone, setPhone] = useState('')
  const [complaint, setComplaint] = useState('')
  const [mode, setMode] = useState<ErCase['mode']>('Walk-in')
  const [mlc, setMlc] = useState(false)
  const [vitals, setVitals] = useState<Vitals>({})
  const ok = complaint.trim() && (known === 'existing' ? !!pid : unknown || name.trim().length > 1)
  const submit = () => {
    const patientId = known === 'existing' ? pid! : registerPatient({ name: unknown ? `Unknown ${gender} (~${age} yrs)` : name.trim(), age, gender, phone, address: 'Not recorded', category: 'Self' }).id
    const c = erRegister(patientId, { triage: tri, mode, complaint, mlc, vitals: Object.keys(vitals).length ? vitals : undefined })
    toast(`${tri.toUpperCase()} case registered${c.bay ? ` in ${c.bay}` : ''}`, tri === 'red' ? 'danger' : 'success')
    onDone(c.id)
  }
  return (
    <Modal title="Emergency registration" icon={<Siren size={18} color="var(--red)" />} onClose={onClose} width={760}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className={cx('sm-btn lg', tri === 'red' ? 'danger' : 'primary')} disabled={!ok} onClick={submit}>Register {tri.toUpperCase()} case</button></>}>
      <div className="col" style={{ gap: 14 }}>
        <Field label="How serious?"><div className="row wrap" style={{ gap: 8 }}>
          {(['red', 'yellow', 'green'] as const).map((t) => (
            <button key={t} className={cx('sm-btn', tri === t && `tri-${t}`)} style={tri === t ? { color: '#fff', border: 0 } : undefined} onClick={() => setTri(t)}>{TRIAGE[t].label}</button>
          ))}
        </div></Field>
        <Seg value={known} options={[['new', 'New patient'], ['existing', 'Already registered']] as const} onChange={setKnown} />
        {known === 'existing' ? (pid ? <div className="sm-card pad"><PatientLine p={patients.get(pid)} right={<button className="sm-btn sm" onClick={() => setPid(null)}>Change</button>} /></div> : <PatientPicker autoFocus onPick={(p) => setPid(p.id)} />) : (
          <div className="form-grid">
            <label className="check full"><input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} /><UserX size={16} />Unconscious or identity unknown (register now, update name later)</label>
            {!unknown && <Field label="Name" required><input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} /></Field>}
            <Field label={unknown ? 'Approximate age' : 'Age'}><input className="input" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} /></Field>
            <Field label="Gender"><Seg value={gender} options={['Male', 'Female', 'Other'] as const} onChange={setGender} /></Field>
            {!unknown && <Field label="Attendant mobile"><input className="input" inputMode="tel" maxLength={10} value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} /></Field>}
          </div>
        )}
        <Field label="What happened?" required>
          <input className="input" value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Type or tap below" />
        </Field>
        <div className="row wrap" style={{ gap: 6, marginTop: -6 }}>{COMPLAINTS_ER.slice(0, 12).map((c) => <button key={c} className={cx('sm-step', complaint === c && 'done')} onClick={() => setComplaint(c)}>{c}</button>)}</div>
        <div className="form-grid">
          <Field label="Arrived by"><select className="select" value={mode} onChange={(e) => setMode(e.target.value as ErCase['mode'])}>{(['Walk-in', 'Ambulance (108)', 'Private ambulance', 'Referred'] as const).map((m) => <option key={m}>{m}</option>)}</select></Field>
          <label className="check" style={{ alignSelf: 'end', height: 40 }}><input type="checkbox" checked={mlc} onChange={(e) => setMlc(e.target.checked)} /><TriangleAlert size={16} />Medico-legal case (police intimation)</label>
        </div>
        <details><summary className="small strong muted" style={{ cursor: 'pointer' }}>Add vitals now (optional)</summary><div style={{ marginTop: 10 }}><VitalsForm value={vitals} onChange={setVitals} /></div></details>
      </div>
    </Modal>
  )
}

function CaseDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { user } = useApp()
  const toast = useToast()
  useRows(erCases)
  const c = erCases.get(id)
  const [admit, setAdmit] = useState(false)
  const [ot, setOt] = useState(false)
  const [vitals, setVitals] = useState<Vitals>({})
  useNow()
  if (!c) return null
  const p = patients.get(c.patientId)!
  const manage = can(user.role, 'er.manage')
  const closed = c.status === 'closed'
  const dispose = (d: NonNullable<ErCase['disposition']>) => { erDispose(c.id, d); toast(`Case closed: ${d}`); onClose() }
  return (
    <Drawer title={p.name} sub={`${c.triage.toUpperCase()} triage · arrived ${time(c.arrivedAt)} (${fmtMins(minsSince(c.arrivedAt))} ago) · ${c.mode}`} onClose={onClose} width={760}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad"><PatientLine p={p} right={<>{c.mlc && <Badge tone="violet">MLC</Badge>}<Badge tone={c.triage === 'red' ? 'red' : c.triage === 'yellow' ? 'amber' : 'green'}>{c.triage}</Badge></>} /><div style={{ marginTop: 10 }}><b>{c.complaint}</b></div></div>

        {manage && !closed && (
          <div className="sm-card pad col" style={{ gap: 12 }}>
            <b>Step 1 · Assign</b>
            <div className="form-grid">
              <Field label="Triage"><Seg value={c.triage} options={['red', 'yellow', 'green'] as const} onChange={(t) => erUpdate(c.id, { triage: t })} /></Field>
              <Field label="Bay"><select className="select" value={c.bay ?? ''} onChange={(e) => erUpdate(c.id, { bay: e.target.value || undefined })}><option value="">Not assigned</option>{ER_BAYS.map((b) => <option key={b}>{b}</option>)}</select></Field>
              <Field label="Doctor"><select className="select" value={c.doctorId ?? ''} onChange={(e) => erUpdate(c.id, { doctorId: e.target.value || undefined })}><option value="">Not assigned</option>{DOCTORS.filter((d) => ['Emergency Medicine', 'Critical Care', 'Internal Medicine', 'Cardiology', 'Neurosurgery', 'General & Laparoscopic Surgery', 'Orthopaedics & Joint Replacement', 'Paediatrics & Neonatology', 'Obstetrics & Gynaecology'].includes(d.dept)).map((d) => <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>)}</select></Field>
              <Field label="Stage"><Seg value={c.status as 'waiting' | 'treatment' | 'observation'} options={[['waiting', 'Waiting'], ['treatment', 'Treating'], ['observation', 'Observation']] as const} onChange={(s) => erUpdate(c.id, { status: s })} /></Field>
            </div>
          </div>
        )}

        <div className="sm-card pad col" style={{ gap: 10 }}>
          <b>Vitals</b>
          <VitalsView v={c.vitals} />
          {manage && !closed && <details><summary className="small strong muted" style={{ cursor: 'pointer' }}>Update vitals</summary><div className="col" style={{ marginTop: 10 }}><VitalsForm value={vitals} onChange={setVitals} /><button className="sm-btn sm primary" style={{ alignSelf: 'flex-start' }} onClick={() => { erUpdate(c.id, { vitals: { ...c.vitals, ...vitals } }); setVitals({}); toast('Vitals updated') }}>Save vitals</button></div></details>}
        </div>

        {manage && !closed && can(user.role, 'diag.order') && (
          <div className="sm-card pad col" style={{ gap: 8 }}>
            <b>STAT tests (go straight to the top of the lab / radiology queue)</b>
            <div className="row wrap" style={{ gap: 6 }}>
              {[LAB_TESTS[0], LAB_TESTS[7], LAB_TESTS[8], LAB_TESTS[12], LAB_TESTS[16], RAD_TESTS[0], RAD_TESTS[5], RAD_TESTS[2]].map(([t]) => (
                <button key={t} className="sm-step" onClick={() => { orderTest(c.patientId, t, 'Emergency', 'STAT'); toast(`STAT ${t} ordered`) }}>{t}</button>
              ))}
            </div>
          </div>
        )}

        <div className="sm-card pad"><NurseNotesPanel patientId={c.patientId} context="Emergency" refId={c.id} /></div>

        {manage && !closed && (
          <div className="sm-card pad col" style={{ gap: 10 }}>
            <b>Step 2 · Decide where the patient goes</b>
            <div className="grid g3">
              <button className="sm-btn lg primary" onClick={() => setAdmit(true)}><BedDouble size={18} />Admit</button>
              <button className="sm-btn lg danger" onClick={() => setOt(true)}><Scissors size={18} />Send to OT</button>
              <button className="sm-btn lg success" onClick={() => dispose('Discharged')}><Home size={18} />Discharge home</button>
              <button className="sm-btn" onClick={() => dispose('Referred out')}>Refer out</button>
              <button className="sm-btn" onClick={() => dispose('LAMA')}>Left against advice</button>
              <button className="sm-btn" onClick={() => dispose('Expired')}>Declare death</button>
            </div>
          </div>
        )}
        {closed && <div className="notice tone-gray">Closed at {time(c.closedAt)}: {c.disposition}</div>}
      </div>
      {admit && <AdmitModal patientId={c.patientId} source="Emergency" doctorId={c.doctorId} onClose={() => setAdmit(false)} onDone={() => { setAdmit(false); dispose('Admitted') }} />}
      {ot && <ScheduleSurgeryModal patientId={c.patientId} emergency onClose={() => setOt(false)} onDone={() => { setOt(false); dispose('Sent to OT') }} />}
    </Drawer>
  )
}
