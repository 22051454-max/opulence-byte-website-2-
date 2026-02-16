'use client'

import { motion } from 'framer-motion'

export function SectionDivider() {
  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent my-12"
    />
  )
}
