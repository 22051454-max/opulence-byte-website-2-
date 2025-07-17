"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ContactSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState),
      })

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for your message. We'll get back to you soon.",
        })
        setFormState({ name: "", email: "", message: "" })
      } else {
        throw new Error("Failed to send message")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section id="contact" ref={ref} className="py-20 md:py-32 bg-[#020924] relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkNGFmMzciIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>

      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#d4af37] to-[#f5d76e] bg-clip-text text-transparent">
              Contact Us
            </span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#f5d76e] mx-auto mb-6"></div>
          <p className="text-lg text-white/70 max-w-3xl mx-auto">
            Ready to transform your business? Let's discuss how Opulence Byte can help you achieve your technology
            goals.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-[#f5d76e]/20 rounded-lg blur-xl"></div>
              <div className="relative glass bg-[#0f0f0f]/50 backdrop-blur-sm p-8 rounded-lg border border-[#d4af37]/20 h-full">
                <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>

                <div className="space-y-6">
                  <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0 text-[#d4af37]">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Email</h4>
                      <a
                        href="mailto:contact@opulencebyte.com"
                        className="text-white/70 hover:text-[#d4af37] transition-colors"
                      >
                        contact@opulencebyte.com
                      </a>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0 text-[#d4af37]">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Phone</h4>
                      <a href="tel:+918084364410" className="text-white/70 hover:text-[#d4af37] transition-colors">
                        +91 9142441497
                      </a>
                    </div>
                  </motion.div>

                  <motion.div className="flex items-start gap-4" whileHover={{ x: 5 }} transition={{ duration: 0.3 }}>
                    <div className="w-12 h-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center shrink-0 text-[#d4af37]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold mb-1">Location</h4>
                      <p className="text-white/70">Jamshedpur, Jharkhand, India</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#d4af37]/20 to-[#f5d76e]/20 rounded-lg blur-xl"></div>
              <div className="relative glass bg-[#0f0f0f]/50 backdrop-blur-sm p-8 rounded-lg border border-[#d4af37]/20">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={handleChange}
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formState.email}
                      onChange={handleChange}
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 min-h-[150px]"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 glow-on-hover"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-[#020924]/30 border-t-[#020924] rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
