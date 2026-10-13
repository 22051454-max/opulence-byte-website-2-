'use client'

import { BadgeCheck, CreditCard, FileCheck2, IndianRupee, Plus, Printer, Receipt, Search, ShieldCheck, Trash2, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { HOSPITAL, INSURERS, LAB_TESTS, RAD_TESTS, TPAS } from '../core/master'
import { useRows } from '../core/store'
import type { Bill, ClaimStatus } from '../core/types'
import { billTotal, cx, date, dateTime, inr, inrShort, isToday } from '../core/util'
import { addItem, attachClaim, bills, billStatus, due, finalise, newBill, paid, pay, removeItem, setDiscount, updateClaim } from '../services/billing'
import { patients } from '../services/patients'
import { Badge, CodeMark, Drawer, Empty, Field, Modal, PageHead, Seg, Stat, Tabs, useToast, type Tone } from '../ui/kit'
import { PatientLine, PatientPicker } from '../ui/patient'
import { Logo } from '../ui/Logo'

const CATALOG: [string, string, number][] = [
  ['Registration charges', 'Admission', 200], ['Doctor visit', 'Professional fee', 1200], ['Nursing care (per day)', 'Nursing', 900],
  ['ICU monitoring (per day)', 'Room', 8000], ['Ventilator (per day)', 'Equipment', 6000], ['Dialysis session', 'Procedure', 3500],
  ['Physiotherapy session', 'Procedure', 600], ['Ambulance (within city)', 'Ambulance', 1500], ['Dressing', 'Procedure', 400],
  ['Blood unit (PRBC)', 'Blood bank', 1450], ['Diet & nutrition (per day)', 'Dietary', 450],
  ...LAB_TESTS.slice(0, 6).map(([t, p]) => [t, 'Laboratory', p] as [string, string, number]),
  ...RAD_TESTS.slice(0, 6).map(([t, p]) => [t, 'Radiology', p] as [string, string, number]),
]
const CLAIM_TONE: Record<ClaimStatus, Tone> = { 'Not needed': 'gray', 'Pre-auth sent': 'amber', 'Query raised': 'red', 'Pre-auth approved': 'blue', 'Claim submitted': 'violet', Settled: 'green', Rejected: 'red' }
const LANES: ClaimStatus[] = ['Pre-auth sent', 'Query raised', 'Pre-auth approved', 'Claim submitted', 'Settled']

/** Billing and TPA together: one bill per episode, the insurance claim lives on that same bill. */
export default function Billing() {
  const all = useRows(bills)
  useRows(patients)
  const [tab, setTab] = useState<'bills' | 'tpa'>('bills')
  const [filter, setFilter] = useState<'Due' | 'Insurance' | 'Paid' | 'All'>('Due')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const stats = useMemo(() => {
    let collected = 0, outstanding = 0
    for (const b of all) { for (const p of b.payments) if (isToday(p.at)) collected += p.amount; outstanding += due(b) }
    const claims = all.filter((b) => b.claim && b.claim.status !== 'Not needed')
    return { collected, outstanding, pending: claims.filter((b) => !['Settled', 'Rejected'].includes(b.claim!.status)), queries: claims.filter((b) => b.claim!.status === 'Query raised').length, settledAmt: claims.filter((b) => b.claim!.status === 'Settled').reduce((s, b) => s + (b.claim!.approved ?? 0), 0) }
  }, [all])

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return all.filter((b) => {
      if (filter === 'Due' && due(b) === 0) return false
      if (filter === 'Paid' && due(b) > 0) return false
      if (filter === 'Insurance' && !b.claim) return false
      if (!s) return true
      const p = patients.get(b.patientId)
      return b.billNo.toLowerCase().includes(s) || !!p && (p.name.toLowerCase().includes(s) || p.uhid.toLowerCase().includes(s))
    }).slice(0, 80)
  }, [all, filter, q])

  return (
    <div>
      <PageHead title="Billing & TPA" sub="Charges from every department land on the patient's bill automatically. Insurance pre-auth and claims are tracked on the same bill.">
        <button className="sm-btn primary" onClick={() => setCreating(true)}><Plus size={16} />New bill</button>
      </PageHead>
      <div className="grid g4 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="Collected today" value={stats.collected} format={inrShort} icon={<IndianRupee size={17} />} tone="green" />
        <Stat i={1} label="Outstanding" value={stats.outstanding} format={inrShort} icon={<Wallet size={17} />} tone="amber" />
        <Stat i={2} label="Claims in progress" value={stats.pending.length} icon={<ShieldCheck size={17} />} tone="blue" sub={`${stats.queries} queries from insurers`} onClick={() => setTab('tpa')} />
        <Stat i={3} label="Settled by insurers" value={stats.settledAmt} format={inrShort} icon={<BadgeCheck size={17} />} tone="violet" />
      </div>
      <Tabs value={tab} tabs={[['bills', 'Bills'], ['tpa', 'TPA & insurance desk', stats.pending.length]]} onChange={setTab} />

      {tab === 'bills' && (
        <>
          <div className="row wrap between" style={{ marginBottom: 12 }}>
            <Seg value={filter} options={['Due', 'Insurance', 'Paid', 'All'] as const} onChange={setFilter} />
            <div className="row" style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--faint)' }} /><input className="input sm" style={{ paddingLeft: 30, width: 260 }} placeholder="Bill no, patient or UHID" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          </div>
          <div className="sm-card table-wrap">
            <table className="t">
              <thead><tr><th>Bill</th><th>Patient</th><th>Type</th><th>Total</th><th>Paid</th><th>Due</th><th>Insurance</th></tr></thead>
              <tbody>
                {list.map((b) => (
                  <tr key={b.id} className="click" onClick={() => setOpen(b.id)}>
                    <td><b className="mono small">{b.billNo}</b><div className="tiny muted">{date(b.createdAt)}</div></td>
                    <td><PatientLine p={patients.get(b.patientId)} /></td>
                    <td><Badge tone={b.source === 'IPD' ? 'violet' : b.source === 'Emergency' ? 'red' : 'blue'}>{b.source}</Badge></td>
                    <td><b>{inr(billTotal(b))}</b></td>
                    <td className="small">{inr(paid(b))}</td>
                    <td>{due(b) ? <Badge tone="amber">{inr(due(b))}</Badge> : <Badge tone="green">Paid</Badge>}</td>
                    <td>{b.claim ? <Badge tone={CLAIM_TONE[b.claim.status]}>{b.claim.status}</Badge> : <span className="muted small">Self pay</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length && <Empty text="No bills match." />}
          </div>
        </>
      )}

      {tab === 'tpa' && (
        <div className="grid g5" style={{ alignItems: 'start' }}>
          {LANES.map((lane) => {
            const cards = all.filter((b) => b.claim?.status === lane).slice(0, 25)
            return (
              <div key={lane} className="lane">
                <div className="lane-head"><Badge tone={CLAIM_TONE[lane]} dot>{lane}</Badge><span className="small muted right">{all.filter((b) => b.claim?.status === lane).length}</span></div>
                {cards.map((b) => (
                  <div key={b.id} className="er-card" style={{ ['--c' as string]: `var(--${CLAIM_TONE[lane] === 'blue' ? 'primary' : CLAIM_TONE[lane]})` }} onClick={() => setOpen(b.id)}>
                    <b className="ellipsis" style={{ display: 'block' }}>{patients.get(b.patientId)?.name}</b>
                    <div className="tiny muted ellipsis">{b.claim!.insurer} · {b.claim!.tpa}</div>
                    <div className="row between" style={{ marginTop: 6 }}><b className="small">{inr(billTotal(b))}</b>{b.claim!.approved ? <span className="tiny" style={{ color: 'var(--green)' }}>OK {inrShort(b.claim!.approved)}</span> : null}</div>
                  </div>
                ))}
                {!cards.length && <div className="small muted" style={{ padding: 8 }}>None</div>}
              </div>
            )
          })}
        </div>
      )}

      {open && <BillDrawer id={open} onClose={() => setOpen(null)} />}
      {creating && <NewBillModal onClose={() => setCreating(false)} onDone={(id) => { setCreating(false); setOpen(id) }} />}
    </div>
  )
}

function NewBillModal({ onClose, onDone }: { onClose: () => void; onDone: (id: string) => void }) {
  const [pid, setPid] = useState<string | null>(null)
  const [src, setSrc] = useState<Bill['source']>('OPD')
  return (
    <Modal title="New bill" icon={<Receipt size={18} />} onClose={onClose} width={600}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className="sm-btn primary" disabled={!pid} onClick={() => onDone(newBill(pid!, src).id)}>Create bill</button></>}>
      <div className="col" style={{ gap: 14 }}>
        {pid ? <div className="sm-card pad"><PatientLine p={patients.get(pid)} right={<button className="sm-btn sm" onClick={() => setPid(null)}>Change</button>} /></div> : <PatientPicker autoFocus onPick={(p) => setPid(p.id)} />}
        <Field label="Bill type"><Seg value={src} options={['OPD', 'IPD', 'Emergency', 'Diagnostics', 'Pharmacy'] as const} onChange={setSrc} /></Field>
      </div>
    </Modal>
  )
}

function BillDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast()
  useRows(bills)
  const b = bills.get(id)
  const [item, setItem] = useState(0)
  const [qty, setQty] = useState(1)
  const [amount, setAmount] = useState<number | ''>('')
  const [mode, setMode] = useState<'UPI' | 'Card' | 'Cash' | 'Net banking'>('UPI')
  const [ins, setIns] = useState({ insurer: INSURERS[0], tpa: TPAS[0], policyNo: '' })
  const [note, setNote] = useState('')
  const [approved, setApproved] = useState<number | ''>('')
  const [print, setPrint] = useState(false)
  if (!b) return null
  const p = patients.get(b.patientId)!
  const total = billTotal(b), balance = due(b)
  const locked = !!b.finalised
  return (
    <Drawer title={`Bill ${b.billNo}`} sub={`${b.source} · opened ${dateTime(b.createdAt)}${locked ? ' · final' : ''}`} onClose={onClose} width={820} actions={<button className="sm-btn sm" onClick={() => setPrint(true)}><Printer size={14} />Invoice</button>}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad row wrap">
          <div className="grow" style={{ minWidth: 240 }}><PatientLine p={p} /></div>
          <div style={{ textAlign: 'right' }}><div className="tiny muted strong">TOTAL</div><b style={{ fontSize: 22 }}>{inr(total)}</b></div>
          <div style={{ textAlign: 'right' }}><div className="tiny muted strong">BALANCE</div><b style={{ fontSize: 22, color: balance ? 'var(--amber)' : 'var(--green)' }}>{inr(balance)}</b></div>
        </div>

        <div className="sm-card">
          <div className="card-head"><Receipt size={16} className="muted" /><h3>Charges</h3><Badge>{billStatus(b)}</Badge></div>
          <div className="table-wrap">
            <table className="t">
              <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Rate</th><th>Amount</th><th /></tr></thead>
              <tbody>
                {b.items.map((it, i) => (
                  <tr key={i}><td className="small"><b>{it.desc}</b></td><td className="small muted">{it.category}</td><td>{it.qty}</td><td className="small">{inr(it.rate)}</td><td><b>{inr(it.qty * it.rate)}</b></td><td>{!locked && <button className="sm-btn ghost sm icon" onClick={() => removeItem(b.id, i)} aria-label="Remove"><Trash2 size={14} /></button>}</td></tr>
                ))}
                {b.discount > 0 && <tr><td colSpan={4}>Discount</td><td><b style={{ color: 'var(--green)' }}>− {inr(b.discount)}</b></td><td /></tr>}
              </tbody>
            </table>
          </div>
          {!locked && (
            <div className="card-body row wrap" style={{ borderTop: '1px solid var(--border)' }}>
              <select className="select sm" style={{ maxWidth: 320 }} value={item} onChange={(e) => setItem(Number(e.target.value))}>{CATALOG.map(([d, , r], i) => <option key={d} value={i}>{d} · {inr(r)}</option>)}</select>
              <input className="input sm" type="number" min={1} style={{ width: 70 }} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              <button className="sm-btn sm" onClick={() => { const [desc, category, rate] = CATALOG[item]; addItem(b.id, { desc, category, rate, qty }); toast('Charge added') }}><Plus size={14} />Add charge</button>
              <button className="sm-btn sm ghost right" onClick={() => { const d = Number(prompt('Discount amount (₹)', String(b.discount)) ?? b.discount); if (!Number.isNaN(d)) setDiscount(b.id, Math.max(0, d)) }}>Discount</button>
            </div>
          )}
        </div>

        <div className="grid g2">
          <div className="sm-card pad col" style={{ gap: 10 }}>
            <div className="row"><CreditCard size={16} /><b>Collect payment</b></div>
            <Seg value={mode} options={['UPI', 'Card', 'Cash', 'Net banking'] as const} onChange={setMode} />
            {mode === 'UPI' && <div className="row"><CodeMark text={`${b.billNo}-${balance}`} /><div className="small muted">Patient scans to pay {inr(balance)} by UPI. Receipt is sent by SMS.</div></div>}
            <div className="row"><input className="input" type="number" placeholder={String(balance)} value={amount} onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))} /><button className="sm-btn success" disabled={balance === 0} onClick={() => { const a = amount === '' ? balance : Math.min(balance, amount); if (a <= 0) return; pay(b.id, a, mode); setAmount(''); toast(`${inr(a)} received by ${mode}`) }}>Receive</button></div>
            {b.payments.map((x, i) => <div key={i} className="row small"><Badge tone="green">{x.mode}</Badge><span className="grow">{inr(x.amount)} · {x.by}</span><span className="muted tiny">{dateTime(x.at)}</span></div>)}
            {!locked && <button className="sm-btn sm" onClick={() => { finalise(b.id); toast('Final bill raised') }}><FileCheck2 size={14} />Raise final bill</button>}
          </div>

          <div className="sm-card pad col" style={{ gap: 10 }}>
            <div className="row"><ShieldCheck size={16} /><b>Insurance / TPA</b>{b.claim && <Badge tone={CLAIM_TONE[b.claim.status]}>{b.claim.status}</Badge>}</div>
            {!b.claim ? (
              <>
                <div className="small muted">Self pay. Add insurance to start a cashless claim.</div>
                <select className="select sm" value={ins.insurer} onChange={(e) => setIns({ ...ins, insurer: e.target.value })}>{[...INSURERS, 'Ayushman Bharat PM-JAY', 'CGHS', 'ECHS'].map((x) => <option key={x}>{x}</option>)}</select>
                <select className="select sm" value={ins.tpa} onChange={(e) => setIns({ ...ins, tpa: e.target.value })}>{TPAS.map((x) => <option key={x}>{x}</option>)}</select>
                <input className="input sm" placeholder="Policy / sm-card number" value={ins.policyNo} onChange={(e) => setIns({ ...ins, policyNo: e.target.value })} />
                <button className="sm-btn sm primary" onClick={() => { attachClaim(b.id, ins.insurer, ins.tpa, ins.policyNo); toast('Insurance added') }}>Add insurance</button>
              </>
            ) : (
              <>
                <div className="small"><b>{b.claim.insurer}</b> via {b.claim.tpa} · Policy {b.claim.policyNo || '—'}</div>
                <div className="small">Requested {inr(b.claim.requested)}{b.claim.approved ? <> · Approved <b style={{ color: 'var(--green)' }}>{inr(b.claim.approved)}</b></> : null}</div>
                <input className="input sm" placeholder="Note (e.g. query reply sent)" value={note} onChange={(e) => setNote(e.target.value)} />
                <input className="input sm" type="number" placeholder="Approved amount (₹)" value={approved} onChange={(e) => setApproved(e.target.value === '' ? '' : Number(e.target.value))} />
                <div className="row wrap" style={{ gap: 6 }}>
                  {(['Pre-auth sent', 'Query raised', 'Pre-auth approved', 'Claim submitted', 'Settled', 'Rejected'] as ClaimStatus[]).map((s) => (
                    <button key={s} className={cx('sm-btn sm', b.claim!.status === s && 'primary')} onClick={() => { updateClaim(b.id, s, note, approved === '' ? undefined : approved); setNote(''); toast(`Claim: ${s}`) }}>{s}</button>
                  ))}
                </div>
                <div className="col" style={{ gap: 4, maxHeight: 140, overflowY: 'auto' }}>{b.claim.updates.map((u, i) => <div key={i} className="tiny"><span className="muted">{dateTime(u.at)}</span> · {u.text}</div>)}</div>
              </>
            )}
          </div>
        </div>
      </div>
      {print && (
        <Modal title="Invoice" onClose={() => setPrint(false)} width={760} footer={<button className="sm-btn primary" onClick={() => window.print()}><Printer size={16} />Print or save as PDF</button>}>
          <div className="sheet">
            <div className="row" style={{ borderBottom: '2px solid #0a1a36', paddingBottom: 12, marginBottom: 14 }}><Logo size={48} /><div className="grow"><h2>{HOSPITAL.name}</h2><div className="small" style={{ color: '#5a6a80' }}>{HOSPITAL.address} · {HOSPITAL.phone}</div></div><div style={{ textAlign: 'right' }}><b>INVOICE</b><div className="mono small">{b.billNo}</div></div></div>
            <div className="small" style={{ marginBottom: 10 }}><b>{p.name}</b> · {p.uhid} · {p.age}y {p.gender} · {p.category}{b.claim ? ` · ${b.claim.insurer}` : ''}</div>
            <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>
              {b.items.map((it, i) => <tr key={i}><td>{it.desc}</td><td>{it.qty}</td><td>{inr(it.rate)}</td><td>{inr(it.qty * it.rate)}</td></tr>)}
              {b.discount > 0 && <tr><td colSpan={3}>Discount</td><td>− {inr(b.discount)}</td></tr>}
              <tr><th colSpan={3}>Total</th><th>{inr(total)}</th></tr>
              <tr><td colSpan={3}>Paid</td><td>{inr(paid(b))}</td></tr>
              <tr><th colSpan={3}>Balance</th><th>{inr(balance)}</th></tr>
            </tbody></table>
            <div className="small" style={{ color: '#5a6a80', marginTop: 12 }}>Healthcare services are exempt from GST. Computer-generated invoice, no signature required.</div>
          </div>
        </Modal>
      )}
    </Drawer>
  )
}
