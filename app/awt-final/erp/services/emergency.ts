'use client'

import { bus } from '../core/bus'
import { collection } from '../core/store'
import type { ErCase, Vitals } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, notify } from './identity'
import { patientName } from './patients'

/** Emergency service: triage, bays and disposition. */

export const erCases = collection<ErCase>('er-cases')

export function erRegister(patientId: string, data: Pick<ErCase, 'triage' | 'mode' | 'complaint' | 'mlc'> & { vitals?: Vitals }) {
  const used = new Set(erCases.all().filter((c) => c.status !== 'closed').map((c) => c.bay))
  const pool = data.triage === 'red' ? ['Resus 1', 'Resus 2', 'Resus 3'] : []
  const bay = [...pool, 'Bay 1', 'Bay 2', 'Bay 3', 'Bay 4', 'Bay 5', 'Bay 6', 'Bay 7', 'Bay 8', 'Bay 9', 'Bay 10'].find((b) => !used.has(b))
  const c = erCases.insert({ id: uid('er'), patientId, arrivedAt: nowIso(), status: data.triage === 'red' ? 'treatment' : 'waiting', bay, doctorId: data.triage === 'red' ? 'd8' : undefined, ...data })
  bus.emit('charge', { patientId, desc: 'Emergency registration & triage', category: 'Emergency', rate: 500, source: 'Emergency', ref: c.id })
  if (data.triage === 'red') notify(`RED triage: ${patientName(patientId)} in ${bay ?? 'ER'} · ${data.complaint}`, 'danger', ['emergency', 'doctor', 'nurse', 'admin', 'superadmin'], 'emergency')
  log('Emergency registered', `${patientName(patientId)} · ${data.triage.toUpperCase()} · ${data.complaint}`)
  return c
}

export function erUpdate(id: string, patch: Partial<ErCase>) {
  const c = erCases.update(id, patch)
  if (c) log('Emergency updated', `${patientName(c.patientId)}: ${Object.keys(patch).join(', ')}`)
  return c
}

export function erDispose(id: string, disposition: NonNullable<ErCase['disposition']>) {
  const c = erCases.update(id, { status: 'closed', disposition, closedAt: nowIso() })
  if (c) log('Emergency disposition', `${patientName(c.patientId)} → ${disposition}`)
  return c
}
