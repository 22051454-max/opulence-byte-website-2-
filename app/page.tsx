'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  ChevronRight,
  Menu,
  MessageCircle,
  Moon,
  MoveRight,
  Plus,
  Send,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'

const logoUrl = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202026-09-05%20at%208.15.56%20PM%20%281%29-PKptryF3mzcb814JoyTynLSp553p8q.jpeg'

const services = [
  { number: '01', title: 'Websites', text: 'Strategic digital presences engineered for performance, engagement, and conversion. We build modern, responsive websites that connect your brand with your a[...]
  { number: '02', title: 'Apps & MVPs', text: 'From concept to market-ready product. We develop innovative applications and minimum viable products that solve real problems with elegant solutions. Fas[...]
  { number: '03', title: 'Automation', text: 'Streamline your operations with intelligent automation. We build systems that eliminate repetitive tasks, reduce errors, and empower your team to focus on[...]
]

function LogoIntro({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const start = window.setTimeout(() => setProgress(100), 120)
    const finish = window.setTimeout(onComplete, 2400)
    return () => { window.clearTimeout(start); window.clearTimeout(finish) }
  }, [onComplete])
  return (
    <div className={`logo-intro ${progress === 100 ? 'logo-intro--leaving' : ''}`} aria-label="Loading Opulence Byte">
      <div className="intro-grid" />
      <div className="intro-orbit"><span /></div>
      <div className="intro-mark">
        <img src={logoUrl} alt="Opulence Byte" />
        <div className="intro-scan" />
      </div>
      <div className="intro-meta"><span>OPULENCE BYTE</span><span>ESTABLISHED / 2024</span></div>
      <div className="intro-progress"><span style={{ width: `${progress}%` }} /></div>
    </div>
  )
}

function Chatbot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['Hi. I\'m Byte, your digital strategy guide. What are you building?'])
  const send = () => {
    if (!message.trim()) return
    setMessages((current) => [...current, message.trim(), 'Great direction. Tell us a little more and we\'ll map the right next step.'])
    setMessage('')
  }
  return (
    <div className="chat-wrap">
      {open && <div className="chat-panel" role="dialog" aria-label="Chat with Byte">
        <div className="chat-head"><div><span className="status-dot" /> Byte is online</div><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={16} /></button></div>
        <div className="chat-messages">{messages.map((item, i) => <p className={i % 2 ? 'chat-user' : 'chat-bot'} key={`${item}-${i}`}>{item}</p>)}</div>
        <div className="chat-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) sen[...]
      </div>}
      <button className="chat-trigger" onClick={() => setOpen(!open)} aria-label="Open chat with Byte"><MessageCircle size={19} /><span>Chat with Byte</span></button>
    </div>
  )
}

export default function Page() {
  const [intro, setIntro] = useState(true)
  const [menu, setMenu] = useState(false)
  const [dark, setDark] = useState(true)
  const [cursor, setCursor] = useState({ x: -100, y: -100 })
  useEffect(() => {
    const move = (event: MouseEvent) => setCursor({ x: event.clientX, y: event.clientY })
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])
  return (
    <main className={dark ? 'site dark' : 'site light'}>
      {intro && <LogoIntro onComplete={() => setIntro(false)} />}
      <div className="cursor" style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} />
      <header className="nav shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><nav className={menu ? 'nav-links nav-links--open[...]
      <section className="hero shell" id="top"><div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> DIGITAL CRAFT / 2026</p><h1>Build what<br /><em>matters.</em></h1><p className="[...]
      <section className="ticker"><div>STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> GROWTH <span>✦</span> STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOG[...]
      <section className="services shell" id="services"><div className="section-intro"><p className="eyebrow">01 / WHAT WE DO</p><h2>Digital, with a point of view.</h2><p>Good work looks good. Great w[...]
      <section className="approach shell" id="approach"><div className="approach-heading"><p className="eyebrow">02 / OUR APPROACH</p><h2>Less noise.<br /><span>More signal.</span></h2></div><div clas[...]
      <section className="numbers shell" id="about"><div><strong>12</strong><span>brands launched</span></div><div><strong>4.9</strong><span>average partner rating</span></div><div><strong>∞</strong[...]
      <section className="contact shell" id="contact"><div><p className="eyebrow">03 / HAVE A GOOD ONE?</p><h2>Let's make<br /><em>something</em> matter.</h2><div className="company-details"><a href="[...]
      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><p>Digital experiences for<br />the relentless[...]
      <Chatbot />
    </main>
  )
}
