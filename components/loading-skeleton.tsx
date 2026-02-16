'use client'

import { motion } from 'framer-motion'

export function LoadingSkeleton() {
  const shimmer = {
    animate: {
      backgroundPosition: ['0% 50%', '100% 50%'],
    },
  }

  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          variants={shimmer}
          animate="animate"
          transition={{ duration: 2, repeat: Infinity }}
          className="h-40 rounded-lg bg-gradient-to-r from-muted via-background to-muted bg-[200%_100%]"
        />
      ))}
    </div>
  )
}
