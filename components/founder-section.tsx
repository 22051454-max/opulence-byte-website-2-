'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export function FounderSection() {
  return (
    <section id="about" className="py-12 sm:py-20 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent text-sm font-semibold mb-6"
            >
              Meet Our Founder
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-balance"
            >
              Avinash Singh Munda
              <span className="block text-secondary">Visionary & Innovator</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-foreground/70 mb-6 leading-relaxed"
            >
              With a passion for digital innovation and a commitment to excellence, Avinash founded Opulence Byte to empower businesses through strategic technology solutions. His vision is to bridge the gap between complex technology and practical business outcomes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-4 mb-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Strategic Leadership</h4>
                  <p className="text-foreground/60">Guiding teams through digital transformation with clear vision and practical expertise.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Technical Innovation</h4>
                  <p className="text-foreground/60">Combining cutting-edge technology with business acumen to deliver real value.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">Client-Centric Approach</h4>
                  <p className="text-foreground/60">Every solution is tailored to solve unique business challenges and drive growth.</p>
                </div>
              </div>
            </motion.div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-6 pt-8 border-t border-border"
            >
              <a
                href="tel:8084364410"
                className="flex items-center gap-3 text-accent hover:text-secondary transition-colors font-semibold"
              >
                <span>📞</span>
                +91 80843 64410
              </a>
            </motion.div>
          </motion.div>

          {/* Right side - Animated Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Animated background elements */}
            <motion.div
              className="absolute -inset-4 bg-gradient-to-br from-secondary/20 via-accent/20 to-secondary/10 rounded-2xl blur-2xl"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Inner glow */}
            <motion.div
              className="absolute -inset-2 rounded-xl bg-gradient-to-tr from-accent/30 to-transparent"
              animate={{ opacity: [0.3, 0.6, 0.3], rotate: [0, 360] }}
              transition={{ duration: 6, repeat: Infinity }}
            />

            {/* Image container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-accent/30 backdrop-blur-sm">
              {/* Overlay gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              {/* Image */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative h-96 md:h-[500px]"
              >
                <Image
                  src="/founder-face.png"
                  alt="Avinash Singh Munda - Founder & CEO"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </motion.div>

              {/* Corner accent */}
              <motion.div
                className="absolute top-4 right-4 w-20 h-20 rounded-full bg-gradient-to-br from-accent to-secondary opacity-20"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div
                className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-tr from-secondary to-accent opacity-20"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
              />
            </div>

            {/* Title overlay at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-6 text-center"
            >
              <h3 className="text-2xl font-bold">Avinash Singh Munda</h3>
              <p className="text-accent font-semibold mt-1">Founder & CEO, Opulence Byte</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
