'use client'

import { ArrowUpRight, Check, CheckCircle2, LoaderCircle, LogIn } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QUOTE_FEE_USD } from '@/lib/products'
import { Avatar, useSession } from './session'

type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function QuotePanel({ slug, name }: { slug: string; name: string }) {
  const { user, loading } = useSession()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const done = status?.type === 'success'

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(event.currentTarget))
    setBusy(true)
    setStatus(null)
    try {
      if (!(await loadRazorpay())) throw new Error('Secure checkout could not load. Please check your connection.')
      const response = await fetch('/api/quote/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, ...data }),
      })
      const order = await response.json()
      if (!response.ok) throw new Error(order.error)
      const Razorpay = window.Razorpay!
      let paid = false
      new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'Opulence Byte',
        description: `Quote: ${name}`,
        prefill: { email: order.email, name: order.name, contact: data.phone },
        theme: { color: '#2d7cf6' },
        handler: async (result: RazorpayResult) => {
          // Razorpay only calls this after a successful payment. Record the request, then always
          // go to the thank-you page, which checks the payment signature again on the server.
          paid = true
          setStatus({ type: 'success', text: 'Payment received. Confirming your order…' })
          await fetch('/api/quote/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(result) })
            .catch((error) => console.error('Quote verification request failed', error))
          const params = new URLSearchParams({ order: result.razorpay_order_id, payment: result.razorpay_payment_id, signature: result.razorpay_signature })
          router.push(`/thank-you?${params}`)
        },
        modal: {
          ondismiss: () => {
            if (paid) return
            setBusy(false)
            setStatus({ type: 'error', text: 'Payment cancelled. Nothing was charged.' })
          },
        },
      }).open()
    } catch (error) {
      setBusy(false)
      setStatus({ type: 'error', text: error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.' })
    }
  }

  return (
    <aside className="card quote-panel" data-reveal="right">
      <span className="eyebrow">Tailored quote</span>
      <h2>Get pricing for {name}</h2>
      <div className="quote-fee"><strong>${QUOTE_FEE_USD}</strong><span>one-time quote fee</span></div>
      <ul>
        <li><Check size={15} /> Pricing tailored to your users and modules</li>
        <li><Check size={15} /> A live demo call with our team</li>
        <li><Check size={15} /> Quotation by email within 24 hours</li>
      </ul>
      {loading ? (
        <div className="btn btn-ghost btn-block" aria-busy="true"><LoaderCircle size={17} className="spin" /></div>
      ) : !user ? (
        <>
          <Link className="btn btn-primary btn-block" href={`/signin?next=${encodeURIComponent(`/products/${slug}`)}`}><LogIn size={17} /> Sign in to get a quote</Link>
          <p className="fineprint">Sign in with Google or GitHub. We only use your email to send your quote.</p>
        </>
      ) : done ? (
        <p className="form-status success" role="status"><CheckCircle2 size={16} style={{ verticalAlign: -3, marginRight: 6 }} />{status.text}</p>
      ) : (
        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          <div className="signed-as"><Avatar user={user} /><span>Quote will be sent to <b>{user.email}</b></span></div>
          <label className="field">Company or organisation<input name="company" required minLength={2} placeholder="AWT Hospital" autoComplete="organization" /></label>
          <label className="field">Phone (optional)<input name="phone" type="tel" placeholder="+91 98765 43210" autoComplete="tel" /></label>
          <label className="field">What do you need? (optional)<textarea name="details" rows={3} maxLength={240} placeholder="Number of users, branches, must-have modules…" /></label>
          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? <><LoaderCircle size={17} className="spin" /> Opening secure checkout</> : <>Pay ${QUOTE_FEE_USD} and request quote <ArrowUpRight size={17} /></>}
          </button>
          <p className="fineprint">Payments are processed securely by Razorpay (cards, UPI, net banking).</p>
        </form>
      )}
      {status && !done && <p className="form-status error" role="status">{status.text}</p>}
    </aside>
  )
}
