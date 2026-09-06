"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"
import { Hero } from "./hero"
import { Services } from "./services"
import { Team } from "./team"
import { Chatbot } from "./chatbot"
import { Footer } from "./footer"

export function HomePage() {
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
        <Hero />
        <Services />
        <Team />
        <Chatbot />
        <Footer />
      </div>
    </div>
  )
}
