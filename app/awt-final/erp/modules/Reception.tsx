'use client'

import { BedDouble, CalendarDays, CheckCircle2, MessageSquare, Search, Siren, Stethoscope, Ticket, UserPlus, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DOCTORS } from '../core/master'
import { useRows } from '../core/store'
import type { Patient, Visit } from '../core/types'
import { inr, isToday, time } from '../core/util'
import { doctorName } from '../services/doctors'
import { bookOpd, visits } from '../services/opd'
import { patients } from '../services/patients'
import { useApp } from '../ui/context'
import { Badge, Empty, Field, Modal, PageHead, Seg, useToast } from '../ui/kit'
import { ECard, PatientLine, PatientPicker, RegisterModal, StatusBadge } from '../ui/patient'

export default function Reception() {
  const { go } = useApp()
  const all = useRows(visits)
  useRows(patients)
  const [registering, setRegistering] = useState(false)
  const [booking, setBooking] = useState<Patient | null | 'pick'>(null)
  const [q, setQ] = useState('')
  const today = useMemo(() => all.filter((v) => isToday(v.createdAt)), [all])
  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    const rows = s ? today.filter((v) => { const p = patients.get(v.patientId); return p && (p.name.toLowerCase().includes(s) || p.uhid.toLowerCase().includes(s) || p.phone.includes(s)) }) : today
    return rows.slice(0, 60)
  }, [today, q])
  const queues = useMemo(() => {
    const m = new Map<string, { waiting: number; done: number }>()
    for (const v of today) {
      const x = m.get(v.doctorId) ?? { waiting: 0, done: 0 }
      if (v.status === 'waiting') x.waiting++
      if (v.status === 'done') x.done++
      m.set(v.doctorId, x)
    }
    return m
  }, [today])

  return (
    <div>
      <PageHead title="Reception" sub="Register patients, book OPD tokens and send digital slips. No paper forms." />
      <div className="grid g4 stagger" style={{ marginBottom: 16 }}>
        <ActionCard i={0} tone="blue" icon={<UserPlus size={22} />} title="New patient" text="Register and book a doctor" onClick={() => setRegistering(true)} />
        <ActionCard i={1} tone="teal" icon={<Ticket size={22} />} title="Returning patient" text="Find by name, UHID or phone" onClick={() => setBooking('pick')} />
        <ActionCard i={2} tone="red" icon={<Siren size={22} />} title="Emergency" text="Quick triage registration" onClick={() => go('emergency')} />
        <ActionCard i={3} tone="violet" icon={<BedDouble size={22} />} title="Admission" text="Allot a bed from the bed board" onClick={() => go('ipd')} />
      </div>

      <div className="grid g3">
        <div className="sm-card span2">
          <div className="card-head">
            <CalendarDays size={16} className="muted" /><h3>Today's OPD registrations</h3><Badge tone="blue">{today.length}</Badge>
            <div className="right row" style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--faint)' }} /><input className="input sm" style={{ paddingLeft: 30, width: 220 }} placeholder="Find in today's list" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="table-wrap" style={{ maxHeight: 520, overflowY: 'auto' }}>
            <table className="t">
              <thead><tr><th>Token</th><th>Patient</th><th>Doctor</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                {list.map((v) => (
                  <tr key={v.id}>
                    <td><b className="mono">#{v.token}</b></td>
                    <td><PatientLine p={patients.get(v.patientId)} /></td>
                    <td><div className="small strong">{doctorName(v.doctorId)}</div><div className="tiny muted">{v.dept}</div></td>
                    <td className="nowrap small">{time(v.createdAt)}</td>
                    <td><StatusBadge s={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <Empty text="No registrations match." />}
          </div>
        </div>
        <div className="sm-card">
          <div className="card-head"><Users size={16} className="muted" /><h3>Doctor queues now</h3></div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {DOCTORS.filter((d) => d.fee > 0).map((d) => {
              const q = queues.get(d.id) ?? { waiting: 0, done: 0 }
              return (
                <div key={d.id} className="list-item">
                  <div className="grow"><b className="small">{d.name}</b><div className="tiny muted">{d.dept} · {d.room}</div></div>
                  <Badge tone={q.waiting > 20 ? 'red' : q.waiting > 10 ? 'amber' : 'green'}>{q.waiting} waiting</Badge>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {registering && <RegisterModal onClose={() => setRegistering(false)} onDone={(p) => { setRegistering(false); setBooking(p) }} />}
      {booking && <BookModal initial={booking === 'pick' ? null : booking} queues={queues} onClose={() => setBooking(null)} />}
    </div>
  )
}

function ActionCard({ icon, title, text, tone, onClick, i }: { icon: React.ReactNode; title: string; text: string; tone: string; onClick: () => void; i: number }) {
  return (
    <button className="sm-card pad hover-lift row" style={{ textAlign: 'left', gap: 14, ['--i' as string]: i }} onClick={onClick}>
      <span className={`tone-${tone}`} style={{ width: 48, height: 48, borderRadius: 14, display: 'grid', placeItems: 'center', flex: 'none' }}>{icon}</span>
      <span><b style={{ fontSize: 15, display: 'block' }}>{title}</b><span className="small muted">{text}</span></span>
    </button>
  )
}

export function BookModal({ initial, onClose, queues }: { initial: Patient | null; onClose: () => void; queues?: Map<string, { waiting: number }> }) {
  const toast = useToast()
  const [p, setP] = useState<Patient | null>(initial)
  const depts = useMemo(() => [...new Set(DOCTORS.filter((d) => d.fee > 0).map((d) => d.dept))], [])
  const [dept, setDept] = useState(depts[0])
  const docs = DOCTORS.filter((d) => d.dept === dept && d.fee > 0)
  const [docId, setDocId] = useState<string | undefined>(docs[0]?.id)
  const [type, setType] = useState<Visit['visitType']>('New')
  const [complaint, setComplaint] = useState('')
  const [done, setDone] = useState<Visit | null>(null)
  const doc = DOCTORS.find((d) => d.id === docId)

  if (done && p) return (
    <Modal title="Token issued" icon={<CheckCircle2 size={18} color="var(--green)" />} onClose={onClose} width={560} footer={<button className="sm-btn primary" onClick={onClose}>Done</button>}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad row" style={{ gap: 18 }}>
          <div style={{ textAlign: 'center' }}><div className="tiny muted strong">TOKEN</div><div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, fontFamily: 'var(--font-display)' }}>{done.token}</div></div>
          <div className="grow"><b>{doctorName(done.doctorId)}</b><div className="small muted">{done.dept} · {doc?.room}</div><div className="small" style={{ marginTop: 6 }}>About {(queues?.get(done.doctorId)?.waiting ?? 0) * 6} min wait</div></div>
        </div>
        <ECard p={p} />
        <div className="notice tone-green"><MessageSquare size={16} />Digital token and health card sent by SMS and WhatsApp to {p.phone ? `+91 ${p.phone}` : 'the attendant'}. Consultation fee {inr(type === 'New' ? doc?.fee ?? 0 : Math.round((doc?.fee ?? 0) * 0.6))} added to the bill.</div>
      </div>
    </Modal>
  )

  return (
    <Modal title="Book OPD consultation" icon={<Stethoscope size={18} />} onClose={onClose} width={680}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!p || !docId} onClick={() => { const v = bookOpd(p!.id, docId!, type, complaint || undefined); toast(`Token ${v.token} for ${doctorName(v.doctorId)}`); setDone(v) }}>Issue token</button></>}>
      <div className="col" style={{ gap: 14 }}>
        {p ? <div className="sm-card pad"><PatientLine p={p} right={!initial && <button className="sm-btn sm" onClick={() => setP(null)}>Change</button>} /></div> : <PatientPicker autoFocus onPick={setP} />}
        <div className="form-grid">
          <Field label="Department"><select className="select" value={dept} onChange={(e) => { setDept(e.target.value); setDocId(DOCTORS.find((d) => d.dept === e.target.value && d.fee > 0)?.id) }}>{depts.map((d) => <option key={d}>{d}</option>)}</select></Field>
          <Field label="Doctor"><select className="select" value={docId} onChange={(e) => setDocId(e.target.value)}>{docs.map((d) => <option key={d.id} value={d.id}>{d.name} · {queues?.get(d.id)?.waiting ?? 0} waiting</option>)}</select></Field>
          <Field label="Visit type"><Seg value={type} options={['New', 'Follow-up'] as const} onChange={setType} /></Field>
          <Field label="Fee"><div className="input" style={{ display: 'flex', alignItems: 'center' }}>{inr(type === 'New' ? doc?.fee ?? 0 : Math.round((doc?.fee ?? 0) * 0.6))}</div></Field>
          <Field label="Main complaint (optional)" full><input className="input" value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="e.g. Fever for 3 days" /></Field>
        </div>
      </div>
    </Modal>
  )
}
