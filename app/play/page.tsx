import { Gamepad2 } from 'lucide-react'
import type { Metadata } from 'next'
import { ByteGame } from '@/components/byte-game'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = { title: 'Play Byte Catcher', description: 'A quick arcade break from Opulence Byte: catch the bytes, dodge the bugs.' }

export default function PlayPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="shell" style={{ padding: '40px 0 80px' }}>
        <div className="section-head center">
          <span className="eyebrow" data-reveal><Gamepad2 size={13} /> Arcade</span>
          <h2 data-reveal>Byte <span className="gradient-text">Catcher</span></h2>
          <p data-reveal>Catch blue bytes for points, chain them for combos, dodge red bugs and grab gold stars for extra lives.</p>
        </div>
        <div style={{ maxWidth: 820, margin: '0 auto' }} data-reveal="zoom"><ByteGame /></div>
      </main>
      <SiteFooter />
    </div>
  )
}
