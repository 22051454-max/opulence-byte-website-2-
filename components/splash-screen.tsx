'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
      onComplete()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, delay: 3.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#1a1f3a] via-[#2d1b4e] to-[#0f2744]"
    >
      {/* Cosmic animated background - AI theme */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              background: `radial-gradient(circle, ${['#FF6B9D', '#C44569', '#45B7D1', '#96CEB4'][i % 4]} 0%, transparent 70%)`,
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [0.9, 1.3, 0.9],
              x: [0, Math.random() * 40 - 20, 0],
              y: [0, Math.random() * 40 - 20, 0],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="blur-3xl"
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo container with glow effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Glow layers - Logo theme colors */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B9D] via-[#C44569] to-[#FF8A65] blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.3, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-[#45B7D1] to-[#96CEB4] blur-2xl"
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [0.8, 1.1, 0.8] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />

          {/* Logo image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-40 h-40 md:w-56 md:h-56"
          >
            <Image
              src="/logo.png"
              alt="Opulence Byte"
              fill
              sizes="(max-width: 768px) 160px, 224px"
              className="object-contain drop-shadow-2xl"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Text animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="inline-block text-blue-400"
            >
              OPULENCE
            </motion.span>
            {' '}
            <motion.span
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="inline-block text-white"
            >
              BYTE
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg md:text-xl text-gray-300 mb-2"
          >
            DESIGN • DEVELOPMENT • DEPLOYMENT
          </motion.p>
        </motion.div>

        {/* Loading animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-12 flex items-center gap-2"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
