'use client'

import { AlertTriangle, CalendarClock, PackageCheck, PackagePlus, Pill } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useRows } from '../core/store'
import { ago, date, inr, isToday } from '../core/util'
import { doctorName } from '../services/doctors'
import { dispense, drugPrice, restock, rxOrders, rxQty, stock } from '../services/pharmacy'
import { patients } from '../services/patients'
import { Badge, Empty, PageHead, Stat, Tabs, useToast } from '../ui/kit'
import { PatientLine, StatusBadge } from '../ui/patient'

export default function Pharmacy() {
  const orders = useRows(rxOrders)
  const items = useRows(stock)
  useRows(patients)
  const toast = useToast()
  const [tab, setTab] = useState<'queue' | 'done' | 'stock'>('queue')
  const pending = useMemo(() => orders.filter((o) => o.status === 'pending').sort((a, b) => (a.source === 'Emergency' ? -1 : 0) - (b.source === 'Emergency' ? -1 : 0) || a.at.localeCompare(b.at)), [orders])
  const done = useMemo(() => orders.filter((o) => o.status === 'dispensed').slice(0, 60), [orders])
  const low = items.filter((s) => s.stock <= s.reorder)
  const expiring = items.filter((s) => new Date(s.expiry).getTime() - Date.now() < 90 * 86400e3)
  const list = tab === 'queue' ? pending : done

  return (
    <div>
      <PageHead title="Pharmacy" sub="e-Prescriptions arrive here from doctors automatically. Dispense, and the bill updates itself." />
      <div className="grid g4 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="To dispense" value={pending.length} icon={<Pill size={17} />} tone="amber" />
        <Stat i={1} label="Dispensed today" value={orders.filter((o) => o.status === 'dispensed' && isToday(o.dispensedAt)).length} icon={<PackageCheck size={17} />} tone="green" />
        <Stat i={2} label="Low stock" value={low.length} icon={<AlertTriangle size={17} />} tone="red" onClick={() => setTab('stock')} />
        <Stat i={3} label="Expiring in 90 days" value={expiring.length} icon={<CalendarClock size={17} />} tone="violet" onClick={() => setTab('stock')} />
      </div>
      <Tabs value={tab} tabs={[['queue', 'Prescriptions to dispense', pending.length], ['done', 'Dispensed'], ['stock', 'Stock', items.length]]} onChange={setTab} />

      {tab !== 'stock' ? (
        <div className="col" style={{ gap: 10 }}>
          {list.slice(0, 60).map((o) => {
            const amount = o.amount ?? o.items.reduce((s, i) => s + rxQty(i) * drugPrice(i.drug), 0)
            return (
              <div key={o.id} className="sm-card pad">
                <div className="row wrap">
                  <div className="grow" style={{ minWidth: 220 }}><PatientLine p={patients.get(o.patientId)} /></div>
                  <Badge tone={o.source === 'Emergency' ? 'red' : o.source === 'IPD' ? 'violet' : 'blue'}>{o.source}</Badge>
                  <span className="small muted">{doctorName(o.doctorId)} · {ago(o.at)}</span>
                  <b>{inr(amount)}</b>
                  {o.status === 'pending' ? <button className="sm-btn primary sm" onClick={() => { dispense(o.id); toast(`Dispensed. ${inr(amount)} added to the bill.`) }}><PackageCheck size={14} />Dispense</button> : <StatusBadge s="dispensed" />}
                </div>
                <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
                  {o.items.map((i, k) => <span key={k} className="pill">{i.drug} · {i.freq} · {i.days}d · qty {rxQty(i)}</span>)}
                </div>
              </div>
            )
          })}
          {!list.length && <div className="sm-card"><Empty text="No prescriptions waiting." /></div>}
        </div>
      ) : (
        <div className="sm-card table-wrap">
          <table className="t">
            <thead><tr><th>Medicine</th><th>Form</th><th>Batch</th><th>Expiry</th><th>Price</th><th>Stock</th><th /></tr></thead>
            <tbody>
              {[...items].sort((a, b) => a.stock - a.reorder - (b.stock - b.reorder)).map((s) => (
                <tr key={s.id}>
                  <td><b>{s.drug}</b></td>
                  <td className="small">{s.form}</td>
                  <td className="mono small">{s.batch}</td>
                  <td>{new Date(s.expiry).getTime() - Date.now() < 90 * 86400e3 ? <Badge tone="violet">{date(s.expiry)}</Badge> : <span className="small">{date(s.expiry)}</span>}</td>
                  <td className="small">{inr(s.price)}</td>
                  <td>{s.stock <= s.reorder ? <Badge tone="red">{s.stock} (low)</Badge> : <b>{s.stock.toLocaleString('en-IN')}</b>}</td>
                  <td><button className="sm-btn sm" onClick={() => { restock(s.id, 500); toast(`${s.drug}: 500 received`) }}><PackagePlus size={14} />Receive 500</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
