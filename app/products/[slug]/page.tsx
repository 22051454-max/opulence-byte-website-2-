import { ArrowRight, CheckCircle2, ChevronRight, MonitorPlay, Users } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon } from '@/components/icon'
import { ProductCard } from '@/components/product-card'
import { QuotePanel } from '@/components/quote-panel'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getProduct, products } from '@/lib/products'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).slug)
  if (!product) return {}
  return { title: product.name, description: `${product.tagline} ${product.summary}` }
}

export default async function ProductPage({ params }: Props) {
  const product = getProduct((await params).slug)
  if (!product) notFound()
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 3)

  return (
    <div className="page" style={{ '--accent': product.accent } as React.CSSProperties}>
      <SiteHeader />
      <main id="main" className="shell detail-hero">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/products">Products</Link><ChevronRight size={14} /><span>{product.category}</span><ChevronRight size={14} /><span aria-current="page">{product.name}</span>
        </nav>
        <div className="detail-grid">
          <div className="detail-main">
            <div className="detail-title" data-reveal>
              <span className="product-icon"><Icon name={product.icon} size={32} /></span>
              <div>
                <h1>{product.name}</h1>
                <p style={{ margin: '8px 0 0', fontSize: 19, fontWeight: 600 }}>{product.tagline}</p>
              </div>
            </div>
            <p className="detail-summary" data-reveal>{product.summary}</p>
            <div className="card panel" data-reveal>
              <h2>What’s included</h2>
              <div className="module-grid">{product.modules.map((m) => <div key={m}><CheckCircle2 size={17} />{m}</div>)}</div>
            </div>
            <div className="card panel" data-reveal>
              <h2>Outcomes you can expect</h2>
              <div className="outcomes">{product.outcomes.map((o) => <div key={o}>{o}</div>)}</div>
            </div>
            <div className="card panel" data-reveal style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <Users size={22} color={product.accent} />
              <div style={{ flex: 1, minWidth: 200 }}><b>Ideal for</b><div style={{ color: 'var(--muted)' }}>{product.idealFor}</div></div>
              {product.demoUrl && <Link className="btn btn-ghost btn-sm" href={product.demoUrl}><MonitorPlay size={16} /> Open live demo</Link>}
              {product.slug === 'hospital-erp' && <Link className="btn btn-ghost btn-sm" href="/awt-workflow">See the workflow <ArrowRight size={15} /></Link>}
            </div>
          </div>
          <QuotePanel slug={product.slug} name={product.name} />
        </div>
        {related.length > 0 && (
          <section className="section" style={{ paddingBottom: 40 }}>
            <div className="section-head"><h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)' }} data-reveal>More in {product.category}</h2></div>
            <div className="product-grid">{related.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}</div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}
