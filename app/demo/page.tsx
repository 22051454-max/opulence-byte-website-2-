"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Pause, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function DemoPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // AWS Infra Security Services - Single comprehensive project with different sections
  const projectSections = [
    {
      id: 1,
      title: "Homepage - Professional Security Services",
      description:
        "The main landing page showcasing AWS Infra Security Services with professional branding, featuring their eagle logo and comprehensive security solutions. Highlights their commitment to protecting businesses from threats with professional armed security personnel.",
      image: "/images/aws-infra-home.jpeg",
      section: "Homepage",
      features: [
        "Professional Branding",
        "Security Personnel Showcase",
        "Threat Protection Focus",
        "Corporate Identity",
      ],
    },
    {
      id: 2,
      title: "Mission & Vision - Security Excellence",
      description:
        "Dedicated section outlining the company's mission to provide comprehensive security solutions and their vision for industry leadership. Features advanced control room systems, 24x7 monitoring capabilities, and commitment to excellence in security services.",
      image: "/images/aws-infra-2.png",
      section: "Mission & Vision",
      features: ["Control Room Systems", "24x7 Monitoring", "Security Excellence", "Industry Leadership"],
    },
    {
      id: 3,
      title: "Manned Guarding Services",
      description:
        "Comprehensive overview of professional security personnel services including trained guards, residential protection, and specialized industry security. All personnel undergo rigorous 160-hour PSARA training for maximum effectiveness.",
      image: "/images/aws-infra-3.png",
      section: "Services",
      features: ["PSARA Training", "Professional Guards", "Residential Security", "Industry Specialization"],
    },
    {
      id: 4,
      title: "Security Systems & Technology",
      description:
        "Advanced security systems integration including CCTV surveillance, access control systems, fire detection, and electronic security solutions. Complete technology stack for comprehensive security management and monitoring.",
      image: "/images/aws-infra-4.png",
      section: "Technology",
      features: ["CCTV Systems", "Access Control", "Fire Detection", "Electronic Security"],
    },
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % projectSections.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + projectSections.length) % projectSections.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Auto-play functionality
  useState(() => {
    if (isAutoPlaying) {
      const interval = setInterval(nextSlide, 6000)
      return () => clearInterval(interval)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020924] via-[#0f0f0f] to-[#020924]">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#d4af37]/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f5d76e] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/images/logo.png" alt="Opulence Byte" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                Opulence Byte
              </span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                Featured Project
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mx-auto mb-6"></div>
            <p className="text-lg text-white/70 max-w-3xl mx-auto mb-4">
              AWS Infra Security Services - A comprehensive security solutions platform providing professional manned
              guarding, advanced security systems, and complete protection services.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-white/50">
              <span>Visit:</span>
              <a
                href="https://www.awsispl.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#d4af37] hover:text-[#f5d76e] transition-colors inline-flex items-center gap-1"
              >
                www.awsispl.com
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <Card className="glass bg-[#0f0f0f]/80 backdrop-blur-xl border-[#d4af37]/20 overflow-hidden">
            <CardContent className="p-0">
              {/* Main carousel area */}
              <div className="relative h-[500px] md:h-[600px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="absolute inset-0 grid md:grid-cols-2 gap-0"
                  >
                    {/* Project Image */}
                    <div className="relative bg-gradient-to-br from-[#d4af37]/10 to-[#f5d76e]/10 flex items-center justify-center p-4">
                      <div className="relative w-full h-full max-w-lg max-h-96 mx-auto">
                        <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37]/30 to-[#f5d76e]/30 rounded-lg blur-lg"></div>
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-[#d4af37]/30 shadow-2xl">
                          <Image
                            src={projectSections[currentSlide].image || "/placeholder.svg"}
                            alt={projectSections[currentSlide].title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <div className="mb-3">
                          <span className="px-3 py-1 rounded-full bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 text-xs font-semibold">
                            {projectSections[currentSlide].section}
                          </span>
                        </div>

                        <h3 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                          {projectSections[currentSlide].title}
                        </h3>
                        <p className="text-white/70 mb-6 leading-relaxed">
                          {projectSections[currentSlide].description}
                        </p>

                        {/* Features */}
                        <div className="mb-8">
                          <h4 className="text-sm font-semibold text-[#d4af37] mb-3">Key Features</h4>
                          <div className="flex flex-wrap gap-2">
                            {projectSections[currentSlide].features.map((feature, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 rounded-full bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 text-sm"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Section Counter */}
                        <div className="text-sm text-white/50">
                          Section {currentSlide + 1} of {projectSections.length}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#d4af37]/10 backdrop-blur-sm border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-all duration-300 z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-[#d4af37]/10 backdrop-blur-sm border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-all duration-300 z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Bottom Controls */}
              <div className="p-6 bg-[#020924]/50 backdrop-blur-sm border-t border-[#d4af37]/10">
                <div className="flex items-center justify-between">
                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {projectSections.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === currentSlide ? "bg-[#d4af37] scale-125" : "bg-[#d4af37]/30 hover:bg-[#d4af37]/50"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Auto-play Control */}
                  <button
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 text-[#d4af37] hover:bg-[#d4af37]/20 transition-colors text-sm"
                  >
                    {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isAutoPlaying ? "Pause" : "Play"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Project Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-4xl mx-auto mt-12"
        >
          <Card className="glass bg-[#0f0f0f]/60 backdrop-blur-xl border-[#d4af37]/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                Project Overview
              </h3>
              <p className="text-white/70 text-center mb-6 leading-relaxed">
                AWS Infra Security Services represents a comprehensive security solutions platform developed by Opulence
                Byte. This project showcases our expertise in creating professional security service websites with
                modern design, comprehensive service showcases, and user-friendly navigation for the security industry.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="text-[#d4af37] font-semibold mb-2">Industry</h4>
                  <p className="text-white/70 text-sm">Security Services</p>
                </div>
                <div>
                  <h4 className="text-[#d4af37] font-semibold mb-2">Services</h4>
                  <p className="text-white/70 text-sm">Web Development, Branding</p>
                </div>
                <div>
                  <h4 className="text-[#d4af37] font-semibold mb-2">Technology</h4>
                  <p className="text-white/70 text-sm">Modern Web Technologies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-white/70 mb-6">Ready to start your next project?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/#contact">
              <Button className="bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 glow-on-hover px-8 py-3">
                Get Started Today
              </Button>
            </Link>
            <a href="https://www.awsispl.com" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] px-8 py-3 bg-transparent"
              >
                Visit Live Site
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
