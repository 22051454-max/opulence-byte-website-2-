'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Mail, MapPin, Phone } from 'lucide-react'

const quickLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

const services = [
  'Web Development',
  'Mobile Apps',
  'Cloud Solutions',
  'Cybersecurity',
  'AI & ML',
  'DevOps',
]

export function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  }

  return (
    <footer id="contact" className="bg-card border-t border-border relative py-12 sm:py-16 md:py-20">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -bottom-40 -right-40 w-60 sm:w-80 h-60 sm:h-80 bg-gradient-to-bl from-secondary/10 to-accent/10 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12"
          >
            {/* Brand column */}
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Opulence Byte"
                  width={40}
                  height={40}
                  className="drop-shadow-lg"
                />
                <span className="text-lg font-bold text-white">Opulence Byte</span>
              </div>
              <p className="text-foreground/60 text-sm leading-relaxed">
                Empowering businesses with secure, scalable digital solutions. Your trusted partner for digital transformation.
              </p>
            </motion.div>

            {/* Quick links */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={link.href}
                      className="text-foreground/60 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Services */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-6">Services</h4>
              <ul className="space-y-3">
                {services.map((service, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href="#"
                      className="text-foreground/60 hover:text-accent transition-colors text-sm"
                    >
                      {service}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact info */}
            <motion.div variants={itemVariants}>
              <h4 className="font-bold text-white mb-6">Contact</h4>
              <div className="space-y-4">
                <motion.a
                  href="tel:8084364410"
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 text-foreground/60 hover:text-accent transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>+91 80843 64410</span>
                </motion.a>

                <motion.a
                  href="mailto:contact@opulencebyte.com"
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3 text-foreground/60 hover:text-accent transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>contact@opulencebyte.com</span>
                </motion.a>

                <div className="flex items-start gap-3 text-foreground/60 text-sm">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>India</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8"
          />

          {/* Bottom section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-foreground/60"
          >
            <p>© 2024 Opulence Byte. All rights reserved.</p>

            <div className="flex gap-6">
              {['Privacy', 'Terms', 'Cookies'].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className="hover:text-accent transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
