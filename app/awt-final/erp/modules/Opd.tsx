'use client'

import { BedDouble, CheckCircle2, ChevronRight, FlaskConical, History, Megaphone, Pill, Plus, Scissors, Stethoscope, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { DOCTORS, DRUGS, LAB_TESTS, RAD_TESTS } from '../core/master'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { RxItem, Visit, Vitals } from '../core/types'
import { ago, cx, date, isToday, time } from '../core/util'
import { doctor } from '../services/doctors'
import { saveConsult, setVisitStatus, startConsult, visits } from '../services/opd'
import { patients } from '../services/patients'
import { timelineFor } from '../services/timeline'
import { useApp } from '../ui/context'
import { Badge, Empty, Field, PageHead, Tabs, VitalsForm, useToast } from '../ui/kit'
import { NurseNotesPanel, PatientLine, StatusBadge } from '../ui/patient'
import { ScheduleSurgeryModal } from './Ot'

export default function Opd() {
  const { user } = useApp()
  const all = useRows(visits)
  useRows(patients)
  const [docId, setDocId] = useState(user.doctorId ?? 'd1')
  const [tab, setTab] = useState<'waiting' | 'done' | 'all'>('waiting')
  const mine = useMemo(() => all.filter((v) => v.doctorId === docId && isToday(v.createdAt)).sort((a, b) => a.token - b.token), [all, docId])
  const current = mine.find((v) => v.status === 'in-consult')
  const waiting = mine.filter((v) => v.status === 'waiting')
  const [selected, setSelected] = useState<string | null>(null)
  const sel = mine.find((v) => v.id === selected) ?? current ?? null
  const toast = useToast()
  const d = doctor(docId)

  const callNext = () => {
    const next = waiting[0]
    if (!next) return toast('No one is waiting', 'info')
    startConsult(next.id)
    setSelected(next.id)
    toast(`Calling token ${next.token}: ${patients.get(next.patientId)?.name}. Display board updated.`)
  }

  const shown = tab === 'waiting' ? mine.filter((v) => v.status === 'waiting' || v.status === 'in-consult') : tab === 'done' ? mine.filter((v) => v.status === 'done' || v.status === 'no-show') : mine

  return (
    <div>
      <PageHead title={user.role === 'doctor' ? 'My OPD' : 'OPD consultations'} sub={`${d?.name} · ${d?.dept} · ${d?.room}`}>
        {user.role !== 'doctor' && <select className="select" style={{ width: 280 }} value={docId} onChange={(e) => { setDocId(e.target.value); setSelected(null) }}>{DOCTORS.filter((x) => x.fee > 0).map((x) => <option key={x.id} value={x.id}>{x.name} · {x.dept}</option>)}</select>}
        {can(user.role, 'opd.consult') && <button className="sm-btn primary lg" onClick={callNext}><Megaphone size={18} />Call next patient</button>}
      </PageHead>
      <div className="kpi-strip" style={{ marginBottom: 14 }}>
        <span className="pill"><Badge tone="amber" dot>Waiting</Badge>{waiting.length}</span>
        <span className="pill"><Badge tone="green" dot>Seen</Badge>{mine.filter((v) => v.status === 'done').length}</span>
        <span className="pill"><Badge dot>No-show</Badge>{mine.filter((v) => v.status === 'no-show').length}</span>
        <span className="pill">Average wait about {Math.max(4, Math.round(waiting.length * 6 / Math.max(1, waiting.length > 30 ? 3 : 1)))} min</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'minmax(260px, 340px) minmax(0, 1fr)', alignItems: 'start' }}>
        <div className="sm-card">
          <div style={{ padding: '6px 10px 0' }}><Tabs value={tab} tabs={[['waiting', 'Queue', waiting.length], ['done', 'Seen'], ['all', 'All']]} onChange={setTab} /></div>
          <div style={{ maxHeight: 'calc(100dvh - 330px)', minHeight: 300, overflowY: 'auto' }}>
            {shown.map((v) => {
              const p = patients.get(v.patientId)
              return (
                <div key={v.id} className={cx('list-item click', sel?.id === v.id && 'on')} onClick={() => setSelected(v.id)}>
                  <b className="mono" style={{ width: 34 }}>#{v.token}</b>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="strong ellipsis">{p?.name}</div>
                    <div className="tiny muted ellipsis">{p?.age}y {p?.gender[0]} · {v.visitType} · {time(v.createdAt)}</div>
                  </div>
                  <StatusBadge s={v.status} />
                </div>
              )
            })}
            {!shown.length && <Empty text="Queue is empty." />}
          </div>
        </div>
        {sel ? <Consult key={sel.id} v={sel} onDone={() => { setSelected(null) }} canSchedule={!!d?.surgeon} canConsult={can(user.role, 'opd.consult')} /> : (
          <div className="sm-card"><Empty icon={<Stethoscope size={32} />} text="Press “Call next patient” or pick someone from the queue." /></div>
        )}
      </div>
    </div>
  )
}

