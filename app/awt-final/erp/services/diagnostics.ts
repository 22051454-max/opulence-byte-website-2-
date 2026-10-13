'use client'

import { bus } from '../core/bus'
import { LAB_TESTS, RAD_TESTS } from '../core/master'
import { collection } from '../core/store'
import type { DiagOrder } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, me, notify } from './identity'
import { activeAdmission } from './ipd'
import { patientName } from './patients'

/** Diagnostics service: laboratory (LIS) and radiology (RIS) orders and reports. */

export const diagOrders = collection<DiagOrder>('diag-orders')

export const testPrice = (test: string) => (LAB_TESTS.find((t) => t[0] === test) ?? RAD_TESTS.find((t) => t[0] === test))?.[1] ?? 500
export const testKind = (test: string): DiagOrder['kind'] => (RAD_TESTS.some((t) => t[0] === test) ? 'Radiology' : 'Lab')

export function orderTest(patientId: string, test: string, source: DiagOrder['source'], priority: DiagOrder['priority']) {
  const o = diagOrders.insert({ id: uid('o'), patientId, kind: testKind(test), test, orderedBy: me().name, source, priority, at: nowIso(), status: 'ordered' })
  const a = activeAdmission(patientId)
  bus.emit('charge', { patientId, desc: test, category: o.kind === 'Lab' ? 'Laboratory' : 'Radiology', rate: testPrice(test), source: a ? 'IPD' : 'Diagnostics', ref: a?.id })
  if (priority === 'STAT') notify(`STAT ${o.kind.toLowerCase()} order: ${test} for ${patientName(patientId)}`, 'danger', [o.kind === 'Lab' ? 'lab' : 'radiology'], o.kind === 'Lab' ? 'lab' : 'radiology')
  return o
}

export function advanceOrder(id: string, status: DiagOrder['status'], result?: string, critical?: boolean) {
  const o = diagOrders.update(id, { status, ...(result !== undefined ? { result, critical, reportedAt: nowIso() } : {}) })
  if (!o) return
  log(`${o.kind} ${status}`, `${o.test} · ${patientName(o.patientId)}`)
  if (critical) notify(`CRITICAL result: ${o.test} for ${patientName(o.patientId)}: ${result}`, 'danger', ['doctor', 'nurse', 'admin', 'superadmin'])
}
