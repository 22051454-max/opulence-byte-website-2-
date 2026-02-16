'use client'

import { motion } from 'framer-motion'
import { Code, Cloud, Shield, Zap, Palette, Users } from 'lucide-react'

const services = [
  {
    icon: Code,
    title: 'Mobile & Web Development',
    description: 'Custom applications built with latest frameworks and best practices. Responsive, fast, and user-focused.',
  },
  {
    icon: Cloud,
    title: 'Cloud & DevOps Engineering',
    description: 'Scalable cloud infrastructure with automated deployments, monitoring, and optimization.',
  },
  {
    icon: Shield,
    title: 'Cybersecurity',
    description: 'Comprehensive security solutions protecting your systems from threats and vulnerabilities.',
  },
  {
    icon: Zap,
    title: 'AI & ML Solutions',
    description: 'Intelligent systems that learn and adapt. From predictive analytics to intelligent automation.',
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Beautiful, intuitive interfaces that delight users. Design thinking meets technical excellence.',
  },
  {
    icon: Users,
    title: 'Strategic Consulting',
    description: 'Expert guidance for digital transformation. We help you navigate the technology landscape.',
  },
]

export function Services() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="services" className="py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16 px-4"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-balance">
            Core Services
          </h2>
          <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
            Comprehensive solutions tailored to your business needs. From conception to deployment, we've got you covered.
          </p>
        </motion.div>

        {/* Services grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, i) => {
            const Icon = service.icon
            return (
              <motion.div
                key={i}
                variants={cardVariants}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(59, 130, 246, 0.1)' }}
                className="group p-6 sm:p-8 rounded-xl bg-card hover:border-secondary/50 border border-border transition-all duration-300"
              >
                {/* Icon with gradient background */}
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  className="mb-6 w-12 sm:w-14 h-12 sm:h-14 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center"
                >
                  <Icon className="w-6 sm:w-7 h-6 sm:h-7 text-secondary" />
                </motion.div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-secondary transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-foreground/60 group-hover:text-foreground/70 transition-colors">
                  {service.description}
                </p>

                {/* Animated arrow */}
                <motion.div
                  initial={{ x: 0, opacity: 0 }}
                  whileHover={{ x: 5, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 text-secondary"
                >
                  →
                </motion.div>
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
          className="text-center mt-16"
        >
          <p className="text-foreground/60 mb-4">
            Ready to transform your business?
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            Schedule Consultation
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
