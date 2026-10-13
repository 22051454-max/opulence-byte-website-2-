'use client'

import { Cctv, Grid2x2, Grid3x3, LayoutGrid, MessageSquareWarning, Plus, ShieldAlert, ShieldCheck, Siren, Video } from 'lucide-react'
import { useMemo, useState } from 'react'
import { canOpen } from '../core/rbac'
import { useRows } from '../core/store'
import type { Complaint } from '../core/types'
import { ago, cx, dateTime, isToday } from '../core/util'
import { audit } from '../services/identity'
import { complaints, updateComplaint } from '../services/security'
import { CAMERAS, CctvCanvas, type Camera } from '../ui/cctv'
import { useApp } from '../ui/context'
import { Badge, Drawer, Empty, Field, Locked, Modal, PageHead, Seg, Stat, Tabs, useNow, useToast, type Tone } from '../ui/kit'
import { statusTone } from '../ui/patient'

const SEV: Record<Complaint['severity'], Tone> = { Low: 'gray', Medium: 'amber', High: 'red', Critical: 'red' }

/** Security dashboard. Only the Super Admin and the Security Head can open it. */
export default function Security() {
  const { user, reportIssue } = useApp()
  const all = useRows(complaints)
  const [tab, setTab] = useState<'cctv' | 'issues' | 'access'>('issues')
  const [open, setOpen] = useState<string | null>(null)
  if (!canOpen(user.role, 'security')) return <Locked text="CCTV, complaints and disputes are visible only to the Super Admin and the Security Head." />
  const active = all.filter((c) => c.status === 'Open' || c.status === 'Investigating')
  const alertCams = new Set(active.map((c) => c.camera).filter(Boolean) as string[])
  return (
    <div>
      <PageHead title="Security control room" sub="Complaints, disputes and incidents with live CCTV. Restricted to the Super Admin and the Security Head.">
        <Badge tone="red" dot><ShieldCheck size={12} />Restricted area</Badge>
        <button className="sm-btn danger" onClick={reportIssue}><Plus size={16} />Log incident</button>
      </PageHead>
      <div className="grid g4 stagger" style={{ marginBottom: 14 }}>
        <Stat i={0} label="Open issues" value={all.filter((c) => c.status === 'Open').length} icon={<MessageSquareWarning size={17} />} tone="red" />
        <Stat i={1} label="Under investigation" value={all.filter((c) => c.status === 'Investigating').length} icon={<ShieldAlert size={17} />} tone="amber" />
        <Stat i={2} label="Resolved today" value={all.filter((c) => (c.status === 'Resolved' || c.status === 'Closed') && isToday(c.updates[0]?.at)).length} icon={<ShieldCheck size={17} />} tone="green" />
        <Stat i={3} label="Cameras online" value={CAMERAS.length} icon={<Cctv size={17} />} tone="blue" sub={`${alertCams.size} linked to open issues`} onClick={() => setTab('cctv')} />
      </div>
      <Tabs value={tab} tabs={[['issues', 'Complaints & disputes', active.length], ['cctv', 'CCTV wall', CAMERAS.length], ['access', 'Access log']]} onChange={setTab} />
      {tab === 'issues' && <Issues list={all} onOpen={setOpen} />}
      {tab === 'cctv' && <CctvWall alertCams={alertCams} />}
      {tab === 'access' && <AccessLog />}
      {open && <IssueDrawer id={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function Issues({ list, onOpen }: { list: Complaint[]; onOpen: (id: string) => void }) {
  const [f, setF] = useState<'Active' | 'All' | 'Closed'>('Active')
  const rows = list.filter((c) => f === 'All' || (f === 'Active' ? c.status === 'Open' || c.status === 'Investigating' : c.status === 'Resolved' || c.status === 'Closed'))
  return (
    <>
      <div style={{ marginBottom: 12 }}><Seg value={f} options={['Active', 'Closed', 'All'] as const} onChange={setF} /></div>
      <div className="sm-card table-wrap">
        <table className="t">
          <thead><tr><th>Ref</th><th>Issue</th><th>Type</th><th>Where</th><th>Severity</th><th>Status</th><th>Reported</th></tr></thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="click" onClick={() => onOpen(c.id)}>
                <td className="mono small"><b>{c.ref}</b></td>
                <td className="small"><b>{c.title}</b><div className="tiny muted">by {c.raisedBy}{c.raisedByUser ? ` · logged by ${c.raisedByUser}` : ''}</div></td>
                <td><Badge tone={c.kind.includes('dispute') || c.kind === 'Dispute' ? 'violet' : c.kind === 'Security incident' ? 'red' : 'blue'}>{c.kind}</Badge></td>
                <td className="small">{c.location}{c.camera && <div className="tiny" style={{ color: 'var(--primary)' }}><Video size={11} style={{ verticalAlign: -1 }} /> {c.camera}</div>}</td>
                <td><Badge tone={SEV[c.severity]} live={c.severity === 'Critical' && c.status === 'Open'}>{c.severity}</Badge></td>
                <td><Badge tone={statusTone(c.status)} dot>{c.status}</Badge></td>
                <td className="small nowrap">{ago(c.at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty text="Nothing here." />}
      </div>
    </>
  )
}

function CamTile({ cam, alert, onOpen }: { cam: Camera; alert: boolean; onOpen?: () => void }) {
  return (
    <div className={cx('cam', alert && 'alert', !onOpen && 'big')} onClick={onOpen}>
      <CctvCanvas cam={cam} />
      <Osd cam={cam} alert={alert} />
    </div>
  )
}

function Osd({ cam, alert }: { cam: Camera; alert: boolean }) {
  const now = useNow()
  const d = new Date(now)
  return (
    <div className="osd">
      <div className="row between"><span><b>{cam.id}</b> {cam.name}</span><span className="rec"><i />REC</span></div>
      <div className="row between"><span>{alert ? '⚠ LINKED TO OPEN ISSUE' : cam.location}</span><span>{d.toLocaleDateString('en-GB')} {d.toLocaleTimeString('en-GB')}</span></div>
    </div>
  )
}

function CctvWall({ alertCams }: { alertCams: Set<string> }) {
  const [cols, setCols] = useState<'2' | '3' | '4'>('3')
  const [big, setBig] = useState<Camera | null>(null)
  const [zone, setZone] = useState<'All' | 'Restricted' | 'Public' | 'Outdoor'>('All')
  const cams = CAMERAS.filter((c) => zone === 'All' || (zone === 'Restricted' ? c.location.includes('restricted') || c.scene === 'icu' : zone === 'Outdoor' ? c.scene === 'parking' || c.scene === 'entrance' : !c.location.includes('restricted') && c.scene !== 'parking' && c.scene !== 'icu'))
  return (
    <>
      <div className="row wrap between" style={{ marginBottom: 12 }}>
        <Seg value={zone} options={['All', 'Public', 'Restricted', 'Outdoor'] as const} onChange={setZone} />
        <div className="row"><span className="small muted">Demo feeds generated live in the browser</span><Seg value={cols} options={[['2', <Grid2x2 key="2" size={15} />], ['3', <Grid3x3 key="3" size={15} />], ['4', <LayoutGrid key="4" size={15} />]] as const} onChange={setCols} /></div>
      </div>
      <div className="cctv-grid" style={{ ['--cols' as string]: cols }}>
        {cams.map((c) => <CamTile key={c.id} cam={c} alert={alertCams.has(c.id)} onOpen={() => setBig(c)} />)}
      </div>
      {big && (
        <Modal title={`${big.id} · ${big.name}`} icon={<Cctv size={18} />} onClose={() => setBig(null)} width={980}>
          <CamTile cam={big} alert={alertCams.has(big.id)} />
          <div className="row wrap" style={{ marginTop: 12 }}><Badge tone="green" dot>Online</Badge><span className="small muted">{big.location} · 1080p · 25 fps · 30 days retention</span></div>
        </Modal>
      )}
    </>
  )
}

function AccessLog() {
  const log = useRows(audit)
  const rows = useMemo(() => log.filter((a) => a.action.startsWith('Signed') || a.action.includes('User') || a.action.includes('Password') || a.action.includes('Issue')).slice(0, 100), [log])
  return (
    <div className="sm-card table-wrap">
      <table className="t"><thead><tr><th>When</th><th>Who</th><th>Role</th><th>Event</th></tr></thead>
        <tbody>{rows.map((a) => <tr key={a.id}><td className="small nowrap">{dateTime(a.at)}</td><td className="small"><b>{a.user}</b></td><td><Badge>{a.role}</Badge></td><td className="small">{a.action}: {a.detail}</td></tr>)}</tbody>
      </table>
      {!rows.length && <Empty text="Sign-ins and account changes appear here." />}
    </div>
  )
}

function IssueDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const toast = useToast()
  useRows(complaints)
  const c = complaints.get(id)
  const [text, setText] = useState('')
  const [cam, setCam] = useState(c?.camera ?? '')
  if (!c) return null
  const camObj = CAMERAS.find((x) => x.id === (cam || c.camera))
  return (
    <Drawer title={`${c.ref} · ${c.title}`} sub={`${c.kind} · ${c.location} · ${dateTime(c.at)}`} onClose={onClose} width={820}>
      <div className="col" style={{ gap: 14 }}>
        <div className="sm-card pad col" style={{ gap: 8 }}>
          <div className="row wrap"><Badge tone={SEV[c.severity]}>{c.severity}</Badge><Badge tone={statusTone(c.status)} dot>{c.status}</Badge><span className="small muted">Raised by {c.raisedBy}{c.raisedByUser ? `, logged by ${c.raisedByUser}` : ''}</span></div>
          <div>{c.detail || 'No details given.'}</div>
        </div>
        {camObj && <div><div className="small strong muted" style={{ marginBottom: 6 }}><Siren size={13} style={{ verticalAlign: -2 }} /> Linked camera</div><CamTile cam={camObj} alert /></div>}
        <div className="sm-card pad col" style={{ gap: 10 }}>
          <b>Update</b>
          <Field label="Link CCTV camera"><select className="select" value={cam} onChange={(e) => setCam(e.target.value)}><option value="">None</option>{CAMERAS.map((x) => <option key={x.id} value={x.id}>{x.id} · {x.name}</option>)}</select></Field>
          <Field label="Action taken / note"><textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Spoke to family with billing manager, revised estimate shared" /></Field>
          <div className="row wrap">
            {(['Investigating', 'Resolved', 'Closed', 'Open'] as const).map((s) => (
              <button key={s} className={cx('sm-btn sm', s === 'Resolved' && 'success', s === 'Investigating' && 'primary')} onClick={() => { updateComplaint(c.id, s, text, cam || undefined); setText(''); toast(`${c.ref} marked ${s}`) }}>{s === 'Open' ? 'Reopen' : `Mark ${s.toLowerCase()}`}</button>
            ))}
          </div>
        </div>
        <div className="sm-card">
          <div className="card-head"><h3>History</h3></div>
          {c.updates.map((u, i) => <div key={i} className="list-item"><span className="tiny muted" style={{ width: 140 }}>{dateTime(u.at)}</span><b className="small">{u.by}</b><span className="small grow">{u.text}</span></div>)}
        </div>
      </div>
    </Drawer>
  )
}
