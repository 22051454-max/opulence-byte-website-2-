"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface IntroAnimationProps {
  onComplete: () => void
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!clicked) {
        handleClick()
      }
    }, 3000)

    return () => clearTimeout(timer)
  }, [clicked])

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => {
      onComplete()
    }, 1000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020924] cursor-pointer"
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 1 }}
        animate={{ opacity: clicked ? 0 : 1 }}
        transition={{ duration: 0.5, delay: clicked ? 0.5 : 0 }}
      >
        <motion.div
          className="absolute top-0 left-0 right-0 bg-[#0f0f0f] h-1/2 origin-bottom"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: clicked ? 0 : 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-[#0f0f0f] h-1/2 origin-top"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: clicked ? 0 : 1 }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        />

        <motion.div
          className="relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <motion.div
            animate={{
              filter: [
                "drop-shadow(0 0 0px #d4af37)",
                "drop-shadow(0 0 20px #d4af37)",
                "drop-shadow(0 0 10px #d4af37)",
              ],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className="w-64 h-64 relative"
          >
            <Image src="/images/logo.png" alt="Opulence Byte Logo" fill className="object-contain" priority />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
