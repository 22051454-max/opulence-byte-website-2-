'use client'

import { useSyncExternalStore } from 'react'
import { DEMO_USERS } from '../core/rbac'
import { collection, readKey, writeKey } from '../core/store'
import type { AuditEntry, Notice, Role, User } from '../core/types'
import { nowIso, uid } from '../core/util'
import { bus } from '../core/bus'

/** Identity service: users, sessions, audit trail and notices. */

export const users = collection<User>('users')
export const audit = collection<AuditEntry>('audit')
export const notices = collection<Notice>('notices')

let current: User | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export const session = {
  get: () => current,
  subscribe: (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn) } },
  restore() {
    const id = readKey<string | null>('session', null)
    current = id ? users.get(id) ?? null : null
    if (current && !current.active) current = null
    emit()
  },
  login(username: string, password: string): User | string {
    const u = users.all().find((x) => x.username.toLowerCase() === username.trim().toLowerCase())
    if (!u || u.password !== password) return 'Wrong username or password.'
    if (!u.active) return 'This account is disabled. Ask the admin.'
    current = u
    writeKey('session', u.id)
    log('Signed in', `${u.name} signed in`)
    emit()
    return u
  },
  logout() {
    if (current) log('Signed out', `${current.name} signed out`)
    current = null
    writeKey('session', null)
    emit()
  },
}

export function useSession() {
  return useSyncExternalStore(session.subscribe, session.get, () => null)
}

export function me(): User {
  if (!current) throw new Error('Not signed in')
  return current
}

export function log(action: string, detail: string) {
  const u = current
  audit.insert({ id: uid('a'), at: nowIso(), user: u?.name ?? 'System', role: u?.role ?? 'superadmin', action, detail })
  // keep the log bounded in browser storage
  const rows = audit.all()
  if (rows.length > 1500) audit.replace(rows.slice(0, 1200))
}

export function notify(text: string, level: Notice['level'] = 'info', roles: Role[] | 'all' = 'all', module?: string) {
  notices.insert({ id: uid('n'), at: nowIso(), text, level, roles, module })
  const rows = notices.all()
  if (rows.length > 200) notices.replace(rows.slice(0, 150))
}
bus.on('notice', (n) => notify(n.text, n.level, n.roles as Role[] | 'all', n.module))

export function addUser(u: Omit<User, 'id' | 'active'>) {
  if (users.all().some((x) => x.username.toLowerCase() === u.username.toLowerCase())) return 'That username is taken.'
  const row = users.insert({ ...u, id: uid('u'), active: true })
  log('User created', `${row.name} (${row.role})`)
  return row
}

export function setUserActive(id: string, active: boolean) {
  const u = users.update(id, { active })
  if (u) log(active ? 'User enabled' : 'User disabled', u.name)
}

export function resetPassword(id: string, password: string) {
  const u = users.update(id, { password })
  if (u) log('Password reset', u.name)
}

export function seedUsers() {
  users.replace(DEMO_USERS)
}
