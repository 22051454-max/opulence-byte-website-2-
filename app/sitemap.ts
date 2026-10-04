import type { MetadataRoute } from 'next'
import { products } from '@/lib/products'

const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.opulencebyte.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/products`, lastModified: now, priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: now, priority: 0.8 })),
    { url: `${base}/play`, lastModified: now, priority: 0.4 },
    { url: `${base}/awt-workflow`, lastModified: now, priority: 0.5 },
    { url: `${base}/donate`, lastModified: now, priority: 0.3 },
  ]
}
