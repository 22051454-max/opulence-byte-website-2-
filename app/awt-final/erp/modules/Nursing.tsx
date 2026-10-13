'use client'

import { AlertTriangle, BedDouble, ClipboardList, HeartPulse, NotebookPen, Plus, Siren } from 'lucide-react'
import { useMemo, useState } from 'react'
import { WARDS } from '../core/master'
import { useRows } from '../core/store'
import type { NoteContext } from '../core/types'
import { isToday } from '../core/util'
import { erCases } from '../services/emergency'
import { admissions, beds, ward } from '../services/ipd'
import { nurseNotes } from '../services/nursing'
import { surgeries } from '../services/ot'
import { patients } from '../services/patients'
import { Badge, Empty, PageHead, Seg, Stat, Tabs } from '../ui/kit'
import { AddNoteModal, NoteRow, PatientLine } from '../ui/patient'

/** Nursing station: every note written here shows up in OPD, IPD, Emergency, OT and the discharge summary. */
export default function Nursing() {
  const notes = useRows(nurseNotes)
  const adm = useRows(admissions)
  const er = useRows(erCases)
  const sx = useRows(surgeries)
  useRows(patients)
  const [tab, setTab] = useState<'patients' | 'feed' | 'handover'>('patients')
  const [area, setArea] = useState<'IPD' | 'Emergency' | 'OT'>('IPD')
  const [wardId, setWardId] = useState('MICU')
  const [noteFor, setNoteFor] = useState<{ patientId: string; context: NoteContext; refId?: string } | null>(null)
  const [filter, setFilter] = useState<'All' | NoteContext>('All')

  const lastNote = useMemo(() => {
    const m = new Map<string, string>()
    for (const n of notes) if (!m.has(n.patientId)) m.set(n.patientId, n.at)
    return m
  }, [notes])

  const rows = useMemo(() => {
    if (area === 'IPD') return adm.filter((a) => a.status === 'admitted' && beds.get(a.bedId)?.ward === wardId).map((a) => ({ id: a.id, patientId: a.patientId, where: beds.get(a.bedId)?.number ?? '', info: a.diagnosis, context: 'IPD' as const }))
    if (area === 'Emergency') return er.filter((c) => c.status !== 'closed').map((c) => ({ id: c.id, patientId: c.patientId, where: c.bay ?? 'ER', info: `${c.triage.toUpperCase()} · ${c.complaint}`, context: 'Emergency' as const }))
    return sx.filter((s) => isToday(s.start) && s.status !== 'cancelled' && s.status !== 'completed').map((s) => ({ id: s.id, patientId: s.patientId, where: `OT ${s.ot}`, info: `${s.procedure} · ${s.status}`, context: 'OT' as const }))
  }, [area, wardId, adm, er, sx])

  const todayNotes = notes.filter((n) => isToday(n.at))
  const feed = notes.filter((n) => filter === 'All' || n.context === filter).slice(0, 80)

  return (
    <div>
      <PageHead title="Nursing station" sub="Write a note once. It appears for the doctor in OPD, wards, emergency, OT and in the discharge summary." />
      <div className="grid g4 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="Notes today" value={todayNotes.length} icon={<NotebookPen size={17} />} tone="teal" />
        <Stat i={1} label="Alerts today" value={todayNotes.filter((n) => n.kind === 'Alert').length} icon={<AlertTriangle size={17} />} tone="red" />
        <Stat i={2} label="Patients in wards" value={adm.filter((a) => a.status === 'admitted').length} icon={<BedDouble size={17} />} tone="violet" />
        <Stat i={3} label="In emergency" value={er.filter((c) => c.status !== 'closed').length} icon={<Siren size={17} />} tone="amber" />
      </div>
      <Tabs value={tab} tabs={[['patients', 'My patients'], ['feed', 'All notes'], ['handover', 'Shift handover']]} onChange={setTab} />

      {tab === 'patients' && (
        <>
          <div className="row wrap" style={{ marginBottom: 12 }}>
            <Seg value={area} options={[['IPD', 'Wards & ICU'], ['Emergency', 'Emergency'], ['OT', 'Operation theatre']] as const} onChange={setArea} />
            {area === 'IPD' && <select className="select" style={{ width: 260 }} value={wardId} onChange={(e) => setWardId(e.target.value)}>{WARDS.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}</select>}
          </div>
          <div className="sm-card table-wrap">
            <table className="t">
              <thead><tr><th>Where</th><th>Patient</th><th>Details</th><th>Last note</th><th /></tr></thead>
              <tbody>
                {rows.map((r) => {
                  const last = lastNote.get(r.patientId)
                  const stale = !last || Date.now() - new Date(last).getTime() > 4 * 3600e3
                  return (
                    <tr key={r.id}>
                      <td><b>{r.where}</b>{area === 'IPD' && <div className="tiny muted">{ward(wardId)?.name}</div>}</td>
                      <td><PatientLine p={patients.get(r.patientId)} /></td>
                      <td className="small">{r.info}</td>
                      <td>{stale ? <Badge tone="amber">Due</Badge> : <Badge tone="green">{new Date(last!).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Badge>}</td>
                      <td><button className="sm-btn sm primary" onClick={() => setNoteFor({ patientId: r.patientId, context: r.context, refId: r.id })}><Plus size={14} />Note</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!rows.length && <Empty text="No patients here right now." />}
          </div>
        </>
      )}

      {tab === 'feed' && (
        <>
          <div style={{ marginBottom: 12 }}><Seg value={filter} options={['All', 'IPD', 'Emergency', 'OT', 'OPD', 'General'] as const} onChange={setFilter} /></div>
          <div className="col" style={{ gap: 8 }}>{feed.map((n) => <NoteRow key={n.id} n={n} showPatient />)}</div>
          {!feed.length && <Empty text="No notes." />}
        </>
      )}

      {tab === 'handover' && <Handover />}

      {noteFor && <AddNoteModal {...noteFor} onClose={() => setNoteFor(null)} />}
    </div>
  )
}

/** Shift handover summary, generated from the last 8 hours of nurse notes. */
function Handover() {
  const notes = useRows(nurseNotes)
  const since = Date.now() - 8 * 3600e3
  const recent = notes.filter((n) => new Date(n.at).getTime() > since)
  const alerts = recent.filter((n) => n.kind === 'Alert')
  const meds = recent.filter((n) => n.kind === 'Medication given').length
  const byContext = (['IPD', 'Emergency', 'OT', 'OPD'] as const).map((c) => [c, recent.filter((n) => n.context === c).length] as const)
  return (
    <div className="grid g2">
      <div className="sm-card pad col" style={{ gap: 10 }}>
        <div className="row"><ClipboardList size={18} /><h3>Handover summary · last 8 hours</h3></div>
        <p style={{ margin: 0 }}>{recent.length} notes written. {meds} medication entries. {alerts.length} alert{alerts.length === 1 ? '' : 's'} need follow-up by the next shift.</p>
        <div className="row wrap">{byContext.map(([c, n]) => <span key={c} className="pill">{c}: {n}</span>)}</div>
        <div className="small muted">Generated automatically. No handwritten handover sheet needed.</div>
      </div>
      <div className="sm-card">
        <div className="card-head"><HeartPulse size={16} className="muted" /><h3>Alerts to hand over</h3></div>
        <div className="card-body col" style={{ gap: 8 }}>{alerts.map((n) => <NoteRow key={n.id} n={n} showPatient />)}{!alerts.length && <div className="muted small">No open alerts.</div>}</div>
      </div>
    </div>
  )
}
