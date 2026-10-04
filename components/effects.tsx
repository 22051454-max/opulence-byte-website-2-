'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/** Global motion layer: scroll reveal, scroll progress, pointer spotlight and card tilt/glow. */
export function Effects() {
  const pathname = usePathname()

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target) }
      }
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    const observe = () => document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => (reduce ? el.classList.add('is-visible') : io.observe(el)))
    observe()
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [pathname])

  useEffect(() => {
    const root = document.documentElement
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = root.scrollHeight - window.innerHeight
        root.style.setProperty('--progress', String(max > 0 ? window.scrollY / max : 0))
      })
    }
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const onMove = (event: PointerEvent) => {
      root.style.setProperty('--mx', `${event.clientX}px`)
      root.style.setProperty('--my', `${event.clientY}px`)
      const card = (event.target as Element | null)?.closest?.('.tilt, .card-glow') as HTMLElement | null
      if (!card) return
      const rect = card.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width
      const y = (event.clientY - rect.top) / rect.height
      card.style.setProperty('--gx', `${x * 100}%`)
      card.style.setProperty('--gy', `${y * 100}%`)
      if (card.classList.contains('tilt')) {
        card.style.setProperty('--rx', `${(0.5 - y) * 6}deg`)
        card.style.setProperty('--ry', `${(x - 0.5) * 8}deg`)
      }
    }
    const onLeave = (event: PointerEvent) => {
      const card = (event.target as Element | null)?.closest?.('.tilt') as HTMLElement | null
      if (card && !card.contains(event.relatedTarget as Node)) { card.style.setProperty('--rx', '0deg'); card.style.setProperty('--ry', '0deg') }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    if (fine) { window.addEventListener('pointermove', onMove, { passive: true }); document.addEventListener('pointerout', onLeave) }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onLeave)
    }
  }, [])

  return (
    <>
      <div className="progress-bar" aria-hidden="true" />
      <div className="aurora" aria-hidden="true"><span /><span /><span /></div>
      <div className="spotlight" aria-hidden="true" />
    </>
  )
}
