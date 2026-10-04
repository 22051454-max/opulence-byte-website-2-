'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { categories, products } from '@/lib/products'
import { ProductCard } from './product-card'

export function ProductsBrowser() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('All')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) =>
      (category === 'All' || p.category === category) &&
      (!q || [p.name, p.tagline, p.summary, p.category, p.idealFor, ...p.modules].join(' ').toLowerCase().includes(q)))
  }, [query, category])

  return (
    <>
      <div className="toolbar">
        <label className="search">
          <Search size={17} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search hospitals, hotels, payroll, GST…" aria-label="Search products" type="search" />
        </label>
        <div className="chips" role="tablist" aria-label="Categories">
          {categories.map((c) => (
            <button key={c} role="tab" aria-selected={category === c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
          ))}
        </div>
      </div>
      {filtered.length ? (
        <div className="product-grid" key={`${category}-${query}`}>
          {filtered.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
        </div>
      ) : (
        <div className="card empty">No products match “{query}”. Ask Byte in the chat, we probably build it.</div>
      )}
    </>
  )
}
