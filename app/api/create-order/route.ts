import { NextResponse } from 'next/server'
import { createOrder, razorpayConfigured, razorpayKeyId } from '@/lib/razorpay'

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    if (!Number.isInteger(amount) || amount < 100 || amount > 500000) return NextResponse.json({ error: 'Amount must be between ₹100 and ₹5,00,000.' }, { status: 400 })
    if (!razorpayConfigured()) return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 })
    const order = await createOrder({ amount: amount * 100, currency: 'INR', receipt: `donation_${Date.now()}`, notes: { source: 'opulence-byte-donation' } }).catch((error) => {
      console.error('[donation] order failed', error)
      return null
    })
    if (!order) return NextResponse.json({ error: 'Unable to create a payment order.' }, { status: 502 })
    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: razorpayKeyId() })
  } catch { return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 }) }
}
