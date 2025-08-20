"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"

export default function ApproachSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const steps = [
    { number: "01", title: "Discovery & Analysis", description: "We begin by understanding your business goals, challenges, and requirements to create a tailored approach." },
    { number: "02", title: "Strategy & Planning", description: "Our experts develop a comprehensive strategy and roadmap aligned with your business objectives." },
    { number: "03", title: "Design & Development", description: "We create innovative solutions using our platform-driven approach, focusing on automation and observability." },
    { number: "04", title: "Testing & Deployment", description: "Rigorous testing ensures your solution meets the highest standards before seamless deployment." },
    { number: "05", title: "Continuous Improvement", description: "We provide ongoing support and optimization to ensure your solution evolves with your business needs." },
  ]

  return (
    <section id="approach" ref={ref} className="py-16 md:py-32 bg-[#0f0f0f] relative overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
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

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
              Platform-Driven Approach
            </span>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mx-auto mb-6"></div>
          <p className="text-base sm:text-lg text-white/70 max-w-3xl mx-auto">
            Our approach combines automation, observability, and continuous improvement to deliver exceptional results.
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Timeline SVG — hidden on mobile */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none hidden md:block" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#f5d76e" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.3" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {steps.map((_, index) => {
              if (index === steps.length - 1) return null
              const startX = index % 2 === 0 ? "20%" : "80%"
              const endX = (index + 1) % 2 === 0 ? "20%" : "80%"
              const startY = `${20 + index * 20}%`
              const endY = `${20 + (index + 1) * 20}%`

              return (
                <motion.path
                  key={index}
                  d={`M ${startX} ${startY} Q 50% ${(Number.parseInt(startY) + Number.parseInt(endY)) / 2}% ${endX} ${endY}`}
                  stroke="url(#goldGradient)"
                  strokeWidth="2"
                  fill="none"
                  filter="url(#glow)"
                  className="animate-pulse-slow"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                  transition={{ duration: 1.5, delay: index * 0.3 }}
                />
              )
            })}
          </svg>

          {/* Steps */}
          <div className="relative z-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className={`relative mb-12 md:mb-16 flex flex-col md:flex-row items-center ${
                  index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                }`}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
              >
                {/* Card */}
                <motion.div
                  className="relative max-w-md w-full md:w-auto mb-6 md:mb-0 md:mx-8"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/20 to-[#f5d76e]/20 rounded-xl blur-lg opacity-70"></div>
                  <div className="relative glass bg-[#020924]/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl border border-[#d4af37]/30">
                    <h3 className="text-lg sm:text-xl font-bold mb-3 text-white">{step.title}</h3>
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>

                {/* Metallic Ball */}
                <motion.div
                  className="md:absolute left-1/2 md:transform md:-translate-x-1/2 metallic-ball"
                  style={{ top: "50%", transform: "translate(-50%, -50%)" }}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={isInView ? { scale: 1, rotate: 360 } : { scale: 0, rotate: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.2, rotate: 180 }}
                >
                  <div className="relative w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full metallic-gold-ball flex items-center justify-center">
                    <span className="relative text-[#020924] font-bold text-sm sm:text-base md:text-lg z-10">
                      {step.number}
                    </span>
                    <div className="absolute inset-0 rounded-full border-2 border-[#f5d76e]/50 animate-spin-slow"></div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
