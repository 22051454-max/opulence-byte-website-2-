'use client'

import { bus } from '../core/bus'
import { DRUGS } from '../core/master'
import { collection } from '../core/store'
import type { DrugStock, PharmacyOrder, RxItem } from '../core/types'
import { nowIso, uid } from '../core/util'
import { log, notify } from './identity'
import { activeAdmission } from './ipd'
import { patientName } from './patients'

/** Pharmacy service: e-prescriptions, dispensing and stock. */

export const stock = collection<DrugStock>('pharmacy-stock')
export const rxOrders = collection<PharmacyOrder>('pharmacy-orders')

export const drugPrice = (drug: string) => stock.all().find((s) => s.drug === drug)?.price ?? DRUGS.find((d) => d[0] === drug)?.[2] ?? 10
export const rxQty = (r: RxItem) => {
  const perDay = r.freq.startsWith('1-1-1') ? 3 : r.freq.startsWith('1-0-1') ? 2 : r.freq === 'SOS' ? 1 : r.freq.startsWith('1-1-1-1') ? 4 : 1
  return Math.max(1, perDay * (r.days || 1))
}

export function sendToPharmacy(patientId: string, doctorId: string, items: RxItem[], source: PharmacyOrder['source']) {
  return rxOrders.insert({ id: uid('rx'), patientId, doctorId, source, items, at: nowIso(), status: 'pending' })
}

export function dispense(orderId: string) {
  const o = rxOrders.get(orderId)
  if (!o || o.status === 'dispensed') return
  let amount = 0
  for (const item of o.items) {
    const qty = rxQty(item)
    const s = stock.all().find((x) => x.drug === item.drug)
    if (s) stock.update(s.id, { stock: Math.max(0, s.stock - qty) })
    amount += qty * drugPrice(item.drug)
  }
  rxOrders.update(orderId, { status: 'dispensed', dispensedAt: nowIso(), amount })
  const a = activeAdmission(o.patientId)
  bus.emit('charge', { patientId: o.patientId, desc: `Pharmacy: ${o.items.length} item(s)`, category: 'Pharmacy', rate: amount, source: a ? 'IPD' : 'Pharmacy', ref: a?.id })
  const low = stock.all().filter((s) => s.stock <= s.reorder)
  if (low.length) notify(`${low.length} medicine(s) at or below reorder level`, 'warning', ['pharmacy', 'admin'], 'pharmacy')
  log('Medicines dispensed', `${patientName(o.patientId)} · ₹${amount}`)
}

export function restock(id: string, qty: number) {
  const s = stock.update(id, (s) => ({ stock: s.stock + qty }))
  if (s) log('Stock received', `${s.drug} +${qty}`)
}
