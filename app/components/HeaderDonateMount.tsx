'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import DonateButton from './DonateButton'

export default function HeaderDonateMount() {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    function tryFind() {
      const target = document.querySelector('.nav-actions') as HTMLElement | null
      if (target) setContainer(target)
    }
    tryFind()
    const obs = new MutationObserver(() => tryFind())
    obs.observe(document.body, { childList: true, subtree: true })
    return () => obs.disconnect()
  }, [])

  if (!container) return null
  return createPortal(<DonateButton />, container)
}
