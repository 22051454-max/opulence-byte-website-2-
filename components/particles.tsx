'use client'

import { motion } from 'framer-motion'

interface ParticlesProps {
  count?: number
  className?: string
}

export function Particles({ count = 50, className = '' }: ParticlesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {[...Array(count)].map((_, i) => {
        const x = Math.random() * 100
        const y = Math.random() * 100
        const duration = Math.random() * 20 + 10
        const delay = Math.random() * 5
        const size = Math.random() * 3 + 1

        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-accent/40"
            style={{
              width: size,
              height: size,
              left: `${x}%`,
              top: `${y}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -100, -200],
              x: [0, Math.random() * 50 - 25, 0],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}
