'use client'

import { Inbox, X } from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cx, initials } from '../core/util'
import type { Vitals } from '../core/types'

/* ---------- Shared clock (one interval for the whole app) ---------- */
let tick = Date.now()
const tickers = new Set<() => void>()
let timer: ReturnType<typeof setInterval> | undefined
function subscribeTick(fn: () => void) {
  tickers.add(fn)
  if (!timer) timer = setInterval(() => { tick = Date.now(); tickers.forEach((t) => t()) }, 1000)
  return () => { tickers.delete(fn); if (!tickers.size && timer) { clearInterval(timer); timer = undefined } }
}
/** Re-renders every second. Use only in small leaf components (timers, clocks). */
export function useNow() {
  return useSyncExternalStore(subscribeTick, () => tick, () => tick)
}

/* ---------- Toasts ---------- */
type Toast = { id: number; text: string; tone?: 'success' | 'danger' | 'warning' | 'info' }
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {})
export const useToast = () => useContext(ToastCtx)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([])
  const push = useMemo(() => (text: string, tone: Toast['tone'] = 'success') => {
    const id = Math.random()
    setItems((x) => [...x.slice(-3), { id, text, tone }])
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 3200)
  }, [])
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => <div key={t.id} className={cx('toast', t.tone)}>{t.text}</div>)}
      </div>
    </ToastCtx.Provider>
  )
}

/* ---------- Overlays ---------- */
/** Overlays render at the ERP root so animated containers never clip or offset them. */
export function Layer({ children }: { children: ReactNode }) {
  const root = typeof document !== 'undefined' ? document.querySelector('.smi') : null
  return root ? createPortal(children, root) : <>{children}</>
}

const escStack: (() => void)[] = []
/** Escape closes only the top-most overlay. */
function useEscape(onClose: () => void) {
  useEffect(() => {
    escStack.push(onClose)
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape' && escStack[escStack.length - 1] === onClose) onClose() }
    window.addEventListener('keydown', fn)
    return () => { window.removeEventListener('keydown', fn); const i = escStack.lastIndexOf(onClose); if (i >= 0) escStack.splice(i, 1) }
  }, [onClose])
}

export function Modal({ title, icon, onClose, children, footer, width }: { title: ReactNode; icon?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: number }) {
  useEscape(onClose)
  return (
    <Layer>
      <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal" role="dialog" aria-modal="true" style={width ? ({ ['--w' as string]: `${width}px` }) : undefined}>
          <div className="modal-head">{icon}<h3 className="grow">{title}</h3><button className="sm-btn ghost sm icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-foot">{footer}</div>}
        </div>
      </div>
    </Layer>
  )
}

export function Drawer({ title, sub, onClose, children, width, actions }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; width?: number; actions?: ReactNode }) {
  useEscape(onClose)
  return (
    <Layer>
    <div className="overlay drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="drawer" role="dialog" aria-modal="true" style={width ? ({ ['--w' as string]: `${width}px` }) : undefined}>
        <div className="modal-head">
          <div className="grow"><h3>{title}</h3>{sub && <div className="small muted" style={{ marginTop: 2 }}>{sub}</div>}</div>
          {actions}
          <button className="sm-btn ghost sm icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </aside>
    </div>
    </Layer>
  )
}

/* ---------- Small pieces ---------- */
export type Tone = 'blue' | 'teal' | 'red' | 'amber' | 'green' | 'violet' | 'gold' | 'gray'

export function Badge({ tone = 'gray', children, dot, live }: { tone?: Tone; children: ReactNode; dot?: boolean; live?: boolean }) {
  return <span className={cx('sm-badge', tone, live && 'live')}>{(dot || live) && <i className="dot" />}{children}</span>
}

