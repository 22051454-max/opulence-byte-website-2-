'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

// Files were renamed to slide-01..slide-31 (serial order) to avoid unicode spaces in original screenshot names breaking URLs.
const SLIDE_COUNT = 31
const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => ({
  index: i,
  src: `/ppt_photos/slide-${String(i + 1).padStart(2, '0')}.png`,
}))

export default function AwtPptPage() {
  const [current, setCurrent] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((i: number) => {
    setCurrent(((i % slides.length) + slides.length) % slides.length)
  }, [])
  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      stageRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'f' || e.key === 'F') toggleFullscreen()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, prev, toggleFullscreen])

  return (
    <main className="min-h-screen bg-[#f4f8f7] px-4 py-8 text-[#12302f] sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#0b6b63] pb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0b6b63]">AWT Hospital ERP</p>
            <h1 className="mt-2 font-serif text-3xl leading-tight sm:text-4xl">Presentation walkthrough</h1>
            <p className="mt-2 max-w-2xl text-[#486562]">Slide {current + 1} of {slides.length}</p>
          </div>
          <Link href="/awt-workflow" className="border border-[#0b6b63] px-4 py-2 text-sm font-semibold text-[#0b6b63] hover:bg-[#e3f1ee]">
            ← Back to workflow
          </Link>
        </header>

        <div
          ref={stageRef}
          className={`relative mt-6 flex flex-col border border-[#c8dcd8] bg-black ${isFullscreen ? 'h-screen justify-center' : ''}`}
        >
          <div className={`relative w-full ${isFullscreen ? 'flex-1' : 'aspect-video'}`}>
            <Image
              key={slides[current].src}
              src={slides[current].src}
              alt={`Slide ${current + 1} of ${slides.length}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* toggle controls */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:left-4 sm:p-3"
          >
            <span className="block text-xl sm:text-2xl">‹</span>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70 sm:right-4 sm:p-3"
          >
            <span className="block text-xl sm:text-2xl">›</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
            className="absolute right-2 top-2 rounded bg-black/50 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black/70 sm:right-4 sm:top-4 sm:text-sm"
          >
            {isFullscreen ? 'Exit full screen' : 'Full screen'}
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white sm:bottom-4">
            {current + 1} / {slides.length}
          </div>
        </div>

        {/* serial toggle strip */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="border border-[#0b6b63] px-4 py-2 text-sm font-semibold text-[#0b6b63] hover:bg-[#e3f1ee]"
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={next}
            className="border border-[#0b6b63] bg-[#0b6b63] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a5b54]"
          >
            Next →
          </button>
        </div>

        <div className="mt-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
          {slides.map((slide) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(slide.index)}
              aria-label={`Go to slide ${slide.index + 1}`}
              aria-current={slide.index === current}
              className={`relative h-14 w-24 flex-shrink-0 overflow-hidden border-2 sm:h-16 sm:w-28 ${
                slide.index === current ? 'border-[#0b6b63]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={slide.src} alt={`Thumbnail ${slide.index + 1}`} fill sizes="120px" className="object-cover" />
              <span className="absolute bottom-0 right-0 bg-black/60 px-1 text-[10px] font-semibold text-white">{slide.index + 1}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
