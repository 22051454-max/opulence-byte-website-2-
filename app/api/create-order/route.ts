import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { amount } = await request.json()
    if (!Number.isInteger(amount) || amount < 100 || amount > 500000) return NextResponse.json({ error: 'Amount must be between ₹100 and ₹5,00,000.' }, { status: 400 })
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 503 })
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')
    const response = await fetch('https://api.razorpay.com/v1/orders', { method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: amount * 100, currency: 'INR', receipt: `donation_${Date.now()}`, notes: { source: 'opulence-byte-donation' } }) })
    const order = await response.json()
    if (!response.ok) return NextResponse.json({ error: 'Unable to create a payment order.' }, { status: 502 })
    return NextResponse.json({ orderId: order.id, amount: order.amount, keyId: process.env.RAZORPAY_KEY_ID })
  } catch { return NextResponse.json({ error: 'Invalid payment request.' }, { status: 400 }) }
}
