"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send } from "lucide-react"

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

const faqs = [
  {
    question: "What services do you offer?",
    answer:
      "We offer web development, cybersecurity, AI/ML solutions, cloud & DevOps, UI/UX design, and app development services.",
  },
  {
    question: "How can I contact you?",
    answer: "You can reach us at contact@opulencebyte.com or call +91 9142441497. We're available 24/7 for support.",
  },
  {
    question: "What is your pricing?",
    answer: "Our pricing is customized based on your project requirements. Please contact us for a detailed quote.",
  },
  {
    question: "Do you provide ongoing support?",
    answer: "Yes, we provide 24/7 support and maintenance for all our projects.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Project timelines vary based on complexity. We typically provide estimates after understanding your requirements.",
  },
]

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot response
    setTimeout(() => {
      let botResponse = "I'm not sure about that. Please contact us at contact@opulencebyte.com for more information."

      const lowerText = text.toLowerCase()
      const matchedFaq = faqs.find((faq) => lowerText.includes(faq.question.toLowerCase().split(" ")[0]))

      if (matchedFaq) {
        botResponse = matchedFaq.answer
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 500)
  }

  return (
    <>
      {/* Chatbot Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        aria-label="Open chatbot"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl flex flex-col h-96 md:h-[500px] animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
            <h3 className="font-bold text-lg">Opulence Byte Support</h3>
            <p className="text-sm opacity-90">We typically reply instantly</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          <div className="px-4 py-2 border-t border-border max-h-24 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {faqs.slice(0, 3).map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(faq.question)}
                  className="text-xs px-2 py-1 bg-muted hover:bg-accent hover:text-accent-foreground rounded transition-colors"
                >
                  {faq.question.substring(0, 20)}...
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="border-t border-border p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(input)}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={() => handleSendMessage(input)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
