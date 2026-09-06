"use client"

import { Menu, X, Moon, Sun } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

interface HeaderProps {
  isDark: boolean
  onThemeToggle: () => void
}

export function Header({ isDark, onThemeToggle }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center animate-logo-glow">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OPULENCE_BYTE_LOGO-yVoEEbbxj4W0eVmujkKvWHxUPZuiZO.png"
                alt="Opulence Byte Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-lg sm:text-xl hidden sm:inline titanium-glow">Opulence Byte</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#services" className="text-sm font-medium hover:text-accent transition-colors">
              Services
            </Link>
            <Link href="#team" className="text-sm font-medium hover:text-accent transition-colors">
              Team
            </Link>
            <Link href="/press-release" className="text-sm font-medium hover:text-accent transition-colors">
              Press Release
            </Link>
            <Link href="#contact" className="text-sm font-medium hover:text-accent transition-colors">
              Contact
            </Link>
          </nav>

          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg border border-border hover:border-accent hover:shadow-lg hover:shadow-[#00D0FF]/50 transition-all duration-300 tech-cursor"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-border hover:border-accent transition-colors tech-cursor"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 animate-fade-in-up">
            <Link
              href="#services"
              className="block px-4 py-2 text-sm font-medium hover:text-accent hover:bg-muted rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="#team"
              className="block px-4 py-2 text-sm font-medium hover:text-accent hover:bg-muted rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Team
            </Link>
            <Link
              href="/press-release"
              className="block px-4 py-2 text-sm font-medium hover:text-accent hover:bg-muted rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Press Release
            </Link>
            <Link
              href="#contact"
              className="block px-4 py-2 text-sm font-medium hover:text-accent hover:bg-muted rounded transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
