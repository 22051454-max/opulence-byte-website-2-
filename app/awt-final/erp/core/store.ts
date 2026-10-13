'use client'

import { useSyncExternalStore } from 'react'
import type { Base } from './types'

/**
 * Collection store. Each service owns its collections and nothing else reads
 * or writes them directly, the same boundary a microservice has around its own
 * database. Today a collection persists to the browser (one localStorage key
 * per collection, written off the main path); swapping `adapter` for an HTTP
 * client points every service at a real backend without touching the UI.
 */

const PREFIX = 'smi:v1:'

export interface StorageAdapter {
  load(name: string): unknown[] | null
  save(name: string, rows: unknown[]): void
}

const browserAdapter: StorageAdapter = {
  load(name) {
    try {
      const raw = localStorage.getItem(PREFIX + name)
      return raw ? (JSON.parse(raw) as unknown[]) : null
    } catch { return null }
  },
  save(name, rows) {
    try { localStorage.setItem(PREFIX + name, JSON.stringify(rows)) } catch { /* quota or private mode: keep in memory */ }
  },
}

export const adapter: StorageAdapter = browserAdapter

const registry = new Map<string, Collection<Base>>()
const idle = (fn: () => void) => {
  const w = globalThis as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout: 400 })
  else setTimeout(fn, 60)
}

export class Collection<T extends Base> {
  private rows: T[] = []
  private byId = new Map<string, T>()
  private listeners = new Set<() => void>()
  private dirty = false
  private loaded = false

  constructor(readonly name: string) {
    registry.set(name, this as unknown as Collection<Base>)
  }

  private ensure() {
    if (this.loaded || typeof window === 'undefined') return
    this.loaded = true
    const data = adapter.load(this.name)
    if (data) this.replace(data as T[], false)
  }

  /** Stable snapshot for React (new array identity only when data changes). */
  all = (): T[] => { this.ensure(); return this.rows }
  get = (id: string | undefined): T | undefined => { this.ensure(); return id ? this.byId.get(id) : undefined }
  where = (fn: (row: T) => boolean): T[] => this.all().filter(fn)

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  replace(rows: T[], persist = true) {
    this.rows = rows
    this.byId = new Map(rows.map((r) => [r.id, r]))
    this.emit(persist)
  }

  insert(row: T): T {
    this.ensure()
    this.rows = [row, ...this.rows]
    this.byId.set(row.id, row)
    this.emit()
    return row
  }

  update(id: string, patch: Partial<T> | ((row: T) => Partial<T>)): T | undefined {
    this.ensure()
    const current = this.byId.get(id)
    if (!current) return undefined
    const next = { ...current, ...(typeof patch === 'function' ? patch(current) : patch) } as T
    this.byId.set(id, next)
    this.rows = this.rows.map((r) => (r.id === id ? next : r))
    this.emit()
    return next
  }

  remove(id: string) {
    this.ensure()
    this.rows = this.rows.filter((r) => r.id !== id)
    this.byId.delete(id)
    this.emit()
  }

  /** Re-read after another tab wrote this collection. */
  reload() {
    const data = adapter.load(this.name)
    if (data) this.replace(data as T[], false)
  }

  flush() {
    if (!this.dirty) return
    this.dirty = false
    adapter.save(this.name, this.rows)
  }

  private emit(persist = true) {
    if (persist && !this.dirty) {
      this.dirty = true
      idle(() => this.flush())
    }
    this.listeners.forEach((l) => l())
  }
}

export function collection<T extends Base>(name: string) {
  return (registry.get(name) as unknown as Collection<T>) ?? new Collection<T>(name)
}

/** Subscribe a component to a collection. */
export function useRows<T extends Base>(c: Collection<T>): T[] {
  return useSyncExternalStore(c.subscribe, c.all, () => EMPTY as T[])
}
const EMPTY: Base[] = []

/** Small key/value settings store, same persistence rules. */
export function readKey<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch { return fallback }
}
export function writeKey(key: string, value: unknown) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* ignore */ }
}

/** Keep tabs in sync: a write in one tab reloads that collection in the others. */
export function startCrossTabSync() {
  const onStorage = (e: StorageEvent) => {
    if (!e.key?.startsWith(PREFIX)) return
    registry.get(e.key.slice(PREFIX.length))?.reload()
  }
  const flushAll = () => registry.forEach((c) => c.flush())
  window.addEventListener('storage', onStorage)
  window.addEventListener('pagehide', flushAll)
  return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('pagehide', flushAll) }
}

export function clearAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k))
  } catch { /* ignore */ }
}

export function storageUsedKb() {
  let total = 0
  try { for (const k of Object.keys(localStorage)) if (k.startsWith(PREFIX)) total += (localStorage.getItem(k)?.length ?? 0) * 2 } catch { /* ignore */ }
  return Math.round(total / 1024)
}

export function allCollections() { return [...registry.values()] }
