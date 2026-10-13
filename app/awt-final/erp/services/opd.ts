'use client'

import { bus } from '../core/bus'
import { collection } from '../core/store'
import type { Visit } from '../core/types'
import { isToday, nowIso, uid } from '../core/util'
import { orderTest } from './diagnostics'
import { doctor, doctorName } from './doctors'
import { log, notify } from './identity'
import { sendToPharmacy } from './pharmacy'
import { patientName } from './patients'

/** OPD service: appointments, token queues and consultations. */

export const visits = collection<Visit>('opd-visits')

export function bookOpd(patientId: string, doctorId: string, visitType: Visit['visitType'], complaint?: string) {
  const d = doctor(doctorId)!
  const token = visits.all().filter((v) => v.doctorId === doctorId && isToday(v.createdAt)).length + 1
  const v = visits.insert({ id: uid('v'), patientId, doctorId, dept: d.dept, token, createdAt: nowIso(), status: 'waiting', visitType, complaint, rx: [], orders: [] })
  if (d.fee) bus.emit('charge', { patientId, desc: `${visitType === 'New' ? 'Consultation' : 'Follow-up consultation'}: ${d.name}`, category: 'Consultation', rate: visitType === 'New' ? d.fee : Math.round(d.fee * 0.6), source: 'OPD', ref: v.id })
  log('OPD booked', `${patientName(patientId)} → ${d.name}, token ${token}`)
  return v
}

export function startConsult(visitId: string) {
  const v = visits.get(visitId)
  if (!v) return
  // one patient in the room at a time: anyone else "in consult" goes back to the queue
  visits.all().filter((x) => x.doctorId === v.doctorId && x.status === 'in-consult' && x.id !== visitId).forEach((x) => visits.update(x.id, { status: 'waiting' }))
  visits.update(visitId, { status: 'in-consult' })
}

export function saveConsult(visitId: string, data: Partial<Visit>, finish: boolean) {
  const v = visits.update(visitId, { ...data, ...(finish ? { status: 'done' as const, doneAt: nowIso() } : {}) })
  if (!v || !finish) return v
  if (v.rx.length) sendToPharmacy(v.patientId, v.doctorId, v.rx, 'OPD')
  v.orders.forEach((t) => orderTest(v.patientId, t, 'OPD', 'Routine'))
  log('Consultation completed', `${patientName(v.patientId)} by ${doctorName(v.doctorId)}`)
  if (v.admitAdvised) notify(`${doctorName(v.doctorId)} advised admission for ${patientName(v.patientId)}`, 'warning', ['reception', 'admin', 'nurse'], 'ipd')
  return v
}

export function setVisitStatus(visitId: string, status: Visit['status']) {
  visits.update(visitId, { status })
}
