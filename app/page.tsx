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
  { number: '01', title: 'Web Development', text: 'High-performance websites engineered for clarity, speed, and measurable growth.', tags: ['Next.js', 'React', 'CMS'] },
  { number: '02', title: 'App Development', text: 'Human-centered mobile products that turn complex workflows into simple habits.', tags: ['iOS', 'Android', 'Product'] },
  { number: '03', title: 'UI / UX Design', text: 'Distinctive interfaces that make every interaction feel inevitable and useful.', tags: ['Systems', 'Research', 'Prototypes'] },
  { number: '04', title: 'Cloud & AI', text: 'Intelligent infrastructure that gives ambitious teams a durable advantage.', tags: ['AI', 'Cloud', 'Automation'] },
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
      <div className="intro-meta"><span>OPULENCE BYTE</span><span>SYS / INITIALIZING</span></div>
      <div className="intro-progress"><span style={{ width: `${progress}%` }} /></div>
    </div>
  )
}

function Chatbot() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(['Hi. I’m Byte, your digital strategy guide. What are you building?'])
  const send = () => {
    if (!message.trim()) return
    setMessages((current) => [...current, message.trim(), 'Great direction. Tell us a little more and we’ll map the right next step.'])
    setMessage('')
  }
  return (
    <div className="chat-wrap">
      {open && <div className="chat-panel" role="dialog" aria-label="Chat with Byte">
        <div className="chat-head"><div><span className="status-dot" /> Byte is online</div><button aria-label="Close chat" onClick={() => setOpen(false)}><X size={16} /></button></div>
        <div className="chat-messages">{messages.map((item, i) => <p className={i % 2 ? 'chat-user' : 'chat-bot'} key={`${item}-${i}`}>{item}</p>)}</div>
        <div className="chat-input"><input value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) send() }} placeholder="Ask Byte anything..." aria-label="Message Byte" /><button onClick={send} aria-label="Send message"><Send size={15} /></button></div>
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
      <header className="nav shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><nav className={menu ? 'nav-links nav-links--open' : 'nav-links'}><a href="#services" onClick={() => setMenu(false)}>Services</a><a href="#approach" onClick={() => setMenu(false)}>Approach</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a></nav><div className="nav-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button><a className="nav-cta" href="#contact">Start a project <ArrowUpRight size={15} /></a><button className="menu-button" onClick={() => setMenu(!menu)} aria-label="Toggle menu">{menu ? <X /> : <Menu />}</button></div></header>
      <section className="hero shell" id="top"><div className="hero-copy"><p className="eyebrow"><Sparkles size={14} /> DIGITAL CRAFT / 2026</p><h1>Build what<br /><em>matters.</em></h1><p className="hero-text">We design and engineer digital experiences for companies ready to move with intention — from the first sharp idea to the last pixel.</p><div className="hero-actions"><a className="button button-primary" href="#contact">Let’s make an impact <MoveRight size={16} /></a><a className="text-link" href="#services">Explore capabilities <ChevronRight size={15} /></a></div></div><div className="hero-visual"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="visual-label label-top">OP / 001 <span>FORM FOLLOWS PURPOSE</span></div><div className="visual-core"><img src={logoUrl} alt="Opulence Byte company logo" /><span>EST. 2026 / INDIA</span></div><div className="visual-label label-bottom">SCROLL TO DISCOVER <span className="line" /></div></div></section>
      <section className="ticker"><div>STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span> GROWTH <span>✦</span> STRATEGY <span>✦</span> DESIGN <span>✦</span> TECHNOLOGY <span>✦</span></div></section>
      <section className="services shell" id="services"><div className="section-intro"><p className="eyebrow">01 / WHAT WE DO</p><h2>Digital, with a point of view.</h2><p>Good work looks good. Great work changes how people feel, think, and act. We bring strategy, design, and technology into one sharp, collaborative team.</p></div><div className="service-list">{services.map((service) => <article className="service-card" key={service.number}><div className="service-top"><span>{service.number}</span><ArrowUpRight size={19} /></div><h3>{service.title}</h3><p>{service.text}</p><div className="service-tags">{service.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}</div></section>
      <section className="approach shell" id="approach"><div className="approach-heading"><p className="eyebrow">02 / OUR APPROACH</p><h2>Less noise.<br /><span>More signal.</span></h2></div><div className="approach-content"><p className="big-copy">We believe the best digital work starts before the screen. It starts with a better question.</p><div className="principles"><div><span>01</span><p><b>Get curious.</b><br />We ask the questions others skip, then turn insight into direction.</p></div><div><span>02</span><p><b>Make it clear.</b><br />Every choice earns its place. Every interaction earns attention.</p></div><div><span>03</span><p><b>Ship with intent.</b><br />Beautiful is a baseline. We build for the world after launch.</p></div></div></div></section>
      <section className="numbers shell" id="about"><div><strong>12</strong><span>brands launched</span></div><div><strong>4.9</strong><span>average partner rating</span></div><div><strong>∞</strong><span>ways to make it better</span></div></section>
      <section className="contact shell" id="contact"><div><p className="eyebrow">03 / HAVE A GOOD ONE?</p><h2>Let’s make<br /><em>something</em> matter.</h2><div className="company-details"><strong>OPULENCE BYTE PRIVATE LIMITED</strong><span>Ranchi · Jamshedpur, Jharkhand, India</span><a href="https://www.opulencebyte.com" target="_blank" rel="noreferrer">www.opulencebyte.com</a><a href="tel:+918757924410">+91 8757924410</a></div></div><a className="contact-circle" href="mailto:hello@opulencebyte.com">Start a conversation <ArrowUpRight size={24} /></a></section>
      <footer className="footer shell"><a className="brand" href="#top"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></a><p>Digital experiences for<br />the relentlessly curious.</p><div><strong>OPULENCE BYTE PRIVATE LIMITED</strong><span>Ranchi · Jamshedpur, Jharkhand, India</span><a href="https://www.opulencebyte.com" target="_blank" rel="noreferrer">www.opulencebyte.com</a><a href="tel:+918757924410">+91 8757924410</a><span>© 2026 Opulence Byte</span></div></footer>
      <Chatbot />
    </main>
  )
}
