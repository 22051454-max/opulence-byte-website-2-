"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Smartphone, Cloud, Shield, Palette, Database, BarChart3 } from "lucide-react"
export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const services = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Mobile & Web App Dev",
      description:
        "Custom mobile and web applications built with cutting-edge technologies for exceptional user experiences.",
    },
    {
      icon: <Cloud className="w-8 h-8" />,
      title: "Cloud & DevOps",
      description:
        "Scalable cloud infrastructure and DevOps practices to optimize your development pipeline and operations.",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Cybersecurity",
      description: "Comprehensive security solutions to protect your digital assets and ensure business continuity.",
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "UI/UX & Consulting",
      description:
        "User-centered design and strategic consulting to create intuitive and engaging digital experiences.",
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Data Engineering",
      description: "Robust data infrastructure and analytics solutions to help you make data-driven decisions.",
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "AI & ML Integration",
      description: "Leverage artificial intelligence and machine learning to automate processes, personalize experiences, and drive smarter decisions.",
    },
  ]

  return (
    <section id="services" ref={ref} className="py-20 md:py-32 bg-[#020924] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGFmMzciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Our{" "}
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">Services</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative h-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#d4af37]/0 to-[#d4af37]/0 rounded-xl opacity-70 blur-lg group-hover:from-[#d4af37]/20 group-hover:to-[#f5d76e]/20 transition-all duration-500"></div>
                <div className="relative glass bg-[#0f0f0f]/50 backdrop-blur-sm p-8 rounded-xl border border-[#d4af37]/10 group-hover:border-[#d4af37]/30 transition-all duration-300 h-full">
                  <motion.div
                    className="w-16 h-16 rounded-lg bg-[#d4af37]/10 flex items-center justify-center mb-6 text-[#d4af37] group-hover:bg-[#d4af37]/20 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    {service.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-[#d4af37] transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-white/70">{service.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
