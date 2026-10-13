'use client'

import { DOCTORS } from '../core/master'

/** Doctor directory lookups (read-only master data). */

export const doctorName = (id?: string) => DOCTORS.find((d) => d.id === id)?.name ?? '—'
export const doctor = (id?: string) => DOCTORS.find((d) => d.id === id)
