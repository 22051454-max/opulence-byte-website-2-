import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'
import { type Product, QUOTE_FEE_USD } from '@/lib/products'
import { Icon } from './icon'

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card tilt card-glow product-card"
      style={{ '--accent': product.accent, '--d': index % 6 } as React.CSSProperties}
      data-reveal
    >
      <div className="product-top">
        <span className="product-icon"><Icon name={product.icon} size={24} /></span>
        <span className={`badge ${product.demoUrl ? 'live' : ''}`}>{product.demoUrl ? '● Live demo' : product.category}</span>
      </div>
      <div>
        <h3>{product.name}</h3>
      </div>
      <p className="tagline">{product.tagline}</p>
      <ul>
        {product.modules.slice(0, 3).map((m) => <li key={m}><Check size={14} />{m}</li>)}
      </ul>
      <div className="product-foot">
        <span className="price">Quote from <b>${QUOTE_FEE_USD}</b></span>
        <span className="link-arrow">Explore <ArrowRight size={15} /></span>
      </div>
    </Link>
  )
}
