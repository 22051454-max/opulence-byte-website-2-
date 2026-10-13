'use client'

import { collection } from '../core/store'
import type { NoteContext, NurseNote, Vitals } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, me, notify } from './identity'
import { patientName } from './patients'

/** Nursing service: nurse notes, linked to OPD, IPD, Emergency and OT episodes. */

export const nurseNotes = collection<NurseNote>('nurse-notes')

export function addNurseNote(n: { patientId: string; context: NoteContext; refId?: string; kind: NurseNote['kind']; text: string; vitals?: Vitals }) {
  const row = nurseNotes.insert({ ...n, id: uid('nn'), by: me().name, at: nowIso() })
  if (n.kind === 'Alert') notify(`Nurse alert for ${patientName(n.patientId)}: ${n.text}`, 'danger', ['doctor', 'nurse', 'admin', 'superadmin'])
  log('Nurse note', `${patientName(n.patientId)} · ${n.context} · ${n.kind}`)
  return row
}

export const notesFor = (patientId: string) => nurseNotes.all().filter((n) => n.patientId === patientId)
