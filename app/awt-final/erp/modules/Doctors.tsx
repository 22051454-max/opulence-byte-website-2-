'use client'

import { Scissors, Search, Stethoscope } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DEPARTMENTS, DOCTORS } from '../core/master'
import { useRows } from '../core/store'
import { inr, isToday } from '../core/util'
import { surgeries } from '../services/ot'
import { visits } from '../services/opd'
import { Avatar, Badge, PageHead } from '../ui/kit'

export default function Doctors() {
  const v = useRows(visits)
  const s = useRows(surgeries)
  const [dept, setDept] = useState('All')
  const [q, setQ] = useState('')
  const load = useMemo(() => {
    const m = new Map<string, { opd: number; waiting: number; sx: number; live: boolean }>()
    for (const x of v) if (isToday(x.createdAt)) { const r = m.get(x.doctorId) ?? { opd: 0, waiting: 0, sx: 0, live: false }; r.opd++; if (x.status === 'waiting') r.waiting++; m.set(x.doctorId, r) }
    for (const x of s) if (isToday(x.start)) { const r = m.get(x.surgeonId) ?? { opd: 0, waiting: 0, sx: 0, live: false }; r.sx++; if (x.status === 'in-progress') r.live = true; m.set(x.surgeonId, r) }
    return m
  }, [v, s])
  const list = DOCTORS.filter((d) => (dept === 'All' || d.dept === dept) && (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.dept.toLowerCase().includes(q.toLowerCase())))
  return (
    <div>
      <PageHead title="Doctors & departments" sub={`${DOCTORS.length} consultants across ${DEPARTMENTS.length} super speciality departments. Every doctor has their own login.`}>
        <select className="select" style={{ width: 260 }} value={dept} onChange={(e) => setDept(e.target.value)}><option>All</option>{DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}</select>
        <div className="row" style={{ position: 'relative' }}><Search size={14} style={{ position: 'absolute', left: 10, color: 'var(--faint)' }} /><input className="input" style={{ paddingLeft: 30, width: 220 }} placeholder="Search doctor" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </PageHead>
      <div className="grid g4 stagger">
        {list.map((d, i) => {
          const l = load.get(d.id)
          return (
            <div key={d.id} className="sm-card pad hover-lift col" style={{ gap: 10, ['--i' as string]: i }}>
              <div className="row"><Avatar name={d.name} size="lg" /><div className="grow" style={{ minWidth: 0 }}><b className="ellipsis" style={{ display: 'block' }}>{d.name}</b><div className="small muted ellipsis">{d.dept}</div></div></div>
              <div className="tiny muted">{d.qualification}</div>
              <div className="row wrap" style={{ gap: 6 }}>
                {l?.live ? <Badge tone="red" live>In surgery</Badge> : l?.waiting ? <Badge tone="green" dot>In OPD</Badge> : <Badge>{d.room}</Badge>}
                {d.surgeon && <Badge tone="gold"><Scissors size={11} />Surgeon</Badge>}
                <Badge tone="blue">doctor{DOCTORS.indexOf(d) + 1}</Badge>
              </div>
              <div className="row between small"><span className="muted"><Stethoscope size={13} style={{ verticalAlign: -2 }} /> {l?.opd ?? 0} OPD · {l?.waiting ?? 0} waiting</span><span className="muted">{l?.sx ?? 0} OT</span></div>
              <div className="row between small"><span className="muted">{d.opdDays}</span><b>{d.fee ? inr(d.fee) : 'On roster'}</b></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
