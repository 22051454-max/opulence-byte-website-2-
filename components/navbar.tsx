"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Approach", href: "#approach" },
    { name: "Contact", href: "#contact" },
  ]

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled ? "glass bg-[#020924]/80 backdrop-blur-md border-b border-[#d4af37]/10" : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-10 h-10">
                <Image src="/images/logo.png" alt="Opulence Byte" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                Opulence Byte
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-white/80 hover:text-[#d4af37] transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#d4af37] transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
              <Link href="/login">
                <Button className="bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 glow-on-hover">Get Started</Button>
              </Link>
            </nav>

            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-50 glass bg-[#020924]/95 backdrop-blur-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center p-4 border-b border-[#d4af37]/10">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  <Image src="/images/logo.png" alt="Opulence Byte" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                  Opulence Byte
                </span>
              </Link>
              <button className="text-white" onClick={() => setMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col gap-6 p-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="text-xl text-white/80 hover:text-[#d4af37]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </motion.a>
              ))}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Link href="/login">
                  <Button className="w-full bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 mt-4">Get Started</Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
