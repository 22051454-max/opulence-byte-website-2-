"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"
import Image from "next/image"
import { useState, useEffect } from "react"

export default function PressReleasePage() {
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
    } else {
      html.classList.remove("dark")
    }
  }, [isDark])

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <Header isDark={isDark} onThemeToggle={() => setIsDark(!isDark)} />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Opulence Byte Launches Revolutionary Tech Solutions</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Founded in 2024, Opulence Byte is dedicated to delivering secure, scalable, and high-performance digital
              solutions.
            </p>
            <p className="text-sm text-muted-foreground">Published: October 2024</p>
          </div>

          {/* Content */}
          <article className="prose prose-invert max-w-none mb-16 space-y-8">
            <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-3xl font-bold mb-4">About Opulence Byte</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Opulence Byte is a technology company founded by Avinash Singh Munda, dedicated to delivering secure,
                scalable, and high-performance digital solutions that empower businesses to thrive in today's
                competitive environment.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mt-4">
                Our mission is simple: enable digital transformation with security at its core — combining innovative
                engineering, operational excellence, and strategic technology consulting to help organizations build
                smarter, scale faster, and stay future-ready.
              </p>
            </section>

            <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="text-3xl font-bold mb-4">Core Services</h2>
              <ul className="space-y-3 text-lg text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Mobile & Web Application Development</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Cloud & DevOps Engineering</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>Cybersecurity Solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>AI & ML-Powered Solutions</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-accent font-bold">•</span>
                  <span>UI/UX & Product Design</span>
                </li>
              </ul>
            </section>

            <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <h2 className="text-3xl font-bold mb-4">Leadership Team</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Opulence Byte is led by a dedicated team of visionary leaders focused on AI-powered innovation, digital
                solutions, and cybersecurity.
              </p>

              {/* Team Members */}
              <div className="grid md:grid-cols-3 gap-8 mt-8">
                {/* Avinash */}
                <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
                  <div className="relative overflow-hidden rounded-xl mb-4 h-64 bg-muted">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avinash%20singh%20munda-Azr1jm3yKUpOXKFK0jr94A0uO8lSXx.jpeg"
                      alt="Avinash Singh Munda"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Avinash Singh Munda</h3>
                  <p className="text-accent font-semibold mb-3">Founder & CEO</p>
                  <p className="text-muted-foreground leading-relaxed">
                    DevOps & Cloud Engineer with expertise in platform architecture, infrastructure-as-code, CI/CD, and
                    DevSecOps. Avinash guides the company's vision and engineering roadmap, ensuring every solution is
                    resilient, efficient, and built for long-term scale.
                  </p>
                </div>

                {/* Abhishek */}
                <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
                  <div className="relative overflow-hidden rounded-xl mb-4 h-64 bg-muted">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abhishek%20singh%20munda-X8n8lLACTxbOwYM0HrJZ9uHx30Sb8r.jpeg"
                      alt="Abhishek Singh Munda"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Abhishek Singh Munda</h3>
                  <p className="text-accent font-semibold mb-3">Chief Operating Officer</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Strategic operations leader responsible for business development, client relations, and operational
                    excellence. Abhishek ensures seamless execution of projects and maintains the highest standards of
                    service delivery.
                  </p>
                </div>

                {/* Sandeep */}
                <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
                  <div className="relative overflow-hidden rounded-xl mb-4 h-64 bg-muted">
                    <Image
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sandeep-removebg-preview-jB10JhUU5E0yN0ZjOGlVPuNU1z4Jnq.png"
                      alt="Sandeep Kashyap"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Sandeep Kashyap</h3>
                  <p className="text-accent font-semibold mb-3">Chief Technology Officer</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Cybersecurity enthusiast and AI/ML architect with experience at JAP-IT and SAIL. Sandeep leads
                    technical innovation, architecting AI/ML systems and facilitating scalable digital transformation
                    initiatives.
                  </p>
                </div>
              </div>
            </section>

            <section className="animate-fade-in-up" style={{ animationDelay: "0.7s" }}>
              <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you are a startup aiming for rapid growth or an enterprise seeking modernization, Opulence Byte
                is your trusted partner for building intelligent, resilient, and future-proof digital platforms. We
                specialize in designing, building, and securing modern infrastructure and software systems that are
                robust, resilient, and aligned with business goals.
              </p>
            </section>

            <section className="animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
              <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
              <div className="space-y-3 text-lg text-muted-foreground">
                <p>
                  <strong className="text-foreground">Website:</strong> www.opulencebyte.com
                </p>
                <p>
                  <strong className="text-foreground">Email:</strong> contact@opulencebyte.com
                </p>
                <p>
                  <strong className="text-foreground">Phone:</strong> +91 9142441497
                </p>
                <p>
                  <strong className="text-foreground">Location:</strong> Ranchi, Jharkhand, India
                </p>
              </div>
            </section>
          </article>
        </main>

        <Chatbot />
        <Footer />
      </div>
    </div>
  )
}
