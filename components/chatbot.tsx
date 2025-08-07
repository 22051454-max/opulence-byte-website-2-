"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Mail, MessageSquare, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"query" | "contact" | "feedback">("query")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    query: "",
    name: "",
    email: "",
    contactMessage: "",
    rating: 5,
    feedbackMessage: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (type: "query" | "contact" | "feedback") => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, data: formData }),
      })

      if (response.ok) {
        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We'll get back to you soon.",
        })
        // Reset form
        setFormData({
          query: "",
          name: "",
          email: "",
          contactMessage: "",
          rating: 5,
          feedbackMessage: "",
        })
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

  const tabs = [
    { id: "query", label: "Query", icon: MessageSquare },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "feedback", label: "Feedback", icon: Star },
  ]

  return (
    <>
      <motion.button
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#d4af37] text-[#020924] rounded-full flex items-center justify-center shadow-lg hover:bg-[#d4af37]/90 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 w-80 max-w-[calc(100vw-3rem)]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass bg-[#0f0f0f]/95 backdrop-blur-xl border-[#d4af37]/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white">How can we help?</CardTitle>
                <div className="flex gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-colors ${
                        activeTab === tab.id
                          ? "bg-[#d4af37] text-[#020924]"
                          : "bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20"
                      }`}
                    >
                      <tab.icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeTab === "query" && (
                  <div className="space-y-3">
                    <Textarea
                      name="query"
                      value={formData.query}
                      onChange={handleChange}
                      placeholder="Ask us anything..."
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 min-h-[80px] text-sm"
                    />
                    <Button
                      onClick={() => handleSubmit("query")}
                      disabled={isLoading || !formData.query.trim()}
                      className="w-full bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-[#020924]/30 border-t-[#020924] rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1" />
                          Send Query
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div className="space-y-3">
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 text-sm"
                    />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 text-sm"
                    />
                    <Textarea
                      name="contactMessage"
                      value={formData.contactMessage}
                      onChange={handleChange}
                      placeholder="Your message"
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 min-h-[60px] text-sm"
                    />
                    <Button
                      onClick={() => handleSubmit("contact")}
                      disabled={isLoading || !formData.name || !formData.email || !formData.contactMessage}
                      className="w-full bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-[#020924]/30 border-t-[#020924] rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Mail className="w-3 h-3 mr-1" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {activeTab === "feedback" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-white">Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className={`w-6 h-6 ${
                              star <= formData.rating ? "text-[#d4af37]" : "text-white/30"
                            } hover:text-[#d4af37] transition-colors`}
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      name="feedbackMessage"
                      value={formData.feedbackMessage}
                      onChange={handleChange}
                      placeholder="Share your feedback..."
                      className="bg-[#020924]/50 border-[#d4af37]/20 focus:border-[#d4af37] focus:ring-[#d4af37]/20 min-h-[80px] text-sm"
                    />
                    <Button
                      onClick={() => handleSubmit("feedback")}
                      disabled={isLoading || !formData.feedbackMessage.trim()}
                      className="w-full bg-[#d4af37] text-[#020924] hover:bg-[#d4af37]/90 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-[#020924]/30 border-t-[#020924] rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : (
                        <>
                          <Star className="w-3 h-3 mr-1" />
                          Send Feedback
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
