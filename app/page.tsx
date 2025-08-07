"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import IntroAnimation from "@/components/intro-animation"
import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import AboutSection from "@/components/about-section"
import ServicesSection from "@/components/services-section"
import ApproachSection from "@/components/approach-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import ParticlesBackground from "@/components/particles-background"
import CustomCursor from "@/components/custom-cursor"
import ChatBot from "@/components/chatbot"

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const handleIntroComplete = () => {
    setIntroComplete(true)
    setTimeout(() => {
      setShowContent(true)
    }, 500)
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <CustomCursor />
      <AnimatePresence>{!introComplete && <IntroAnimation onComplete={handleIntroComplete} />}</AnimatePresence>

      {showContent && (
        <>
          <ParticlesBackground />
          <Navbar />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <ApproachSection />
            <ContactSection />
            <Footer />
          </motion.div>
          <ChatBot />
        </>
      )}
    </main>
  )
}
