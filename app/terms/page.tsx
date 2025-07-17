"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
              Terms & Conditions
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mb-8"></div>

            <div className="prose prose-invert max-w-none">
              <p className="text-white/80 mb-6">Last updated: January 2025</p>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">1. Acceptance of Terms</h2>
                <p className="text-white/80 mb-4">
                  By accessing and using Opulence Byte's services, you accept and agree to be bound by the terms and
                  provision of this agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">2. Services</h2>
                <p className="text-white/80 mb-4">
                  Opulence Byte provides technology consulting, software development, cybersecurity, and digital
                  transformation services. We reserve the right to modify or discontinue services at any time.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">3. Intellectual Property</h2>
                <p className="text-white/80 mb-4">
                  All content, trademarks, and intellectual property on this website are owned by Opulence Byte unless
                  otherwise stated. Unauthorized use is prohibited.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">4. Privacy</h2>
                <p className="text-white/80 mb-4">
                  Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use,
                  and protect your information.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">5. Limitation of Liability</h2>
                <p className="text-white/80 mb-4">
                  Opulence Byte shall not be liable for any indirect, incidental, special, or consequential damages
                  arising from the use of our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-[#d4af37]">6. Contact Information</h2>
                <p className="text-white/80 mb-4">
                  For questions about these Terms & Conditions, please contact us at{" "}
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
