import { ArrowRight, CheckCircle2, Clock, Mail } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { getSession } from '@/lib/auth'
import { fetchOrder, verifySignature } from '@/lib/razorpay'

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } }
export const dynamic = 'force-dynamic'

type Search = Promise<Record<string, string | string[] | undefined>>

async function loadReceipt(search: Awaited<Search>) {
  const [orderId, paymentId, signature] = ['order', 'payment', 'signature'].map((key) => (typeof search[key] === 'string' ? (search[key] as string) : ''))
  if (!orderId || !paymentId || !verifySignature(orderId, paymentId, signature)) return null
  const user = await getSession()
  try {
    const order = await fetchOrder(orderId)
    if (!user || order.notes?.email !== user.email) return null
    return { paymentId, order }
  } catch {
    return null
  }
}

export default async function ThankYou({ searchParams }: { searchParams: Search }) {
  const receipt = await loadReceipt(await searchParams)

  if (!receipt) {
    return (
      <div className="page">
        <SiteHeader />
        <main id="main" className="shell thanks">
          <div className="card thanks-card" data-reveal="zoom">
            <h1>We couldn’t find that payment</h1>
            <p>If you were charged, email <a href="mailto:hello@opulencebyte.com">hello@opulencebyte.com</a> with your Razorpay payment ID and we’ll sort it out.</p>
            <div className="thanks-actions"><Link className="btn btn-primary" href="/products">Browse products <ArrowRight size={17} /></Link></div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  const { order, paymentId } = receipt
  const rows: [string, string | undefined][] = [
    ['Product', order.notes.product],
    ['Company', order.notes.company],
    ['Email', order.notes.email],
    ['Amount paid', `${(order.amount / 100).toFixed(2)} ${order.currency}`],
    ['Payment ID', paymentId],
  ]

  return (
    <div className="page">
      <SiteHeader />
      <main id="main" className="shell thanks">
        <div className="card thanks-card" data-reveal="zoom">
          <span className="thanks-badge"><CheckCircle2 size={44} /></span>
          <h1>Thank you for the <span className="gradient-text">payment!</span></h1>
          <p className="thanks-lede">All the details, including your quotation, will be sent within 24 hours. Thank you for your patience.</p>
          <dl className="thanks-receipt">
            {rows.filter(([, value]) => value).map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <div className="thanks-notes">
            <span><Mail size={16} /> Sent to {order.notes.email}</span>
            <span><Clock size={16} /> Within 24 hours</span>
          </div>
          <div className="thanks-actions">
            <Link className="btn btn-primary" href="/products">Explore more products <ArrowRight size={17} /></Link>
            <Link className="btn btn-ghost" href="/">Back to home</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
