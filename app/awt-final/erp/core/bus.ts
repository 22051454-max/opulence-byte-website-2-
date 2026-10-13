/**
 * In-process event bus between services. Services never call into each other's
 * storage; they publish domain events and the owning service reacts (billing
 * listens for chargeable events, notices listen for alerts). The same events
 * map one-to-one onto a message broker topic when services are split out.
 */

export type Events = {
  charge: { patientId: string; desc: string; category: string; rate: number; qty?: number; source: 'OPD' | 'IPD' | 'Emergency' | 'Pharmacy' | 'Diagnostics' | 'OT'; ref?: string }
  notice: { text: string; level: 'info' | 'success' | 'warning' | 'danger'; roles: string[] | 'all'; module?: string }
}

type Handler<K extends keyof Events> = (payload: Events[K]) => void
const handlers: { [K in keyof Events]?: Set<Handler<K>> } = {}

export const bus = {
  on<K extends keyof Events>(event: K, fn: Handler<K>) {
    const set = (handlers[event] ??= new Set() as never) as Set<Handler<K>>
    set.add(fn)
    return () => set.delete(fn)
  },
  emit<K extends keyof Events>(event: K, payload: Events[K]) {
    ;(handlers[event] as Set<Handler<K>> | undefined)?.forEach((fn) => fn(payload))
  },
}
