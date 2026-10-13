'use client'

import { Droplet, FlaskConical, Microscope, ScanLine, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { can } from '../core/rbac'
import { useRows } from '../core/store'
import type { DiagOrder } from '../core/types'
import { ago, cx, isToday, time } from '../core/util'
import { advanceOrder, diagOrders } from '../services/diagnostics'
import { patients } from '../services/patients'
import { useApp } from '../ui/context'
import { Badge, Empty, Field, Modal, PageHead, Stat, Tabs, useToast } from '../ui/kit'
import { PatientLine, StatusBadge } from '../ui/patient'

const NEXT: Record<DiagOrder['status'], DiagOrder['status'] | null> = { ordered: 'collected', collected: 'processing', processing: 'reported', reported: null }

/** Laboratory (LIS) and Radiology (RIS) work queues. STAT orders always float to the top. */
export default function Diagnostics({ kind }: { kind: DiagOrder['kind'] }) {
  const { user } = useApp()
  const all = useRows(diagOrders)
  useRows(patients)
  const toast = useToast()
  const [tab, setTab] = useState<'queue' | 'reported'>('queue')
  const [report, setReport] = useState<DiagOrder | null>(null)
  const mine = useMemo(() => all.filter((o) => o.kind === kind), [all, kind])
  const rank = { STAT: 0, Urgent: 1, Routine: 2 }
  const queue = useMemo(() => mine.filter((o) => o.status !== 'reported').sort((a, b) => rank[a.priority] - rank[b.priority] || a.at.localeCompare(b.at)), [mine]) // eslint-disable-line react-hooks/exhaustive-deps
  const reported = useMemo(() => mine.filter((o) => o.status === 'reported').slice(0, 80), [mine])
  const canWork = can(user.role, kind === 'Lab' ? 'lab.process' : 'rad.process')
  const verb = kind === 'Lab' ? { collected: 'Sample collected', processing: 'Processing', reported: 'Report' } : { collected: 'Patient in room', processing: 'Scan done', reported: 'Report' }
  const list = tab === 'queue' ? queue : reported

  return (
    <div>
      <PageHead title={kind === 'Lab' ? 'Laboratory' : 'Radiology & imaging'} sub={kind === 'Lab' ? 'NABL lab: barcode sample tracking, results go straight to the doctor and the patient.' : 'X-ray, ultrasound, CT, MRI, PET-CT and cath lab. Reports flow back to the ordering doctor.'} />
      <div className="grid g4 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="Waiting" value={queue.filter((o) => o.status === 'ordered').length} icon={kind === 'Lab' ? <Droplet size={17} /> : <ScanLine size={17} />} tone="amber" />
        <Stat i={1} label="In process" value={queue.filter((o) => o.status !== 'ordered').length} icon={<Microscope size={17} />} tone="violet" />
        <Stat i={2} label="STAT pending" value={queue.filter((o) => o.priority === 'STAT').length} icon={<TriangleAlert size={17} />} tone="red" />
        <Stat i={3} label="Reported today" value={mine.filter((o) => o.status === 'reported' && isToday(o.reportedAt)).length} icon={<FlaskConical size={17} />} tone="green" />
      </div>
      <Tabs value={tab} tabs={[['queue', 'Work queue', queue.length], ['reported', 'Reported']]} onChange={setTab} />
      <div className="sm-card table-wrap">
        <table className="t">
          <thead><tr><th>Priority</th><th>Patient</th><th>Test</th><th>From</th><th>Ordered</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.slice(0, 120).map((o) => {
              const next = NEXT[o.status]
              return (
                <tr key={o.id}>
                  <td><Badge tone={o.priority === 'STAT' ? 'red' : o.priority === 'Urgent' ? 'amber' : 'gray'} live={o.priority === 'STAT' && o.status !== 'reported'}>{o.priority}</Badge></td>
                  <td><PatientLine p={patients.get(o.patientId)} /></td>
                  <td className="small"><b>{o.test}</b>{o.result && <div className={cx('tiny', o.critical ? '' : 'muted')} style={o.critical ? { color: 'var(--red)' } : undefined}>{o.result}</div>}</td>
                  <td className="small">{o.source}<div className="tiny muted">{o.orderedBy}</div></td>
                  <td className="small nowrap">{time(o.at)}<div className="tiny muted">{ago(o.at)}</div></td>
                  <td><StatusBadge s={o.status} /></td>
                  <td>{canWork && next && <button className={cx('sm-btn sm', next === 'reported' ? 'primary' : '')} onClick={() => next === 'reported' ? setReport(o) : (advanceOrder(o.id, next), toast(`${o.test}: ${verb[next as 'collected']}`))}>{verb[next as 'collected']}</button>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!list.length && <Empty text="Queue is clear." />}
      </div>
      {report && <ReportModal o={report} onClose={() => setReport(null)} />}
    </div>
  )
}

function ReportModal({ o, onClose }: { o: DiagOrder; onClose: () => void }) {
  const toast = useToast()
  const [result, setResult] = useState(o.kind === 'Lab' ? '' : 'No acute abnormality detected.')
  const [critical, setCritical] = useState(false)
  return (
    <Modal title={`Report · ${o.test}`} onClose={onClose} width={620}
      footer={<><button className="sm-btn" onClick={onClose}>Cancel</button><button className={cx('sm-btn', critical ? 'danger' : 'primary')} disabled={!result.trim()} onClick={() => { advanceOrder(o.id, 'reported', result.trim(), critical); toast(critical ? 'Critical result sent. Doctor and nurse alerted.' : 'Report released to doctor and patient', critical ? 'danger' : 'success'); onClose() }}>Release report</button></>}>
      <div className="col" style={{ gap: 12 }}>
        <PatientLine p={patients.get(o.patientId)} />
        <Field label={o.kind === 'Lab' ? 'Result values' : 'Findings and impression'}><textarea className="textarea" autoFocus style={{ minHeight: 130 }} value={result} onChange={(e) => setResult(e.target.value)} placeholder={o.kind === 'Lab' ? 'e.g. Hb 9.2 g/dL (low), WBC 11,200, Platelets 1.8 lakh' : ''} /></Field>
        <label className="check"><input type="checkbox" checked={critical} onChange={(e) => setCritical(e.target.checked)} /><TriangleAlert size={16} color="var(--red)" />Critical value (alerts the treating doctor and nurse immediately)</label>
      </div>
    </Modal>
  )
}
