import { ShoppingBag } from 'lucide-react'
import type { Metadata } from 'next'
import { ProductsBrowser } from '@/components/products-browser'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { StoreWelcome } from '@/components/store-welcome'
import { products, QUOTE_FEE_USD } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Products',
  description: `${products.length} ready-to-deploy SaaS products: hospital ERP, hotel ERP, school ERP, CRM, HRMS, POS and more. Get a tailored quote for $${QUOTE_FEE_USD}.`,
}

export default function ProductsPage() {
  return (
    <div className="page">
      <SiteHeader />
      <main id="main">
        <section className="store-hero">
          <div className="shell">
            <span className="eyebrow" data-reveal><ShoppingBag size={13} /> Opulence Byte store</span>
            <h1 data-reveal>Software that runs <span className="gradient-text">your whole business.</span></h1>
            <p className="lede" data-reveal>{products.length} SaaS products for healthcare, hospitality, education, commerce and operations. Each one is configured to your workflows, hosted in the cloud and backed by our team.</p>
            <StoreWelcome />
            <div className="steps">
              {[
                ['1', 'Sign in', 'Use Google or GitHub. No passwords to remember.'],
                ['2', 'Explore', 'Compare modules and outcomes for each product.'],
                ['3', `Get a quote · $${QUOTE_FEE_USD}`, 'Pay securely and receive pricing and a demo by email.'],
              ].map(([n, title, text], i) => (
                <div className="card step" key={n} data-reveal style={{ '--d': i } as React.CSSProperties}><b>{n}</b><div><h4>{title}</h4><p>{text}</p></div></div>
              ))}
            </div>
          </div>
        </section>
        <section className="shell" id="catalog" style={{ paddingBottom: 80, scrollMarginTop: 80 }}>
          <ProductsBrowser />
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
