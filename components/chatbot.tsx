'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, MessageCircle, ChevronRight } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const FAQ_RESPONSES: Record<string, string> = {
  'services': 'We provide Mobile & Web Development, Cloud & DevOps Engineering, Cybersecurity, AI & ML Solutions, UI/UX Design, and Strategic Consulting.',
  'pricing': 'Pricing varies based on project scope and requirements. Contact our team at 8084364410 for a custom quote.',
  'contact': 'You can reach us at 8084364410 or through our contact form. We are available 24/7 for support.',
  'timeline': 'Project timelines depend on complexity. Typically, projects range from 2-12 weeks. We discuss specific timelines during consultation.',
  'security': 'Security is our core focus. We implement industry best practices, encryption, compliance standards, and regular security audits.',
  'team': 'Opulence Byte is led by founder Avinash Singh Munda with a team of experienced engineers, architects, and designers.',
  'portfolio': 'We have delivered 50+ successful projects across various industries. Each project is tailored to client needs.',
  'support': 'We provide 24/7 support with 99.9% system uptime guarantee. Your success is our priority.',
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    // Simulate typing delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 500))

    // Find matching FAQ response
    const lowerInput = input.toLowerCase()
    let assistantContent = 'How can I help you with Opulence Byte?'

    for (const [key, value] of Object.entries(FAQ_RESPONSES)) {
      if (lowerInput.includes(key)) {
        assistantContent = value
        break
      }
    }

    // Fallback for unmatched queries
    if (assistantContent === 'How can I help you with Opulence Byte?') {
      assistantContent = 'I can help you with questions about our services, pricing, contact info, security, and more. Try asking about: services, pricing, contact, timeline, security, team, portfolio, or support.'
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: assistantContent,
    }

    setMessages((prev) => [...prev, assistantMessage])
  }

  const quickQuestions = ['Services', 'Pricing', 'Contact', 'Security', 'Team', 'Portfolio', 'Support', 'Timeline']

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-accent shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-30 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-accent p-6 text-white">
              <h3 className="font-bold text-lg">Opulence Byte Assistant</h3>
              <p className="text-sm opacity-90">Ask me anything about our services!</p>
            </div>

            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full text-foreground/60 text-center px-4 gap-4"
                >
                  <div>
                    <div className="text-3xl mb-2">👋</div>
                    <p className="text-sm mb-6">
                      Hi! I'm here to help. Ask me about our services, team, or anything else!
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {quickQuestions.map((q) => (
                      <motion.button
                        key={q}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setInput(q)
                          setTimeout(() => {
                            const form = document.querySelector('form')
                            if (form) form.dispatchEvent(new Event('submit', { bubbles: true }))
                          }, 0)
                        }}
                        className="text-xs px-3 py-2 rounded-lg bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30 transition-colors"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-lg ${
                          msg.role === 'user'
                            ? 'bg-secondary text-white rounded-br-none'
                            : 'bg-muted text-foreground rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-2 p-3"
                    >
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-secondary"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={onSubmit}
              className="border-t border-border p-4 bg-card flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:outline-none focus:border-secondary transition-colors text-sm"
                disabled={false}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-lg bg-gradient-to-r from-secondary to-accent text-white hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
