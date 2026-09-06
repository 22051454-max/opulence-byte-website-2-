"use client"

import { useEffect, useState } from "react"
import { Intro } from "@/components/intro"
import { HomePage } from "@/components/home-page"
import { CookieBanner } from "@/components/cookie-banner"

export default function Page() {
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    const hasSeenIntro = sessionStorage.getItem("hasSeenIntro")
    if (hasSeenIntro) {
      setShowIntro(false)
    }
  }, [])

  const handleIntroComplete = () => {
    sessionStorage.setItem("hasSeenIntro", "true")
    setShowIntro(false)
  }

  return (
    <>
      {showIntro ? <Intro onComplete={handleIntroComplete} /> : <HomePage />}
      <CookieBanner />
    </>
  )
}
