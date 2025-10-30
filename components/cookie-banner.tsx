"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const cookieConsent = localStorage.getItem("cookieConsent")
    if (!cookieConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setIsVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "rejected")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-muted-foreground">
              We use cookies to enhance your experience. By continuing to browse, you agree to our{" "}
              <a href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" className="text-accent hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 items-center w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors tech-cursor active:scale-95"
            >
              Reject
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-[#1B4965] to-[#00D0FF] text-white rounded-lg hover:shadow-lg hover:shadow-[#00D0FF]/50 transition-all duration-300 tech-cursor active:scale-95"
            >
              Accept
            </button>
            <button
              onClick={handleReject}
              className="p-2 hover:bg-muted rounded-lg transition-colors tech-cursor"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
