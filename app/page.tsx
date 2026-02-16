'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Services } from '@/components/services'
import { About } from '@/components/about'
import { FounderSection } from '@/components/founder-section'
import { Footer } from '@/components/footer'
import { Chatbot } from '@/components/chatbot'
import { SplashScreen } from '@/components/splash-screen'
import { motion } from 'framer-motion'

export default function Home() {
  const [showSplash, setShowSplash] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <main className="bg-background text-foreground">
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {!showSplash && (
        <>
          <Navbar />
          <div className="pt-20">
            <Hero />
            <Services />
            <About />
            <FounderSection />
            <Footer />
          </div>
          <Chatbot />
        </>
      )}
    </main>
  )
}
