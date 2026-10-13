'use client'

import { collection } from '../core/store'
import type { Complaint } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, me, notify } from './identity'

/** Security service: complaints, disputes and incidents. Readable only by Super Admin and Security Head. */

export const complaints = collection<Complaint>('complaints')

export function raiseComplaint(c: Pick<Complaint, 'kind' | 'title' | 'detail' | 'raisedBy' | 'location' | 'severity'>) {
  const ref = `SEC-${String(complaints.all().length + 1).padStart(4, '0')}`
  const row = complaints.insert({ ...c, id: uid('c'), ref, status: 'Open', at: nowIso(), raisedByUser: me().name, updates: [{ at: nowIso(), by: me().name, text: 'Reported' }] })
  notify(`New ${c.kind.toLowerCase()} ${ref}: ${c.title}`, c.severity === 'Critical' || c.severity === 'High' ? 'danger' : 'warning', ['security', 'superadmin'], 'security')
  log('Issue reported', `${ref} · ${c.kind}`)
  return row
}

export function updateComplaint(id: string, status: Complaint['status'], text: string, camera?: string) {
  const c = complaints.update(id, (c) => ({ status, camera: camera ?? c.camera, updates: [{ at: nowIso(), by: me().name, text: text || `Marked ${status}` }, ...c.updates] }))
  if (c) log('Issue updated', `${c.ref} → ${status}`)
}
