"use client"

import Image from "next/image"
import Link from "next/link"

const team = [
  {
    name: "Avinash Singh Munda",
    role: "Founder & CEO",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/avinash%20singh%20munda-Azr1jm3yKUpOXKFK0jr94A0uO8lSXx.jpeg",
  },
  {
    name: "Abhishek Singh Munda",
    role: "COO",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/abhishek%20singh%20munda-X8n8lLACTxbOwYM0HrJZ9uHx30Sb8r.jpeg",
  },
  {
    name: "Sandeep Kashyap",
    role: "CTO",
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sandeep-removebg-preview-jB10JhUU5E0yN0ZjOGlVPuNU1z4Jnq.png",
  },
]

export function Team() {
  return (
    <section id="team" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Leadership Team</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visionary leaders driving innovation and excellence
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <Link
              key={i}
              href="/press-release"
              className="group animate-fade-in-up tech-cursor"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-xl mb-6 h-80 bg-muted photo-glow">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-xl font-bold mb-1 group-hover:text-accent transition-colors">{member.name}</h3>
              <p className="text-accent font-semibold">{member.role}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/press-release"
            className="inline-flex items-center gap-2 px-8 py-3 border border-accent text-accent rounded-lg font-semibold hover:bg-accent hover:text-accent-foreground transition-colors tech-cursor"
          >
            View Full Press Release
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
