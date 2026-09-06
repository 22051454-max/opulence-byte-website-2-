"use client"

import { ArrowRight, Code2, Shield, Cloud, Brain, Palette } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-32">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1B4965]/10 via-transparent to-[#00D0FF]/10"></div>

      {/* Animated tech background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D0FF]/5 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-[#1B4965]/5 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#00D0FF]/3 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left content */}
          <div className="animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="titanium-glow">Digital Transformation</span>
              <br />
              <span className="bg-gradient-to-r from-[#1B4965] to-[#00D0FF] bg-clip-text text-transparent">
                Redefined
              </span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground mb-4 leading-relaxed">
              Opulence Byte is a next-generation technology company specializing in creating secure, scalable, and
              future-proof digital solutions. We combine cutting-edge technology with strategic insight to help
              businesses transform and thrive in the digital landscape.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed">
              Our team of experts brings decades of combined experience across various technology domains, ensuring that
              every solution we deliver is built on solid foundations and designed for long-term success.
            </p>

            <div className="mb-8 space-y-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-[#00D0FF] rounded-full"></span>
                <span>Industry-leading security practices</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-[#00D0FF] rounded-full"></span>
                <span>Scalable architecture for growth</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-[#00D0FF] rounded-full"></span>
                <span>Future-proof technology stack</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="w-2 h-2 bg-[#00D0FF] rounded-full"></span>
                <span>24/7 support and maintenance</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="px-6 sm:px-8 py-3 bg-gradient-to-r from-[#1B4965] to-[#00D0FF] text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-[#00D0FF]/50 transition-all duration-300 flex items-center justify-center gap-2 tech-cursor active:scale-95"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#services"
                className="px-6 sm:px-8 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors tech-cursor active:scale-95"
              >
                Learn More
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12">
              <div>
                <div className="text-2xl sm:text-3xl font-bold titanium-glow">100%</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Client Satisfaction</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold titanium-glow">24/7</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Support Available</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold titanium-glow">6+</div>
                <p className="text-xs sm:text-sm text-muted-foreground">Tech Domains</p>
              </div>
            </div>
          </div>

          {/* Right visual */}
          <div className="relative animate-slide-in-left hidden sm:block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B4965] to-[#00D0FF] rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] rounded-2xl p-6 sm:p-8 border border-[#2D3748]">
              <div className="space-y-4">
                {[
                  { icon: Code2, label: "Web Development" },
                  { icon: Shield, label: "Cybersecurity" },
                  { icon: Brain, label: "AI/ML Solutions" },
                  { icon: Cloud, label: "Cloud & DevOps" },
                  { icon: Palette, label: "UI/UX Design" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg bg-[#2D3748]/50 border border-[#4A5568] hover:border-[#00D0FF]/50 transition-colors tech-cursor"
                  >
                    <item.icon className="w-6 h-6 text-[#00D0FF]" />
                    <span className="font-semibold text-[#E2E8F0]">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
