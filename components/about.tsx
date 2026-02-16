'use client'

import { motion } from 'framer-motion'
import { Zap, Lock, TrendingUp, Users } from 'lucide-react'

const aboutPoints = [
  {
    icon: Zap,
    title: 'Innovation First',
    description: 'Cutting-edge technology combined with creative problem-solving to deliver exceptional results.',
  },
  {
    icon: Lock,
    title: 'Security at Core',
    description: 'Every solution is built with security as a foundational principle, not an afterthought.',
  },
  {
    icon: TrendingUp,
    title: 'Scalable Growth',
    description: 'Solutions designed to grow with your business, from startup to enterprise scale.',
  },
  {
    icon: Users,
    title: 'Team Excellence',
    description: 'Expert developers, architects, and strategists working together for your success.',
  },
]

export function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-12 sm:py-20 px-4 relative bg-gradient-to-b from-background to-card/50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Why Choose Opulence Byte
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We combine technical expertise with strategic thinking to deliver solutions that drive real business impact.
          </p>
        </motion.div>

        {/* About grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {aboutPoints.map((point, i) => {
            const Icon = point.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ y: -4 }}
                className="p-8 rounded-xl bg-card border border-border/50 hover:border-secondary/50 transition-colors group"
              >
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center mb-6"
                >
                  <Icon className="w-8 h-8 text-secondary" />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                  {point.title}
                </h3>
                <p className="text-foreground/60 group-hover:text-foreground/70 transition-colors">
                  {point.description}
                </p>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 p-8 rounded-xl bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/30 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Start Your Digital Transformation?</h3>
          <p className="text-foreground/70 mb-6 max-w-2xl mx-auto">
            Let's discuss how Opulence Byte can help you achieve your business goals with cutting-edge technology and strategic guidance.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            Get Your Free Consultation
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
