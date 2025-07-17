"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020924] via-[#0f0f0f] to-[#020924] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#d4af37] hover:text-[#f5d76e] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image src="/images/logo.png" alt="Opulence Byte" fill className="object-contain" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
                Opulence Byte
              </span>
            </Link>
          </div>

          <div className="glass bg-[#0f0f0f]/80 backdrop-blur-xl p-8 rounded-lg border border-[#d4af37]/20">
            <h1 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mb-8"></div>

            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 mb-6">Last updated: January 2025</p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">1. Information We Collect</h2>
                <p className="text-white/80 mb-4">
                  We collect information you provide directly to us, such as when you contact us, request services, or
                  interact with our website.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">2. How We Use Your Information</h2>
                <p className="text-white/80 mb-4">
                  We use the information we collect to provide, maintain, and improve our services, communicate with
                  you, and comply with legal obligations.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">3. Information Sharing</h2>
                <p className="text-white/80 mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your
                  consent, except as described in this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">4. Data Security</h2>
                <p className="text-white/80 mb-4">
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">5. Cookies</h2>
                <p className="text-white/80 mb-4">
                  Our website may use cookies to enhance user experience. You can choose to disable cookies through your
                  browser settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">6. Contact Us</h2>
                <p className="text-white/80 mb-4">
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:contact@opulencebyte.com" className="text-[#d4af37] hover:text-[#f5d76e]">
                    contact@opulencebyte.com
                  </a>
                </p>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
