'use client'

import { useEffect, useState } from 'react'

/** Brand intro, shown once per browser session. */
export function Intro() {
  const [state, setState] = useState<'hidden' | 'showing' | 'leaving'>('hidden')
  useEffect(() => {
    let seen = false
    try { seen = sessionStorage.getItem('ob-intro') === '1'; sessionStorage.setItem('ob-intro', '1') } catch { seen = true }
    if (seen || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setState('showing')
    const leave = window.setTimeout(() => setState('leaving'), 1500)
    const done = window.setTimeout(() => setState('hidden'), 2200)
    return () => { window.clearTimeout(leave); window.clearTimeout(done) }
  }, [])
  if (state === 'hidden') return null
  return (
    <div className={`intro ${state === 'leaving' ? 'leaving' : ''}`} aria-hidden="true" onClick={() => setState('leaving')}>
      <div className="intro-inner">
        <img src="/logo-light.png" alt="" />
        <div className="intro-bar"><span /></div>
      </div>
    </div>
  )
}
