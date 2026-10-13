'use client'

import { CalendarDays, CheckCircle2, ChevronRight, Circle, Plus, Scissors, ShieldCheck, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DOCTORS, OT_ROOMS, PROCEDURES } from '../core/master'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { OtRoom, Surgery } from '../core/types'
import { cx, fmtMins, isToday, minsSince, time } from '../core/util'
import { doctorName } from '../services/doctors'
import { advanceSurgery, otRooms, scheduleSurgery, setOtStatus, surgeries, toggleChecklist } from '../services/ot'
import { patients } from '../services/patients'
import { useApp } from '../ui/context'
import { Badge, Drawer, Empty, Field, Modal, PageHead, Progress, Seg, Tabs, useNow, useToast } from '../ui/kit'
import { NurseNotesPanel, PatientLine, PatientPicker, StatusBadge } from '../ui/patient'

const FLOW: Surgery['status'][] = ['scheduled', 'pre-op', 'in-progress', 'recovery', 'completed']
const FLOW_LABEL: Record<string, string> = { scheduled: 'Scheduled', 'pre-op': 'Pre-op ready', 'in-progress': 'Surgery started', recovery: 'Shifted to recovery', completed: 'Completed' }

export default function Ot() {
  const { user } = useApp()
  const rooms = useRows(otRooms)
  const all = useRows(surgeries)
  useRows(patients)
  const [open, setOpen] = useState<string | null>(null)
  const [book, setBook] = useState(false)
  const [tab, setTab] = useState<'today' | 'upcoming' | 'done'>('today')
  const today = useMemo(() => all.filter((s) => isToday(s.start)).sort((a, b) => a.start.localeCompare(b.start)), [all])
  const upcoming = useMemo(() => all.filter((s) => !isToday(s.start) && new Date(s.start) > new Date() && s.status !== 'cancelled').sort((a, b) => a.start.localeCompare(b.start)), [all])
  const usedMin = today.filter((s) => s.status === 'completed' || s.status === 'recovery').reduce((m, s) => m + s.durationMin, 0)
  const util = Math.round((usedMin / (4 * 12 * 60)) * 100)
  const list = tab === 'today' ? today : tab === 'upcoming' ? upcoming : all.filter((s) => s.status === 'completed').slice(0, 60)

  return (
    <div>
      <PageHead title="Operation theatres" sub="4 modular OTs. Live status, today's schedule and the WHO surgical safety checklist in one place.">
        <span className="pill">{today.length} surgeries today · {today.filter((s) => s.priority === 'Emergency').length} emergency</span>
        <span className="pill">OT use {util}%</span>
        {can(user.role, 'ot.schedule') && <button className="sm-btn primary" onClick={() => setBook(true)}><Plus size={16} />Book surgery</button>}
      </PageHead>

      <div className="ot-grid stagger" style={{ marginBottom: 16 }}>
        {[...rooms].sort((a, b) => a.number - b.number).map((r, i) => <OtCard key={r.id} r={r} i={i} onOpen={setOpen} />)}
      </div>

      <div className="sm-card" style={{ marginBottom: 16 }}>
        <div className="card-head"><CalendarDays size={16} className="muted" /><h3>Today's theatre timeline</h3><span className="right small muted">8 AM to 10 PM · tap a block to open it</span></div>
        <div className="card-body"><Gantt list={today} onOpen={setOpen} /></div>
      </div>

      <Tabs value={tab} tabs={[['today', 'Today', today.length], ['upcoming', 'Upcoming', upcoming.length], ['done', 'Completed']]} onChange={setTab} />
      <div className="sm-card table-wrap">
        <table className="t">
          <thead><tr><th>Time</th><th>OT</th><th>Patient</th><th>Procedure</th><th>Surgeon</th><th>Checklist</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((s) => (
              <tr key={s.id} className="click" onClick={() => setOpen(s.id)}>
                <td className="nowrap small"><b>{time(s.start)}</b><div className="tiny muted">{s.durationMin} min</div></td>
                <td><b>OT {s.ot}</b></td>
                <td><PatientLine p={patients.get(s.patientId)} /></td>
                <td className="small"><b>{s.procedure}</b><div className="tiny muted">{s.anaesthesia} anaesthesia{s.priority === 'Emergency' ? ' · ' : ''}{s.priority === 'Emergency' && <Badge tone="red">Emergency</Badge>}</div></td>
                <td className="small">{doctorName(s.surgeonId)}</td>
                <td><Checks s={s} /></td>
                <td><StatusBadge s={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty text="Nothing here." />}
      </div>

      {book && <ScheduleSurgeryModal onClose={() => setBook(false)} />}
      {open && <SurgeryDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Checks({ s }: { s: Surgery }) {
  const n = Number(s.checklist.signIn) + Number(s.checklist.timeOut) + Number(s.checklist.signOut)
  return <Badge tone={n === 3 ? 'green' : n ? 'amber' : 'gray'}>{n}/3</Badge>
}

function OtCard({ r, i, onOpen }: { r: OtRoom; i: number; onOpen: (id: string) => void }) {
  const { user } = useApp()
  const all = useRows(surgeries)
  useNow()
  const live = all.find((s) => s.ot === r.number && s.status === 'in-progress')
  const next = all.filter((s) => s.ot === r.number && (s.status === 'scheduled' || s.status === 'pre-op') && new Date(s.start).getTime() > Date.now() - 3 * 3600e3).sort((a, b) => a.start.localeCompare(b.start))[0]
  const doneToday = all.filter((s) => s.ot === r.number && isToday(s.start) && (s.status === 'completed' || s.status === 'recovery')).length
  const elapsed = live ? minsSince(live.startedAt) : 0
  const label = { ready: 'Ready', 'in-use': 'Surgery in progress', cleaning: 'Cleaning', maintenance: 'Maintenance' }[r.status]
  return (
    <div className={cx('sm-card ot-card', r.status)} style={{ ['--i' as string]: i }}>
      <div className="row between"><span className="num">OT {r.number}</span><Badge tone={r.status === 'in-use' ? 'red' : r.status === 'ready' ? 'green' : r.status === 'cleaning' ? 'amber' : 'gray'} live={r.status === 'in-use'}>{label}</Badge></div>
      <div className="small muted" style={{ marginTop: 4 }}>{r.speciality}</div>
      <div className="sm-divider" />
      {live ? (
        <button style={{ textAlign: 'left', width: '100%' }} onClick={() => onOpen(live.id)}>
          <div className="row"><Timer size={16} color="var(--red)" /><span className="ot-timer">{fmtMins(elapsed)}</span><span className="small muted">of {fmtMins(live.durationMin)}</span></div>
          <div style={{ margin: '8px 0' }}><Progress value={(elapsed / live.durationMin) * 100} tone={elapsed > live.durationMin ? 'var(--red)' : undefined} /></div>
          <b className="ellipsis" style={{ display: 'block' }}>{live.procedure}</b>
          <div className="small muted ellipsis">{patients.get(live.patientId)?.name} · {doctorName(live.surgeonId)}</div>
        </button>
      ) : (
        <div style={{ minHeight: 86 }}>
          {next ? <button style={{ textAlign: 'left', width: '100%' }} onClick={() => onOpen(next.id)}><div className="small muted">Next at <b>{time(next.start)}</b></div><b className="ellipsis" style={{ display: 'block', marginTop: 4 }}>{next.procedure}</b><div className="small muted ellipsis">{patients.get(next.patientId)?.name} · {doctorName(next.surgeonId)}</div></button> : <div className="small muted">No more cases booked today.</div>}
        </div>
      )}
      <div className="row between" style={{ marginTop: 10 }}>
        <span className="tiny muted">{doneToday} done today</span>
        {can(user.role, 'ot.run') && !live && (
          <select className="select sm" style={{ width: 130 }} value={r.status} onChange={(e) => setOtStatus(r.number, e.target.value as OtRoom['status'])}>
            <option value="ready">Ready</option><option value="cleaning">Cleaning</option><option value="maintenance">Maintenance</option>
          </select>
        )}
      </div>
    </div>
  )
}

function Gantt({ list, onOpen }: { list: Surgery[]; onOpen: (id: string) => void }) {
  useNow()
  const day = new Date(); day.setHours(8, 0, 0, 0)
  const start = day.getTime(), span = 14 * 3600e3
  const pos = (t: number) => Math.max(0, Math.min(100, ((t - start) / span) * 100))
  const nowPct = pos(Date.now())
  return (
    <div className="gantt" style={{ overflowX: 'auto' }}>
      <div style={{ minWidth: 720 }}>
        <div className="gantt-hours"><span /><div className="h">{Array.from({ length: 8 }, (_, i) => <span key={i} style={{ left: `${(i * 2 / 14) * 100}%` }}>{((8 + i * 2 + 11) % 12) + 1}{8 + i * 2 < 12 ? 'am' : 'pm'}</span>)}</div></div>
        {OT_ROOMS.map((o, row) => (
          <div key={o.number} className="gantt-row">
            <b>OT {o.number}</b>
            <div className="gantt-track">
              {Date.now() > start && Date.now() < start + span && <span className={cx('gantt-now', row === 0 && 'first')} style={{ left: `${nowPct}%` }} />}
              {list.filter((s) => s.ot === o.number && s.status !== 'cancelled').map((s) => {
                const t = new Date(s.start).getTime()
                return (
                  <div key={s.id} className={cx('gantt-block', s.status, s.priority === 'Emergency' && 'emergency')} style={{ left: `${pos(t)}%`, width: `${Math.max(2, pos(t + s.durationMin * 60e3) - pos(t))}%` }} onClick={() => onOpen(s.id)} title={`${s.procedure} · ${time(s.start)}`}>
                    <b className="ellipsis">{s.procedure}</b><span className="ellipsis" style={{ opacity: .85 }}>{time(s.start)} · {doctorName(s.surgeonId).replace('Dr. ', 'Dr ')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SurgeryDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { user } = useApp()
  const toast = useToast()
  useRows(surgeries)
  useNow()
  const s = surgeries.get(id)
  if (!s) return null
  const p = patients.get(s.patientId)
  const run = can(user.role, 'ot.run')
  const idx = FLOW.indexOf(s.status)
  const next = FLOW[idx + 1]
  const blocked = next === 'in-progress' && (!s.checklist.signIn || !s.checklist.timeOut || !s.consent) ? 'Complete WHO Sign in and Time out (and consent) before starting.' : next === 'completed' && !s.checklist.signOut ? 'Complete WHO Sign out before closing the case.' : ''
  return (
    <Drawer title={s.procedure} sub={`OT ${s.ot} · ${time(s.start)} · ${s.durationMin} min planned · ${s.priority}`} onClose={onClose} width={780}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad col" style={{ gap: 10 }}>
          <PatientLine p={p} />
          <div className="row wrap"><Badge tone="blue">Surgeon: {doctorName(s.surgeonId)}</Badge><Badge tone="violet">Anaesthetist: {doctorName(s.anaesthetistId)}</Badge><Badge>{s.anaesthesia}</Badge>{s.consent ? <Badge tone="green">Consent signed (e-sign)</Badge> : <Badge tone="red">Consent pending</Badge>}</div>
          {s.startedAt && <div className="row"><Timer size={16} /><span className="ot-timer" style={{ fontSize: 18 }}>{fmtMins(s.endedAt ? Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000) : minsSince(s.startedAt))}</span><span className="small muted">{s.endedAt ? 'total' : 'running'}</span></div>}
        </div>

        <div className="sm-card pad col" style={{ gap: 10 }}>
          <b>Case progress</b>
          <div className="sm-steps">
            {FLOW.map((f, i) => <span key={f} className={cx('sm-step', i <= idx && 'done')}>{i <= idx ? <CheckCircle2 size={14} /> : <Circle size={14} />}{FLOW_LABEL[f]}</span>)}
          </div>
          {run && s.status !== 'completed' && s.status !== 'cancelled' && (
            <div className="row wrap">
              {next && <button className="sm-btn primary" disabled={!!blocked} onClick={() => { advanceSurgery(s.id, next); toast(`${FLOW_LABEL[next]}${next === 'recovery' ? '. OT charges posted to the bill; OT sent for cleaning.' : ''}`) }}>{FLOW_LABEL[next]}<ChevronRight size={16} /></button>}
              {s.status === 'scheduled' && <button className="sm-btn" onClick={() => { advanceSurgery(s.id, 'cancelled'); toast('Surgery cancelled', 'warning') }}>Cancel</button>}
              {blocked && <span className="small" style={{ color: 'var(--amber)' }}>{blocked}</span>}
            </div>
          )}
        </div>

        <div className="sm-card pad col" style={{ gap: 10 }}>
          <div className="row"><ShieldCheck size={16} /><b>WHO surgical safety checklist</b></div>
          {([['signIn', 'Sign in', 'Before anaesthesia: identity, site marked, consent, allergies, airway, blood loss risk'], ['timeOut', 'Time out', 'Before incision: team introduced, procedure and site confirmed, antibiotics given, imaging displayed'], ['signOut', 'Sign out', 'Before leaving OT: procedure recorded, instrument, sponge and needle counts correct, specimen labelled']] as const).map(([k, label, text]) => (
            <label key={k} className="check" style={{ alignItems: 'flex-start', padding: 10, borderRadius: 10, background: s.checklist[k] ? 'var(--green-soft)' : 'var(--surface-2)' }}>
              <input type="checkbox" checked={s.checklist[k]} disabled={!run} onChange={() => toggleChecklist(s.id, k)} />
              <span><b>{label}</b><div className="small muted">{text}</div></span>
            </label>
          ))}
        </div>

        <div className="sm-card pad"><NurseNotesPanel patientId={s.patientId} context="OT" refId={s.id} /></div>
      </div>
    </Drawer>
  )
}

export function ScheduleSurgeryModal({ patientId, surgeonId, emergency, onClose, onDone }: { patientId?: string; surgeonId?: string; emergency?: boolean; onClose: () => void; onDone?: () => void }) {
  const toast = useToast()
  const [pid, setPid] = useState(patientId ?? null)
  const [ot, setOt] = useState(emergency ? 4 : 1)
  const [procedure, setProcedure] = useState(PROCEDURES[emergency ? 4 : 1][0])
  const surgeons = DOCTORS.filter((d) => d.surgeon)
  const [surgeon, setSurgeon] = useState(surgeonId ?? surgeons[0].id)
  const [anaes, setAnaes] = useState('d10')
  const [type, setType] = useState<Surgery['anaesthesia']>('General')
  const [priority, setPriority] = useState<Surgery['priority']>(emergency ? 'Emergency' : 'Elective')
  const soon = new Date(Date.now() + (emergency ? 20 : 24 * 60) * 60e3)
  soon.setMinutes(Math.ceil(soon.getMinutes() / 15) * 15, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  const [when, setWhen] = useState(`${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T${pad(soon.getHours())}:${pad(soon.getMinutes())}`)
  const [duration, setDuration] = useState(90)
  const [consent, setConsent] = useState(false)
  return (
    <Modal title={emergency ? 'Emergency surgery' : 'Book surgery'} icon={<Scissors size={18} />} onClose={onClose} width={740}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className={cx('sm-btn', priority === 'Emergency' ? 'danger' : 'primary')} disabled={!pid || !procedure} onClick={() => {
        const r = scheduleSurgery({ patientId: pid!, ot, procedure, surgeonId: surgeon, anaesthetistId: anaes, anaesthesia: type, priority, start: new Date(when).toISOString(), durationMin: duration, consent })
        if (typeof r === 'string') return toast(r, 'danger')
        toast(`Booked in OT ${ot} at ${time(r.start)}. OT team notified.`)
        onDone ? onDone() : onClose()
      }}>Book OT {ot}</button></>}>
      <div className="col" style={{ gap: 14 }}>
        {pid ? <div className="sm-card pad"><PatientLine p={patients.get(pid)} right={!patientId && <button className="sm-btn sm" onClick={() => setPid(null)}>Change</button>} /></div> : <PatientPicker autoFocus onPick={(p) => setPid(p.id)} />}
        <Field label="Theatre"><Seg value={String(ot) as '1'} options={OT_ROOMS.map((o) => [String(o.number), `OT ${o.number} · ${o.speciality.split(' (')[0]}`] as ['1', string])} onChange={(v) => { setOt(Number(v)); setProcedure(PROCEDURES[Number(v)][0]) }} /></Field>
        <div className="form-grid">
          <Field label="Procedure" required><input className="input" list="smi-procs" value={procedure} onChange={(e) => setProcedure(e.target.value)} /></Field>
          <datalist id="smi-procs">{Object.values(PROCEDURES).flat().map((x) => <option key={x} value={x} />)}</datalist>
          <Field label="Priority"><Seg value={priority} options={['Elective', 'Emergency'] as const} onChange={setPriority} /></Field>
          <Field label="Surgeon"><select className="select" value={surgeon} onChange={(e) => setSurgeon(e.target.value)}>{surgeons.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.dept}</option>)}</select></Field>
          <Field label="Anaesthetist"><select className="select" value={anaes} onChange={(e) => setAnaes(e.target.value)}>{DOCTORS.filter((d) => d.dept === 'Anaesthesiology').map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          <Field label="Anaesthesia"><select className="select" value={type} onChange={(e) => setType(e.target.value as Surgery['anaesthesia'])}>{(['General', 'Spinal', 'Regional block', 'Local', 'Sedation'] as const).map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Start"><input className="input" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} /></Field>
          <Field label="Planned duration (min)"><input className="input" type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(Number(e.target.value))} /></Field>
          <label className="check" style={{ alignSelf: 'end', height: 40 }}><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />Patient consent signed digitally</label>
        </div>
      </div>
    </Modal>
  )
}
