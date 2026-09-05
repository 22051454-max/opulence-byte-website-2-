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
  { number: '01', title: 'Websites', text: 'Strategic digital presences engineered for performance, engagement, and conversion. We build modern, responsive websites that connect your brand with your audience and drive measurable results.', tags: ['Next.js', 'React', 'Responsive'] },
  { number: '02', title: 'Apps & MVPs', text: 'From concept to market-ready product. We develop innovative applications and minimum viable products that solve real problems with elegant solutions. Fast iteration, quality execution.', tags: ['Mobile', 'Web', 'Product Strategy'] },
  { number: '03', title: 'Automation', text: 'Streamline your operations with intelligent automation. We build systems that eliminate repetitive tasks, reduce errors, and empower your team to focus on what matters most.', tags: ['Workflows', 'AI', 'Integration'] },
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
  const [messages, setMessages] = useState(['Hi. I'm Byte, your digital strategy guide. What are you building?'])
  const send = () => {
    if (!message.trim()) return
    setMessages((current) => [...current, message.trim(), 'Great direction. Tell us a little more and we'll map the right next step.'])
    setMessage('')
  }
  return (
    <div className="chat-wrap">
      {open && <div className="chat-panel" role="dialog" aria-label="Chat with Byte">
        <div className="chat-head"><div><span className="status-dot" /> Byte is online</div><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={16} /></button></div>
        <div className="chat-messages">{messages.map((item, i) => <p className={i % 2 ? 'chat-user' : 'chat-bot'} key={`${item}-${i}`}>{item}</p>)}</div>
        <div className="chat-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) send() }} placeholder="Type your message..." /><button onClick={send} aria-label="Send message"><Send size={16} /></button></div>
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
      <header className="nav shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><nav className={menu ? 'nav-links nav-links--open' : 'nav-links'}><a href="#services">Services</a><a href="#approach">Approach</a><a href="#about">About</a><a href="#contact">Contact</a></nav><div className="nav-actions"><button onClick={() => setDark(!dark)} aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button><button onClick={() => setMenu(!menu)} aria-label="Toggle menu" className="menu-button">{menu ? <X size={20} /> : <Menu size={20} />}</button></div></header>
      <section className="hero shell" id="top"><div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> DIGITAL CRAFT / 2026</p><h1>Build what<br /><em>matters.</em></h1><p className="intro-text">Strategic digital solutions for ambitious companies. We combine strategy, design, and technology to create experiences that drive real impact.</p><a href="#contact" className="btn btn-primary"><span>Let's talk</span><MoveRight size={18} /></a></div><div className="hero-visual"><div className="hero-card"><div className="hero-card-content"><Plus size={24} /><span>Established</span><strong>2024</strong></div></div></div></section>
      <section className="ticker"><div>STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> GROWTH <span>✦</span> STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> GROWTH <span>✦</span></div></section>
      <section className="services shell" id="services"><div className="section-intro"><p className="eyebrow">01 / WHAT WE DO</p><h2>Digital, with a point of view.</h2><p>Good work looks good. Great work changes how people think.</p></div><div className="services-grid">{services.map((service) => <div key={service.number} className="service-card"><div className="service-number">{service.number}</div><div className="service-content"><h3>{service.title}</h3><p>{service.text}</p><div className="service-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div><ArrowUpRight className="service-icon" size={20} /></div>)}</div></section>
      <section className="approach shell" id="approach"><div className="approach-heading"><p className="eyebrow">02 / OUR APPROACH</p><h2>Less noise.<br /><span>More signal.</span></h2></div><div className="approach-steps"><div><h3><ChevronRight size={20} /> Strategy First</h3><p>We start by understanding your goals, audience, and market. Strategy guides every decision we make.</p></div><div><h3><ChevronRight size={20} /> Design with Purpose</h3><p>Beautiful design isn't decoration. It's communication. Every pixel serves a purpose.</p></div><div><h3><ChevronRight size={20} /> Build for Impact</h3><p>Clean code, scalable architecture, and performance optimization. Technology that works as hard as you do.</p></div></div></section>
      <section className="numbers shell" id="about"><div><strong>12</strong><span>brands launched</span></div><div><strong>4.9</strong><span>average partner rating</span></div><div><strong>∞</strong><span>potential ahead</span></div></section>
      <section className="contact shell" id="contact"><div><p className="eyebrow">03 / HAVE A GOOD ONE?</p><h2>Let's make<br /><em>something</em> matter.</h2><div className="company-details"><a href="mailto:hello@opulencebyte.com">hello@opulencebyte.com</a></div></div><form onSubmit={(e) => { e.preventDefault(); alert('Thanks for reaching out! We'll be in touch soon.') }} className="contact-form"><input type="text" placeholder="Your name" required /><input type="email" placeholder="Your email" required /><textarea placeholder="Tell us about your project..." rows={4} required></textarea><button type="submit" className="btn btn-primary"><span>Send message</span><Send size={18} /></button></form></section>
      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><p>Digital experiences for<br />the relentlessly ambitious.</p><p className="footer-year">© 2024 Opulence Byte. All rights reserved.</p></footer>
      <Chatbot />
    </main>
  )
}
