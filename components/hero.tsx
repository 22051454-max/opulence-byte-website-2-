'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Particles } from './particles'

export function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
  }

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative pt-20 px-4 bg-gradient-to-br from-background via-background to-secondary/5 overflow-hidden"
    >
      {/* AI Cosmic background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated particles */}
        <Particles count={40} />
        
        {/* Floating orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              width: 100 + i * 50,
              height: 100 + i * 50,
              background: `radial-gradient(circle, ${['#FF6B9D', '#45B7D1', '#96CEB4', '#FF8A65'][i % 4]} 0%, transparent 70%)`,
              top: `${i * 15}%`,
              left: `${i * 20}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="blur-3xl"
          />
        ))}
        
        {/* Grid lines for AI feel */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(0deg, rgba(79, 172, 254, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(79, 172, 254, 0.2) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }} />
        </div>
        
        {/* Main gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-bl from-secondary/30 to-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-accent/30 to-secondary/20 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 7, repeat: Infinity }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="max-w-4xl mx-auto relative z-10 text-center"
      >
        {/* Tagline */}
        <motion.div variants={itemVariants} className="mb-6">
          <span className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-semibold">
            🚀 Enterprise Digital Solutions
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-7xl font-bold text-balance mb-6 leading-tight px-4"
        >
          <span className="bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent">
            Secure. Scalable. Strategic.
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg md:text-xl text-foreground/70 text-balance mb-8 max-w-2xl mx-auto px-4"
        >
          Transform your business with cutting-edge digital solutions. From cloud infrastructure to AI-powered systems, we build resilient platforms that drive innovation and growth.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 w-full"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-xl transition-shadow"
          >
            Get Started
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-lg border-2 border-accent hover:bg-accent/10 font-semibold transition-colors"
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Stats section */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border/50 px-4 w-full"
        >
          {[
            { number: '50+', label: 'Projects Delivered' },
            { number: '99.9%', label: 'System Uptime' },
            { number: '24/7', label: 'Support' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-3 sm:p-4 text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent mb-2">
                {stat.number}
              </div>
              <div className="text-xs sm:text-sm text-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
