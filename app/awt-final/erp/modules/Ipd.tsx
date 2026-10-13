'use client'

import { ArrowRightLeft, BedDouble, CheckCircle2, FileHeart, LogOut, Printer, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DOCTORS, HOSPITAL, WARDS } from '../core/master'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { Admission, Bed, DischargeSummary } from '../core/types'
import { cx, date, dateTime, isToday } from '../core/util'
import { doctorName } from '../services/doctors'
import { admissions, admit, beds, discharge, setBedStatus, transferBed, ward } from '../services/ipd'
import { surgeries } from '../services/ot'
import { patients } from '../services/patients'
import { rxOrders } from '../services/pharmacy'
import { useApp } from '../ui/context'
import { Badge, Drawer, Empty, Field, Modal, PageHead, Seg, Tabs, useToast } from '../ui/kit'
import { NurseNotesPanel, PatientLine, PatientPicker } from '../ui/patient'
import { Logo } from '../ui/Logo'

const KINDS = ['All', 'Critical', 'Room', 'General', 'Speciality', 'Day care'] as const

export default function Ipd() {
  const { user } = useApp()
  const allBeds = useRows(beds)
  const allAdm = useRows(admissions)
  useRows(patients)
  const [kind, setKind] = useState<(typeof KINDS)[number]>('All')
  const [tab, setTab] = useState<'board' | 'census' | 'discharged'>('board')
  const [bedId, setBedId] = useState<string | null>(null)
  const [admitBed, setAdmitBed] = useState<string | null>(null)
  const toast = useToast()
  const wards = WARDS.filter((w) => kind === 'All' || w.kind === kind)
  const census = useMemo(() => allAdm.filter((a) => a.status === 'admitted'), [allAdm])
  const dischargedToday = useMemo(() => allAdm.filter((a) => a.status === 'discharged' && isToday(a.dischargedAt)), [allAdm])

  const onBed = (b: Bed) => {
    if (b.status === 'free') { if (can(user.role, 'ipd.admit')) setAdmitBed(b.id); else toast('Free bed. Only admitting staff can allot it.', 'info') }
    else if (b.status === 'occupied') setBedId(b.id)
    else if (can(user.role, 'ipd.beds')) { setBedStatus(b.id, 'free'); toast(`${b.number} marked clean and ready`) }
  }

  return (
    <div>
      <PageHead title="Wards & beds" sub={`${HOSPITAL.beds} beds across ${WARDS.length} wards and ICUs. Green means free: tap it to admit.`}>
        <span className="pill"><Badge tone="green" dot>Free</Badge>{allBeds.filter((b) => b.status === 'free').length}</span>
        <span className="pill"><Badge tone="blue" dot>Occupied</Badge>{allBeds.filter((b) => b.status === 'occupied').length}</span>
        <span className="pill"><Badge tone="amber" dot>Cleaning</Badge>{allBeds.filter((b) => b.status === 'cleaning').length}</span>
      </PageHead>
      <Tabs value={tab} tabs={[['board', 'Bed board'], ['census', 'Admitted patients', census.length], ['discharged', 'Discharged today', dischargedToday.length]]} onChange={setTab} />

      {tab === 'board' && (
        <>
          <div className="row wrap between" style={{ marginBottom: 12 }}>
            <Seg value={kind} options={KINDS} onChange={setKind} />
            <div className="legend"><span><i style={{ background: 'var(--green)' }} />Free (tap to admit)</span><span><i style={{ background: 'var(--primary)' }} />Occupied</span><span><i style={{ background: 'var(--amber)' }} />Cleaning (tap when ready)</span><span><i style={{ background: 'var(--violet)' }} />Reserved</span></div>
          </div>
          <div className="col" style={{ gap: 14 }}>
            {wards.map((w) => {
              const wb = allBeds.filter((b) => b.ward === w.id)
              const occ = wb.filter((b) => b.status === 'occupied').length
              return (
                <div key={w.id} className="sm-card">
                  <div className="card-head"><BedDouble size={16} className="muted" /><h3>{w.name}</h3><Badge>{w.kind}</Badge><span className="small muted">{w.floor} · ₹{w.rate.toLocaleString('en-IN')}/day</span><span className="right small"><b>{occ}</b>/{wb.length} occupied</span></div>
                  <div className="card-body beds">
                    {wb.map((b) => {
                      const a = b.admissionId ? admissions.get(b.admissionId) : undefined
                      const p = a ? patients.get(a.patientId) : undefined
                      return (
                        <button key={b.id} className={cx('bed', b.status)} onClick={() => onBed(b)} title={p ? `${p.name} · ${a?.diagnosis}` : b.status}>
                          <b>{b.number.split('-')[1]}</b>
                          <span className="ellipsis">{p ? p.name.split(' ')[0] : b.status === 'free' ? 'Free' : b.status}</span>
                          {p && <span className="tiny muted ellipsis">{p.age}y {p.gender[0]}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'census' && (
        <div className="sm-card table-wrap">
          <table className="t">
            <thead><tr><th>Patient</th><th>Bed</th><th>Doctor</th><th>Diagnosis</th><th>Admitted</th><th>From</th></tr></thead>
            <tbody>
              {census.slice(0, 150).map((a) => {
                const b = beds.get(a.bedId)
                return (
                  <tr key={a.id} className="click" onClick={() => setBedId(a.bedId)}>
                    <td><PatientLine p={patients.get(a.patientId)} /></td>
                    <td className="small"><b>{b?.number}</b><div className="tiny muted">{ward(b?.ward ?? '')?.name}</div></td>
                    <td className="small">{doctorName(a.doctorId)}</td>
                    <td className="small">{a.diagnosis}</td>
                    <td className="small nowrap">{date(a.admittedAt)}</td>
                    <td><Badge tone={a.source === 'Emergency' ? 'red' : 'blue'}>{a.source}</Badge></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'discharged' && <DischargeList list={dischargedToday} />}

      {admitBed && <AdmitModal bedId={admitBed} source="Direct" onClose={() => setAdmitBed(null)} onDone={() => setAdmitBed(null)} />}
      {bedId && <BedDrawer bedId={bedId} onClose={() => setBedId(null)} />}
    </div>
  )
}

export function DischargeList({ list }: { list: Admission[] }) {
  const [open, setOpen] = useState<Admission | null>(null)
  return (
    <div className="sm-card">
      {list.map((a) => (
        <div key={a.id} className="list-item click" onClick={() => setOpen(a)}>
          <FileHeart size={18} className="muted" />
          <div className="grow"><PatientLine p={patients.get(a.patientId)} /></div>
          <span className="small muted">{a.dischargeSummary?.finalDiagnosis}</span>
          <Badge tone="green">{dateTime(a.dischargedAt)}</Badge>
        </div>
      ))}
      {!list.length && <Empty text="No discharges yet." />}
      {open && <Modal title="Discharge summary" onClose={() => setOpen(null)} width={820} footer={<button className="sm-btn primary" onClick={() => window.print()}><Printer size={16} />Print or save as PDF</button>}><DischargeSheet a={open} /></Modal>}
    </div>
  )
}

export function DischargeSheet({ a }: { a: Admission }) {
  const p = patients.get(a.patientId)!
  const s = a.dischargeSummary
  const b = beds.get(a.bedId)
  return (
    <div className="sheet">
      <div className="row" style={{ borderBottom: '2px solid #0a1a36', paddingBottom: 12, marginBottom: 14 }}>
        <Logo size={52} />
        <div className="grow"><h2>{HOSPITAL.name}</h2><div className="small" style={{ color: '#5a6a80' }}>{HOSPITAL.address} · {HOSPITAL.phone} · {HOSPITAL.nabh}</div></div>
        <b style={{ fontSize: 16 }}>DISCHARGE SUMMARY</b>
      </div>
      <table><tbody>
        <tr><th>Patient</th><td>{p.name}, {p.age} yrs, {p.gender}</td><th>UHID</th><td>{p.uhid}</td></tr>
        <tr><th>Admitted</th><td>{dateTime(a.admittedAt)}</td><th>Discharged</th><td>{dateTime(a.dischargedAt)}</td></tr>
        <tr><th>Consultant</th><td>{doctorName(a.doctorId)}</td><th>Ward / bed</th><td>{ward(b?.ward ?? '')?.name} · {b?.number}</td></tr>
        <tr><th>Payment</th><td>{p.category}{p.insurer ? ` · ${p.insurer}` : ''}</td><th>ABHA</th><td>{p.abha ?? '—'}</td></tr>
      </tbody></table>
      {s && (
        <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
          {([['Final diagnosis', s.finalDiagnosis], ['Course in hospital', s.courseInHospital], ['Procedures', s.procedures], ['Condition at discharge', s.conditionAtDischarge], ['Medicines at discharge', s.medications], ['Follow-up', s.followUp]] as const).map(([k, v]) => (
            <div key={k}><b style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.06em', color: '#5a6a80' }}>{k}</b><div style={{ whiteSpace: 'pre-wrap', marginTop: 2 }}>{v}</div></div>
          ))}
          <div style={{ marginTop: 10, fontSize: 12, color: '#5a6a80' }}>Digitally signed by {s.writtenBy} on {dateTime(s.at)}. In an emergency call {HOSPITAL.emergency}.</div>
        </div>
      )}
    </div>
  )
}

export function AdmitModal({ patientId, bedId, source, doctorId, onClose, onDone }: { patientId?: string; bedId?: string; source: Admission['source']; doctorId?: string; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const allBeds = useRows(beds)
  const [pid, setPid] = useState(patientId ?? null)
  const [wardId, setWardId] = useState(bedId ? beds.get(bedId)!.ward : 'GWM')
  const free = allBeds.filter((b) => b.ward === wardId && b.status === 'free')
  const [bed, setBed] = useState(bedId ?? '')
  const [doc, setDoc] = useState(doctorId ?? 'd16')
  const [dx, setDx] = useState('')
  const chosenBed = bed && allBeds.find((b) => b.id === bed && b.status === 'free') ? bed : free[0]?.id ?? ''
  return (
    <Modal title="Admit patient" icon={<BedDouble size={18} />} onClose={onClose} width={680}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!pid || !chosenBed || !dx.trim()} onClick={() => { const r = admit(pid!, doc, chosenBed, dx.trim(), source); if (typeof r === 'string') return toast(r, 'danger'); toast(`Admitted to ${beds.get(chosenBed)?.number}. Bed charges started, nursing notified.`); onDone() }}>Admit</button></>}>
      <div className="col" style={{ gap: 14 }}>
        {pid ? <div className="sm-card pad"><PatientLine p={patients.get(pid)} right={!patientId && <button className="sm-btn sm" onClick={() => setPid(null)}>Change</button>} /></div> : <PatientPicker autoFocus onPick={(p) => setPid(p.id)} />}
        <div className="form-grid">
          <Field label="Ward"><select className="select" value={wardId} onChange={(e) => { setWardId(e.target.value); setBed('') }}>{WARDS.map((w) => <option key={w.id} value={w.id}>{w.name} · {allBeds.filter((b) => b.ward === w.id && b.status === 'free').length} free</option>)}</select></Field>
          <Field label="Bed"><select className="select" value={chosenBed} onChange={(e) => setBed(e.target.value)}>{free.map((b) => <option key={b.id} value={b.id}>{b.number}</option>)}{!free.length && <option value="">No free bed</option>}</select></Field>
          <Field label="Admitting consultant"><select className="select" value={doc} onChange={(e) => setDoc(e.target.value)}>{DOCTORS.filter((d) => !['Radiology', 'Anaesthesiology'].includes(d.dept)).map((d) => <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>)}</select></Field>
          <Field label="Provisional diagnosis" required><input className="input" value={dx} onChange={(e) => setDx(e.target.value)} /></Field>
        </div>
        <div className="small muted">Rate: ₹{ward(wardId)?.rate.toLocaleString('en-IN')}/day. Insured patients get a TPA pre-auth started automatically on the bill.</div>
      </div>
    </Modal>
  )
}

function BedDrawer({ bedId, onClose }: { bedId: string; onClose: () => void }) {
  const { user } = useApp()
  const toast = useToast()
  const allBeds = useRows(beds)
  useRows(admissions)
  const b = beds.get(bedId)
  const a = b?.admissionId ? admissions.get(b.admissionId) : undefined
  const [transfer, setTransfer] = useState(false)
  const [dis, setDis] = useState(false)
  const [to, setTo] = useState('')
  if (!b || !a) return null
  const p = patients.get(a.patientId)!
  const days = Math.max(1, Math.ceil((Date.now() - new Date(a.admittedAt).getTime()) / 86400e3))
  return (
    <Drawer title={`${ward(b.ward)?.name} · ${b.number}`} sub={`Day ${days} · admitted ${dateTime(a.admittedAt)} from ${a.source}`} onClose={onClose} width={760}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad col" style={{ gap: 10 }}>
          <PatientLine p={p} />
          <div className="row wrap"><Badge tone="blue">{doctorName(a.doctorId)}</Badge><Badge tone="violet">{a.diagnosis}</Badge>{p.category !== 'Self' && <Badge tone="teal">{p.insurer ?? p.category}</Badge>}</div>
          <div className="row wrap" style={{ gap: 8 }}>
            {can(user.role, 'ipd.beds') || can(user.role, 'ipd.admit') ? <button className="sm-btn" onClick={() => setTransfer(!transfer)}><ArrowRightLeft size={16} />Transfer bed</button> : null}
            {can(user.role, 'ipd.discharge') && <button className="sm-btn primary" onClick={() => setDis(true)}><LogOut size={16} />Discharge</button>}
          </div>
          {transfer && (
            <div className="row wrap">
              <select className="select" style={{ maxWidth: 320 }} value={to} onChange={(e) => setTo(e.target.value)}><option value="">Choose a free bed</option>{WARDS.map((w) => <optgroup key={w.id} label={w.name}>{allBeds.filter((x) => x.ward === w.id && x.status === 'free').slice(0, 12).map((x) => <option key={x.id} value={x.id}>{x.number}</option>)}</optgroup>)}</select>
              <button className="sm-btn primary" disabled={!to} onClick={() => { const r = transferBed(a.id, to); if (typeof r === 'string') return toast(r, 'danger'); toast('Transferred. Old bed sent for cleaning.'); onClose() }}>Move</button>
            </div>
          )}
        </div>
        {can(user.role, 'patient.clinical') && <div className="sm-card pad"><NurseNotesPanel patientId={p.id} context="IPD" refId={a.id} /></div>}
      </div>
      {dis && <DischargeModal a={a} onClose={() => setDis(false)} onDone={() => { setDis(false); onClose() }} />}
    </Drawer>
  )
}

function DischargeModal({ a, onClose, onDone }: { a: Admission; onClose: () => void; onDone: () => void }) {
  const toast = useToast()
  const procs = surgeries.all().filter((s) => s.patientId === a.patientId && s.status !== 'cancelled').map((s) => `${s.procedure} (${date(s.start)})`).join('\n')
  const meds = rxOrders.all().find((o) => o.patientId === a.patientId)?.items.map((i) => `${i.drug} · ${i.freq} · ${i.days} days`).join('\n')
  const [s, setS] = useState<Omit<DischargeSummary, 'writtenBy' | 'at'>>({
    finalDiagnosis: a.diagnosis,
    courseInHospital: `Admitted on ${date(a.admittedAt)} with ${a.diagnosis.toLowerCase()}. Treated with medicines and monitoring as per protocol. Improved and stable.`,
    procedures: procs || 'Nil',
    conditionAtDischarge: 'Stable, afebrile, vitals within normal limits',
    medications: meds || 'As per prescription',
    followUp: `Review in ${doctorName(a.doctorId)}'s OPD after 7 days with reports.`,
  })
  const set = (k: keyof typeof s, v: string) => setS({ ...s, [k]: v })
  return (
    <Modal title="Discharge summary (auto-filled, edit if needed)" icon={<Sparkles size={18} />} onClose={onClose} width={760}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" onClick={() => { discharge(a.id, s); toast('Discharged. Summary shared with the patient by SMS; billing notified.'); onDone() }}><CheckCircle2 size={16} />Sign and discharge</button></>}>
      <div className="form-grid">
        <Field label="Final diagnosis" full><input className="input" value={s.finalDiagnosis} onChange={(e) => set('finalDiagnosis', e.target.value)} /></Field>
        <Field label="Course in hospital" full><textarea className="textarea" value={s.courseInHospital} onChange={(e) => set('courseInHospital', e.target.value)} /></Field>
        <Field label="Procedures"><textarea className="textarea" value={s.procedures} onChange={(e) => set('procedures', e.target.value)} /></Field>
        <Field label="Medicines at discharge"><textarea className="textarea" value={s.medications} onChange={(e) => set('medications', e.target.value)} /></Field>
        <Field label="Condition at discharge"><input className="input" value={s.conditionAtDischarge} onChange={(e) => set('conditionAtDischarge', e.target.value)} /></Field>
        <Field label="Follow-up"><input className="input" value={s.followUp} onChange={(e) => set('followUp', e.target.value)} /></Field>
      </div>
    </Modal>
  )
}
