'use client'

import { useEffect, useState } from 'react'
import { HOSPITAL } from '../core/master'
import { cx } from '../core/util'
import { Logo } from '../ui/Logo'

/** 2.5 second brand intro, every time /awt-final opens. Click to skip. */
export function Intro({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    const leave = setTimeout(() => setLeaving(true), 2500)
    const done = setTimeout(onDone, 3000)
    return () => { clearTimeout(leave); clearTimeout(done) }
  }, [onDone])
  return (
    <div className={cx('smi-intro', leaving && 'leaving')} onClick={() => { setLeaving(true); setTimeout(onDone, 350) }} role="presentation">
      <div className="inner">
        <Logo size={132} animate className="logo-big" />
        <h1><span>SM Imperial</span> Hospital</h1>
        <p>{HOSPITAL.tagline}</p>
        <p className="full">{HOSPITAL.fullName} · {HOSPITAL.nabh}</p>
        <svg className="ecg" viewBox="0 0 520 46" aria-hidden="true">
          <path d="M0 23 H170 L182 23 L190 8 L200 40 L210 2 L220 34 L228 23 H330 L338 16 L346 30 L352 23 H520" fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="bar"><i /></div>
      </div>
    </div>
  )
}
