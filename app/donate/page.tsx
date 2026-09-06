'use client'

import { ArrowLeft, ArrowUpRight, Heart, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { DonateCheckout } from '@/components/donate-checkout'

export default function DonatePage() {
  return (
    <main className="site dark donate-site">
      <header className="nav shell donate-nav">
        <Link className="brand" href="/"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></Link>
        <Link className="back-link" href="/"><ArrowLeft size={15} /> Back to studio</Link>
      </header>
      <section className="donate-hero shell">
        <div className="donate-intro">
          <p className="eyebrow"><Sparkles size={14} /> 04 / SUPPORT THE WORK</p>
          <h1>Give ideas<br /><em>room to grow.</em></h1>
          <p className="donate-lede">Your support helps Opulence Byte invest in open experiments, emerging talent, and digital work that puts people before noise.</p>
          <div className="donate-trust"><span><ShieldCheck size={16} /> Secure checkout</span><span><Heart size={16} /> Every contribution matters</span></div>
        </div>
        <DonateCheckout />
      </section>
      <section className="donate-note shell"><span className="donate-note-mark">OB</span><div><p className="eyebrow">A SMALL SIGNAL / A BIG DIFFERENCE</p><p>We believe better digital spaces are built together. Thank you for helping us keep curiosity, craft, and access at the center of what comes next.</p></div><Link className="text-link" href="/#contact">Have a project? <ArrowUpRight size={15} /></Link></section>
      <footer className="footer shell"><Link className="brand" href="/"><span className="brand-symbol">OB</span><span>OPULENCE<br /><b>BYTE</b></span></Link><p>Digital experiences for<br />the relentlessly curious.</p><div><strong>OPULENCE BYTE PRIVATE LIMITED</strong><span>Ranchi · Jamshedpur, Jharkhand, India</span><span>© 2024 Opulence Byte</span></div></footer>
    </main>
  )
}
