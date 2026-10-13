'use client'

import { bus } from '../core/bus'
import { WARDS } from '../core/master'
import { collection } from '../core/store'
import type { Admission, Bed, DischargeSummary } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, me, notify } from './identity'
import { patientName } from './patients'

/** IPD service: beds, admissions, transfers and discharge. */

export const beds = collection<Bed>('beds')
export const admissions = collection<Admission>('admissions')

export const ward = (id: string) => WARDS.find((w) => w.id === id)

export function admit(patientId: string, doctorId: string, bedId: string, diagnosis: string, source: Admission['source']) {
  const bed = beds.get(bedId)
  if (!bed || bed.status !== 'free') return 'That bed is no longer free.'
  const a = admissions.insert({ id: uid('ad'), patientId, doctorId, bedId, admittedAt: nowIso(), diagnosis, source, status: 'admitted' })
  beds.update(bedId, { status: 'occupied', admissionId: a.id })
  const w = ward(bed.ward)!
  bus.emit('charge', { patientId, desc: `Admission & registration`, category: 'Admission', rate: 1000, source: 'IPD', ref: a.id })
  bus.emit('charge', { patientId, desc: `${w.name} bed charges (per day)`, category: 'Room', rate: w.rate, source: 'IPD', ref: a.id })
  notify(`${patientName(patientId)} admitted to ${w.name} bed ${bed.number}`, 'info', ['nurse', 'billing', 'admin', 'superadmin'], 'ipd')
  log('Patient admitted', `${patientName(patientId)} → ${w.name} ${bed.number}`)
  return a
}

export function transferBed(admissionId: string, toBedId: string) {
  const a = admissions.get(admissionId)
  const to = beds.get(toBedId)
  if (!a || !to || to.status !== 'free') return 'That bed is no longer free.'
  beds.update(a.bedId, { status: 'cleaning', admissionId: undefined })
  beds.update(toBedId, { status: 'occupied', admissionId })
  admissions.update(admissionId, { bedId: toBedId })
  const w = ward(to.ward)!
  bus.emit('charge', { patientId: a.patientId, desc: `${w.name} bed charges (per day)`, category: 'Room', rate: w.rate, source: 'IPD', ref: a.id })
  log('Bed transfer', `${patientName(a.patientId)} → ${w.name} ${to.number}`)
}

export function discharge(admissionId: string, summary: Omit<DischargeSummary, 'writtenBy' | 'at'>) {
  const a = admissions.get(admissionId)
  if (!a) return
  admissions.update(admissionId, { status: 'discharged', dischargedAt: nowIso(), dischargeSummary: { ...summary, writtenBy: me().name, at: nowIso() } })
  beds.update(a.bedId, { status: 'cleaning', admissionId: undefined })
  notify(`${patientName(a.patientId)} discharged. Final bill and bed cleaning pending.`, 'success', ['billing', 'nurse', 'admin', 'superadmin'], 'billing')
  log('Patient discharged', patientName(a.patientId))
}

export function setBedStatus(bedId: string, status: Bed['status']) {
  beds.update(bedId, { status })
}

export const activeAdmission = (patientId: string) => admissions.all().find((a) => a.patientId === patientId && a.status === 'admitted')
