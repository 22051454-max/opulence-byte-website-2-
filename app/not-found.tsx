import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function NotFound() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="shell not-found">
        <div>
          <h1 className="gradient-text">404</h1>
          <p style={{ color: 'var(--muted)', fontSize: 18 }}>This byte got lost. Let’s get you back on track.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary" href="/">Go home</Link>
            <Link className="btn btn-ghost" href="/products">Browse products</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