const FREQS = ['1-0-1', '1-1-1', '1-0-0', '0-0-1', '1-1-1-1', 'SOS']

function Consult({ v, onDone, canSchedule, canConsult }: { v: Visit; onDone: () => void; canSchedule: boolean; canConsult: boolean }) {
  const toast = useToast()
  const p = patients.get(v.patientId)!
  const [vitals, setVitals] = useState<Vitals>(v.vitals ?? {})
  const [complaint, setComplaint] = useState(v.complaint ?? '')
  const [diagnosis, setDiagnosis] = useState(v.diagnosis ?? '')
  const [advice, setAdvice] = useState(v.advice ?? '')
  const [rx, setRx] = useState<RxItem[]>(v.rx.length ? v.rx : [])
  const [orders, setOrders] = useState<string[]>(v.orders)
  const [followUp, setFollowUp] = useState(v.followUp ?? '')
  const [admit, setAdmit] = useState(!!v.admitAdvised)
  const [ot, setOt] = useState(false)
  const [tab, setTab] = useState<'consult' | 'history' | 'notes'>('consult')
  const readOnly = v.status === 'done' || !canConsult
  const history = useMemo(() => timelineFor(p.id).filter((t) => t.kind !== 'Registration').slice(0, 12), [p.id])
  useEffect(() => { if (canConsult && v.status === 'waiting') startConsult(v.id) }, [v.id, v.status, canConsult])

  const save = (finish: boolean) => {
    saveConsult(v.id, { vitals, complaint, diagnosis, advice, rx: rx.filter((r) => r.drug), orders, followUp: followUp || undefined, admitAdvised: admit }, finish)
    toast(finish ? `Consultation completed. ${rx.filter((r) => r.drug).length ? 'e-Prescription sent to pharmacy. ' : ''}${orders.length ? `${orders.length} test(s) ordered.` : ''}` : 'Draft saved')
    if (finish) onDone()
  }

  return (
    <div className="sm-card view">
      <div className="card-head" style={{ flexWrap: 'wrap' }}>
        <div className="grow" style={{ minWidth: 240 }}><PatientLine p={p} /></div>
        <Badge tone="blue">Token #{v.token}</Badge>
        <Badge>{v.visitType}</Badge>
        {p.allergies && <Badge tone="red">Allergy: {p.allergies}</Badge>}
        {p.category !== 'Self' && <Badge tone="teal">{p.category}</Badge>}
      </div>
      <div style={{ padding: '0 16px' }}>
        <Tabs value={tab} tabs={[['consult', 'Consultation'], ['history', 'Past history', history.length], ['notes', 'Nurse notes']]} onChange={setTab} />
      </div>
      {tab === 'history' && (
        <div className="card-body">
          {history.length === 0 ? <Empty text="First visit to SM Imperial." /> : history.map((h, i) => (
            <div key={i} className="list-item"><Badge tone={h.tone === 'gray' ? 'gray' : h.tone as 'blue'}>{h.kind}</Badge><div className="grow"><b className="small">{h.title}</b>{h.detail && <div className="tiny muted">{h.detail}</div>}</div><span className="tiny muted">{date(h.at)}</span></div>
          ))}
        </div>
      )}
      {tab === 'notes' && <div className="card-body"><NurseNotesPanel patientId={p.id} context="OPD" refId={v.id} /></div>}
      {tab === 'consult' && (
        <div className="card-body col" style={{ gap: 16 }}>
          <section><div className="strong small muted" style={{ marginBottom: 6 }}>1 · Vitals</div><VitalsForm value={vitals} onChange={setVitals} /></section>
          <section className="form-grid">
            <Field label="2 · Complaint"><input className="input" value={complaint} onChange={(e) => setComplaint(e.target.value)} disabled={readOnly} /></Field>
            <Field label="3 · Diagnosis"><input className="input" list="smi-dx" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} disabled={readOnly} placeholder="Start typing" /></Field>
          </section>
          <datalist id="smi-dx">{['Hypertension', 'Type 2 diabetes', 'Viral fever', 'Coronary artery disease', 'Osteoarthritis knee', 'GERD', 'Bronchial asthma', 'Migraine', 'UTI', 'Anaemia', 'Hypothyroidism', 'Cholelithiasis', 'Inguinal hernia'].map((x) => <option key={x} value={x} />)}</datalist>

          <section>
            <div className="row between" style={{ marginBottom: 6 }}><span className="strong small muted"><Pill size={14} style={{ verticalAlign: -2 }} /> 4 · e-Prescription</span>{!readOnly && <button className="sm-btn sm" onClick={() => setRx([...rx, { drug: '', dose: '1 tab', freq: '1-0-1', days: 5 }])}><Plus size={14} />Add medicine</button>}</div>
            <div className="col" style={{ gap: 6 }}>
              {rx.map((r, i) => (
                <div key={i} className="rx-row">
                  <input className="input sm" list="smi-drugs" placeholder="Medicine" value={r.drug} disabled={readOnly} onChange={(e) => setRx(rx.map((x, k) => (k === i ? { ...x, drug: e.target.value } : x)))} />
                  <input className="input sm" value={r.dose} disabled={readOnly} onChange={(e) => setRx(rx.map((x, k) => (k === i ? { ...x, dose: e.target.value } : x)))} />
                  <select className="select sm" value={r.freq} disabled={readOnly} onChange={(e) => setRx(rx.map((x, k) => (k === i ? { ...x, freq: e.target.value } : x)))}>{FREQS.map((f) => <option key={f}>{f}</option>)}</select>
                  <input className="input sm" type="number" min={1} value={r.days} disabled={readOnly} onChange={(e) => setRx(rx.map((x, k) => (k === i ? { ...x, days: Number(e.target.value) } : x)))} title="Days" />
                  {!readOnly && <button className="sm-btn sm icon ghost" onClick={() => setRx(rx.filter((_, k) => k !== i))} aria-label="Remove"><Trash2 size={14} /></button>}
                </div>
              ))}
              {!rx.length && <div className="small muted">No medicines added.</div>}
            </div>
            <datalist id="smi-drugs">{DRUGS.map(([d]) => <option key={d} value={d} />)}</datalist>
          </section>

          <section>
            <div className="strong small muted" style={{ marginBottom: 6 }}><FlaskConical size={14} style={{ verticalAlign: -2 }} /> 5 · Tests (sent to lab and radiology instantly)</div>
            <div className="row wrap" style={{ gap: 6 }}>
              {[...LAB_TESTS.slice(0, 9), ...RAD_TESTS.slice(0, 8)].map(([t]) => (
                <button key={t} disabled={readOnly} className={cx('sm-step', orders.includes(t) && 'done')} onClick={() => setOrders(orders.includes(t) ? orders.filter((x) => x !== t) : [...orders, t])}>{orders.includes(t) && <CheckCircle2 size={14} />}{t}</button>
              ))}
            </div>
          </section>

          <section className="form-grid">
            <Field label="6 · Advice"><textarea className="textarea" value={advice} onChange={(e) => setAdvice(e.target.value)} disabled={readOnly} placeholder="Diet, rest, precautions" /></Field>
            <div className="col" style={{ gap: 10 }}>
              <Field label="Follow-up date"><input className="input" type="date" value={followUp} onChange={(e) => setFollowUp(e.target.value)} disabled={readOnly} /></Field>
              <label className="check"><input type="checkbox" checked={admit} onChange={(e) => setAdmit(e.target.checked)} disabled={readOnly} /><BedDouble size={16} />Advise admission (reception and nursing are notified)</label>
            </div>
          </section>

          {!canConsult && <div className="notice tone-blue">View only. Consultations are written by the treating doctor.</div>}
          {!readOnly ? (
            <div className="row wrap" style={{ justifyContent: 'flex-end', gap: 8, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
              {canSchedule && <button className="sm-btn" onClick={() => setOt(true)}><Scissors size={16} />Book surgery</button>}
              <button className="sm-btn" onClick={() => { setVisitStatus(v.id, 'no-show'); toast('Marked as no-show'); onDone() }}>No-show</button>
              <button className="sm-btn" onClick={() => save(false)}>Save draft</button>
              <button className="sm-btn primary lg" onClick={() => save(true)}><CheckCircle2 size={18} />Complete consultation<ChevronRight size={16} /></button>
            </div>
          ) : v.status === 'done' && <div className="notice tone-green"><History size={16} />Completed {ago(v.doneAt)}. Prescription and orders were sent automatically.</div>}
        </div>
      )}
      {ot && <ScheduleSurgeryModal patientId={p.id} surgeonId={v.doctorId} onClose={() => setOt(false)} />}
    </div>
  )
}
