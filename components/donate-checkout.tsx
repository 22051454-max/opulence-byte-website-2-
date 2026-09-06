'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'

type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } } }

const presets = [500, 1000, 2500, 5000]

export function DonateCheckout() {
  const [amount, setAmount] = useState(1000)
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const selectedAmount = custom ? Number(custom) : amount

  const loadRazorpay = () => new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const donate = async () => {
    setStatus(null)
    if (!Number.isFinite(selectedAmount) || selectedAmount < 100 || selectedAmount > 500000) {
      setStatus({ type: 'error', text: 'Please choose an amount between ₹100 and ₹5,00,000.' })
      return
    }
    setBusy(true)
    try {
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Checkout could not load. Please try again.')
      const orderResponse = await fetch('/api/create-order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: selectedAmount }) })
      const order = await orderResponse.json()
      if (!orderResponse.ok) throw new Error(order.error || 'Unable to create payment order.')
      const Razorpay = window.Razorpay
      if (!Razorpay) throw new Error('Checkout is unavailable right now.')
      new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'Opulence Byte',
        description: 'Support digital craft with a point of view.',
        order_id: order.orderId,
        theme: { color: '#2d7cf6' },
        handler: async (response: RazorpayResult) => {
          const verifyResponse = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) })
          const verification = await verifyResponse.json()
          setStatus(verifyResponse.ok ? { type: 'success', text: 'Thank you. Your support has been received.' } : { type: 'error', text: verification.error || 'We could not verify this payment.' })
          setBusy(false)
        },
        modal: { ondismiss: () => { setBusy(false); setStatus({ type: 'error', text: 'Payment cancelled. No amount was charged.' }) } },
      }).open()
    } catch (error) { setBusy(false); setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Something went wrong. Please try again.' }) }
  }

  return <div className="donate-card"><div className="donate-card-top"><div><p className="eyebrow">MAKE A CONTRIBUTION</p><h2>Choose your<br /><span>signal.</span></h2></div><span className="donate-card-code">INR / SECURE</span></div><div className="amount-grid">{presets.map((preset) => <button className={selectedAmount === preset && !custom ? 'amount-option amount-option--active' : 'amount-option'} key={preset} onClick={() => { setAmount(preset); setCustom('') }}>₹{preset.toLocaleString('en-IN')}</button>)}</div><label className="custom-amount"><span>Or enter a custom amount</span><span className="rupee-input"><b>₹</b><input inputMode="numeric" value={custom} onChange={(event) => setCustom(event.target.value.replace(/[^0-9]/g, ''))} placeholder="1,000" aria-label="Custom donation amount" /></span></label><div className="donate-total"><span>Total contribution</span><strong>₹{Number.isFinite(selectedAmount) ? selectedAmount.toLocaleString('en-IN') : '0'}</strong></div><button className="donate-submit" onClick={donate} disabled={busy || status?.type === 'success'}>{busy ? <><LoaderCircle size={17} className="spin" /> Opening secure checkout</> : status?.type === 'success' ? <><Check size={17} /> Contribution received</> : <>Continue to payment <ArrowUpRight size={17} /></>}</button>{status && <p className={`donate-status donate-status--${status.type}`} role="status">{status.text}</p>}<p className="donate-fineprint">Payments are processed securely by Razorpay. By continuing, you agree to the payment provider&apos;s terms.</p></div>
}
