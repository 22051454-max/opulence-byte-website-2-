'use client'

import { useState } from 'react'

declare global {
  interface Window {
    Razorpay?: any
  }
}

export default function DonateButton() {
  const [loading, setLoading] = useState(false)
  const [amountRupees, setAmountRupees] = useState<number>(10)
  const KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''

  async function loadScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve()
      const script = document.createElement('script')
      script.src = src
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
      document.body.appendChild(script)
    })
  }

  async function handleDonateClick() {
    try {
      setLoading(true)
      // Validate amount (integer rupees)
      const rupees = Math.floor(Number(amountRupees) || 0)
      if (!rupees || rupees <= 0) {
        alert('Please enter a valid amount (whole rupees).')
        setLoading(false)
        return
      }
      const amountPaise = rupees * 100
      if (amountPaise < 100) {
        alert('Minimum amount is ₹1 (100 paise).')
        setLoading(false)
        return
      }

      // 1) create order
      const createRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountPaise }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        alert('Failed to create order: ' + (err?.error || createRes.statusText))
        setLoading(false)
        return
      }
      const { order_id, amount, currency } = await createRes.json()

      // 2) load checkout
      await loadScript('https://checkout.razorpay.com/v1/checkout.js')
      const options = {
        key: KEY,
        amount,
        currency: currency || 'INR',
        name: 'Opulence Byte',
        description: 'Donation',
        order_id,
        theme: { color: '#1e5dbc' },
        handler: async function (response: any) {
          // response contains razorpay_payment_id, razorpay_order_id, razorpay_signature
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })
            if (!verifyRes.ok) {
              const err = await verifyRes.json().catch(() => ({}))
              alert('Payment verification failed: ' + (err?.error || verifyRes.statusText))
              return
            }
            const data = await verifyRes.json()
            if (data.ok) {
              alert('Thank you! Payment successful.')
            } else {
              alert('Verification failed.')
            }
          } catch (e) {
            console.error(e)
            alert('Error verifying payment.')
          }
        },
        modal: {
          ondismiss: function () {
            // user dismissed the payment modal
            console.log('Checkout modal closed by user')
            setLoading(false)
          },
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (resp: any) {
        console.error('payment.failed', resp)
        alert('Payment failed. Please try again.')
      })
      rzp.open()
    } catch (err: any) {
      console.error(err)
      alert('Error initiating payment: ' + (err?.message || err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Amount</label>
        <select
          value={amountRupees}
          onChange={(e) => setAmountRupees(Number(e.target.value))}
          style={{ padding: '8px 10px', borderRadius: 4 }}
          aria-label="Select donation amount"
        >
          <option value={5}>₹5</option>
          <option value={10}>₹10</option>
          <option value={25}>₹25</option>
          <option value={50}>₹50</option>
          <option value={100}>₹100</option>
          <option value={250}>₹250</option>
          <option value={500}>₹500</option>
          <option value={1000}>₹1000</option>
          <option value={0}>Custom</option>
        </select>
        {amountRupees === 0 && (
          <input
            type="number"
            min={1}
            placeholder="₹"
            onChange={(e) => setAmountRupees(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
            style={{ width: 78, padding: '8px 10px', borderRadius: 4 }}
          />
        )}
      </div>

      <button
        className="nav-cta button-primary"
        onClick={handleDonateClick}
        disabled={loading}
        title="Donate now"
      >
        {loading ? 'Processing…' : 'Donate Now'}
      </button>
    </div>
  )
}
