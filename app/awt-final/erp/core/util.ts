export const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)

export const nowIso = () => new Date().toISOString()

export const dayKey = (d: Date | string = new Date()) => {
  const x = typeof d === 'string' ? new Date(d) : d
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}
export const isToday = (iso?: string) => !!iso && dayKey(iso) === dayKey()

export const inr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN')
export const inrShort = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2)} Cr` : n >= 1e5 ? `₹${(n / 1e5).toFixed(2)} L` : inr(n)

export const time = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '')
export const date = (iso?: string) => (iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '')
export const dateTime = (iso?: string) => (iso ? `${date(iso)}, ${time(iso)}` : '')

export function ago(iso?: string) {
  if (!iso) return ''
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} h ${m % 60} min ago`
  return `${Math.floor(h / 24)} d ago`
}
export const minsSince = (iso?: string) => (iso ? Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000)) : 0)
export const fmtMins = (m: number) => (m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`)

export const initials = (name: string) =>
  name.replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '').split(/\s+/).slice(0, 2).map((s) => s[0]?.toUpperCase() ?? '').join('')

/** Deterministic PRNG for repeatable demo data. */
export function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min: number, max: number) => Math.floor(next() * (max - min + 1)) + min,
    pick: <T,>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    chance: (p: number) => next() < p,
  }
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

export function billTotal(b: { items: { qty: number; rate: number }[]; discount: number }) {
  return Math.max(0, b.items.reduce((s, i) => s + i.qty * i.rate, 0) - b.discount)
}
