'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react'

type RazorpayResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

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
      let paid = false
      new Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'Opulence Byte',
        description: 'Support digital craft with a point of view.',
        order_id: order.orderId,
        theme: { color: '#2d7cf6' },
        handler: async (response: RazorpayResult) => {
          paid = true
          const verifyResponse = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(response) }).catch(() => null)
          const verification = await verifyResponse?.json().catch(() => ({})) ?? {}
          setStatus(verifyResponse?.ok || !verifyResponse
            ? { type: 'success', text: `Thank you. Your support has been received (payment ${response.razorpay_payment_id}).` }
            : { type: 'error', text: verification.error || 'We could not verify this payment.' })
          setBusy(false)
        },
        modal: { ondismiss: () => { if (paid) return; setBusy(false); setStatus({ type: 'error', text: 'Payment cancelled. No amount was charged.' }) } },
      }).open()
    } catch (error) { setBusy(false); setStatus({ type: 'error', text: error instanceof Error ? error.message : 'Something went wrong. Please try again.' }) }
  }

  return (
    <div className="card donate-card" data-reveal="right">
      <span className="eyebrow">Make a contribution</span>
      <h2>Choose your amount</h2>
      <div className="amount-grid">
        {presets.map((preset) => (
          <button className={selectedAmount === preset && !custom ? 'amount-option amount-option--active' : 'amount-option'} key={preset} onClick={() => { setAmount(preset); setCustom('') }}>₹{preset.toLocaleString('en-IN')}</button>
        ))}
      </div>
      <label className="field">Or enter a custom amount (₹)
        <input inputMode="numeric" value={custom} onChange={(event) => setCustom(event.target.value.replace(/[^0-9]/g, ''))} placeholder="1,000" aria-label="Custom donation amount" />
      </label>
      <div className="donate-total"><span>Total contribution</span><strong>₹{Number.isFinite(selectedAmount) ? selectedAmount.toLocaleString('en-IN') : '0'}</strong></div>
      <button className="btn btn-primary btn-block" onClick={donate} disabled={busy || status?.type === 'success'}>
        {busy ? <><LoaderCircle size={17} className="spin" /> Opening secure checkout</> : status?.type === 'success' ? <><Check size={17} /> Contribution received</> : <>Continue to payment <ArrowUpRight size={17} /></>}
      </button>
      {status && <p className={`form-status ${status.type}`} role="status">{status.text}</p>}
      <p className="fineprint">Payments are processed securely by Razorpay. By continuing, you agree to the payment provider&apos;s terms.</p>
    </div>
  )
}
