'use client'

import { Bot, Send, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'

type Message = { role: 'user' | 'assistant'; content: string }

const suggestions = ['I run a hospital', 'Software for my hotel', 'Build me an app', 'How does the $5 quote work?']

/** Turns /paths and emails in replies into links. */
function Rich({ text }: { text: string }) {
  const parts = text.split(/(\/products(?:\/[a-z0-9-]+)?|\/play|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return <>{parts.map((part, i) => {
    if (/^\/(products|play)/.test(part)) return <Link key={i} href={part}>{part}</Link>
    if (/@/.test(part) && /\.[a-z]{2,}$/i.test(part)) return <a key={i} href={`mailto:${part}`}>{part}</a>
    return <Fragment key={i}>{part}</Fragment>
  })}</>
}

export function Chatbot() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi, I’m Byte. Tell me about your business and I’ll point you to the right product or service.' },
  ])
  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  if (pathname.startsWith('/awt-')) return null

  const send = async (text: string) => {
    const content = text.trim()
    if (!content || busy) return
    const history: Message[] = [...messages, { role: 'user', content }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setBusy(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(1) }),
      })
      if (!response.body) throw new Error('No response')
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let reply = ''
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        reply += decoder.decode(value, { stream: true })
        setMessages([...history, { role: 'assistant', content: reply }])
      }
      if (!reply) setMessages([...history, { role: 'assistant', content: 'Sorry, I didn’t catch that. Could you rephrase?' }])
    } catch {
      setMessages([...history, { role: 'assistant', content: 'I’m having trouble connecting. You can reach the team at hello@opulencebyte.com.' }])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="chat">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Chat with Byte">
          <div className="chat-head">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="chat-bot-avatar"><Bot size={20} /></span>
              <div><strong>Byte · AI assistant</strong><small>Online now</small></div>
            </div>
            <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat"><X size={16} /></button>
          </div>
          <div className="chat-log" ref={logRef} aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                {m.content ? (m.role === 'assistant' ? <Rich text={m.content} /> : m.content) : <span className="typing" aria-label="Byte is typing"><i /><i /><i /></span>}
              </div>
            ))}
          </div>
          {messages.length < 3 && (
            <div className="chat-suggest">{suggestions.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}</div>
          )}
          <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input) }}>
            <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Byte anything…" aria-label="Message Byte" maxLength={1500} />
            <button type="submit" aria-label="Send" disabled={busy}><Send size={17} /></button>
          </form>
          <div className="chat-note">Powered by Claude AI. Answers may be imperfect.</div>
        </div>
      )}
      <button className="chat-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close chat' : 'Chat with Byte'} aria-expanded={open}>
        {open ? <X size={20} /> : <><span className="pulse" /><Sparkles size={18} /></>}
        <span className="label">{open ? 'Close' : 'Ask Byte AI'}</span>
      </button>
    </div>
  )
}
