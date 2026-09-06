"use client"

import { useEffect, useState } from "react"

interface IntroProps {
  onComplete: () => void
}

export function Intro({ onComplete }: IntroProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro")

    if (hasSeenIntro) {
      setIsVisible(false)
      onComplete()
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(false)
      sessionStorage.setItem("hasSeenIntro", "true")
      setTimeout(onComplete, 500)
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-opacity duration-500 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-8">
        {/* Logo with glow effect */}
        <div className="relative animate-glow">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-xl opacity-50"></div>
          <div className="relative bg-slate-900 p-8 rounded-lg border border-slate-700">
            <svg className="w-24 h-24 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 10L70 30L60 40L80 60L50 90L20 60L40 40L30 30Z" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
          </div>
        </div>

        {/* Company name */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">OPULENCE BYTE</h1>
          <p className="text-slate-400 text-lg">Tech Solutions for Tomorrow</p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}
