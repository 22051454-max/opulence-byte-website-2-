'use client'

import { Activity, BedDouble, FlaskConical, IndianRupee, Pill, Receipt, Scissors, ShieldAlert, Siren, Stethoscope, UserPlus, Users } from 'lucide-react'
import { useMemo } from 'react'
import { HOSPITAL } from '../core/master'
import { can, canOpen, ROLE_LABEL } from '../core/rbac'
import { useRows } from '../core/store'
import { fmtMins, inrShort, isToday, minsSince } from '../core/util'
import { bills } from '../services/billing'
import { doctorName } from '../services/doctors'
import { nurseNotes } from '../services/nursing'
import { otRooms, surgeries } from '../services/ot'
import { visits } from '../services/opd'
import { patients } from '../services/patients'
import { complaints } from '../services/security'
import { useApp } from '../ui/context'
import { Badge, Bars, PageHead, Progress, Ring, Stat, useNow } from '../ui/kit'
import { NoteRow, PatientLine } from '../ui/patient'
import { useHospitalStats } from './stats'

export default function Dashboard() {
  const { user, go } = useApp()
  const s = useHospitalStats()
  const finance = can(user.role, 'billing.manage') || can(user.role, 'reports.all')
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const occupancy = Math.round((s.ipd.occupied / Math.max(1, s.ipd.total)) * 100)

  return (
    <div>
      <PageHead title={`${greet}, ${user.name.split(' ')[0] === 'Dr.' ? user.name.split(' ').slice(0, 2).join(' ') : user.name.split(' ')[0]}`} sub={`${ROLE_LABEL[user.role]} · ${HOSPITAL.name} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}>
        {canOpen(user.role, 'reception') && <button className="sm-btn primary" onClick={() => go('reception')}><UserPlus size={16} />Register patient</button>}
        {canOpen(user.role, 'emergency') && <button className="sm-btn danger" onClick={() => go('emergency')}><Siren size={16} />Emergency</button>}
      </PageHead>

      {user.role === 'doctor' && <DoctorToday />}

      <div className="grid g6 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="Patients today" value={s.footfall} icon={<Users size={17} />} tone="blue" sub={<>OPD {s.opd.total} · ER {s.er.total}<br />Normal range 500 to 1,000 a day</>} />
        <Stat i={1} label="OPD waiting" value={s.opd.waiting} icon={<Stethoscope size={17} />} tone="amber" sub={`${s.opd.inConsult} with doctors · ${s.opd.done} seen`} onClick={canOpen(user.role, 'opd') ? () => go('opd') : undefined} />
        <Stat i={2} label="In emergency now" value={s.er.open.length} icon={<Siren size={17} />} tone="red" sub={`${s.er.red} critical (red)`} onClick={canOpen(user.role, 'emergency') ? () => go('emergency') : undefined} />
        <Stat i={3} label="Beds occupied" value={s.ipd.occupied} icon={<BedDouble size={17} />} tone="violet" sub={`${s.ipd.free} free of ${s.ipd.total} · ${occupancy}%`} onClick={canOpen(user.role, 'ipd') ? () => go('ipd') : undefined} />
        <Stat i={4} label="Surgeries today" value={s.ot.today} icon={<Scissors size={17} />} tone="gold" sub={`${s.ot.live} live now · ${s.ot.upcoming} upcoming`} onClick={canOpen(user.role, 'ot') ? () => go('ot') : undefined} />
        {finance
          ? <Stat i={5} label="Collected today" value={s.revenue} format={inrShort} icon={<IndianRupee size={17} />} tone="green" sub={`Billed ${inrShort(s.billedToday)}`} onClick={canOpen(user.role, 'billing') ? () => go('billing') : undefined} />
          : <Stat i={5} label="Reports pending" value={s.diag.pending} icon={<FlaskConical size={17} />} tone="teal" sub={`${s.diag.reportedToday} reported today`} />}
      </div>

      <div className="grid g3" style={{ marginBottom: 14 }}>
        <div className="sm-card span2">
          <div className="card-head"><Activity size={16} className="muted" /><h3>Patients per day</h3><span className="right small muted">Last 14 days · gold bar is today</span></div>
          <div className="card-body">
            <Bars data={s.history.map((h, i) => ({ label: new Date(h.day).toLocaleDateString('en-IN', { day: '2-digit' }), value: h.opd + h.er, today: i === s.history.length - 1 }))} />
          </div>
        </div>
        <div className="sm-card">
          <div className="card-head"><BedDouble size={16} className="muted" /><h3>Bed occupancy</h3></div>
          <div className="card-body row" style={{ gap: 18 }}>
            <Ring value={occupancy} size={110} color={occupancy > 90 ? 'var(--red)' : 'var(--violet)'}><div><b style={{ fontSize: 22 }}>{occupancy}%</b><div className="tiny muted">occupied</div></div></Ring>
            <div className="col small" style={{ gap: 6 }}>
              <span><Badge tone="green" dot>Free</Badge> {s.ipd.free}</span>
              <span><Badge tone="blue" dot>Occupied</Badge> {s.ipd.occupied}</span>
              <span><Badge tone="amber" dot>Cleaning</Badge> {s.ipd.cleaning}</span>
              <span className="muted">Admitted today {s.ipd.admittedToday} · Discharged {s.ipd.dischargedToday}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid g3">
        {canOpen(user.role, 'ot') && <OtNow />}
        <div className="sm-card">
          <div className="card-head"><Stethoscope size={16} className="muted" /><h3>Busiest departments today</h3></div>
          <div className="card-body col" style={{ gap: 10 }}>
            {s.depts.slice(0, 7).map(([d, n]) => (
              <div key={d}>
                <div className="row between small"><span className="ellipsis">{d}</span><b>{n}</b></div>
                <Progress value={(n / (s.depts[0]?.[1] ?? 1)) * 100} />
              </div>
            ))}
          </div>
        </div>
        <RoleWidget />
      </div>
    </div>
  )
}

function DoctorToday() {
  const { user, go } = useApp()
  const all = useRows(visits)
  const mine = useMemo(() => all.filter((v) => v.doctorId === user.doctorId && isToday(v.createdAt)), [all, user.doctorId])
  const waiting = mine.filter((v) => v.status === 'waiting')
  const current = mine.find((v) => v.status === 'in-consult')
  const sx = useRows(surgeries).filter((x) => x.surgeonId === user.doctorId && isToday(x.start) && x.status !== 'completed')
  return (
    <div className="sm-card pad row wrap" style={{ marginBottom: 14, background: 'linear-gradient(135deg, var(--primary-soft), var(--surface))', gap: 18 }}>
      <div className="grow">
        <div className="small muted strong">Your day</div>
        <div style={{ fontSize: 18, marginTop: 4 }}><b>{waiting.length}</b> patients waiting · <b>{mine.filter((v) => v.status === 'done').length}</b> seen{sx.length ? <> · <b>{sx.length}</b> surgeries left</> : null}</div>
        {current && <div className="small" style={{ marginTop: 6 }}>Now with you: <b>{patients.get(current.patientId)?.name}</b> (token {current.token})</div>}
      </div>
      <button className="sm-btn primary lg" onClick={() => go('opd')}><Stethoscope size={18} />Open my OPD queue</button>
    </div>
  )
}

function OtNow() {
  const rooms = useRows(otRooms)
  const sx = useRows(surgeries)
  useNow()
  return (
    <div className="sm-card">
      <div className="card-head"><Scissors size={16} className="muted" /><h3>Operation theatres now</h3></div>
      <div className="card-body col" style={{ gap: 8 }}>
        {[...rooms].sort((a, b) => a.number - b.number).map((r) => {
          const live = sx.find((s) => s.ot === r.number && s.status === 'in-progress')
          const next = sx.filter((s) => s.ot === r.number && (s.status === 'scheduled' || s.status === 'pre-op')).sort((a, b) => a.start.localeCompare(b.start))[0]
          return (
            <div key={r.id} className="row" style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--surface-2)' }}>
              <b style={{ width: 44 }}>OT {r.number}</b>
              <div className="grow small ellipsis">{live ? <><b>{live.procedure}</b> · {doctorName(live.surgeonId)}</> : next ? <span className="muted">Next: {next.procedure} at {new Date(next.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span> : <span className="muted">No more cases today</span>}</div>
              {live ? <Badge tone="red" live>{fmtMins(minsSince(live.startedAt))}</Badge> : <Badge tone={r.status === 'ready' ? 'green' : r.status === 'cleaning' ? 'amber' : 'gray'}>{r.status}</Badge>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RoleWidget() {
  const { user, go } = useApp()
  const notes = useRows(nurseNotes)
  const comp = useRows(complaints)
  const allBills = useRows(bills)
  if (user.role === 'security' || user.role === 'superadmin') {
    const open = comp.filter((c) => c.status === 'Open' || c.status === 'Investigating')
    return (
      <div className="sm-card">
        <div className="card-head"><ShieldAlert size={16} className="muted" /><h3>Security desk</h3><button className="sm-btn sm right" onClick={() => go('security')}>Open</button></div>
        {open.slice(0, 5).map((c) => (
          <div key={c.id} className="list-item"><Badge tone={c.severity === 'Critical' || c.severity === 'High' ? 'red' : 'amber'}>{c.severity}</Badge><div className="grow small ellipsis"><b>{c.ref}</b> · {c.title}</div></div>
        ))}
        {!open.length && <div className="sm-empty">No open issues.</div>}
      </div>
    )
  }
  if (user.role === 'billing' || user.role === 'admin') {
    const q = allBills.filter((b) => b.claim && (b.claim.status === 'Query raised' || b.claim.status === 'Pre-auth sent'))
    return (
      <div className="sm-card">
        <div className="card-head"><Receipt size={16} className="muted" /><h3>TPA desk</h3><button className="sm-btn sm right" onClick={() => go('billing')}>Open</button></div>
        {q.slice(0, 6).map((b) => (
          <div key={b.id} className="list-item"><Badge tone={b.claim!.status === 'Query raised' ? 'red' : 'amber'}>{b.claim!.status}</Badge><div className="grow small ellipsis">{patients.get(b.patientId)?.name} · {b.claim!.insurer}</div></div>
        ))}
      </div>
    )
  }
  if (user.role === 'pharmacy') return <div className="sm-card pad"><Pill /> <b>Pharmacy queue</b><p className="muted">Open the pharmacy to dispense pending e-prescriptions.</p><button className="sm-btn primary" onClick={() => go('pharmacy')}>Open pharmacy</button></div>
  const latest = notes.filter((n) => n.kind === 'Alert' || n.context === 'Emergency').slice(0, 4)
  return (
    <div className="sm-card">
      <div className="card-head"><Activity size={16} className="muted" /><h3>Latest nurse alerts</h3></div>
      <div className="card-body col" style={{ gap: 8 }}>
        {latest.map((n) => <div key={n.id}><PatientLine p={patients.get(n.patientId)} /><div style={{ marginTop: 6 }}><NoteRow n={n} /></div></div>)}
        {!latest.length && <div className="muted small">No alerts.</div>}
      </div>
    </div>
  )
}
