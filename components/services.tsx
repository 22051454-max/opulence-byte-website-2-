"use client"

import { Code2, Shield, Brain, Cloud, Palette, Zap } from "lucide-react"

const services = [
  {
    icon: Code2,
    title: "Web Development",
    description: "Modern, responsive web applications built with cutting-edge technologies and best practices.",
  },
  {
    icon: Palette,
    title: "UI/UX Design",
    description: "Beautiful, intuitive interfaces that engage users and drive conversions.",
  },
  {
    icon: Shield,
    title: "Cybersecurity",
    description: "Comprehensive security solutions to protect your digital assets and data.",
  },
  {
    icon: Brain,
    title: "AI/ML Solutions",
    description: "Intelligent systems powered by machine learning for business automation.",
  },
  {
    icon: Cloud,
    title: "Cloud & DevOps",
    description: "Scalable cloud infrastructure with automated deployment and monitoring.",
  },
  {
    icon: Zap,
    title: "App Development",
    description: "Native and cross-platform mobile applications for iOS and Android.",
  },
]

export function Services() {
  return (
    <section id="services" className="py-20 md:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tech solutions tailored to your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <div
              key={i}
              className="group p-8 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg hover:shadow-accent/20 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <service.icon className="w-12 h-12 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-xl font-bold mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
