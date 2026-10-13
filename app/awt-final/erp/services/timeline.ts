'use client'

import { doctorName } from './doctors'
import { diagOrders } from './diagnostics'
import { erCases } from './emergency'
import { admissions, beds, ward } from './ipd'
import { nurseNotes } from './nursing'
import { surgeries } from './ot'
import { visits } from './opd'
import { patients } from './patients'

/** Read model: one patient's whole journey across every service. */

export type TimelineItem = { at: string; kind: string; title: string; detail?: string; tone: 'blue' | 'teal' | 'red' | 'gold' | 'violet' | 'gray' | 'green' }

export function timelineFor(patientId: string): TimelineItem[] {
  const out: TimelineItem[] = []
  const p = patients.get(patientId)
  if (p) out.push({ at: p.createdAt, kind: 'Registration', title: `Registered · ${p.uhid}`, tone: 'gray' })
  visits.all().forEach((v) => v.patientId === patientId && out.push({ at: v.createdAt, kind: 'OPD', title: `${v.dept} · ${doctorName(v.doctorId)}`, detail: [v.complaint, v.diagnosis && `Dx: ${v.diagnosis}`].filter(Boolean).join(' · '), tone: 'blue' }))
  erCases.all().forEach((c) => c.patientId === patientId && out.push({ at: c.arrivedAt, kind: 'Emergency', title: `${c.triage.toUpperCase()} triage · ${c.complaint}`, detail: c.disposition ? `Outcome: ${c.disposition}` : 'In emergency', tone: 'red' }))
  admissions.all().forEach((a) => {
    if (a.patientId !== patientId) return
    const b = beds.get(a.bedId)
    out.push({ at: a.admittedAt, kind: 'Admission', title: `Admitted · ${ward(b?.ward ?? '')?.name ?? ''} ${b?.number ?? ''}`, detail: a.diagnosis, tone: 'violet' })
    if (a.dischargedAt) out.push({ at: a.dischargedAt, kind: 'Discharge', title: 'Discharged', detail: a.dischargeSummary?.conditionAtDischarge, tone: 'green' })
  })
  surgeries.all().forEach((s) => s.patientId === patientId && out.push({ at: s.start, kind: 'Surgery', title: `${s.procedure} · OT ${s.ot}`, detail: `${doctorName(s.surgeonId)} · ${s.status}`, tone: 'gold' }))
  diagOrders.all().forEach((o) => o.patientId === patientId && out.push({ at: o.at, kind: o.kind, title: o.test, detail: o.result ?? o.status, tone: o.critical ? 'red' : 'teal' }))
  nurseNotes.all().forEach((n) => n.patientId === patientId && out.push({ at: n.at, kind: 'Nurse note', title: `${n.kind} · ${n.context}`, detail: n.text, tone: 'teal' }))
  return out.sort((a, b) => b.at.localeCompare(a.at))
}
