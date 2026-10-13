'use client'

import { collection } from '../core/store'
import type { Patient } from '../core/types'
import { dayKey, nowIso, uid } from '../core/util'
import { log } from './identity'

/** Patient master index (MPI): one identity per person, one UHID for life. */

export const patients = collection<Patient>('patients')

export function nextUhid() {
  const d = dayKey().replace(/-/g, '').slice(2)
  const today = patients.all().filter((p) => p.uhid.startsWith(`SMI${d}`)).length
  return `SMI${d}${String(today + 1).padStart(4, '0')}`
}

export type NewPatient = Omit<Patient, 'id' | 'uhid' | 'createdAt'>

export function registerPatient(p: NewPatient) {
  const row = patients.insert({ ...p, id: uid('p'), uhid: nextUhid(), createdAt: nowIso() })
  log('Patient registered', `${row.name} · ${row.uhid}`)
  return row
}

export function updatePatient(id: string, patch: Partial<Patient>) {
  const row = patients.update(id, patch)
  if (row) log('Patient updated', `${row.name} · ${row.uhid}`)
  return row
}

/** Duplicate check before registering: same phone, or same name and age. */
export function findDuplicates(name: string, phone: string) {
  const n = name.trim().toLowerCase()
  return patients.all().filter((p) => (phone && p.phone === phone) || (n.length > 3 && p.name.toLowerCase() === n)).slice(0, 5)
}

export function searchPatients(q: string, limit = 30) {
  const s = q.trim().toLowerCase()
  if (!s) return patients.all().slice(0, limit)
  const out: Patient[] = []
  for (const p of patients.all()) {
    if (p.name.toLowerCase().includes(s) || p.uhid.toLowerCase().includes(s) || p.phone.includes(s) || p.abha?.includes(s)) {
      out.push(p)
      if (out.length >= limit) break
    }
  }
  return out
}

export const patientName = (id?: string) => patients.get(id)?.name ?? 'Unknown patient'
