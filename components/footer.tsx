"use client"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-muted/50 border-t border-border py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Company */}
          <div>
            <h3 className="font-bold text-base sm:text-lg mb-4">Opulence Byte</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Empowering businesses with secure, scalable, and intelligent tech solutions.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4">Services</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#services" className="hover:text-accent transition-colors tech-cursor">
                  Web Development
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors tech-cursor">
                  Cybersecurity
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors tech-cursor">
                  AI/ML Solutions
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-accent transition-colors tech-cursor">
                  Cloud & DevOps
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a href="#team" className="hover:text-accent transition-colors tech-cursor">
                  Team
                </a>
              </li>
              <li>
                <a href="/press-release" className="hover:text-accent transition-colors tech-cursor">
                  Press Release
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors tech-cursor">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors tech-cursor">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm sm:text-base mb-4">Contact</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:contact@opulencebyte.com">contact@opulencebyte.com</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+919142441497">+91 9142441497</a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Ranchi, Jharkhand</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            © 2025 Opulence Byte PVT. LTD. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a
              href="/privacy"
              className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors tech-cursor"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-xs sm:text-sm text-muted-foreground hover:text-accent transition-colors tech-cursor"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
