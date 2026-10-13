'use client'

import { useMemo } from 'react'
import type { DayStat } from '../core/seed'
import { readKey, useRows } from '../core/store'
import { billTotal, dayKey, isToday } from '../core/util'
import { bills } from '../services/billing'
import { diagOrders } from '../services/diagnostics'
import { erCases } from '../services/emergency'
import { admissions, beds } from '../services/ipd'
import { surgeries } from '../services/ot'
import { visits } from '../services/opd'
import { rxOrders } from '../services/pharmacy'

/** Live hospital numbers, computed from every service's data (read model for dashboards and summaries). */
export function useHospitalStats() {
  const v = useRows(visits)
  const er = useRows(erCases)
  const a = useRows(admissions)
  const bd = useRows(beds)
  const s = useRows(surgeries)
  const b = useRows(bills)
  const d = useRows(diagOrders)
  const rx = useRows(rxOrders)
  return useMemo(() => {
    const opdToday = v.filter((x) => isToday(x.createdAt))
    const erToday = er.filter((x) => isToday(x.arrivedAt))
    const admToday = a.filter((x) => isToday(x.admittedAt))
    const disToday = a.filter((x) => isToday(x.dischargedAt))
    const occupied = bd.filter((x) => x.status === 'occupied').length
    const sxToday = s.filter((x) => isToday(x.start))
    let revenue = 0, billedToday = 0
    for (const bill of b) {
      for (const p of bill.payments) if (isToday(p.at)) revenue += p.amount
      if (isToday(bill.createdAt)) billedToday += billTotal(bill)
    }
    const byDept = new Map<string, number>()
    opdToday.forEach((x) => byDept.set(x.dept, (byDept.get(x.dept) ?? 0) + 1))
    const footfall = opdToday.length + erToday.length + admToday.filter((x) => x.source === 'Direct').length
    const history = readKey<DayStat[]>('history', [])
    return {
      footfall,
      opd: { total: opdToday.length, waiting: opdToday.filter((x) => x.status === 'waiting').length, inConsult: opdToday.filter((x) => x.status === 'in-consult').length, done: opdToday.filter((x) => x.status === 'done').length, noShow: opdToday.filter((x) => x.status === 'no-show').length, newPts: opdToday.filter((x) => x.visitType === 'New').length },
      er: { total: erToday.length, open: er.filter((x) => x.status !== 'closed'), red: er.filter((x) => x.status !== 'closed' && x.triage === 'red').length, admitted: erToday.filter((x) => x.disposition === 'Admitted').length },
      ipd: { occupied, total: bd.length, free: bd.filter((x) => x.status === 'free').length, cleaning: bd.filter((x) => x.status === 'cleaning').length, admittedToday: admToday.length, dischargedToday: disToday.length, census: a.filter((x) => x.status === 'admitted').length },
      ot: { today: sxToday.length, live: s.filter((x) => x.status === 'in-progress').length, done: sxToday.filter((x) => x.status === 'completed' || x.status === 'recovery').length, upcoming: sxToday.filter((x) => x.status === 'scheduled' || x.status === 'pre-op').length },
      diag: { pending: d.filter((x) => x.status !== 'reported').length, reportedToday: d.filter((x) => x.status === 'reported' && isToday(x.reportedAt)).length, critical: d.filter((x) => x.critical && isToday(x.reportedAt)).length },
      pharmacy: { pending: rx.filter((x) => x.status === 'pending').length, dispensedToday: rx.filter((x) => x.status === 'dispensed' && isToday(x.dispensedAt)).length },
      revenue, billedToday,
      depts: [...byDept.entries()].sort((x, y) => y[1] - x[1]),
      history: [...history.filter((h) => h.day !== dayKey()), { day: dayKey(), opd: opdToday.length, er: erToday.length, admissions: admToday.length, discharges: disToday.length, surgeries: sxToday.length, revenue }].slice(-14),
    }
  }, [v, er, a, bd, s, b, d, rx])
}