export function Avatar({ name, size, gold }: { name: string; size?: 'sm' | 'lg'; gold?: boolean }) {
  const hue = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % 360
  return <span className={cx('avatar', size, gold && 'gold')} style={gold ? undefined : { background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 65% 42%))` }}>{initials(name)}</span>
}

export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString('en-IN') }: { value: number; format?: (n: number) => string }) {
  const [shown, setShown] = useState(value)
  const from = useRef(0)
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value
    let raf = 0
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 700)
      const e = 1 - Math.pow(1 - k, 3)
      setShown(a + (b - a) * e)
      if (k < 1) raf = requestAnimationFrame(step)
      else from.current = b
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{format(shown)}</>
}

export function Stat({ label, value, sub, icon, tone = 'blue', format, i = 0, onClick }: { label: string; value: number; sub?: ReactNode; icon: ReactNode; tone?: Tone; format?: (n: number) => string; i?: number; onClick?: () => void }) {
  return (
    <div className={cx('sm-card sm-stat', onClick && 'hover-lift')} style={{ ['--i' as string]: i, cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      <div className="label"><span className={cx('ico', `tone-${tone}`)}>{icon}</span>{label}</div>
      <div className="value"><CountUp value={value} format={format} /></div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  )
}

export function Field({ label, required, children, full }: { label: string; required?: boolean; children: ReactNode; full?: boolean }) {
  return <label className={cx('sm-field', full && 'full')}><span>{label}{required && <i> *</i>}</span>{children}</label>
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: readonly (T | [T, ReactNode])[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => {
        const [v, label] = Array.isArray(o) ? o : [o, o]
        return <button type="button" key={v} className={cx(value === v && 'on')} role="radio" aria-checked={value === v} onClick={() => onChange(v)}>{label}</button>
      })}
    </div>
  )
}

export function Tabs<T extends string>({ value, tabs, onChange }: { value: T; tabs: [T, ReactNode, number?][]; onChange: (v: T) => void }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(([v, label, n]) => (
        <button key={v} role="tab" aria-selected={value === v} className={cx(value === v && 'on')} onClick={() => onChange(v)}>
          {label}{n !== undefined && <span className="sm-badge" style={{ height: 20 }}>{n}</span>}
        </button>
      ))}
    </div>
  )
}

export function Empty({ text, icon }: { text: string; icon?: ReactNode }) {
  return <div className="sm-empty">{icon ?? <Inbox size={28} />}<div>{text}</div></div>
}

export function PageHead({ title, sub, children }: { title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div className="smi-page-head">
      <div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>
      {children && <div className="row wrap">{children}</div>}
    </div>
  )
}

export function Bars({ data }: { data: { label: string; value: number; today?: boolean }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="bars">
      {data.map((d, i) => (
        <div key={d.label + i} className={cx('b', d.today && 'today')} title={`${d.label}: ${d.value.toLocaleString('en-IN')}`}>
          <i style={{ height: `${(d.value / max) * 100}%`, ['--i' as string]: i }} />
          <span>{d.label}</span>
        </div>
      ))}
    </div>
  )
}

export function Progress({ value, tone }: { value: number; tone?: string }) {
  return <div className="progress"><i style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: tone }} /></div>
}

export function Ring({ value, size = 92, stroke = 9, color = 'var(--primary)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-soft)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(1, value / 100))} style={{ transition: 'stroke-dashoffset .9s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  )
}

/** Decorative QR-style code made from the text (not a scannable QR). */
export function CodeMark({ text }: { text: string }) {
  const cells = useMemo(() => {
    let h = 2166136261
    for (const ch of text) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
    const out: boolean[] = []
    for (let i = 0; i < 441; i++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177)
      const x = i % 21, y = Math.floor(i / 21)
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
      if (finder) {
        const fx = x > 13 ? x - 14 : x, fy = y > 13 ? y - 14 : y
        out.push(fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx > 1 && fx < 5 && fy > 1 && fy < 5))
      } else out.push((h & 1) === 1)
    }
    return out
  }, [text])
  return <div className="qr" aria-hidden="true">{cells.map((on, i) => <i key={i} className={on ? '' : 'o'} />)}</div>
}

export function VitalsView({ v }: { v?: Vitals }) {
  if (!v) return <div className="muted small">No vitals recorded.</div>
  const bad = {
    bp: v.bp ? Number(v.bp.split('/')[0]) > 150 || Number(v.bp.split('/')[0]) < 90 : false,
    pulse: v.pulse ? v.pulse > 110 || v.pulse < 55 : false,
    spo2: v.spo2 ? v.spo2 < 94 : false,
    temp: v.temp ? v.temp > 100.4 : false,
    rr: v.rr ? v.rr > 24 : false,
  }
  const items: [string, string | number | undefined, boolean, string][] = [
    ['BP', v.bp, bad.bp, 'mmHg'], ['Pulse', v.pulse, bad.pulse, '/min'], ['SpO₂', v.spo2, bad.spo2, '%'], ['Temp', v.temp, bad.temp, '°F'],
    ['Resp. rate', v.rr, bad.rr, '/min'], ['Sugar', v.sugar, false, 'mg/dL'], ['Weight', v.weight, false, 'kg'], ['Pain', v.pain, (v.pain ?? 0) >= 7, '/10'],
  ]
  return (
    <div className="vitals">
      {items.filter(([, val]) => val !== undefined && val !== '').map(([k, val, b, u]) => (
        <div key={k} className={cx('vital', b && 'bad')}><span>{k}</span><b>{val}</b> <span style={{ display: 'inline' }}>{u}</span></div>
      ))}
    </div>
  )
}

export function VitalsForm({ value, onChange }: { value: Vitals; onChange: (v: Vitals) => void }) {
  const set = (k: keyof Vitals, raw: string) => onChange({ ...value, [k]: k === 'bp' ? raw : raw === '' ? undefined : Number(raw) })
  const f: [keyof Vitals, string, string][] = [['bp', 'BP (mmHg)', '120/80'], ['pulse', 'Pulse', '78'], ['spo2', 'SpO₂ %', '98'], ['temp', 'Temp °F', '98.6'], ['rr', 'Resp. rate', '16'], ['sugar', 'Sugar mg/dL', '110'], ['weight', 'Weight kg', '60'], ['pain', 'Pain 0-10', '0']]
  return (
    <div className="grid g4">
      {f.map(([k, label, ph]) => (
        <Field key={k} label={label}><input className="input sm" inputMode={k === 'bp' ? 'text' : 'decimal'} placeholder={ph} value={value[k] ?? ''} onChange={(e) => set(k, e.target.value)} /></Field>
      ))}
    </div>
  )
}

export function Locked({ text }: { text: string }) {
  return <div className="sm-card lock"><div className="tone-red" style={{ width: 54, height: 54, borderRadius: 16, display: 'grid', placeItems: 'center' }}>🔒</div><h3>Access restricted</h3><p className="muted" style={{ margin: 0, maxWidth: 420 }}>{text}</p></div>
}
