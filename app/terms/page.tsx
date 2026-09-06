"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect } from "react"

export default function TermsPage() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
    }
  }, [])

  useEffect(() => {
    const html = document.documentElement
    if (isDark) {
      html.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      html.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-8 titanium-glow">Terms and Conditions</h1>

          <div className="space-y-8 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Agreement to Terms</h2>
              <p>
                By accessing and using the Opulence Byte website and services, you accept and agree to be bound by the
                terms and provision of this agreement. If you do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on
                Opulence Byte's website for personal, non-commercial transitory viewing only. This is the grant of a
                license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on the website</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Disclaimer</h2>
              <p>
                The materials on Opulence Byte's website are provided on an 'as is' basis. Opulence Byte makes no
                warranties, expressed or implied, and hereby disclaims and negates all other warranties including,
                without limitation, implied warranties or conditions of merchantability, fitness for a particular
                purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Limitations</h2>
              <p>
                In no event shall Opulence Byte or its suppliers be liable for any damages (including, without
                limitation, damages for loss of data or profit, or due to business interruption) arising out of the use
                or inability to use the materials on Opulence Byte's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Accuracy of Materials</h2>
              <p>
                The materials appearing on Opulence Byte's website could include technical, typographical, or
                photographic errors. Opulence Byte does not warrant that any of the materials on its website are
                accurate, complete, or current. Opulence Byte may make changes to the materials contained on its website
                at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Links</h2>
              <p>
                Opulence Byte has not reviewed all of the sites linked to its website and is not responsible for the
                contents of any such linked site. The inclusion of any link does not imply endorsement by Opulence Byte
                of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Modifications</h2>
              <p>
                Opulence Byte may revise these terms of service for its website at any time without notice. By using
                this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of India, and you
                irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Contact Information</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us at:</p>
              <div className="mt-4 space-y-2">
                <p>Email: contact@opulencebyte.com</p>
                <p>Phone: +91 9142441497</p>
                <p>Address: Ranchi, Jharkhand, India</p>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
