'use client'

import { createContext, useContext } from 'react'
import type { ModuleId } from '../core/rbac'
import type { User } from '../core/types'

export type AppApi = {
  user: User
  go: (m: ModuleId) => void
  openPatient: (patientId: string) => void
  reportIssue: () => void
}

export const AppCtx = createContext<AppApi | null>(null)
export function useApp() {
  const v = useContext(AppCtx)
  if (!v) throw new Error('AppCtx missing')
  return v
}
