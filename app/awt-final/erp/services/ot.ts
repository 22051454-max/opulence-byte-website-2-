'use client'

import { bus } from '../core/bus'
import { collection } from '../core/store'
import type { OtRoom, Surgery } from '../core/types'
import { nowIso, uid } from '../core/util'
import { doctorName } from './doctors'
import { log, notify } from './identity'
import { activeAdmission } from './ipd'
import { patientName } from './patients'

/** Operation theatre service: 4 OTs, scheduling, WHO checklist and live status. */

export const otRooms = collection<OtRoom>('ot-rooms')
export const surgeries = collection<Surgery>('surgeries')

export function scheduleSurgery(s: Omit<Surgery, 'id' | 'status' | 'checklist'>) {
  const clash = surgeries.all().find((x) => x.ot === s.ot && x.status !== 'cancelled' && x.status !== 'completed' && overlaps(x.start, x.durationMin, s.start, s.durationMin))
  if (clash) return `OT ${s.ot} is booked then for ${clash.procedure}.`
  const row = surgeries.insert({ ...s, id: uid('s'), status: 'scheduled', checklist: { signIn: false, timeOut: false, signOut: false } })
  notify(`${s.priority} surgery booked in OT ${s.ot}: ${s.procedure}`, s.priority === 'Emergency' ? 'danger' : 'info', ['ot', 'nurse', 'admin', 'superadmin'], 'ot')
  log('Surgery scheduled', `${s.procedure} · OT ${s.ot} · ${patientName(s.patientId)}`)
  return row
}

const overlaps = (a: string, am: number, b: string, bm: number) => {
  const as = new Date(a).getTime(), bs = new Date(b).getTime()
  return as < bs + bm * 60000 && bs < as + am * 60000
}

export function advanceSurgery(id: string, status: Surgery['status']) {
  const s = surgeries.get(id)
  if (!s) return
  const patch: Partial<Surgery> = { status }
  if (status === 'in-progress') { patch.startedAt = nowIso(); setOtStatus(s.ot, 'in-use') }
  if (status === 'recovery') { patch.endedAt = nowIso(); setOtStatus(s.ot, 'cleaning') }
  if (status === 'completed' && !s.endedAt) patch.endedAt = nowIso()
  surgeries.update(id, patch)
  if (status === 'recovery') {
    const mins = Math.max(30, Math.round((Date.now() - new Date(s.startedAt ?? s.start).getTime()) / 60000))
    const a = activeAdmission(s.patientId)
    bus.emit('charge', { patientId: s.patientId, desc: `OT charges: ${s.procedure} (${mins} min)`, category: 'Operation theatre', rate: 18000 + mins * 120, source: a ? 'IPD' : 'OT', ref: a?.id ?? s.id })
    bus.emit('charge', { patientId: s.patientId, desc: `Surgeon fee: ${doctorName(s.surgeonId)}`, category: 'Professional fee', rate: 35000, source: a ? 'IPD' : 'OT', ref: a?.id ?? s.id })
    bus.emit('charge', { patientId: s.patientId, desc: `Anaesthesia (${s.anaesthesia}): ${doctorName(s.anaesthetistId)}`, category: 'Professional fee', rate: 12000, source: a ? 'IPD' : 'OT', ref: a?.id ?? s.id })
  }
  log('Surgery status', `${s.procedure} → ${status}`)
}

export function toggleChecklist(id: string, key: keyof Surgery['checklist']) {
  surgeries.update(id, (s) => ({ checklist: { ...s.checklist, [key]: !s.checklist[key] } }))
}

export function setOtStatus(number: number, status: OtRoom['status']) {
  const room = otRooms.all().find((r) => r.number === number)
  if (room) otRooms.update(room.id, { status })
}
