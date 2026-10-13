'use client'

import { BedDouble, FileHeart, FlaskConical, IndianRupee, NotebookPen, Pill, Printer, Scissors, Siren, Sparkles, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DOCTORS, HOSPITAL } from '../core/master'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import { inr, inrShort, isToday } from '../core/util'
import { doctorName } from '../services/doctors'
import { admissions } from '../services/ipd'
import { nurseNotes } from '../services/nursing'
import { surgeries } from '../services/ot'
import { visits } from '../services/opd'
import { useApp } from '../ui/context'
import { Badge, Bars, PageHead, Tabs } from '../ui/kit'
import { Logo } from '../ui/Logo'
import { DischargeList } from './Ipd'
import { useHospitalStats } from './stats'

/** Auto-written summaries: daily hospital MIS, per-doctor day, discharges and nursing. */
export default function Summaries() {
  const { user } = useApp()
  const tabs: ['daily' | 'doctor' | 'discharge' | 'nursing', string][] = [['daily', 'Hospital day summary'], ['doctor', user.role === 'doctor' ? 'My day' : 'Doctor summary'], ['discharge', 'Discharge summaries']]
  if (user.role === 'nurse' || can(user.role, 'reports.all')) tabs.push(['nursing', 'Nursing summary'])
  const [tab, setTab] = useState(tabs[0][0])
  return (
    <div>
      <PageHead title="Summaries & reports" sub="Written automatically from live data. Print or save as PDF, nothing to compile by hand.">
        <button className="sm-btn" onClick={() => window.print()}><Printer size={16} />Print</button>
      </PageHead>
      <Tabs value={tab} tabs={tabs} onChange={setTab} />
      {tab === 'daily' && <Daily />}
      {tab === 'doctor' && <DoctorDay />}
      {tab === 'discharge' && <Discharges />}
      {tab === 'nursing' && <NursingSummary />}
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="sm-card pad col" style={{ gap: 8 }}><div className="row">{icon}<b>{title}</b></div><div style={{ lineHeight: 1.6 }}>{children}</div></div>
}

function Daily() {
  const { user } = useApp()
  const s = useHospitalStats()
  const finance = can(user.role, 'billing.manage') || can(user.role, 'reports.all')
  const occ = Math.round((s.ipd.occupied / s.ipd.total) * 100)
  const past = s.history.slice(0, -1)
  const avg = past.length ? Math.round(past.reduce((a, h) => a + h.opd + h.er, 0) / past.length) : 0
  return (
    <div className="col view" style={{ gap: 14 }}>
      <div className="sm-card pad row" style={{ gap: 16, background: 'linear-gradient(135deg, var(--primary-soft), var(--surface))' }}>
        <Logo size={56} />
        <div className="grow">
          <div className="row"><Sparkles size={16} color="var(--gold)" /><b>{HOSPITAL.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b></div>
          <p style={{ margin: '8px 0 0', fontSize: 15 }}>
            The hospital has looked after <b>{s.footfall.toLocaleString('en-IN')}</b> patients so far today ({s.opd.total} in OPD, {s.er.total} in emergency){avg ? `; the 14-day average is ${avg.toLocaleString('en-IN')} a day` : ''}.
            Beds are <b>{occ}%</b> full with {s.ipd.free} free. {s.ot.done} of {s.ot.today} planned surgeries are done and {s.ot.live} {s.ot.live === 1 ? 'is' : 'are'} running now.
            {s.er.red ? ` ${s.er.red} critical patient${s.er.red > 1 ? 's are' : ' is'} in emergency.` : ' No critical patient is waiting in emergency.'}
          </p>
        </div>
      </div>
      <div className="grid g3">
        <Section icon={<Stethoscope size={16} />} title="OPD">{s.opd.total} consultations: {s.opd.done} completed, {s.opd.inConsult} in progress, {s.opd.waiting} waiting, {s.opd.noShow} no-shows. {s.opd.newPts} new patients. Busiest: {s.depts.slice(0, 3).map(([d, n]) => `${d} (${n})`).join(', ')}.</Section>
        <Section icon={<Siren size={16} />} title="Emergency">{s.er.total} arrivals today, {s.er.open.length} still in the department ({s.er.red} red). {s.er.admitted} admitted from emergency.</Section>
        <Section icon={<BedDouble size={16} />} title="Wards & ICU">{s.ipd.census} inpatients. {s.ipd.admittedToday} admitted and {s.ipd.dischargedToday} discharged today. {s.ipd.cleaning} beds being cleaned.</Section>
        <Section icon={<Scissors size={16} />} title="Operation theatres">{s.ot.today} surgeries on the list across 4 OTs: {s.ot.done} completed, {s.ot.live} live, {s.ot.upcoming} still to come.</Section>
        <Section icon={<FlaskConical size={16} />} title="Diagnostics">{s.diag.reportedToday} reports released today, {s.diag.pending} pending, {s.diag.critical} critical results flagged.</Section>
        <Section icon={<Pill size={16} />} title="Pharmacy">{s.pharmacy.dispensedToday} prescriptions dispensed today, {s.pharmacy.pending} waiting.</Section>
        {finance && <Section icon={<IndianRupee size={16} />} title="Finance">Collected {inr(s.revenue)} today against {inr(s.billedToday)} billed. 14-day collections: {inrShort(s.history.reduce((a, h) => a + h.revenue, 0))}.</Section>}
      </div>
      <div className="sm-card"><div className="card-head"><h3>Patients per day, last 14 days</h3></div><div className="card-body"><Bars data={s.history.map((h, i) => ({ label: new Date(h.day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).replace(' ', ' '), value: h.opd + h.er, today: i === s.history.length - 1 }))} /></div></div>
    </div>
  )
}

function DoctorDay() {
  const { user } = useApp()
  const [doc, setDoc] = useState(user.doctorId ?? 'd1')
  const v = useRows(visits)
  const sx = useRows(surgeries)
  const adm = useRows(admissions)
  const data = useMemo(() => {
    const mine = v.filter((x) => x.doctorId === doc && isToday(x.createdAt))
    const dx = new Map<string, number>()
    mine.forEach((x) => x.diagnosis && dx.set(x.diagnosis, (dx.get(x.diagnosis) ?? 0) + 1))
    return { mine, dx: [...dx.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6), sx: sx.filter((x) => x.surgeonId === doc && isToday(x.start)), ipd: adm.filter((a) => a.doctorId === doc && a.status === 'admitted') }
  }, [v, sx, adm, doc])
  return (
    <div className="col view" style={{ gap: 14 }}>
      {user.role !== 'doctor' && <select className="select" style={{ maxWidth: 320 }} value={doc} onChange={(e) => setDoc(e.target.value)}>{DOCTORS.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>)}</select>}
      <div className="sm-card pad">
        <b>{doctorName(doc)}</b>
        <p style={{ margin: '8px 0 0', lineHeight: 1.6 }}>
          Today: {data.mine.length} OPD patients ({data.mine.filter((x) => x.status === 'done').length} seen, {data.mine.filter((x) => x.status === 'waiting').length} waiting). {data.ipd.length} inpatients under care. {data.sx.length} surgeries ({data.sx.filter((x) => x.status === 'completed' || x.status === 'recovery').length} done).
          {data.mine.filter((x) => x.admitAdvised).length ? ` Advised admission for ${data.mine.filter((x) => x.admitAdvised).length}.` : ''}
        </p>
      </div>
      <div className="grid g2">
        <div className="sm-card"><div className="card-head"><h3>Top diagnoses today</h3></div>{data.dx.map(([d, n]) => <div key={d} className="list-item"><span className="grow">{d}</span><Badge tone="blue">{n}</Badge></div>)}{!data.dx.length && <div className="sm-empty">None yet.</div>}</div>
        <div className="sm-card"><div className="card-head"><h3>Surgeries</h3></div>{data.sx.map((x) => <div key={x.id} className="list-item"><b className="small">OT {x.ot}</b><span className="grow small">{x.procedure}</span><Badge>{x.status}</Badge></div>)}{!data.sx.length && <div className="sm-empty">No surgeries today.</div>}</div>
      </div>
    </div>
  )
}

function Discharges() {
  const adm = useRows(admissions)
  const list = useMemo(() => adm.filter((a) => a.status === 'discharged').sort((a, b) => (b.dischargedAt ?? '').localeCompare(a.dischargedAt ?? '')).slice(0, 60), [adm])
  return <div className="view"><div className="notice tone-blue" style={{ marginBottom: 12 }}><FileHeart size={16} />Discharge summaries are auto-filled from diagnosis, surgeries, nurse notes and prescriptions, then signed digitally.</div><DischargeList list={list} /></div>
}

function NursingSummary() {
  const notes = useRows(nurseNotes)
  const today = notes.filter((n) => isToday(n.at))
  const by = (k: string) => today.filter((n) => n.kind === k).length
  const nurses = new Map<string, number>()
  today.forEach((n) => nurses.set(n.by, (nurses.get(n.by) ?? 0) + 1))
  return (
    <div className="grid g2 view">
      <Section icon={<NotebookPen size={16} />} title="Nursing today">{today.length} notes: {by('Vitals')} vitals rounds, {by('Medication given')} medication entries, {by('Intake / Output')} intake/output charts, {by('Alert')} alerts, {by('Handover')} handovers.</Section>
      <div className="sm-card"><div className="card-head"><h3>Notes by nurse</h3></div>{[...nurses.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => <div key={n} className="list-item"><span className="grow">{n}</span><Badge tone="teal">{c}</Badge></div>)}</div>
    </div>
  )
}
