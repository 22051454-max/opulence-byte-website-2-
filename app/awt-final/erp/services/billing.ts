'use client'

import { bus, type Events } from '../core/bus'
import { collection } from '../core/store'
import type { Bill, ClaimStatus } from '../core/types'
import { billTotal, nowIso, uid } from '../core/util'
import { log, me, notify } from './identity'
import { patients } from './patients'

/** Billing & TPA service: one running bill per episode, insurer claims on the same bill. */

export const bills = collection<Bill>('bills')

let counter = 0
export function nextBillNo() {
  counter = Math.max(counter, bills.all().length) + 1
  return `SMB-${new Date().getFullYear()}-${String(counter).padStart(6, '0')}`
}

export const paid = (b: Bill) => b.payments.reduce((s, p) => s + p.amount, 0)
export const due = (b: Bill) => Math.max(0, billTotal(b) - paid(b))
export const billStatus = (b: Bill) => (due(b) === 0 && billTotal(b) > 0 ? 'Paid' : paid(b) > 0 ? 'Part paid' : 'Due')

function openBillFor(patientId: string, ref: string | undefined, source: Bill['source']) {
  const list = bills.all()
  const byRef = ref && list.find((b) => b.ref === ref && !b.finalised)
  if (byRef) return byRef
  const p = patients.get(patientId)
  const insured = p && p.category !== 'Self'
  return bills.insert({
    id: uid('b'), billNo: nextBillNo(), patientId, source, ref, items: [], createdAt: nowIso(), discount: 0, payments: [],
    claim: insured && (source === 'IPD' || source === 'OT')
      ? { insurer: p!.insurer ?? p!.category, tpa: p!.category === 'TPA / Insurance' ? 'Medi Assist' : 'Direct (no TPA)', policyNo: p!.policyNo ?? '', requested: 0, status: 'Not needed', updates: [] }
      : undefined,
  })
}

export function charge(c: Events['charge']) {
  const bill = openBillFor(c.patientId, c.ref, c.source)
  bills.update(bill.id, (b) => ({ items: [...b.items, { desc: c.desc, category: c.category, qty: c.qty ?? 1, rate: c.rate }] }))
  return bill.id
}
bus.on('charge', charge)

export function addItem(billId: string, item: Bill['items'][number]) {
  bills.update(billId, (b) => ({ items: [...b.items, item] }))
  log('Bill item added', `${item.desc} on ${bills.get(billId)?.billNo}`)
}

export function removeItem(billId: string, index: number) {
  bills.update(billId, (b) => ({ items: b.items.filter((_, i) => i !== index) }))
}

export function setDiscount(billId: string, discount: number) {
  bills.update(billId, { discount })
  log('Discount applied', `${bills.get(billId)?.billNo}: ₹${discount}`)
}

export function pay(billId: string, amount: number, mode: Bill['payments'][number]['mode']) {
  const b = bills.update(billId, (b) => ({ payments: [...b.payments, { amount, mode, at: nowIso(), by: me().name }] }))
  if (b) log('Payment received', `₹${amount} by ${mode} on ${b.billNo}`)
  return b
}

export function finalise(billId: string) {
  const b = bills.update(billId, { finalised: true })
  if (b) log('Final bill raised', b.billNo)
}

export function newBill(patientId: string, source: Bill['source']) {
  const b = bills.insert({ id: uid('b'), billNo: nextBillNo(), patientId, source, items: [], createdAt: nowIso(), discount: 0, payments: [] })
  log('Bill created', b.billNo)
  return b
}

export const CLAIM_FLOW: ClaimStatus[] = ['Not needed', 'Pre-auth sent', 'Query raised', 'Pre-auth approved', 'Claim submitted', 'Settled', 'Rejected']

export function attachClaim(billId: string, insurer: string, tpa: string, policyNo: string) {
  bills.update(billId, (b) => ({ claim: { insurer, tpa, policyNo, requested: billTotal(b), status: 'Not needed', updates: [{ at: nowIso(), text: 'Insurance details added' }] } }))
  log('Insurance attached', `${insurer} via ${tpa}`)
}

export function updateClaim(billId: string, status: ClaimStatus, note: string, approved?: number) {
  const b = bills.update(billId, (b) => ({
    claim: b.claim && {
      ...b.claim,
      status,
      requested: status === 'Pre-auth sent' || status === 'Claim submitted' ? billTotal(b) : b.claim.requested,
      approved: approved ?? b.claim.approved,
      updates: [{ at: nowIso(), text: `${status}${note ? ': ' + note : ''}` }, ...b.claim.updates],
    },
  }))
  if (!b) return
  log('TPA status changed', `${b.billNo} → ${status}`)
  if (status === 'Settled' && b.claim?.approved) pay(billId, Math.min(b.claim.approved, due(b)), 'Insurer')
  if (status === 'Query raised' || status === 'Rejected') notify(`TPA ${status.toLowerCase()} on ${b.billNo}`, 'warning', ['billing', 'admin', 'superadmin'], 'billing')
}
