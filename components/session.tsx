'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Provider, SessionUser } from '@/lib/auth'

type SessionState = { user: SessionUser | null; providers: Provider[]; loading: boolean; signOut: () => Promise<void> }

const SessionContext = createContext<SessionState>({ user: null, providers: [], loading: true, signOut: async () => {} })

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ user: SessionUser | null; providers: Provider[]; loading: boolean }>({ user: null, providers: [], loading: true })

  useEffect(() => {
    let alive = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => alive && setState({ user: data.user ?? null, providers: data.providers ?? [], loading: false }))
      .catch(() => alive && setState((s) => ({ ...s, loading: false })))
    return () => { alive = false }
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    setState((s) => ({ ...s, user: null }))
    window.location.href = '/'
  }, [])

  return <SessionContext.Provider value={{ ...state, signOut }}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}

export function Avatar({ user }: { user: SessionUser }) {
  if (user.image) return <img src={user.image} alt="" referrerPolicy="no-referrer" />
  return <span className="avatar-fallback">{(user.name || user.email).charAt(0).toUpperCase()}</span>
}
