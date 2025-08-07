"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id="about" ref={ref} className="py-20 md:py-32 bg-[#0f0f0f]/50 relative">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Who{" "}
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">We Are</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-[#f5d76e]/20 rounded-lg blur-xl"></div>
              <div className="relative glass bg-[#020924]/80 backdrop-blur-sm p-6 rounded-lg border border-[#d4af37]/20">
                <p className="text-lg text-white/80 mb-6">
                  Opulence Byte is a next-generation technology company specializing in creating secure, scalable, and
                  future-proof digital solutions. We combine cutting-edge technology with strategic insight to help
                  businesses transform and thrive in the digital landscape.
                </p>
                <p className="text-lg text-white/80 mb-6">
                  Our team of experts brings decades of combined experience across various technology domains, ensuring
                  that every solution we deliver is built on solid foundations and designed for long-term success.
                </p>
                <div className="mt-8 space-y-4">
                  {[
                    "Industry-leading security practices",
                    "Scalable architecture for growth",
                    "Future-proof technology stack",
                    "24/7 support and maintenance",
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                    >
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                      <span className="text-white/90">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-[#f5d76e]/20 rounded-lg blur-xl"></div>
              <div className="relative glass bg-[#020924]/80 backdrop-blur-sm p-6 rounded-lg border border-[#d4af37]/20">
                <h3 className="text-2xl font-bold mb-6">Meet Our Founder</h3>
                <div className="flex flex-col items-center text-center">
                  <motion.div className="relative mb-6" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                    <div className="absolute -inset-3 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] rounded-full opacity-75 blur-xl animate-pulse"></div>
                    <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37]/50 to-[#f5d76e]/50 rounded-full opacity-50 blur-lg animate-pulse delay-75"></div>
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-[#d4af37]/50 shadow-2xl">
                      <Image
                        src="/images/founder.jpeg"
                        alt="Avinash Singh Munda"
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </motion.div>
                  <h4 className="text-xl font-semibold text-white mb-2">Avinash Singh Munda</h4>
                  <p className="text-[#d4af37] mb-4">Founder, CEO & CTO</p>
                  <p className="text-white/80 mb-6">
                    With over 5 years of experience in technology leadership, Avinash founded Opulence Byte with a
                    vision to create digital solutions that combine security, scalability, and innovation.
                  </p>
                  <p className="text-white/80">
                    His expertise spans cybersecurity, cloud architecture, and digital transformation, making him a
                    trusted advisor to businesses navigating the complexities of the modern digital landscape.
                  </p>
                  <div className="mt-6 flex justify-center gap-4">
                    <motion.a
                      href="https://www.linkedin.com/in/avinash-singh-munda-4a71a0211/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6 9H2V21H6V9Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.a>
                    <motion.a
                      href="https://x.com/avimunda11"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.a>
                    <motion.a
                      href="https://www.facebook.com/profile.php?id=61556124270499"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.a>
                    <motion.a
                      href="https://www.instagram.com/avimunda11/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] hover:bg-[#d4af37] hover:text-[#020924] transition-colors"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                          fill="currentColor"
                        />
                      </svg>
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
