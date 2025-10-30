"use client"

import { Moon, Sun } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface HeaderProps {
  isDark: boolean
  onThemeToggle: () => void
}

export function Header({ isDark, onThemeToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 flex items-center justify-center animate-logo-glow">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OPULENCE_BYTE_LOGO-yVoEEbbxj4W0eVmujkKvWHxUPZuiZO.png"
                alt="Opulence Byte Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-xl hidden sm:inline titanium-glow">Opulence Byte</span>
          </Link>

          {/* Navigation */}
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
        </div>
      </div>
    </header>
  )
}
