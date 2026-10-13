'use client'

import { Search, UserPlus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { Patient } from '../core/types'
import { date } from '../core/util'
import { activeAdmission } from '../services/ipd'
import { patients } from '../services/patients'
import { useApp } from '../ui/context'
import { Badge, Empty, PageHead, Seg } from '../ui/kit'
import { catTone, PatientLine, RegisterModal } from '../ui/patient'

const PAGE = 50

export default function Patients() {
  const { user, openPatient } = useApp()
  const all = useRows(patients)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<'All' | Patient['category']>('All')
  const [page, setPage] = useState(0)
  const [reg, setReg] = useState(false)
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return all.filter((p) => (cat === 'All' || p.category === cat) && (!s || p.name.toLowerCase().includes(s) || p.uhid.toLowerCase().includes(s) || p.phone.includes(s) || (p.abha ?? '').includes(s)))
  }, [all, q, cat])
  const rows = filtered.slice(page * PAGE, page * PAGE + PAGE)
  return (
    <div>
      <PageHead title="Patients" sub={`${all.length.toLocaleString('en-IN')} patient records. Open anyone for their full journey, nurse notes, reports and bills.`}>
        {can(user.role, 'patient.register') && <button className="sm-btn primary" onClick={() => setReg(true)}><UserPlus size={16} />Register</button>}
      </PageHead>
      <div className="row wrap between" style={{ marginBottom: 12 }}>
        <Seg value={cat} options={['All', 'Self', 'TPA / Insurance', 'PM-JAY', 'CGHS', 'Corporate'] as const} onChange={(v) => { setCat(v); setPage(0) }} />
        <div className="row" style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--faint)' }} /><input className="input" style={{ paddingLeft: 30, width: 300 }} placeholder="Name, UHID, phone or ABHA" value={q} onChange={(e) => { setQ(e.target.value); setPage(0) }} /></div>
      </div>
      <div className="sm-card table-wrap">
        <table className="t">
          <thead><tr><th>Patient</th><th>Phone</th><th>ABHA</th><th>Payment</th><th>Registered</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="click" onClick={() => openPatient(p.id)}>
                <td><PatientLine p={p} /></td>
                <td className="small mono">{p.phone || '—'}</td>
                <td className="small mono">{p.abha ?? <span className="muted">Not linked</span>}</td>
                <td><Badge tone={catTone(p.category)}>{p.category}</Badge></td>
                <td className="small nowrap">{date(p.createdAt)}</td>
                <td>{activeAdmission(p.id) ? <Badge tone="violet">Admitted</Badge> : <Badge>Outpatient</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="No patients match." />}
        <div className="row between" style={{ padding: '10px 14px', borderTop: '1px solid var(--border)' }}>
          <span className="small muted">{filtered.length ? `${page * PAGE + 1} to ${Math.min(filtered.length, (page + 1) * PAGE)} of ${filtered.length.toLocaleString('en-IN')}` : ''}</span>
          <div className="row"><button className="sm-btn sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button><button className="sm-btn sm" disabled={(page + 1) * PAGE >= filtered.length} onClick={() => setPage(page + 1)}>Next</button></div>
        </div>
      </div>
      {reg && <RegisterModal onClose={() => setReg(false)} onDone={(p) => { setReg(false); openPatient(p.id) }} />}
    </div>
  )
}
