import Link from 'next/link'
import { products } from '@/lib/products'
import { Logo } from './logo'

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer-grid">
          <div>
            <Logo />
            <p>Digital products, ERP and AI for companies ready to move with intention. Built in Jharkhand, shipped worldwide.</p>
          </div>
          <div>
            <h4>Products</h4>
            <ul>
              {products.slice(0, 5).map((p) => <li key={p.slug}><Link href={`/products/${p.slug}`}>{p.name}</Link></li>)}
              <li><Link href="/products">All {products.length} products</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/#services">Services</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/awt-workflow">Case study: AWT Hospital</Link></li>
              <li><Link href="/play">Play Byte Catcher</Link></li>
              <li><Link href="/donate">Support our work</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@opulencebyte.com">hello@opulencebyte.com</a></li>
              <li><a href="tel:+918757924410">+91 87579 24410</a></li>
              <li>Ranchi · Jamshedpur, Jharkhand, India</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Opulence Byte Private Limited. All rights reserved.</span>
          <span>Crafted with intent in India.</span>
        </div>
      </div>
    </footer>
  )
}
