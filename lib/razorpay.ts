import { createHmac, timingSafeEqual } from 'node:crypto'

export function razorpayConfigured() {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

function authHeader() {
  return `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`
}

export async function createOrder(body: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: { Authorization: authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const order = await response.json()
  if (!response.ok) throw new Error(order?.error?.description || 'Unable to create a payment order.')
  return order as { id: string; amount: number; currency: string }
}

export async function fetchOrder(orderId: string) {
  const response = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, { headers: { Authorization: authHeader() } })
  if (!response.ok) throw new Error('Order not found.')
  return (await response.json()) as { id: string; amount: number; currency: string; notes: Record<string, string> }
}

export function verifySignature(orderId: string, paymentId: string, signature: string) {
  if (!process.env.RAZORPAY_KEY_SECRET || typeof signature !== 'string') return false
  const expected = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex')
  return expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
