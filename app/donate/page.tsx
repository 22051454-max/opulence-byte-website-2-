import { Heart, ShieldCheck, Sparkles } from 'lucide-react'
import type { Metadata } from 'next'
import { DonateCheckout } from '@/components/donate-checkout'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = { title: 'Support our work' }

export default function DonatePage() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="shell donate-layout">
        <div>
          <span className="eyebrow" data-reveal><Sparkles size={13} /> Support the work</span>
          <h1 data-reveal>Give ideas <span className="gradient-text">room to grow.</span></h1>
          <p className="lede" data-reveal>Your support helps Opulence Byte invest in open experiments, emerging talent and digital work that puts people before noise.</p>
          <div className="donate-trust" data-reveal><span><ShieldCheck size={16} /> Secure checkout</span><span><Heart size={16} /> Every contribution matters</span></div>
        </div>
        <DonateCheckout />
      </main>
      <SiteFooter />
    </div>
  )
}
